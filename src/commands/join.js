const PlayerColours = require("../player_colours.js");

module.exports = {
    name: 'join',
    desc: 'Allows a user, to join a game \`depreciated\`',
    execute(message, args, gameManager) {
        let joining_game = gameManager.findGame(message.member.voice.channel);
        
        if(!joining_game) {
            message.reply(`:thinking: No games exist in this server. Maybe try contacting the server admin if you believe this is an issue`);
            return;
        }

        if(!args[1]) {
            message.reply(`:thinking: Try providing a colour, like \`am.join cyan\``);
            return;
        }

        if(!this.colourExists(args[1])){
            message.reply(`:thinking: Please enter a valid colour...`);
            return;
        }

        if(joining_game.getPlayer(message.member)){
            message.reply(`You are already in this game...`);
            return;
        }

        joining_game.addPlayer(message.member, args[1].trim())
        message.channel.send(`You were successfully added to the game as \`${args[1]}\``);
    },
    colourExists(input){
        let return_value = false;
        Object.keys(PlayerColours).forEach(function(key) {
            if (PlayerColours[key].toString() == input.toString()) {
            return_value =  true;
            }
        });
        
        return return_value;
    }
}