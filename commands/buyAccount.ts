import { ButtonInteraction, MessageActionRow, Command, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { shopItems, accountsBidCounts } from "../utils/buy-utils";
import { emojiNumbers } from "../utils/emojis";


module.exports = {
    name: 'buy-account',
	description: 'Buy account',

	async execute(interaction: ButtonInteraction) {
        const row = new MessageActionRow();
        const menu = new MessageSelectMenu()
            .setCustomId('buy-account-select')
            .setPlaceholder('Nothing selected');

        const accounts = shopItems().filter(i => i.type === "account");
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            let label = account.name;
            if (account.price) {
                label += `\t\t${account.price} ${account.currency}`
            }
            const option: MessageSelectOptionData = {
                label,
                value: account.id,
            }
            if (account.description) {
                option.description = account.description;
            }

            if (accountsBidCounts.has(account.id)) {
                option.emoji = emojiNumbers[accountsBidCounts.get(account.id)];
            }
            menu.addOptions(option);
        }
        row.addComponents(menu);

        if (accounts.length > 0) {
            return interaction.reply({
                content: `I have currently these accounts for sell. Please choose one.`,
                components: [row],
                ephemeral: true,
            });
        } else {
            return interaction.reply({
                content: `No accounts for sell currently. Please check again later.`,
                ephemeral: true,
            });
        }
    },
} as Command;