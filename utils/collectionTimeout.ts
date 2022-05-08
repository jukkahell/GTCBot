import { TextBasedChannel, User } from "discord.js";
import { TransactionType } from "types/bot.t";

export const onCollectionEnd = async (user: User, channel: TextBasedChannel, deleteChannel: boolean = false, type: TransactionType = "buy") => {
    const typeText = type === "buy" ? 'Buy' : 'Sell';
    await user.send({
        content: `${typeText} request timed out, closing it for now. Please create new one if you still want to ${typeText.toLowerCase()}.`,
    });
    if (deleteChannel) {
        await channel.delete();
    }
}