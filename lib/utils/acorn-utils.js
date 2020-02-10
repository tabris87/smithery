var Node = function Node(pos) {
    this.type = "";
    this.start = pos;
    this.end = 0;
};

var SourceLocation = function SourceLocation(start, end, sourceFile) {
    this.start = start;
    this.end = end;
    if (typeof sourceFile !== "undefined") {
        this.source = sourceFile;
    }
};

module.exports = {
    Node: Node,
    SourceLocation: SourceLocation
}