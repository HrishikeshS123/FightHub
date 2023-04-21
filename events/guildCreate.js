const { Guild, Client, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildCreate',
  once: false,
  /**
   *
   * @param {Guild} guild
   * @param {Client} client
   */
  async execute(guild, client) {
    const channel = client.channels.cache.get('897100473184686110');

    channel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
            url: `https://discord.com/${guild.vanityURLCode}` || null
          })
          .setTitle('Server Joined')
          .addFields('Members', guild.memberCount.toLocaleString(), true)
          .addFields(
            'Owner',
            (await client.users.fetch(guild.ownerId)).tag +
              ` (${guild.ownerId})`,
            true
          )
          .addFields(
            'Useless info',
            `Guild was created ${client.functions.formatTime(
              guild.createdAt
            )} and the bot joined the server ${client.functions.formatTime(
              new Date().getTime()
            )}`
          )
          .setColor('Green')
      ]
    });
  }
};
