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
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
var program = new import_commander.Command();
function toPascalCase(input) {
  return input.replace(/([a-z0-9])([A-Z])/g, "$1 $2").split(/[^a-zA-Z0-9]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}
function toFileSafeName(input) {
  return input.trim().replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
}
function toEntityName(input) {
  const name = toPascalCase(input);
  if (/ies$/i.test(name)) {
    return name.slice(0, -3) + "y";
  }
  if (/sses$/i.test(name)) {
    return name.slice(0, -2);
  }
  if (/s$/i.test(name) && !/ss$/i.test(name)) {
    return name.slice(0, -1);
  }
  return name;
}
function ensureDirectory(directory) {
  import_fs.default.mkdirSync(directory, { recursive: true });
}
function createFileIfMissing(filePath, content) {
  ensureDirectory(import_path.default.dirname(filePath));
  if (import_fs.default.existsSync(filePath)) {
    console.log(`Skipped existing file: ${filePath}`);
    return;
  }
  import_fs.default.writeFileSync(filePath, content, "utf8");
  console.log(`Created: ${filePath}`);
}
function writeGeneratedFile(filePath, content) {
  ensureDirectory(import_path.default.dirname(filePath));
  import_fs.default.writeFileSync(filePath, content, "utf8");
  console.log(`Created: ${filePath}`);
}
program.name("nest-resource").version("1.0.3").description("Generate NestJS resources or C++ skeletons");
program.command("g <name>").description("Generate a NestJS resource").action((rawName) => {
  const name = toFileSafeName(rawName);
  if (!name) {
    console.error("A valid resource name is required.");
    process.exitCode = 1;
    return;
  }
  const moduleName = toPascalCase(name);
  const entityName = toEntityName(name);
  const collectionName = name.replace(/-/g, "_").toUpperCase();
  const resourcePath = import_path.default.resolve(process.cwd(), name);
  const modulePath = import_path.default.join(
    resourcePath,
    `${name}.module.ts`
  );
  if (import_fs.default.existsSync(modulePath)) {
    console.error(
      `Resource already exists: ${resourcePath}`
    );
    process.exitCode = 1;
    return;
  }
  const directories = [
    "controllers",
    import_path.default.join("controllers", name),
    "services",
    import_path.default.join("services", name),
    import_path.default.join("services", `${name}-automation`),
    "gateways",
    import_path.default.join("gateways", name),
    "dto",
    "schema",
    "model",
    "repository",
    "events",
    "interfaces",
    "utils",
    "constants"
  ];
  ensureDirectory(resourcePath);
  for (const directory of directories) {
    ensureDirectory(
      import_path.default.join(resourcePath, directory)
    );
  }
  const controllerPath = import_path.default.join(
    resourcePath,
    "controllers",
    name,
    `${name}.controller.ts`
  );
  const servicePath = import_path.default.join(
    resourcePath,
    "services",
    name,
    `${name}.service.ts`
  );
  const automationServicePath = import_path.default.join(
    resourcePath,
    "services",
    `${name}-automation`,
    `${name}-automation.service.ts`
  );
  const gatewayPath = import_path.default.join(
    resourcePath,
    "gateways",
    name,
    `${name}.gateway.ts`
  );
  const interfacePath = import_path.default.join(
    resourcePath,
    "interfaces",
    `${name}.interfaces.ts`
  );
  const dtoPath = import_path.default.join(
    resourcePath,
    "dto",
    `${name}.dto.ts`
  );
  const schemaPath = import_path.default.join(
    resourcePath,
    "schema",
    `${name}.schema.ts`
  );
  const modelPath = import_path.default.join(
    resourcePath,
    "model",
    `${name}.model.ts`
  );
  const repositoryPath = import_path.default.join(
    resourcePath,
    "repository",
    `${name}.repository.ts`
  );
  const eventsPath = import_path.default.join(
    resourcePath,
    "events",
    `${name}.events.ts`
  );
  const utilsPath = import_path.default.join(
    resourcePath,
    "utils",
    `${name}.utils.ts`
  );
  const constantsPath = import_path.default.join(
    resourcePath,
    "constants",
    `${name}.constants.ts`
  );
  createFileIfMissing(
    dtoPath,
    `export class ${moduleName}Dto {
    // Define properties.
}
`
  );
  createFileIfMissing(
    schemaPath,
    `import { Schema } from 'mongoose';

export const ${moduleName}Schema = new Schema({
    // Define schema fields.
});
`
  );
  createFileIfMissing(
    modelPath,
    `export class ${moduleName}Model {
    // Define model fields.
}
`
  );
  createFileIfMissing(
    repositoryPath,
    `export class ${moduleName}Repository {
    // Implement database operations.
}
`
  );
  createFileIfMissing(
    eventsPath,
    `export const ${moduleName}Events = {
    CREATED: '${collectionName}_CREATED',
    UPDATED: '${collectionName}_UPDATED',
} as const;
`
  );
  createFileIfMissing(
    interfacePath,
    `export interface ${entityName} {
    // Leave blank.
}
`
  );
  createFileIfMissing(utilsPath, "");
  createFileIfMissing(constantsPath, "");
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
`
  );
  writeGeneratedFile(
    automationServicePath,
    `import { Injectable } from '@nestjs/common';
import { BaseAutomationService } from 'src/modules/base/services/base-automation/base-automation.service';

@Injectable()
export class ${moduleName}AutomationService extends BaseAutomationService {

}
`
  );
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
`
  );
  writeGeneratedFile(
    gatewayPath,
    `import { WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class ${moduleName}Gateway {

}
`
  );
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
`
  );
  console.log(
    `
Successfully generated ${moduleName} resource:`
  );
  console.log(resourcePath);
});
program.command("cpp <name>").description("Generate a basic C++ skeleton").action((rawName) => {
  const name = toFileSafeName(rawName);
  if (!name) {
    console.error("A valid resource name is required.");
    process.exitCode = 1;
    return;
  }
  const className = toPascalCase(name);
  const resourcePath = import_path.default.resolve(
    process.cwd(),
    name
  );
  ensureDirectory(resourcePath);
  createFileIfMissing(
    import_path.default.join(resourcePath, `${name}.h`),
    `#pragma once

class ${className} {
public:
    ${className}();
    ~${className}();

    // Define members.
};
`
  );
  createFileIfMissing(
    import_path.default.join(resourcePath, `${name}.cpp`),
    `#include "${name}.h"

${className}::${className}() {}

${className}::~${className}() {}

// Implement methods.
`
  );
  createFileIfMissing(
    import_path.default.join(resourcePath, `${name}_test.cpp`),
    `#include "${name}.h"
#include <iostream>

int main() {
    ${className} obj;
    std::cout << "Test ${className} created." << std::endl;
    return 0;
}
`
  );
});
program.parseAsync(process.argv).catch((error) => {
  console.error(
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
