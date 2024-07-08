angular.module('gastos.interceptors', [])

.factory('CheckNetworkInterceptor', function($q, $injector, Network) {
    return {
        request: function(config) {

            if (config.url.indexOf('templates') === 0) return config;

            var deferred = $q.defer();

            switch(Network.getNetwork()) {
                case Connection.ETHERNET:
                case Connection.WIFI:
                    deferred.resolve(config);
                    break;

                case Connection.UNKNOWN:
                case Connection.CELL_2G:
                case Connection.CELL_3G:
                case Connection.CELL_4G:
                    deferred.resolve(config);
                /*case Connection.CELL:
                    $injector.get('$abcPopup').confirm({
                        cssClass: 'popup-container-balanced',
                        title: '<h1><i class="icon ion-information-circled"></i></h1>',
                        template: 'La operación consumirá datos de su servicio, ¿desea continuar?',
                        cancelText: 'Cancelar',
                        okText: 'Aceptar'
                    }).then(function(result) {
                        if (result) {
                            deferred.resolve(config);
                        } else {
                            deferred.reject({
                                status: '500',
                                statusText: 'Cancelado por el usuario',
                                data: 'El usuario ha cancelado la operación'
                            });
                        }
                    });*/
                    break;

                case Connection.NONE:
                    deferred.reject({
                        status: '500',
                        statusText: 'Conección a Internet',
                        data: 'No tiene acceso a Internet'
                    });
                    break;
            }

            return deferred.promise;
        }
    };
})

.factory('LoadingInterceptor', function($rootScope, $q) {
    return {
        request: function(config) {
            $rootScope.$broadcast('loading:show');
            return config;
        },
        response: function(response) {
            $rootScope.$broadcast('loading:hide');
            return response;
        },
        responseError: function(rejection) {
            $rootScope.$broadcast('loading:hide');

            var deferred = $q.defer();
            deferred.reject(rejection);
            return deferred.promise;
        }
    };
})

.factory('sessionInjector', function($localStorage, $rootScope, $q)
{
    var self = this;

    var logoutNow = function()
    {
        $localStorage.delete('usuario');
        $rootScope.$broadcast('unauthorized');
    };

    self.request = function(config)
    {
        var usuario = $localStorage.get('usuario');
        if (usuario !== undefined)
        {
            config.headers['authorization'] = 'bearer ' + usuario.token;
        }
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        return config;
    };

    self.response = function(response)
    {
        if(response.status === 403 || response.status === 401)
        {
            logoutNow();
        }
        return response;
    };

    self.responseError = function(rejection)
    {
        var deferred = $q.defer();
        if(rejection && rejection.data && (rejection.data.error === 'token_invalid' ||  rejection.data.error === 'token_expired' ))
        {
            logoutNow();
        }
        deferred.reject(rejection);
        return deferred.promise;
    };

    return self;
})

.factory('QueryLogDetectionInjector', function($rootScope, $q) {
    return {
        request: function(config)
        {
            return config;
        },
        response: function(response)
        {
            if(response && response.data && response.data.query_log)
            {
                // POR EL MOMENTO backupQL no se usa para nada, cuando se lea el QL se utilizara
                var backupQL = response.data.query_log;
                var object = response.data;
                var keys = Object.keys(object);
                var arrOutput = [];
                for(var i = 0; i < keys.length; i++)
                {
                    var current = keys[i];
                    if(isNaN(current) && current !== "query_log")
                    {
                        return config.success(response.data);
                    }
                    if(current === "query_log") break;
                    arrOutput.push(object[current]);
                }
                response.data = arrOutput;
            }
            return response;
        },
        responseError: function(rejection) {
            var deferred = $q.defer();
            deferred.reject(rejection);
            return deferred.promise;
        }
    };
});
