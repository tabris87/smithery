"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryGenerator = void 0;
const enums_1 = require("../enums");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Implementation of the Generator interface to generate files and directories
 */
class DirectoryGenerator {
    /**
     * @override
     */
    generate(oAST, options) {
        const route = (options === null || options === void 0 ? void 0 : options.filePath) || '.';
        const aItems = oAST.children;
        if (aItems) {
            this._processFiles(aItems, route);
        }
        // Sry for this, but it is the only class not delivering a correct source code.
        return 'Done';
    }
    /**
     * Recursive file and folder generation
     *
     * @param aNodesToProcess the tree nodes to process
     * @param sTargetPath the path of the parent element
     */
    _processFiles(aNodesToProcess, sTargetPath) {
        for (const oNode of aNodesToProcess) {
            if (oNode.type === enums_1.FileType.Folder) {
                fs_1.mkdirSync(path_1.join(sTargetPath, oNode.name));
                this._processFiles(oNode.children || [], path_1.join(sTargetPath, oNode.name));
            }
            else {
                if (oNode.content && oNode.content !== '') {
                    fs_1.writeFileSync(path_1.join(sTargetPath, oNode.name), oNode.content);
                }
            }
        }
    }
}
exports.DirectoryGenerator = DirectoryGenerator;
//# sourceMappingURL=DirectoryGenerator.js.map