#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
var program = new Command();
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
    exec(cmd, (error, stdout, stderr) => {
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
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`Created folder: ${folderPath}`);
      }
    });
    files.forEach(({ file }) => {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, `// ${path.basename(file)}`);
        console.log(`Created file: ${file}`);
      }
    });
  }, 2e3);
  setTimeout(() => {
    fs.readFile(modulePath, "utf8", (err, data) => {
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
      fs.writeFile(modulePath, updatedData, "utf8", (err2) => {
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
