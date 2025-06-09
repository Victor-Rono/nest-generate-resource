#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import { exec } from "child_process";
import fs from "fs";
var program = new Command();
program.version("1.0.1").description("CLI tool to generate NestJS modules, controllers, and services");
program.command("generate <name>").alias("g").description("Generate a NestJS module, controller, and service with the same name").action((name) => {
  const modulePath = `./modules/${name}/${name}.module.ts`;
  const commands = [
    `nest generate module modules/${name}`,
    `nest generate controller modules/${name}`,
    `nest generate service modules/${name}`
  ];
  commands.forEach((cmd) => {
    exec(cmd, (error, stdout, stderr) => {
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
    fs.readFile(modulePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        return;
      }
      const updatedData = data.replace(/imports: \[\],/g, `imports: [],
  controllers: [${capitalizedName}Controller],
  providers: [${capitalizedName}Service],`).replace(/@Module\({/g, `import { ${capitalizedName}Controller } from './${name}.controller';
import { ${capitalizedName}Service } from './${name}.service';

@Module({`);
      fs.writeFile(modulePath, updatedData, "utf8", (err2) => {
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
