#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import { exec } from "child_process";
import fs from "fs";
var program = new Command();
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
    exec(cmd, (error, stdout, stderr) => {
      if (error) return console.error(`Error: ${error.message}`);
      if (stderr) console.error(`Stderr: ${stderr}`);
      if (stdout) console.log(stdout);
    });
  });
  const folders = ["dto", "schema", "model", "repository", "events", "interfaces", "functions", "data"];
  setTimeout(() => {
    folders.forEach((folder) => {
      const folderPath = `${basePath}/${folder}`;
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
      const fileName = `${name}.${folder}.ts`;
      const filePath = `${folderPath}/${fileName}`;
      if (!fs.existsSync(filePath)) {
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
        fs.writeFileSync(filePath, content);
        console.log(`Created file with PascalCase symbol: ${filePath}`);
      }
    });
  }, 2e3);
  setTimeout(() => {
    fs.readFile(modulePath, "utf8", (err, data) => {
      if (err) return console.error(`Error reading module file: ${err.message}`);
      const updatedData = data.replace(/imports: \[\],/g, `imports: [],
  controllers: [${capitalizedName}Controller],
  providers: [${capitalizedName}Service],`).replace(
        /@Module\({/g,
        `import { ${capitalizedName}Controller } from './controllers/${name}.controller';
import { ${capitalizedName}Service } from './services/${name}.service';

@Module({`
      );
      fs.writeFile(modulePath, updatedData, "utf8", (err2) => {
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
  if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
  const headerFile = `${basePath}/${name}.h`;
  const cppFile = `${basePath}/${name}.cpp`;
  const testFile = `${basePath}/${name}_test.cpp`;
  if (!fs.existsSync(headerFile)) {
    fs.writeFileSync(
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
  if (!fs.existsSync(cppFile)) {
    fs.writeFileSync(
      cppFile,
      `#include "${name}.h"

${capitalizedName}::${capitalizedName}() {}
${capitalizedName}::~${capitalizedName}() {}
// implement methods
`
    );
    console.log(`Created: ${cppFile}`);
  }
  if (!fs.existsSync(testFile)) {
    fs.writeFileSync(
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
