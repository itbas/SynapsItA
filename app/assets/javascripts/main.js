angular.module("myapp", [])
    .config(function ($routeProvider) {
        $routeProvider.
            when("/topics/:id", {templateUrl: '/assets/views/posts.html', controller: 'TopicsCtrl'}).
            otherwise({ templateUrl: '/assets/views/home.html', controller: 'IndexCtrl'});
    })
    .controller("IndexCtrl", function ($scope) {
        $scope.title = "Home Page";
    })
    .controller("TopicsCtrl", function ($scope, $routeParams, $http) {
        $scope.topic_name = "XYZ";

        $http.get("/topics/" + $routeParams.id).
            success(function(data) {
                $scope.posts = data;
            });

        console.log($routeParams);
    })
    .controller("NavCtrl", function ($scope, $location, $http) {
        $http.get("/topics").
            success(function(data) {
                $scope.topics = data;
            });

        $scope.viewTopic = function (topicId) {
            $location.url("/topics/" + topicId)
        };

        $scope.createTopic = function (formData) {
            $http.post("/topics", formData).
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
                $http.delete("/topics/" + topicId).
                success(function(data) {
                    $scope.topics.splice($index, 1);
                    $location.url("/")
                });
            }
        };
    });