import { Command, CommandInteraction } from 'discord.js';
import { saveItem } from '../utils/buy-utils';

module.exports = {
	name: 'add',
	description: 'Add item for sale',
    defaultPermission: false,
    options: [
        { name: "type", description: "Sellable item type", type: "STRING", required: true, choices: [
            { name: "Account", value: "account" },
            { name: "Other", value: "other" }
        ]},
        { name: "name", description: "Name will be shown for the buyers", type: "STRING", required: true },
        { name: "currency", description: "Could be euro, dollar, DL or anything", type: "STRING" },
        { name: "price", description: "Price in selected currency", type: "NUMBER" },
        { name: "description", description: "Description is shown for buyers too", type: "STRING" }
    ],

	async execute(interaction: CommandInteraction) {
        const type = interaction.options.getString("type");
        const name = interaction.options.getString("name");
        const price = interaction.options.getNumber("price");
        const priceText = price || "buyer to offer";
        const currency = interaction.options.getString("currency") || "";
        if (price && currency.length == 0) {
            return interaction.reply({
                content: `Currency needs to be set if price is set.`
            }); 
        }
        const description = interaction.options.getString("description") || "";
        saveItem({ type, name, price, currency, description });
		return interaction.reply({
            content: `Added for sale: ${type} ${name} for ${priceText} ${currency} ${description}`
        });
	},
} as Command;