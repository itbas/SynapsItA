angular.module("myapp", ["ngRoute", "ngAnimate", "mm.foundation", "ui.tree"])
    .config(["$routeProvider", "$httpProvider", function ($routeProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');

        var interceptor = ["$window", "$rootScope", "$q", function($window, $rootScope, $q) {
            function success(response) {
                return response
            };

            function error(response) {
                if (response.status == 401) {
//                  $rootScope.$broadcast('event:unauthorized');
                    $window.location.href = "/users/sign_in";
                    return response;
                };
                return $q.reject(response);
            };

            return function(promise) {
                return promise.then(success, error);
            };
        }];
        $httpProvider.responseInterceptors.push(interceptor);

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
                    }                    
                }
            }).
            when("/topics", {templateUrl: '/assets/views/topics.html', controller: 'TopicsCtrl',
                resolve: {
                    folders: function($http) {
                        return $http.get("/folders.json").success(function(data) {
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
    .service("flash", function($rootScope, $http) {
        var msgQueue = [];

        $rootScope.$on("$routeChangeSuccess", function() {
            $http.get("/messages/in.json").success(function(data) {
                msgQueue = data;
            });
        });

        return {
            isMessage: function() {
                return msgQueue.length
            },
            getMessage: function() {
                console.log("msgQueue: " + msgQueue);
                return msgQueue;
            },
            delMessage: function(msg) {
                console.log("msg: " + msg);
                $http.delete("/messages/" + msg._id.$oid + ".json");

                msgQueue.splice(msgQueue.indexOf(msg), 1);
            }
        };
    })
    .filter("createHyperlinks", function ($sce) {
        return function (str) {
            var strStr = str;

            if (str.lastIndexOf(".jpg") > 0 || str.lastIndexOf(".gif") > 0 || str.lastIndexOf(".png") > 0) {
                retStr = $sce.trustAsHtml(str.
                                            replace(/(http[^\s]+)/g, '<a href="$1" target="_blank"><img src="$1" height="320" width="240"></a>')
                                         );
            }
            else if (str.indexOf(".youtube.") > 0) {
                if (str.indexOf("&") > 0) {
                    str = str.substring(0, str.indexOf("&"));
                }

                retStr = $sce.trustAsHtml(str.
                                            replace("m.youtube.", "www.youtube.").
                                            replace("watch?v=", "embed/").
                                            replace(/(http[^\s]+)/g, '<div class="flex-video"><iframe width="320" height="240" src="$1" frameborder="0" allowfullscreen></iframe></div>')
                                         );
            }
            else {
                retStr = $sce.trustAsHtml(str.
                                            replace(/ /g, '&nbsp;').
                                            replace(/(http[^\s]+)/g, '<a href="$1" target="_blank">$1</a>').
                                            replace(/(file:[^\s]+)/g, '<a href="$1" target="_blank">$1</a>').
                                            replace(/\n/g, '<br>')
                                         );
            }

            return retStr;
        }
    })
    .controller("IndexCtrl", function ($scope, flash) {
        $scope.title = "SynapsIt";
        $scope.flash = flash;
    })
    .controller("SharesCtrl", function ($scope, $http, $location, flash) {
        $(document).foundation();

        $scope.isShared = true;

        $http.get("/share/current_user.json").
            success(function(data) {
                $scope.currentUser = data;
            });

        $http.get("/share/list.json").
            success(function(data) {
                $scope.topics = data;                
            });
/*
        $scope.viewTopic = function (id) {
            $location.url("/topics/" + id)
        };
*/
        $scope.preCreatePost = function(post) {
            $scope.formData = {};
            $scope.formData.topic_id = post._id.$oid;
            $('#createPostModal').foundation('reveal', 'open');
        }

        $scope.createPost = function(formData) {
            $http.post("/posts.json", formData).
                success(function(data) {
                    $('#createPostModal').foundation('reveal', 'close');

                    $scope.topics.forEach (function (topic) {
                        if (topic._id.$oid == formData.topic_id) {
                            topic.posts.unshift(data);
                        }
                    })

                    $scope.formData = {};
                });
        };

        $scope.delPost = function (topic, post) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/posts/" + post._id.$oid + ".json").
                success(function(data) {
                    topic.posts.splice(topic.posts.indexOf(post), 1);
                });
            }
        };

        $scope.preEditPost = function(post) {
            $scope.formData = post;
            $('#editPostModal').foundation('reveal', 'open');
        };
        
        $scope.editPost = function(formData) {
            $http.put("/posts/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#editPostModal').foundation('reveal', 'close');
                $scope.formData = {};
            });
        };

        $scope.preMovePost = function(post) {
/*
            $http.get("/topics.json").
                success(function(data) {
                    $scope.topics = data;
                });
*/
            $scope.formData = post;
            $scope.formData.topic_id = post.topic_id.$oid;

            $('#movePostModal').foundation('reveal', 'open');
        };

        $scope.movePost = function(formData) {
            $http.put("/posts/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#movePostModal').foundation('reveal', 'close');

                $scope.topics.forEach (function (topic) {
                    if (topic.posts.indexOf(formData) == 0) {
                        topic.posts.splice(topic.posts.indexOf(formData), 1);
                    }

                    if (topic._id.$oid == formData.topic_id) {
                        topic.posts.unshift(formData);
                    }
                })

                $scope.formData = {};
            });
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
    .controller("TopicsCtrl", function ($scope, $location, $http, $routeParams, flash, folders) {
        $(document).foundation();

        $scope.flash = flash;

        $scope.folders = folders.data;
        $scope.isLoading = true;

        $http.get("/share/users.json").success(function(data) {
            $scope.users = data;
        });

        if ($routeParams.id) {
            $http.get("/folders/" + $routeParams.id + ".json").success(function(data) {
                $scope.topics = data;
            });
        }
        else {
            $http.get("/topics.json").success(function(data) {
                $scope.topics = data;
            });
        }

        $scope.$watch("topics", function() {
            if ($scope.topics) {
                $scope.topics.forEach (function (topic) {
                    if (topic.shared_with_ids) {
                        i = 0;
                        topic.shared_with_ids.forEach (function (entry) {
                            topic.shared_with_ids[i] = entry.$oid;
                        });
                    }
                });
                
                $scope.isLoading = false;
            }
       });

        if ($scope.folders) {
            for (var i = 0; i < $scope.folders.length; i++) {
                if ($scope.folders[i]._id.$oid == $routeParams.id) {
                    $scope.selectedFolder = i;
                }
            }
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
                $('#createTopicModal').foundation('reveal', 'close');
                $scope.formData = {};

                $scope.topics.push(data);
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

        $scope.preCreatePost = function(post) {
            $scope.formData = {};
            $scope.formData.topic_id = post._id.$oid;
            $('#createPostModal').foundation('reveal', 'open');
        }

        $scope.createPost = function(formData) {
            $http.post("/posts.json", formData).
                success(function(data) {
                    $('#createPostModal').foundation('reveal', 'close');

                    $scope.topics.forEach (function (topic) {
                        if (topic._id.$oid == formData.topic_id) {
                            topic.posts.unshift(data);
                        }
                    })

                    $scope.formData = {};
                });
        };

        $scope.delPost = function (topic, post) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/posts/" + post._id.$oid + ".json").
                success(function(data) {
                    topic.posts.splice(topic.posts.indexOf(post), 1);
                });
            }
        };

        $scope.preEditPost = function(post) {
            $scope.formData = post;
            $('#editPostModal').foundation('reveal', 'open');
        };
        
        $scope.editPost = function(formData) {
            $http.put("/posts/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#editPostModal').foundation('reveal', 'close');
                $scope.formData = {};
            });
        };

        $scope.preMovePost = function(post) {
/*
            $http.get("/topics.json").
                success(function(data) {
                    $scope.topics = data;
                });
*/
            $scope.formData = post;
            $('#movePostModal').foundation('reveal', 'open');
        };

        $scope.movePost = function(formData) {
            formData.topic_id = formData.topic_id.$oid;

            $http.put("/posts/" + formData._id.$oid + ".json", formData).
            success(function(data) {
                $('#movePostModal').foundation('reveal', 'close');

                $scope.topics.forEach (function (topic) {
                    if (topic.posts && topic.posts.indexOf(formData) == 0) {
                        topic.posts.splice(topic.posts.indexOf(formData), 1);
                    }

                    if (topic._id.$oid == formData.topic_id) {
                        if (topic.posts == null) {
                            topic.posts = [];
                        }

                        topic.posts.unshift(formData);
                    }
                })

                $scope.formData = {};
            });
        };

        var getRootNodesScope = function() {
          return angular.element(document.getElementById("tree-root")).scope();
        };

        $scope.collapseAll = function() {
          var scope = getRootNodesScope();
          scope.collapseAll();
        };

        $scope.expandAll = function() {
          var scope = getRootNodesScope();
          scope.expandAll();
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