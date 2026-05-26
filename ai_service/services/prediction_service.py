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
    stoch_k:float
    stoch_d:float
    atr:float
    volume_ratio:float

def calculate_rsi(prices:list[float],period:int=14):
    if len(prices) < period + 1:
        return 50.0
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
    if not prices:
        return 0.0
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
    if len(prices) < period:
        avg = round(sum(prices)/len(prices),2) if prices else 0
        return avg, avg, avg
    recent = prices[-period:]
    mid = round(sum(recent) / period,2)
    variance = sum((p-mid)**2 for p in recent) / period
    std = variance ** 0.5
    return round(mid + 2 * std, 2), mid, round(mid-2 * std, 2)

def calculate_atr(prices:list[float],period:int=14):
    if len(prices) < 2:
        return 0.0
    trs = [abs(prices[i] - prices[i-1]) for i in range(1, len(prices))]
    return round(sum(trs[-period:]) / period, 2)

def calculate_stochastic(prices:list[float],period:int=14):
    if len(prices) < period:
        return 50.0, 50.0
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
    stoch_k,stoch_d = calculate_stochastic(p)
    avg_vol = sum(v) / len(v) if len(v) > 0 else 1
    
    return IndicatorResult(
        rsi = calculate_rsi(p),
        macd = macd, macd_signal=signal,macd_hist=hist,
        ema_50=calculate_ema(p,min(50,len(p))),
        ema_200=calculate_ema(p,min(200,len(p))),
        bb_upper=bb_u,bb_mid=bb_m,bb_lower=bb_l,
        stoch_k=stoch_k,stoch_d=stoch_d,
        atr = calculate_atr(p),
        volume_ratio=round(v[-1] / avg_vol, 2) if avg_vol!=0 and len(v)>0 else 0
    )
# from pathlib import Path
# import zipfile, os, textwrap

# base = Path('/mnt/data/groq_patch')
# (base/'ai_service/services').mkdir(parents=True, exist_ok=True)
# (base/'ai_service/routes').mkdir(parents=True, exist_ok=True)

# prediction_service = '''from pydantic import BaseModel

# class PredictionInput(BaseModel):
#     symbol:str
#     current_price:float
#     prices_30d: list[float]
#     volumes_30d: list[int]

# class IndicatorResult(BaseModel):
#     rsi:float
#     macd:float
#     macd_signal:float
#     macd_hist:float
#     ema_50:float
#     ema_200:float
#     bb_upper:float
#     bb_mid:float
#     bb_lower:float
#     stoch_k:float
#     stoch_d:float
#     atr:float
#     volume_ratio:float

# def calculate_rsi(prices:list[float],period:int=14):
#     if len(prices) < period + 1:
#         return 50.0
#     deltas = [prices[i]-prices[i-1] for i in range(1,len(prices))]
#     gains = [d if d > 0 else 0 for d in deltas[-period:]]
#     losses = [-d if d < 0 else 0 for d in deltas[-period:]]
#     avg_gain = sum(gains) / period
#     avg_loss = sum(losses) / period

#     if avg_loss==0:
#         return 100.0
#     rs = avg_gain / avg_loss
#     return round(100 - (100/(1+rs)),2)

# def calculate_ema(prices:list[float],period:int):
#     if not prices:
#         return 0.0
#     k = 2 / (period + 1)
#     ema = prices[0]
#     for price in prices[1:]:
#         ema = price * k + ema * (1 - k)
#     return round(ema,2)

# def calculate_macd(prices:list[float]):
#     ema12 = calculate_ema(prices,12)
#     ema26 = calculate_ema(prices,26)
#     macd = round(ema12 - ema26,2)

#     signal = round(macd * 0.2, 2)
#     return macd, signal, round(macd - signal,2)

# def calculate_bollinger(prices:list[float],period:int=20):
#     if len(prices) < period:
#         avg = round(sum(prices)/len(prices),2) if prices else 0
#         return avg, avg, avg
#     recent = prices[-period:]
#     mid = round(sum(recent) / period,2)
#     variance = sum((p-mid)**2 for p in recent) / period
#     std = variance ** 0.5
#     return round(mid + 2 * std, 2), mid, round(mid-2 * std, 2)

# def calculate_atr(prices:list[float],period:int=14):
#     if len(prices) < 2:
#         return 0.0
#     trs = [abs(prices[i] - prices[i-1]) for i in range(1, len(prices))]
#     return round(sum(trs[-period:]) / period, 2)

# def calculate_stochastic(prices:list[float],period:int=14):
#     if len(prices) < period:
#         return 50.0, 50.0
#     recent = prices[-period:]
#     low,high = min(recent),max(recent)

#     k = round(((prices[-1] - low) / (high - low)) * 100, 2) if high != low else 50
#     d = round(k * 0.85, 2)
#     return k,d

# def compute_indicators(data:PredictionInput)->IndicatorResult:
#     p = data.prices_30d
#     v = data.volumes_30d
#     macd,signal,hist = calculate_macd(p)
#     bb_u,bb_m,bb_l = calculate_bollinger(p)
#     stoch_k,stoch_d = calculate_stochastic(p)
#     avg_vol = sum(v) / len(v) if len(v) > 0 else 1

#     return IndicatorResult(
#         rsi = calculate_rsi(p),
#         macd = macd, macd_signal=signal,macd_hist=hist,
#         ema_50=calculate_ema(p,min(50,len(p))),
#         ema_200=calculate_ema(p,min(200,len(p))),
#         bb_upper=bb_u,bb_mid=bb_m,bb_lower=bb_l,
#         stoch_k=stoch_k,stoch_d=stoch_d,
#         atr = calculate_atr(p),
#         volume_ratio=round(v[-1] / avg_vol, 2) if avg_vol!=0 and len(v)>0 else 0
#     )
# '''
# prediction_route = '''from fastapi import APIRouter
# from fastapi.responses import StreamingResponse
# from ai_service.services.prediction_service import PredictionInput, compute_indicators
# from groq import AsyncGroq
# import json, os

# router = APIRouter(prefix="/predict", tags=["prediction"])

# groq_client = AsyncGroq(
#     api_key=os.getenv("GROQ_API_KEY")
# )

# PREDICTION_PROMPT = """
# You are a financial analyst AI. Analyze the following stock data and return ONLY valid JSON.

# Stock: {symbol}
# Current Price: {price}

# Indicators:
# - RSI(14): {rsi} — {rsi_signal}
# - MACD: {macd} | Signal: {macd_signal} | Histogram: {macd_hist}
# - EMA50: {ema50} | EMA200: {ema200} — {ema_cross}
# - Bollinger Bands: Upper {bb_u} | Mid {bb_m} | Lower {bb_l}
# - Stochastic %K: {stoch_k} | %D: {stoch_d}
# - ATR(14): {atr}
# - Volume ratio vs avg: {vol_ratio}x

# Return ONLY this JSON:
# {
#   "predicted_price_7d": number,
#   "predicted_price_14d": number,
#   "predicted_price_1m": number,
#   "predicted_price_3m": number,
#   "range_low_7d": number,
#   "range_high_7d": number,
#   "confidence": number,
#   "trend": "Bullish" | "Bearish" | "Neutral",
#   "summary": "2-3 sentence analysis",
#   "signal_strength": "Strong" | "Moderate" | "Weak"
# }
# """

# @router.post("/")
# async def predict(data: PredictionInput):
#     indicators = compute_indicators(data)
#     ind = indicators.model_dump()

#     rsi_signal = (
#         "Overbought" if ind["rsi"] > 70
#         else "Oversold" if ind["rsi"] < 30
#         else "Neutral"
#     )

#     ema_cross = (
#         "Golden cross"
#         if ind["ema_50"] > ind["ema_200"]
#         else "Death cross"
#     )

#     prompt = PREDICTION_PROMPT.format(
#         symbol=data.symbol,
#         price=data.current_price,
#         rsi=ind["rsi"],
#         rsi_signal=rsi_signal,
#         macd=ind["macd"],
#         macd_signal=ind["macd_signal"],
#         macd_hist=ind["macd_hist"],
#         ema50=ind["ema_50"],
#         ema200=ind["ema_200"],
#         ema_cross=ema_cross,
#         bb_u=ind["bb_upper"],
#         bb_m=ind["bb_mid"],
#         bb_l=ind["bb_lower"],
#         stoch_k=ind["stoch_k"],
#         stoch_d=ind["stoch_d"],
#         atr=ind["atr"],
#         vol_ratio=ind["volume_ratio"]
#     )

#     try:
#         response = await groq_client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[
#                 {
#                     "role": "system",
#                     "content": "You are an expert stock prediction analyst that always returns valid JSON."
#                 },
#                 {
#                     "role": "user",
#                     "content": prompt
#                 }
#             ],
#             temperature=0.3,
#             max_tokens=700,
#             response_format={"type":"json_object"}
#         )

#         content = response.choices[0].message.content
#         prediction = json.loads(content)

#     except Exception as e:
#         print(f"Groq prediction failed: {e}")

#         prediction = {
#             "predicted_price_7d": round(data.current_price * 1.02, 2),
#             "predicted_price_14d": round(data.current_price * 1.03, 2),
#             "predicted_price_1m": round(data.current_price * 1.05, 2),
#             "predicted_price_3m": round(data.current_price * 1.10, 2),
#             "range_low_7d": round(data.current_price * 0.98, 2),
#             "range_high_7d": round(data.current_price * 1.05, 2),
#             "confidence": 70,
#             "trend": "Neutral",
#             "summary": "Fallback prediction used because Groq API request failed.",
#             "signal_strength": "Moderate"
#         }

#     return {
#         "symbol": data.symbol,
#         "current_price": data.current_price,
#         "indicators": ind,
#         "prediction": prediction
#     }

# @router.post("/stream")
# async def predict_stream(data: PredictionInput):
#     indicators = compute_indicators(data)

#     async def gen():
#         response = await groq_client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[
#                 {
#                     "role":"user",
#                     "content": f"Analyze {data.symbol} using indicators: {indicators}"
#                 }
#             ],
#             stream=True
#         )

#         async for chunk in response:
#             delta = chunk.choices[0].delta.content or ""
#             if delta:
#                 yield f"data: {delta}\\n\\n"

#     return StreamingResponse(gen(), media_type="text/event-stream")
# '''
# (base/'ai_service/services/prediction_service.py').write_text(prediction_service)
# (base/'ai_service/routes/prediction.py').write_text(prediction_route)

# zip_path='/mnt/data/groq_prediction_patch.zip'
# with zipfile.ZipFile(zip_path,'w') as z:
#     z.write(base/'ai_service/services/prediction_service.py', arcname='ai_service/services/prediction_service.py')
#     z.write(base/'ai_service/routes/prediction.py', arcname='ai_service/routes/prediction.py')

# zip_path
