(function(Twig){
    'use strict';

    Twig.Templates.registerParser('twig', function(params) {
        return new Twig.Template(params);
    });
})(Twig);
