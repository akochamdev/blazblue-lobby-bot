import {
    CommandInteraction,
    Message,
    InteractionReplyOptions,
    MessageReplyOptions
} from "discord.js";
import { CommandResult } from "./models/types";
import MessageBuilder from "./message-builder";

class CommandHandler {

    protected handleReply = async (
        reply: CommandResult,
        message: Message | CommandInteraction
    ) => {
        const options = this.getReplyOptions(reply);

        await message.reply(options);
    }

    protected handleFollowUp = async (
        reply: CommandResult,
        message: CommandInteraction
    ) => {
        const options = this.getReplyOptions(reply);

        await message.followUp(options);
    }

    private getReplyOptions = (
        reply: CommandResult
    ): InteractionReplyOptions & MessageReplyOptions => {
        const ephemeral = reply.ephemeral || false;
        let options: InteractionReplyOptions & MessageReplyOptions = {
            ephemeral: ephemeral,
            embeds: [],
            components: []
        };

        if (!reply || (!reply.content && reply.embeds?.length == 0 && reply.components?.length === 0)) {
            console.error("Received no reply");
            return {
                ephemeral: ephemeral,
                embeds: [MessageBuilder.errorEmbed("Could not complete command.")]
            }
        }

        // @ts-ignore
        options = {
            content: reply.content || "",
            embeds: reply.embeds || [],
            components: reply.components || [],
            ephemeral
        }

        return options;
    }
}

export default CommandHandler;
