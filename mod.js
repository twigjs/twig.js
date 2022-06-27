import {twig} from "./src/twig.js";


export const renderToString = function (path, options) {
    return new Promise(
        (resolve, reject) => {
            // @ts-ignore
            twig.renderFile(path, options, (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
};
renderToString("test/templates/embed-base.twig").then(console.log);

export default twig