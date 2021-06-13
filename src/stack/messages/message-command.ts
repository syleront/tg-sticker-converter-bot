import { Bot } from "../../bot";

import { ExtendedContext } from "./handler";

export interface MessageCommandObject {
  command: RegExp | string[];
  args?: RegExp;
  id: string;

  info?: string;
  description?: string;

  args_required?: boolean;
  ignore_prefix?: boolean;

  ignore_log?: boolean;
}

export abstract class MessageCommand {
  protected readonly bot: Bot;

  public readonly command: RegExp;
  public readonly args: RegExp;
  public readonly id: string;

  public readonly info: string;
  public readonly description: string;

  public readonly ignore_prefix: boolean;
  public readonly args_required: boolean;

  public readonly ignore_log: boolean;

  protected constructor(bot: Bot, obj: MessageCommandObject) {
    this.bot = bot;

    if (Array.isArray(obj.command)) {
      this.command = new RegExp(`^(${obj.command.join("|")})(?:\\s|$)`, "i");
    } else {
      this.command = obj.command;
    }

    this.id = obj.id;
    this.args = obj.args;

    this.info = obj.info || null;
    this.description = obj.description || null;

    this.ignore_prefix = obj.ignore_prefix || false;
    this.args_required = obj.args_required || false;

    this.ignore_log = obj.ignore_log || false;
  }

  public async run(msg: ExtendedContext, invoked?: boolean): Promise<any> {
    console.log("Warning: run method is not declared by child class");
  }

  public async useHelp(msg: ExtendedContext): Promise<void> {
    if (this.info !== null) {
      await msg.send(`Использование: ${this.info}`);
    } else {
      console.warn(`Warning: info field is not set for command ${this.id}`);
    }
  }
}
