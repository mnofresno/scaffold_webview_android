angular.module('gastos.filters', [])
.filter('chunk', function() {
    const chunk = (array, size) => {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    }

    const memoize = (fn) => {
        const cache = new Map();
        return function (...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = fn(...args);
            cache.set(key, result);
            return result;
        };
    }
    const memoizedChunk = memoize(chunk);

    return (array, size) => {
        return memoizedChunk(array, size);
    };
})

.filter('cutText', function ()
{
    return function (value, max, splitchar)
    {
        if (!value) return '';
        if (!splitchar) splitchar = '^';
        if (!max) max = 30;

        var array = value.split(splitchar);
        var iter = 0;
        while(array.join(', ').length > max && iter < array.join(', ').length + 1 )
        {
            var arr = array.map(function(item)
            {
                var modified = item.replace(/\./g,'');

                if(modified.length > 1)
                {
                    modified = modified.slice(0, -1);
                }

                return modified +  '..';
            });
            array = arr;
            iter++;
        }

        return array.join(', ');
    };
})

.filter('amDateFormat', function() {
    return function(value, format) {
        if (!value) return '';

        // Parse the date string
        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return value; // Return original value if it's not a valid date
        }

        // Format the date
        const options = {};
        if (format.includes('DD')) options.day = '2-digit';
        if (format.includes('MM')) options.month = '2-digit';
        if (format.includes('YYYY')) options.year = 'numeric';
        if (format.includes('HH')) options.hour = '2-digit';
        if (format.includes('mm')) options.minute = '2-digit';
        if (format.includes('ss')) options.second = '2-digit';

        return new Intl.DateTimeFormat('en-US', options).format(date);
    };
});
