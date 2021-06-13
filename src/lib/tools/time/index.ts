export class TimeTools {
  public static getDateString(): string {
    return TimeTools.getFormatted("%year%-%month%-%day% %hours%:%minutes%:%seconds%");
  }

  public static getFormatted(string: string, date: Date | number = Date.now()): string {
    const fDate = new Date(date);

    const day = fDate.getDate().toString().padStart(2, "0");
    const month = (fDate.getMonth() + 1).toString().padStart(2, "0");
    const year = fDate.getFullYear().toString();

    const seconds = fDate.getSeconds().toString().padStart(2, "0");
    const minutes = fDate.getMinutes().toString().padStart(2, "0");
    const hours = fDate.getHours().toString().padStart(2, "0");

    return string
      .replace("%day%", day)
      .replace("%month%", month)
      .replace("%year%", year)
      .replace("%seconds%", seconds)
      .replace("%minutes%", minutes)
      .replace("%hours%", hours);
  }

  public static toHHMMSS(sec: number): string {
    const days = (Math.floor(sec / (3600 * 24))).toString().padStart(2, "0");
    const hours = (Math.floor(sec / 3600) % 24).toString().padStart(2, "0");
    const minutes = (Math.floor((sec / 60) % 60)).toString().padStart(2, "0");
    const seconds = Math.floor((sec % 60)).toString().padStart(2, "0");

    return `${days !== "00" ? days + " :: " : ""}${(hours)}:${minutes}:${seconds}`;
  }
}
