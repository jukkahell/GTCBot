import { PaymentMethod, PaymentType, ShopItem, TradeType } from "../types/bot.t";
import * as fs from "fs";

const inventoryFolder = __dirname + "/../inventories";
const readInventory = (file: string) => {
    const contents = fs.readFileSync(file, { encoding: "utf8", flag: "r"});
    if (contents.length > 0) {
        return JSON.parse(contents) as ShopItem[];
    } else {
        return [];
    }
}

const getInventoryFileName = (guildId: string) => {
    const inventory = inventoryFolder + `/${guildId}.json`;
    if (!fs.existsSync(inventoryFolder)){
        fs.mkdirSync(inventoryFolder);
    }
    if (!fs.existsSync(inventory)) {
        fs.writeFileSync(inventory, "[]", { flag: 'wx' });
    }
    return inventory;
}

export const shopItems = (guildId:string) => {
    const inventory = getInventoryFileName(guildId);
    return readInventory(inventory);
};

export const saveItem = (guildId: string, item: ShopItem) => {
    const inventoryFile = getInventoryFileName(guildId);
    const inventory = readInventory(inventoryFile);
    item.id = item.name.toLowerCase().replace(/[^\w\s]+/g, "").replace(/\s+/g, '-');
    inventory.push(item);
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory));
}

export const removeItem = (guildId: string, ids: string[]) => {
    const inventoryFile = getInventoryFileName(guildId);
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
    "mobilepay", "crypto", "paypal", "brank transfer", "western union", "paysafe", "gift card", "cashapp"
];
export const supportedPaymentTypes: PaymentType[] = [
    "midman", "upfront"
];
export const supportedMidmans: string[] = [
    "Riou", "Zize", "Alyons", "Darwindust", "tk", "Nickerinho", "Damannico", "anyone"
]