Twig.extend(function(TwigInternal) {
    "use strict";

    const originalRender = Twig.Template.prototype.render;

    Twig.Template.prototype.render = function(context, params, allow_async, functions_as_chain) {
        // Initialize/Reset Twig.customContext for each top-level render call
        Twig.customContext = {
            dynamicAttributes: {},
            loopIdStack: [], // Should be managed by the custom 'for' loop tag
            forcedAttributes: {},
            loopCounter: 0   // Should be managed by the custom 'for' loop tag
        };
        
        // Call the original render function to get the initial HTML
        let html = originalRender.call(this, context, params, allow_async, functions_as_chain);

        // --- Helper function to parse an attribute string into an object ---
        function parseAttributes(attrString) {
            const attributes = {};
            if (typeof attrString !== 'string' || !attrString.trim()) {
                return attributes;
            }
            // Regex to capture attribute name and optional value
            // Handles unquoted, single-quoted, double-quoted values, and boolean attributes
            const attrRegex = /([a-zA-Z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^">\s\/?]+)))?/g;
            let match;
            while ((match = attrRegex.exec(attrString)) !== null) {
                const name = match[1];
                const value = match[2] || match[3] || match[4]; // value can be undefined
                attributes[name] = value === undefined ? "" : value; // Store "" for boolean attributes
            }
            return attributes;
        }

        // --- Helper function to build an attribute string from an object ---
        function buildAttributes(attrObject) {
            let attrString = "";
            for (const name in attrObject) {
                if (attrObject.hasOwnProperty(name)) {
                    const value = attrObject[name];
                    if (value === null || value === undefined) { // Skip null/undefined attributes
                        continue;
                    }
                    attrString += " " + name;
                    if (value !== "") { // For non-boolean attributes
                        // Escape double quotes in the value
                        attrString += '="' + String(value).replace(/"/g, '&quot;') + '"';
                    }
                }
            }
            return attrString;
        }
        
        const mainRegex = /<([a-zA-Z0-9_:-]+)((?:\s+[a-zA-Z0-9_:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s\/?]+))?)*?)\s*@id_processed\s*=\s*"([^"]+)"((?:\s+[a-zA-Z0-9_:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s\/?]+))?)*?)(\s*\/?)>/g;

        html = html.replace(mainRegex, (match, tagName, attrsBefore, uniqueId, attrsAfter, selfCloseSlash) => {
            const parts = uniqueId.split('_');
            const baseTagName = parts[0]; // e.g., "button" from "button_loop1_0" or "myDiv" from "myDiv"

            const existingAttrsStr = (attrsBefore || "") + (attrsAfter || "");
            let currentAttributes = parseAttributes(existingAttrsStr);
            
            // Remove original 'id' - it must be re-added via attribute_add if desired.
            delete currentAttributes.id;
            delete currentAttributes['@id_processed']; // Should be caught by regex, but good to be sure

            const dynamicAttrs = Twig.customContext.dynamicAttributes[uniqueId] || {};
            const forcedAttrs = Twig.customContext.forcedAttributes[baseTagName] || {};

            let mergedAttrs = { ...currentAttributes };

            // Merge dynamic attributes
            for (const key in dynamicAttrs) {
                if (dynamicAttrs.hasOwnProperty(key)) {
                    if (key === 'class') {
                        const existingClasses = (mergedAttrs.class || "").trim().split(/\s+/).filter(Boolean);
                        const dynamicClasses = Array.isArray(dynamicAttrs.class) ? dynamicAttrs.class : (dynamicAttrs.class || "").trim().split(/\s+/).filter(Boolean);
                        mergedAttrs.class = [...new Set([...existingClasses, ...dynamicClasses])].join(' ');
                    } else if (key === 'style') {
                        let styleParts = [];
                        if (mergedAttrs.style) styleParts.push(mergedAttrs.style.trim().replace(/;$/, '').trim());
                        if (dynamicAttrs.style) styleParts.push(dynamicAttrs.style.trim().replace(/;$/, '').trim());
                        mergedAttrs.style = styleParts.filter(Boolean).join('; ');
                         // No trailing semicolon here yet, will be handled in forced or final cleanup.
                    } else {
                        mergedAttrs[key] = dynamicAttrs[key];
                    }
                }
            }

            // Merge forced attributes (take precedence or append for style)
            for (const key in forcedAttrs) {
                 if (forcedAttrs.hasOwnProperty(key)) {
                    if (key === 'class') {
                        const existingClasses = (mergedAttrs.class || "").trim().split(/\s+/).filter(Boolean);
                        const newForcedClasses = Array.isArray(forcedAttrs.class) ? forcedAttrs.class : (forcedAttrs.class || "").trim().split(/\s+/).filter(Boolean);
                        mergedAttrs.class = [...new Set([...existingClasses, ...newForcedClasses])].join(' ');
                    } else if (key === 'style') {
                        if (forcedAttrs.style === null) {
                            mergedAttrs.style = null; // Mark for deletion
                        } else if (typeof forcedAttrs.style === 'string') {
                            let currentStyleValue = (mergedAttrs.style || "").trim();
                            let forcedStyleValue = forcedAttrs.style.trim();

                            // Normalize current style: remove trailing semicolon if present
                            if (currentStyleValue.endsWith(';')) {
                                currentStyleValue = currentStyleValue.slice(0, -1).trim();
                            }

                            // Normalize forced style: remove leading semicolon if present
                            if (forcedStyleValue.startsWith(';')) {
                                forcedStyleValue = forcedStyleValue.substring(1).trim();
                            }
                             // Normalize forced style: remove trailing semicolon if present (as it will be the last part)
                            if (forcedStyleValue.endsWith(';')) {
                                forcedStyleValue = forcedStyleValue.slice(0, -1).trim();
                            }


                            if (currentStyleValue && forcedStyleValue) {
                                mergedAttrs.style = currentStyleValue + '; ' + forcedStyleValue;
                            } else if (forcedStyleValue) {
                                mergedAttrs.style = forcedStyleValue;
                            } else if (currentStyleValue) {
                                // mergedAttrs.style remains currentStyleValue, no change needed
                                mergedAttrs.style = currentStyleValue; 
                            } else {
                                mergedAttrs.style = ""; // Both empty or forced is empty and current was already empty
                            }
                        }
                        // If forcedAttrs.style is undefined, mergedAttrs.style remains as is (from dynamic/existing)
                    } else {
                        mergedAttrs[key] = forcedAttrs[key];
                    }
                }
            }
            
            // Final cleanup of class and style (remove if empty)
            if (mergedAttrs.class && !mergedAttrs.class.trim()) {
                delete mergedAttrs.class;
            }
            if (mergedAttrs.style) {
                mergedAttrs.style = mergedAttrs.style.trim();
                if (mergedAttrs.style.endsWith(';')) { // Remove trailing semicolon if it's the absolute last char
                    mergedAttrs.style = mergedAttrs.style.slice(0, -1).trim();
                }
                if (!mergedAttrs.style) { // If it became empty after trimming
                    delete mergedAttrs.style;
                }
            }


            // Attribute removal for null/undefined values
            for (const key in mergedAttrs) {
                if (mergedAttrs.hasOwnProperty(key) && (mergedAttrs[key] === null || mergedAttrs[key] === undefined)) {
                    delete mergedAttrs[key];
                }
            }
            
            const finalAttrsString = buildAttributes(mergedAttrs);
            return `<${tagName}${finalAttrsString}${selfCloseSlash || ''}>`;
        });

        return html;
    };
});
