import { Project } from '../Project';
import { expect } from 'chai';

import * as sinon from 'sinon';

import * as fs from 'fs';
import * as path from 'path';

import * as mock from 'mock-fs';

describe('Scenario test for a single build using a extended configuration with one feature folder and file', () => {
    beforeEach(() => {

    });

    afterEach(() => {
        mock.restore();
    });

    it('Perform build of one additional folder and file withing', () => {
        mock({
            'smithery.json': `{
                "model":"./model/model.xml",
                "configs":"configurations",
                "projectFiles":"features",
                "buildFolder":"build"
              }`,
            'configurations': {
                'default.config': 'Base',
                'one.config': 'Base\nOne'
            },
            'features': {
                'Base': {
                    'README.md': 'TEST'
                },
                'One': {
                    'src': {
                        'main.js': 'function run() {console.log("running");}\n\nrun();'
                    }
                }
            }
        })

        const mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        const writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

        const p = new Project();
        p.build('one');
        //first the build folder because this one is missing
        //second call for the root folder
        expect(mkdirSyncStub.calledThrice).to.be.true;
        expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build'))).to.be.true;
        debugger;
        expect(mkdirSyncStub.calledWith(path.join(process.cwd(), 'build', 'src'))).to.be.true;

        expect(writeFileSyncStub.calledTwice).to.be.true;
        expect(writeFileSyncStub.calledWith('README.md', 'utf-8'));
        expect(writeFileSyncStub.calledWith('src', 'utf-8'));

        mock.restore();
        mkdirSyncStub.restore();
        writeFileSyncStub.restore();
    });
});
