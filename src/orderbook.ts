interface Fill {
    type: "fill",
    buyer: string,
    seller: string,
    price: number,
    qty: number
}

interface OrderBookUpdate {
    type: "orderbook_update",
    userId: string,
    price: number,
    qty: number
}

export class OrderBook {
    private symbol: string;
    private orderbook: {
        bids: Map<string, {
            orders: { userId: string, qty: number, filledQty: number, orderId: number }[],
        }>,
        ask: Map<string, {
            orders: { userId: string, qty: number, filledQty: number, orderId: number }[],
        }>
    }
    constructor(symbol: string) {
        this.symbol = symbol;
        this.orderbook = {
            bids: new Map(),
            ask: new Map()
        }

    }

    addOrder(userId: string, type: "bids" | "ask", price: number, qty: number): (Fill | OrderBookUpdate)[] {

        let fills: (Fill | OrderBookUpdate)[] = [];
        if (type == 'bids') {
            const askPrices = [...this.orderbook.ask.keys()].sort((a: string, b: string) => Number(a) - Number(b));

            let originalUserLeftQty = qty;
            for (let i = 0; i < askPrices.length; i++) {
                const bucketPrice = Number(askPrices[i])
                if (price >= bucketPrice) {
                    let individualOrders = this.orderbook.ask.get(bucketPrice.toString())!;
                    for (let j = 0; j < individualOrders.orders.length; j++) {
                        let sellerOrder = individualOrders.orders[j]!;
                        let leftQty = sellerOrder.qty - sellerOrder.filledQty;
                        if (leftQty >= sellerOrder.qty) {
                            individualOrders.orders[j].filledQty += originalUserLeftQty;
                            fills.push({
                                type: 'fill',
                                buyer: userId,
                                seller: individualOrders.orders[j]?.userId!,
                                price: bucketPrice,
                                qty: originalUserLeftQty
                            })
                            originalUserLeftQty = 0;
                            break;
                        } else {
                            fills.push({
                                type: 'fill',
                                buyer: userId,
                                seller: individualOrders.orders[j]?.userId!,
                                qty: leftQty,
                                price: bucketPrice
                            })
                            originalUserLeftQty -= leftQty;
                            individualOrders.orders = individualOrders.orders.filter(x => x.orderId == individualOrders?.orders[j]?.orderId)
                        }
                    }
                    if (originalUserLeftQty == 0) {
                        break;
                    } else {
                        break;
                    }
                }
                if (originalUserLeftQty) {
                if (!this.orderbook.bids.get(price.toString())) {
                    this.orderbook.bids.get(price.toString()) = {
                        orders: []
                    }
                }

                this.orderbook.bids.get(price.toString())?.orders.push({
                    orderId: Math.random(),
                    userId,
                    qty,
                    filledQty: qty - originalUserLeftQty
                })

                fills.push({
                    type: "orderbook_update",
                    userId,
                    price: price,
                    qty: originalUserLeftQty
                })
            }
            }
        }

        if (type == 'ask') {
            const bidPrices = [...this.orderbook.bids.keys()].sort((a: string, b: string) => Number(b) - Number(a));

            let originalUserLeftQty = qty;
            for (let i = 0; i < bidPrices.length; i++) {
                const bucketPrice = Number(bidPrices[i])
                if (price >= bucketPrice) {
                    let individualOrders = this.orderbook.ask.get(bucketPrice.toString())!;
                    for (let j = 0; j < individualOrders.orders.length; j++) {
                        let sellerOrder = individualOrders.orders[j]!;
                        let leftQty = sellerOrder.qty - sellerOrder.filledQty;
                        if (leftQty >= sellerOrder.qty) {
                            individualOrders.orders[j].filledQty += originalUserLeftQty;
                            fills.push({
                                type: 'fill',
                                seller: userId,
                                buyer: individualOrders.orders[j]?.userId!,
                                price: bucketPrice,
                                qty: originalUserLeftQty
                            })
                            originalUserLeftQty = 0;
                            break;
                        } else {
                            fills.push({
                                type: 'fill',
                                seller: userId,
                                buyer: individualOrders.orders[j]?.userId!,
                                qty: leftQty,
                                price: bucketPrice
                            })
                            originalUserLeftQty -= leftQty;
                            individualOrders.orders = individualOrders.orders.filter(x => x.orderId == individualOrders?.orders[j]?.orderId)
                        }
                    }
                    if (originalUserLeftQty == 0) {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            if (originalUserLeftQty) {
                if (!this.orderbook.bids.get(price.toString())) {
                    this.orderbook.bids.get(price.toString()) = {
                        orders: []
                    }
                }

                this.orderbook.bids.get(price.toString())?.orders.push({
                    orderId: Math.random(),
                    userId,
                    qty,
                    filledQty: qty - originalUserLeftQty
                })

                fills.push({
                    type: "orderbook_update",
                    userId,
                    price: price,
                    qty: originalUserLeftQty
                })
            }
        }
    }
}