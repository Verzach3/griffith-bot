import WAWebJS, { Client, GroupChat } from "whatsapp-web.js";
import Command from "../interfaces/Command";
import stickerGenerator from "./stickerGenerator";
import ytDownloader from "./ytDownloader";
import Mexp from "math-expression-evaluator"

export const commands: Command[] = [
  // Ping
  {
    name: "ping2",
    description:
      "Responde pong (es solo para probar que el bot esta funcionando)",
    usage: "ping2",
    aliases: ["pong2", "ping2"],
    category: "general",
    ownerOnly: false,
    args: false,
    execute(message: WAWebJS.Message): void {
      message.reply("pong");
    },
  },
  // Help
  {
    name: "help",
    description: "Muestra una lista de comandos",
    usage: "help",
    aliases: ["ayuda", "commands", "comandos"],
    category: "general",
    ownerOnly: false,
    args: false,
    execute(message: WAWebJS.Message, client: Client): void {
      message.reply(
        "Lista de comandos: \n\n" +
          commands
            .filter((command) => command.category === "general")
            .map((command) => `!*${command.name}* - ${command.description}`)
            .join("\n\n")
      );

      // client.sendMessage(message.from,
      //   "Lista de comandos de administrador: \n\n" +
      //     commands
      //       .filter((command) => command.category === "admin")
      //       .map((command) => `!*${command.name}* - ${command.description}`)
      //       .join("\n\n")
      // );

      // client.sendMessage(message.from,
      //   "*Nota:* Los comandos de administrador tambien requieren que el bot tenga permisos de administrador"
      // );
    },
  },
  // Sticker 
  {
    name: "sticker",
    description: "Genera un sticker con la Imagen/Video enviado o mencionado",
    usage: "sticker",
    aliases: ["stickers", "stick", "sticker", "st"],
    category: "general",
    ownerOnly: false,
    args: false,
    execute(message: WAWebJS.Message, client: Client): void {
      stickerGenerator(message, client);
    }
},
  // YTDL
  {
    name: "ytdl",
    description: "Descarga un video de YouTube",
    usage: "ytdl <url>",
    aliases: ["youtube", "yt", "ytb", "ytb", "dl"],
    category: "general",
    ownerOnly: false,
    args: true,
    execute(message: WAWebJS.Message, client: Client): void {
      ytDownloader(message, client, message.body.split(" "));
    }
  },
  // Math
  {
    name: "math",
    description: "Realiza una operacion matematica",
    usage: "math <operacion>",
    aliases: ["matematica", "matematic", "math", "solve"],
    category: "general",
    ownerOnly: false,
    args: true,
    execute(message: WAWebJS.Message, client: Client): void {
      const result = Mexp.eval(message.body.split(" ").slice(1).join(" "));
      message.reply(result);
    }
  },
  // Report
  { 
    name: "report",
    description: "Reporta un error al desarrollador",
    usage: "report <error>",
    aliases: ["error", "bug", "bugreport", "bugreporte", "bugreporte"],
    category: "general",
    ownerOnly: false,
    args: true,
    execute(message: WAWebJS.Message, client: Client): void {
      client.sendMessage(message.from, "Reporte enviado");
      client.sendMessage("573135408570@s.whatsapp.net", `Reporte de error: ${message.body.split(" ").slice(1).join(" ")}`);
    }
  },
];
