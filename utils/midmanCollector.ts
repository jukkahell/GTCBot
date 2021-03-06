import { MessageActionRow, MessageComponentInteraction, MessageSelectMenu, MessageSelectOptionData, TextBasedChannel, User } from "discord.js";
import { TransactionType } from "types/bot.t";
import { supportedMidmans } from "./buy-utils";
import { onCollectionEnd } from "./collectionTimeout";

export const getMidmanCollectorInteract = async (i: MessageComponentInteraction, type: TransactionType = "buy") => {
    return await getMidmanCollector(i.user, i.channel, i, type);
}
export const getMidmanCollector = async (user: User, channel: TextBasedChannel, interaction?: MessageComponentInteraction, type: TransactionType = "buy") => {
    const row = new MessageActionRow();
    const menu = new MessageSelectMenu()
        .setCustomId('midman-select')
        .setPlaceholder('Nothing selected');

    for (let i = 0; i < supportedMidmans.length; i++) {
        const midman = supportedMidmans[i];
        const label = midman === 'anyone' ? 'Anyone of these is OK' : midman;
        const option: MessageSelectOptionData = {
            label,
            value: midman,
        }
        menu.addOptions(option);
    }

    const noOneOption: MessageSelectOptionData = {
        label: "No, go back",
        value: "back",
    }
    menu.addOptions(noOneOption);

    row.addComponents(menu);

    if (interaction) {
        await interaction.followUp({
            content: `Here's the list of midmans I accept. Do you want to use any of them?`,
            components: [row],
            ephemeral: true,
        });
    } else {
        await channel.send({
            content: `Here's the list of midmans I accept. Do you want to use any of them?`,
            components: [row]
        });
    }
    
    const collector = channel.createMessageComponentCollector({ componentType: "SELECT_MENU", time: 60000, max: 1 });
    if (channel) {
        collector.on('end', (collection) => {
            if (collection.size == 0) {
                const deleteChannel = interaction == null;
                onCollectionEnd(user, channel, deleteChannel, type);
            }
        });
    }
    return collector;
}