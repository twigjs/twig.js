var Twig = (Twig || require("../twig")).factory(),
    twig = twig || Twig.twig;

describe("Twig.js Performance Regressions ->", function() {

    var template = "{{ echo_test }}\
    {% for item in items %}\
        <h1>{{ item.title }}</h1>\
        {% if item.is_active %}\
            <h3 style=\"color: green;\">Active</h3>\
        {% else %}\
            <h3 style=\"color: red;\">Inactive</h3>\
        {% endif %}\
    {% endfor %}";

    it("Should not start running slower", function() {
        this.timeout(500);
        this.retries(3);
        this.slow(300);

        console.time('Should not start running slower ');
        for(var i = 0; i < 1000; i++) {
            Twig.twig({
                data: template
            }).render({
                echo_test: 'Data for echo',
                items: [
                    {
                        title: "This is a title",
                        is_active: true
                    },
                    {
                        title: "This is a title",
                        is_active: false
                    }
                ]
            });
        }
    });

});
