import { IRule } from '../Interfaces';
import { Imposer } from '../Imposer';
import { FSTNode } from '../utils/FSTNode';
import { FSTNonTerminal } from '../utils/FSTNonTerminal';
import { FSTTerminal } from '../utils/FSTTerminal';

export const rule: IRule = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    apply: (base: FSTNode, feature: FSTNode, newNode: FSTNode, parent: FSTNonTerminal | undefined, _: Imposer): void => {
        if (base instanceof FSTNonTerminal || feature instanceof FSTNonTerminal) {
            throw new Error(`'base' Node or 'feature' Node not of type terminal, therefore not imposable by this rule.`);
        }

        if (!base.compatibleWith(feature)) {
            throw new Error(`'base' Node and 'feature' Node not compatible`);
        }

        (newNode as FSTTerminal).setContent((feature as FSTTerminal).getContent());
        (newNode as FSTTerminal).setCodeLanguage((feature as FSTTerminal).getCodeLanguage());
        (newNode as FSTTerminal).setMergeStrategy((feature as FSTTerminal).getMergeStrategy());
        (newNode as FSTTerminal).setParent(parent);
    },
    id: 'fileOverride',
    package: 'smithery-core'
};
