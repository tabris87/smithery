const {
    Node
} = require('smithery-equipment').types;

const rule = {
    resolve: function (baseFST, featureFST, oContext) {
        //1. first step, parse the different files to get thier AST representations
        const baseAst = oContext.getParser().parse(baseFST.content, baseFST.ending, {});
        const featureAst = oContext.getParser().parse(featureFST.content, featureFST.ending, {});
        baseAst.featureName = baseFST.featureName;
        featureAst.featureName = featureFST.featureName;

        //2. impose both structures
        const resultingAst = oContext.impose(baseAst, featureAst, oContext.getParser().getVisitorKeys(baseFST.ending));

        //3. recreate the node for further processing
        var aKeys = Object.keys(featureFST);
        aKeys.splice(aKeys.indexOf('content'), 1);
        var oReturningNode = new Node();

        aKeys.forEach(sKey => oReturningNode[sKey] = featureFST[sKey]);
        //4. generate the string back to get the unique interface for file nodes.
        oReturningNode['content'] = oContext.getGenerator().generate(resultingAst, featureFST.ending);
        return oReturningNode;
    },
    target: ['FILE', 'DIR'],
    selector: 'File[ending]'
};

module.exports = rule;