import { SelectMenuInteraction, Command } from "discord.js";
import { removeItem } from "../utils/buy-utils";

module.exports = {
	name: 'remove-item',
	description: 'Remove selected item(s) from sale',
    defaultPermission: false,

	async execute(interaction: SelectMenuInteraction) {
        const ids = interaction.values;
        try {
            const message = removeItem(ids);
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