#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

const program = new Command();

// ============================================================
// Naming utilities
// ============================================================

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

// ============================================================
// File utilities
// ============================================================

function ensureDirectory(directory: string): void {
    fs.mkdirSync(directory, { recursive: true });
}

function createFileIfMissing(
    filePath: string,
    content: string,
): void {
    ensureDirectory(path.dirname(filePath));

    if (fs.existsSync(filePath)) {
        console.log(`Skipped existing file: ${filePath}`);
        return;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created: ${filePath}`);
}

function writeGeneratedFile(
    filePath: string,
    content: string,
): void {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Created: ${filePath}`);
}

// ============================================================
// CLI setup
// ============================================================

program
    .name('nest-resource')
    .version('1.0.3')
    .description('Generate NestJS resources or C++ skeletons');

// ============================================================
// NestJS resource generator
// ============================================================

program
    .command('g <name>')
    .description('Generate a NestJS resource')
    .action((rawName: string) => {
        const name = toFileSafeName(rawName);

        if (!name) {
            console.error('A valid resource name is required.');
            process.exitCode = 1;
            return;
        }

        const moduleName = toPascalCase(name);
        const entityName = toEntityName(name);
        const collectionName = name
            .replace(/-/g, '_')
            .toUpperCase();

        // The resource root is the ONLY generation root.
        const resourcePath = path.resolve(process.cwd(), name);

        // All paths below are relative to this single resource root.
        const modulePath = path.join(
            resourcePath,
            `${name}.module.ts`,
        );

        if (fs.existsSync(modulePath)) {
            console.error(
                `Resource already exists: ${resourcePath}`,
            );
            process.exitCode = 1;
            return;
        }

        // --------------------------------------------------------
        // 1. Create the complete folder structure first.
        // --------------------------------------------------------

        const directories = [
            'controllers',
            path.join('controllers', name),

            'services',
            path.join('services', name),
            path.join('services', `${name}-automation`),

            'gateways',
            path.join('gateways', name),

            'dto',
            'schema',
            'model',
            'repository',
            'events',
            'interfaces',
            'utils',
            'constants',
        ];

        ensureDirectory(resourcePath);

        for (const directory of directories) {
            ensureDirectory(
                path.join(resourcePath, directory),
            );
        }

        // --------------------------------------------------------
        // 2. Define every file path exactly once.
        // --------------------------------------------------------

        const controllerPath = path.join(
            resourcePath,
            'controllers',
            name,
            `${name}.controller.ts`,
        );

        const servicePath = path.join(
            resourcePath,
            'services',
            name,
            `${name}.service.ts`,
        );

        const automationServicePath = path.join(
            resourcePath,
            'services',
            `${name}-automation`,
            `${name}-automation.service.ts`,
        );

        const gatewayPath = path.join(
            resourcePath,
            'gateways',
            name,
            `${name}.gateway.ts`,
        );

        const interfacePath = path.join(
            resourcePath,
            'interfaces',
            `${name}.interfaces.ts`,
        );

        const dtoPath = path.join(
            resourcePath,
            'dto',
            `${name}.dto.ts`,
        );

        const schemaPath = path.join(
            resourcePath,
            'schema',
            `${name}.schema.ts`,
        );

        const modelPath = path.join(
            resourcePath,
            'model',
            `${name}.model.ts`,
        );

        const repositoryPath = path.join(
            resourcePath,
            'repository',
            `${name}.repository.ts`,
        );

        const eventsPath = path.join(
            resourcePath,
            'events',
            `${name}.events.ts`,
        );

        const utilsPath = path.join(
            resourcePath,
            'utils',
            `${name}.utils.ts`,
        );

        const constantsPath = path.join(
            resourcePath,
            'constants',
            `${name}.constants.ts`,
        );

        // --------------------------------------------------------
        // 3. Supporting files.
        // --------------------------------------------------------

        createFileIfMissing(
            dtoPath,
            `export class ${moduleName}Dto {
    // Define properties.
}
`,
        );

        createFileIfMissing(
            schemaPath,
            `import { Schema } from 'mongoose';

export const ${moduleName}Schema = new Schema({
    // Define schema fields.
});
`,
        );

        createFileIfMissing(
            modelPath,
            `export class ${moduleName}Model {
    // Define model fields.
}
`,
        );

        createFileIfMissing(
            repositoryPath,
            `export class ${moduleName}Repository {
    // Implement database operations.
}
`,
        );

        createFileIfMissing(
            eventsPath,
            `export const ${moduleName}Events = {
    CREATED: '${collectionName}_CREATED',
    UPDATED: '${collectionName}_UPDATED',
} as const;
`,
        );

        createFileIfMissing(
            interfacePath,
            `export interface ${entityName} {
    // Leave blank.
}
`,
        );

        createFileIfMissing(utilsPath, '');
        createFileIfMissing(constantsPath, '');

        // --------------------------------------------------------
        // 4. Service.
        // --------------------------------------------------------

        writeGeneratedFile(
            servicePath,
            `import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/modules/base/services/base/base.service';
import { ${entityName} } from '../../interfaces/${name}.interfaces';

@Injectable()
export class ${moduleName}Service extends BaseService<${entityName}, ${entityName}, ${entityName}, boolean> {
    constructor() {
        super();
    }
}
`,
        );

        // --------------------------------------------------------
        // 5. Automation service.
        // --------------------------------------------------------

        writeGeneratedFile(
            automationServicePath,
            `import { Injectable } from '@nestjs/common';
import { BaseAutomationService } from 'src/modules/base/services/base-automation/base-automation.service';

@Injectable()
export class ${moduleName}AutomationService extends BaseAutomationService {

}
`,
        );

        // --------------------------------------------------------
        // 6. Controller.
        // --------------------------------------------------------

        writeGeneratedFile(
            controllerPath,
            `import { Controller } from '@nestjs/common';
import { BaseController } from 'src/modules/base/controllers/base/base.controller';
import { ${moduleName}Service } from '../../services/${name}/${name}.service';
import { ${entityName} } from '../../interfaces/${name}.interfaces';

@Controller('${name}')
export class ${moduleName}Controller extends BaseController<${entityName}, ${entityName}, ${entityName}, boolean> {
    constructor(private readonly service: ${moduleName}Service) {
        super(service);
    }
}
`,
        );

        // --------------------------------------------------------
        // 7. Gateway.
        // --------------------------------------------------------

        writeGeneratedFile(
            gatewayPath,
            `import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ${moduleName}Gateway {

}
`,
        );

        // --------------------------------------------------------
        // 8. Module.
        // --------------------------------------------------------

        writeGeneratedFile(
            modulePath,
            `import { Module } from '@nestjs/common';
import { ${moduleName}Service } from './services/${name}/${name}.service';
import { ${moduleName}AutomationService } from './services/${name}-automation/${name}-automation.service';
import { ${moduleName}Controller } from './controllers/${name}/${name}.controller';
import { ${moduleName}Gateway } from './gateways/${name}/${name}.gateway';
import { generateCollectionProvider } from 'src/database/database.functions';
import { CollectionEnums } from 'src/database/enums/collections.enums';

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
export class ${moduleName}Module {}
`,
        );

        console.log(
            `\nSuccessfully generated ${moduleName} resource:`,
        );
        console.log(resourcePath);
    });

// ============================================================
// C++ generator
// ============================================================

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

        const className = toPascalCase(name);
        const resourcePath = path.resolve(
            process.cwd(),
            name,
        );

        ensureDirectory(resourcePath);

        createFileIfMissing(
            path.join(resourcePath, `${name}.h`),
            `#pragma once

class ${className} {
public:
    ${className}();
    ~${className}();

    // Define members.
};
`,
        );

        createFileIfMissing(
            path.join(resourcePath, `${name}.cpp`),
            `#include "${name}.h"

${className}::${className}() {}

${className}::~${className}() {}

// Implement methods.
`,
        );

        createFileIfMissing(
            path.join(resourcePath, `${name}_test.cpp`),
            `#include "${name}.h"
#include <iostream>

int main() {
    ${className} obj;
    std::cout << "Test ${className} created." << std::endl;
    return 0;
}
`,
        );
    });

// ============================================================
// Execute CLI
// ============================================================

program.parseAsync(process.argv).catch((error: unknown) => {
    console.error(
        error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
});