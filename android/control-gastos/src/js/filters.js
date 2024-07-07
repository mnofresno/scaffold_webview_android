angular.module('gastos.filters', [])
.filter('chunk', function(lodash) 
{
    var filtro = lodash.memoize(lodash.chunk);
    return filtro;
})

.filter('cutText', function (lodash) 
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
            var arr = lodash.map(array, function(item)
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