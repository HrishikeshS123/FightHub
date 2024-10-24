const {
  Message,
  Client,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');
const roll = require('../../database/roll');
const Cooldown = new Set();
module.exports = {
  name: 'roll',
  /**
   *
   * @param {Message} message
   * @param {String[]} args
   * @param {Client} client
   */
  async execute(message, args, client) {
    if (args[0] == 'reset') {
      if (message.member.roles.cache.has('1016728636365209631')) {
        await roll.deleteMany({});
        return message.reply('All rolls have been reset.');
      }
    }
    if (Cooldown.has(message.author.id)) {
      return message.reply('You can only roll once every 30 seconds!');
    }
    Cooldown.add(message.author.id);
    setTimeout(() => {
      Cooldown.delete(message.author.id);
    }, 30000);
    const userScore =
      (
        await roll.findOne({
          userId: message.author.id
        })
      )?.amount || 0;
    const lb = await roll.find({}).sort({ points: -1 }).limit(10);
    const embed = new EmbedBuilder()
      .setTitle('Carbon TopRoll')
      .setDescription(
        `**Leaderboard**\n${lb
          .map((a, ind) => `${ind + 1}. <@${a.userId}>: ${a.amount}`)
          .join('\n')}`
      )
      .addFields([
        {
          name: 'Your game',
          value: "Click on 'Start' to play!"
        }
      ])
      .setFooter({
        text: `Current score: ${userScore}`
      });

    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setCustomId('start')
        .setLabel('Start')
    ]);
    const msg = await message.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      idle: 30_000
    });
    let count = 0;
    let f = '';
    let sum = 0;
    collector.on('collect', async (button) => {
      const rand = Math.floor(Math.random() * 100) + 1;
      sum += rand;
      count++;
      f += `${count + 1}. You rolled ${rand}!`;
      if (count == 5) {
        row.components.forEach((a) => a.setDisabled(true));
        f += `\n\nTotal: **${sum}**`;
        await roll.updateOne(
          {
            userId: message.author.id
          },
          {
            $set: {
              userId: message.author.id,
              amount: sum
            }
          }
        );
      }

      await button.update({ embeds: [embed], components: [row] });
    });
  }
};
