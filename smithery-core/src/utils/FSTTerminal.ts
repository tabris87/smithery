import { FSTNode } from "./FSTNode";

/**
 * FSTTerminal node to provide the leaves with all necessary informations
 */
export class FSTTerminal extends FSTNode {
    private _content: string = "";

    /**
     * Constructor
     * 
     * @param type type information as string
     * @param name unique name of the node
     * @param content 
     */
    constructor(type: string, name: string, content?: string) {
        super(type, name);
        if (content && content.length > 0) {
            this._content = content;
        }
    }

    /**
     * Returns the content of the leaf
     */
    public getContent(): string {
        return this._content;
    }

    /**
     * @override
     */
    public toString(): string {
        return JSON.stringify({
            type: this.getType(),
            name: this.getName(),
            content: this._content
        })
    }
}