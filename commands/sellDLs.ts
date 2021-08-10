import { MessageComponentInteraction, TextBasedChannels, MessageActionRow, MessageButton, ButtonInteraction, Command } from "discord.js";
import { PaymentType } from "../types/bot.t";
import { supportedMidmans, supportedPaymentTypes } from "../utils/buy-utils";
import { onCollectionEnd } from "../utils/collectionTimeout";
import { createNextChannel } from "../utils/guild-utils";
import { getMidmanCollectorInteract } from "../utils/midmanCollector";
import { getPaymentTypeCollectorInteract } from "../utils/paymentTypeCollector";
import { adminId } from "../config.json";

const wrapUp = async(interaction: MessageComponentInteraction, channel: TextBasedChannels, midman: string) => {
    const paymentTypeText = midman != null
        ? `using \`${midman}\` as a midman`
        : `making the trade before payment`;

    await channel.send(`Thank you ${interaction.user.username}`);

    await channel.send(`Hey, <@${adminId}>!
Are you interested in buying DLs with the above specs by ${paymentTypeText}?`);

    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('close')
            .setLabel('Close')
            .setStyle('SUCCESS')
    );
    await channel.send({
        content: "Close ticket when ready",
        components: [row]
    });
    const collector = channel.createMessageComponentCollector({});
    collector.on("collect", (interaction: ButtonInteraction) => {
        interaction.channel.delete();
    });
}

const collectAccountDetails = async(interaction: MessageComponentInteraction, midman: string) => {
    const channel = await createNextChannel(interaction, "dls");
    
    interaction.followUp({
        content: `Please join this private channel <#${channel.id}> to continue with the sell details.`,
        ephemeral: true,
    });

    const ttlMillis = 300000;
    await channel.send(`
Hey, how many DLs would you like to sell? I would also like to know the unit price and your preferred payment method.

This channel will be deleted automatically after ${ttlMillis/1000/60} minutes if I get no answer.
    `);

    const collector = channel.createMessageCollector({ time: ttlMillis, max: 1 });
    collector.on('collect', (c) => {
        if (c.author.id === interaction.user.id) {
            wrapUp(interaction, channel, midman);
        }
    });
    collector.on('end', (collection) => {
        if (collection.size == 0) {
            onCollectionEnd(interaction.user, channel);
        }
    });
}

const midmanCollected = async(originalInteraction: MessageComponentInteraction, interaction: ButtonInteraction) => {
    const midman = interaction.customId;
    if (!supportedMidmans.includes(midman)) {
        collectPaymentType(originalInteraction, true);
        return;
    }

    collectAccountDetails(originalInteraction, midman);
}

const collectMidman = async(originalInteraction: MessageComponentInteraction) => {
    const collector = await getMidmanCollectorInteract(originalInteraction);
    collector.on('collect', (i: ButtonInteraction) => {
        if (i.user.id === originalInteraction.user.id) {
            midmanCollected(originalInteraction, i);
        }
    });
}

const paymentTypeCollected = async(originalInteraction: MessageComponentInteraction, interaction: ButtonInteraction) => {
    const paymentType = interaction.customId as PaymentType;
    if (!supportedPaymentTypes.includes(paymentType)) {
        await originalInteraction.followUp({
            content: `Unknown payment type selected (${paymentType}). I might be too confused to continue from here.`,
            ephemeral: true,
        });
        return;
    }

    if (paymentType === "upfront") {
        collectAccountDetails(originalInteraction, null);
    } else {
        collectMidman(originalInteraction);
    }
}

const collectPaymentType = async (originalInteraction: MessageComponentInteraction, userCameBack: boolean) => {
    const collector = await getPaymentTypeCollectorInteract(originalInteraction, userCameBack, "sell");
    collector.on('collect', (i: ButtonInteraction) => {
        if (i.user.id === originalInteraction.user.id) {
            paymentTypeCollected(originalInteraction, i);
        }
    });
}

module.exports = {
    name: 'sell-dls',
	description: 'Sell DLs',

	async execute(interaction: ButtonInteraction) {
        await collectPaymentType(interaction, false);
    },
} as Command;