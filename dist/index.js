#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");
var import_child_process = require("child_process");
var import_fs = __toESM(require("fs"));
var program = new import_commander.Command();
program.version("1.0.1").description("CLI tool to generate NestJS modules, controllers, and services");
program.command("generate <name>").alias("g").description("Generate a NestJS module, controller, and service with the same name").action((name) => {
  const modulePath = `./modules/${name}/${name}.module.ts`;
  const commands = [
    `nest generate module modules/${name}`,
    `nest generate controller modules/${name}`,
    `nest generate service modules/${name}`
  ];
  commands.forEach((cmd) => {
    (0, import_child_process.exec)(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Output: ${stdout}`);
    });
  });
  setTimeout(() => {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    import_fs.default.readFile(modulePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }
      const updatedData = data.replace(/imports: \[\],/g, `imports: [],
  controllers: [${capitalizedName}Controller],
  providers: [${capitalizedName}Service],`).replace(/@Module\({/g, `import { ${capitalizedName}Controller } from './${name}.controller';
import { ${capitalizedName}Service } from './${name}.service';

@Module({`);
      import_fs.default.writeFile(modulePath, updatedData, "utf8", (err2) => {
        if (err2) {
          console.error(`Error writing file: ${err2.message}`);
          return;
        }
        console.log(`Updated module file: ${modulePath}`);
      });
    });
  }, 1e3);
});
program.parse(process.argv);
