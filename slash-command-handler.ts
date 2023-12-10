import { Client, Collection, Events, GuildMember } from "discord.js";
import { Command, CommandType } from "./models/types";
import fs from "fs";
import MessageBuilder from "./message-builder";
import CommandHandler from "./command-handler";
import { messages } from "./messages";
import { appSettings } from "./app-settings";

class SlashCommandHandler extends CommandHandler {
    private static _instance: SlashCommandHandler;
    private _commands: Collection<string, Command>;
    private _client: Client;

    public static getInstance() {
        if (!SlashCommandHandler._instance) {
            SlashCommandHandler._instance = new SlashCommandHandler();
        }

        return SlashCommandHandler._instance;
    }

    public setup(client: Client, commandDirectory: string) {
        this._client = client;
        this._commands = new Collection<string, Command>();

        const commandFiles = fs.readdirSync(`${__dirname}/${commandDirectory}`)
            .filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of commandFiles) {
            const command: Command = require(`${__dirname}/${commandDirectory}/${file}`).default;
            if (command.type === CommandType.SLASH
                || command.type === CommandType.BOTH) {
                this._commands.set(command.name, command);
            }
        }

        this._client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isCommand() || !interaction.isChatInputCommand()) {
                return;
            }

            let deferReply = false;

            try {
                const { commandName, options, member } = interaction;
                const command = this._commands.get(commandName);
                if (!command) {
                    await this.handleReply(
                        { embeds: [MessageBuilder.errorEmbed(messages.UNRECOGNIZED_COMMAND)] },
                        interaction
                    );
                    return;
                }

                if (command.requiredPermissions) {
                    try {
                        const guildMember = member as GuildMember;
                        if (!guildMember.permissions.has(command.requiredPermissions)) {
                            return this.handleReply(
                                {
                                    embeds: [MessageBuilder.errorEmbed(messages.INVALID_PERMISSIONS)],
                                    ephemeral: true
                                },
                                interaction
                            );
                        }
                    } catch (error) {
                        console.log(error);
                        return this.handleReply(
                            {
                                embeds: [MessageBuilder.errorEmbed(messages.INVALID_PERMISSIONS)],
                                ephemeral: true
                            },
                            interaction
                        );
                    }
                }

                let args: string[] = [];
                if (options.getSubcommand(false)) {
                    // This might potentially break for multiple nested
                    // sub commands but right now it works for subcommands
                    // a single level deep.
                    options.data.forEach(option => {
                        if (option.options) {
                            args = option.options.map(subOption => {
                                return String(subOption.value);
                            });
                        }
                    });
                } else {
                    args = options.data.map(option => {
                        return String(option.value);
                    });
                }

                let finalArgs = args;
                if (command.formatArgs) {
                    const formatResult = command.formatArgs({args, interaction});
                    if (formatResult.error) {
                        await this.handleReply(
                            { embeds: [MessageBuilder.errorEmbed(messages.INVALID_ARGS)] },
                            interaction
                        );
                        return;
                    }

                    finalArgs = formatResult?.args || args;
                }

                if (typeof command.deferReply === "function") {
                    deferReply = command.deferReply(args);
                } else {
                    deferReply = command.deferReply as boolean;
                }

                if (deferReply) {
                    await interaction.deferReply();
                }

                const reply = command?.execute({
                    interaction: interaction,
                    channel: interaction.channel,
                    guild: interaction.guild,
                    member: interaction.member as GuildMember,
                    settings: appSettings,
                    args: finalArgs
                });

                if (reply) {
                    if (deferReply) {
                        await this.handleFollowUp(reply, interaction);
                    } else {
                        await this.handleReply(reply, interaction);
                    }
                }
            } catch (error: any) {
                console.error(error);
                const errorMessage: string | undefined = error.name ?
                    "An unexpected error occurred." :
                    undefined;
                if (deferReply) {
                    await this.handleFollowUp(
                        { embeds: [MessageBuilder.errorEmbed(errorMessage)] },
                        interaction
                    );
                } else {
                    await this.handleReply(
                        { embeds: [MessageBuilder.errorEmbed(errorMessage)] },
                        interaction
                    );
                }
            }
        });
    }
}

export default SlashCommandHandler;
