import { ButtonInteraction, Command, Message, MessageActionRow, MessageButton, SelectMenuInteraction, TextBasedChannels, User } from "discord.js";
import { PaymentMethod, PaymentType } from "types/bot.t";
import { supportedMidmans, supportedPaymentTypes } from "../utils/buy-utils";
import { createNextChannel } from "../utils/guild-utils";
import { getMidmanCollector } from "../utils/midmanCollector";
import { getPaymentMethodCollector } from "../utils/paymentMethodCollector";
import { getPaymentTypeCollector } from "../utils/paymentTypeCollector";
import { onCollectionEnd } from "../utils/collectionTimeout";
import { guilds } from "../config.json";

const paymentMethodCollected = async(interaction: ButtonInteraction, quantity: number, midman: string) => {
    const paymentMethod = interaction.customId as PaymentMethod;
    const paymentTypeText = midman != null
        ? `using \`${midman}\` as a midman and`
        : `paying upfront using`;

    const adminId = guilds.find(g => g.id === interaction.guildId).adminId;
    await interaction.channel.send({
        content: `Hey, <@${adminId}>! ${interaction.user.username} would like to buy \`${quantity}\` DLs by ${paymentTypeText} \`${paymentMethod}.\``
    });

    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setCustomId('close')
            .setLabel('Close')
            .setStyle('SUCCESS')
    );
    const message = await interaction.channel.send({
        content: "Close ticket when ready",
        components: [row]
    });
    const collector = message.channel.createMessageComponentCollector({});
    collector.on("collect", (interaction: ButtonInteraction) => {
        interaction.channel.delete();
    })
}

const collectPaymentMethod = async(user: User, channel: TextBasedChannels, quantity: number, midman: string) => {
    const collector = await getPaymentMethodCollector(user, channel);
    collector.on('collect', (i: ButtonInteraction) => {
        if (i.user.id === user.id) {
            paymentMethodCollected(i, quantity, midman);
        }
    });
}

const midmanCollected = async(user: User, interaction: SelectMenuInteraction, quantity: number) => {
    const midman = interaction.values[0];
    if (!supportedMidmans.includes(midman)) {
        collectPaymentType(user, interaction.channel, quantity, true);
        return;
    }

    collectPaymentMethod(user, interaction.channel, quantity, midman);
}

const collectMidman = async(user: User, channel: TextBasedChannels, quantity: number) => {
    const collector = await getMidmanCollector(user, channel);
    collector.on('collect', (i: SelectMenuInteraction) => {
        if (i.user.id === user.id) {
            midmanCollected(user, i, quantity);
        }
    });
}

const paymentTypeCollected = async(user: User, interaction: ButtonInteraction, quantity: number) => {
    const paymentType = interaction.customId as PaymentType;
    if (!supportedPaymentTypes.includes(paymentType)) {
        if (interaction.customId === "close") {
            interaction.channel.delete();
            return;
        }
        await interaction.channel.send({
            content: `Unknown payment type selected (${paymentType}). I might be too confused to continue from here.`,
        });
        return;
    }

    if (paymentType === "upfront") {
        collectPaymentMethod(user, interaction.channel, quantity, null);
    } else {
        collectMidman(user, interaction.channel, quantity);
    }
}

const collectPaymentType = async(user: User, channel: TextBasedChannels, quantity: number, userCameBack: boolean) => {
    const collector = await getPaymentTypeCollector(user, channel, null, userCameBack);
    collector.on('collect', (i: ButtonInteraction) => {
        if (i.user.id === user.id) {
            paymentTypeCollected(user, i, quantity);
        }
    });
}

module.exports = {
    name: 'buy-dls',
	description: 'Buy DLs',
    defaultPermission: false,

	async execute(interaction: ButtonInteraction) {
        const channel = await createNextChannel(interaction, "dls");
        const message = await channel.send(`OK <@${interaction.user.id}>. How many DLs would you like to buy?`);
        const filter = (m: Message) => interaction.user.id === m.author.id && !isNaN(m.content as any);
        const dlsQuantityCollector = message.channel.createMessageCollector( {filter, time: 60000, max: 1 });
        dlsQuantityCollector.on('collect', (m) => collectPaymentType(interaction.user, channel, parseInt(m.content), false));
        dlsQuantityCollector.on('end', (collection) => {
            if (collection.size == 0) {
                onCollectionEnd(interaction.user, channel, true, "buy");
            }
        });

        await interaction.reply({
            content: `Please join this private channel <#${channel.id}> to continue DLs trade.`,
            ephemeral: true,
        });
        return;
    },
} as Command;