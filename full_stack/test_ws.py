import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/prices"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket server.")
            
            # Send subscription message
            sub_msg = {
                "action": "subscribe",
                "symbols": ["RELIANCE.NS"]
            }
            await websocket.send(json.dumps(sub_msg))
            print("Sent subscription message:", sub_msg)
            
            # Listen for responses
            while True:
                try:
                    response = await websocket.recv()
                    print(f"Received: {response}")
                except websockets.ConnectionClosed as e:
                    print(f"WebSocket closed with code {e.code}, reason: {e.reason}")
                    break
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test_ws())
