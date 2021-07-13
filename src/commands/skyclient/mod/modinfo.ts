import axios from "axios";
import { MessageEmbed, TextChannel } from "discord.js";
import prettyBytes from "pretty-bytes";
import { BotCommand } from "../../../extensions/BotCommand";
import commandManager from "../../../functions/commandManager";

import importUtils from '../../../functions/utils'
const utils = importUtils

export default class modInfo extends BotCommand {
    constructor() {
        super("modInfo", {
            aliases: ["mod", "modinfo"],
            args: [{ id: 'mod', type: 'string' }],

            slash: true,
            slashOptions: [
                { name: 'mod', description: 'The mod ID that you want to get info on', type: 'STRING' },
                { name: 'ephemeral', description: 'Whether or not you want the output to be ephemeral', type: 'BOOLEAN', required: false }
            ],
            slashGuilds: utils.slashGuilds,
            description: 'Shows information on a specific mod from SkyClient'
        })
    }

    async exec(message, args) {
        if (utils.SkyClientGuilds.includes(message.guild.id)) {
            if (!args.mod) { return message.reply('let me just telepathically get the mod you want info on from you... oh wait i can\'t') }

            const mods = await (await axios.get("https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/mods.json")).data

            const mod = mods.find(e => e.display && e.display !== "no" && args.mod.toLowerCase() == e.id.toLowerCase() || e.nicknames && e.nicknames.includes(args.mod.toLowerCase()))

            if (!mod) {
                const errEmbed = new MessageEmbed()
                    .setTitle('Invalid ID')
                    .setURL('https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/mods.json')
                    .setDescription(`There doesn't seem to be a mod in our repo with the ID \`${args.mod}\`.\nTry again with a new ID, or browse the repository by clicking the title of this embed.`)
                    .setColor('#ff0000')
                return message.reply({ embeds: [errEmbed] })
            }

            let { display: name, description, url, icon, creator, command, file } = mod

            const modInfoEmbed = new MessageEmbed()
                .setColor(message.member.displayColor)
                .setTitle(name)
                .setThumbnail(`https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/icons/${encodeURIComponent(icon)}`)
                .setFooter(`Created by ${creator}`)
                .addField('Description', description)
            if (command) {
                modInfoEmbed.addField("Main Command", `\`${command}\``)
            }

            if (url) {
                if (url == 'https://optifine.net/download?f=OptiFine_1.8.9_HD_U_M5.jar') {
                    modInfoEmbed.addField('Direct Download', 'Would be here, but I don\'t want to get into legal issues with SP, so go find it yourself.')
                }
            }
            else {
                url = `https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/mods/${encodeURIComponent(mod.file)}?raw=true`
            }
            modInfoEmbed.addField('Direct Download', `[${file}](${url})`)
            let size = parseInt((await axios.get(url)).headers['content-length'], 10)
            if (size) {
                modInfoEmbed.addField('Size', `${prettyBytes(size)}`)
            }

            const embed = modInfoEmbed

            if (args.mod.toLowerCase() == 'hael9') {
                embed
                    .setTitle('hael9')
                    .setColor(message.member.displayColor)
                    .setThumbnail('https://cdn.discordapp.com/attachments/803808795699839007/843568575850872892/pobrane.jpg')
                    .setDescription('hael9 lets you automatically complete F7 terminals, with no effort! It just does them for you!')
                    .addField('Direct Download', '[Click Here!](https://github.com/Zordlan/rickrollmod/blob/main/hael9.jar?raw=true)')
            }

            if (commandManager.userCanUseCommand(message) == false && message.interaction) {
                message.interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else if (message.interaction && commandManager.userCanUseCommand(message) == true && args.ephemeral == true) {
                message.interaction.reply({ embeds: [embed], ephemeral: true })
            }
            else if (message.interaction && commandManager.userCanUseCommand(message) == true && !args.ephemeral) {
                message.interaction.reply({ embeds: [embed] })
            }
            else if (!message.interaction && commandManager.userCanUseCommand(message) == true) {
                if (message.type == 'REPLY') {
                    if (message.channel.type == 'text') {
                        const repliedMessage = await message.channel.messages.fetch(message.reference.messageID)
                        repliedMessage.util.reply({ embeds: [embed], allowedMentions: { repliedUser: true } })
                    }
                }
                else {
                    message.util.reply({ embeds: [embed] })
                }
            }
            else if (!message.interaction && commandManager.userCanUseCommand(message) == false) {
                message.util.reply('Please use this as a slashcommand (make sure you\'re using the right bot - fire has a `/mod` slashcommand also) if you want to use it in this channel.')
            }
        }
    }
}
