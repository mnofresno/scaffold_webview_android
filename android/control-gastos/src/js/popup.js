import $ from 'jquery';

var GastosPopupModule = angular.module('gastos.popup', ['ui.router']),
    extend = angular.extend,
    jqLite = angular.element;

var POPUP_TPL =
  '<div class="popup-container" ng-class="cssClass">' +
    '<div class="popup">' +
      '<div class="popup-head">' +
        '<h3 class="popup-title" ng-bind="trustedTitle"></h3>' +
        '<h5 class="popup-sub-title" ng-if="subTitle" ng-bind="trustedSubTitle"></h5>' +
      '</div>' +
      '<div class="popup-body" ng-bind-html="trustedTemplate">' +
      '</div>' +
      '<div class="popup-buttons" ng-show="buttons.length">' +
        '<button ng-repeat="button in buttons" ng-click="$buttonTapped(button, $event)" class="button" ng-class="button.type || \'button-default\'" ng-bind="button.text"></button>' +
      '</div>' +
    '</div>' +
  '</div>';

GastosPopupModule.factory('$gastosPopup', [
  '$q',
  '$timeout',
  '$rootScope',
  '$compile',
  '$sce', function($q, $timeout, $rootScope, $compile, $sce) {
    var popupStack = [];

    var $gastosPopup = {
      show: showPopup,
      alert: showAlert,
      error: function(opts) {
          showAlert(extend({
              cssClass: 'popup-container-assertive',
              title: 'Error',
              template: '<h1><i class="icon ion-minus-circled"></i></h1>',
              okText: 'Aceptar'
          }, opts || {}));
      },
      confirm: showConfirm,
      prompt: showPrompt,
      _createPopup: createPopup,
      _popupStack: popupStack
    };

    return $gastosPopup;

    function createPopup(options) {
      options = extend({
        scope: null,
        title: '',
        buttons: []
      }, options || {});

      var self = {};
      self.scope = (options.scope || $rootScope).$new();
      self.element = jqLite(POPUP_TPL);
      self.responseDeferred = $q.defer();

      $('body').append(self.element);
      $compile(self.element)(self.scope);

      extend(self.scope, {
        title: options.title,
        buttons: options.buttons,
        subTitle: options.subTitle,
        cssClass: options.cssClass,
        trustedTitle: $sce.trustAsHtml(options.title),
        trustedSubTitle: $sce.trustAsHtml(options.subTitle),
        trustedTemplate: $sce.trustAsHtml(options.template),
        template: options.template,
        $buttonTapped: function(button, event) {
          var result = (button.onTap || angular.noop)(event);
          event = event.originalEvent || event; //jquery events

          if (!event.defaultPrevented) {
            self.responseDeferred.resolve(result);
          }
        }
      });

      $q.when(options.templateUrl ? $.get(options.templateUrl) : (options.template || options.content || ''))
      .then(function(template) {
        var popupBody = jqLite(self.element[0].querySelector('.popup-body'));
        if (template) {
          self.scope.trustedTemplate = $sce.trustAsHtml(template);
          $compile(popupBody.contents())(self.scope);
        } else {
          popupBody.remove();
        }
      });

      self.show = function() {
        if (self.isShown || self.removed) return;

        self.isShown = true;
        requestAnimationFrame(function() {
          if (!self.isShown) return;

          self.element.removeClass('popup-hidden');
          self.element.addClass('popup-showing active');
          focusInput(self.element);
        });
      };

      self.hide = function(callback) {
        callback = callback || angular.noop;
        if (!self.isShown) return callback();

        self.isShown = false;
        self.element.removeClass('active');
        self.element.addClass('popup-hidden');
        $timeout(callback, 250, false);
      };

      self.remove = function() {
        if (self.removed) return;

        self.hide(function() {
          self.element.remove();
          self.scope.$destroy();
        });

        self.removed = true;
      };

      return self;
    }

    function showPopup(options) {
      var popup = $gastosPopup._createPopup(options);
      var showDelay = 0;

      if (popupStack.length > 0) {
        popupStack[popupStack.length - 1].hide();
        showDelay = 75;
      }

      popupStack.push(popup);
      $timeout(popup.show, showDelay, false);

      popup.responseDeferred.promise.then(function(result) {
        var index = popupStack.indexOf(popup);
        if (index !== -1) {
          popupStack.splice(index, 1);
        }

        if (popupStack.length > 0) {
          popupStack[popupStack.length - 1].show();
        }

        popup.remove();

        return result;
      });

      return popup.responseDeferred.promise;
    }

    function focusInput(element) {
      var focusOn = element[0].querySelector('[autofocus]');
      if (focusOn) {
        focusOn.focus();
      }
    }

    function showAlert(opts) {
      return showPopup(extend({
        cssClass: 'popup-container-balanced',
        title: opts.title || '',
        template: opts.template || '',
        okText: 'Aceptar',
        buttons: [{
          text: opts.okText || 'OK',
          type: opts.okType || 'button-positive',
          onTap: function() {
            return true;
          }
        }]
      }, opts || {}));
    }

    function showConfirm(opts) {
      return showPopup(extend({
        buttons: [{
          text: opts.cancelText || 'Cancel',
          type: opts.cancelType || 'button-default',
          onTap: function() { return false; }
        }, {
          text: opts.okText || 'OK',
          type: opts.okType || 'button-positive',
          onTap: function() { return true; }
        }]
      }, opts || {}));
    }

    function showPrompt(opts) {
      var scope = $rootScope.$new(true);
      scope.data = {};
      var text = '';
      if (opts.template && /<[a-z][\s\S]*>/i.test(opts.template) === false) {
        text = '<span>' + opts.template + '</span>';
        delete opts.template;
      }
      return showPopup(extend({
        template: text + '<input ng-model="data.response" type="' + (opts.inputType || 'text') +
          '" placeholder="' + (opts.inputPlaceholder || '') + '">',
        scope: scope,
        buttons: [{
          text: opts.cancelText || 'Cancel',
          type: opts.cancelType || 'button-default',
          onTap: function() {}
        }, {
          text: opts.okText || 'OK',
          type: opts.okType || 'button-positive',
          onTap: function() {
            return scope.data.response || '';
          }
        }]
      }, opts || {}));
    }
  }
]);
