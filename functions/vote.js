module.exports = {
	async execute(msg) {
		msg.react('👍').then(() => msg.react('👎'));
	}
};