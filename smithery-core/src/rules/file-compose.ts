import { IRule } from '../Interfaces';
import { Imposer } from '../Imposer';
import { FSTNode } from '../utils/FSTNode';
import { FSTTerminal } from '../utils/FSTTerminal';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';

export const rule: IRule = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply: (base: FSTNode, feature: FSTNode, newNode: FSTNode, parent: FSTNonTerminal | undefined, context: Imposer): void => {
    if (base instanceof FSTNonTerminal || feature instanceof FSTNonTerminal) {
      throw new Error(`'base' Node or 'feature' node not of type terminal, therefore not imposable by this rule.`);
    }
    const baseN = (base as FSTTerminal);
    const featureN = (feature as FSTTerminal);

    if (baseN.getCodeLanguage() === '' || featureN.getCodeLanguage() === '') {
      throw new Error(`'base' Node or 'feature' node do not provide a concrete language definition.`);
    }

    if (baseN.getCodeLanguage() !== featureN.getCodeLanguage()) {
      throw new Error(`'base' and 'feature' node do not provide the same language definition.`);
    }
    // 1. first step, parse the different files to get thier AST representations
    const parser = context.getParserFactory().getParser(baseN.getCodeLanguage());

    if (!parser) {
      throw new Error('Parser not correctly defined');
    }

    if (typeof baseN.getContent() === 'undefined' || baseN.getContent() === null || baseN.getContent().trim() === ''
      || typeof featureN.getContent() === 'undefined' || featureN.getContent() === null || featureN.getContent().trim() === '') {
      throw new Error(`'base' node or 'feature' node does not contain source code'`);
    }

    const generator = context.getGeneratorFactory().getGenerator(baseN.getCodeLanguage());

    if (!generator) {
      throw new Error('Generator not correctly defined');
    }

    // 2. impose both structures
    const baseFST = parser.parse(baseN.getContent());
    const featureFST = parser.parse(featureN.getContent());
    const resultFST = context.impose({ 'base': baseFST, 'feature': featureFST }, ['base', 'feature']);


    (newNode as FSTTerminal).setContent(generator.generate(resultFST));
    (newNode as FSTTerminal).setCodeLanguage(baseN.getCodeLanguage());
    (newNode as FSTTerminal).setMergeStrategy(baseN.getMergeStrategy());
    (newNode as FSTTerminal).setFeatureName(featureN.getFeatureName());

  },
  id: 'file_compose',
  package: 'smithery-core'
};
