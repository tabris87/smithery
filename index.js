/**
 * @module featureUI5
 * @public
 */

"use strict";
const espree = require("espree");
const fs = require("fs");
const path = require("path");

function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function (child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }

    return info;
};

function createASTCombination(originFile, featureFile) {
    var fileContent = fs.readFileSync(originFile.path, 'utf-8');
    var originAst = espree.parse(fileContent, {
        //attach range information to each node
        range: false,
        //attach line/column location information to each node
        loc: true,
        //create a top-level comments array containing all comments
        comment: true,
        //create a top-level tokens array containing all tokens
        tokens: false,
        // Set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
        // You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), or 2019 (same as 10) to use the year-based naming.
        ecmaVersion: 5,
    });
    //fs.writeFileSync('espreeAstComponent.json', JSON.stringify(originAst));

    //originAst = babylon.parse(fileContent, {});
    //fs.writeFileSync('babylonAstComponent.json', JSON.stringify(originAst));
    return originFile;
};

function mergeIntoFinal(aFinalStructure, aItemsToMerge) {
    for (var i = 0; i < aItemsToMerge.length; i++) {
        var iIndex = aFinalStructure.findIndex(file => file.type === aItemsToMerge[i].type && file.name === aItemsToMerge[i].name);
        //If file not at final structure copy into final structure
        if (iIndex === -1) {
            if (aItemsToMerge[i].type === "folder" && aItemsToMerge[i].children.length === 0) {
                console.log(" - Warning: Feature folder " + aItemsToMerge[i].name + " is empty, therefore skipped. (FullPath: " + aItemsToMerge[i].path + ")");
            } else {
                aFinalStructure.push(aItemsToMerge[i]);
            }
        } else {
            //if file of type folder merge all subitems into the final structure
            if (aFinalStructure[iIndex].type === "folder") {
                aFinalStructure[iIndex].children = mergeIntoFinal(aFinalStructure[iIndex].children, aItemsToMerge[i].children);
            } else {
                //if file is of type file merge per AST combination.
                aFinalStructure[iIndex] = createASTCombination(aFinalStructure[iIndex], aItemsToMerge[i]);
            }
        }
    }
    return aFinalStructure;
};

function copyFiles(aFiles, targetPath, aFeatureFolder) {
    for (var i = 0; i < aFiles.length; i++) {
        var sSource = aFiles[i].path;
        var sTarget = "";
        aFeatureFolder.forEach(sFF => {
            if (aFiles[i].path.indexOf(sFF) > -1) {
                sTarget = targetPath + aFiles[i].path.replace(sFF, '')
            }
        });
        if (aFiles[i].type === "folder") {
            fs.mkdirSync(sTarget);
            copyFiles(aFiles[i].children, targetPath, aFeatureFolder);
        } else {
            fs.copyFileSync(sSource, sTarget);
        }
    }
};

function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function run() {
    const projectFolder = process.argv[2];
    const featureFile = process.argv[3];
    var oWorkspace = dirTree(projectFolder);

    let sFeatureList = fs.readFileSync(featureFile, 'utf8');
    sFeatureList = sFeatureList.split('\n').map(sF => sF.trim());

    var aFeatureFolder = oWorkspace.children.filter(child => sFeatureList.some(sF => sF === child.name));
    var oBaseFold = aFeatureFolder.filter(fold => fold.name === "base");
    oBaseFold = oBaseFold.length > 0 ? oBaseFold[0] : {};

    var aFilesToCopy = [];
    aFilesToCopy = oBaseFold.children;

    sFeatureList.filter(sFeature => sFeature !== "base").forEach(sFeature => {
        console.log("Merging feature '" + sFeature + "':");
        var oFeatureFolder = aFeatureFolder.filter(fold => fold.name === sFeature);
        if (oFeatureFolder.length > 0) {
            oFeatureFolder = oFeatureFolder[0];
            aFilesToCopy = mergeIntoFinal(aFilesToCopy, oFeatureFolder.children);
        } else {
            console.log(" - Warning: Feature " + sFeature + " contains no files to merge, therefore skipped.");
        }
    });

    //start code generation
    const targetPath = "tempBuild";

    if (fs.existsSync(targetPath)) {
        deleteFolderRecursive(targetPath);
        fs.mkdirSync(targetPath);
        copyFiles(aFilesToCopy, targetPath, sFeatureList.map(sFeature => projectFolder + '/' + sFeature));
    } else {
        fs.mkdirSync(targetPath);
        copyFiles(aFilesToCopy, targetPath, sFeatureList.map(sFeature => projectFolder + '/' + sFeature));
    }

    console.log('Build finished');

    //        var fileContent = fs.readFileSync(file)
    //        var ast = espree.parse(fileContent, {
    //            //attach range information to each node
    //            range: false,
    //            //attach line/column location information to each node
    //            loc: true,
    //            //create a top-level comments array containing all comments
    //            comment: true,
    //            //create a top-level tokens array containing all tokens
    //            tokens: false,
    //            // Set to 3, 5 (default), 6, 7, 8, 9, or 10 to specify the version of ECMAScript syntax you want to use.
    //            // You can also set to 2015 (same as 6), 2016 (same as 7), 2017 (same as 8), 2018 (same as 9), or 2019 (same as 10) to use the year-based naming.
    //            ecmaVersion: 5,
    //
    //        });

}

module.exports = {
    run: run()
}