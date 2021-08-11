import { SelectMenuInteraction, Command } from "discord.js";
import { removeItem } from "../utils/buy-utils";
import { guilds } from '../config.json';

module.exports = {
	name: 'remove-item',
	description: 'Remove selected item(s) from sale',

	async execute(interaction: SelectMenuInteraction) {
        const guild = guilds.find(g => g.adminId === interaction.user.id);
        if (interaction.user.id !== guild?.adminId) {
            return interaction.reply({
                content: `You don't have a permission to use this command`,
                ephemeral: true,
            });
        }

        const ids = interaction.values;
        try {
            const message = removeItem(guild.id, ids);
            return interaction.reply({
                content: message,
            });
        } catch (error) {
            return interaction.reply({
                content: error.message
            });
        }
	},
} as Command;