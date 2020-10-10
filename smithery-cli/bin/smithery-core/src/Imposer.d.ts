import { ParserFactory } from './Parser';
import { GeneratorFactory } from './Generator';
import { RuleSet } from './RuleSet';
import { Node } from './utils/Node';
export declare class Imposer {
    private parserFactory;
    private generatorFactory;
    private ruleSet;
    constructor(parser: ParserFactory, generator: GeneratorFactory, rules: RuleSet);
    impose(baseFST: Node, featureFST: Node, visitorKeys: {
        [key: string]: string[];
    }): Node;
    setParserFactory(parser: ParserFactory): void;
    setGeneratorFactory(generator: GeneratorFactory): void;
    setRuleSet(rules: RuleSet): void;
    getParserFactory(): ParserFactory;
    getGeneratorFactory(): GeneratorFactory;
    getRuleSet(): RuleSet;
}
