import { CategoryChannel } from "discord.js";

export type TransactionType = "buy" | "sell";
export type TradeType = "dls" | "account" | "other";
export type PaymentType = "midman" | "upfront";
export type PaymentMethod = "mobilepay" | "paypal" | "crypto" | "skrill";

export interface TradeChannel {
    id: number;
    parent: CategoryChannel;
}

export interface ShopItem {
    id?: string;
    name: string;
    description: string;
    type: string;
    price: number;
    currency: string;
}