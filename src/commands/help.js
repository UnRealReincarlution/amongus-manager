const Commands = require('../commands.js');

module.exports = {
    name: 'help',
    desc: 'Sends a list of all the commands',
    execute(message, args) {
        message.channel.send("The folowing is all the commands that you can use.");
      
        Commands.forEach(element => {
            message.channel.send(`\`am.${element.command}\` ${element.desc} `);
        });
    }
}