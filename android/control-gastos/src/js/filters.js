angular.module('gastos.filters', [])
.filter('chunk', function() {
    return function(input, size) {
        if (!Array.isArray(input)) {
            return input;
        }
        if (typeof size !== 'number' || size <= 0) {
            return input;
        }

        var result = [];
        for (var i = 0; i < input.length; i += size) {
            result.push(input.slice(i, i + size));
        }
        return result;
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
});
