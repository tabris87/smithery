import { ParserFactory } from './Parser';
import { GeneratorFactory } from './Generator';
import { RuleSet } from './RuleSet';
import { FSTNode } from './utils/FSTNode';
import { FSTTerminal } from './utils/FSTTerminal';

export class Imposer {
  private parserFactory: ParserFactory;
  private generatorFactory: GeneratorFactory;
  private ruleSet: RuleSet;

  constructor(parser: ParserFactory, generator: GeneratorFactory, rules: RuleSet) {
    this.parserFactory = parser;
    this.generatorFactory = generator;
    this.ruleSet = rules;
  }

  public impose(base: FSTNode, feature: FSTNode, visitorKeys: { [key: string]: string[] }): FSTNode {
    const match = this.ruleSet.getMatchingRule(base, feature);
    if (match) {
      return match.apply(base, feature, this);
    }

    /* new strategy:
     * 1. check if rule is matching
     * 2. otherwise traverse deeper
     * 3. comparison by id and path
     */

    const baseKeys: string[] = Object.keys(base).sort((a, b) => a.localeCompare(b));

    /* visitorKeys[base.type].forEach((childKeys) => {
      const index: number = baseKeys.indexOf(childKeys);
      if (index > -1) {
        baseKeys.splice(index, 1);
      }
    }); */

    /* const newNode = base.clone(); */
    //just add all necessary informations to the resulting node
    /* JS-Way ;)
      for (var key of aBaseKeys) {
       oNewNode[key] = base[key];
      } 
    */

    /* newNode.featureName = feature.featureName;
    const childKeys = visitorKeys[base.type]; */
    // check all childs and include all childs

    /* childKeys.forEach((childKey) => {
      const baseChilds = base[childKey];
      const featureChilds = feature[childKey];
      let resultingChilds: Node[] = [];

      if (typeof baseChilds === 'object' && Array.isArray(baseChilds)) {
        baseChilds.forEach((childBase) => {
          childBase.featureName = base.featureName;
          const childIndex: number[] = [];
          const childFeature = featureChilds.filter((featureChild: Node, index: number) => {
            if (featureChild.path === childBase.path && featureChild.name === childBase.name) {
              childIndex.push(index);
              return true;
            } else {
              return false;
            }
          });

          // if no child for the feature can be found take the base one
          if (childFeature.length === 0) {
            childBase.featureName = feature.featureName;
            resultingChilds.push(childBase);
          }

          // if a feature child is matching
          if (childFeature.length === 1) {
            const newChild: Node = childFeature[0];
            newChild.featureName = feature.featureName;
            const subImposeChildOne = this.impose(childBase, newChild, visitorKeys);
            if (Array.isArray(subImposeChildOne)) {
              resultingChilds = resultingChilds.concat(subImposeChildOne);
            } else {
              resultingChilds.push(subImposeChildOne);
            }

            //remove the feature childs afterwards
            featureChilds.splice(childIndex[0], 1);
          }

          if (childFeature.length > 1) {
            console.warn(
              'more than one child is matching find a rule to merge this node and its children more precisly.',
            );
            console.group();
            console.warn('Path: ' + base.path);
            console.warn('Name: ' + base.name);
            console.warn('PropertyKey: ' + childKey);
            console.group();
            childFeature.forEach((featureChild: Node) => {
              console.warn(featureChild.path + "' '" + featureChild.name);
            });
            console.groupEnd();
            console.groupEnd();

            const firstFeatureChild: Node = childFeature[0];

            const oSubImposeChildMany = this.impose(childBase, firstFeatureChild, visitorKeys);
            if (Array.isArray(oSubImposeChildMany)) {
              resultingChilds = resultingChilds.concat(oSubImposeChildMany);
            } else {
              resultingChilds.push(oSubImposeChildMany);
            }

            //remove the feature childs afterwards
            featureChilds.splice(childIndex[0], 1);
          }
        });

        // add missing 'new' feature childs
        resultingChilds = resultingChilds.concat(featureChilds);
        newNode[childKey] = resultingChilds;
      } else {
        if (typeof baseChilds === typeof featureChilds && typeof baseChilds === 'undefined') {
          newNode[childKey] = resultingChilds;
        } else if (typeof baseChilds === typeof featureChilds && !Array.isArray(featureChilds)) {
          baseChilds.featureName = base.featureName;
          featureChilds.featureName = feature.featureName;
          // Keep it without result distinguish
          newNode[childKey] = this.impose(baseChilds, featureChilds, visitorKeys);
        } else {
          throw new Error('Non array children differ');
        }
      }
    });

    return newNode; */
    return new FSTTerminal('', '');
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
