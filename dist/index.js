#!/usr/bin/env node
"use strict";

// src/index.ts
var import_commander = require("commander");
var import_child_process = require("child_process");
var program = new import_commander.Command();
program.version("1.0.1").description("CLI tool to generate NestJS modules, controllers, and services");
program.command("generate <name>").alias("g").description("Generate a NestJS module, controller, and service with the same name").action((name) => {
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
});
program.parse(process.argv);
