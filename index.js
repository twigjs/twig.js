import Twig from "./twig.js/twig.js";
Twig.debug=true;
Twig.renderFile('./pass-keeper/views/index.twig', {foo:'bar', settings:{async:false}}, (err, html) => {
      console.log(err, html)
}
);
console.log();
console.log(1);
