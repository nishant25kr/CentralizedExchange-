interface Fill {
    buyer: string;
    seller: string;
    price: number;
    qty: number;
}

export class OrderBook {
    private symbol: string;
    private orderbook: {
        bids: Map<string, { orders: { userId: string; qty: number; filledQty: number; orderId: number }[] }>;
        ask: Map<string, { orders: { userId: string; qty: number; filledQty: number; orderId: number }[] }>;
    };

    constructor(symbol: string) {
        this.symbol = symbol;
        this.orderbook = {
            bids: new Map(),
            ask: new Map(),
        };
    }

    addOrder(userId: string, type: "bids" | "ask", price: number, qty: number): Fill[] {
        const fills: Fill[] = [];
        let remainingQty = qty;

        const isBid = type === "bids";
        const oppositeBook = isBid ? this.orderbook.ask : this.orderbook.bids;
        const priceSort = isBid
            ? [...oppositeBook.keys()].sort((a, b) => Number(a) - Number(b))
            : [...oppositeBook.keys()].sort((a, b) => Number(b) - Number(a));

        for (const priceKey of priceSort) {
            const bucketPrice = Number(priceKey);
            const meetsPrice = isBid ? price >= bucketPrice : price <= bucketPrice;

            if (!meetsPrice) {
                continue;
            }

            const bucket = oppositeBook.get(priceKey);
            if (!bucket || bucket.orders.length === 0) {
                continue;
            }

            for (let i = 0; i < bucket.orders.length && remainingQty > 0; i++) {
                const restingOrder = bucket.orders[i];
                const available = restingOrder.qty! - restingOrder.filledQty;

                if (available <= 0) {
                    bucket.orders.splice(i, 1);
                    i--;
                    continue;
                }

                const tradeQty = Math.min(remainingQty, available);
                fills.push({
                    buyer: isBid ? userId : restingOrder.userId,
                    seller: isBid ? restingOrder.userId : userId,
                    price: bucketPrice,
                    qty: tradeQty,
                });

                restingOrder.filledQty += tradeQty;
                remainingQty -= tradeQty;

                if (restingOrder.filledQty >= restingOrder.qty) {
                    bucket.orders.splice(i, 1);
                    i--;
                }
            }

            if (remainingQty === 0) {
                break;
            }
        }

        if (remainingQty > 0) {
            const bookSide = isBid ? this.orderbook.bids : this.orderbook.ask;
            const orderBucket = bookSide.get(price.toString()) ?? { orders: [] };

            orderBucket.orders.push({
                userId,
                qty: remainingQty,
                filledQty: 0,
                orderId: Date.now() + Math.random(),
            });

            bookSide.set(price.toString(), orderBucket);
        }

        return fills;
    }
}