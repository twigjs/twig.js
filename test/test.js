Twig.debug = true;

var interesting = twig({
    html: '{% if interesting %}Nothing of interest in here{% else %}Just keep looking, ater all you said {{ interesting }}.{% endif %}'
});
console.log(interesting);

/* var example = twig({
    html: 'The {{ baked_good }} is a lie. {{ 12.5 + 10 / (2 - 4) + 6.5}} == 14.<br /> 123 % 4 = {{ 123 % 4 }}'
});
console.log(example); */

window.onload = function() {
    /* document.getElementById("test").innerHTML = example.render({
        baked_good: 'cake'
    }); */
    document.getElementById("test").innerHTML = interesting.render({
        interesting: false
    });
}

//
//console.log(twig({
//    html: '{{ test }}'
//}));
//console.log(twig({
//    html: '{% if something %}{{ test }}{% endif %}'
//}));

// var output = test_template.render(model);
