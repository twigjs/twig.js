const Twig = require('..').factory();

const {twig} = Twig;

describe('Twig.js striptags filter arguments', function () {
    it('should apply allowed_tags argument', function () {
        const content = '<a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>';

        const template = twig({
            data: 'template with {{content|striptags("<a>,<b>,<p>")}}'
        });
        const output = template.render({content});

        output.should.equal('template with <a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>');
    });

    it('should remove tags if no argument passed', function () {
        const content = '<a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>';

        const template = twig({
            data: 'template with {{content|striptags}}'
        });
        const output = template.render({content});

        output.should.equal('template with linktest boldtest paragraphtest');
    });
});
