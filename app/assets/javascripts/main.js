angular.module("myapp", ["ngRoute", "ngAnimate", "mm.foundation"])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.
            when("/folders", {templateUrl: '/assets/views/folders.html', controller: 'FoldersCtrl'}).
            when("/folders/:id", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl'}).
            when("/topics", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl'}).
            when("/posts", {templateUrl: '/assets/views/posts.html', controller: 'PostsCtrl'}).
            when("/topics/:id", {templateUrl: '/assets/views/posts.html', controller: 'PostsCtrl'}).
            when("/shares", {templateUrl: '/assets/views/topics.html', controller: 'SharesCtrl'}).
            otherwise({ templateUrl: '/assets/views/home.html', controller: 'IndexCtrl'});
    }])
    .filter("createHyperlinks", function ($sce) {
        return function (str) {
            return $sce.trustAsHtml(str.
                                    replace(/ /g, '&nbsp;').
                                    replace(/(http[^\s]+)/g, '<a href="$1" target="_blank">$1</a>').
                                    replace(/(file:[^\s]+)/g, '<a href="$1" target="_blank">$1</a>').
                                    replace(/\n/g, '<br>')
//                                    replace(/</g, '&lt;').
//                                    replace(/>/g, '&gt;').
                                   );
        }
    })
    .controller("IndexCtrl", function ($scope) {
        $scope.title = "SynapsIt";
    })
    .controller("SharesCtrl", function ($scope, $http, $location) {
        $(document).foundation();

        $http.get("/share/list.json").
            success(function(data) {
                $scope.topics = data;
            });

        $scope.viewTopic = function (id) {
            $location.url("/topics/" + id)
        };
    })
    .controller("FoldersCtrl", function ($scope, $http) {
        $(document).foundation();

        $http.get("/folders.json").
            success(function(data) {
                $scope.folders = data;
            });

        $scope.preEditFolder = function(item) {
            $scope.formData = item;
            $('#editFolderModal').foundation('reveal', 'open');
        };
        
        $scope.editFolder = function(formData) {
            $http.put("/folders/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#editFolderModal').foundation('reveal', 'close');
                $scope.formData = {};
            });
        };
        
        $scope.delFolder = function (item) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/folders/" + item._id.$oid + ".json").
                success(function(data) {
                    $scope.folders.splice($scope.folders.indexOf(item), 1);
                });
            }
        };
    })
    .controller("PostsCtrl", function ($scope, $routeParams, $http) {
        $(document).foundation();

        if ($routeParams.id)
        {
            $http.get("/topics/" + $routeParams.id + ".json").
                success(function(data) {
                    $scope.posts = data;
                });

            $http.get("/subtopics/" + $routeParams.id + ".json").
                success(function(data) {
                    $scope.subtopics = data;
                });

            $http.get("/folders.json").
                success(function(data) {
                    $scope.folders = data;
                });

            $http.get("/topics/name/" + $routeParams.id + ".json").
                success(function(data) {
                    $scope.topicName = data;
                });

            $scope.hiding = false;
        }
        else {
            $http.get("/posts.json").
                success(function(data) {
                    $scope.posts = data;
                });

            $scope.hiding = true;
        }

        
        $scope.createPost = function(formData) {
            formData.topic = $routeParams.id;

            $http.post("/posts.json", formData).
            success(function(data) {
                console.log(data);

                $('#createPostModal').foundation('reveal', 'close');
                $scope.formData = {};

                $scope.posts.unshift(data);
            });
        };
        
        $scope.preEditPost = function(item) {
            $scope.formData = item;
            $('#editPostModal').foundation('reveal', 'open');
        };
        
        $scope.editPost = function(formData) {
            $http.put("/posts/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#editPostModal').foundation('reveal', 'close');
                $scope.formData = {};
            });
        };

        $scope.preMovePost = function(item) {
            $http.get("/topics.json").
                success(function(data) {
                    $scope.topics = data;
                });

            $scope.formData = item;
            $('#movePostModal').foundation('reveal', 'open');
        };

        $scope.movePost = function(formData) {
            $http.put("/posts/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#movePostModal').foundation('reveal', 'close');
                $scope.formData = {};

                $scope.posts.splice($scope.posts.indexOf(formData), 1);
            });
        };

        $scope.delPost = function (item) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/posts/" + item._id.$oid + ".json").
                success(function(data) {
                    $scope.posts.splice($scope.posts.indexOf(item), 1);
                });
            }
        };

        $scope.createSubTopic = function(formData) {
            formData.parent_topic = $routeParams.id;

            $http.post("/topics.json", formData).
            success(function(data) {
                $('#subTopicModal').foundation('reveal', 'close');
                $scope.formData = {};

                $scope.subtopics.push(data);
            });
        }
    })
    .controller("TopicsCtrl", function ($scope, $location, $http, $routeParams) {
        $(document).foundation();

        $http.get("/folders.json").
            success(function(data) {
                $scope.folders = data;
                
                this.myFolders = data;
            });
        
        if ($routeParams.id) {
            $http.get("/folders/" + $routeParams.id + ".json").
                success(function(data) {
                    $scope.topics = data;
                    
                    if (this.myFolders) {
                        for (var i = 0; i < this.myFolders.length; i++) {
                            if (this.myFolders[i]._id.$oid == $routeParams.id) {
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
                $('#folderModal').foundation('reveal', 'close');
                $scope.formData = {};

                $scope.folders.push(data);
            });
        };

        $scope.viewTopic = function (id) {
            $location.url("/topics/" + id)
        };

        $scope.createTopic = function (formData) {
            $http.post("/topics.json", formData).
            success(function(data) {
                $('#topicModal').foundation('reveal', 'close');
                $scope.formData = {};

                $scope.topics.unshift(data);
                $location.url("/topics/" + data._id.$oid)
            });
        };
        
        $scope.preEditTopic = function(item) {
            $scope.formData = item;

            if (item.folder_id) {
                $scope.formData.folder_id = item.folder_id.$oid;
            }

            $('#editTopicModal').foundation('reveal', 'open');
        }
        
        $scope.editTopic = function(formData) {
            $http.put("/topics/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#editTopicModal').foundation('reveal', 'close');
                $scope.formData = {};

                console.log(data);
            });
        };

        $scope.preShareTopic = function(item) {
            $scope.formData = item;           
            i = 0;

            if (item) {
                item.shared_with_ids.forEach (function (entry) {
                    $scope.formData.shared_with_ids[i] = entry.$oid;
                });
            }
            console.log($scope.formData);

            $http.get("/share/users.json").
                success(function(data) {
                    $scope.users = data;
                });

            $('#shareTopicModal').foundation('reveal', 'open');
        }

        $scope.shareTopic = function(formData) {
            $http.put("/topics/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#shareTopicModal').foundation('reveal', 'close');
                $scope.formData = {};
            });
        };

        $scope.delTopic = function (item) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/topics/" + item._id.$oid + ".json").
                success(function(data) {
                    $scope.topics.splice($scope.topics.indexOf(item), 1);
                    $location.url("/topics")
                });
            }
        };
    });