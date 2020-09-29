module.exports = [
    {
        command: 'start',
        desc: 'The user who calls this function becomes the host for the game, it initialises the game and sends a sync link'
    },

    {
        command: 'join <colour>',
        desc: 'As long as the user is not in the game, it joins the user (Non-VC player) with the corrosponding colour, given it is not taken.'
    },

    {
        command: 'help',
        desc: 'Brings up this menu.'
    }
]
