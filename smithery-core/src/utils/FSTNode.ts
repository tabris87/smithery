import { FSTNonTerminal } from "./FSTNonTerminal";

/**
 * Default FSTNode type providing rudimentary node information
 */
export abstract class FSTNode {
    private _type: string = "";
    private _name: string = "";
    private _parent: FSTNonTerminal | undefined;

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

    /**
     * Get the type information
     */
    public getType(): string {
        return this._type;
    }

    /**
     * Set the type information
     */
    public setType(typing: string): void {
        this._type = typing;
    }

    /**
     * Get the node name
     */
    public getName(): string {
        return this._name;
    }

    /**
     * Set the node name
     */
    public setName(name: string): void {
        this._name = name;
    }

    /**
     * Set the parent of this node
     */
    public setParent(par: FSTNonTerminal): void {
        this._parent = par;
    }

    /**
     * Get a possible parent of this node
     */
    public getParent(): FSTNonTerminal | undefined {
        return this._parent;
    }

    /**
     * Creates the String representation from the node
     * @returns the JSON representation
     */
    public toString(): string {
        return JSON.stringify({
            type: this._type,
            name: this._name
        });
    }
}