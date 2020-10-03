const Discord = require('discord.js');
const PlayerColours = require("../player_colours.js");

module.exports = {
  name: 'start',
  desc: 'Starts the game, bound to the voice channel and sends a SyncLink',
  execute(message, args, gameManager, URL) {
    if(message.member.voice.channel) {
      if(gameManager.findGame(message.member.voice.channel)){ 
        message.channel.send(`I'm sorry, but a game already exists in the voice channel **${message.member.voice.channel.name}**`)
      }else{
        gameManager.newGame(message.member.voice.channel, message.channel);
  
        message.channel.send(`Game Created in **${message.member.voice.channel.name}**`);
        let game = gameManager.findGame(message.member.voice.channel);
        let game_url = `http://${URL}?game=${game.syncId}`;
        
        const RichEmbed = new Discord.MessageEmbed()
            .setColor('#ffde2a')
            .setTitle('Among Us Manager Sync')
            .setDescription(`I saw ${this.randomColour()} vent... Kind of sus \n`)
            .setURL(game_url)

            .addFields(
              // { name: 'URL', value: `[${game.syncId}](${game_url})` },
              // { name: '\u200B', value: '\u200B' },
              { name: 'Player Count', value: game.players.length, inline: true },
              { name: 'Game Stage', value: game.gameStage.toUpperCase(), inline: true },
            )

            //.setURL('https://amongus_manager.io/') //?game=', game.syncId)
            .setAuthor('Among Us Manager', 'https://is4-ssl.mzstatic.com/image/thumb/Purple124/v4/a6/22/96/a622969c-baa8-7151-fb18-5f67e456c0aa/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/246x0w.png')

        message.reply(RichEmbed);
      }
    }else{
      message.reply("To run this command, you must be in a voice channel.");
    }
  },

  randomColour() {
    let return_value = '';
    let random = Math.floor(Math.random() * 12);
  
    Object.keys(PlayerColours).forEach((key, index) => {
      if (index == random) {
        return_value = PlayerColours[key];
      }
    });
  
    return return_value;
  }
}