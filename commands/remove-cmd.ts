import { CommandInteraction, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { shopItems } from '../utils/buy-utils';
import { guilds } from '../config.json';

module.exports = {
    name: 'remove',
	description: 'Show accounts select box where you can remove shop items',

	async execute(interaction: CommandInteraction) {
        const guild = guilds.find(g => g.adminId === interaction.user.id);
        if (interaction.user.id !== guild?.adminId) {
            return interaction.reply({
                content: `You don't have a permission to use this command`,
                ephemeral: true,
            });
        }

        const items = shopItems(guild.id);
        if (items.length == 0) {
            return interaction.reply({
                content: `You have no items in the shop inventory`,
                ephemeral: true,
            });
        }

        const row = new MessageActionRow();
        const menu = new MessageSelectMenu()
            .setCustomId('remove-item')
            .setMinValues(1)
            .setMaxValues(items.length)
            .setPlaceholder('Nothing selected');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const option: MessageSelectOptionData = {
                label: item.name,
                description: item.description,
                value: item.id,
            }
            menu.addOptions(option);
        }
        row.addComponents(menu);
		return interaction.reply({
            content: `Select item(s) to remove`,
            components: [row],
            ephemeral: true,
        });
	},
}