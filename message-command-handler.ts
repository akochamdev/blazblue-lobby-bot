import { Client, Collection, Events } from "discord.js";
import { Command, CommandType } from "./models/types";
import fs from "fs";
import MessageBuilder from "./message-builder";
import CommandHandler from "./command-handler";
import {appSettings} from "./app-settings";

class MessageCommandHandler extends CommandHandler {
    private static _instance: MessageCommandHandler;
    private _commands: Collection<string, Command>;
    private _client: Client;

    public static getInstance() {
        if (!MessageCommandHandler._instance) {
            MessageCommandHandler._instance = new MessageCommandHandler();
        }

        return MessageCommandHandler._instance;
    }

    public setup(client: Client, commandDirectory: string) {
        this._client = client;
        this._commands = new Collection<string, Command>();

        const commandFiles = fs.readdirSync(`${__dirname}/${commandDirectory}`)
            .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of commandFiles) {
            const command: Command = require(`${__dirname}/${commandDirectory}/${file}`).default;
            if (command.type === CommandType.MESSAGE
                || command.type === CommandType.BOTH) {
                this._commands.set(command.name, command);
            }
        }

        this._client.on(Events.MessageCreate, async (message) => {
            try {
                if (message.author.bot) {
                    return;
                }

                if (!message.content) {
                    return;
                }

                const joinLobbyRegEx = new RegExp(`steam://joinlobby/${appSettings.blazblueId}/\\d+/\\d+`);
                const matches = message.content.match(joinLobbyRegEx);

                if (!matches || matches.length < 1) {
                    return;
                }

                // TODO: Implement when lobby command is implemented

                // const command = this._commands.get("lobby");
                //
                // const reply = command?.execute({
                //     message: message,
                //     channel: message.channel,
                //     guild: message.guild,
                //     member: message.member,
                //     settings: appSettings,
                //     args: finalArgs
                // });
                //
                // if (reply) {
                //     await this.handleReply(reply, message);
                // }
            } catch (error) {
                console.error(error);
                await this.handleReply(
                    { embeds: [MessageBuilder.errorEmbed()] },
                    message
                );
            }
        });
    }
}

export default MessageCommandHandler;
