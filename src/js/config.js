angular.module('gastos.config', [])

.service('ENV', function($localStorage) {
    var defaults = {
        apiEndpoint: {
            production: 'https://gastos.fresno.ar/api/',
            testing: 'https://gastos-qa.fresno.ar/api/',
            dev:    'http://localhost:180/api/'
        },
        camera: {
            quality: 100
        }
    };

    const storedConfig = $localStorage.get('configuracion');
    const env = $localStorage.get('environment') ?? 'production';

    let outputConfig = {};

    if(storedConfig) {
        outputConfig = storedConfig;
    } else {
        outputConfig = defaults;
        $localStorage.set('configuracion', outputConfig)
    }
    outputConfig.defaults = defaults;
    outputConfig.env = env;
    outputConfig.set_env = (env) => {
        if (Object.keys(defaults.apiEndpoint).includes(env)) {
            $localStorage.set('environment', env)
        } else {
            throw new Error(`Invalid environment value trying to be set: ${env}`);
        }

    };
    return outputConfig;
});
