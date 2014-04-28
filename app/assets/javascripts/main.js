angular.module("myapp", ["ngRoute"])
    .config(function ($routeProvider) {
        $routeProvider.
            when("/topics/:id", {templateUrl: '/assets/views/posts.html', controller: 'TopicsCtrl'}).
            otherwise({ templateUrl: '/assets/views/home.html', controller: 'IndexCtrl'});
    })
    .filter("createHyperlinks", function ($sce) {
        return function (str) {
            return $sce.trustAsHtml(str.
                                    replace(/</g, '&lt;').
                                    replace(/>/g, '&gt;').
                                    replace(/(http[^\s]+)/g, '<a href="$1">$1</a>')
                                   );
        }
    })
    .controller("IndexCtrl", function ($scope) {
        $scope.title = "Home Page";
    })
    .controller("TopicsCtrl", function ($scope, $routeParams, $http) {
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
                $('#myPostModal').foundation('reveal', 'close');
            });
        };

        $scope.delPost = function (topicId, $index) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/posts/" + topicId + ".json").
                success(function(data) {
                    $scope.posts.splice($index, 1);
                });
            }
        };
    })
    .controller("NavCtrl", function ($scope, $location, $http) {
        $http.get("/topics.json").
            success(function(data) {
                $scope.topics = data;
                console.log(data);
            });

        $scope.viewTopic = function (topicId, $index) {
            $scope.selectedIndex = $index;
            $location.url("/topics/" + topicId)
        };

        $scope.createTopic = function (formData) {
            $http.post("/topics.json", formData).
            success(function(data) {
                console.log(data);

                $scope.topics.push(data);

                $scope.formData = {};
                $('#myModal').foundation('reveal', 'close');

                $location.url("/topics/" + data.sid)
            });
        };

        $scope.delTopic = function (topicId, $index) {
            var toDelete = confirm('Are you absolutely sure you want to delete?');   

            if (toDelete) {
                $http.delete("/topics/" + topicId + ".json").
                success(function(data) {
                    $scope.topics.splice($index, 1);
                    $location.url("/")
                });
            }
        };
    });