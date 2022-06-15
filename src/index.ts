import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { commands } from "./commands";
import { mkdirSync } from "fs";

try{
  mkdirSync("./media")
} catch (e){
  console.log("Ya existe la carpeta media", e)
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
  },
});

client.initialize();

client.on("qr", (qr) => {
  console.log(qr)
  qrcode.generate(qr, {small: true});
});

client.on("authenticated", () => {
  console.log("authenticated");
});

client.on("auth_failure", (msg) => {
  console.log("auth_failure", msg);
});

client.on("ready", () => {
  console.log("Bot ready");
});

client.on("message", (msg) => {
  if (msg.body.startsWith("!") === false) {
    console.log(msg.body);
    return;
  }
  const commandmsg = msg.body.split(" ")[0].substring(1);
  const args = msg.body.split(" ").slice(1);
  for (const command of commands){
    if (command.name === commandmsg || command.aliases.includes(commandmsg)){
      // if (command.ownerOnly && !msg.isOwner){
      //   msg.reply("No tienes permisos para ejecutar este comando");
      //   return;
      // }
      command.execute(msg, client, args);
      return;
    }
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});
