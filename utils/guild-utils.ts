import { CategoryChannelResolvable, Guild, GuildChannel, GuildChannelCreateOptions, Interaction, NonThreadGuildBasedChannel } from "discord.js";
import { TradeType } from "../types/bot.t";
import { supportedBuyTypes } from "./buy-utils";
import { activeTradesCategory, deleteTradeChannelAfterMinutes } from '../config.json';
import { ChannelTypes } from "discord.js/typings/enums";

export const getTradesCategory = async (guild: Guild) => {
    return guild.channels.cache.find(c => 
        c.type === "GUILD_CATEGORY" && c.name == activeTradesCategory
    ) as CategoryChannelResolvable;
}

export const getNextChannelId = async (guild: Guild): Promise<number> => {
    const channels = await guild.channels.fetch();
    const tradeChannels = channels.filter(c => 
        c.isText && 
        supportedBuyTypes.some(t => c.name.startsWith(t))
    );

    let greatestId = 0;
    tradeChannels.forEach(c => {
        const [_, __, id] = c.name.split("-");
        if (Date.now() - c.createdTimestamp > deleteTradeChannelAfterMinutes * 60 * 1000) {
            c.delete();
        } else {
            if (!isNaN(id as any) && parseInt(id) > greatestId) {
                greatestId = parseInt(id);
            }
        }
    });
    return greatestId + 1;
}

export const createNextChannel = async (interaction: Interaction, tradeType: TradeType) => {
    const guild = interaction.guild;
    const tradeChannelId = await getNextChannelId(guild);
    const parent = await getTradesCategory(guild);
    const channelName = `${tradeType}-trade-${tradeChannelId}`;
    const author = interaction.user;
    const bot = interaction.client.user;
    const createOptions: GuildChannelCreateOptions & { type: ChannelTypes.GUILD_TEXT } = {
        parent,
        type: ChannelTypes.GUILD_TEXT,
        permissionOverwrites: [
            { id: guild.id, deny: ['VIEW_CHANNEL'] },
            { id: author.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS', 'EMBED_LINKS'] },
            { id: bot.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] }
        ]
    };
    return await guild.channels.create<ChannelTypes.GUILD_TEXT>(channelName, createOptions);
}