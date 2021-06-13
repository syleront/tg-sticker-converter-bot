import dotenv from "dotenv";
import { Bot } from "./bot";

dotenv.config();

(async () => {
  const bot = new Bot();
  await bot.init();
})();
