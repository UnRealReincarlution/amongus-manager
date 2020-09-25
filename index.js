"use strict";
const TOKEN = 'NzU4MjUzNTQzNTIxNjQ4NjYx.X2sQpA.YoOP1v7KIee9qQt0b82t_1Nm1Z8';

const Discord = require('discord.js');
const client = new Discord.Client();

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

const GameManager = require("./src/game_manager.js")
const PlayerColours = require("./src/player_colours.js");

server.listen(3000, () => {
  console.log("Alive and well!")
});

let gameManager = new GameManager(io)

io.on('connection', socket => {
  let syncIdentification;
  socket.send('Hello!');

  socket.on('getGameInfo', function(syncId) {
    syncIdentification = syncId;
    let reply = gameManager.findSync(syncId);

    if(reply){
      var secure_custom_game_obj = {
        players: reply.players,
        syncId: reply.syncId,
        gameStage: reply.gameStage,
        name: reply.voiceChannel.name
      }

      socket.emit('returnGameInfo', secure_custom_game_obj);
    }
  });

  socket.on("killPlayer", function(data) {
    gameManager.findSync(data.syncId).kill(data.colour);
  });

  socket.on("revivePlayer", function(data) {
    gameManager.findSync(data.syncId).revive(data.colour);
  });

  socket.on('endGame', function() {
    gameManager.endGame(syncIdentification)
    socket.disconnect();
  });
});

client.on('message', message => {
  if (message.author.id === client.user.id) return
  if (message.channel.type !== 'text') return
  if (message.author.bot) return

  let msg = message.content.split(' ');

  if(msg[0].startsWith('am.')){
    msg[0] = msg[0].substr(3);

    if(msg[0] === 'start' || msg[0] === 'begin'|| msg[0] === 'game_start' || msg[0] == 'newgame'){
      if(message.member.voice.channel) {
        gameManager.newGame(message.member.voice.channel, message.channel);
  
        message.channel.send(`Game Created in **${message.member.voice.channel.name}**`);
        let game = gameManager.findGame(message.member.voice.channel);
        let game_url = `http://localhost:3000?game=${game.syncId}`;

        const RichEmbed = new Discord.MessageEmbed()
            .setColor('#ffde2a')
            .setTitle('Among Us Manager Sync')
            .setDescription(`I saw ${PlayerColours[12 * Math.random() << 0]} vent... Kind of sus \n`)
            .setURL(game_url)

            .addFields(
              // { name: 'URL', value: `[${game.syncId}](${game_url})` },
              // { name: '\u200B', value: '\u200B' },
              { name: 'Player Count', value: game.players.length, inline: true },
              { name: 'Game Stage', value: game.gameStage, inline: true },
            )

            //.setURL('https://amongus_manager.io/') //?game=', game.syncId)
            .setAuthor('Among Us Manager', 'https://is4-ssl.mzstatic.com/image/thumb/Purple124/v4/a6/22/96/a622969c-baa8-7151-fb18-5f67e456c0aa/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/246x0w.png')

        message.reply(RichEmbed);
      }else{
        message.reply("To run this command, you must be in a voice channel.");
      }
    }
  
    if(msg[0] === 'join'){
      let joining_game = gameManager.findGame(message.member.voice.channel);
      
      if(joining_game && !PlayerColours[msg[1]] && msg[1]){
        joining_game.addPlayer(message.member, msg[1])
        message.reply(`Yay! You were successfully added to the game as \`${msg[1]}\``);
      }else if(!PlayerColours[msg[1]]){
        message.reply(`:thinking: Please enter a valid colour...`);
      }else if(joining_game){
        message.reply(`:thinking: We don't know of any ${msg[1]} impostors... Maybe try contacting the server admin if this is an issue`);
      }else{
        message.reply(`:thinking: Try providing a colour, like \`am.join cyan\``);
      }
    }
  }
});

client.on("ready", () => {
  console.log("Ready!");

  client.user.setPresence({
      status: "online",  // You can show online, idle... Do not disturb is dnd
      game: {
          name: "!help",  // The message shown
          type: "PLAYING" // PLAYING, WATCHING, LISTENING, STREAMING,
      }
  });
});

client.login(TOKEN);