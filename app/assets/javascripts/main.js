angular.module("myapp", ["ngRoute", "ngAnimate", "mm.foundation"])
    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.
            when("/folders", {templateUrl: '/assets/views/folders.html', controller: 'FoldersCtrl'}).
            when("/folders/:id", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl',
                resolve: {
                    users: function($http) {
                        return $http.get("/share/users.json").success(function(data) {
                            return data;
                        });
                    },
                    folders: function($http) {
                        return $http.get("/folders.json").success(function(data) {
                            return data;
                        });
                    },
                    topics: function($http, $route) {
                        return $http.get("/folders/" + $route.current.params.id + ".json").success(function(data) {
                            return data;
                        });
                    }
                }
            }).
            when("/topics", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl',
                resolve: {
                    users: function($http) {
                        return $http.get("/share/users.json").success(function(data) {
                            return data;
                        });
                    },
                    folders: function($http) {
                        return $http.get("/folders.json").success(function(data) {
                            return data;
                        });
                    },
                    topics: function($http) {
                        return $http.get("/topics.json").success(function(data) {
                            return data;
                        });
                    }
                }
            }).
            when("/posts", {templateUrl: '/assets/views/posts.html', controller: 'PostsCtrl',
                resolve: {
                    posts: function($http) {
                        return $http.get("/posts.json").success(function(data) {
                            return data;
                        });
                    },
                    folders: function() { return 0; },
                    subtopics: function() { return 0; },
                    topicname: function() { return 0; }
                }
            }).
            when("/topics/:id", {templateUrl: '/assets/views/posts.html', controller: 'PostsCtrl',
                resolve: {
                    posts: function($http, $route) {
                        return $http.get("/topics/" + $route.current.params.id + ".json").success(function(data) {
                            return data;
                        });
                    },
                    folders: function($http) {
                        return $http.get("/folders.json").success(function(data) {
                            return data;
                        });
                    },
                    subtopics: function($http, $route) {
                        return $http.get("/subtopics/" + $route.current.params.id + ".json").success(function(data) {
                            return data;
                        });
                    },
                    topicname: function($http, $route) {
                        return $http.get("/topics/name/" + $route.current.params.id + ".json").success(function(data) {
                            return data;
                        });
                    }
                }
            }).
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

        $scope.isShared = true;

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
    .controller("TopicsCtrl", function ($scope, $location, $http, $routeParams, users, folders, topics) {
        $(document).foundation();

        $scope.users = users.data;
        $scope.folders = folders.data;
        $scope.topics = topics.data;

        if ($scope.folders) {
            for (var i = 0; i < $scope.folders.length; i++) {
                if ($scope.folders[i]._id.$oid == $routeParams.id) {
                    $scope.selectedFolder = i;
                }
            }
        }

        if ($scope.topics) {
            $scope.topics.forEach (function (topic) {
                if (topic.shared_with_ids) {
                    i = 0;
                    topic.shared_with_ids.forEach (function (entry) {
                        topic.shared_with_ids[i] = entry.$oid;
                    });
                }
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
            });
        };

        $scope.preShareTopic = function(item) {
            $scope.formData = item;

            $http.get("/share/users.json").
                success(function(data) {
                    $scope.users = data;
                });

            $('#shareTopicModal').foundation('reveal', 'open');
        }

        $scope.shareTopic = function(formData) {
            $http.put("/share/save/" + formData._id.$oid + ".json", formData).
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
                });
            }
        };
    })
    .controller("PostsCtrl", function ($scope, $routeParams, $http, folders, subtopics, posts, topicname) {
        $(document).foundation();

        $scope.posts = posts.data;

        if ($routeParams.id)
        {
            $scope.folders = folders.data;
            $scope.subtopics = subtopics.data;
            $scope.topicName = topicname.data;

            $scope.hiding = false;
        }
        else {
            $scope.hiding = true;
        }

        
        $scope.createPost = function(formData) {
            formData.topic_id = $routeParams.id;

            $http.post("/posts.json", formData).
                success(function(data) {
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

            if (item.topic_id) {
                $scope.formData.topic_id = item.topic_id.$oid;
            }

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
    });