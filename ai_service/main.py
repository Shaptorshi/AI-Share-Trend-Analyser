from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_service.routes.stock_routes import router
from ai_service.routes.ws_routes import router as ws_router
from ai_service.routes.prediction import router as prediction_router


app = FastAPI()
# RESTAPI Routes
app.include_router(router,prefix='/api')
app.include_router(prediction_router,prefix='/api')

# WebSocket Routes
app.include_router(ws_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:8000"],
    # allow_origins=["https://tradeedge-zeta.vercel.app", "https://ai-share-trend-analyser-1.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)