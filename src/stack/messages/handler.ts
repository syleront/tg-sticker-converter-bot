import { performance } from "perf_hooks";

import { Attachment, MessageContext } from "puregram";
import { TelegramInputFile } from "puregram/lib/telegram-interfaces";
import { SendDocumentParams, SendStickerParams } from "puregram/lib/methods";

import { Bot } from "../../bot";

import { Flow } from "./flow";
import { MessageCommand } from "./message-command";

import * as Pool from "./pool";


export interface ExtendedContext extends Omit<MessageContext, "sendDocument" | "sendSticker"> {
  handleTime: number;

  args: string[];
  matched: string[];
  handlerText: string;
  handlerAttachments: Attachment[];

  isPrefixExist: boolean;
  isMention: boolean;

  currentPrefixRegExp: RegExp;

  flags: string[];
  params: Record<string, string>;

  replyMessageContext: MessageContext;

  sendSticker(document: TelegramInputFile, opts: Omit<SendStickerParams, "chat_id">): Promise<MessageContext>;

  sendDocument(document: TelegramInputFile, opts: Omit<SendDocumentParams, "chat_id">): Promise<MessageContext>;
}

export class Messages {
  public readonly bot: Bot;
  public readonly flow: Flow;
  public readonly pool: MessageCommand[];

  constructor(bot: Bot) {
    this.bot = bot;
    this.flow = new Flow(this);
    this.pool = Object.values(Pool).map((Handler) => new Handler(bot))
  }

  public get middleWare() {
    return (msg: ExtendedContext, next?: Function) => {
      const utils = this.bot.utils;

      msg.handleTime = performance.now();

      msg.sendSticker = async (sticker: TelegramInputFile, opts: Omit<SendStickerParams, "chat_id" | "sticker"> = {}): Promise<MessageContext> => {
        return utils.sendSticker({
          chat_id: msg.chat.id,
          sticker,
          ...opts
        });
      };

      msg.sendDocument = async (document: TelegramInputFile, opts: Omit<SendDocumentParams, "chat_id" | "document"> & { filename?: string } = {}): Promise<MessageContext> => {
        return utils.sendDocument({
          filename: opts.filename || "file",
          chat_id: msg.chat.id,
          document,
          ...opts
        });
      }

      if (msg.hasReplyMessage) {
        msg.replyMessageContext = new MessageContext({ telegram: this.bot.tg, payload: msg.replyMessage.payload });
      }

      return next ? next() : void 0;
    }
  }

  public async invokeCommandById(msg: ExtendedContext, commandId: string): Promise<any> {
    for (const cmd of this.pool) {
      if (cmd.id === commandId) {
        return cmd.run(msg, true);
      }
    }

    throw new Error("InvokeCommandByIdError: command id not found");
  }

  public async handle(msg: ExtendedContext): Promise<void> {
    const { pool, flow } = this;

    const prefixRegExp = flow.buildPrefixRegExp();
    const mentionRegExp = flow.buildMentionRegexp();

    msg.flags = [];
    msg.params = {};
    msg.handlerText = flow.patchMessageText(msg.text || msg.caption);

    msg.isMention = mentionRegExp.test(msg.handlerText);
    msg.isPrefixExist = prefixRegExp.test(msg.handlerText);

    if (msg.isPrefixExist) {
      msg.handlerText = msg.handlerText.replace(prefixRegExp, "").trim();
    }

    if (msg.isMention) {
      msg.handlerText = msg.handlerText.replace(mentionRegExp, "").trim();
    }

    // fills msg.flags and msg.params
    if (msg.handlerText) {
      flow.patchMessageTextParams(msg);
    }

    for (const cmd of pool) {
      const matched: string[] = msg.handlerText?.trim().match(cmd.command) || null;
      const matchedArgs: string[] = matched && cmd.args && msg.handlerText
        ? msg.handlerText.replace(matched[0], "").trim().match(cmd.args)
        : null;

      if (
        (msg.isPrefixExist === false && msg.isMention === false)
        && cmd.ignore_prefix !== true && msg.chat.id !== null
      ) {
        continue;
      }

      if (matched !== null) {
        msg.matched = matched;
        msg.args = matchedArgs;

        msg.currentPrefixRegExp = prefixRegExp;

        const isCommandAllowed = await flow.cmdControl(msg, cmd)

        if (isCommandAllowed === true) {
          try {
            if (!cmd.ignore_log) {
              flow.cmdLog(msg, cmd);
            }

            await cmd.run(msg);

            if (msg.flags.includes("measure")) {
              const measured = performance.now() - msg.handleTime;
              await msg.send(`Command execution time: ${measured}ms`);
            }
          } catch (err) {
            await flow.handleError(err, msg, cmd);
          }
        }

        break;
      }
    }
  }
}
