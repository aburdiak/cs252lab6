var watson = require('watson-developer-cloud');
var dispatcher = require('httpdispatcher');
var dispatch = require('dispatch');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/*
var connect = require('connect');
var serveStatic = require('serve-static');
var port = (process.env.VCAP_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
connect().use(serveStatic(__dirname)).listen(port,host, function(req, res) {
	console.log("connected on %s,%s", host,port);
});
*/

//Static Port
var PORT=(process.env.VCAP_APP_PORT || 3000);;
//LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');

app.use("/css", express.static(__dirname + '/public/css'));
app.use("/js", express.static(__dirname + '/public/js'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/signIn.html');
});

app.get('/signIn.html', function(req, res){
	res.sendFile(__dirname + '/public/signIn.html');
});
app.get('/chat.html', function(req, res){
	res.sendFile(__dirname + '/public/chat.html');
});
app.get('/createAccount.html', function(req, res){
	res.sendFile(__dirname + '/public/createAccount.html');
});


var language_translation = watson.language_translation({
     password: 'PXoa2VQJz12c',
     url: 'https://gateway.watsonplatform.net/language-translator/api',
     username: '5738b243-5f14-4559-af75-837343e2d963',
     version: 'v2'
});

function handleRequest(request, response){
	try {
		console.log(request.url);
		response.write();
		response.end("");
	} catch(err) {
		console.log(err);
	}
}
/*
serveStatic.get("/", function(req, res) {
	console.log(req.url);
	res.write("test");
});
*/
app.get("/", function(req, res) {
	console.log(req.url);
	res.write("test successful");
});

/*
http.listen(PORT, function() {
	console.log("Listening on %s", PORT);
});
*/
//var server = http.createServer(handleRequest);

io.on('connection', function(socket) {
	socket.on('chat message', function(msg){
		console.log("in chat message server");
		console.log(msg);
		io.emit('chat message', msg);
	});
	socket.on('retranslate', function(msg){
		console.log("in retrans server");
		console.log(msg);
		var idx = msg.indexOf("~");
		var message = msg.substring(0, idx);
		var rest = msg.substring(idx+1);
		var idx2 = rest.indexOf("~");
		var src = rest.substring(0, idx2);
		var rest2 = rest.substring(idx2 + 1);
		var idx3 = rest2.indexOf("~");
		var tar = rest2.substring(0, idx3);
		var user = rest2.substring(idx3 + 1);
		console.log("message", message);
		console.log("src", src);
		console.log("tar", tar);
		console.log("user", user);
		language_translation.translate({
    			text: message,
    			source: src,
    			target: tar
  		}, function(err, translation) {
    		if (err)
      			console.log(err)
    		else
      			//var json = JSON.parse(translation);{
			//var str = JSON.parse(translation);
			var str = JSON.stringify(translation).toString();
			//console.log(str);
			var index = str.indexOf('"translation":');
			var index2 = str.indexOf('"}],');
			
			index = index + 15;
			//console.log(index);
			var message = str.substring(index, index2);
			socket.emit('retranslate', message + "~" + src + "~" + tar + "~" + user);
			console.log("translated to: %s", message);
		});

		//io.emit('chat message' ,msg);
	});
	socket.on('username', function(msg){
		console.log("in username portion");
	});
});

http.listen(PORT, function() {
	console.log("Listening on: %s", PORT);
});



