import opine from "https://deno.land/x/opine@2.1.3/mod.ts";
import {renderToString} from "../../src/twig.js";
const app = opine();

app.engine('twig', renderToString);
app.set('views',"./view");
app.set('view engine', 'twig');
app.set('view cache', true);

app.get('/',function(req,res){
    res.render("base.twig",{arr:[1,2,3]})
});

app.listen(3001);
console.log("Deno started on 3001 port!");