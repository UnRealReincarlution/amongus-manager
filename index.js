"use strict";

//const URL = '128.199.234.165:3000';
const URL = 'localhost:3000';

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./src/commands/${file}`);
	client.commands.set(command.name, command);
}

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')));

const GameManager = require("./src/game_manager.js");
const Token = require('./token.js');

const CONFIG = new Token();

server.listen(3000, () => {
  console.log("Server Alive and Well!")
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

  if(message.content.startsWith(CONFIG.prefix)){
    msg[0] = msg[0].substr(3);

    if(!client.commands.get(msg[0])) {
      message.reply(`That command does not exist. Try using ${CONFIG.prefix}help`);
    }

    if(msg[0] == 'help') {
      message.channel.send(`You can use the folowing commands in this server...`);

      client.commands.forEach(element => {
        message.channel.send(`\`${CONFIG.prefix}${element.name}\` ${element.desc}`);
      });

      return;
    }
    
    client.commands.get(msg[0]).execute(message, msg, gameManager, URL);
  }
});

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
  if(newMember){
    let player = gameManager.findUserInGame(newMember.id);

    if(player){
      player.member = newMember;
      player.name = newMember.nickname;

      gameManager.findSync(player.parent).updatePlayerBase();
    }
  }
});

client.on("ready", () => {
  console.log("Client Ready!");

  client.user.setPresence({
      status: "online", 
      activity: {
          name: `${client.guilds.cache.size} ${(client.guilds.cache.size > 1) ? 'Servers' : 'Server'}`, 
          type: "WATCHING" // PLAYING, WATCHING, LISTENING, STREAMING
      }
  });
});

client.login(CONFIG.token);