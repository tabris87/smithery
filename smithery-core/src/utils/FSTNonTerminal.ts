import { FSTNode } from "./FSTNode";

/**
 * Non Terminal FSTNode type
 * containing necessary sub nodes
 */
export class FSTNonTerminal extends FSTNode {
    private _children: FSTNode[] = [];

    /**
     * Contructor
     * 
     * @param type the typeInformation as string 
     * @param name the unique node name
     * @param [children] possible children
     */
    public constructor(type: string, name: string, children?: FSTNode[]) {
        super(type, name);
        if (children && children.length > 0) {
            this._children = children;
        }
    }

    /**
     * Getter for children
     */
    public getChildren(): FSTNode[] {
        return this._children;
    }

    /**
     * Return child from specific place or nothing
     * @param place the place to select from
     * @returns FSTNode or undefined
     */
    public getChildAt(place: number): FSTNode | undefined {
        if ((this._children.length - 1) <= place && place >= 0) {
            return this._children[place];
        } else {
            return undefined
        }
    }

    /**
     * Add a single child to the FSTNonTerminal
     * 
     * @param node the child to add 
     * @returns the current instance for chaining
     */
    public addChild(node: FSTNode): FSTNonTerminal {
        this._children.push(node);
        return this;
    }

    /**
     * Add a list of nodes
     * 
     * @param nodes the list of nodes to add 
     */
    public addChildren(nodes: FSTNode[]): void {
        if (this._children.length > 0) {
            this._children = [...this._children, ...nodes];
        } else {
            this._children = nodes;
        }
    }

    /**
     * @override
     */
    public toString(): string {
        return JSON.stringify({
            type: this.getType(),
            name: this.getName(),
            childs: this._children.map(c => {
                return JSON.parse(c.toString());
            })
        });
    }
}