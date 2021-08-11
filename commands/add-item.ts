import { Command, CommandInteraction } from 'discord.js';
import { saveItem } from '../utils/buy-utils';
import { guilds } from '../config.json';

module.exports = {
	name: 'add',
	description: 'Add item for sale',
    options: [
        { name: "type", description: "Sellable item type", type: "STRING", required: true, choices: [
            { name: "Account", value: "account" },
            { name: "Other", value: "other" }
        ]},
        { name: "name", description: "Name will be shown for the buyers", type: "STRING", required: true },
        { name: "currency", description: "Could be euro, dollar, DL or anything", type: "STRING", required: true },
        { name: "price", description: "Price in selected currency", type: "NUMBER", required: true },
        { name: "description", description: "Description is shown for buyers too", type: "STRING" }
    ],

	async execute(interaction: CommandInteraction) {
        const guild = guilds.find(g => g.adminId === interaction.user.id);
        if (interaction.user.id !== guild.adminId) {
            return interaction.reply({
                content: `You don't have a permission to use this command`,
                ephemeral: true,
            });
        }

        const type = interaction.options.getString("type");
        const name = interaction.options.getString("name");
        const price = interaction.options.getNumber("price");
        const currency = interaction.options.getString("currency") || "";
        const description = interaction.options.getString("description") || "";
        saveItem(guild.id, { type, name, price, currency, description });
		return interaction.reply({
            content: `Added for sale: ${type} ${name} for ${price} ${currency} - ${description}`
        });
	},
} as Command;