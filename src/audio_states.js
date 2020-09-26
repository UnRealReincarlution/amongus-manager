const voiceStates = {
    lobby: {
        dead: { deaf: false, mute: false },
        alive: { deaf: false, mute: false }
    },
    discussion: {
        dead: { deaf: false, mute: true },
        alive: { deaf: false, mute: false }
    },
    tasks: {
        dead: { deaf: false, mute: false },
        alive: { deaf: true, mute: true }
    }
}

const voiceStatesNoDeafen = {
    lobby: {
        dead: { mute: false },
        alive: { mute: false }
    },
    discussion: {
        dead: { mute: true },
        alive: { mute: false }
    },
    tasks: {
        dead: { mute: true },
        alive: { mute: true }
    }
}

  
class AudioState {
    constructor(alive, gameState) {
        return voiceStates[gameState][alive ? 'alive' : 'dead'];
    }
}

module.exports = AudioState;