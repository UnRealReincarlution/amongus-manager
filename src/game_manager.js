const Game = require('./game.js')

class GameManager {
    constructor(io) {
        this.io = io
        this.games = new Map();
    }

    newGame(voiceChannel, textChannel) {
        this.games.set(voiceChannel.id, new Game(voiceChannel, textChannel, this));
        console.log(`Created Game id ${voiceChannel.id} in ${voiceChannel.guild} for ${voiceChannel.name} chat.`)
    }

    endGame(syncId) {
        let game = this.findSync(syncId);
            game.setAll(true);
            game.updatePlayerMute();

        game.textChannel.send(`Game Ended in **${game.voiceChannel.name}**`);

        console.log(`Deleted Game id ${game.voiceChannel.id} in ${game.voiceChannel.guild} for ${game.voiceChannel.name} chat.`);
        this.games.delete(game.voiceChannel.id);
    }

    findGame(voiceChannel) {
        return this.games.get(voiceChannel.id) || null;
    }

    findSync(syncId) {
        let return_val;

        this.games.forEach(element => {
            if(element.syncId == syncId) {
                return_val = element;
            }
        });

        return return_val;
    }
}

module.exports = GameManager;