import axios from "axios";
import { Command } from "discord-akairo";
import { MessageEmbed } from "discord.js";
import prettyBytes from "pretty-bytes";
import { BotCommand } from "../../../extensions/BotCommand";

export default class modinfo extends BotCommand {
    constructor() {
        super("modinfo", {
            aliases: ["mod", "modinfo"],
            args: [
                {
                    id: 'mod',
                    type: 'string'
                }
            ]
        });
    }

    async exec(message, args) {
        const mods = await (await axios.get("https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/mods.json")).data;

        const mod = mods.find(e => e.display && e.display !== "no" && args.mod === e.id);

        if (!mod) {
            const errEmbed = new MessageEmbed()
                .setTitle('Invalid ID')
                .setURL('https://github.com/nacrt/SkyblockClient-REPO/blob/main/files/mods.json')
                .setDescription(`There doesn't seem to be a mod in our repo with the ID \`${args.mod}\`.\nTry again with a new ID, or browse the repository by clicking the title of this embed.`)
                .setColor('#ff0000')
            return message.channel.send(errEmbed);
        }

        const { display: name, description, url, icon, creator, command } = mod;

        const modinfoembed = new MessageEmbed()
            .setColor('#9c25c4')
            .setTitle(name)
            .setThumbnail(`https://raw.githubusercontent.com/nacrt/SkyblockClient-REPO/main/files/icons/${encodeURIComponent(icon)}`)
            .setFooter(`Created by ${creator}`)
            .addField("Description", description)
        if (command) {
            modinfoembed.addField("Main Command", `\`${command}\``);
        }

        if (url) {
            if (url == 'https://optifine.net/download?f=OptiFine_1.8.9_HD_U_M5.jar') {
                modinfoembed.addField(`Direct Download`, `Would be here, but I don't want to get into legal issues with SP, so go find it yourself.`)
            } else {
                modinfoembed.addField("Direct Download", `[Click here!](${url})`);
            }
            let size = parseInt((await axios.head(url)).headers["content-length"], 10);
            if (size) {
                modinfoembed.addField("Size", `${prettyBytes(size)}`);
            }
        }
        return message.channel.send(modinfoembed);
    }
}
