const awaity = require('awaity');

function manyTemplateDataManyContexts(twig, templateData, expected, context) {
    return awaity.map(
        templateData,
        (data, idx) => {
            const testTemplate = twig({data});

            const output = testTemplate.render(context[idx]);

            return output.should.be.fulfilledWith(expected[idx]);
        }
    );
}

function manyTemplateDataSingleContext(twig, templateData, expected, context) {
    return awaity.map(
        templateData,
        (data, idx) => {
            const testTemplate = twig({data});

            const output = testTemplate.render(context);

            return output.should.be.fulfilledWith(expected[idx]);
        }
    );
}

function manyTemplateDataNoContext(twig, templateData, expected) {
    return awaity.map(
        templateData,
        (data, idx) => {
            const testTemplate = twig({data});

            const output = testTemplate.render();

            return output.should.be.fulfilledWith(expected[idx]);
        }
    );
}

async function singleTemplateDataManyContext(twig, data, expected, contexts) {
    const testTemplate = twig({data});

    return awaity.map(
        contexts,
        (context, idx) => {
            const output = testTemplate.render(context);

            return output.should.be.fulfilledWith(expected[idx]);
        }
    );
}

module.exports = function (twig) {
    return {
        mapTestDataToAssertions(templateData, expected, context) {
            if (Array.isArray(templateData) && Array.isArray(context)) {
                return manyTemplateDataManyContexts(twig, templateData, expected, context);
            }

            if (Array.isArray(templateData)) {
                if (typeof context === 'undefined') {
                    return manyTemplateDataNoContext(twig, templateData, expected);
                }

                return manyTemplateDataSingleContext(twig, templateData, expected, context);
            }

            if (Array.isArray(context)) {
                return singleTemplateDataManyContext(twig, templateData, expected, context);
            }
        }
    };
};
