import { Bot } from "../../../../bot";
import { ExtendedContext } from "../../handler";
import { MessageCommand } from "../../message-command";

import { MainCommand } from "../main";

export class ConvertCommand extends MessageCommand {
  public static id = "convert-alias";

  constructor(bot: Bot) {
    super(bot, {
      id: ConvertCommand.id,
      command: ["convert"]
    });
  }

  public async run(msg: ExtendedContext): Promise<any> {
    return this.bot.msgHandler.invokeCommandById(msg, MainCommand.id);
  }
}
