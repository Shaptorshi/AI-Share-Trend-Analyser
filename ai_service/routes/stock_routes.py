from fastapi import APIRouter, Query
# from typing import List
from ai_service.services.stock_services import get_stock_info, get_stock_history, get_batch_stock_info, search_stocks

router = APIRouter()

@router.get("/stocks/search")
def stock_search(q: str = Query(..., description="Search query for stock lookup")):
    return search_stocks(q)

@router.get("/stocks/batch")
def batch_stock_info(symbols: str = Query(..., description="Comma-separated list of symbols")):
    symbol_list = [s.strip() for s in symbols.split(",")]
    return get_batch_stock_info(symbol_list)

@router.get("/stock/{symbol}")
def stock_info(symbol:str):
    return get_stock_info(symbol)

@router.get("/stocks/{symbol}/history")
def stock_history(symbol:str):
    return get_stock_history(symbol)