import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ai_service.services.live_price_service import price_manager

router = APIRouter()


@router.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    """
    WebSocket endpoint for real-time price streaming.
    
    Client sends JSON messages to subscribe:
        { "action": "subscribe", "symbols": ["RELIANCE.NS", "TCS.NS"] }
    
    Server streams back price updates:
        { "type": "price_update", "symbol": "RELIANCE.NS", "price": 2950.5, ... }
    """
    await price_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                action = message.get("action")

                if action == "subscribe":
                    symbols = message.get("symbols", [])
                    if symbols:
                        await price_manager.subscribe(websocket, symbols)
                        await websocket.send_text(json.dumps({
                            "type": "subscribed",
                            "symbols": symbols
                        }))
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON"
                }))
    except WebSocketDisconnect:
        price_manager.disconnect(websocket)
    except Exception:
        price_manager.disconnect(websocket)
