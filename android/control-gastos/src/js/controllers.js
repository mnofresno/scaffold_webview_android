angular.module('gastos.controllers', [])

.controller('AppCtrl', function($scope,
                                $state,
                                $ionicModal,
                                $timeout,
                                PosicionService,
                                Gasto,
                                Categoria,
                                $q,
                                SolicitudService,
                                Auth,
                                MensajesService,
                                $localStorage,
                                lodash,
                                $ionicPopup,
                                $rootScope,
                                NotificacionesService,
                                QrScanner,
                                $http,
                                ApiEndPoint)
{
    var ViewModel = $scope.viewModel = {};

    ViewModel.mostrarPosicion = function()
    {
        PosicionService.show($scope);
    };

    ViewModel.sincronizarTodo = function()
    {
        Gasto.sync().then(function()
        {
            Categoria.sync().then(function(data)
            {
                $state.reload();
            });
        });
    };

    ViewModel.movimientosPendientes = function()
    {
        var cantidadPendientes = Gasto.count();
        return (cantidadPendientes != 0 ? " (" + cantidadPendientes + ")" : "");
    };

    ViewModel.solicitarResumen = function()
    {
        SolicitudService.solicitarResumen(function(data)
        {
           $ionicPopup.alert({ title: 'Envío de resumen', template: data.respuesta });
        });
    };

    ViewModel.cerrarSesion = function()
    {
        Auth.logout();
    };

    ViewModel.VerMensajesNoLeidos = function()
    {
        MensajesService.ObtenerNoLeidos(function(response)
        {
            var mensajes = response.data.length > 0 ? lodash.map(response.data, function(m){ return m.mensaje; }) : 'No hay mensajes pendientes no leidos';
            $ionicPopup.alert({ title: 'Mensajes no leídos', template: mensajes });
        });
    };

    ViewModel.saldo = "";

    ViewModel.getSaldo = function()
    {
        Gasto.Saldo(function(r)
        {
            ViewModel.saldo = "$ " + r.diferencia;
        });
    };

    ViewModel.scanQrCode = function()
    {
        QrScanner.scan(function(scanResult)
        {
            var code = scanResult.text;
            var loginData = { qrcode: code };
            var callback = function(response)
            {
                var data = response.data;
                console.debug(data);
            };

            $http({ url: ApiEndPoint.get() + 'usuario/qrcodelogin', method: 'POST', data: loginData }).then(callback);
        });
    };

    $rootScope.refreshSaldo = ViewModel.getSaldo;

    NotificacionesService.setNotificationCallback(function(data){ if(data === 'update_saldo') ViewModel.getSaldo(); });
})

.controller('ConfiguracionCtrl', function($scope, $ionicModal, ApiEndPoint, $localStorage, Categoria, lodash, $ionicPopup)
{
    var ViewModel = $scope.viewModel =
        {
            categoriasPosibles: [],
            config: {
                saldoAutoRefresh: false,
                categoriasVisibles: [],
                apiEndpoint: { produccion: ApiEndPoint.get() }
            }
        };

    ViewModel.cambiarUrl = function()
    {
        ViewModel.url = ViewModel.config.apiEndpoint.produccion;
        $ionicPopup.show({
            template: '<input type="text" ng-model="viewModel.url" autofocus/>',
            title: 'Direccion URL API',
            subTitle: 'Ingresar URL API control de gastos',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-positive',
                    onTap: function(e)
                    {
                        ViewModel.config.apiEndpoint.produccion = ViewModel.url;
                        ViewModel.guardarConfig();
                    }
                },
                {
                    text: '<b>Cerrar</b>',
                    type: 'button-positive'
                }
            ]
        });
    };

    ViewModel.guardarConfig = function()
    {
        $localStorage.set('configuracion', ViewModel.config);
    };

    ViewModel.categoriaSeleccionada = function(c)
    {
        return lodash.includes(ViewModel.config.categoriasVisibles, c.id);
    };

    ViewModel.toggleCheck = function(c)
    {
        if(ViewModel.categoriaSeleccionada(c))
        {
            lodash.pull(ViewModel.config.categoriasVisibles, c.id);
        }
        else
        {
            ViewModel.config.categoriasVisibles.push(c.id);
        }
        ViewModel.guardarConfig();
    };

    ViewModel.toggleSaldoAutoRefresh = function()
    {
        ViewModel.config.saldoAutoRefresh = ViewModel.config.saldoAutoRefresh !== true;
        ViewModel.guardarConfig();
    };

    var leerConfiguracion = function()
    {
        ViewModel.config = $localStorage.get('configuracion');
        return ViewModel.config;
    };

    var initialize = function()
    {
        Categoria.query().then(function(c)
        {
            ViewModel.categoriasPosibles = c;
            var configuracion = leerConfiguracion();

            if(!configuracion || !configuracion.categoriasVisibles)
            {
                ViewModel.config.categoriasVisibles = lodash.map(c, 'id');
            }
            else
            {
                ViewModel.config.categoriasVisibles = configuracion.categoriasVisibles;
            }
        });
    };

    initialize();
})

.controller('PosicionCtrl', function($scope, $ionicModal, Gasto)
{
    var ViewModel = $scope.viewModel = {};
    ViewModel.ventana = $scope.ventana;
    ViewModel.incluirTarjeta = false;

    ViewModel.mensajeRegistro = $scope.mensajeRegistro;

    ViewModel.loadResumen = function()
    {
      Gasto.Resumen(ViewModel.incluirTarjeta).then(function(respuesta)
      {
          if(respuesta && respuesta.resumen && respuesta.resumen.totalAjeno)
          {
              ViewModel.resumen = respuesta.resumen;
              ViewModel.mostrarResumen = ViewModel.resumen !== undefined;
          }
      });
    };

    ViewModel.loadResumen();
    ViewModel.resultIcon = function()
    {
        var val = parseInt((ViewModel.resumen.diferencia ? ViewModel.resumen.diferencia : "0").replace(",", "."));
        return { 'fa-thumbs-o-down': val < 0, 'fa-thumbs-o-up': val >= 0 };
    };
})

.controller('ListadoGastosCtrl', function($scope,
                                          $ionicHistory,
                                          $ionicScrollDelegate,
                                          $state,
                                          Categoria,
                                          Gasto,
                                          Auth,
                                          Mapper,
                                          $ionicModal,
                                          $rootScope,
                                          ScreenOrientation,
                                          lodash)
{
    var ViewModel = $scope.viewModel = { enableFilters: false };

    var updateCategorias = function()
    {
        return Categoria.query().then(function(d)
        {
            ViewModel.categoriasPosibles = d;
            if(d)
            {
                ViewModel.categoriasSeleccionadas = [];
            }
        });
    };

    var updateMeses = function()
    {
        return Gasto.queryMeses().then(function(d)
        {
            ViewModel.mesesPosibles = d;
            if(d)
            {
                ViewModel.mesSeleccionado = d[0];
            }
        });
    };

    var updateTiposMovimientos = function()
    {
        return Gasto.tiposMovimientos().then(function(d)
        {
            ViewModel.tiposMovimientosPosibles = d;
            if(d)
            {
                ViewModel.tipoMovimientoSeleccionado = d[0];
            }
        });
    };

    ViewModel.getDetalleMovimiento = function(movimiento)
    {
        Gasto.get(movimiento.id).then(function(m)
        {
            console.debug("DETALLE!: " + JSON.stringify(m));
            $scope.detalle = m;
            $scope.movLista = movimiento;
              $ionicModal.fromTemplateUrl('templates/detalle.html',
            {
                scope: $scope
            }).then(function(modal)
            {
                $scope.ventana = modal;
                $scope.ventana.show();
            });
        });
    };

    ViewModel.cambioCategoria = function(value)
    {
        ViewModel.categoriasSeleccionadas = value;
        ViewModel.cambioFiltro();
    };

    ViewModel.cambioFiltro = function()
    {
        var mesId = (ViewModel.mesSeleccionado ? ViewModel.mesSeleccionado.mes : null);
        var catsIds = lodash.map(ViewModel.categoriasSeleccionadas, function(cat)
        {
            return cat.id;
        });
        var movId = (ViewModel.tipoMovimientoSeleccionado ? ViewModel.tipoMovimientoSeleccionado.id : null);

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
                            ViewModel.Movimientos = mapper(d);
                            ViewModel.total = d.total;
                        }).finally(function()
                        {
                            $scope.$broadcast('scroll.refreshComplete');
                        });
    };

    ViewModel.actualizarMovimientos = function()
    {
        ViewModel.cambioFiltro();
    };

    var initialize = function()
    {
        updateCategorias()
            .then(updateMeses)
                .then(updateTiposMovimientos)
                    .then(function()
                    {
                        ViewModel.enableFilters = true;
                        ViewModel.actualizarMovimientos();
                    });
    };

    initialize();
})

.controller('GastosMensualesCtrl', function($scope,
                                            $ionicHistory,
                                            $ionicScrollDelegate,
                                            $state,
                                            Categoria,
                                            Gasto,
                                            Auth)
{

    var ViewModel = $scope.viewModel = {};

    Gasto.mensuales().then(function(d){        ViewModel.listado = d;    });
})

.controller('ReintegroCtrl', function($scope,
                                      $ionicHistory,
                                      $ionicScrollDelegate,
                                      $state,
                                      Auth,
                                      Usuario,
                                      Reintegro,
                                      PosicionService)
{

    var ViewModel = $scope.viewModel = {
                                            usuarioDestino:         {id: 0, name: ''},
                                            usuario:                 Auth.get(),
                                            importeReintegro:        '',
                                            comentarioReintegro:     '',
                                            soloEnviarMensaje: false
                                        };

    ViewModel.registrar = function()
    {
        Reintegro.Registrar({
                                importe:           ViewModel.importeReintegro,
                                originante:        ViewModel.usuario.id,
                                destinatario:      ViewModel.usuarioDestino.id,
                                comentario:        ViewModel.comentarioReintegro,
                                soloEnviarMensaje: ViewModel.soloEnviarMensaje
                            }).then(function(respuesta){
                    if(respuesta && respuesta.logout == "1")
                    {
                        Auth.logout();
                        location.href = location.origin;
                    }
                    ViewModel.limpiarFormulario();
                    PosicionService.show($scope, "Se registro el reintegro OK.");
                });
    };

    Usuario.query().then(function(d)
    {
        ViewModel.posiblesUsuariosDestino = d;
        if(d !== undefined)
        {
            ViewModel.usuarioDestino = d[0];
        }
    });

    ViewModel.isValid = function()
    {
        return ViewModel.usuarioDestino.id !== 0 &&
                ((parseInt(ViewModel.importeReintegro) !== 0 &&
                !isNaN(ViewModel.importeReintegro) &&
                ViewModel.importeReintegro !== '' &&
                ViewModel.importeReintegro !== undefined) || ViewModel.soloEnviarMensaje);
    };

    ViewModel.limpiarFormulario = function()
    {
        ViewModel.importeReintegro = '';
        ViewModel.comentarioReintegro = '';
    };

    $scope.cambioSoloNotificar = function()
    {
        if(ViewModel.soloEnviarMensaje) ViewModel.importeReintegro = 0;
    };
})

.controller('HomeCtrl', function($scope,
                                 $ionicHistory,
                                 $ionicScrollDelegate,
                                 $state,
                                 Categoria,
                                 Gasto,
                                 Auth,
                                 PosicionService)
{

    $scope.refreshSaldo();
    var ViewModel = $scope.viewModel = {
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


    var sincronizarCategorias = function()
    {
        Categoria.queryFiltered(function(d)
        {
            ViewModel.categorias = d;
        }, ViewModel.noFiltrarCategorias);
    };

    ViewModel.hasFilteredCategories = function()
    {
        return Categoria.categoriasVisibles().length > 0;
    };

    ViewModel.toggleShowAllCategories = function()
    {
        ViewModel.noFiltrarCategorias = !ViewModel.noFiltrarCategorias;
        sincronizarCategorias(ViewModel.noFiltrarCategorias);
    };

    sincronizarCategorias();

    ViewModel.cerrarPosicion = function()
    {
        PosicionService.close();
    };

    ViewModel.limpiarFormulario = function()
    {
        ViewModel.importeGasto            = "";
        ViewModel.comentarioGasto       = "";
        ViewModel.categoriaSeleccionada = {id: '', titulo: ''};
        ViewModel.tarjeta_credito = false;

        if(!ViewModel.registroExitoso)
        {
            ViewModel.mensajeRegistro = '';
        }

        ViewModel.registroExitoso = false;

    };

    ViewModel.abrirListadoGastos = function()
    {
        $state.go('listadoGastos');
    };

    ViewModel.realizarReintegro = function()
    {
        $state.go('realizarReintegro');
    };

    ViewModel.cambioSeleccion = function()
    {
        console.log(ViewModel.categoriaSeleccionada);
    };

    ViewModel.isValid = function()
    {
        var importe = parseFloat(ViewModel.importeGasto);
        return ViewModel.categoriaSeleccionada.id !== '' && !isNaN(importe) && importe !== 0;
    };

    ViewModel.hayMensajeRegistro = function()
    {
        return ViewModel.mensajeRegistro != '';
    };

    ViewModel.registrarGasto = function()
    {
        Gasto.Registrar(
          ViewModel.importeGasto,
          ViewModel.categoriaSeleccionada,
          ViewModel.usuario,
          ViewModel.comentarioGasto,
          ViewModel.tarjeta_credito,
          ViewModel.cuotasTarjeta)
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

              $ionicScrollDelegate.scrollTop();
          })
          .catch(function(){

              PosicionService.show($scope, "Hubo un error al registrar el gasto. Se registró de manera off-line. <a href=\"#/app/offline\" >Ir a gastos offline</a>");

          })
          .finally(function()
          {
              ViewModel.limpiarFormulario();
          });
    };
})

.controller('LoginCtrl', function($scope, $state, Auth, $gastosPopup, $ionicViewService) {
     var ViewModel = $scope.viewModel =
        {
            usuario: {
                        clave: '',
                        nombre: ''
                     },
            errorLogin: false,
        };

    ViewModel.mostrarFormulario = function()
    {
        return !ViewModel.errorLogin;
    };

    ViewModel.habilitarLogin = function()
    {
        return ViewModel.usuario.clave != '' && ViewModel.usuario.nombre != '';
    };

    $scope.usuario = {
        legajo: ''
    };
    ViewModel.limpiarFormulario = function()
    {
        ViewModel.errorLogin = false;
        ViewModel.usuario = {id: '', nombre: '', clave: ''};
        $state.go('login');
    };

    ViewModel.login = function(e) {

        if(e)
        {
            ViewModel.limpiarFormulario();
        }
        else
        {
            if (ViewModel.usuario.nombre != '') {

                Auth.login(ViewModel.usuario).then(function(respuesta) {
                    if(respuesta)
                    {
                        $state.go('app.home');
                    }
                    else
                    {
                        Auth.logout();
                        ViewModel.errorLogin = true;
                    }
                    $ionicViewService.nextViewOptions({
                        disableBack: true
                    });
                }, function(response) {
                    $gastosPopup.error({ template: response.data.error.description });
                });
            }
        }
        return false;
    };
})

.controller('OfflineCtrl', function($localStorage, Mapper, $scope, lodash, Categoria)
{
    var ViewModel = $scope.viewModel = {};

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
      ViewModel.actualizar();
    });

    ViewModel.actualizar = function()
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
        ViewModel.Movimientos = Mapper.mapWithColumns('M', mapping, false)({ M: movimientos });
        ViewModel.saveList();
    };

    ViewModel.deleteItem = function(item)
    {
      var m = lodash.remove(movimientos, { id: item.id });

      ViewModel.saveList();
      ViewModel.actualizar();
    };

    ViewModel.saveList = function()
    {
        $localStorage.set('movimientos', movimientos);
    };
})

.controller('PorCategoriasCtrl', function($http, Mapper, $scope, ApiEndPoint, lodash, Gasto)
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
