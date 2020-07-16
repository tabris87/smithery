# smithery documentation

## Intention
smithery was designed and contructed to allow a fast and easy access to implement Software Product Lines (**SPL**) at your projects. 
During the last years as a developer i recognized a huge need of an easy to consume and install tool to use SPL techniques. 
Even the task of creating different configuration files for backends, tools etc. can leverage from the capabilities of smithery.

Whithin the nex chapters we will give an rough overview of the core module of smithery and link to the submodules directly connected to smithery itself.

## Core/CLI
The smithery module contains the cli and necessary core modules to run and use the smithery framework. 

### CLI
The cli was already described at the [README.md](../README.md), and don't need any further explanation. 
If you need help of using it, try ```bash smith -h ``` or ```bash smith --help ``` which will give you an overview of available options and commands.

### Core
The core of smithery contains **5** main modules:

 - The Generator
 - The Parser
 - The Project
 - The RuleSet
 - The Imposer

these 5 modules provide functionality heavily related to their naming. <br>
Most importent is the **Imposer** which implements the idea of [*Superimposition*](https://link.springer.com/chapter/10.1007/978-3-540-78789-1_2).
The **Imposer** contains only the main algorithm and has to be supported by parsers for Source-Code, and generators to get clear text code from Abstract Syntax Trees (AST).
As used by Superimposition the **RuleSet** module contains rules for so-called leaf nodes within the AST's. These rules support the imposition process and build by a strategy pattern. 
For more information about the rules see [Rules]().

The **Project** module works a the connector for all the other modules and handles the correct work and configuration. 
It loads plugins and fits the Generator, Parser and RuleSet to work and support the Imposer.

Whitin the next chapters we will describe each module more specific.

#### Generator
The Generator module is designed after the Factory-Pattern. It stores different types of generators (*functions*), by a given file ending.
For the Superimposition process, the Generator comes at the end of the imposition cycle to generate appropriate source code from a given AST.

#### Parser
The Parser module also is designed after the Factory-Pattern. Like the Generator module it stores different types of parser (*functions*), by a given file ending.
In contrast to the generator the parser are at the start of the imposition cycle to create a suitable AST, the Imposer can work with.

#### RuleSet
Like the Generator and the Parser, the RuleSet stores rules used for 'leaf nodes' of Abstract Syntax Trees. Each rule contains a pattern to match 
with the position it's resolve function should take affect. Therefore the RuleSet can be asked if there is a rule which can handle a specific AST pattern.

Additionally the RuleSet serves as a converter to convert css-like expressions into objects which are used as Strategies to identify AST positions.

## Base Assumptions
For smithery, we took different approaches and designs from other npm-tools. By taking other tools, and use them as dependencies, smithery has some base assumptions
which has to be met, to make plugins works correctly with smithery.

### AST design
As a starting point we choose [eslint](https://www.npmjs.com/package/eslint), because it also uses an AST, to work on source code. 
By choosing eslint we decided to use the [esprima](https://esprima.org/)-format for the AST structure. 
The Imposer, as well as the parsers and generators have to work with the esprima AST format. 
The whole implementation of the Superimposition by the Imposer relies on a correct implementation and format of the AST to work on.

### Node Identification
To make the Superimposition work correctly, we need a specific pattern to distinguish between different nodes within the AST and compare them. 
Therefore we take the type and name of the nodes to compare them. The name of a node is given by the parser.  Therefore, for designing a parser 
the decision to make is how specific a node is named. Additionally it has to be considered how specific the name has to be, because during the Superimposition 
we compare two AST's and the node have to match for a correct merging process.

### Rule - Selector
Rules define a pattern to select nodes by a css-like pattern. This techique is like the one used by [esquery](https://github.com/estools/esquery). 
But we enhance this techique to also check properties of children nodes to select a node if necessary. This behaviour is a feature which is not 
standard to css and not a feature of *esquery*.  But we hope it helps to create a strong selector for the rules.