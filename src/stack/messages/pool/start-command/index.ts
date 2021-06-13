import { Bot } from "../../../../bot";
import { MessageCommand } from "../../message-command";

export class StartCommand extends MessageCommand {
  public static id = "start-command";

  constructor(bot: Bot) {
    super(bot, {
      id: StartCommand.id,
      command: ["start"]
    });
  }

  public async run(msg): Promise<void> {
    await msg.send("Hi, just send me sticker or image, and I will send it converted back");
  }
}
