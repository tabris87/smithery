import { Imposer } from "../Imposer";
import { FSTNode, FSTNonTerminal } from "../utils";

export interface IRule {
    apply: (baseFST: FSTNode, featureFST: FSTNode, targetNode: FSTNode, parent: FSTNonTerminal | undefined, context: Imposer) => void;
    id: string;
    package: string;
}