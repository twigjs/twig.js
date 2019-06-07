const Twig = require('../twig').factory();

const {twig} = Twig;

describe('Twig.js striptags filter arguments', function () {
    it('should apply allowed_tags argument', async function () {
        const content = '<a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>';

        const template = twig({
            data: 'template with {{content|striptags("<a>,<b>,<p>")}}'
        });
        return template.render({content}).should.be.fulfilledWith('template with <a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>');
    });

    it('should remove tags if no argument passed', async function () {
        const content = '<a href="#">linktest</a> <b>boldtest</b> <p>paragraphtest</p>';

        const template = twig({
            data: 'template with {{content|striptags}}'
        });
        return template.render({content}).should.be.fulfilledWith('template with linktest boldtest paragraphtest');
    });
});
