import { Telegram } from "puregram";

import { Messages } from "./stack/handlers";

import { Utils } from "./stack/messages/utils";
import { ExtendedContext } from "./stack/messages/handler";

import { name } from "../package.json";

export interface BotInfoObject {
  name: string;
  version: string;
  build_date: string;
}

export class Bot {
  public msgHandler: Messages = new Messages(this);

  public tg: Telegram = new Telegram({ token: process.env.TG_BOT_TOKEN, apiRetryLimit: -1 });
  public utils: Utils = new Utils(this);

  public info: BotInfoObject = {
    name,
    version: "[VI]{version}[/VI]",
    build_date: "[VI]{date}[/VI]"
  };

  async init(): Promise<void> {
    if (!process.env.TG_BOT_TOKEN) {
      throw new Error("missed TG_BOT_TOKEN in .env file");
    }

    this.tg.updates.use(this.msgHandler.middleWare);
    this.tg.updates.on("message", (msg) => this.msgHandler.handle(<ExtendedContext><unknown>msg));

    console.log("[MAIN] Start polling");
    await this.tg.updates.startPolling();
  }
}
