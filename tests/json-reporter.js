class JsonReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onTestResult(test, testResult, aggregatedResult) { }
    onTestFileResult(test, testResult, aggregatedResult) { }
    onTestCaseResult(test, testCaseResult) { }
    onRunStart(results, options) { }
    onTestStart(test) { }
    onTestFileStart(test) { }
    getLastError() { }

    onRunComplete(contexts, results) {
        console.log('Json Reporter output:');
        console.log('GlobalConfig: ', this._globalConfig);
        console.log('Options: ', this._options);
        console.log();
        console.log(contexts);
        console.log();
        console.log(results);
    }
}

module.exports = JsonReporter;