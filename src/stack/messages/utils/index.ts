import got from "got";
import FormData from "form-data";

import { Attachment, MessageContext, Telegram, User } from "puregram";

import { AttachmentType } from "puregram/lib/types";
import { TelegramFile, TelegramMessage } from "puregram/lib/telegram-interfaces";
import { SendDocumentParams, SendStickerParams } from "puregram/lib/methods";

import { Bot } from "../../../bot";
import { RequestError } from "../../../errors/request";

import { ExtendedContext } from "../handler";


export class Utils {
  public readonly bot: Bot;
  public readonly tg: Telegram;

  constructor(bot: Bot) {
    this.bot = bot;
    this.tg = bot.tg;
  }

  private static _buildFormData<T extends Record<string, any>>(opts: T, ignore: (keyof T)[]) {
    const form = new FormData();

    for (const key in opts) {
      if (!ignore.includes(key))
        form.append(key, opts[key]);
    }

    return form;
  }

  public getFileUrl(file: TelegramFile): string {
    const token = this.tg.options.token;
    const filePath = file.file_path;
    return `https://api.telegram.org/file/bot${token}/${filePath}`;
  }

  public async downloadTelegramFile(file: TelegramFile | string): Promise<Buffer> {
    const url = typeof file === "string" ? file : this.getFileUrl(file);
    const res = await got.get(url);

    if (res.statusCode === 200) {
      return res.rawBody;
    } else {
      throw new RequestError(res.statusCode);
    }
  }

  public async sendDocument(opts: SendDocumentParams & { filename: string }): Promise<MessageContext> {
    const form = Utils._buildFormData(opts, ["document", "filename"]);

    const { document, filename } = opts;

    if (Buffer.isBuffer(document)) {
      form.append("document", document, { filename });
    } else {
      form.append("document", document);
    }

    const payload = await this.tg.callApi("sendDocument", form) as TelegramMessage;
    return new MessageContext({ telegram: this.tg, payload });
  }

  public async sendSticker(opts: SendStickerParams): Promise<MessageContext> {
    const form = Utils._buildFormData(opts, ["sticker"]);

    const { sticker } = opts;

    if (Buffer.isBuffer(sticker)) {
      form.append("sticker", sticker, { filename: "sticker.png" });
    } else {
      form.append("sticker", sticker);
    }

    const payload = await this.tg.callApi("sendSticker", form) as TelegramMessage;
    return new MessageContext({ telegram: this.tg, payload });
  }

  public getAttachments<T extends Attachment>(msg: ExtendedContext, type: AttachmentType): T[] {
    let attachments: T[];

    if (msg.hasAttachments(type)) {
      attachments = msg.getAttachments(type) as T[];
    } else if (msg.hasReplyMessage && msg.replyMessageContext.hasAttachments(type)) {
      attachments = msg.replyMessageContext.getAttachments(type) as T[];
    } else {
      attachments = [];
    }

    return attachments;
  }
}
