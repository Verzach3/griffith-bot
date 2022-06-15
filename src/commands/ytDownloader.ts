import { createWriteStream } from "fs";
import { nanoid } from "nanoid";
import ff from "fluent-ffmpeg"
import WAWebJS, { Client, MessageMedia } from "whatsapp-web.js";
import Innertube from "youtubei.js";
import ytdl from "ytdl-core";
export default async function ytDownloader(
  message: WAWebJS.Message,
  client: Client,
  args: string[]
): Promise<void> {
  const filename = `./media/${nanoid()}`;
  console.log(args);
  if (args.length === 0) {
    message.reply("Debes ingresar una URL");
    return;
  }
  const url = args[2];
  if (ytdl.validateURL(url) === false) {
    message.reply("Debes ingresar una URL valida");
    return;
  }
  let videolenght: undefined | number = undefined;
  try {
    videolenght = parseInt(
      (await ytdl.getBasicInfo(url)).videoDetails.lengthSeconds
    );
  } catch (error) {
    message.reply("No se pudo obtener la duracion del video");
  }
  if (videolenght === undefined || Number.isNaN(videolenght)) {
    message.reply("No se pudo obtener la duracion del video");
    return;
  }
  if (videolenght > 900) {
    message.reply("El video es demasiado largo");
    return;
  }
  const youtube = await new Innertube();
  let stream;
  try {
    stream = youtube.download(ytdl.getVideoID(args[2]), {
      quality: "360p",
      format: "mp4",
    });
  } catch (error) {
    message.reply(
      "Error al descargar el video, esto es un error de YouTube, no del bot"
    );
    return;
  }
  stream.pipe(createWriteStream(filename + ".mp4"));

  stream.on("start", () => {
    message.reply("Descargando...");
  });

  stream.on("end", async () => {
    if (args[1] === "audio") {
      await new Promise((resolve, reject) => {
        ff(filename + ".mp4")
          .on("error", reject)
          .on("end", () => resolve(true))
          .addOutputOptions(["-b:a", "192K", "-vn"])
          .toFormat("mp3")
          .save(filename + ".mp3");
      });
    }
    const attachment = MessageMedia.fromFilePath(`${filename}${args[1] === "audio" ? ".mp3" : ".mp4"}`);
    client.sendMessage(message.from, attachment)
  });
}
