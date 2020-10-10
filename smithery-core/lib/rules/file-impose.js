"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const enums_1 = require("../enums");
exports.rule = {
    apply: (baseFST, featureFST, context) => {
        // 1. first step, parse the different files to get thier AST representations
        const baseAST = context.getParserFactory().getParser(baseFST.ending).parse(baseFST.content, {});
        const featureAST = context.getParserFactory().getParser(featureFST.ending).parse(featureFST.content, {});
        baseAST.featureName = baseFST.featureName;
        featureAST.featureName = featureFST.featureName;
        // 2. impose both structures
        const resultingAST = context.impose(baseAST, featureAST, context.getParserFactory().getParser(baseFST.ending).getVisitorKeys());
        // 3. recreate the node for further processing
        const returningNode = featureFST.clone();
        returningNode.content = context.getGeneratorFactory().getGenerator(featureFST.ending).generate(resultingAST);
        return returningNode;
    },
    target: [enums_1.FileType.File, enums_1.FileType.Folder],
    selector: `${enums_1.FileType.File}[ending]`,
};
//# sourceMappingURL=file-impose.js.map