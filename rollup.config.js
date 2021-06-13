import path from "path";

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import del from "rollup-plugin-delete";
import typescript from "rollup-plugin-typescript2";
import externals from "rollup-plugin-node-externals";
import copy from "rollup-plugin-copy";

import versionInjector from "./rollup-plugins/version-injector/index";

const outputDir = "./dist";

export default {
  input: "./src/app.ts",
  plugins: [
    del({ targets: "./dist/*" }),
    externals({ deps: true, devDeps: true }),
    resolve(),
    typescript(),
    commonjs(),
    json(),
    versionInjector(),
    copy({
      targets: [
        { src: "./src/static/*", dest: path.join(outputDir, "static") },
      ]
    })
  ],
  output: [
    {
      strict: false,
      file: path.join(outputDir, "app.js"),
      format: "cjs",
      sourcemap: true
    }
  ]
};
