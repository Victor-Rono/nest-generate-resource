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
var import_path = __toESM(require("path"));
var program = new import_commander.Command();
program.version("1.0.1").description("CLI tool to generate NestJS modules, controllers, and services");
program.command("generate <name>").alias("g").description("Generate a NestJS module, controller, services, and structure").action((name) => {
  const basePath = `./${name}`;
  const modulePath = `${basePath}/${name}.module.ts`;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const commands = [
    `nest g module ${name}`,
    `nest g service ${name}/services/${name}`,
    `nest g service ${name}/services/${name}-automation`,
    `nest g controller ${name}/controllers/${name}`
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
      console.log(stdout);
    });
  });
  const folders = ["dto", "schema", "model", "repository", "events", "interfaces", "functions", "data"];
  const files = folders.map((folder) => ({
    path: `${basePath}/${folder}`,
    file: `${basePath}/${folder}/${name}.${folder}.ts`
  }));
  setTimeout(() => {
    folders.forEach((folder) => {
      const folderPath = `${basePath}/${folder}`;
      if (!import_fs.default.existsSync(folderPath)) {
        import_fs.default.mkdirSync(folderPath, { recursive: true });
        console.log(`Created folder: ${folderPath}`);
      }
    });
    files.forEach(({ file }) => {
      if (!import_fs.default.existsSync(file)) {
        import_fs.default.writeFileSync(file, `// ${import_path.default.basename(file)}`);
        console.log(`Created file: ${file}`);
      }
    });
  }, 2e3);
  setTimeout(() => {
    import_fs.default.readFile(modulePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }
      const updatedData = data.replace(/imports: \[\],/g, `imports: [],
  controllers: [${capitalizedName}Controller],
  providers: [${capitalizedName}Service],`).replace(
        /@Module\({/g,
        `import { ${capitalizedName}Controller } from './controllers/${name}.controller';
import { ${capitalizedName}Service } from './services/${name}.service';

@Module({`
      );
      import_fs.default.writeFile(modulePath, updatedData, "utf8", (err2) => {
        if (err2) {
          console.error(`Error writing module file: ${err2.message}`);
        } else {
          console.log(`Updated module file: ${modulePath}`);
        }
      });
    });
  }, 3e3);
});
program.parse(process.argv);
