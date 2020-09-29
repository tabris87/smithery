import { Node, IRule } from '../Interfaces';
import { FileType } from '../enums';
import { Imposer } from '../Imposer';

export const rule: IRule = {
  apply: (baseFST: Node, featureFST: Node, context: Imposer): Node => {
    // 1. first step, parse the different files to get thier AST representations
    const baseAST = context.getParserFactory().getParser(baseFST.ending).parse(baseFST.content, {});
    const featureAST = context.getParserFactory().getParser(featureFST.ending).parse(featureFST.content, {});
    baseAST.featureName = baseFST.featureName;
    featureAST.featureName = featureFST.featureName;

    // 2. impose both structures
    const resultingAST = context.impose(
      baseAST,
      featureAST,
      context.getParserFactory().getParser(baseFST.ending).getVisitorKeys(),
    );

    // 3. recreate the node for further processing
    const returningNode = featureFST.clone();
    returningNode.content = context.getGeneratorFactory().getGenerator(featureFST.ending).generate(resultingAST);
    return returningNode;
  },
  target: [FileType.File, FileType.Folder],
  selector: `${FileType.File}[ending]`,
};
