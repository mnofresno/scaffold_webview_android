
angular.module('gastos.controllers', [])

.controller('AppCtrl', function($scope,
    $state,
    $timeout,
    PosicionService,
    Gasto,
    Categoria,
    $q,
    SolicitudService,
    Auth,
    MensajesService,
    $localStorage,
    $rootScope,
    NotificacionesService,
    QrScanner,
    $http,
    ApiEndPoint) {
    var viewModel = $scope.viewModel = {isMenuOpen: false};

    function initialize() {
        viewModel.mostrarPosicion = function() {
            viewModel.isMenuOpen = false;
            PosicionService.show($scope);
        };

        viewModel.navigate = function(state) {
            viewModel.isMenuOpen = false;
            $state.go(state);
        };
        document.addEventListener('click', function(event) {
            var menuElement = document.querySelector('.menu-container');
            if (menuElement && $scope.viewModel.isMenuOpen && !menuElement.contains(event.target)) {
                $scope.$apply(function() {
                    viewModel.isMenuOpen = false;
                });
            }
        });

        viewModel.toggleMenu = function(event) {
            $scope.viewModel.isMenuOpen = !$scope.viewModel.isMenuOpen;
            event.stopPropagation();
        };

        viewModel.sincronizarTodo = function() {
            Gasto.sync().then(function() {
                Categoria.sync().then(function(data) {
                    $state.reload();
                });
            });
        };

        viewModel.movimientosPendientes = function() {
            var cantidadPendientes = Gasto.count();
            return (cantidadPendientes !== 0 ? " (" + cantidadPendientes + ")" : "");
        };

        viewModel.solicitarResumen = function() {
            SolicitudService.solicitarResumen(function(data) {
                $ionicPopup.alert({ title: 'Envío de resumen', template: data.respuesta });
            });
        };

        viewModel.cerrarSesion = function() {
            Auth.logout();
        };

        viewModel.VerMensajesNoLeidos = function() {
            MensajesService.ObtenerNoLeidos(function(response) {
                var mensajes = response.data.length > 0 ? lodash.map(response.data, function(m) { return m.mensaje; }) : 'No hay mensajes pendientes no leidos';
                $ionicPopup.alert({ title: 'Mensajes no leídos', template: mensajes });
            });
        };

        viewModel.saldo = "";

        viewModel.getSaldo = function() {
            Gasto.Saldo(function(r) {
                $scope.$applyAsync(function() {
                    viewModel.saldo = "$ " + r.diferencia;
                });
            });
        };
        $rootScope.refreshSaldo = viewModel.getSaldo;

        viewModel.scanQrCode = function() {
            QrScanner.scan(function(scanResult) {
                var code = scanResult.text;
                var loginData = { qrcode: code };
                var callback = function(response) {
                    var data = response.data;
                    console.debug(data);
                };

                $http({ url: ApiEndPoint.get() + 'usuario/qrcodelogin', method: 'POST', data: loginData }).then(callback);
            });
        };

        NotificacionesService.setNotificationCallback(function(data) {
            if (data === 'update_saldo') $scope.$applyAsync(viewModel.getSaldo);
        });
    }

    if (window.cordova) {
        document.addEventListener('deviceready', initialize, false);
    } else {
        angular.element(document).ready(initialize);
    }
})

.controller('ConfiguracionCtrl', function($scope, ApiEndPoint, $localStorage, Categoria) {
    var viewModel = $scope.viewModel = {
        saldoAutoRefresh: false,
        categoriasVisibles: [],
        apiEndpoint: { produccion: ApiEndPoint.get()}
    };
    $scope.availableCategorias = [];

    viewModel.cambiarUrl = function() {
        viewModel.url = viewModel.apiEndpoint.produccion;
        $ionicPopup.show({
            template: '<input type="text" ng-model="viewModel.url" autofocus/>',
            title: 'Direccion URL API',
            subTitle: 'Ingresar URL API control de gastos',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        viewModel.apiEndpoint.produccion = viewModel.url;
                    }
                },
                {
                    text: '<b>Cerrar</b>',
                    type: 'button-positive'
                }
            ]
        });
    };

    viewModel.guardarConfig = function() {
        viewModel.categoriasVisibles = $scope.availableCategorias.filter(x => x.seleccionada).map(x => x.id);
        $localStorage.set('configuracion', viewModel);
    };

    viewModel.toggleCheck = function(categoria) {
        $scope.availableCategorias.find(x => x.id === categoria.id).seleccionada = !categoria.seleccionada;
    };

    viewModel.toggleSaldoAutoRefresh = function() {
        viewModel.saldoAutoRefresh = !viewModel.saldoAutoRefresh;
    };

    var leerConfiguracion = function() {
        return $localStorage.get('configuracion') || viewModel;
    };

    var initialize = function() {
        Categoria.query().then(function(availableCategorias) {
            $scope.availableCategorias = availableCategorias.map(x => ({
                seleccionada: false,
                id: x.id,
                titulo: x.titulo
            }));
            const configuracion = leerConfiguracion();
            viewModel.categoriasVisibles = !configuracion || !configuracion.categoriasVisibles
                ? availableCategorias.map(x => x.id)
                : configuracion.categoriasVisibles;
        });
    };

    if (window.cordova) {
        document.addEventListener('deviceready', initialize, false);
    } else {
        angular.element(document).ready(initialize);
    }
})

.controller('PosicionCtrl', function($scope, Gasto) {
    if (!$scope.viewModel) {
      $scope.viewModel = {};
    }
    var viewModel = $scope.viewModel;

    viewModel.incluirTarjeta = false;

    viewModel.cerrar = function () {
      if ($scope.viewModel.ventana) {
        $scope.viewModel.ventana.remove();
      }
    };

    viewModel.loadResumen = function() {
      Gasto.Resumen(viewModel.incluirTarjeta).then(function(respuesta) {
        if (respuesta && respuesta.resumen && respuesta.resumen.totalAjeno) {
          viewModel.resumen = respuesta.resumen;
          viewModel.mostrarResumen = viewModel.resumen !== undefined;
        }
      });
    };

    viewModel.loadResumen();

    viewModel.resultIcon = function() {
      var val = parseInt((viewModel.resumen.diferencia ? viewModel.resumen.diferencia : "0").replace(",", "."));
      return { 'fa-thumbs-o-down': val < 0, 'fa-thumbs-o-up': val >= 0 };
    };
  })

.controller('ListadoGastosCtrl', function($scope,
                                        Categoria,
                                        Gasto,
                                        Auth,
                                        Mapper,
                                        $rootScope,
                                        ScreenOrientation,
                                        $gastosPopup)
{
    var viewModel = $scope.viewModel = { enableFilters: false };

    var updateCategorias = function()
    {
        return Categoria.query().then(function(categorias)
        {
            viewModel.availableCategorias = categorias;
            if(categorias) {
                viewModel.categoriasSeleccionadas = [];
            }
        });
    };

    var updateMeses = function()
    {
        return Gasto.queryMeses().then(function(d)
        {
            viewModel.mesesPosibles = d;
            if(d)
            {
                viewModel.mesSeleccionado = d[0];
            }
        });
    };

    var updateTiposMovimientos = function()
    {
        return Gasto.tiposMovimientos().then(function(d)
        {
            viewModel.tiposMovimientosPosibles = d;
            if(d)
            {
                viewModel.tipoMovimientoSeleccionado = d[0];
            }
        });
    };

    viewModel.getDetalleMovimiento = function(movimiento) {
        Gasto.get(movimiento.id).then(function(m) {
            console.debug("DETALLE!: " + JSON.stringify(m));
            $scope.detalle = m;
            $scope.movLista = movimiento;
            $gastosPopup.fromTemplateUrl('templates/detalle.html', {
                scope: $scope
            }).then(function(modal) {
                $scope.ventana = modal;
                $scope.ventana.show();
            });
        });
    };

    viewModel.cambioCategoria = function(value)
    {
        viewModel.categoriasSeleccionadas = value;
        viewModel.cambioFiltro();
    };

    viewModel.cambioFiltro = function()
    {
        var mesId = (viewModel.mesSeleccionado ? viewModel.mesSeleccionado.mes : null);
        var catsIds = lodash.map(viewModel.categoriasSeleccionadas, function(cat)
        {
            return cat.id;
        });
        var movId = (viewModel.tipoMovimientoSeleccionado ? viewModel.tipoMovimientoSeleccionado.id : null);

        Gasto.query({   mes       : mesId,
                        categorias: catsIds,
                        movimiento: movId    }).then(function(d)
                        {
                            var colMapping =
                            {
                                importe:   'Importe',
                                created_at:     'Fecha Compra',
                                fecha_pago:     'Fecha Pago',
                                categoria: 'Categoria',
                                usuario:   'Usuario',
                                tarjeta_credito: 'Gasto c/Tarjeta'
                            };
                            var mapper = Mapper.mapWithColumns('list', colMapping, false);
                            viewModel.Movimientos = mapper(d);
                            viewModel.total = d.total;
                        }).finally(function()
                        {
                            $scope.$broadcast('scroll.refreshComplete');
                        });
    };

    viewModel.actualizarMovimientos = function()
    {
        viewModel.cambioFiltro();
    };

    var initialize = function()
    {
        updateCategorias()
            .then(updateMeses)
                .then(updateTiposMovimientos)
                    .then(function()
                    {
                        viewModel.enableFilters = true;
                        viewModel.actualizarMovimientos();
                    });
    };

    initialize();
})

.controller('GastosMensualesCtrl', function($scope,
                                            Gasto)
{

    var viewModel = $scope.viewModel = {};

    Gasto.mensuales().then(function(d){        viewModel.listado = d;    });
})

.controller('ReintegroCtrl', function($scope,
                                      Auth,
                                      Usuario,
                                      Reintegro,
                                      PosicionService)
{

    var viewModel = $scope.viewModel = {
                                            usuarioDestino:         {id: 0, name: ''},
                                            usuario:                 Auth.get(),
                                            importeReintegro:        '',
                                            comentarioReintegro:     '',
                                            soloEnviarMensaje: false
                                        };

    viewModel.registrar = function()
    {
        Reintegro.Registrar({
                                importe:           viewModel.importeReintegro,
                                originante:        viewModel.usuario.id,
                                destinatario:      viewModel.usuarioDestino.id,
                                comentario:        viewModel.comentarioReintegro,
                                soloEnviarMensaje: viewModel.soloEnviarMensaje
                            }).then(function(respuesta){
                    if(respuesta && respuesta.logout == "1")
                    {
                        Auth.logout();
                        location.href = location.origin;
                    }
                    viewModel.limpiarFormulario();
                    PosicionService.show($scope, "Se registro el reintegro OK.");
                });
    };

    Usuario.query().then(function(d)
    {
        viewModel.posiblesUsuariosDestino = d;
        if(d !== undefined)
        {
            viewModel.usuarioDestino = d[0];
        }
    });

    viewModel.isValid = function()
    {
        return viewModel.usuarioDestino.id !== 0 &&
                ((parseInt(viewModel.importeReintegro) !== 0 &&
                !isNaN(viewModel.importeReintegro) &&
                viewModel.importeReintegro !== '' &&
                viewModel.importeReintegro !== undefined) || viewModel.soloEnviarMensaje);
    };

    viewModel.limpiarFormulario = function()
    {
        viewModel.importeReintegro = '';
        viewModel.comentarioReintegro = '';
    };

    $scope.cambioSoloNotificar = function()
    {
        if(viewModel.soloEnviarMensaje) viewModel.importeReintegro = 0;
    };
})

.controller('HomeCtrl', function($scope,
                                 $state,
                                 $rootScope,
                                 Categoria,
                                 Gasto,
                                 Auth,
                                 $timeout,
                                 PosicionService)
{

    if (typeof $rootScope.refreshSaldo === 'function') {
        $rootScope.refreshSaldo();
    }

    var viewModel = $scope.viewModel = {
                                            tarjeta_credito:        false,
                                            cuotasTarjeta:          1,
                                            noFiltrarCategorias:    false,
                                            categorias:             [],
                                            importeGasto:             "",
                                            categoriaSeleccionada:     {id: '', titulo: ''},
                                            usuario:                 Auth.get(),
                                            mostrarResumen:         false,
                                            registroExitoso:        false,
                                            mensajeRegistro:        "",
                                            comentarioGasto:        "",
                                            resumen:                 {
                                                                        totalPropio:    0,
                                                                        totalAjeno:     0,
                                                                        diferencia:        0,
                                                                    },
                                        };


    const self = this;

    var sincronizarCategorias = function()
    {
        Categoria.queryFiltered(function(categorias)
        {
            viewModel.categorias = categorias;
        }, viewModel.noFiltrarCategorias);
    };

    viewModel.hasFilteredCategories = function()
    {
        return Categoria.categoriasVisibles().length > 0;
    };

    viewModel.toggleShowAllCategories = function()
    {
        viewModel.noFiltrarCategorias = !viewModel.noFiltrarCategorias;
        sincronizarCategorias(viewModel.noFiltrarCategorias);
    };

    sincronizarCategorias();


    viewModel.cerrarPosicion = function()
    {
        PosicionService.close();
    };

    viewModel.limpiarFormulario = function()
    {
        viewModel.importeGasto            = "";
        viewModel.comentarioGasto       = "";
        viewModel.categoriaSeleccionada = {id: '', titulo: ''};
        viewModel.tarjeta_credito = false;

        if(!viewModel.registroExitoso)
        {
            viewModel.mensajeRegistro = '';
        }

        viewModel.registroExitoso = false;

    };

    viewModel.abrirListadoGastos = function()
    {
        $state.go('listadoGastos');
    };

    viewModel.realizarReintegro = function()
    {
        $state.go('realizarReintegro');
    };

    viewModel.cambioSeleccion = function()
    {
        console.log(viewModel.categoriaSeleccionada);
    };

    viewModel.isValid = function()
    {
        var importe = parseFloat(viewModel.importeGasto);
        return viewModel.categoriaSeleccionada.id !== '' && !isNaN(importe) && importe !== 0;
    };

    viewModel.hayMensajeRegistro = function()
    {
        return viewModel.mensajeRegistro != '';
    };

    viewModel.registrarGasto = function()
    {
        Gasto.Registrar(
          viewModel.importeGasto,
          viewModel.categoriaSeleccionada,
          viewModel.usuario,
          viewModel.comentarioGasto,
          viewModel.tarjeta_credito,
          viewModel.cuotasTarjeta)
          .then(function(respuesta)
          {
              if(respuesta.logout == "1")
              {
                  Auth.logout();
                  location.href = location.origin;
              }

              if(respuesta.resumen !== undefined)
              {
                  PosicionService.show($scope, "Se registro el gasto OK.");
              }
              else
              {
                  PosicionService.show($scope, "Se registro el gasto localmente.");
              }

              // FIXME: Fix scroll delegate
            //   $ionicScrollDelegate.scrollTop();
          })
          .catch(function(){

              PosicionService.show($scope, "Hubo un error al registrar el gasto. Se registró de manera off-line. <a href=\"#/app/offline\" >Ir a gastos offline</a>");

          })
          .finally(function()
          {
              viewModel.limpiarFormulario();
          });
    };
})

.controller('LoginCtrl', function($scope, $state, Auth, $gastosPopup) {
     var viewModel = $scope.viewModel =
        {
            usuario: {
                        clave: '',
                        nombre: ''
                     },
            errorLogin: false,
        };

    viewModel.mostrarFormulario = function()
    {
        return !viewModel.errorLogin;
    };

    viewModel.habilitarLogin = function()
    {
        return viewModel.usuario.clave != '' && viewModel.usuario.nombre != '';
    };

    $scope.usuario = {
        legajo: ''
    };
    viewModel.limpiarFormulario = function()
    {
        viewModel.errorLogin = false;
        viewModel.usuario = {id: '', nombre: '', clave: ''};
        $state.go('login');
    };

    viewModel.login = function(e) {

        if(e)
        {
            viewModel.limpiarFormulario();
        }
        else
        {
            if (viewModel.usuario.nombre != '') {

                Auth.login(viewModel.usuario).then(function(respuesta) {
                    if(respuesta)
                    {
                        $state.go('app.home');
                    }
                    else
                    {
                        Auth.logout();
                        viewModel.errorLogin = true;
                    }
                    // FIXME: Add mechanism to avoid go back button
                    // $ionicViewService.nextViewOptions({
                    //     disableBack: true
                    // });
                }, function(response) {
                    const message = response.data
                        ? response.data.error.description
                        : 'Login error';
                    $gastosPopup.error({ template: message });
                });
            }
        }
        return false;
    };
})

.controller('OfflineCtrl', function($localStorage, Mapper, $scope, Categoria)
{
    var viewModel = $scope.viewModel = {};

    var categorias = null;
    var movimientos = null;

    var mapping = {
      importeHuman:    'Importe',
      categoriaTitulo: 'Categoría',
      fecha_pago:      'Fecha'
    };

    Categoria.query().then(function(data)
    {
      categorias = data;
      viewModel.actualizar();
    });

    viewModel.actualizar = function()
    {
        var i = 1;
        var storedData = $localStorage.get('movimientos');
        movimientos = storedData === 'undefined' ? [] : storedData;
        lodash.forEach(movimientos, function(m)
        {
            if(!m.id)
            {
                m.id = i;
            }

            i++;

            if(!m.importeHuman)
            {
                m.importeHuman = m.importe.toLocaleString('es');
            }

            if(!m.categoriaTitulo)
            {
                var c = lodash.find(categorias, { id: m.categoria })
                m.categoriaTitulo =  c.titulo;
            }
        });
        viewModel.Movimientos = Mapper.mapWithColumns('M', mapping, false)({ M: movimientos });
        viewModel.saveList();
    };

    viewModel.deleteItem = function(item)
    {
      var m = lodash.remove(movimientos, { id: item.id });

      viewModel.saveList();
      viewModel.actualizar();
    };

    viewModel.saveList = function()
    {
        $localStorage.set('movimientos', movimientos);
    };
})

.controller('PorCategoriasCtrl', function($http, Mapper, $scope, ApiEndPoint, Gasto)
{
    $scope.listado = {};
    $scope.mesActual = 0;

    $scope.update = function()
    {
        var handler = function(data)
        {
            $scope.listado = data.data;
        };

        var filter = { mes: $scope.mesActual };

        Gasto.queryByCategoria(filter, function(data)
        {
            $scope.listado = data.data;
        });
    };

    $scope.siguiente = function()
    {
        $scope.mesActual++;
        $scope.update();
    };

    $scope.anterior = function()
    {
        $scope.mesActual--;
        $scope.update();
    };

    $scope.update();
});
