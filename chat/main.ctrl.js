const ipc = require('electron').ipcRenderer;
const Github = require('github-api');
const fs = require('fs')
// need to work on committing
app.controller("MainCtrl", ["$scope", "$firebaseArray",
  function($scope, $firebaseArray) {
    $scope.uploadFilePath = null;
    $scope.contents = null;
    var repo = null;
    $scope.authObj = ipc.sendSync('auth value pls', 'yo');
    $scope.currentRepo = null;
    //CREATE A FIREBASE REFERENCE
    var ref = new Firebase("https://blazing-torch-4812.firebaseIO.com/");
    // GET MESSAGES AS AN ARRAY
    $scope.messages = $firebaseArray(ref);
    //ADD MESSAGE METHOD
    $scope.addMessage = function(messageObj) {
        //ADD TO FIREBASE
        $scope.messages.$add({
          from: $scope.user.name,
          body: messageObj,
          repo: $scope.currentRepo
        });
        //RESET MESSAGE
        $scope.message.message = "";
        $scope.message.name = "";
      }
      //Get file path
    var holder = document.getElementById('holder');
    holder.ondragover = function() {
      return false;
    };
    holder.ondragleave = holder.ondragend = function() {
      return false;
    };
    holder.ondrop = function(e) {
      e.preventDefault();
      var file = e.dataTransfer.files[0];
      console.log('File you dragged here is', file.path);
      $scope.uploadFilePath = file.path.substring(1)
      $scope.contents = fs.readFileSync("/"+$scope.uploadFilePath).toString()
      $scope.$digest()
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
      console.log(angular.element(document.querySelector('#chooseFile')).val());
    }
    user.repos(null, function(err, repos) {
      if (err) return console.error(err);
      $scope.repoArr = repos;
    })
    $scope.setActive = function(repoName) {
      $scope.currentRepo = repoName;
      repo = github.getRepo($scope.user.login, $scope.currentRepo);
    }


    $scope.commitChange = function(commit) {
      if (!$scope.currentRepo) {
        alert('Please select a repo first')
      } else {
        var options = {
          author: {
            name: 'Author Name',
            email: 'author@example.com'
          },
          committer: {
            name: 'Committer Name',
            email: 'committer@example.com'
          },
          encode: true // Whether to base64 encode the file. (default: true)
        }
				console.log('this is repo', repo)
        repo.write(commit.branch, "asd", $scope.contents, commit.message, options, function(err){console.log(err)})
      }

    }

  }
])
