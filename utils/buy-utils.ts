import { PaymentMethod, PaymentType, ShopItem, TradeType } from "../types/bot.t";
import * as fs from "fs";

const inventoryFile = __dirname + "/../inventory.json";
const readInventory = (file: string) => {
    const contents = fs.readFileSync(file, { encoding: "utf8", flag: "r"});
    if (contents.length > 0) {
        return JSON.parse(contents) as ShopItem[];
    } else {
        return [];
    }
}

export const shopItems = () => {
    if (!fs.existsSync(inventoryFile)) {
        fs.writeFileSync(inventoryFile, "[]", { flag: 'wx' });
    }
    return readInventory(inventoryFile);
};

export const saveItem = (item: ShopItem) => {
    if (!fs.existsSync(inventoryFile)) {
        fs.writeFileSync(inventoryFile, "[]", { flag: 'wx' });
    }
    const inventory = readInventory(inventoryFile);
    item.id = item.name.toLowerCase().replace(' ', '-');
    inventory.push(item);
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory));
}

export const removeItem = (ids: string[]) => {
    if (!fs.existsSync(inventoryFile)) {
        throw new Error(`Inventory empty. Cannot remove ${ids.join(', ')}`);
    }
    let inventory = readInventory(inventoryFile);
    inventory = inventory.filter(i => !ids.includes(i.id));
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory));
    return `Removed inventory items: ${ids.join(', ')}`;
}

export const accountsBidCounts = new Map<string, number>();

export const supportedBuyTypes: TradeType[] = [
    "account","dls","other"
];
export const supportedPaymentMethods: PaymentMethod[] = [
    "mobilepay", "crypto", "paypal", "skrill"
];
export const supportedPaymentTypes: PaymentType[] = [
    "midman", "upfront"
];
export const supportedMidmans: string[] = [
    "Riou", "Zize", "Bazzela", "Darwindust", "Mecromans", "anyone"
]