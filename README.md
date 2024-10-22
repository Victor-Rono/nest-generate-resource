NestJS Module Generator CLI (Work in Progress)
Disclaimer: This code is incomplete and may contain bugs.
It's a work in progress, aimed at building a CLI to automate generating a NestJS module, service, controller, interface, enum, helper, and more in a single command.

Feel free to try it out, contribute, or use the code however you want. Any improvements or suggestions are highly appreciated!

Project Overview
The goal of this project is to:

Simplify the creation of repetitive NestJS components like modules, services, controllers, interfaces, enums, and helpers.
Provide a single command to generate a full-featured NestJS module with minimal setup.
Offer flexibility to customize which components to include when generating modules.
Current Status
The core idea is in place, but the implementation is incomplete and may have bugs.
Some functionality may not work as expected, but the base structure should give a good sense of the intended outcome.
Example Usage
1. Generate a Full Module
Run this command to generate a full module along with service, controller, and other components (if supported):

bash
Copy code
generate-nest-module <ModuleName>
This command is supposed to create files like:

ModuleName.module.ts
ModuleName.service.ts
ModuleName.controller.ts
Optional files for interfaces, enums, and helpers (depending on flags).
2. Customize Output (When Fully Implemented)
The goal is to allow you to customize which components you want to generate. For example:

bash
Copy code
generate-nest-module <ModuleName> --include service,controller,interface
This should only generate the specified files like:

ModuleName.service.ts
ModuleName.controller.ts
ModuleName.interface.ts
Contributing
Since this project is far from complete, contributions are more than welcome!
Feel free to improve on any part of the code and submit a pull request. If you find a bug, have a better implementation idea, or want to add features, don't hesitate to contribute.

How to Get Started:
Clone the repository:

bash
Copy code
git clone https://github.com/yourusername/nestjs-module-generator-cli
Install dependencies and explore the current code:

bash
Copy code
npm install
Help improve the generator!

Roadmap
 Fix bugs and complete the core logic.
 Add better error handling and validation.
 Improve the user experience (flags, options, etc.).
 Write tests for the CLI.
 Enhance flexibility for custom generation (more control over file types).
License
This project is open-source under the MIT License. You’re free to use, modify, and share the code however you see fit.

