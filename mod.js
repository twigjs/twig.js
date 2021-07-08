import Twig from "./src/twig.js";


export const renderToString = function (path, options) {
    return new Promise(
        (resolve, reject) => {
            // @ts-ignore
            Twig.renderFile(path, options, (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
};
export default Twig