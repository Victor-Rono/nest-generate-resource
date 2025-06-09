#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
    .version('1.0.1')
    .description('CLI tool to generate NestJS modules, controllers, and services');

program
    .command('generate <name>')
    .alias('g')
    .description('Generate a NestJS module, controller, services, and structure')
    .action((name) => {
        const basePath = `./${name}`;
        const modulePath = `${basePath}/${name}.module.ts`;
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

        const commands = [
            `nest g module ${name}`,
            `nest g service ${name}/services/${name}`,
            `nest g service ${name}/services/${name}-automation`,
            `nest g controller ${name}/controllers/${name}`,
        ];

        // Run generation commands
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

        // Create custom folders and files
        const folders = ['dto', 'schema', 'model', 'repository', 'events', 'interfaces', 'functions', 'data'];
        const files = folders.map(folder => ({
            path: `${basePath}/${folder}`,
            file: `${basePath}/${folder}/${name}.${folder}.ts`
        }));

        // Delay execution to avoid race condition
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
                    fs.writeFileSync(file, `// ${path.basename(file)}`);
                    console.log(`Created file: ${file}`);
                }
            });
        }, 2000);

        // Optional: auto-modify module file if needed
        setTimeout(() => {
            fs.readFile(modulePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading file: ${err.message}`);
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
