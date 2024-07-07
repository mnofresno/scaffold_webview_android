angular.module('gastos.directives', [])
.directive('listaDinamica', function() {
    return {
        restrict: 'A',
        scope: {
            data: '=listaDinamica',
            getDetalle: '=detalle',
            deleteItem: '=delete'
        },
        templateUrl: function(element, attr)
        {
            return "templates/Layout/listaDinamica.html";
        }
    };
});
