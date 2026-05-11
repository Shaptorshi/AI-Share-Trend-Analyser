from ollama import Client
from pydantic import BaseModel

class PredictionInput(BaseModel):
    symbol:str
    current_price:float
    prices_30d: list[float]
    volumes_30d: list[int]

class IndicatorResult(BaseModel):
    rsi:float
    macd:float
    macd_signal:float
    macd_hist:float
    ema_50:float
    ema_200:float
    bb_upper:float
    bb_mid:float
    bb_lower:float
    stock_k:float
    stock_d:float
    atr:float
    volume_ratio:float

def calculate_rsi(prices:list[float],period:int=14):
    deltas = [prices[i]-prices[i-1] for i in range(1,len(prices))]
    gains = [d if d > 0 else 0 for d in deltas[-period:]]
    losses = [-d if d < 0 else 0 for d in deltas[-period:]]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    
    if avg_loss==0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100 - (100/(1+rs)),2)

def calculate_ema(prices:list[float],period:int):
    k = 2 / (period + 1)
    ema = prices[0]
    for price in prices[1:]:
        ema = price * k + ema * (1 - k)
    return round(ema,2)

def calculate_macd(prices:list[float]):
    ema12 = calculate_ema(prices,12)   
    ema26 = calculate_ema(prices,26)   
    macd = round(ema12 - ema26,2)
    
    signal = round(macd * 0.2, 2)
    return macd, signal, round(macd - signal,2)

def calculate_bollinger(prices:list[float],period:int=20):
    recent = prices[-period:]
    mid = round(sum(recent) / period,2)
    variance = sum((p-mid)**2 for p in recent) / period
    std = variance ** 0.5
    return round(mid + 2 * std, 2), mid, round(mid-2 * std, 2)

def calculate_atr(prices:list[float],period:int):
    trs = [abs(prices[i] - prices[i-1]) for i in range(1, len(prices))]
    return round(sum(trs[-period:]) / period, 2)

def calculate_stochastic(prices:list[float],period:int):
    recent = prices[-period:]
    low,high = min(recent),max(recent)
    
    k = round(((prices[-1] - low) / (high - low)) * 100, 2) if high != low else 50
    d = round(k * 0.85, 2)
    return k,d

def compute_indicators(data:PredictionInput)->IndicatorResult:
    p = data.prices_30d
    v = data.volumes_30d
    macd,signal,hist = calculate_macd(p)
    bb_u,bb_m,bb_l = calculate_bollinger(p)
    stock_k,stock_d = calculate_stochastic(p)
    avg_vol = sum(v) / len(v)
    
    return IndicatorResult(
        rsi = calculate_rsi(p),
        macd = macd, macd_signal=signal,macd_hist=hist,
        ema_50=calculate_ema(p,min(50,len(p))),
        ema_200=calculate_ema(p,min(200,len(p))),
        bb_upper=bb_u,bb_mid=bb_m,bb_lower=bb_l,
        stock_k=stock_k,stock_d=stock_d,
        atr = calculate_atr(p),
        volume_ratio=round(v[-1] / avg_vol, 2)
    )