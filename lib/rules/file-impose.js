const rule = {
    resolve: function (baseFST, featureFST, oContext) {
        baseFST.featureName = featureFST.featureName;

        //Just the simplest solution for DIR/FILE compose test
        return baseFST;
    },
    target: ['FILE', 'DIR'],
    selector: 'File[ending]'
}

module.exports = rule;