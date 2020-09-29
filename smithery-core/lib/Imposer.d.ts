import { ParserFactory } from './Parser';
import { GeneratorFactory } from './Generator';
import { RuleSet } from './RuleSet';
import { Node } from './interfaces';
export declare class Imposer {
    private parserFactory;
    private generatorFactory;
    private ruleSet;
    static sortByType(value1: any, value2: any): number;
    constructor(parser: ParserFactory, generator: GeneratorFactory, rules: RuleSet);
    impose(baseFST: Node, featureFST: Node, visitorKeys: {
        [key: string]: string[];
    }): Node;
    setParser(parser: ParserFactory): void;
    setGenerator(generator: GeneratorFactory): void;
    setRuleSet(rules: RuleSet): void;
    getParserFactory(): ParserFactory;
    getGeneratorFactory(): GeneratorFactory;
    getRuleSet(): RuleSet;
}
