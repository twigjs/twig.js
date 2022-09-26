const Twig = require('..').factory();

describe('Twig.js Performance Regressions ->', function () {
    const template = '{{ echoTest }}\n' +
    '{% for item in items %}\n' +
        '<h1>{{ item.title }}</h1>\n' +
        '{% if item.isActive %}\n' +
            '<h3 style="color: green;">Active</h3>\n' +
        '{% else %}\n' +
            '<h3 style="color: red;">Inactive</h3>\n' +
        '{% endif %}\n' +
    '{% endfor %}';

    it('Should not start running slower', function () {
        this.timeout(500);
        this.retries(3);
        this.slow(300);

        console.time('Should not start running slower ');
        for (let i = 0; i < 1000; i++) {
            Twig.twig({
                data: template
            }).render({
                echoTest: 'Data for echo',
                items: [
                    {
                        title: 'This is a title',
                        isActive: true
                    },
                    {
                        title: 'This is a title',
                        isActive: false
                    }
                ]
            });
        }
    });
});
