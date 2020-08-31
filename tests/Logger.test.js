//use describe() only for scoping if necessary
const {error, warn} = require('../lib/utils/Logger');


describe('Check warning method', () => {
    const origLog = console.log;
    afterEach(() => console.log = origLog)

    describe('Check warn output', () => {
        let consOutput = [];
        const mockedLog = output => consOutput.push(output);
        beforeEach(()=> console.log = mockedLog);

        it('trigger warning', ()=> {
            warn('test');
            expect(consOutput).toEqual(['test']);
        })
    });
})

test('First Check', () => {
    expect(1).toBe(1);
})