var tcpServer;
var commandWindow;
var wv;
/**
 * Listens for the app launching then creates the window
 * 
 * @see https://developer.chrome.com/apps/app_runtime
 * @see https://developer.chrome.com/apps/app_window
 */
chrome.app.runtime.onLaunched.addListener(function() {
	if (commandWindow && !commandWindow.contentWindow.closed) {
		commandWindow.focus();
	} else {
		chrome.app.window.create('index.html', {
			id : "mainwin",
			innerBounds : {
				width : 500,
				height : 309,
				left : 0
			}
		}, function(w) {
			w.contentWindow.onload = function() {
				wv = this.document.querySelector('webview');
				wv.addEventListener('permissionrequest', function(e) {
					if (e.permission === 'media') {
						e.request.allow();
					}
				});
				wv.addEventListener('consolemessage', function(e) {
					console.log('Guest page logged a message: ', e.message);
					// send result to each tcp client
					for (var i = 0; i < tcpServer.openSockets.length; i++) {
						try {
							tcpServer.openSockets[i].sendMessage(e.message);
						} catch (ex) {
							console.log(ex);
						}
					}
				});

				commandWindow = w;
			}
		});
	}
});

// event logger
var log = (function() {
	var logLines = [];
	var logListener = null;

	var output = function(str) {
		if (str.length > 0 && str.charAt(str.length - 1) != '\n') {
			str += '\n'
		}
		logLines.push(str);
		if (logListener) {
			logListener(str);
		}
	};

	var addListener = function(listener) {
		logListener = listener;
		// let's call the new listener with all the old log lines
		for (var i = 0; i < logLines.length; i++) {
			logListener(logLines[i]);
		}
	};

	return {
		output : output,
		addListener : addListener
	};
})();

function onAcceptCallback(tcpConnection, socketInfo) {
	var info = "[" + socketInfo.peerAddress + ":" + socketInfo.peerPort
			+ "] Connection accepted!";
	log.output(info);
	console.log(socketInfo);
	tcpConnection.addDataReceivedListener(function(data) {
		var lines = data.split(/[\n\r]+/);
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.length > 0) {
				var info = "[" + socketInfo.peerAddress + ":"
						+ socketInfo.peerPort + "] " + line;
				log.output(info);
				if(line == "start"){
					console.log("click recognitionStartButton");
					wv.executeScript({code: "document.getElementById('recognitionStartButton').click()"});
				}else if(line == "stop"){
					console.log("click recognitionStopButton");
					wv.executeScript({code: "document.getElementById('recognitionStopButton').click()"});
				}else{
				}
				/*
				var cmd = line.split(/\s+/);
				try {
					//call ./commands/BrowserCommands.js
					tcpConnection.sendMessage(Commands
							.run(cmd[0], cmd.slice(1)));
				} catch (ex) {
					tcpConnection.sendMessage(ex);
				}
				*/
			}
		}
	});
};

function startServer(addr, port) {
	if (tcpServer) {
		tcpServer.disconnect();
	}
	tcpServer = new TcpServer(addr, port);
	tcpServer.listen(onAcceptCallback);
}

function stopServer() {
	if (tcpServer) {
		tcpServer.disconnect();
		tcpServer = null;
	}
}

function getServerState() {
	if (tcpServer) {
		return {
			isConnected : tcpServer.isConnected(),
			addr : tcpServer.addr,
			port : tcpServer.port
		};
	} else {
		return {
			isConnected : false
		};
	}
}
