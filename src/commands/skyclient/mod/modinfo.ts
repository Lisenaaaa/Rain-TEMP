import axios from "axios";
import { MessageEmbed, TextChannel } from "discord.js";
import { BotCommand } from "../../../extensions/BotCommand";
import commandManager from "../../../functions/commandManager";
import fs from 'fs'

import utils from '../../../functions/utils'
import msgutils from "../../../functions/msgutils";
import skyclientutils from "../../../functions/skyclientutils";

export default class modInfo extends BotCommand {
    constructor() {
        super("modInfo", {
            aliases: ["mod", "modinfo"],
            args: [{ id: 'mod', type: 'string' }],

            slash: true,
            slashOptions: [
                { name: 'mod', description: 'The mod ID that you want to get info on', type: 'STRING' },
            ],
            slashGuilds: utils.slashGuilds,
            description: 'Shows information on a specific mod from SkyClient'
        })
    }

    async exec(message, args) {
        let modJson
        // if (msgutils.useLocalRepo) { modJson = JSON.parse(fs.readFileSync('SkyblockClient-REPO/files/mods.json', 'utf-8')) }
        // else { modJson = await (await axios.get("https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/mods.json")).data }

        modJson = await skyclientutils.getRepo('mods.json')

        let mod
        try {

            mod = modJson.find(mod => mod.id == args.mod && mod.display != 'no' || mod.nicknames && mod.nicknames.includes(args.mod) && mod.display != 'no')

            const modEmbed = new MessageEmbed()
            .setTitle(mod.display)
            .setDescription(mod.description)
            if (mod.command) modEmbed.addField('Command', mod.command)
            if (mod.url && mod.id != 'optifine') modEmbed.addField('Direct Download', `[${mod.file}](${mod.url})`)
            else if (!mod.url && mod.id != 'optifine') modEmbed.addField('Direct Download', `[${mod.file}](https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/mods/${encodeURIComponent(mod.file)}?raw=true)`)

            if (message.member && message.member.displayColor) modEmbed.setColor(message.member.displayColor)
            else if (!message.member.displayColor && message.guild.me.displayColor) modEmbed.setColor(message.guild.me.displayColor)
            else if (!message.member) modEmbed.setColor('#fd87d2')

            if (mod.icon) modEmbed.setThumbnail(`https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/icons/${encodeURIComponent(mod.icon)}`)

            if (mod.creator) modEmbed.setFooter(`Created by ${mod.creator}`)

            msgutils.reply(message, { embeds: [modEmbed] })
        } catch {
            
            const modEmbedError = new MessageEmbed()
            .setTitle("Invalid ID")
            .setDescription(`There doesn't seem to be a mod in our repo with the ID \`${args.mod}\`.\nTry again with a new ID, or browse the repository by clicking the title of this embed.`)
            
        }
    }
}
