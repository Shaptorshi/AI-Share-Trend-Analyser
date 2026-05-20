import yfinance as yf
from concurrent.futures import ThreadPoolExecutor
import math

executor = ThreadPoolExecutor(max_workers=10)


def fetch_single_stock(symbol: str):
    try:
        stock = yf.Ticker(symbol)

        # Default values
        fast_data = {}
        info_data = {}
        prices_30d = []
        volumes_30d = []

        # FAST INFO (quick fetch)
        try:
            fast = stock.fast_info
            fast_data = {
                "price": float(fast.get("lastPrice")) if fast.get("lastPrice") is not None else None,
                "market_cap": float(fast.get("marketCap")) if fast.get("marketCap") is not None else None,
                "high": float(fast.get("yearHigh")) if fast.get("yearHigh") is not None else None,
                "low": float(fast.get("yearLow")) if fast.get("yearLow") is not None else None,
                "previous_close": float(fast.get("previousClose")) if fast.get("previousClose") is not None else None,
            }
        except Exception as e:
            print(f"Fast info error for {symbol}: {e}")

        # INFO (slower fetch for company name / PE ratio)
        try:
            info = stock.info
            info_data = {
                "name": info.get("longName") or info.get("shortName"),
                "pe_ratio": float(info.get("trailingPE"))
                if info.get("trailingPE") is not None
                else None,
            }
        except Exception as e:
            print(f"Info fetch error for {symbol}: {e}")

        # 30D HISTORY
        try:
            hist = stock.history(period="1mo", interval="1d")

            if not hist.empty:
                prices_30d = [
                    float(close)
                    for close in hist["Close"].tolist()
                    if close is not None and not math.isnan(float(close))
                ]

                volumes_30d = [
                    int(vol)
                    for vol in hist["Volume"].tolist()
                    if vol is not None and not math.isnan(float(vol))
                ]

        except Exception as e:
            print(f"History fetch error for {symbol}: {e}")

        return {
            "symbol": symbol.upper(),
            "name": info_data.get("name") or symbol.upper(),
            "price": fast_data.get("price"),
            "market_cap": fast_data.get("market_cap"),
            "pe_ratio": info_data.get("pe_ratio"),
            "high": fast_data.get("high"),
            "low": fast_data.get("low"),
            "previous_close": fast_data.get("previous_close"),
            "prices_30d": prices_30d,
            "volumes_30d": volumes_30d,
        }

    except Exception as e:
        return {
            "symbol": symbol.upper(),
            "error": str(e),
            "name": None,
            "price": None,
            "market_cap": None,
            "pe_ratio": None,
            "high": None,
            "low": None,
            "previous_close": None,
            "prices_30d": [],
            "volumes_30d": [],
        }


def get_stock_info(symbol: str):
    return fetch_single_stock(symbol)


def get_batch_stock_info(symbols: list[str]):
    try:
        with ThreadPoolExecutor(max_workers=min(len(symbols), 15)) as pool:
            results = list(pool.map(fetch_single_stock, symbols))
        return results

    except Exception as e:
        print(f"Batch fetch error: {e}")
        return [
            {
                "symbol": s.upper(),
                "error": str(e),
                "prices_30d": [],
                "volumes_30d": [],
            }
            for s in symbols
        ]


def get_stock_history(symbol: str, period="1mo", interval="1d"):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period, interval=interval)

        if hist.empty:
            return []
            
        hist = hist.dropna()

        data = []

        for index, row in hist.iterrows():
            data.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]),
            })

        return data

    except Exception as e:
        print(f"History fetch error for {symbol}: {e}")
        return []


def search_stocks(query: str, max_results: int = 8):
    try:
        search = yf.Search(query, news_count=0)

        results = []

        for quote in search.quotes[:max_results]:
            results.append({
                "symbol": quote.get("symbol", ""),
                "name": quote.get("longname") or quote.get("shortname", ""),
                "exchange": quote.get("exchDisp", ""),
                "type": quote.get("typeDisp", ""),
                "sector": quote.get("sectorDisp", ""),
                "industry": quote.get("industryDisp", ""),
            })

        return results

    except Exception as e:
        print(f"Search error: {e}")
        return []