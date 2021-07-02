import { ParserFactory } from './Parser';
import { GeneratorFactory } from './Generator';
import { RuleSet } from './RuleSet';
import { FSTNode } from './utils/FSTNode';
import { FSTTerminal } from './utils/FSTTerminal';
import { FSTNonTerminal } from './utils/FSTNonTerminal';
import { Rule } from './Rule';

export class Imposer {
	private parserFactory: ParserFactory;
	private generatorFactory: GeneratorFactory;
	private ruleSet: RuleSet;

	constructor(parser: ParserFactory, generator: GeneratorFactory, rules: RuleSet) {
		this.parserFactory = parser;
		this.generatorFactory = generator;
		this.ruleSet = rules;
	}

	public impose(features: { [key: string]: FSTNode }, featureOrder: string[]): FSTNode {
		let composed: FSTNode | undefined;
		for (const featureName of featureOrder) {
			//Several features will be merged in this node. Therefore its original feature is removed.
			const current = features[featureName];
			//maybe set original feature name to ""			
			//setOriginalFeatureName((FSTNonTerminal)current, "");
			if (typeof composed !== 'undefined') {
				composed = this.composeTrees(composed, current);
			} else {
				composed = current;
			}
		}

		return composed ? composed : new FSTTerminal('', '');
	}

	/**
	 * Set the original feature of FSTTerminals, because the tree is composed and this
	 * information would be lost.
	 */
	/* protected setOriginalFeatureName(node: FSTNonTerminal, feature: string) => void {
	   if (node.getType().equals("Feature")) {
		   feature = node.getName();
	   }
	   for (let child : node.getChildren()) {
		   if (child instanceof FSTNonTerminal) {
			   setOriginalFeatureName((FSTNonTerminal) child, feature);
		   } else if (child instanceof FSTTerminal) {
			   (child as FSTTerminal).setOriginalFeatureName(feature);
		   }
	   }
   } */

	private composeTrees(nodeA: FSTNode, nodeB: FSTNode, compParent?: FSTNonTerminal): FSTNode | undefined {
		if (nodeA.compatibleWith(nodeB)) {
			const compNode: FSTNode = nodeA.shallowClone();
			compNode.setParent(compParent);

			// composed SubTree-stub is integrated in the new Tree, needs
			// children
			if (nodeA instanceof FSTNonTerminal && nodeB instanceof FSTNonTerminal) {
				const nonterminalA: FSTNonTerminal = nodeA as FSTNonTerminal;
				const nonterminalB: FSTNonTerminal = nodeB as FSTNonTerminal;
				const nonterminalComp: FSTNonTerminal = compNode as FSTNonTerminal;

				for (const childB of nonterminalB.getChildren()) {
					const childA = nonterminalA.getCompatibleChild(childB);
					// for each child of B get the first compatible child of A
					// (CompatibleChild means a Child which root equals B's
					// root)
					if (typeof childA === 'undefined') {
						// no compatible child, FST-node only in B
						nonterminalComp.addChild(childB.deepClone());
					} else {
						nonterminalComp.addChild(this.composeTrees(childA, childB, nonterminalComp));
					}
				}
				for (const childA of nonterminalA.getChildren()) {
					const childB = nonterminalB.getCompatibleChild(childA);
					if (typeof childB === 'undefined') {
						// no compatible child, FST-node only in A
						this.handleChildWithoutCompatibleSiblings(childA, nonterminalComp);
					}
				}
				return nonterminalComp;
			} else if (nodeA instanceof FSTTerminal && nodeB instanceof FSTTerminal && compParent instanceof FSTNonTerminal) {
				const terminalA: FSTTerminal = nodeA as FSTTerminal;
				const terminalB: FSTTerminal = nodeB as FSTTerminal;
				const terminalComp: FSTTerminal = compNode as FSTTerminal;
				const nonterminalParent: FSTNonTerminal = compParent as FSTNonTerminal;

				//get applicable rule from compositionRules
				const applicableRule = this.ruleSet.getRule(terminalA.getMergeStrategy());
				if (typeof applicableRule !== 'undefined') {
					//apply composition rule
					/* try { */
					applicableRule.apply(terminalA, terminalB, terminalComp, nonterminalParent, this);

					/* } catch (CompositionException e) {
						fireCompositionErrorOccured(e);
					} */
				} else {
					throw new Error(`don't know how to compose terminals: ${terminalB.toString()} replaces ${terminalA.toString()}`);
				}
				return terminalComp;
			}
		}
	}

	private handleChildWithoutCompatibleSiblings(node: FSTNode, compParent: FSTNonTerminal): void {
		compParent.addChild(node);
	}

	//#region getter/setter
	public setParserFactory(parser: ParserFactory): void {
		this.parserFactory = parser;
	}

	public setGeneratorFactory(generator: GeneratorFactory): void {
		this.generatorFactory = generator;
	}

	public setRuleSet(rules: RuleSet): void {
		this.ruleSet = rules;
	}

	public getParserFactory(): ParserFactory {
		return this.parserFactory;
	}

	public getGeneratorFactory(): GeneratorFactory {
		return this.generatorFactory;
	}

	public getRuleSet(): RuleSet {
		return this.ruleSet;
	}
	//#endregion
}

/*
	private FSTNode compose(List<FSTNonTerminal> tl) {
		FSTNode composed = null;
		for (FSTNode current : tl) {
			// Several features will be merged in this node. Therefore its original feature is removed.
			setOriginalFeatureName((FSTNonTerminal)current, "");
			if (composed != null) {
				composed = compose(current, composed);
			} else {
				if (cmd.featureAnnotation) {
					addAnnotationToChildrenMethods(current, current.getFeatureName());
				}
				composed = current;
			}
		}
		return composed;
	}

	public FSTNode compose(FSTNode nodeA, FSTNode nodeB) {
		return compose(nodeA, nodeB, null);
	}

	public FSTNode compose(FSTNode nodeA, FSTNode nodeB,
			FSTNonTerminal compParent) {

		if (nodeA.compatibleWith(nodeB)) {
			FSTNode compNode = nodeA.getShallowClone();
			compNode.setParent(compParent);

			// composed SubTree-stub is integrated in the new Tree, needs
			// children
			if (nodeA instanceof FSTNonTerminal
					&& nodeB instanceof FSTNonTerminal) {
				FSTNonTerminal nonterminalA = (FSTNonTerminal) nodeA;
				FSTNonTerminal nonterminalB = (FSTNonTerminal) nodeB;
				FSTNonTerminal nonterminalComp = (FSTNonTerminal) compNode;

				for (FSTNode childB : nonterminalB.getChildren()) {
					FSTNode childA = nonterminalA.getCompatibleChild(childB);
					// for each child of B get the first compatible child of A
					// (CompatibleChild means a Child which root equals B's
					// root)
					if (childA == null) {
						// no compatible child, FST-node only in B
						nonterminalComp.addChild(childB.getDeepClone());
					} else {
						nonterminalComp.addChild(compose(childA, childB,
								nonterminalComp));
					}
				}
				for (FSTNode childA : nonterminalA.getChildren()) {
					FSTNode childB = nonterminalB.getCompatibleChild(childA);
					if (childB == null) {
						// no compatible child, FST-node only in A
						handleChildWithoutCompatibleSiblings(childA, nonterminalComp);
					}
				}
				return nonterminalComp;
			} else if (nodeA instanceof FSTTerminal
					&& nodeB instanceof FSTTerminal
					&& compParent instanceof FSTNonTerminal) {
				FSTTerminal terminalA = (FSTTerminal) nodeA;
				FSTTerminal terminalB = (FSTTerminal) nodeB;
				FSTTerminal terminalComp = (FSTTerminal) compNode;
				FSTNonTerminal nonterminalParent = (FSTNonTerminal) compParent;

				CompositionRule applicableRule = null;
				//get applicable rule from compositionRules
				for (CompositionRule rule: compositionRules) {
					if (terminalA.getCompositionMechanism().equals(rule.getRuleName())) {
						 applicableRule = rule;
						 break;
					}
				}
				if (applicableRule != null) {
					//apply composition rule
					try {
						applicableRule.compose(terminalA, terminalB, terminalComp, nonterminalParent);
					} catch (CompositionException e) {
						fireCompositionErrorOccured(e);
					}
				} else {
					System.err
							.println("Error: don't know how to compose terminals: "
									+ terminalB.toString()
									+ " replaces "
									+ terminalA.toString());
				}
				return terminalComp;
			}
			return null;
		} else
			return null;
	}
*/