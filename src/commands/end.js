const Commands = require('../commands.js');

module.exports = {
    name: 'end',
    desc: 'Ends the game of the users voice channel',
    execute(message, args, gameManager) {
        if(!message.member.voice.channel) {
            message.reply("You are not in a voice channel.") 
            return;
        }

        if(!gameManager.findGame(message.member.voice.channel)) {
            message.reply("No game exists in your voice channel to end...");
            return;
        }
        
        gameManager.endGame(gameManager.findGame(message.member.voice.channel).syncId);
    }
}