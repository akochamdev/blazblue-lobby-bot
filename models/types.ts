import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Guild,
    GuildMember,
    Message,
    SelectMenuBuilder,
    TextBasedChannel
} from "discord.js";

// Command Types
export interface Command {
    name: string;
    description: string;
    type: CommandType;
    slashDef: any;
    requiredPermissions?: bigint[]; // TODO: Delete?
    deferReply?: boolean | ((args: string[]) => boolean);
    formatArgs?(data: FormatArgsData): FormatResult;
    execute(data: CommandData): CommandResult | undefined;
}

export interface CommandData {
    message?: Message | null;
    interaction?: ChatInputCommandInteraction | null;
    channel?: TextBasedChannel | null;
    guild?: Guild | null;
    member?: GuildMember | null;
    settings: AppSettings;
    args: string[];
}

export interface CommandResult {
    content?: string;
    embeds?: EmbedBuilder[];
    components?: ActionRowBuilder<SelectMenuBuilder | ButtonBuilder>[],
    ephemeral?: boolean
}

export enum CommandType {
    MESSAGE,
    SLASH,
    BOTH
}

export enum EmbedColors {
    Normal = 0x187ae7,
    Error = 0xcc2024,
    Success = 0x4cbb17
}

export enum ErrorType {
    INVALID_ARGS,
    INVALID_INTERACTION
}

export interface FormatArgsData {
    args: string[],
    message?: Message | null;
    interaction?: ChatInputCommandInteraction | null;
}

export interface FormatError {
    type: ErrorType;
    command: string;
}

export interface FormatResult {
    error?: FormatError;
    args?: string[];
}

// Settings
export interface AppSettings {
    commandDirectory: string;
    blazblueId: string;
}
