#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
var program = new Command();
program.version("1.0.1").description("CLI tool to generate a complete NestJS feature structure");
program.command("generate <name>").alias("g").description("Generate a NestJS module, controller, services, and related structure").action((name) => {
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
        const filename = path.basename(file);
        const fileType = filename.split(".")[1];
        let content = "";
        switch (fileType) {
          case "dto":
            content = `// ${capitalizedName} DTO
export class ${capitalizedName}Dto {
  // define properties
}`;
            break;
          case "schema":
            content = `// ${capitalizedName} Schema (Mongoose)
import { Schema } from 'mongoose';

export const ${capitalizedName}Schema = new Schema({
  // define schema fields
});`;
            break;
          case "model":
            content = `// ${capitalizedName} Model
export class ${capitalizedName} {
  // define model fields
}`;
            break;
          case "repository":
            content = `// ${capitalizedName} Repository
export class ${capitalizedName}Repository {
  // implement database operations
}`;
            break;
          case "events":
            content = `// ${capitalizedName} Events
export const ${capitalizedName}Events = {
  // define events like CREATED, UPDATED
};`;
            break;
          case "interfaces":
            content = `// ${capitalizedName} Interface
export interface I${capitalizedName} {
  // define interface shape
}`;
            break;
          case "functions":
            content = `// ${capitalizedName} Utility Functions
export function exampleFunction() {
  // implement reusable logic
}`;
            break;
          case "data":
            content = `// ${capitalizedName} Static/Fake Data
export const ${capitalizedName}Data = [
  // mock objects for testing
];`;
            break;
          default:
            content = `// ${filename}`;
        }
        fs.writeFileSync(file, content);
        console.log(`Created file with placeholder: ${file}`);
      }
    });
  }, 2e3);
  setTimeout(() => {
    fs.readFile(modulePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading module file: ${err.message}`);
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
