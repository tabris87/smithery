"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryParser = void 0;
const Interfaces_1 = require("../Interfaces");
const enums_1 = require("../enums");
const fs_1 = require("fs");
const path_1 = require("path");
class DirectoryParser {
    parse(sFilePath, options) {
        var _a;
        const route = sFilePath || '.';
        const stats = fs_1.lstatSync(route);
        const oToken = new Interfaces_1.Node();
        oToken.name = path_1.basename(route);
        oToken.sourcePath = route;
        if (stats.isDirectory()) {
            oToken.type = enums_1.FileType.Folder;
        }
        else {
            oToken.type = enums_1.FileType.File;
        }
        if (options === null || options === void 0 ? void 0 : options.parent) {
            oToken.path = ((_a = options === null || options === void 0 ? void 0 : options.parent) === null || _a === void 0 ? void 0 : _a.path) !== '' ? `${options.parent.path}.${oToken.type}` : oToken.type;
            oToken.parent = options === null || options === void 0 ? void 0 : options.parent;
        }
        else {
            oToken.path = '';
            oToken.parent = undefined;
        }
        if (stats.isDirectory()) {
            oToken.children = fs_1.readdirSync(route).map((child) => {
                return this.parse(path_1.join(route, child), { parent: oToken });
            });
        }
        else {
            oToken.ending = path_1.extname(route).replace('.', '').toUpperCase();
            oToken.content = fs_1.readFileSync(route, { encoding: 'utf-8' });
        }
        return oToken;
    }
    getVisitorKeys() {
        return DirectoryParser.visitorKeys;
    }
}
exports.DirectoryParser = DirectoryParser;
DirectoryParser.visitorKeys = {
    Folder: ['children'],
    File: [],
};
//# sourceMappingURL=DirectoryParser.js.map