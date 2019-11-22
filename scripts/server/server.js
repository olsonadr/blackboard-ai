
var express = require('express');
var fs	    = require('fs');
var path    = require('path');
var app	    = express();

const publicDir = '../../public/'; // Was undefined as "./public/"
const port = process.env.PORT || 3000;

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

    response.status(200).sendFile("index.html", { root: publicDir });
});

app.listen(port, () => { console.log(`Server is a go on port ${port}`); });
