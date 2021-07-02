import { expect, assert } from 'chai';
import * as sinon from 'sinon';

/* class MockParser implements IParser {
    [key: string]: any;
    parse(content: string, options?: { [key: string]: any; }): Node {
        return new Node();
    }
    getVisitorKeys(): { [key: string]: string[]; } {
        return {};
    }
} */

/* class MockGenerator implements IGenerator {
    [key: string]: any;
    generate(oAST: { [key: string]: any; }, options?: { [key: string]: any; }): string {
        return 'blub';
    }
} */

describe('Check if the rule for file imposing works correctly', () => {
    /* let parserMock: IParser; */
    /* let generatorMock: IGenerator; */
    /* before(() => {
        parserMock = new MockParser();
        generatorMock = new MockGenerator();
    }); */

    it('concrete test have to be defined', () => {
        expect.fail;
    })
});