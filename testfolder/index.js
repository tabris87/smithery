const xml2js = require('xml2js');
const fs = require('fs');

var xmlString = fs.readFileSync('./model.xml', 'utf-8');
var xml = xml2js.parseString(xmlString, function (err, result) {
    console.dir(result);
});

var parser = new xml2js.Parser();
parser.parseStringPromise(xmlString).then(function (result) {
        console.dir(result);
        debugger;
        console.log('Done');
    })
    .catch(function (err) {
        console.log('Error');
    });