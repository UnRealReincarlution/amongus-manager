const Player = require('./player.js')
const GameStates = require('./game_states.js')

class Game {
    constructor (voiceChannel, textChannel, manager) {
        this.manager = manager
        this.syncId = Math.random().toString(36).substring(2, 8).toUpperCase()
        this.voiceChannel = voiceChannel
        this.textChannel = textChannel
        this.gameStage = GameStates.LOBBY
        this.players = []
    }

    addPlayer(member, colour) {
        const player = new Player(member, colour)
        this.players.push(player)

        this.updatePlayerBase();
        this.updatePlayerMute(player);

        return player
    }

    removePlayer(member) {
        const player = this.getPlayer(member)
        this.players.splice(this.players.indexOf(player), 1)

        this.sendStateUpdate()
        this.updatePlayerMute(player)

        if (this.players.length === 0) {
            this.textChannel.send(`The game in **${this.voiceChannel.name}** has ended because there were no players left.`)
            this.manager.endGame(this.voiceChannel)
        }
    }

    getPlayer (member) {
        return this.players.find(p => p.member.user.id === member.user.id)
    }

    updatePlayerBase() {
        // Send Socket to room.
        var secure_custom_game_obj = {
            players: this.players,
            syncId: this.syncId,
            gameStage: this.gameStage,
            name: this.voiceChannel.name
        }

        this.manager.io.emit('updateGame', secure_custom_game_obj);
    }

    updatePlayerMute() {
        this.players.forEach(element => {
            if(this.gameStage == 'lobby'){
                //unmute
                console.log('Gamestage - Lobby: Unmuting');

            }else if(this.gameStage == 'discussion'){
                console.log('Gamestage - Discussion: Managing');
                if(element.alive) {
                    // unmute
                }else{
                    // mute
                }

            }else if(this.gameStage == 'tasks'){ 
                console.log('Gamestage - Tasks: Muting');

                // mute
            }else{
                throw console.error('invalid gamestage');
            }
        });
    }

    kill(player_colour) {
        console.log("Oh no...");

        this.players.forEach(element => {
            if(element.colour == player_colour){
                element.alive = false;

                this.updatePlayerMute();
                this.updatePlayerBase();
            }
        });
    }

    revive(player_colour) {
        console.log("DPS Mercy has arived...");

        this.players.forEach(element => {
            if(element.colour == player_colour){
                element.alive = true;

                this.updatePlayerMute();
                this.updatePlayerBase();
            }
        });
    }
}

module.exports = Game