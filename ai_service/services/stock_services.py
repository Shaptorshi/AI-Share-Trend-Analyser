import yfinance as yf

def get_stock_info(symbol:str):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        fast = stock.fast_info
        
        return {
            "symbol":symbol.upper(),
            "name":info.get("longName"),
            "price":fast.get("lastPrice"),
            "market_cap":info.get("marketCap"),
            "pe_ratio":info.get("trailingPE"),
            "high":info.get("fiftyTwoWeekHigh"),
            "low":info.get("fiftyTwoWeekLow"),
            "previous_close":fast.get("previousClose"),
        }
    except Exception:
        return{
            "error":"Invalid symbol or data unavailable"
        }

def get_batch_stock_info(symbols: list[str]):
    try:
        tickers = yf.Tickers(" ".join(symbols))
        result = []
        for symbol in symbols:
            try:
                stock = tickers.tickers[symbol.upper()]
                info = stock.info
                fast = stock.fast_info
                result.append({
                    "symbol": symbol.upper(),
                    "name": info.get("longName"),
                    "price": fast.get("lastPrice"),
                    "market_cap": info.get("marketCap"),
                    "pe_ratio": info.get("trailingPE"),
                    "high": info.get("fiftyTwoWeekHigh"),
                    "low": info.get("fiftyTwoWeekLow"),
                    "previous_close": fast.get("previousClose"),
                })
            except Exception:
                result.append({
                    "symbol": symbol.upper(),
                    "error": "Invalid symbol or data unavailable"
                })
        return result
    except Exception as e:
        return {"error": str(e)}

def get_stock_history(symbol:str,period="1mo",interval="1d"):
    stock = yf.Ticker(symbol)
    hist = stock.history(period=period,interval=interval)
    
    data = []
    for index,row in hist.iterrows():
        data.append({
            "date":str(index),
            "open":row["Open"],
            "high":row["High"],
            "low":row["Low"],
            "close":row["Close"],
            "volume":row["Volume"],
        })
    
    return data