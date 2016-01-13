#Twig.JS Compilation Demo
by Sebastian Walker
##The workflow
**Step 1**  
Update the source templates in the /raw directory.  
  
**Step 2**  
Either run the pre-made nodejs script (which is just a command shortcut) or run the following command on your own:  
```
twigjs --output compiled/ --pattern *.twig raw/
```  
  
**Step 3**  
Include your templates in your HTML  
  
**Step 4**  
Render the templates: 
```javascript
var html = twig({ ref: document.getElementById("dropdown").value }).render({name: "John Doe"});
```
