from fastapi import FastAPI
from ai_service.routes.stock_routes import router
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.include_router(router,prefix='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)