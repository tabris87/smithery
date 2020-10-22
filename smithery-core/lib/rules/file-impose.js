"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rule = void 0;
const enums_1 = require("../enums");
exports.rule = {
    apply: (baseFST, featureFST, context) => {
        var _a, _b;
        // 1. first step, parse the different files to get thier AST representations
        const baseParser = context.getParserFactory().getParser(baseFST.ending);
        const featureParser = context.getParserFactory().getParser(featureFST.ending);
        if (!baseParser || !featureParser) {
            throw new Error('Base-FeatureTree-Parser and Feature-FeatureTree-Parser not correctly defined');
        }
        if (!baseFST.content || !featureFST.content) {
            throw new Error('BaseFeatureTree and FeatureFeatureTree does not contain source code');
        }
        const baseAST = (_a = context.getParserFactory().getParser(baseFST.ending)) === null || _a === void 0 ? void 0 : _a.parse(baseFST.content || "", {});
        const featureAST = (_b = context.getParserFactory().getParser(featureFST.ending)) === null || _b === void 0 ? void 0 : _b.parse(featureFST.content || "", {});
        if (!baseAST || !featureAST) {
            throw new Error('BaseAST and FeatureAST not available');
        }
        baseAST.featureName = baseFST.featureName;
        featureAST.featureName = featureFST.featureName;
        // 2. impose both structures
        const resultingAST = context.impose(baseAST, featureAST, baseParser.getVisitorKeys());
        // 3. recreate the node for further processing
        const returningNode = featureFST.clone();
        const featureGenerator = context.getGeneratorFactory().getGenerator(featureFST.ending);
        if (!featureGenerator) {
            throw new Error('No suitable Generator available for feature context');
        }
        returningNode.content = featureGenerator.generate(resultingAST);
        return returningNode;
    },
    target: [enums_1.FileType.File, enums_1.FileType.Folder],
    selector: `${enums_1.FileType.File}[ending]`,
};
//# sourceMappingURL=file-impose.js.map