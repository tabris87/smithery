import { FSTNode } from "./FSTNode";

/**
 * FSTTerminal node to provide the leaves with all necessary informations
 */
export class FSTTerminal extends FSTNode {
    private _content: string = "";
    private _strat: string = "";
    private _meta: {
        code_lang: string
    }

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

        this._meta = {
            code_lang: ""
        };
    }

    /**
     * Returns the content of the leaf
     */
    public getContent(): string {
        return this._content;
    }

    /**
     * Set the content for this terminal
     * @param content the new content assigned to the node
     */
    public setContent(content: string): void {
        this._content = content;
    }

    /**
     * Set the correct merge strategy for the terminal node
     * @param strategyName Unique name of the merge strategy
     */
    public setMergeStrategy(strategyName: string): void {
        this._strat = strategyName;
    }

    /**
     * Returns the merge strategy identifier
     * @returns the unique identifier
     */
    public getMergeStrategy(): string {
        return this._strat;
    }

    /**
     * Set the necessary code lang indication at the node metadata
     * @param lang assigned for the terminal node
     */
    public setCodeLanguage(lang: string): void {
        this._meta.code_lang = lang;
    }

    /**
     * Get the code language assigned to this node
     * @returns the assigned language for this node
     */
    public getCodeLanguage(): string {
        return this._meta.code_lang;
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

    /**
     * @override
     */
    public deepClone(): FSTNode {
        const clone = new FSTTerminal(this.getType(), this.getName(), this.getContent());
        clone.setCodeLanguage(this.getCodeLanguage());
        clone.setFeatureName(this.getFeatureName());
        clone.setMergeStrategy(this.getMergeStrategy());
        clone.setParent(this.getParent());
        this.getParent()?.addChild(clone);
        return clone;
    }

    /**
     * @override
     */
    public shallowClone(): FSTNode {
        const clone = new FSTTerminal(this.getType(), this.getName(), this.getContent());
        clone.setCodeLanguage(this.getCodeLanguage());
        clone.setFeatureName(this.getFeatureName());
        clone.setMergeStrategy(this.getMergeStrategy());
        clone.setParent(this.getParent());
        this.getParent()?.addChild(clone);
        return clone;
    }
}