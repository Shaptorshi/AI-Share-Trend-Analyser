from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ai_service.services.prediction_service import PredictionInput,compute_indicators
from groq import AsyncGroq
import json
import os

router = APIRouter(prefix="/predict",tags=["prediction"])

groq_client = AsyncGroq(
    api_key=os.getenv("GROQ_API_KEY", "missing_key")
)

PREDICTION_PROMPT = """
You are a financial analyst AI. Analyze the following stock data and return a JSON prediction.

Stock: {symbol}
Current Price: {price}
Indicators:
- RSI(14): {rsi} — {rsi_signal}
- MACD: {macd} | Signal: {macd_signal} | Histogram: {macd_hist}
- EMA50: {ema50} | EMA200: {ema200} — {ema_cross}
- Bollinger Bands: Upper {bb_u} | Mid {bb_m} | Lower {bb_l}
- Stochastic %K: {stoch_k} | %D: {stoch_d}
- ATR(14): {atr}
- Volume ratio vs avg: {vol_ratio}x

Return ONLY valid JSON with this exact structure:
{{
  "predicted_price_7d": number,
  "predicted_price_14d": number,
  "predicted_price_1m": number,
  "predicted_price_3m": number,
  "range_low_7d": number,
  "range_high_7d": number,
  "confidence": number,
  "trend": "Bullish" | "Bearish" | "Neutral",
  "summary": "2-3 sentence analysis",
  "signal_strength": "Strong" | "Moderate" | "Weak"
}}
"""

@router.post("/")
async def predict(data:PredictionInput):
    indicators = compute_indicators(data)
    ind = indicators.model_dump()
    
    rsi_signal = (
        "Overbought" if ind["rsi"] > 70 
        else "Oversold" if ind["rsi"] < 30
        else "Neutral"
    )
    
    ema_cross = 'Golden cross' if ind["ema_50"] > ind["ema_200"] else 'Death cross'
    
    prompt = PREDICTION_PROMPT.format(
        symbol = data.symbol,price=data.current_price,
        rsi = ind["rsi"], rsi_signal = rsi_signal,
        macd = ind["macd"],macd_signal=ind["macd_signal"],
        macd_hist=ind["macd_hist"],ema50=ind["ema_50"],
        ema200=ind["ema_200"], ema_cross=ema_cross, bb_u=ind["bb_upper"],
        bb_m=ind["bb_mid"],bb_l=ind["bb_lower"],
        stoch_k=ind["stoch_k"],stoch_d=ind["stoch_d"],
        atr=ind["atr"],vol_ratio=ind["volume_ratio"]
    )
    
    try:
        response = await groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a financial analyst AI. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=700,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        prediction = json.loads(content)
        print(f"Groq prediction: {prediction}")
    except Exception as e:
        error_msg = str(e)
        print(f"Groq connection failed: {error_msg}. Using fallback mock prediction.")
        prediction = {
            "predicted_price_7d": round(data.current_price * 1.02, 2),
            "predicted_price_14d": round(data.current_price * 1.03, 2),
            "predicted_price_1m": round(data.current_price * 1.05, 2),
            "predicted_price_3m": round(data.current_price * 1.10, 2),
            "range_low_7d": round(data.current_price * 0.98, 2),
            "range_high_7d": round(data.current_price * 1.05, 2),
            "confidence": 75,
            "trend": "Neutral",
            "summary": f"Fallback mock prediction. Groq API failed with error: {error_msg}",
            "signal_strength": "Moderate"
        }
        
    return {
        "symbol":data.symbol,
        "current_price":data.current_price,
        "indicators":ind,
        "prediction":prediction
    }
    
@router.post("/stream")
async def predict_stream(data:PredictionInput):
    indicators = compute_indicators(data)
    prompt = f"Analyze {data.symbol} at {data.current_price} with indicators: {indicators}"
    
    async def gen():
        try:
            stream = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a financial analyst AI."},
                    {"role": "user", "content": prompt}
                ],
                stream=True
            )
            
            async for chunk in stream:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield f"data: {delta}\n\n"
        except Exception as e:
            yield f"data: Error connecting to Groq API: {str(e)}\n\n"
        
    return StreamingResponse(gen(), media_type="text/event-stream")