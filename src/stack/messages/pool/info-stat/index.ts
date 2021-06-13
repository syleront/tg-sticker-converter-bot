import dedent from "dedent";

import { Bot } from "../../../../bot";
import { ExtendedContext } from "../../handler";
import { MessageCommand } from "../../message-command";

import { TimeTools } from "../../../../lib/tools";

export class InfoStatCommand extends MessageCommand {
  public static id = "info-stat";

  constructor(bot: Bot) {
    super(bot, {
      id: InfoStatCommand.id,
      command: ["stat"],
      info: "/stat",
      description: "статистика бота"
    });
  }

  public async run(msg: ExtendedContext): Promise<void> {
    const { bot } = this;

    const uptime: string = TimeTools.toHHMMSS(process.uptime());
    const memory: string = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + "MB";

    const string = dedent`
      -> ${bot.info.name} (v${bot.info.version})
      --> Node.js version: ${process.version}
      --> Memory usage: ${memory}
      --> Uptime ${uptime}
      --> Build date: ${bot.info.build_date}
    `.trim();

    await msg.send(string);
  }
}
