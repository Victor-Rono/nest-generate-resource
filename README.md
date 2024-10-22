# NestJS Module Generator CLI (Work in Progress)

**Disclaimer: This code is incomplete and may contain bugs.**  
It's a work in progress, aimed at building a CLI to automate generating a NestJS **module**, **service**, **controller**, **interface**, **enum**, **helper**, and more in a single command.

Feel free to try it out, contribute, or use the code however you want. Any improvements or suggestions are highly appreciated!

## Project Overview

The goal of this project is to:
- Simplify the creation of repetitive NestJS components like modules, services, controllers, interfaces, enums, and helpers.
- Provide a single command to generate a full-featured NestJS module with minimal setup.
- Offer flexibility to customize which components to include when generating modules.

### Current Status
- The core idea is in place, but the implementation is **incomplete** and **may have bugs**.
- Some functionality may not work as expected, but the base structure should give a good sense of the intended outcome.

## Example Usage

### 1. Generate a Full Module

Run this command to generate a full module along with service, controller, and other components (if supported):

```bash
generate-nest-module <ModuleName>
