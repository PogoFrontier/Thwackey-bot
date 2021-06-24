const Discord = require('discord.js');
const fs = require('fs');
const { bot, channels, links, roles } = require('./data.json');
const reactionRoles = require('./functions/reactionroles.js');
const linkchecker = require('./functions/linkchecker.js');
const vote = require('./functions/vote.js');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
var app = express();
const PORT = process.env.PORT || 3001;


const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

module.exports = { client };
app.listen(PORT, () => {
	console.log(`App is running on port ${ PORT }`);
});

client.on('ready', async() => {
	reactionRoles.execute();
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
	if (message.author.bot) return;

	//activates link checker
	if (message.guild.id === '793936386201354310') {
		linkchecker.execute(message);
	}
	//adds votes to #feature-requests
	if (message.channel.id === '837591625072246784') {
		vote.execute(message);
	}

	if (!message.content.startsWith(bot.prefix)) { return; }

	//initializes commands and arguments
	const args = message.content.slice(bot.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	//returns if command got used inside a DM
	if (message.channel.type !== 'text') {
		return message.channel.send(':warning: I can\'t execute commands inside DMs.');
	}

	//activates the command or logs if an error occured
	try {
		command.execute(message, args, bot.prefix);
	} catch (error) {
		console.log(error.stack);
		message.channel.send(':warning: There was an error trying to execute that command. It\'s logged.');
		const logChannel = message.guild.channels.cache.get(channels.log_ID);
		if (logChannel) {
			const errorEmbed = new Discord.MessageEmbed()
				.setColor(bot.color)
				.setTitle('An error occured')
				.setAuthor(message.member.user.tag)
				.setThumbnail(message.member.user.displayAvatarURL())
				.setDescription('```' + error.message + `\`\`\`\n[message](${message.url})`)
				.setTimestamp().setURL('https://www.youtube.com/watch?v=t3otBjVZzT0');

			logChannel.send(errorEmbed);
		}
	}
});

//logs deleted messages
client.on('messageDelete', async msg => {
	const logChannel = msg.guild.channels.cache.get(channels.log_ID);
	if (!logChannel) return;
	let embed = new Discord.MessageEmbed().setColor(bot.color)
		.setTitle('Message deleted')
		.setAuthor(msg.member.user.tag)
		.setDescription(msg.content)
		.addField('channel:', msg.channel.name)
		.setFooter(msg.member.user.id)
		.setTimestamp();
	logChannel.send(embed);
});

//sends welcome message for a new user
client.on('guildMemberAdd', member => {
	const welcomeEmbed = new Discord.MessageEmbed()
		.setColor(bot.color)
		.setTitle('Welcome to the Project Grookey Team!')
		.setAuthor(member.user.tag)
		.setThumbnail(member.user.displayAvatarURL())
		.setDescription(`This is the official Discord server for Project Grookey. Please visit <#${channels.roles_ID}> and select how you would like to contribute. Also visit <#${channels.testinfo_ID}> to learn how to use the project. If none of the roles fit or if you have any questions, feel free to reach out to <@330092465212227584>. \n\n __**Links**__\n [Front-end](${links.FrontEnd})\n[Back-end](${links.BackEnd})`)
		.setFooter(`We have ${member.guild.members.cache.filter(m => !m.user.bot).size} human members now`)
		.setTimestamp();
	const welcomeChannel = member.guild.channels.cache.get(channels.welcome_ID);
	if (welcomeChannel) {
		welcomeChannel.send(member.toString(), welcomeEmbed);
	}
	console.log(member.user.tag + ' has joined the server');
});

//logs if a muted user leaves the server
client.on('guildMemberRemove', member => {
	const logChannel = member.guild.channels.cache.get(channels.log_ID);
	if (member.roles.cache.has(roles.muted_ID)) {
		const jailedEmbed = new Discord.MessageEmbed()
			.setColor(bot.color)
			.setTitle('Muted user left')
			.addField(member.user.id, member.user.tag)
			.setTimestamp()
			.setThumbnail(member.user.displayAvatarURL());
		logChannel.send(jailedEmbed);
	}

});

//logs in
client.login(process.env.TOKEN);

