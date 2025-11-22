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
function toPascalCase(input) {
  return input.replace(/[-_]+/g, " ").replace(/\s(.)/g, (_, char) => char.toUpperCase()).replace(/\s/g, "").replace(/^(.)/, (_, char) => char.toUpperCase());
}
function toFileSafeName(input) {
  return input.toLowerCase().replace(/[^a-z0-9\-]/g, "");
}
program.version("1.0.1").description("CLI tool to generate NestJS or C++ feature structures");
program.command("g <name>").description("Generate a NestJS module, controller, services, and related structure").action((rawName) => {
  const name = toFileSafeName(rawName);
  const capitalizedName = toPascalCase(rawName);
  const basePath = `./${name}`;
  const modulePath = `${basePath}/${name}.module.ts`;
  const commands = [
    `nest g module ${name}`,
    `nest g service ${name}/services/${name}`,
    `nest g service ${name}/services/${name}-automation`,
    `nest g controller ${name}/controllers/${name}`
  ];
  commands.forEach((cmd) => {
    (0, import_child_process.exec)(cmd, (error, stdout, stderr) => {
      if (error) return console.error(`Error: ${error.message}`);
      if (stderr) console.error(`Stderr: ${stderr}`);
      if (stdout) console.log(stdout);
    });
  });
  const folders = ["dto", "schema", "model", "repository", "events", "interfaces", "functions", "data"];
  setTimeout(() => {
    folders.forEach((folder) => {
      const folderPath = `${basePath}/${folder}`;
      if (!import_fs.default.existsSync(folderPath)) import_fs.default.mkdirSync(folderPath, { recursive: true });
      const fileName = `${name}.${folder}.ts`;
      const filePath = `${folderPath}/${fileName}`;
      if (!import_fs.default.existsSync(filePath)) {
        const typeName = toPascalCase(`${rawName} ${folder}`);
        let content = "";
        switch (folder) {
          case "dto":
            content = `export class ${typeName} {
  // define properties
}`;
            break;
          case "schema":
            content = `import { Schema } from 'mongoose';

export const ${typeName} = new Schema({
  // define schema fields
});`;
            break;
          case "model":
            content = `export class ${typeName} {
  // define model fields
}`;
            break;
          case "repository":
            content = `export class ${typeName} {
  // implement database operations
}`;
            break;
          case "events":
            content = `export const ${typeName} = {
  CREATED: '${typeName}_CREATED',
  UPDATED: '${typeName}_UPDATED',
};`;
            break;
          case "interfaces":
            content = `export interface ${typeName} {
  // define interface shape
}`;
            break;
          case "functions":
            content = `export function use${typeName}() {
  // reusable logic
}`;
            break;
          case "data":
            content = `export const ${typeName} = [
  // mock data
];`;
            break;
        }
        import_fs.default.writeFileSync(filePath, content);
        console.log(`Created file with PascalCase symbol: ${filePath}`);
      }
    });
  }, 2e3);
  setTimeout(() => {
    import_fs.default.readFile(modulePath, "utf8", (err, data) => {
      if (err) return console.error(`Error reading module file: ${err.message}`);
      const updatedData = data.replace(/imports: \[\],/g, `imports: [],
  controllers: [${capitalizedName}Controller],
  providers: [${capitalizedName}Service],`).replace(
        /@Module\({/g,
        `import { ${capitalizedName}Controller } from './controllers/${name}.controller';
import { ${capitalizedName}Service } from './services/${name}.service';

@Module({`
      );
      import_fs.default.writeFile(modulePath, updatedData, "utf8", (err2) => {
        if (err2) console.error(`Error writing module file: ${err2.message}`);
        else console.log(`Updated module file: ${modulePath}`);
      });
    });
  }, 3e3);
});
program.command("cpp <name>").description("Generate a basic C++ skeleton").action((rawName) => {
  const name = toFileSafeName(rawName);
  const capitalizedName = toPascalCase(rawName);
  const basePath = `./${name}`;
  if (!import_fs.default.existsSync(basePath)) import_fs.default.mkdirSync(basePath, { recursive: true });
  const headerFile = `${basePath}/${name}.h`;
  const cppFile = `${basePath}/${name}.cpp`;
  const testFile = `${basePath}/${name}_test.cpp`;
  if (!import_fs.default.existsSync(headerFile)) {
    import_fs.default.writeFileSync(
      headerFile,
      `#pragma once

class ${capitalizedName} {
public:
    ${capitalizedName}();
    ~${capitalizedName}();
    // define members
};
`
    );
    console.log(`Created: ${headerFile}`);
  }
  if (!import_fs.default.existsSync(cppFile)) {
    import_fs.default.writeFileSync(
      cppFile,
      `#include "${name}.h"

${capitalizedName}::${capitalizedName}() {}
${capitalizedName}::~${capitalizedName}() {}
// implement methods
`
    );
    console.log(`Created: ${cppFile}`);
  }
  if (!import_fs.default.existsSync(testFile)) {
    import_fs.default.writeFileSync(
      testFile,
      `#include "${name}.h"
#include <iostream>

int main() {
    ${capitalizedName} obj;
    std::cout << "Test ${capitalizedName} created." << std::endl;
    return 0;
}
`
    );
    console.log(`Created: ${testFile}`);
  }
});
program.parse(process.argv);
