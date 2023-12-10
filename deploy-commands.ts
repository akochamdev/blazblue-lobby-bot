import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import dotenv from "dotenv";
import fs from "fs";
import { Command } from "./models/types";

/**
 * This script reloads all guild and global slash commands
 * defined in the app (inside the commands folder). It is
 * not part of the bot logic itself and is meant to be run
 * independently whenever a slash command is added or is
 * changed.
 * Run using "ts-node deploy-commands.ts"
 */
dotenv.config();

const clientId = process.env.CLIENT_ID || "";

const commandFiles = fs.readdirSync(`${__dirname}/commands`)
    .filter(file => file.endsWith(".ts"));

const commands = commandFiles.map(file => {
    const command: Command = require(`./commands/${file}`).default;
    return command.slashDef.toJSON();
});

if (process.env.TOKEN) {
    const rest = new REST({version: "9"}).setToken(process.env.TOKEN);
    (async () => {
        try {
            if (commands.length > 0) {
                console.log(`Started (/) commands (${commands.length}).`);
                await rest.put(
                    Routes.applicationCommands(clientId),
                    {body: commands}
                );
                console.log(`Successfully reloaded (/) commands.`);
            }
        } catch (error) {
            console.error(error);
        }
    })();
}
