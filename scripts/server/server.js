
var express = require('express');
var fs	    = require('fs');
var path    = require('path');
var app	    = express();

const publicDir = './public/';
const port = process.env.PORT;


fs.readdir(publicDir, (err, fileNames) => {
    fileNames.forEach((fileName) => {
    	app.get('/' + fileName, (request, response, next) => {
    	    console.log(`\'${fileName}\' requested!`);
    	    response.status(200).sendFile(fileName, { root: publicDir });
    	});
    });
});

app.get('/', (request, response, next) => {
    console.log('/ request!');

    var resBody = "<html>";
    resBody += "<body>";
    resBody += "<h1>Hello World!</h1>";
    resBody += "</body>";
    resBody += "</html>";

    response.send(resBody);
});

app.listen(port, () => { console.log(`Server is a go on port ${port}`); });
