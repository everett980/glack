'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
var loginWindow;

const ipcMain = electron.ipcMain;
var request = require('superagent');

var options = {
	client_id: '715ac625d0ddd505b9a0',
	client_secret: 'a2104af8e876ea5b8c856ae9b1ffae10e17631dd',
	scopes: ["user:email", "notifications"] // Scopes limit access for OAuth tokens.
};

var apiRequests = {
  get: function(url) {
    return request
      .get(url)
      .set('Accept', 'application/json');
  },

  post: function(url, params) {
    return request
      .post(url)
      .send(params)
      .set('Accept', 'application/json')
      .set('User-Agent', 'Gitify');
  },

  getAuth: function(url) {
    return request
      .get(url)
      .set('Accept', 'application/vnd.github.v3+json')
      .set('Authorization', 'token ' + AuthStore.authStatus())
      .set('Cache-Control', 'no-cache')
      .set('User-Agent', 'Gitify');
  }
};

var authObj;

// handle ipcMain logic here, away from window creation
ipcMain.on('auth value pls', function(event, arg) {
	console.log('auth value asked for');
	event.returnValue = authObj;
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function handleCallback (url) {
	console.log('in handle callback');
	var raw_code = /code=([^&]*)/.exec(url) || null;
	var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
	var error = /\?error=(.+)$/.exec(url);
	if (code || error) {
		// Close the browser if code found or error
		loginWindow.destroy();
	}
	//If there is a code, proceed to get token from github
	if (code) {
		requestGithubToken(options, code);
	} else if (error) {
		alert('Oops! Something went wrong and we couldn\'t' +
				'log you in using Github. Please try again.');
	}
};


function requestGithubToken(options, code) {
console.log('about to request');
						try {
					apiRequests
						.post('https://github.com/login/oauth/access_token', {
								client_id: options.client_id,
								client_secret: options.client_secret,
								code: code,
								})
					.end(function (err, response) {
						console.log('in end');
						if (response && response.ok) {
							// Success - Received Token.
							// Store it in localStorage maybe?
							console.log(response.body);
							authObj = response.body
							createChatWindow();
						} else {
							// Error - Show messages.
							console.log(err);
						}
					});
						} catch(e) {
							console.log(e);
						}
					}


function createChatWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 800, height: 600});

	// and load the index.html of the app.
	mainWindow.loadURL('file://' + __dirname + '/index.html');
	mainWindow.focus();
	console.log(mainWindow.isFocused());
	console.log(BrowserWindow.getFocusedWindow());

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', function() {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready',

		function() {
	loginWindow = new BrowserWindow({
		width: 880,
				height: 680,
				show: false
	});


	var githubUrl = 'https://github.com/login/oauth/authorize?';
	var authUrl = githubUrl + 'client_id=' + options.client_id + '&scope=' + options.scopes;

	loginWindow.loadURL(authUrl);
	// loginWindow.loadURL("http://facebook.com");
	loginWindow.webContents.on('will-navigate', function(event, url) {
		console.log('about to navigate');
	});
	loginWindow.webContents.on('did-get-redirect-request', function(event, oldUrl, newUrl) {
		console.log('redirect request');
		handleCallback(newUrl);
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
	console.log('the window really dead');
});

app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createChatWindow();
	}
});
