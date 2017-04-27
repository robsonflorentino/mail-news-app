var application = angular.module('app', ['angular-redactor']);

application.factory('$sendMailService', function($http) {
  var service = {};

  service.sendmail = function (data, fnSuccess, fnError) {
    $http.post('/api/sendmail', data).success(fnSuccess).error(fnError);
  }

  return service;
});


application.controller('main', function($scope, $sendMailService) {
	
    $scope.templateMail = 'partials/templateMail.html',
    $scope.newsList = [];
    $scope.news = {};

    $scope.add = function() {
      if ($scope.news.title && $scope.news.desc) {
        $scope.newsList.push($scope.news);
        $scope.news = {};
      }
    };

    $scope.mailData = {
      data: ''
    }

    $scope.send = function() {
      $scope.mailData.data = $("#mailPreview").html();
      $sendMailService.sendmail($scope.mailData, function(data, status){
        if(!data.error) {
          BootstrapDialog.show({
            type: BootstrapDialog.TYPE_SUCCESS,
            title: 'Mensagem',
            message: 'Email enviado com sucesso!',
            buttons: [{
              label: 'Fechar',
              action: function(dialog){
                location.reload();
              }
            }]
          });
        } else {
          BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            title: 'Mensagem',
            message: 'Ocorreu um erro ao enviar o email, contate o administrador.',
            buttons: [{
              label: 'Fechar',
              action: function(dialog){
                dialog.close();
              }
            }]
          });
        }
      }, function(data, status){
        BootstrapDialog.show({
          type: BootstrapDialog.TYPE_WARNING,
          title: 'Mensagem',
          message: 'Ocorreu um erro ao enviar o email, contate o administrador.',
          buttons: [{
            label: 'Fechar',
            action: function(dialog){
              dialog.close();
            }
          }]
        });
      });
    }
});


application.directive('contentPreview', function ($compile){
  return {
    restric: 'A',
    template:  '<div ng-include="templateMail"></div>',
    replace: true,
    link: function ($scope, $element, $attrs) {
      $scope.$watch('newsList', _reload, true);
      $scope.$watch($attrs.contentPreview, _reload, true);

      function _reload (preview) {
        if(preview && preview.newsList) {
          $scope.newsList = preview.newsList;
        }

        $compile($element.contents())($scope);
      }
    }
  };
});

application.filter('to_trusted', ['$sce', function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);
