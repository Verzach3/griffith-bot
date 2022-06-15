import { writeFile } from "fs/promises";
import * as nanoid from "nanoid";
import WAWebJS, { Client, MessageMedia } from "whatsapp-web.js";
import ff from "fluent-ffmpeg";
import sharp from "sharp";
import { statSync, writeFileSync } from "fs";

export default async function stickerGenerator(
message: WAWebJS.Message,
  client: Client
): Promise<void> {
  if (
    message.type !== WAWebJS.MessageTypes.IMAGE &&
    message.type !== WAWebJS.MessageTypes.VIDEO &&
    !message.hasQuotedMsg
  ) {
    message.reply("Solo se pueden generar stickers de imagenes y videos");
    return;
  }

  let attachment;
  let extension = "";
  let filename = nanoid.nanoid();
  if (
    message.type === WAWebJS.MessageTypes.IMAGE ||
    message.type === WAWebJS.MessageTypes.VIDEO
  ) {
    attachment = await message.downloadMedia();
    extension = message.type === WAWebJS.MessageTypes.IMAGE ? ".jpeg" : ".mp4";
  }
  if (message.hasQuotedMsg) {
    const quotedMessage = await message.getQuotedMessage();
    attachment = await quotedMessage.downloadMedia();
    extension =
      quotedMessage.type === WAWebJS.MessageTypes.IMAGE ? ".jpeg" : ".mp4";
  }
  if (attachment === undefined) {
    message.reply("No se pudo obtener el archivo");
    return;
  }

  writeFileSync(`./media/${filename}${extension}`, Buffer.from(attachment.data, "base64"));
  await message.reply(`Empezando a generar el sticker...`);

  if (extension === ".mp4") {
    console.log("Generando sticker de video");
    await new Promise((resolve, reject) => {
      ff(`./media/${filename}${extension}`)
        .on("error", reject)
        .on("end", () => resolve(true))
        .addOutputOptions([
          `-vcodec`,
          `libwebp`,
          `-vf`,
          `scale=512:512:force_original_aspect_ratio=increase,fps=15,crop=512:512`,
        ])
        .toFormat("webp")
        .save(`./media/${filename}.webp`);
    });
  }
  console.log("Generando sticker de imagen");
  await sharp(`./media/${filename}${extension === ".jpeg" ? extension : ".webp"}`, {
    animated: true,
  })
    .resize({ width: 512, height: 512 })
    .webp({ quality: extension === ".jpeg" ? 100 : 80 })
    .toFile(`./media/${filename}-1.webp`);
  if (statSync(`./media/${filename}-1.webp`).size > 1000000) {
    message.reply(
      "Stiker demasiado grande, intenta con una imagen/video mas pequeña o corto"
    );
    return;
  }

  const sticker = MessageMedia.fromFilePath(`./media/${filename}-1.webp`);
  client.sendMessage(message.from, sticker, {
    media: sticker,
    sendMediaAsSticker: true
  });
}
