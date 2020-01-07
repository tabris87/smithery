const fs = require('fs');
const path = require('path');
const ParserCL = require('../../lib/Parser');
const RulesCL = require('../../lib/Rules');
const MergerCL = require('../../lib/Merger');
const GeneratorCL = require('../../lib/Generator');

function merge(base, feature, output) {
    debugger;
    const sWorkingDir = process.cwd();
    console.log('Merging files: ');
    console.log('base file: ', base);
    console.log('feature file: ', feature);

    if (!output) {
        console.log('No output given, result will be shown at command line');
    }

    let baseCode = "";
    let featureCode = "";
    if (!fs.existsSync(path.join(sWorkingDir, base))) {
        console.log("Base file does not exist, no merging possible!")
        process.exit(2);
    }
    baseCode = fs.readFileSync(path.join(sWorkingDir, base), 'UTF-8');

    if (!fs.existsSync(path.join(sWorkingDir, feature))) {
        console.log("Feature file does not exist, no merging possible!")
        process.exit(2);
    }
    featureCode = fs.readFileSync(path.join(sWorkingDir, feature), 'UTF-8');

    const sCodeTypeBase = path.extname(path.join(sWorkingDir, base)).replace('.', '').toUpperCase();
    const sCodeTypeFeature = path.extname(path.join(sWorkingDir, feature)).replace('.', '').toUpperCase();

    if (sCodeTypeBase !== sCodeTypeFeature) {
        console.log("Given files don't match in their types, no merging possible!");
        process.exit(2);
    }

    const Rules = new RulesCL();
    const Parser = new ParserCL();
    const Merger = new MergerCL(Rules.getRulesByLanguage(sCodeTypeBase));
    const oGenerator = new GeneratorCL();

    let baseAst = Parser.parse({
        code: baseCode,
        lang: sCodeTypeBase,
        version: 5
    });
    baseAst.featureName = "BASE";

    let featureAst = Parser.parse({
        code: featureCode,
        lang: sCodeTypeFeature,
        version: 5
    });
    featureAst.featureName = "FEATURE";

    var result = Merger.merge(baseAst, featureAst);
    result = oGenerator.generate({
        lang: sCodeTypeBase,
        codeAst: result
    });

    if (output) {
        var outputPath = path.join(sWorkingDir, output);
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        fs.writeFileSync(outputPath, result);
    } else {
        console.log('');
        console.log(result);
    }
    process.exit(0);
}

module.exports = {
    createCommand: function (program) {
        program.command('merge <base> <feature> [output]') // sub-command name
            .alias('M')
            .description('Merge two files given (base and feature file), by the default rules') // command description
            .on('--help', function () {
                console.log('\n', 'Examples:\n', '\n', '$fjs merge ./base.js ./feature.js\n', '$fjs merge ./base.js ./feature.js ./output.js');
            })
            // function to execute when command is used
            .action(function (base, feature, output) {
                merge(base, feature, output);
            });
    }
}