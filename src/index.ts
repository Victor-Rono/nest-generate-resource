#!/usr/bin/env node

import { Command } from 'commander';
import { exec } from 'child_process';

const program = new Command();

program
    .version('1.0.1')
    .description('CLI tool to generate NestJS modules, controllers, and services');

program
    .command('generate <name>')
    .alias('g')
    .description('Generate a NestJS module, controller, and service with the same name')
    .action((name) => {
        const commands = [
            `nest generate module modules/${name}`,
            `nest generate controller modules/${name}`,
            `nest generate service modules/${name}`
        ];

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
                console.log(`Output: ${stdout}`);
            });
        });
    });

program.parse(process.argv);
