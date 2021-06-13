import { performance } from "perf_hooks";

import { Bot } from "../../../../bot";
import { MessageCommand } from "../../message-command";

export class TestCommand extends MessageCommand {
  public static id = "test-command";

  constructor(bot: Bot) {
    super(bot, {
      id: TestCommand.id,
      command: ["test"]
    });
  }

  public async run(msg): Promise<void> {
    await msg.send(`Response time: ${performance.now() - msg.handleTime}ms`);
  }
}
