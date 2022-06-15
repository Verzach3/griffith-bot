import WAWebJS, { Client } from "whatsapp-web.js";

export default interface Command {
    name: string;
    description: string;
    usage: string;
    aliases: string[];
    category: string;
    ownerOnly: boolean;
    args: boolean;
    execute(message: WAWebJS.Message, client: Client, args?: string[]): void;
}