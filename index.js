"use strict";
//const URL = '128.199.234.165:3000';
const URL = 'localhost:3000';

const Discord = require('discord.js');
const client = new Discord.Client();

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

const GameManager = require("./src/game_manager.js");
const PlayerColours = require("./src/player_colours.js");
const Token = require('./token.js');
const TOKEN = new Token().token;

server.listen(3000, () => {
  console.log("Alive and well!")
});

let gameManager = new GameManager(io)
let syncIdentification;

io.on('connection', (socket) => {
  socket.on('getGameInfo', async (syncId) => {
    await socket.join(syncId);

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
    }else{
      socket.emit('returnGameInfo', null);
    }
  });

  socket.on("killPlayer", function(data) {
    gameManager.findSync(data.syncId).kill(data.colour);
  });

  socket.on("revivePlayer", function(data) {
    gameManager.findSync(data.syncId).revive(data.colour);
  });

  socket.on('endGame', function() {
    gameManager.endGame(syncIdentification);

    socket.disconnect();
  });

  socket.on("setStage", function(data) {
    gameManager.findSync(data.syncId).setStage(data.stage);
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
              .setDescription(`I saw ${randomColour()} vent... Kind of sus \n`)
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
    }
  
    if(msg[0] === 'join'){
      let joining_game = gameManager.findGame(message.member.voice.channel);
      
      if(joining_game && colourExists(msg[1].trim()) && msg[1] && !joining_game.getPlayer(message.member)){
        joining_game.addPlayer(message.member, msg[1].trim())
        message.channel.send(`You were successfully added to the game as \`${msg[1]}\``);
      }else if(!colourExists(msg[1])){
        message.reply(`:thinking: Please enter a valid colour...`);
      }else if(joining_game.getPlayer(message.member)){
        message.reply(`You are already in this game...`);
      }else if(!joining_game){
        message.reply(`:thinking: No games exist in this server. Maybe try contacting the server admin if you believe this is an issue`);
      }else{
        message.reply(`:thinking: Try providing a colour, like \`am.join cyan\``);
      }
    }
  }
});

function colourExists(input){
  let return_value = false;
  Object.keys(PlayerColours).forEach(function(key) {
    if (PlayerColours[key].toString() == input.toString()) {
      return_value =  true;
    }
  });

  return return_value;
}

function randomColour() {
  let return_value = '';
  let random = Math.floor(Math.random() * 12);

  Object.keys(PlayerColours).forEach((key, index) => {
    if (index == random) {
      return_value = PlayerColours[key];
    }
  });

  return return_value;
}

client.on("voiceStateUpdate", function(oldMember, newMember) {
  let newUserChannel = newMember.channel;
  let oldUserChannel = oldMember.channel;

  let game_find = (newUserChannel) ? newUserChannel : oldUserChannel;

  if(game_find){
    let game = gameManager.findGame(game_find);

    if(!oldUserChannel && game) {
      game.addPlayer(newMember.member, game.generateColour());
    }else if(!newUserChannel && game){
      game.removePlayer(oldMember.member);
    }
  }
});

client.on("guildMemberUpdate", function(oldMember, newMember) {
  let player = gameManager.findUserInGame(newMember.id);
      player.member = newMember;
      player.name = newMember.nickname;

  gameManager.findSync(player.parent).updatePlayerBase();
});

client.on("ready", () => {
  console.log("Ready!");

  client.user.setPresence({
      status: "online", 
      activity: {
          name: `${client.guilds.cache.size} ${(client.guilds.cache.size > 1) ? 'Servers' : 'Server'}`, 
          type: "WATCHING" // PLAYING, WATCHING, LISTENING, STREAMING
      }
  });
});

client.login(TOKEN);