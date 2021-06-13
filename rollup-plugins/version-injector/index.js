import fs from "fs";
import dateFormat from "dateformat";

export default (config = {}) => {
  const { packageJson = "./package.json" } = config;

  return {
    name: "version-injector",
    transform: function (code) {
      let file = null, json = null;
      const date = dateFormat(new Date(), "mmmm d, yyyy, h:MM:ss TT");

      try {
        file = fs.readFileSync(packageJson, "utf-8");
      } catch (e) {
        throw new Error("Wrong path to package.json");
      }

      try {
        json = JSON.parse(file);
      } catch (e) {
        throw new Error("package.json parsing error");
      }

      code = code.replace(/\[VI\](.+?)\[\/VI\]/g, (match, g1) => {
        return g1.replace(/{version}/g, json.version).replace(/{date}/g, date);
      });

      return {
        code: code,
        map: null
      };
    }
  };
};
