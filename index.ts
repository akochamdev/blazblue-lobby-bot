import { ActivityType, Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { appSettings } from "./app-settings";
import SlashCommandHandler from "./slash-command-handler";
import MessageCommandHandler from "./message-command-handler";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Discord events
client.once(Events.ClientReady, () => {
    console.log("Blazblue Lobby Bot is ready.");
    client.user?.setPresence({status: "online", activities: [{name: `/lobby`, type: ActivityType.Listening}]});

    SlashCommandHandler.getInstance().setup(client, appSettings.commandDirectory);
    MessageCommandHandler.getInstance().setup(client, appSettings.commandDirectory);
});

client.on(Events.Error, (error) => {
    console.error(`Received discord client error: `, error);
});

client.login(process.env.TOKEN).then(() => {
    console.log("Blazblue Lobby Bot is logged in.");
});
