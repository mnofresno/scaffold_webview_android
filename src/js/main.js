import angular from 'angular';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/dialog';
import 'jquery-ui/themes/base/all.css';  // Importa el CSS de jQuery UI
import '../css/styles.css';  // Tu propio CSS

const app = angular.module('webviewApp', []);

app.controller('MainController', ['$scope', function($scope) {
    $scope.message = 'Hello, WebView!';

    // Inicializar el diálogo cuando el DOM esté completamente cargado
    angular.element(document).ready(function() {
        $("#dialog").dialog({
            autoOpen: false,
            modal: true,
            buttons: {
                "Ok": function() {
                    $(this).dialog("close");
                }
            }
        });
    });

    // Función para abrir el diálogo
    $scope.openDialog = function() {
        $("#dialog").dialog("open");
    };
}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['webviewApp']);
});
