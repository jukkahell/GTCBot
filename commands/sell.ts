import { ButtonInteraction, Command, MessageActionRow, MessageButton } from 'discord.js';

module.exports = {
	name: 'sell',
	description: 'Sell DLs, accounts or other stuff',

	async execute(interaction: ButtonInteraction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('sell-dls')
                    .setLabel('DLs')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('sell-account')
                    .setLabel('Account')
                    .setStyle('PRIMARY'),
            );

		return interaction.reply({
            content: `What would you like to sell?`,
            components: [row],
            ephemeral: true,
        });
	},
} as Command;