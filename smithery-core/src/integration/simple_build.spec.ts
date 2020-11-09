import { Project } from '../Project';
import { expect } from 'chai';

import * as sinon from 'sinon';

import * as fs from 'fs';
import * as path from 'path';

import * as mock from 'mock-fs';

describe('Scenario test for a single build using the default configuration', () => {
    beforeEach(() => {

    });

    afterEach(() => {
        mock.restore();
    });

    it('Perform build of simple basic Base folder only', () => {
        mock({
            'smithery.json': `{
                "model":"./model/model.xml",
                "configs":"configurations",
                "projectFiles":"features",
                "buildFolder":"build"
              }`,
            'configurations': {
                'default.config': 'Base'
            },
            'features': {
                'Base': {
                    'README.md': 'TEST'
                }
            }
        })

        const mkdirSyncSpy = sinon.spy(fs, 'mkdirSync');
        const writeFileSyncSpy = sinon.spy(fs, 'writeFileSync');

        const p = new Project();
        p.build('default');

        expect(mkdirSyncSpy.calledOnce).to.be.true;
        expect(mkdirSyncSpy.calledWith(path.join(process.cwd(), 'build'))).to.be.true;

        expect(writeFileSyncSpy.calledOnce).to.be.true;
        expect(writeFileSyncSpy.calledWith('README.md', 'utf-8'));

        mock.restore();
        mkdirSyncSpy.restore();
        writeFileSyncSpy.restore();
    });
});
