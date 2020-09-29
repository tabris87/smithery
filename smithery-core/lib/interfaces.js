"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
/**
 * @todo remove later on or take it to the core implementation
 */
class Node {
    constructor(pos) {
        this.type = '';
        this.start = 0;
        this.end = 0;
        /*intermediate definitions */
        this.name = '';
        this.path = '';
        this.sourcePath = '';
        this.parent = undefined;
        this.attributes = {};
        this.start = pos;
    }
    getAttribute(attName) {
        return this.attributes[attName];
    }
    setAttribute(attName, value) {
        this.attributes[attName] = value;
    }
    clone() {
        const clone = new Node();
        clone.type = this.type;
        clone.start = this.start;
        clone.end = this.end;
        clone.name = this.name;
        clone.path = this.path;
        clone.sourcePath = this.sourcePath;
        clone.parent = this.parent;
        clone.children = this.children;
        clone.ending = this.ending;
        clone.content = this.content;
        clone.featureName = this.featureName;
        Object.keys(this.attributes).forEach((key) => {
            clone.setAttribute(key, this.getAttribute(key));
        });
        return clone;
    }
}
exports.Node = Node;
//# sourceMappingURL=interfaces.js.map