import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
import yfinance as yf


class LivePriceManager:
    """Manages WebSocket connections and streams real-time prices from Yahoo Finance."""

    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.subscriptions: Dict[str, Set[WebSocket]] = {}  # symbol -> set of clients
        self._yf_ws = None
        self._listen_task = None
        self._running = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        # Remove from all subscriptions
        for symbol in list(self.subscriptions.keys()):
            self.subscriptions[symbol].discard(websocket)
            if not self.subscriptions[symbol]:
                del self.subscriptions[symbol]

        # If no more clients, stop the Yahoo WS
        if not self.active_connections and self._running:
            asyncio.create_task(self._stop_yf_ws())

    async def subscribe(self, websocket: WebSocket, symbols: list[str]):
        """Subscribe a client to real-time updates for given symbols."""
        for symbol in symbols:
            sym = symbol.upper()
            if sym not in self.subscriptions:
                self.subscriptions[sym] = set()
            self.subscriptions[sym].add(websocket)

        # Ensure Yahoo WS is running and subscribed
        await self._ensure_yf_ws(symbols)

    async def _ensure_yf_ws(self, symbols: list[str]):
        """Start or update the Yahoo Finance WebSocket connection."""
        if self._yf_ws is None:
            self._yf_ws = yf.AsyncWebSocket(verbose=False)
            await self._yf_ws.__aenter__()
            self._running = True
            self._listen_task = asyncio.create_task(self._listen_loop())

        await self._yf_ws.subscribe(symbols)

    async def _listen_loop(self):
        """Listen to Yahoo Finance WebSocket and forward to subscribed clients."""
        try:
            async def message_handler(msg: dict):
                symbol = msg.get("id", "")
                price = msg.get("price", None)
                timestamp = msg.get("timestamp", None)
                change = msg.get("change", None)
                change_percent = msg.get("changePercent", None)
                volume = msg.get("dayVolume", None)
                market_hours = msg.get("marketHours", None)

                payload = json.dumps({
                    "type": "price_update",
                    "symbol": symbol,
                    "price": price,
                    "change": change,
                    "changePercent": change_percent,
                    "volume": volume,
                    "marketHours": market_hours,
                    "timestamp": timestamp,
                })

                # Send to all clients subscribed to this symbol
                subscribers = self.subscriptions.get(symbol, set())
                disconnected = []
                for ws in subscribers:
                    try:
                        await ws.send_text(payload)
                    except Exception:
                        disconnected.append(ws)

                for ws in disconnected:
                    self.disconnect(ws)

            await self._yf_ws.listen(message_handler=message_handler)
        except Exception as e:
            print(f"[LivePriceManager] Yahoo WS listen error: {e}")
            self._running = False

    async def _stop_yf_ws(self):
        """Close the Yahoo Finance WebSocket."""
        if self._yf_ws:
            try:
                await self._yf_ws.close()
            except Exception:
                pass
            self._yf_ws = None
            self._running = False

        if self._listen_task:
            self._listen_task.cancel()
            self._listen_task = None


# Singleton manager
price_manager = LivePriceManager()
