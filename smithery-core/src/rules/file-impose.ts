import { IRule } from '../Interfaces';
import { Node } from '../utils/Node';
import { FileType } from '../enums';
import { Imposer } from '../Imposer';

export const rule: IRule = {
  apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
    // 1. first step, parse the different files to get thier AST representations
    const baseParser = context.getParserFactory().getParser(baseFST.ending);
    const featureParser = context.getParserFactory().getParser(featureFST.ending);

    if (!baseParser || !featureParser) {
      throw new Error('Base-FeatureTree-Parser or Feature-FeatureTree-Parser not correctly defined');
    }

    if (!baseFST.content || baseFST.content === '' || !featureFST.content || featureFST.content === '') {
      throw new Error('BaseFeatureTree or FeatureFeatureTree does not contain source code');
    }

    const baseAST = baseParser.parse(baseFST.content, {});
    const featureAST = featureParser.parse(featureFST.content, {});

    baseAST.featureName = baseFST.featureName;
    featureAST.featureName = featureFST.featureName;

    // 2. impose both structures
    const resultingAST = context.impose(
      baseAST,
      featureAST,
      baseParser.getVisitorKeys(),
    );

    // 3. recreate the node for further processing
    const returningNode = featureFST.clone();
    const featureGenerator = context.getGeneratorFactory().getGenerator(featureFST.ending);
    if (!featureGenerator) { throw new Error('No suitable Generator available for feature context'); }
    returningNode.content = featureGenerator.generate(resultingAST);
    return returningNode;
  },
  target: [FileType.File, FileType.Folder],
  selector: `${FileType.File}[ending]`,
};
