import { Collection } from "discord.js";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, Command>
    }

    export interface Command extends ApplicationCommand {
        execute: (interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction) => any;
    }
}