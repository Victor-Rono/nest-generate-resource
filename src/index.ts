#!/usr/bin/env node

import { Command } from 'commander';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const program = new Command();
const execFileAsync = promisify(execFile);

// ===== Naming utilities =====

function toPascalCase(input: string): string {
    return input
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^a-zA-Z0-9]+/)
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function toFileSafeName(input: string): string {
    return input
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}

// Basic singularization for interface names: chat-rooms -> ChatRoom.
function toEntityName(input: string): string {
    const name = toPascalCase(input);

    if (/ies$/i.test(name)) {
        return name.slice(0, -3) + 'y';
    }

    if (/sses$/i.test(name)) {
        return name.slice(0, -2);
    }

    if (/s$/i.test(name) && !/ss$/i.test(name)) {
        return name.slice(0, -1);
    }

    return name;
}

function ensureDirectory(directory: string): void {
    fs.mkdirSync(directory, { recursive: true });
}

function createFileIfMissing(filePath: string, content: string): void {
    ensureDirectory(path.dirname(filePath));

    if (fs.existsSync(filePath)) {
        return;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created: ${filePath}`);
}

function writeGeneratedFile(filePath: string, content: string): void {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created: ${filePath}`);
}

function getRelativeImport(fromFile: string, targetFile: string): string {
    let relativePath = path.relative(path.dirname(fromFile), targetFile);
    relativePath = relativePath.split(path.sep).join('/');

    if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
    }

    return relativePath;
}

async function runNestCommand(args: string[]): Promise<void> {
    console.log(`Running: nest ${args.join(' ')}`);

    const { stdout, stderr } = await execFileAsync('nest', args, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024,
    });

    if (stdout) {
        process.stdout.write(stdout);
    }

    if (stderr) {
        process.stderr.write(stderr);
    }
}

// ===== CLI setup =====

program
    .version('1.0.2')
    .description('CLI tool to generate NestJS or C++ feature structures');

// ===== NestJS resource generation =====

program
    .command('g <name>')
    .description('Generate a NestJS module and its feature structure')
    .action(async (rawName: string) => {
        const name = toFileSafeName(rawName);

        if (!name) {
            console.error('A valid resource name is required.');
            process.exitCode = 1;
            return;
        }

        const moduleName = toPascalCase(name);
        const entityName = toEntityName(name);
        const collectionName = name.replace(/-/g, '_').toUpperCase();
        const basePath = path.resolve(process.cwd(), name);
        const modulePath = path.join(basePath, `${name}.module.ts`);

        const serviceDirectory = path.join(basePath, 'services', name);
        const controllerDirectory = path.join(basePath, 'controllers', name);
        const automationDirectory = path.join(
            basePath,
            'services',
            `${name}-automation`,
        );
        const gatewayDirectory = path.join(basePath, 'gateways', name);

        if (fs.existsSync(modulePath)) {
            console.error(`Module already exists: ${modulePath}`);
            process.exitCode = 1;
            return;
        }

        // Create the resource directory structure before generating files.
        [
            basePath,
            serviceDirectory,
            controllerDirectory,
            automationDirectory,
            gatewayDirectory,
            'dto',
            'schema',
            'model',
            'repository',
            'events',
            'interfaces',
            'utils',
            'constants',
        ].forEach(directory => {
            const target = [
                'dto',
                'schema',
                'model',
                'repository',
                'events',
                'interfaces',
                'utils',
                'constants',
            ].includes(directory)
                ? path.join(basePath, directory)
                : directory;

            ensureDirectory(target);
        });

        try {
            // Run sequentially; do not depend on timeouts or concurrent generation.
            await runNestCommand(['g', 'module', name]);
            await runNestCommand(['g', 'service', `services/${name}`, '--flat']);
            await runNestCommand([
                'g',
                'service',
                `services/${name}-automation`,
                '--flat',
            ]);
            await runNestCommand([
                'g',
                'controller',
                `controllers/${name}`,
                '--flat',
            ]);
            await runNestCommand([
                'g',
                'gateway',
                `gateways/${name}`,
                '--flat',
            ]);

            // Supporting files.
            const supportingFiles: Record<string, string> = {
                dto: `export class ${moduleName}Dto {\n    // define properties\n}\n`,
                schema: `import { Schema } from 'mongoose';\n\nexport const ${moduleName}Schema = new Schema({\n    // define schema fields\n});\n`,
                model: `export class ${moduleName}Model {\n    // define model fields\n}\n`,
                repository: `export class ${moduleName}Repository {\n    // implement database operations\n}\n`,
                events: `export const ${moduleName}Events = {\n    CREATED: '${collectionName}_CREATED',\n    UPDATED: '${collectionName}_UPDATED',\n} as const;\n`,
                interfaces: `export interface ${entityName} {\n    // leave blank\n}\n`,
                utils: '',
                constants: '',
            };

            for (const [folder, content] of Object.entries(supportingFiles)) {
                createFileIfMissing(
                    path.join(basePath, folder, `${name}.${folder}.ts`),
                    content,
                );
            }

            // Paths for generated feature files.
            const controllerPath = path.join(
                controllerDirectory,
                `${name}.controller.ts`,
            );
            const servicePath = path.join(
                serviceDirectory,
                `${name}.service.ts`,
            );
            const automationPath = path.join(
                automationDirectory,
                `${name}-automation.service.ts`,
            );
            const gatewayPath = path.join(gatewayDirectory, `${name}.gateway.ts`);

            const controllerServiceImport = getRelativeImport(
                controllerPath,
                servicePath,
            );

            // Use the user's BaseController generic pattern.
            writeGeneratedFile(
                controllerPath,
                `import { Controller } from '@nestjs/common';
import { BaseController } from 'src/modules/base/controllers/base/base.controller';
import { ${moduleName}Service } from '${controllerServiceImport}';
import { ${entityName} } from '../../interfaces/${name}.interfaces';

@Controller('${name}')
export class ${moduleName}Controller extends BaseController<${entityName}, ${entityName}, ${entityName}, boolean> {
    constructor(private readonly service: ${moduleName}Service) {
        super(service);
    }
}
`,
            );

            writeGeneratedFile(
                servicePath,
                `import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/modules/base/services/base/base.service';

@Injectable()
export class ${moduleName}Service extends BaseService<${entityName}, ${entityName}, ${entityName}, boolean> {
    constructor() {
        super();
    }
}
`,
            );

            writeGeneratedFile(
                automationPath,
                `import { Injectable } from '@nestjs/common';
import { BaseAutomationService } from 'src/modules/base/services/base-automation/base-automation.service';

@Injectable()
export class ${moduleName}AutomationService extends BaseAutomationService {

}
`,
            );

            writeGeneratedFile(
                gatewayPath,
                `import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ${moduleName}Gateway {

}
`,
            );

            // Module file: provider token follows CollectionEnums naming convention.
            writeGeneratedFile(
                modulePath,
                `import { Module } from '@nestjs/common';
import { ${moduleName}Service } from './services/${name}/${name}.service';
import { ${moduleName}AutomationService } from './services/${name}-automation/${name}-automation.service';
import { generateCollectionProvider } from 'src/database/database.functions';
import { CollectionEnums } from 'src/database/enums/collections.enums';
import { ${moduleName}Controller } from './controllers/${name}/${name}.controller';
import { ${moduleName}Gateway } from './gateways/${name}/${name}.gateway';

const imports: any[] = [];
const providers: any[] = [
    ${moduleName}Service,
    ${moduleName}AutomationService,
    ${moduleName}Gateway,
    generateCollectionProvider(CollectionEnums.${collectionName}),
];

@Module({
    controllers: [${moduleName}Controller],
    imports,
    providers,
    exports: imports.concat(providers),
})
export class ${moduleName}Module { }
`,
            );

            console.log(`\nSuccessfully generated ${moduleName} module at ${basePath}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error(`Failed to generate ${moduleName}: ${message}`);
            process.exitCode = 1;
        }
    });

// ===== C++ resource generation =====

program
    .command('cpp <name>')
    .description('Generate a basic C++ skeleton')
    .action((rawName: string) => {
        const name = toFileSafeName(rawName);

        if (!name) {
            console.error('A valid resource name is required.');
            process.exitCode = 1;
            return;
        }

        const capitalizedName = toPascalCase(name);
        const basePath = path.resolve(process.cwd(), name);
        ensureDirectory(basePath);

        createFileIfMissing(
            path.join(basePath, `${name}.h`),
            `#pragma once

class ${capitalizedName} {
public:
    ${capitalizedName}();
    ~${capitalizedName}();
    // define members
};
`,
        );

        createFileIfMissing(
            path.join(basePath, `${name}.cpp`),
            `#include "${name}.h"

${capitalizedName}::${capitalizedName}() {}
${capitalizedName}::~${capitalizedName}() {}

// implement methods
`,
        );

        createFileIfMissing(
            path.join(basePath, `${name}_test.cpp`),
            `#include "${name}.h"
#include <iostream>

int main() {
    ${capitalizedName} obj;
    std::cout << "Test ${capitalizedName} created." << std::endl;
    return 0;
}
`,
        );
    });

program.parseAsync(process.argv).catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
