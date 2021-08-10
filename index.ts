import { ApplicationCommandData, ButtonInteraction, Client, Collection, Command, CommandInteraction, GuildApplicationCommandPermissionData, Intents, Interaction, MessageActionRow, MessageButton, SelectMenuInteraction, TextChannel } from 'discord.js';
import { token, botChannel, adminId, guildId } from './config.json';
import * as fs from 'fs';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();

const commandFiles = fs.readdirSync(__dirname + "/commands").filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	if (file.indexOf("interface") > 0) {
		continue;
	}
	const command = require(`${__dirname}/commands/${file}`) as Command;
	if (command.name) {
		client.commands.set(command.name, command);
	}
}

client.once('ready', async () => {
	const data: ApplicationCommandData[] = client.commands.map(c => c);
	//await client.application?.commands.set(data);
	const createdCommands = await client.guilds.cache.get(guildId)?.commands.set(data);
	const fullPermissions: GuildApplicationCommandPermissionData[] = []

	createdCommands.forEach(command => {
		if (!command.defaultPermission) {
			fullPermissions.push({
				id: command.id,
				permissions: [{
					id: adminId,
					type: 'USER',
					permission: true,
				}]
			});
		}
	});
	await client.guilds.cache.get(guildId)?.commands.permissions.set({ fullPermissions });
	console.log('Ready!');

	client.channels.cache.forEach(async channel => {
		if (channel.isText) {
			const textChannel = channel as TextChannel;
			if (textChannel.name === botChannel) {
				const messages = await textChannel.messages.fetch();
				if (messages.size == 0) {
					const rows = new MessageActionRow()
						.addComponents(
							new MessageButton()
								.setCustomId('buy')
								.setLabel('Buy')
								.setStyle('PRIMARY'),
							new MessageButton()
								.setCustomId('sell')
								.setLabel('Sell')
								.setStyle('PRIMARY'),
						);

					textChannel.send({
						content: "Would you like to buy or sell?",
						components: [rows]
					});
				}
			}
		}
	});
});

const handleButtonInteraction = async (interaction: ButtonInteraction) => {
	if (!interaction.isButton() || !client.commands.has(interaction.customId)) {
		interaction.deferUpdate();
		return;
	}

	try {
		await client.commands.get(interaction.customId).execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

const handleSelectInteraction = async (interaction: SelectMenuInteraction) => {
	if (!interaction.isSelectMenu() || !client.commands.has(interaction.customId)) return;

	try {
		await client.commands.get(interaction.customId).execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

const handleCommandInteraction = async (interaction: CommandInteraction) => {
	if (!interaction.isCommand() || !client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

client.on('interactionCreate', async (interaction: Interaction) => {
	switch(interaction.type) {
		case "MESSAGE_COMPONENT":
			if (interaction.isButton()) {
				handleButtonInteraction(interaction as ButtonInteraction);
			} else if (interaction.isSelectMenu()) {
				handleSelectInteraction(interaction as SelectMenuInteraction);
			}
			break;
		case "APPLICATION_COMMAND":
			if (interaction.isCommand()) {
				handleCommandInteraction(interaction as CommandInteraction);
			}
			break;
	}
});

client.login(token);