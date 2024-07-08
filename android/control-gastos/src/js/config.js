angular.module('gastos.config', [])

.service('ENV', function($localStorage)
{
    var defaults = {
        apiEndpoint: {
            produccion: 'http://localhost:180/api/',
        // produccion: 'https://gastos.fresno.ar/api/',
                       testing:    'http://localhost:8192/api/',},
        dev: false,
        camera: {
            quality: 100
        }
    };

    var storedConfig = $localStorage.get('configuracion');

    var configs = {};

    if(storedConfig)
    {
        configs = storedConfig;
    }
    else
    {
        configs = defaults;
        $localStorage.set('configuracion', configs)
    }

    var outputConfig = {
        apiEndpoint: (function()
        {
            return configs.apiEndpoint;
        })(),
        dev: (function()
        {
            return configs.dev;
        })()
    };

    outputConfig.defaults = defaults;

    return outputConfig;
});
