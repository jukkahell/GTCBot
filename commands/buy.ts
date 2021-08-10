import { ButtonInteraction, Command, MessageActionRow, MessageButton } from 'discord.js';

module.exports = {
	name: 'buy',
	description: 'Buy DLs, accounts or other stuff',

	async execute(interaction: ButtonInteraction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('buy-dls')
                    .setLabel('DLs')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('buy-account')
                    .setLabel('Account')
                    .setStyle('PRIMARY'),
            );

		return interaction.reply({
            content: `What would you like to buy?`,
            components: [row],
            ephemeral: true,
        });
	},
} as Command;