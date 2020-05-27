const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');
const { color } = require('../../../config.json');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'douse',
      cooldown: 60,
      guarded: true,
      permissionLevel: 0,
      description: 'Douse Himiko!',
      extendedHelp: 'Simply do >>douse'
    });
  }

  async run(message) {
    const description = 'And I oop-';
    const image = 'https://66.media.tumblr.com/85279d0340fa77da326c12e5a329088a/tumblr_p7j729FrkK1qehrvso1_540.gifv';

    return message.send(new MessageEmbed()
      .setColor(color)
      .setDescription(description)
      .setImage(image));
  }
};
