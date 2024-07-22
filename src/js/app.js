import '../styles/ionic.app.scss';
import '../styles/main_styles.scss';
import angular from 'angular';
import controllers from './controllers';
import services from './services';
import config from './config';
import interceptors from './interceptors';
import filters from './filters';
import directives from './directives';
import {$ionicPlatform, $ionicHistory, $ionicViewService, $ionicLoading, md5, moment} from './ionic-cordova';
import '@uirouter/angularjs';
import 'ng-cordova';
import 'lodash';
import './popup';

const app = angular.module('gastos', [
    'ui.router',
    'ngCordova',
    'gastos.controllers',
    'gastos.services',
    'gastos.config',
    'gastos.interceptors',
    'gastos.filters',
    'gastos.directives',
    'gastos.popup'
]);

app.config(function($stateProvider) {
    $stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('app.home', {
        url: '/home',
        views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('app.listadoGastos', {
      url: '/listado',
      views: {
        'menuContent': {
          templateUrl: 'templates/movimientos.html',
          controller: 'ListadoGastosCtrl'
        }
      }
    })
    .state('app.gastosMensuales', {
      url: '/mensuales',
      views: {
        'menuContent': {
          templateUrl: 'templates/mensuales.html',
          controller: 'GastosMensualesCtrl'
        }
      }
    })
    .state('app.Configuracion', {
      url: '/configuracion',
      views: {
        'menuContent': {
          templateUrl: 'templates/configuracion.html',
          controller: 'ConfiguracionCtrl'
        }
      }
    })
    .state('app.realizarReintegro', {
        url: '/reintegrar',
        views: {
        'menuContent': {
          templateUrl: 'templates/reintegro.html',
          controller: 'ReintegroCtrl'
        }
      }
    })
  .state('app.offline', {
      url: '/offline',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/offline.html',
          controller: 'OfflineCtrl'
        }
      }
  })
  .state('app.gastosPorCategoria', {
      url: '/porCategoria',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/porCategoria.html',
          controller: 'PorCategoriasCtrl'
        }
      }
  });

});

app.run(function(
    $state,
    $rootScope,
    Auth,
    $stateParams,
    $cordovaToast,
    NotificacionesService
) {
    console.log("run");
    $state.reload = function reload()
    {
        $state.transitionTo($state.current, $stateParams, { reload: true, inherit: true, notify: true });
    };

	$rootScope.$on('notification',function(data)
	{
		alert("RECEIVED PUSH: " + JSON.stringify(data) );
	});

    const initialize = function() {
        NotificacionesService.registerCallbacks();

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard)
        {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.cordova && window.cordova.plugins && window.cordova.plugins.certificates)
        {
            cordova.plugins.certificates.trustUnsecureCerts(true);
        }
        if (window.StatusBar)
        {
            StatusBar.styleDefault();
        }

        if (Auth.isAuthed())
        {
            $state.go('app.home');
        }
        else
        {
            $state.go('login');
        }

        // document.addEventListener('deviceready', function ()
        // {
        // GATO
        //     // Android customization
        //     //cordova.plugins.backgroundMode.setDefaults({ text: 'Obteniendo saldo actual...', title: 'CONTROL DE GASTOS'});
        //     // Enable background mode
        //     //cordova.plugins.backgroundMode.enable();
        // }, false);

        $ionicPlatform.registerBackButtonAction(function(e)
        {
            if ($rootScope.backButtonPressedOnceToExit)
            {
                ionic.Platform.exitApp();
            }
            else if ($state.current.name !== 'app.home')
            {
                // FIXME: Fix go back of ionicHistory
                // $ionicHistory.goBack();
            }
            else
            {
                $rootScope.backButtonPressedOnceToExit = true;
                $cordovaToast.show('Presione nuevamente para salir...', 'short', 'center');

                setTimeout(function()
                {
                    $rootScope.backButtonPressedOnceToExit = false;
                }, 2000);
            }

            e.preventDefault();
            return false;
        }, 101);
    };

    if (window.cordova) {
        document.addEventListener('deviceready', initialize, false);
    } else {
        angular.element(document).ready(initialize);
    }

    $rootScope.$on('unauthorized', function() {
        $state.go('login');
    });

    function showSpinner() {
        document.getElementsByClassName('spinner-container')[0].style.display = 'flex';
    }

    function hideSpinner() {
        document.getElementsByClassName('spinner-container')[0].style.display = 'none';
    }

    $rootScope.$on('loading:show', function() {
        showSpinner();
    });

    $rootScope.$on('loading:hide', function() {
        hideSpinner();
    });

    // $ionicPlatform.on('resume',function(){ $rootScope.refreshSaldo(); });
})

// // .config(function($ionicConfigProvider)
// // {
// //     $ionicConfigProvider.scrolling.jsScrolling(false);
// // })

// // .config(function(multiselectProvider) {
// //     multiselectProvider.setTemplateUrl('templates/Layout/selectTemplate.html');
// //     multiselectProvider.setModalTemplateUrl('lib/ionic-multiselect/dist/templates/modal-template.html');
// // })



.config(function($httpProvider) {
    // El orden en que se registran es el orden en el cual se encadenan
    //$httpProvider.interceptors.push('CheckNetworkInterceptor');
    $httpProvider.interceptors.push('LoadingInterceptor');
    $httpProvider.interceptors.push('sessionInjector');
    $httpProvider.interceptors.push('QueryLogDetectionInjector');
});
