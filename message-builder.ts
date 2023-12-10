import { EmbedBuilder } from "discord.js";
import { EmbedColors } from "./models/types";

class MessageBuilder {
    public static messageEmbed(content: string, title?: string, color?: EmbedColors) {
        let embed = new EmbedBuilder()
            .setDescription(content);

        if (title) {
            embed = embed.setTitle(title);
        }

        if (color) {
            embed = embed.setColor(color);
        }

        return embed;
    }

    public static successEmbed(successMessage: string): EmbedBuilder {
        return this.messageEmbed(
            `✅ ${successMessage}`,
            undefined,
            EmbedColors.Success
        );
    }

    public static errorEmbed(errorMessage?: string, log = true): EmbedBuilder {
        const description = errorMessage || "An unknown error occurred 😢";
        if (log) {
            console.error(description);
        }

        return this.messageEmbed(
            `❌ ${description}`,
            undefined,
            EmbedColors.Error
        );
    }
}

export default  MessageBuilder;