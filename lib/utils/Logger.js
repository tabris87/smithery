const colors = require('colors/safe');
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

function postError(oError) {
    console.log(colors.error(oError.message));
    process.exit(1);
}

function postWarning(sWarning) {
    console.log(colors.warn(sWarning));
}

module.exports = {
    error: postError,
    warn: postWarning
}