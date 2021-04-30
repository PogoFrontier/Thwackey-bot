module.exports = {
	async execute() {
		const client = require('../index.js').client;
		const Discord = require('discord.js');
		const { channels, messages, roles } = require('../data.json');

		//fetches the message and guild
		const reactionRolesMessage = await client.channels.cache.get(channels.roles_ID).messages.fetch(messages.reactionRoles_ID);
		const guild = reactionRolesMessage.guild;

		//adds a filter for the collector
		const filter = (reaction) => {
			return reaction.emoji.name == '🧑‍🎨' || reaction.emoji.name == '🧑‍💻' || reaction.emoji.name == '🎮' || reaction.emoji.name == '⚔️';
		};

		//creates collector
		const collector = new Discord.ReactionCollector(reactionRolesMessage, filter, { dispose: true });

		//adds roles if collected emoji id matches
		collector.on('collect', (reaction, user) => {
			if (reaction.emoji.name == '🧑‍🎨') guild.members.cache.get(user.id).roles.add(roles.designer_ID);
			if (reaction.emoji.name == '🧑‍💻') guild.members.cache.get(user.id).roles.add(roles.developer_ID);
			if (reaction.emoji.name == '🎮') guild.members.cache.get(user.id).roles.add(roles.tester_ID);
          
		});

		//removes roles if collected emoji id matches
		collector.on('remove', (reaction, user) => {
			if (reaction.emoji.name == '🧑‍🎨') guild.members.cache.get(user.id).roles.remove(roles.designer_ID);
			if (reaction.emoji.name == '🧑‍💻') guild.members.cache.get(user.id).roles.remove(roles.developer_ID);
			if (reaction.emoji.name == '🎮') guild.members.cache.get(user.id).roles.remove(roles.tester_ID);
          
		});
	},
};
