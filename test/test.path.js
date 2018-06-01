var Twig = (Twig || require("../twig")).factory(),
    twig = twig || Twig.twig;

describe("Twig.js Path ->", function() {
    var chai = require("chai"),
        sinon = require("sinon"),
        sinonChai = require("sinon-chai");

    before(function() {
        chai.Should();
        chai.use(sinonChai);
    });

    describe("relativePath ->", function() {
        var relativePath;

        before(function() {
            relativePath = Twig.path.relativePath;
        });

        it("should throw an error if trying to get a relative path in an inline template", function() {
            (function () {
                relativePath({});
            }).should.throw("Cannot extend an inline template.");
        });

        it("should give the full path to a file when file is passed", function() {
            relativePath({ url: "http://www.test.com/test.twig"}, "templates/myFile.twig").should.equal("http://www.test.com/templates/myFile.twig");
            relativePath({ path: "test/test.twig"}, "templates/myFile.twig").should.equal("test/templates/myFile.twig");
        });

        it("should ascend directories", function() {
            relativePath({ url: "http://www.test.com/templates/../test.twig"}, "myFile.twig").should.equal("http://www.test.com/myFile.twig");
            relativePath({ path: "test/templates/../test.twig"}, "myFile.twig").should.equal("test/myFile.twig");
        });

        it("should respect relative directories", function() {
            relativePath({ url: "http://www.test.com/templates/./test.twig"}, "myFile.twig").should.equal("http://www.test.com/templates/myFile.twig");
            relativePath({ path: "test/templates/./test.twig"}, "myFile.twig").should.equal("test/templates/myFile.twig");
        });

        describe("url ->", function() {
            it("should use the url if no base is specified", function() {
                relativePath({ url: "http://www.test.com/test.twig"}).should.equal("http://www.test.com/");
            });

            it("should use the base if base is specified", function() {
                relativePath({ url: "http://www.test.com/test.twig", base: "myTest" }).should.equal("myTest/");
            });
        });

        describe("path ->", function() {
            it("should use the path if no base is specified", function() {
                relativePath({ path: "test/test.twig"}).should.equal("test/");
            });

            it("should use the base if base is specified", function() {
                relativePath({ path: "test/test.twig", base: "myTest" }).should.equal("myTest/");
            });
        });
    });

    describe("parsePath ->", function() {
        var parsePath;

        before(function() {
            parsePath = Twig.path.parsePath;
        });

        it("should fall back to relativePath if the template has no namespaces defined", function() {
            var relativePathStub = sinon.stub(Twig.path, "relativePath");

            parsePath({ options: {} });

            relativePathStub.should.have.been.called;
        });
    });
});
