const PlayerColours = require('./player_colours.js')

class Player {
    constructor (member, colour) {
        this.member = member;
        this.colour = colour.toLowerCase();
        this.alive  = true;
        this.name   = member.displayName;
    }

    setState (state) {
        this.alive = state;
    }

    setColor (colour) {
        if (!PlayerColours[color]) throw Error('Invalid player color')
        this.colour = colour.toLowerCase();
    }
}

module.exports = Player