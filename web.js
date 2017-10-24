'use strict';

const http = require('http');
const url = require('url');
const zlib = require('zlib');

// demo #1 - including path and file system modules
const path = require('path');
const fs = require('fs');

const defaultFile = 'index.html';
const logFile = 'web.log';
const port = 3000;

// demo #5: rotate log file
try{
	
	fs.statSync(logFile);
	//web_1.log
	//web_2.log
	const {name : fileName, ext : fileExt } = path.parse(logFile);
	let i =0;
	let nextLogFile;
	try{
		do{
			nextLogFile = `${fileName}_${++i}${fileExt}`	
		}while(fs.statSync(nextLogFile));

	}catch(err){
		fs.renameSync(logFile, nextLogFile );
		console.log('log file was rotated');
	}

}catch(err){

	console.log('no log file to rotate');
}
// demo #4: append to log file
const log = entry => fs.appendFile ( logFile, `${entry}`, 'utf8');
const error = entry => log (`error: ${entry}\n`);
const info = entry => log (`info: ${entry}\n`);
const server = http.createServer((req, res) => {

	req.originalUrl = req.url;
	req.url = url.parse(req.url, true);
	req.path = req.url.pathname === '/' ? defaultFile : req.url.pathname;

	// demo #2: using path functions to create requested file name

	let dirName = path.dirname(req.path);
	if (dirName.endsWith('/')) {
		dirName = dirName.slice(0, dirName.length - 1);
	}

	const reqFileName = path.format({
		dir: path.join(__dirname, 'www', dirName),
		base: path.basename(req.path)
	});
	console.log( reqFileName );
	//Promises used here to chain multiple 
	//asynchronous operations
	const processBody = new Promise(resolve => {


	// demo #6: process request body data

	if( req.method === 'POST' ){
		const reqBodyDate = [];
		req.on('data', chunk => reqBodyDate.push (new Buffer(chunk)) );
		req.on('end', () => {
			console.log( Buffer.concat( reqBodyDate).toString('utf8'));
			resolve();
		});
	}else{
		resolve();
	}

	});	

	const processFile = new Promise(resolve => {

		

		// demo #3: read request file
		fs.readFile( reqFileName, 'utf8', (err, fileDate) => {
			if(err){
				error( err);
				res.writeHead(404);
				res.end();
				return;
			}
			info(`${req.method} ${req.originalUrl}`);
			res.writeHead(200);
			res.end(fileDate);
		});
		// demo #7: compressing response
		resolve();

		//res.writeHead(200);
		//res.end('Hello World!');

	});

	processBody.then(() => processFile);


});
server.listen(port, err => console.log(err || `web server started on port ${port}`));