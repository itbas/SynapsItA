angular.module("myapp", ["ngRoute", "ngAnimate"])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.
            when("/folders", {templateUrl: '/assets/views/folders.html', controller: 'FoldersCtrl'}).
            when("/folders/:id", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl'}).
            when("/topics", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl'}).
            when("/topics/:id", {templateUrl: '/assets/views/posts.html', controller: 'PostsCtrl'}).
            otherwise({ templateUrl: '/assets/views/home.html', controller: 'IndexCtrl'});
    }])
    .filter("createHyperlinks", function ($sce) {
        return function (str) {
            return $sce.trustAsHtml(str.
                                    replace(/(http[^\s]+)/g, '<a href="$1" target="_blank">$1</a>').
                                    replace(/(#[^\s]+)/g, '<a href="/search/$1">$1</a>').
                                    replace(/\n/g, '<br>').
//                                    replace(/</g, '&lt;').
//                                    replace(/>/g, '&gt;').
                                    replace(/\t/g, '&nbsp;')
                                   );
        }
    })
    .controller("IndexCtrl", function ($scope) {
        $scope.title = "SynapsIt";
    })
    .controller("FoldersCtrl", function ($scope, $http) {
        $(document).foundation();

        $http.get("/folders.json").
            success(function(data) {
                console.log(data);
                $scope.folders = data;
            });
        
        $scope.delFolder = function (id, $index) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/folders/" + id + ".json").
                success(function(data) {
                    $scope.folders.splice($index, 1);
                });
            }
        };
    })
    .controller("PostsCtrl", function ($scope, $routeParams, $http) {
        $(document).foundation();

        $http.get("/topics/" + $routeParams.id + ".json").
            success(function(data) {
                $scope.posts = data;
            });
        
        $scope.topic_name = "XYZ";
        
        $scope.createPost = function(formData) {
            $http.post("/posts.json", {topic_id: $routeParams.id, content: formData.content}).
            success(function(data) {
                $scope.posts.push(data);
                
                $scope.formData = {};
                $('#createPostModal').foundation('reveal', 'close');
            });
        };
        
        $scope.preEditPost = function($index) {
            $scope.formData = $scope.posts[$index];
            $('#editPostModal').foundation('reveal', 'open');
        }
        
        $scope.editPost = function(formData) {
            $http.put("/posts/" + formData.sid + ".json", {content: formData.content}).
            success(function(data) {
                $scope.formData = {};
                $('#editPostModal').foundation('reveal', 'close');
            });
        };

        $scope.delPost = function (id, $index) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/posts/" + id + ".json").
                success(function(data) {
                    $scope.posts.splice($index, 1);
                });
            }
        };
    })
    .controller("TopicsCtrl", function ($scope, $location, $http, $routeParams) {
        $(document).foundation();

        $http.get("/folders.json").
            success(function(data) {
                $scope.folders = data;
                
                this.myFolders = data;
                console.log(this.myFolders);
            });
        
        if ($routeParams.id) {
            $http.get("/folders/" + $routeParams.id + ".json").
                success(function(data) {
                    $scope.topics = data;
                    
                    if (this.myFolders) {
                        for (var i = 0; i < this.myFolders.length; i++) {
                            if (this.myFolders[i].sid == $routeParams.id) {
                                $scope.selectedFolder = i;
                            }
                        }
                    }
                });
        }            
        else {
            $http.get("/topics.json").
                success(function(data) {
                    $scope.topics = data;
                });
        }

        $scope.createFolder = function (formData) {
            $http.post("/folders.json", formData).
            success(function(data) {
                $scope.folders.push(data);

                $scope.formData = {};
                $('#folderModal').foundation('reveal', 'close');
            });
        };
/*        
        $scope.viewTopicsOfFolder = function (id, $index) {
            $http.get("/folders/" + id + ".json").
                success(function(data) {
                    $scope.selectedFolder = $index;
                    $scope.topics = data;
                });
        };
*/
        $scope.viewTopic = function (id) {
            $location.url("/topics/" + id)
        };

        $scope.createTopic = function (formData) {
            $http.post("/topics.json", formData).
            success(function(data) {
                console.log(data);

                $scope.topics.push(data);

                $scope.formData = {};
                $('#topicModal').foundation('reveal', 'close');

                $location.url("/topics/" + data.sid)
            });
        };
        
        $scope.preEditTopic = function($index) {
            $scope.formData = $scope.topics[$index];
            $('#editTopicModal').foundation('reveal', 'open');
        }
        
        $scope.editTopic = function(formData) {
            $http.put("/topics/" + formData.sid + ".json", formData).
            success(function(data) {
                $scope.formData = {};
                $('#editTopicModal').foundation('reveal', 'close');
            });
        };

        $scope.delTopic = function (id, $index) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/topics/" + id + ".json").
                success(function(data) {
                    $scope.topics.splice($index, 1);
                    $location.url("/topics")
                });
            }
        };
    });