import MD5 from "crypto-js/md5";

angular.module('gastos.services', [])

.service('PosicionService', function($sce, $gastosPopup) {
    var self = this;

    self.show = function($scope, mensaje) {
      if (!$scope.viewModel) {
        $scope.viewModel = {};
      }

      $scope.viewModel.mensajeRegistro = $sce.trustAsHtml(mensaje);

      $gastosPopup.fromTemplateUrl('templates/posicion.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.viewModel.ventana = self.modal = modal;
        $scope.viewModel.ventana.show();
      });
    };

    self.close = function() {
      if (self.modal !== undefined) {
        self.modal.hide();
      }
    };

    return self;
  })

.service('Categoria', function($http, ENV, $localStorage, $q, Network, ApiEndPoint)
{
    var self = this;

    var url = ApiEndPoint.get() + 'categoria/index';

    var promise = undefined;

    var hasWifi = function()
    {
        var network = Network.getNetwork();
        return  network == 'ethernet' || network == 'wifi';
    };

    self.getFromCache = function()
    {
        var data = $localStorage.get('Categorias');

        return $q(function(resolve, reject)
        {
            resolve(data);
        });
    };

    self.sync = function()
    {
        return $http.get(url).then(function (response)
        {
            // The then function here is an opportunity to modify the response
            console.log("se llama al get categorias");
            // The return value gets picked up by the then in the controller.
            if(response && response.status === 200)
            {
                var categorias = response.data;
                $localStorage.set('Categorias', categorias);
                return categorias;
            }
        });
    };

    self.query = function(forceUpdate)
    {
        if(!$localStorage.has('Categorias') || hasWifi() || forceUpdate === true)
        {
            promise = self.sync();
        }
        else
        {
            promise = self.getFromCache();
        }

        return promise;

    };

    self.categoriasVisibles = function() {
        const configuracion = $localStorage.get('configuracion');
        return configuracion && configuracion.categoriasVisibles
            ? configuracion.categoriasVisibles
            : [];

    };

    self.queryFiltered = function(callback, noFiltrar, forceUpdate)
    // FIXME: Fix the mechanism to filter configured categories
    {
        const visibles = self.categoriasVisibles();
        const filterLogic = function(categoria)
        {
            return visibles.length === 0 || visibles.includes(categoria.id);
        };

        self.query(forceUpdate).then(function(categorias)
        {
            const categoriasFiltradas = categorias.filter(filterLogic);
            callback(noFiltrar ? categorias : categoriasFiltradas);
        });
    };

    return self;
})

.service('Usuario', function($http, ENV, Auth, ApiEndPoint)
{
    var self = this;

    var url = ApiEndPoint.get() + 'usuario/index';

    self.query = function()
    {
        var usuario_actual_id = Auth.get().id;
        // $http returns a promise, which has a then function, which also returns a promise
        var promise = $http.get(url + '/' + usuario_actual_id).then(function (response)
        {
            // The then function here is an opportunity to modify the response
            // The return value gets picked up by the then in the controller.
            return response.data;
        });
        // Return the promise to the controller
        return promise;
    };

    return self;
})

.service('Reintegro', function($http, ENV, Auth, ApiEndPoint)
{
    var self = this;

    var url = ApiEndPoint.get() + 'reintegro';

    self.Registrar = function(datosReintegro) {
        var promise = $http.post(url + '/registrar', datosReintegro).then(function (response) {
            // The then function here is an opportunity to modify the response
            console.log("se esta llamando al post");
            // The return value gets picked up by the then in the controller.
            return response.data;
        });
      // Return the promise to the controller
      return promise;

    };

    return self;
})

.service('Gasto', function($http, ENV, Auth, Network, $localStorage, $q, ApiEndPoint)
{
    var self = this;

    var url = ApiEndPoint.get() + 'gasto';

    var removeUndefined = function(json)
    {
        return JSON.parse(JSON.stringify(json));
    };

    self.count = function()
    {
        if(!$localStorage.has('movimientos') || $localStorage.get('movimientos') === 'undefined')
        {
            return 0;
        }

        var movimientosPendientes = $localStorage.get('movimientos') ?? [];

        return movimientosPendientes.length;
    };

    self.query = function(parametrosBusqueda)
    {
        var parametros = {};

        if(parametrosBusqueda !== undefined)
        {
            parametros = removeUndefined(parametrosBusqueda);
        }

        var promise = $http({url: url + '/listado', data: parametros, method: "POST"}).then(function (response)
        {
            console.log("se llama al get");
            return response.data;
        });

        return promise;
    };

    self.noHayMovimientos = function()
    {
        return $q(function(resolve, reject){
                resolve(undefined);
            });
    };

    self.sync = function()
    {
        if(!$localStorage.has('movimientos'))
        {
            return self.noHayMovimientos();
        }

        var movimientosPendientes = $localStorage.get('movimientos');

        if(movimientosPendientes.length === 0)
        {
            return self.noHayMovimientos();
        }

        var parametros =    {
                                movimientos:    movimientosPendientes,
                                token:            "esUnTokenProvisorio"
                            };

        var promise = $http.post(url + '/registrar', parametros).then(function (response) {
                // The then function here is an opportunity to modify the response
                console.log("se esta llamando al post");
                // The return value gets picked up by the then in the controller.
                if(response && response.status === 200)
                {
                    movimientosPendientes = [];

                    $localStorage.set('movimientos', movimientosPendientes);
                }
                return response.data;
            })
            .catch(function()
            {
                return {};
            });
        return promise;
    };

    self.Resumen = function(incluirGastosTarjeta)
    {
        var usuario = Auth.get();
        var idusuario = usuario.id;
        var promise = $http.get(url + '/resumen/' + idusuario +  '?incluirGastosTarjeta=' + incluirGastosTarjeta.toString())
          .then(function(response){
            console.log("SE OBTUVO EL RESUMEN: "+ JSON.stringify(response));
            if(response.status === 200)
            {
                return response.data;
            }
            return null;
        });
        return promise;
    };

    self.Saldo = function(callback)
    {
        var usuario = Auth.get();
        var idusuario = usuario.id;
        var promise = $http.get(url + '/saldo/' + idusuario).then(function(response){
            if(response.status === 200)
            {
                callback(response.data);
            }
            return null;
        });
        return promise;
    };

    self.Registrar = function(importe, categoria, usuario, comentario, tarjeta_credito, cuotasTarjeta)
    {
        var idusuario = usuario.id;
        var idcategoria = categoria.id;
        var token = MD5(usuario.nombre + "." + categoria.titulo + "." + parseFloat(importe));
        // $http returns a promise, which has a then function, which also returns a promise


        var fechaHoy = (new Date()).toLocaleString("sv-SE");;

        var gastoActual =     {
                                importe:         importe,
                                categoria:       idcategoria,
                                usuario:         idusuario,
                                token:           token,
                                comentario:      comentario,
                                fecha_pago:      fechaHoy,
                                tarjeta_credito: tarjeta_credito,
                                cuotasTarjeta:   cuotasTarjeta,
                            };

        var movimientosPendientes = [];
        if($localStorage.has('movimientos'))
        {
            movimientosPendientes = $localStorage.get('movimientos');
        }

        movimientosPendientes.push(gastoActual);
        $localStorage.set('movimientos', movimientosPendientes);

        return self.sync();
    };

    self.mensuales = function()
    {
        var promise = $http.get(url + '/mensuales').then(function (response)
        {
            return response.data;
        });
        return promise;
    };

    self.queryMeses = function()
    {
        var promise = $http.get(url + '/mesescongastos').then(function (response)
        {
            return response.data;
        });
        return promise;
    };

    self.tiposMovimientos = function()
    {
        var promise = $http.get(url + '/tiposmovimientos').then(function (response)
        {
            return response.data;
        });
        return promise;
    };

    self.get = function(id)
    {
        var promise = $http.get(url + '/' + id).then(function (response)
        {
            return response.data;
        });
        return promise;
    };

    self.queryByCategoria = function(filter, handler)
    {
        $http({ url: url + "/listbycategoria",
            data: filter,
            method: 'POST',
            contentType: 'application/json',
            headers: { 'X-Requested-With' : 'XMLHttpRequest' } }).then(handler);
    };

    return self;
})

.service('Network', function ($cordovaNetwork, $q, ENV)
{
    var self = this;
    if (window.cordova) {
        return $cordovaNetwork;
    }

    var Connection = {
        UNKNOWN:     "unknown",
        ETHERNET:     "ethernet",
        WIFI:         "wifi",
        CELL_2G:     "2g",
        CELL_3G:     "3g",
        CELL_4G:     "4g",
        CELL:        "cellular",
        NONE:         "none"
    };

    return {
        getNetwork: function() {
            return Connection.UNKNOWN;
        }
    };
})

.service('Device', function ($cordovaDevice, $q)
{
    if (window.cordova) {
        var device = {};

        document.addEventListener("deviceready", function() {
            device.cordova    = $cordovaDevice.getCordova();
            device.model    = $cordovaDevice.getModel();
            device.platform    = $cordovaDevice.getPlatform();
            device.uuid        = $cordovaDevice.getUUID();
            device.version    = $cordovaDevice.getVersion();
            device.name        = $cordovaDevice.getName();
        });

        return device;
    }

    return {
        cordova:    'cordova_1.0',
        model:        'ff',
        platform:    'browser',
        uuid:        '12348',
        version:    '1.0.0',
        name:        'firefox'
    };
})

.service('$localStorage', function($window)
{
    var self = this;

    self.set = function(key, value)
    {
        if (typeof(value) === 'string')
        {
            $window.localStorage[key] = value;
        }
        else
        {
            $window.localStorage[key] = JSON.stringify(value);
        }
    };

    self.get = function(key)
    {
        var value = $window.localStorage[key];

        if (value === undefined || value === 'undefined') return undefined;

        try
        {
            return JSON.parse(value);
        }
        catch (e)
        {
            return value;
        }
    };

    self.has = function(key)
    {
        return $window.localStorage[key] !== undefined;
    };

    self.delete = function(key)
    {
        $window.localStorage.removeItem(key);
    };

    return self;
})


.service('ApiEndPoint', function(ENV, $localStorage)
{
    self.get = function()
    {
        var endPointConfig = ENV.apiEndpoint;
        var config = $localStorage.get('configuracion');
        return ENV.dev ?
                (config && config.apiEndpoint ? config.apiEndpoint.testing    : endPointConfig.testing   ) :
                (config && config.apiEndpoint ? config.apiEndpoint.produccion : endPointConfig.produccion);
    };

    return self;
})

.service('Auth', function($localStorage, $rootScope, $http, ENV, Device, ApiEndPoint)
{
    var self = this;

    var loggedInCallback = null;

    self.setLoggedInCallback = function(callback)
    {
        loggedInCallback = callback;
    };

    self.get = function()
    {
        return self.isAuthed ? $localStorage.get('usuario') : null;
    };

    self.isAuthed = function()
    {
        return $localStorage.has('usuario');
    };

    self.login =  function(usuario)
    {
        return self.validar(usuario).then(function(response)
        {
            if(response && response.data && response.data.auth == '1')
            {
                var data = response.data;
                usuario.id = data.usuario;
                usuario.token = data.authorization_token;
                self.save(usuario);
                if(loggedInCallback) loggedInCallback();
                return true;
            }
            else
            {
                self.logout();
                return false;
            }

        });
    };

    self.logout = function()
    {
        $localStorage.delete('usuario');
        $rootScope.$broadcast('unauthorized');
    };

    self.save = function(usuario)
    {
        delete usuario.clave;
        $localStorage.set('usuario', usuario);
    };

    self.validar = function(usuario)
    {
        return $http.post(ApiEndPoint.get() + 'usuario/login',
        {
            usuario:         usuario.nombre,
            token:           usuario.clave,
            dispositivo:     Device
        });
    };

    self.updateFCM = function(fcmToken, callback)
    {
        var usuario = self.get();
        if(!usuario) return;
        var usuario_actual_id = usuario.id;
        $http.put(ApiEndPoint.get() + 'usuario/' + usuario_actual_id + '/fcm', { fcm_token: fcmToken }).success(callback);
    };

    return self;
})

.service('Mapper', function()
{
    var self = this;

    self.getColumns = function(mapping, visibleByDefault)
    {
        var columns = [];
        var showDefault = visibleByDefault !== undefined ? visibleByDefault : true;

        var keys = Object.keys(mapping);

        for(var i = 0; i < keys.length; i++)
        {
            var propertyName = keys[i];
            var map      = mapping[propertyName];
            var label    = map ? ( typeof map === 'string' ?  map : map.label )  : propertyName;
            var showProp = map ? (map.show !== undefined ? map.show : true) : showDefault;
            var filtrar  = map && map.withFilter ? map.withFilter : false;

            var column = { id        : propertyName, "name" : label,
                           show      : showProp,
                           withFilter: filtrar };
            if(map && map.linkFn && typeof map.linkFn === 'function')
            {
                column.linkFn = map.linkFn;
            }
            columns.push(column);
        }
        return columns;
    };

    self.mapWithColumns = function(resourceName, mapping, visibleByDefault)
    {
        var mapper = function(data)
        {
            var result = {};

            result.items = data[resourceName];

            result.columns = self.getColumns(mapping, visibleByDefault);

            // FIXME: What is doing this here?
            // var camposAFiltrar = lodash.filter(Object.keys(mapping), function(campo){ return lodash.find(result.columns, { withFilter: true, id: campo}) !== undefined; });

            result.filtro = {};

            return result;
        };

        return mapper;
    };
    return self;
})

.service('ScreenOrientation', function()
{
    var self = this;

    self.fixedLandscape = function()
    {
        if(window.screen.lockOrientation)
        {
            window.screen.lockOrientation('landscape');
        }
        else
        {
            console.debug("Screen orientation plugin not available.");
        }
    };

    self.unlock = function()
    {
        if(window.screen.unlockOrientation)
        {
            window.screen.unlockOrientation();
        }
        else
        {
            console.debug("Screen orientation plugin not available.");
        }
    };

    self.landscapeOnEnterUnlockOnLeave = function(scope)
    {
        scope.$on('$ionicView.beforeEnter', function()
        {
            self.fixedLandscape();
        });

        scope.$on('$ionicView.leave', function()
        {
            self.unlock();
        });
    };

    return self;
})

.service('SolicitudService', function(Auth, ApiEndPoint, $http)
{
    var self = this;

    var url = ApiEndPoint.get();

    self.solicitarResumen = function(callback)
    {
        var usuarioLogueado = Auth.get();
        usuarioLogueado.token = undefined;
        usuarioLogueado.clave = undefined;

        var datosUsuario = { usuario: usuarioLogueado };

        return $http.post(url + "solicitudes/resumen", datosUsuario).then(function(response){ callback(response.data); });
    };

    return self;
})

.service('NotificacionesService' , function($localStorage, Auth, MensajesService)
{
    var self = this;

    var notificationCallback = null;

    self.setNotificationCallback = function(callback)
    {
        notificationCallback = callback;
    };

    self.saveToken = function(token)
    {
        Auth.updateFCM(token, function(response)
        {
            $localStorage.set('fcm_token_stored', true);
        });
    };

    self.getToken = function()
    {
        if(!$localStorage.has('fcm_token_stored'))
        {
            window.FirebasePlugin.getToken(self.saveToken);
        }
    };

    self.installTokenRefresher = function()
    {
        window.FirebasePlugin.onTokenRefresh(function(token)
        {
            $localStorage.delete('fcm_token_stored');
            self.saveToken(token);
        });
    };

    self.installNotificationHandler = function()
    {
        window.FirebasePlugin.onNotificationOpen(self.notificationHandler);
    };

    self.notificationHandler = function(data)
    {
        console.debug(data);
        if(notificationCallback)
        {
            notificationCallback(data.mensaje);
        }

        if(data.isCommand) return;

        if(data.wasTapped)
        {
            //Notification was received on device tray and tapped by the user.
            alert(data.mensaje);
        }
        else
        {
            //Notification was received in foreground. Maybe the user needs to be notified.
            alert(data.mensaje);
        }

        MensajesService.MarcarComoLeidos();
    };

    self.registerCallbacks = function()
    {
        if(!window.FirebasePlugin) return;

        self.getToken();
        self.installTokenRefresher();
        self.installNotificationHandler();
        Auth.setLoggedInCallback(self.getToken);
    };

    return self;
})

.service('MensajesService', function($http, ApiEndPoint)
{
    var self = this;

    var url = ApiEndPoint.get() + 'mensajes/';
    self.MarcarComoLeidos = function()
    {
        $http.put(url + 'seen').then(function(response)
        {
            console.debug("Mensajes marcados como leidos");
        });
    };

    self.ObtenerNoLeidos = function(callback)
    {
        $http.get(url + 'notseen').then(callback);
    };

    return self;
})

.service('QrScanner', function()
{
    var self = this;

    self.scan = function(callback)
    {
        cordova.plugins.barcodeScanner.scan(
            function (result)
            {
                //alert("We got a barcode\n" +
                //"Result: " + result.text + "\n" +
                //"Format: " + result.format + "\n" +
                //"Cancelled: " + result.cancelled);

                callback(result);
            },
            function (error)
            {
                alert("Scanning failed: " + error);
            },
            {
                preferFrontCamera : false, // iOS and Android
                showFlipCameraButton : true, // iOS and Android
                showTorchButton : true, // iOS and Android
                torchOn: false, // Android, launch with the torch switched on (if available)
                saveHistory: true, // Android, save scan history (default false)
                prompt : "Place a barcode inside the scan area", // Android
                resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                disableAnimations : true, // iOS
                disableSuccessBeep: false // iOS and Android
            }
        );
    };

    return self;
});
