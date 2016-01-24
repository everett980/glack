const ipc = require('electron').ipcRenderer;
const Github = require('github-api');

app.controller("MainCtrl", ["$scope", "$firebaseArray",
		function($scope, $firebaseArray) {
			$scope.authObj = ipc.sendSync('auth value pls', 'yo');
			$scope.currentRepo = null;
			console.log($scope.authObj);
			//CREATE A FIREBASE REFERENCE
			var ref = new Firebase("https://blazing-torch-4812.firebaseIO.com/");
			// GET MESSAGES AS AN ARRAY
			$scope.messages = $firebaseArray(ref);
			//ADD MESSAGE METHOD
			$scope.addMessage = function(messageObj) {
				console.log('in addMessage function');
				console.log(messageObj);
				//ADD TO FIREBASE
				$scope.messages.$add({
					from: $scope.user.name,
					body: messageObj,
					repo: $scope.currentRepo
				});
				//RESET MESSAGE
				$scope.message.message = "";
				$scope.message.name= "";
			}
			//Get file path
			var holder = document.getElementById('holder');
			holder.ondragover = function () {
				return false;
			};
			holder.ondragleave = holder.ondragend = function () {
				return false;
			};
			holder.ondrop = function (e) {
				e.preventDefault();
				var file = e.dataTransfer.files[0];
				console.log('File you dragged here is', file.path);
				return false;
			};

			//Github Interactions
			var github = new Github({
				token: $scope.authObj.access_token,
				auth: 'oauth'
			});
			var user = github.getUser();
			user.show(null, function(err, user) {
				$scope.user = user;
				console.log(user);
			});

			$scope.test = function() {
				console.log('i am a test');
				console.log(angular.element( document.querySelector('#chooseFile')).val());
			}
			user.repos(null, function(err, repos) {
				if(err) return console.error(err);
				$scope.repoArr = repos;
			})
			$scope.setActive = function(repoName) {
				$scope.currentRepo = repoName;
			}

		}
])
