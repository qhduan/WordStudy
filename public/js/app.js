
var WordStudy = angular.module("WordStudy", ["ngRoute", "ngAnimate", "WordStudyControllers"]);

WordStudy.config(["$routeProvider", function ($routeProvider) {
  $routeProvider.
    when("/main", {
      templateUrl: "template/main.html",
      controller: "mainController"
    }).
    when("/study", {
      templateUrl: "template/study.html",
      controller: "studyController"
    }).
    when("/review", {
      templateUrl: "template/review.html",
      controller: "reviewController"
    }).
    when("/list", {
      templateUrl: "template/list.html",
      controller: "listController"
    }).
    when("/library", {
      templateUrl: "template/library.html",
      controller: "libraryController"
    }).
    when("/manual", {
      templateUrl: "template/manual.html",
      controller: "manualController"
    }).
    when("/setting", {
      templateUrl: "template/setting.html",
      controller: "settingController"
    }).
    otherwise({
      redirectTo: "/main"
    });
}]);

WordStudy.config(["$sceProvider", function ($sceProvider) {
  $sceProvider.enabled(false);
}]);

WordStudy.directive('shortcut', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    link: function postLink (scope, iElement, iAttrs) {
      $(document).on('keypress', function(e){
         scope.$apply(scope.keyPressed(e));
      });
    }
  };
});
