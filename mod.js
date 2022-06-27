import {twig} from "./src/twig.js";
export {renderToString} from "./src/twig.js"
// renderToString("test/templates/embed-base.twig").then(console.log);
// // twig.twig({
// //     id: 'outputId',
// //     path: "test/templates/embed-base.twig",
// //     load(template) {
// //         // Compile!
// //         const output = template.compile({twig:"test/templates/embed-base.twig"});
// //         Deno.writeTextFile('file.js', output);
// //     }
// // })
export default twig