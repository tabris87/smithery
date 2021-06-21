import { IRule } from '../Interfaces';
import { FileType } from '../enums';
import { Imposer } from '../Imposer';
import { FSTNode } from '../utils/FSTNode';
import { FSTTerminal } from '../utils/FSTTerminal';

export const rule: IRule = {
  apply: (baseFST: FSTNode, featureFST: FSTNode, context: Imposer): FSTNode => {
    // 1. first step, parse the different files to get thier AST representations
    /* const baseParser = context.getParserFactory().getParser(baseFST.ending);
    const featureParser = context.getParserFactory().getParser(featureFST.ending);

    if (!baseParser || !featureParser) {
      throw new Error('Base-FeatureTree-Parser or Feature-FeatureTree-Parser not correctly defined');
    }

    if (!(baseFST as FSTTerminal).getContent() || (baseFST as FSTTerminal).getContent() === '' || !(featureFST as FSTTerminal).getContent() || (featureFST as FSTTerminal).getContent() === '') {
      throw new Error('BaseFeatureTree or FeatureFeatureTree does not contain source code');
    }

    // 2. impose both structures

    // 3. recreate the node for further processing
    const returningNode = featureFST.clone();
    const featureGenerator = context.getGeneratorFactory().getGenerator(featureFST.ending);
    if (!featureGenerator) { throw new Error('No suitable Generator available for feature context'); }
    return returningNode; */
    return new FSTTerminal('', '');
  },
  target: [FileType.File, FileType.Folder],
  selector: `${FileType.File}[ending]`,
};
