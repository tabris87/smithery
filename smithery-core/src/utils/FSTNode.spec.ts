import { expect } from 'chai';
import 'mocha';
import { FSTNonTerminal } from './FSTNonTerminal';
import { FSTTerminal } from './FSTTerminal';

describe('FSTNode capabilities testing', () => {
    describe('FSTNonTerminal checks', () => {
        it('Test instantiation', () => {
            const nt = new FSTNonTerminal('test', 'test_non_terminal');

            expect(nt).not.to.be.undefined;
            expect(nt.getChildren()).to.be.empty;
            expect(nt.getFeatureName()).to.be.empty;
            expect(nt.getParent()).to.be.undefined;
            expect(nt.getType()).to.be.equal('test');
            expect(nt.getName()).to.be.equal('test_non_terminal');
        });

        it('Test additional information adding', () => {
            const nt = new FSTNonTerminal('test', 'test_non_terminal');

            nt.setFeatureName('base');

            expect(nt.getChildren()).to.be.empty;
            expect(nt.getFeatureName()).to.be.equal('base');
            expect(nt.getParent()).to.be.undefined;
        });

        it('Test stringification', () => {
            const nt = new FSTNonTerminal('test', 'test_non_terminal');

            expect(nt.toString()).to.be.equal(JSON.stringify({
                type: 'test',
                name: 'test_non_terminal',
                children: []
            }))
        });
    });

    describe('FSTTerminal checks', () => {
        it('Test instantiation', () => {
            const t = new FSTTerminal('test', 'test_terminal');

            expect(t).not.to.be.undefined;
            expect(t.getFeatureName()).to.be.empty;
            expect(t.getCodeLanguage()).to.be.empty;
            expect(t.getMergeStrategy()).to.be.empty;
            expect(t.getName()).to.be.equal('test_terminal');
            expect(t.getType()).to.be.equal('test');
        });

        it('Test instantiation with content', () => {
            const t = new FSTTerminal('test', 'test_terminal', 'Node content');

            expect(t).not.to.be.undefined;
            expect(t.getFeatureName()).to.be.empty;
            expect(t.getCodeLanguage()).to.be.empty;
            expect(t.getMergeStrategy()).to.be.empty;
            expect(t.getName()).to.be.equal('test_terminal');
            expect(t.getType()).to.be.equal('test');
            expect(t.getContent()).to.be.equal('Node content');
        });

        it('Test additional information adding', () => {
            const t = new FSTTerminal('test', 'test_terminal');

            t.setCodeLanguage('cl');
            t.setFeatureName('base');
            t.setMergeStrategy('*');

            expect(t.getCodeLanguage()).to.be.equal('cl');
            expect(t.getFeatureName()).to.be.equal('base');
            expect(t.getMergeStrategy()).to.be.equal('*');
        });

        it('Test stringification', () => {
            const t = new FSTTerminal('test', 'test_terminal');

            expect(t.toString()).to.be.equal(JSON.stringify({
                type: 'test',
                name: 'test_terminal',
                content: ''
            }))
        });
    });

    describe('Tree of FSTNodes', () => {
        let root: FSTNonTerminal;
        beforeEach('Setup tree', () => {
            root = new FSTNonTerminal('folder', 'root');
            const child1 = new FSTTerminal('file', 'child1', 'content1');
            const child2 = new FSTTerminal('file', 'child2', 'content2');
            const child3 = new FSTNonTerminal('folder', 'child3');
            const child3_1 = new FSTTerminal('file', 'child3_1');
            const child3_2 = new FSTTerminal('file', 'child3_2');

            root.addChildren([child1, child2, child3]);
            child1.setParent(root);
            child2.setParent(root);
            child3.setParent(root);

            child3.addChild(child3_1);
            child3.addChild(child3_2);
            child3_1.setParent(child3);
            child3_2.setParent(child3);
        });

        it('Check children count', () => {
            expect(root.getChildren().length).to.be.equal(3);
        });

        it('Check children at', () => {
            expect(root.getChildAt(0)).not.to.be.undefined;
            expect(root.getChildAt(0)?.getName()).to.be.equal('child1');
            expect(root.getChildAt(0)?.getType()).to.be.equal('file');

            expect(root.getChildAt(1)).not.to.be.undefined;
            expect(root.getChildAt(1)?.getName()).to.be.equal('child2');
            expect(root.getChildAt(1)?.getType()).to.be.equal('file');

            expect(root.getChildAt(2)).not.to.be.undefined;
            expect(root.getChildAt(2)?.getName()).to.be.equal('child3');
            expect(root.getChildAt(2)?.getType()).to.be.equal('folder');

            expect(root.getChildAt(3)).to.be.undefined;
            expect(root.getChildAt(-1)).to.be.undefined;
        });

        it('Check stringification', () => {
            expect(root.toString()).to.be.equal(JSON.stringify({
                type: 'folder',
                name: 'root',
                children: [
                    {
                        type: 'file',
                        name: 'child1',
                        content: 'content1'
                    },
                    {
                        type: 'file',
                        name: 'child2',
                        content: 'content2'
                    },
                    {
                        type: 'folder',
                        name: 'child3',
                        children: [
                            {
                                type: 'file',
                                name: 'child3_1',
                                content: ''
                            },
                            {
                                type: 'file',
                                name: 'child3_2',
                                content: ''
                            }
                        ]
                    }
                ]
            }));
        });

        it('Check adding of children', () => {
            root.addChildren([
                new FSTTerminal('file', 'new_child1'),
                new FSTTerminal('file', 'new_child2')
            ]);
            expect(root.getChildren().length).to.be.equal(5);
        });

        it('Test deepClone', () => {
            const copy = root.deepClone();
            expect(copy).to.be.not.equal(root);
        });

        it('Check tree path', () => {
            expect(root.getChildren().length).to.be.equal(3);
            const c3 = root.getChildAt(2);
            expect(c3 instanceof FSTNonTerminal).to.be.true;
            expect((c3 as FSTNonTerminal).getChildren().length).to.be.equal(2);
            const c3_2 = (c3 as FSTNonTerminal).getChildAt(1);
            expect(c3_2 instanceof FSTTerminal).to.be.true;
            expect(c3_2?.getTreePath()).to.be.equal('root<&>child3<&>child3_2');
        });
    });
});