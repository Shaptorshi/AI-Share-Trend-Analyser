export const getStock = async (symbol: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stock/${symbol}`)

    if (!res.ok) throw new Error(`Failed to fetch the stocks`)

    return res.json();
}

export const getHistory = async (symbol: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/stocks/${symbol}/history`)

    if(!res.ok) throw new Error(`Failed to fetch the stock history`)

    return res.json()
}
