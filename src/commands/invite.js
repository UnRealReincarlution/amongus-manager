const Discord = require('discord.js');

module.exports = {
    name: 'invite',
    desc: 'Returns the invite link for this bot',
    execute(message, args, gameManager, URL) {
        const invite = `https://discord.com/oauth2/authorize?client_id=758253543521648661&scope=bot&permissions=248736832`
        
        const RichEmbed = new Discord.MessageEmbed()
            .setColor('#ffde2a')
            .setTitle('Among Us Manager Invite Link')
            .setDescription(`Click the above link or [here](${invite}) to invite this bot to another server.`)
            .setURL(invite)

            //.setURL('https://amongus_manager.io/') //?game=', game.syncId)
            .setAuthor('Among Us Manager', 'https://is4-ssl.mzstatic.com/image/thumb/Purple124/v4/a6/22/96/a622969c-baa8-7151-fb18-5f67e456c0aa/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/246x0w.png')

        message.reply(RichEmbed);

        
    }
}