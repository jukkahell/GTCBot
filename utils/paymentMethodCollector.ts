import { MessageActionRow, MessageComponentInteraction, MessageSelectMenu, MessageSelectOptionData, TextBasedChannel, User } from "discord.js";
import { TransactionType } from "types/bot.t";
import { supportedPaymentMethods } from "./buy-utils";
import { onCollectionEnd } from "./collectionTimeout";

export const getPaymentMethodCollectorInteract = async (i: MessageComponentInteraction, type: TransactionType = "buy") => {
    return await getPaymentMethodCollector(i.user, i.channel, i, type);
}
export const getPaymentMethodCollector = async (user: User, channel: TextBasedChannel, interaction?: MessageComponentInteraction, type: TransactionType = "buy") => {
    const row = new MessageActionRow();
    const menu = new MessageSelectMenu()
        .setCustomId('payment-method-select')
        .setPlaceholder('Nothing selected');

    for (let i = 0; i < supportedPaymentMethods.length; i++) {
        const paymentMethod = supportedPaymentMethods[i];
        const option: MessageSelectOptionData = {
            label: paymentMethod,
            value: paymentMethod,
        }
        menu.addOptions(option);
    }

    row.addComponents(menu);

    if (interaction) {
        await interaction.followUp({
            content: `Choose your preferred payment method`,
            components: [row],
            ephemeral: true,
        });
    } else {
        await channel.send({
            content: `Choose your preferred payment method`,
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