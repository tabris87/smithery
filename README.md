# smithery

*<span style="color:red">--alpha release--</span>*

The "house" of SPL blacksmiths, to provide tooling for Software Product Line Engenieering.
Currentyl *smithery* provides the tools to work with Feature Oriented Programming (FOP).
Additionally the intention is to provide additional tools to work with feature models, configurations etc..
<!--
## Installation smithery for testing
``` npm install -g git+https://github.com/tabris87/featureCLI.git#master```
-->
## Installation
```bash
npm install -g smithery
```
or 
```bash
npm install [--save-dev] smithery
```

## Usage
### As standalone tool
Currently you can use smithery from commandline as a standalone tool:
```bash
smith --help
Usage: index [options] [command]

Options:
  -V, --version         output the version number
  -h, --help            output usage information

Commands:
  init|I                Inititalize the project setup
  build|B [configName]  Starts the build of your product by the given
                        configuration, otherwise tries to use the
                        default config
```

### As dependency
*smithery* contains an api file, to create an easy access to the internals of smithery if you want to use parts of smithery within your own projects.
There is an interface for: 
- [The Project]: which is the class to collect and control all the other parts of *smithery* by a given configuration
- [The ParserFactory]: A collector for multiple parser instances to take out the right one depending on file types
- [The GeneratorFactory]: A collector for multiple generator instances to take out the right one depending on file types
- [The RuleSetFactory]: A collector for all rules used by the imposer to support the imposition for leaf nodes.
- [The Imposer]: The main class for the Feature Oriented Programming, handling the imposition by taking all the classes above, except the Project, and two Abstract Syntax Trees (AST).

**USAGE:**

```javascript
const {
    Project,
    ParserFactory,
    GeneratorFactory,
    RuleSetFactory,
    Imposer
} = require('smithery');
```

## Documentation
*<span style="color: yellow;">Under Construction</span>

The smithery framework is designed as a plugin framework to provide enough flexibility to work within different projects and with lot of different languages;
Therefore we can describe only the core parts of this framework at the documentation.

To get a better understanding have look [(O.O)](docs/Documentation.md).

## Contribution
 [*Missing*](https://github.com/tabris87/featureCLI/blob/master/docs/CONTRIBUTING.md)

## API Documentation
API can be found here [API](docs/API.md);
 
## License
This project is licensed under the Apache Software License, Version 2.0.