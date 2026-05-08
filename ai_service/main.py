from fastapi import FastAPI
from ai_service.routes.stock_routes import router
from ai_service.routes.ws_routes import router as ws_router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.include_router(router,prefix='/api')
app.include_router(ws_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)