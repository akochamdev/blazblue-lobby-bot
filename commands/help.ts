import { Command, CommandResult, CommandType } from "../models/types";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIEmbedField, EmbedBuilder } from "discord.js";
import fs from "fs";

const name = "help";
const description = "Shows a list of available commands.";

export default {
    name: name,
    description: description,
    type: CommandType.BOTH,
    deferReply: true,
    slashDef: new SlashCommandBuilder()
        .setName(name)
        .setDescription(description),
    execute: (): CommandResult | undefined => {
        const commandFiles = fs.readdirSync(`${__dirname}`)
            .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        const fields: APIEmbedField[] = commandFiles.map((file) => {
            const command: Command = require(`./${file}`).default;
            return { name: `/${command.name}`, value: command.description, inline: true}
        });

        const embed = new EmbedBuilder()
            .setTitle("Commands")
            .addFields(fields);

        return {
            embeds: [embed]
        };
    }
} as Command;
