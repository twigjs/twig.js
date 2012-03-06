(function() {
	var template = twig({id:"templates/test.twig.js", data:[{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"test","match":["test"]}],"output":[{"type":"raw","value":"\n    Yep\n"}]}},{"type":"logic","token":{"type":"Twig.logic.type.else","match":["else"],"output":[{"type":"raw","value":"\n    Nope\n"}]}},{"type":"raw","value":"\n"}], precompiled: true});
	exports && exports.template = template;
})();