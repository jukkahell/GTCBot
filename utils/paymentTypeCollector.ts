import { TextBasedChannel, MessageActionRow, MessageButton, User, MessageComponentInteraction, InteractionReplyOptions } from "discord.js";
import { TransactionType } from "../types/bot.t";
import { onCollectionEnd } from "./collectionTimeout";

export const getPaymentTypeCollectorInteract = async (i: MessageComponentInteraction, userCameBack: boolean, type: TransactionType = "buy") => {
    return await getPaymentTypeCollector(i.user, i.channel, i, userCameBack, type);
}
export const getPaymentTypeCollector = async(user: User, channel: TextBasedChannel, interaction?: MessageComponentInteraction, userCameBack?: boolean, type: TransactionType = "buy") => {
    const upfrontText = type === "buy" ? 'Upfront' : 'Trade first';
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('upfront')
                .setLabel(upfrontText)
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('midman')
                .setLabel('Middleman')
                .setStyle('PRIMARY'),
        );

    if (userCameBack && interaction == null) {
        row.addComponents(
            new MessageButton()
                .setCustomId('close')
                .setLabel('Close ticket')
                .setStyle('DANGER')
        )
    }

    let text = '';
    if (!userCameBack) {
        if (type === "buy") {
            text = `Would you like to pay upfront or use a middleman for the trade?`
        } else {
            text = `Would you like to make the trade before payment or use a middleman for the trade?`
        }
    } else {
        if (type === "buy") {
            text = `If you don't want to use midman or pay first, this ticket will be closed in 1 minute.`
        } else {
            text = `If you don't want to use midman or trade first, this ticket will be closed in 1 minute.`
        }
    }

    if (interaction) {
        const messagePayload: InteractionReplyOptions = {
            content: text,
            components: [row],
            ephemeral: true,
        };
        if (!interaction.replied) {
            await interaction.reply(messagePayload);
        } else {
            await interaction.followUp(messagePayload);
        }
    } else {
        await channel.send({
            content: text,
            components: [row]
        });
    }

    const collector = channel.createMessageComponentCollector({ componentType: "BUTTON", time: 60000, max: 1 });
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