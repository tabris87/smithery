module.exports = {
    verbose: true,
    bail: 1,
    testEnvironment: "node",
    //we had to add 'lib' for the code coverage
    roots: ["tests", "lib"],
    collectCoverage: true,
    collectCoverageFrom: [
        "lib/**/*.js"
    ],
    coverageDirectory: "tests/reports/coverage",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    coverageReporters: [
        "text",
        "html",
        "json"
    ],
    reporters: [
        "default",
        [
            "jest-html-reporters",
            {
                filename: "./tests/reports/latestTest.html",
                expand: false,
                pageTitle: "smithery",
                hideIcon:true
            }
        ]
    ]
}