import { MessageActionRow, MessageButton, MessageComponentInteraction, TextBasedChannels, User } from "discord.js";
import { supportedMidmans } from "./buy-utils";
import { onCollectionEnd } from "./collectionTimeout";

export const getMidmanCollectorInteract = async (i: MessageComponentInteraction) => {
    return await getMidmanCollector(i.user, i.channel, i);
}
export const getMidmanCollector = async (user: User, channel: TextBasedChannels, interaction?: MessageComponentInteraction) => {
    const row = new MessageActionRow();
    for (let i = 0; i < supportedMidmans.length; i++) {
        row.addComponents(
            new MessageButton()
                .setCustomId(supportedMidmans[i])
                .setLabel(supportedMidmans[i])
                .setStyle('PRIMARY')
        )
    }
    row.addComponents(
        new MessageButton()
            .setCustomId('back')
            .setLabel('No, go back')
            .setStyle('SECONDARY')
    )

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
    
    const collector = channel.createMessageComponentCollector({ componentType: "BUTTON", time: 60000, max: 1 });
    if (channel) {
        collector.on('end', (collection) => {
            if (collection.size == 0) {
                onCollectionEnd(user, channel);
            }
        });
    }
    return collector;
}