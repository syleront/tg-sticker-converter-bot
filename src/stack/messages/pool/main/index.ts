import sharp, { Metadata } from "sharp";
import { DocumentAttachment, PhotoAttachment, StickerAttachment } from "puregram";

import { Bot } from "../../../../bot";
import { ExtendedContext } from "../../handler";
import { MessageCommand } from "../../message-command";

import { FILE_SIZE_LIMIT } from "../../../../constants";

export class MainCommand extends MessageCommand {
  public static id = "main";

  constructor(bot: Bot) {
    super(bot, {
      id: MainCommand.id,
      command: /(.*)/i,
      ignore_prefix: true,
      ignore_log: true
    });
  }

  private _targetSize = 512;

  private async _processFile(msg: ExtendedContext, file: PhotoAttachment | StickerAttachment | DocumentAttachment) {
    const { bot, _targetSize } = this;

    const fileId = file instanceof PhotoAttachment ? file.bigSize.fileId : file.fileId;
    const fileSize = file instanceof PhotoAttachment ? file.bigSize.fileSize : file.fileSize;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

    bot.msgHandler.flow.cmdLog(msg, this, "| FILE SIZE:", fileSizeMB, "MB");

    if (fileSize > FILE_SIZE_LIMIT) {
      return msg.send(`Error: file size larger than ${(FILE_SIZE_LIMIT / 1024 / 1024).toFixed(2)}MB`);
    }

    // uploading to bot ofc
    await msg.sendChatAction("upload_photo");

    const raw = await bot.tg.api.getFile({ file_id: fileId });
    const raw_buffer = await bot.utils.downloadTelegramFile(raw);

    const sharped = await sharp(raw_buffer);

    if (file instanceof StickerAttachment) {
      if (file.isAnimated) {
        return msg.reply("Error: animated stickers is not supported");
      }

      const formatted = await sharped
        .toFormat("png")
        .toBuffer();

      await msg.sendChatAction("upload_document");
      await msg.sendDocument(formatted, { filename: `${raw.file_id}.png` });
    } else {
      let metadata: Metadata;

      try {
        metadata = await sharped.metadata();
      } catch (e) {
        return msg.reply(`Error: ${e.message}`);
      }

      let width: number, height: number;

      if (metadata.height > _targetSize || metadata.width > _targetSize) {
        const multiplier = metadata.height >= metadata.width
          ? metadata.height / _targetSize
          : metadata.width / _targetSize;

        height = Math.ceil(metadata.height / multiplier);
        width = Math.ceil(metadata.width / multiplier);
      } else if (metadata.height < _targetSize || metadata.width < _targetSize) {
        const multiplier = metadata.height <= metadata.width
          ? metadata.width / _targetSize
          : metadata.height / _targetSize;

        height = Math.ceil(metadata.height / multiplier);
        width = Math.ceil(metadata.width / multiplier);
      } else {
        height = metadata.height;
        width = metadata.width;
      }

      const formatted = await sharped
        .toFormat("png")
        .resize(width, height)
        .toBuffer();

      await msg.sendChatAction("upload_document");
      await msg.sendDocument(formatted, { filename: `${raw.file_unique_id}.png` });
    }
  }

  public async run(msg: ExtendedContext, invoked): Promise<any> {
    const { bot } = this;

    if (msg.chat.type !== "private" && !invoked) {
      return;
    }

    const files = [
      ...bot.utils.getAttachments<PhotoAttachment>(msg, "photo"),
      ...bot.utils.getAttachments<StickerAttachment>(msg, "sticker"),
      ...bot.utils.getAttachments<DocumentAttachment>(msg, "document")
    ];

    if (!files.length) {
      return msg.reply("There is no photo, sticker or document");
    }

    for (const file of files) {
      await this._processFile(msg, file);
    }
  }
}

