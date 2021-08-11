import { ApplicationCommandData, ButtonInteraction, Client, Collection, Command, CommandInteraction, Guild, GuildApplicationCommandPermissionData, Intents, Interaction, MessageActionRow, MessageButton, SelectMenuInteraction, TextBasedChannels, TextChannel } from 'discord.js';
import { token, botChannel, guilds, activeTradesCategory } from './config.json';
import * as fs from 'fs';
import { getTradesCategory } from './utils/guild-utils';

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

	const createdCommands = await client.application.commands.set(data);
	guilds.forEach(async guild => {
		if (createdCommands) {
			const realGuild = client.guilds.cache.get(guild.id);
			if (realGuild) {
				const fullPermissions: GuildApplicationCommandPermissionData[] = []
				createdCommands.forEach(command => {
					if (!command.defaultPermission) {
						fullPermissions.push({
							id: command.id,
							permissions: [{
								id: realGuild.roles.everyone.id,
								type: 'ROLE',
								permission: true,
							}]
						});
					}
				});

				await client.guilds.cache.get(guild.id)?.commands.permissions.set({ fullPermissions });
			}
		} else {
			console.log(`Wasn't able to create commands for guild ${guild.id}`);
		}
	});
	
	console.log('Ready!');

	sendCommandButtons();
});

const getBotChannel = (guild: Guild): TextChannel => {
	let foundBotChannel = null;
	guild.channels.cache.forEach(channel => {
		if (channel.isText()) {
			if (channel.name === botChannel) {
				foundBotChannel = channel;
			}
		}
	});
	return foundBotChannel;
}

const checkCategoryChannel = async (guild: Guild): Promise<boolean> => {
	return await getTradesCategory(guild) == null;
}

const sendCommandButtonsInGuild = async (guild: Guild) => {
	const guildAdmin = guilds.find(g => g.id === guild.id).adminId;
	if (!checkCategoryChannel(guild)) {
		(await client.users.fetch(guildAdmin)).send(
			`Server \`${guild.name}\` doesn't have a category named \`${activeTradesCategory}\`. Please create it first.`
		);
		return;
	}
	const textChannel = getBotChannel(guild);
	if (textChannel === null) {
		(await client.users.fetch(guildAdmin)).send(
			`Server \`${guild.name}\` doesn't have a channel named \`${botChannel}\`. Please create it and give me write permission there.`
		);
		return;
	}
	if (!textChannel.permissionsFor(client.user).has(["SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_CHANNELS"])) {
		(await client.users.fetch(guildAdmin)).send(
			`I don't have enough permissions in \`${textChannel.guild.name}\` server's \`${textChannel.name}\` channel. Please add me some power there.`
		);
		return;
	}

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

const sendCommandButtons = () => {
	client.guilds.cache.forEach(async guild => {
		sendCommandButtonsInGuild(guild);
	});
}

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
	if (!interaction.isSelectMenu() || !client.commands.has(interaction.customId)) {
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

const handleCommandInteraction = async (interaction: CommandInteraction) => {
	if (!interaction.isCommand() || !client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
}

// Only bot updates come here. We're interested in role updates.
client.on("guildMemberUpdate", member => {
	const botChannel = getBotChannel(member.guild);
	if (!botChannel.permissionsFor(client.user).has("SEND_MESSAGES")) {
		sendCommandButtonsInGuild(member.guild);
	}
});

client.on("channelCreate", channel => {
	if (channel.name === botChannel || channel.name === activeTradesCategory) {
		if (channel.permissionsFor(client.user).has("SEND_MESSAGES")) {
			sendCommandButtonsInGuild(channel.guild);
		}
	}
});

client.on("guildCreate", guild => {
    if (guild.available) {
		sendCommandButtonsInGuild(guild);
	}
})

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