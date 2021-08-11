import { ButtonInteraction, Command, MessageActionRow, MessageButton } from 'discord.js';
import { shopItems } from '../utils/buy-utils';

module.exports = {
	name: 'buy',
	description: 'Buy DLs, accounts or other stuff',
    defaultPermission: false,

	async execute(interaction: ButtonInteraction) {
        const hasAccounts = shopItems(interaction.guildId).some(i => i.type === "account");

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('buy-dls')
                    .setLabel('DLs')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('buy-account')
                    .setLabel('Account')
                    .setDisabled(!hasAccounts)
                    .setStyle('PRIMARY'),
            );

		return interaction.reply({
            content: `What would you like to buy?`,
            components: [row],
            ephemeral: true,
        });
	},
} as Command;