const cheerio = require('cheerio');
const { MessageEmbed } = require('discord.js');
const { Command, RichDisplay, util: { toTitleCase } } = require('klasa');
const request = require('request-promise');
const { color } = require('../../../config.json');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: 'Dictionary',
      aliases: ['dictionary', 'def', 'define', 'meaning', 'word'],
      guarded: true,
      description: 'Find the definition of a word (>>help dictionary for more info)',
      subcommands: true,
      usage: '<urban|oxford:default> <wordToDefine:string> [...]',
      usageDelim: ' ',
      extendedHelp: 'Simply do >>define <word> in order to get a definition. You can also choose a definition source by using >>define [source] <word>.'
    });

    this.customizeResponse('wordToDefine',
      'You need to enter a word to define, darling.'
    );
  }

  async oxford(message, [...wordToDefine]) {
    const query = encodeURIComponent(wordToDefine.join(this.usageDelim));

    const author = 'Lexico'
    const thumbnail = 'https://i.imgur.com/4wHZP6c.png';
    const url = 'https://www.lexico.com/en/definition/'
    const link = url + query;

    const display = new RichDisplay(new MessageEmbed()
      .setAuthor(author)
      .setColor(color)
      .setThumbnail(thumbnail)
      .setURL(link));

    request(link)
      .then(definition => {
        const $ = cheerio.load(definition);
        const title = toTitleCase($('.entryWrapper').find('.hw').data('headword-id'));

        $('.entryWrapper').children('.gramb').each((i, el) => {
          const examples = `\n**Examples:**\n${$(el).find('.ex').first().text()}`
          const meaning = $(el).find('.ind').text().toString().replace('.', '.\n\n');
          const type = toTitleCase($(el).find('.pos').children('.pos').text());

          display.addPage(template => template
            .setDescription([
              `\n\n**${type}:**`,
              `${meaning}`,
              `${examples}`
            ])
            .setTitle(title));
        });
      })
      .catch(error => {
        if (error.statusCode == 403) throw message.send('Oxford Dictionary is down, try again later, darling.');
        if (error.statusCode == 404) throw message.send('I couldn\'t find that word in the dictionary, darling.');

        throw message.send(message.language.get('COMMAND_ERROR_UPDATE', message));
      });

    return display.run(await message.send('Loading definitions...'));
  }

  async urban(message, [...wordToDefine]) {
    const query = encodeURIComponent(wordToDefine.join(this.usageDelim));

    const author = "Urban Dictionary";
    const url = 'https://www.urbandictionary.com/define.php?term=';
    const thumbnail = "https://naeye.net/wp-content/uploads/2018/05/Urban-Dictionary-logo-475x300.png";
    const link = url + query;

    let display = new RichDisplay(new MessageEmbed()
      .setAuthor(author)
      .setColor(color)
      .setThumbnail(thumbnail)
      .setURL(url));

    await request(link)
      .then(definition => {
        const $ = cheerio.load(definition);

        $('.def-panel').each((i, el) => {
          const title = $(el).find('.word').text();
          const meaning = $(el).children('.meaning').text();
          const contributor = $(el).children('.contributor').children('a').text();
          const examples = $(el).find('.example').text();
          const upvotes = $(el).find('.up').children('.count').text();
          const downvotes = $(el).find('.down').children('.count').text();

          display.addPage(template => template
            .addField("Upvotes", `\\👍 ${upvotes}`, true)
            .addField("Downvotes", `\\👎 ${downvotes}`, true)
            .setDescription([
              `${meaning}`,
              `\n**Examples:**\n${examples}`,
              `\n**Author:** ${contributor}`
            ])
            .setTitle(title));
        })
      })
      .catch(error => {
        if (error.statusCode == 403) throw message.send('UrbanDictionary is down, please try again later.');
        if (error.statusCode == 404) throw message.send('I couldn\'t find that word in the UrbanDictionary darling.');

        throw message.send(message.language.get('COMMAND_ERROR_UPDATE', message));
      });

    return display.run(await message.send('Loading definitions...'));
  }
};