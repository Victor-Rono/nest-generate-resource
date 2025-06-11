#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const program = new Command();

// Convert kebab-case or snake_case to PascalCase (e.g., user-accounts → UserAccounts)
function toPascalCase(name: string): string {
    return name
        .replace(/[-_]+/g, ' ')
        .replace(/\s(.)/g, (_, char) => char.toUpperCase())
        .replace(/\s/g, '')
        .replace(/^(.)/, (_, char) => char.toUpperCase());
}

// Clean folder-safe name (e.g., user-accounts → user-accounts)
function toFileSafeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9\-]/g, '');
}

program
    .version('1.0.1')
    .description('CLI tool to generate a complete NestJS feature structure');

const generateCommand = program
    .command('generate <name>')
    .alias('g')
    .description('Generate a NestJS module, controller, services, and related structure')
    .action((rawName) => {
        const name = toFileSafeName(rawName);
        const capitalizedName = toPascalCase(name);
        const basePath = `./${name}`;
        const modulePath = `${basePath}/${name}.module.ts`;

        const commands = [
            `nest g module ${name}`,
            `nest g service ${name}/services/${name}`,
            `nest g service ${name}/services/${name}-automation`,
            `nest g controller ${name}/controllers/${name}`,
        ];

        // Execute NestJS CLI commands
        commands.forEach(cmd => {
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

        const folders = ['dto', 'schema', 'model', 'repository', 'events', 'interfaces', 'functions', 'data'];
        const files = folders.map(folder => ({
            path: `${basePath}/${folder}`,
            file: `${basePath}/${folder}/${name}.${folder}.ts`
        }));

        setTimeout(() => {
            folders.forEach(folder => {
                const folderPath = `${basePath}/${folder}`;
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                    console.log(`Created folder: ${folderPath}`);
                }
            });

            files.forEach(({ file }) => {
                if (!fs.existsSync(file)) {
                    const filename = path.basename(file);
                    const fileType = filename.split('.')[1];
                    let content = '';

                    switch (fileType) {
                        case 'dto':
                            content = `// ${capitalizedName} DTO\nexport class ${capitalizedName}Dto {\n  // define properties\n}`;
                            break;
                        case 'schema':
                            content = `// ${capitalizedName} Schema (Mongoose)\nimport { Schema } from 'mongoose';\n\nexport const ${capitalizedName}Schema = new Schema({\n  // define schema fields\n});`;
                            break;
                        case 'model':
                            content = `// ${capitalizedName} Model\nexport class ${capitalizedName}Model {\n  // define model fields\n}`;
                            break;
                        case 'repository':
                            content = `// ${capitalizedName} Repository\nexport class ${capitalizedName}Repository {\n  // implement database operations\n}`;
                            break;
                        case 'events':
                            content = `// ${capitalizedName} Events\nexport const ${capitalizedName}Events = {\n  // define events like CREATED, UPDATED\n};`;
                            break;
                        case 'interfaces':
                            content = `// ${capitalizedName} Interface\nexport interface ${capitalizedName}Interface {\n  // define interface shape\n}`;
                            break;
                        case 'functions':
                            content = `// ${capitalizedName} Utility Functions\nexport function ${capitalizedName}Function() {\n  // implement reusable logic\n}`;
                            break;
                        case 'data':
                            content = `// ${capitalizedName} Static/Fake Data\nexport const ${capitalizedName}Data = [\n  // mock objects for testing\n];`;
                            break;
                        default:
                            content = `// ${filename}`;
                    }

                    fs.writeFileSync(file, content);
                    console.log(`Created file with placeholder: ${file}`);
                }
            });
        }, 2000);

        setTimeout(() => {
            fs.readFile(modulePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading module file: ${err.message}`);
                    return;
                }

                const updatedData = data
                    .replace(/imports: \[\],/g, `imports: [],\n  controllers: [${capitalizedName}Controller],\n  providers: [${capitalizedName}Service],`)
                    .replace(/@Module\({/g,
                        `import { ${capitalizedName}Controller } from './controllers/${name}.controller';\n` +
                        `import { ${capitalizedName}Service } from './services/${name}.service';\n\n@Module({`
                    );

                fs.writeFile(modulePath, updatedData, 'utf8', (err) => {
                    if (err) {
                        console.error(`Error writing module file: ${err.message}`);
                    } else {
                        console.log(`Updated module file: ${modulePath}`);
                    }
                });
            });
        }, 3000);
    });

program.parse(process.argv);
