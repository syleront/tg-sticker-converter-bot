import dedent from "dedent";

import { Messages, ExtendedContext } from "./handler";
import { MessageCommand } from "./message-command";
import { TimeTools } from "../../lib/tools";

import { COMMAND_PREFIX } from "../../constants";

export class Flow {
  public handler: Messages;

  constructor(handler: Messages) {
    this.handler = handler;
  }

  private static _isArgsPassed(msg: ExtendedContext, cmd: MessageCommand) {
    return cmd.args_required === false || cmd.args_required === true && msg.args !== null;
  }

  public patchMessageText(text: string): string {
    if (!text) text = "";
    return text.replace(/\s?\n/g, " ");
  }

  public patchMessageTextParams(msg: ExtendedContext): void {
    const matchedParams = msg.handlerText.match(/(?:--|—)[A-z-_0-9]+=(.+?)(?:\s|$)/g);
    if (matchedParams !== null) {
      for (const param of matchedParams) {
        const [, key, value] = param.match(/(?:--|—)([A-z-_0-9]+)=(.+?)(?:\s|$)/);
        msg.params[key.trim()] = value.trim();
      }

      msg.handlerText = msg.handlerText.replace(/(?:--|—)[A-z-_0-9]+=(.+?)(?:\s|$)/g, "");
    } else {
      msg.params = {};
    }

    const matchedFlags = msg.handlerText.match(/(?:--|—)[A-z-_0-9]+/g);
    if (matchedFlags !== null) {
      msg.flags = matchedFlags.map((e) => e.match(/(?:--|—)([A-z-_0-9]+)/)[1].trim());
      msg.handlerText = msg.handlerText.replace(/(?:--|—).+?\b/g, "");
    } else {
      msg.flags = [];
    }
  }

  public buildMentionRegexp(): RegExp {
    const { username } = this.handler.bot.tg.bot;
    return new RegExp(`^@${username}|@${username}$`, "i");
  }

  public buildPrefixRegExp(): RegExp {
    const prefix = COMMAND_PREFIX;
    return new RegExp(`^(${typeof prefix === "object" && prefix.length ? prefix.join("|") : prefix})`, "i");
  }

  public async cmdControl(msg: ExtendedContext, cmd: MessageCommand): Promise<boolean> {
    if (!Flow._isArgsPassed(msg, cmd)) {
      await cmd.useHelp(msg);
      return false;
    }

    return true;
  }

  public cmdLog(msg: ExtendedContext, cmd: MessageCommand, ...args: any[]) {
    console.log(
      `[${TimeTools.getDateString()}]`,
      `[@${msg.from.username} | id${msg.from.id}]`,
      "[CMD]", (cmd.id || cmd.command.source),
      "[MSG]", (msg.text || null),
      ...args
    );
  }

  public async handleError(err: Error | any, msg: ExtendedContext, cmd: MessageCommand) {
    const error = err && err.message || err;
    const command = cmd.info || cmd.id || null;

    console.error(`[${TimeTools.getDateString()}]`, "Execution command: ", command, "\n", err.stack ? err.stack : err);

    const string = dedent`
      Execution command: ${command}
      Error: ${error}
    `.trim();

    await msg.reply(string);
  }
}
