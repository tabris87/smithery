import { FSTNonTerminal } from "./FSTNonTerminal";

/**
 * Default FSTNode type providing rudimentary node information
 */
export abstract class FSTNode {
    private _type: string = "";
    private _name: string = "";
    private _parent: FSTNonTerminal | undefined;
    private _feat: string = "";

    /**
     * Contructor
     * 
     * @param type typeInformation as string
     * @param name unique name of the node
     */
    public constructor(type: string, name: string) {
        this._type = type;
        this._name = name;
    }
    //#region public
    /**
     * Compare this node with another one 
     * @param node the node to compare with
     * @returns the result if both nodes are equal or not
     */
    public compatibleWith(node: FSTNode): boolean {
        return this._name.localeCompare(node.getName()) === 0 && this._type.localeCompare(node.getType()) === 0;
    }
    //#endregion

    //#region getter/setter
    /**
     * Get the type information
     */
    public getType(): string {
        return this._type;
    }

    /**
     * Get the node name
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Set the parent of this node
     */
    public setParent(par: FSTNonTerminal | undefined): void {
        this._parent = par;
    }

    /**
     * Get a possible parent of this node
     */
    public getParent(): FSTNonTerminal | undefined {
        return this._parent;
    }

    /**
     * Set the feature name related to this node
     * @param name feature name
     */
    public setFeatureName(name: string): void {
        this._feat = name;
    }

    /**
     * return the feature name related to this node
     * @returns the name of the assigned feature
     */
    public getFeatureName(): string {
        return this._feat;
    }

    /**
     * return the path until this node
     */
    public getTreePath(): string {
        if (typeof this.getParent() !== 'undefined') {
            return this.getParent()?.getTreePath() + '<&>' + this._name;
        } else {
            return this._name;
        }
    }
    //#endregion
    //#region abstract methods

    /**
     * Creates the String representation from the node
     * @returns the JSON representation
     */
    public abstract toString(): string;

    /**
     * Create a deepClone copy of this node
     * @returns a fresh instance of this node
     */
    public abstract deepClone(): FSTNode;

    /**
     * Create a shallowClone copy of this node
     * @returns a fresh instance of this node with all references copied
     */
    public abstract shallowClone(): FSTNode;
    //#endregion
}