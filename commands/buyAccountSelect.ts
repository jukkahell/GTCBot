import { ButtonInteraction, Command, MessageActionRow, MessageButton, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { PaymentMethod, PaymentType } from "../types/bot.t";
import { shopItems, accountsBidCounts, supportedPaymentTypes, supportedMidmans } from "../utils/buy-utils";
import { createNextChannel } from "../utils/guild-utils";
import { adminId } from "../config.json";
import { getPaymentTypeCollectorInteract } from "../utils/paymentTypeCollector";
import { getMidmanCollectorInteract } from "../utils/midmanCollector";
import { getPaymentMethodCollectorInteract } from "../utils/paymentMethodCollector";

const wrapUp = async (interaction: ButtonInteraction, accountId: string, midman: string) => {
    const paymentMethod = interaction.customId as PaymentMethod;
    const channel = await createNextChannel(interaction, "account");
    const account = shopItems().find(i => i.id === accountId);
    const paymentTypeText = midman != null
        ? `${midman} as a midman`
        : `Upfront`;

    channel.send(`
Hey, <@${adminId}>!
<@${interaction.user.id}> would like to buy account \`${account.name}\`
Price: ${account.price} ${account.currency}
Payment type: ${paymentTypeText}
Payment method: ${paymentMethod}.`);

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
    })

    return interaction.followUp({
        content: `Please join this private channel <#${channel.id}> to continue ${accountId} account's trade.`,
        ephemeral: true,
    });
}

const collectPaymentMethod = async(originalInteraction: MessageComponentInteraction, accountId: string, midman: string) => {
    const collector = await getPaymentMethodCollectorInteract(originalInteraction);
    collector.on('collect', (i: ButtonInteraction) => {
        if (i.user.id === originalInteraction.user.id) {
            wrapUp(i, accountId, midman);
        }
    });
}

const midmanCollected = async(originalInteraction: MessageComponentInteraction, interaction: SelectMenuInteraction, accountId: string) => {
    const midman = interaction.values[0];
    if (!supportedMidmans.includes(midman)) {
        collectPaymentType(originalInteraction, accountId, true);
        return;
    }

    collectPaymentMethod(originalInteraction, accountId, midman);
}

const collectMidman = async(originalInteraction: MessageComponentInteraction, accountId: string) => {
    const collector = await getMidmanCollectorInteract(originalInteraction);
    collector.on('collect', (i: SelectMenuInteraction) => {
        if (i.user.id === originalInteraction.user.id) {
            midmanCollected(originalInteraction, i, accountId);
        }
    });
}

const paymentTypeCollected = async(originalInteraction: MessageComponentInteraction, interaction: ButtonInteraction, accountId: string) => {
    const paymentType = interaction.customId as PaymentType;
    if (!supportedPaymentTypes.includes(paymentType)) {
        await originalInteraction.followUp({
            content: `Unknown payment type selected (${paymentType}). I might be too confused to continue from here.`,
            ephemeral: true,
        });
        return;
    }

    if (paymentType === "upfront") {
        collectPaymentMethod(originalInteraction, accountId, null);
    } else {
        collectMidman(originalInteraction, accountId);
    }
}

const collectPaymentType = async (originalInteraction: MessageComponentInteraction, accountId: string, userCameBack: boolean) => {
    const collector = await getPaymentTypeCollectorInteract(originalInteraction, userCameBack);
    collector.on('collect', (i: ButtonInteraction) => {
        if (i.user.id === originalInteraction.user.id) {
            paymentTypeCollected(originalInteraction, i, accountId);
        }
    });
}

module.exports = {
    name: 'buy-account-select',
	description: 'Buy a specific account',
    options: [
        { name: "account-id", description: "Account ID", required: true, type: "STRING" }
    ],

	async execute(interaction: SelectMenuInteraction) {
        const accountId = interaction.values[0];
        if (!accountId || !shopItems().some(i => i.id === accountId)) {
            return interaction.reply({ content: 'No account ID provided!', ephemeral: true });
        }

        if (accountsBidCounts.has(accountId)) {
            const bids = Math.min(accountsBidCounts.get(accountId) + 1, 11);
            accountsBidCounts.set(accountId, bids);
        } else {
            accountsBidCounts.set(accountId, 1);
        }
        
        await collectPaymentType(interaction, accountId, false);
    },
} as Command;