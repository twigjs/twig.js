var Twig = Twig || require("../twig"),
    twig = twig || Twig.twig;

describe("Twig.js Extensions ->", function() {
    it("should be able to extend a meta-type tag", function() {
    	var flags = {};

    	Twig.extend(function(Twig) {
    		Twig.exports.extendTag({
	            type: "flag",
	            regex: /^flag\s+(.+)$/,
		        next: [ ],
		        open: true,
	            compile: function (token) {
	                var expression = token.match[1];

	                // Compile the expression.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var name = Twig.expression.parse.apply(this, [token.stack, context]),
	                	output = '';

	                flags[name] = true;

	                return {
	                    chain: false,
	                    output: output
	                };
	            }
    		});
    	});

    	var template = twig({data:"{% flag 'enabled' %}"}).render();
    	flags.enabled.should.equal(true);
    });

    it("should be able to extend paired tags", function() {
    	// demo data
    	var App = {
    		user: "john",
    		users: {
    			john: {level: "admin"},
    			tom: {level: "user"}
    		}
    	};

    	Twig.extend(function(Twig) {
    		// example of extending a tag type that would
    		// restrict content to the specified "level"
    		Twig.exports.extendTag({
	            type: "auth",
	            regex: /^auth\s+(.+)$/,
	            next: ["endauth"], // match the type of the end tag
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1];

	                // turn the string expression into tokens.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	            	var level = Twig.expression.parse.apply(this, [token.stack, context]),
	            		output = "";

	            	if (App.users[App.currentUser].level == level)
	            	{
		                output = Twig.parse.apply(this, [token.output, context]);
		            }

	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
    		});
    		Twig.exports.extendTag({
	            type: "endauth",
	            regex: /^endauth$/,
	            next: [ ],
	            open: false
	        });
    	});

    	var template = twig({data:"Welcome{% auth 'admin' %} ADMIN{% endauth %}!"});

		App.currentUser = "john";
    	template.render().should.equal("Welcome ADMIN!");

		App.currentUser = "tom";
		template.render().should.equal("Welcome!");
    });

    it("should be able to extend the same tag twice, replacing it", function() {
        var flags = {};

        Twig.extend(function(Twig) {
            Twig.exports.extendTag({
                type: "noop",
                regex: /^noop$/,
                next: [ ],
                open: true,
                parse: function (token, context, chain) {
                    return {
                        chain: false,
                        output: "noop1"
                    };
                }
            });
        });

        var result = twig({data:"{% noop %}"}).render();
        result.should.equal("noop1");

        Twig.extend(function(Twig) {
            Twig.exports.extendTag({
                type: "noop",
                regex: /^noop$/,
                next: [ ],
                open: true,
                parse: function (token, context, chain) {
                    return {
                        chain: false,
                        output: "noop2"
                    };
                }
            });
        });

        var result = twig({data:"{% noop %}"}).render();
        result.should.equal("noop2");
    });
});