Twig.extendFunction('attribute_add', function(tag, attributeName, value, force = false) {
    if (!Twig.customContext) {
        // console.error("Twig.customContext not initialized! This function requires Twig.customContext to be set up.");
        // For this task, we assume Twig.customContext is initialized by the user/framework.
        return ""; // Return empty string as per requirements
    }

    let targetStore;
    let currentTargetIdKey; // This will be the key used in the targetStore (e.g., 'div_abc_0' or 'div')

    if (force) {
        targetStore = Twig.customContext.forcedAttributes;
        currentTargetIdKey = tag; // Forced attributes are stored by base tag name.
        // Ensure the specific tag entry exists in forcedAttributes
        if (!targetStore[currentTargetIdKey]) {
            targetStore[currentTargetIdKey] = {};
        }
    } else {
        targetStore = Twig.customContext.dynamicAttributes;
        let baseId = tag; // Default if not in a loop or if loop context is incomplete

        // Determine targetId based on loop context
        // Check if loop context exists, loopIdStack is available and not empty
        if (this.context && this.context.loop && Twig.customContext.loopIdStack && Twig.customContext.loopIdStack.length > 0) {
            const loopInfo = Twig.customContext.loopIdStack[Twig.customContext.loopIdStack.length - 1]; // Get current loop info
            const loopHash = loopInfo.hash;
            
            let loopIndexValue = undefined;
            // Prefer loop.index (1-based, common in Twig)
            if (typeof this.context.loop.index === 'number') {
                loopIndexValue = this.context.loop.index;
            } 
            // Fallback to loop.index0 (0-based) if loop.index is not a number
            else if (typeof this.context.loop.index0 === 'number') {
                loopIndexValue = this.context.loop.index0;
            }

            if (typeof loopIndexValue === 'number') {
                 baseId = tag + '_' + loopHash + '_' + loopIndexValue;
            }
            // If a valid loopIndexValue is not found, baseId remains 'tag'.
        }
        currentTargetIdKey = baseId;
        // Ensure the specific targetIdKey entry exists in dynamicAttributes
        if (!targetStore[currentTargetIdKey]) {
            targetStore[currentTargetIdKey] = {};
        }
    }
    
    // storeLocation is the actual object where attributes for the currentTargetIdKey are stored.
    const storeLocation = targetStore[currentTargetIdKey];

    // Merging logic for 'class'
    if (attributeName === 'class') {
        let existingClasses = [];
        // Ensure existing storeLocation.class is treated as an array
        if (Array.isArray(storeLocation.class)) {
            existingClasses = storeLocation.class;
        } else if (typeof storeLocation.class === 'string' && storeLocation.class.trim().length > 0) {
            // Convert string to array, splitting by one or more spaces, and filter empty strings
            existingClasses = storeLocation.class.trim().split(/\s+/).filter(c => c.length > 0);
        }
        
        let newClasses = [];
        if (typeof value === 'string') {
            // Split by one or more spaces, and filter empty strings
            newClasses = value.trim().split(/\s+/).filter(c => c.length > 0);
        } else if (Array.isArray(value)) {
            // Filter out non-string or empty string values from the input array, and trim valid strings
            newClasses = value.map(c => (typeof c === 'string' ? c.trim() : '')).filter(c => c.length > 0);
        }
        // Combine and ensure uniqueness
        storeLocation.class = [...new Set([...existingClasses, ...newClasses])];
    } 
    // Merging logic for 'style'
    else if (attributeName === 'style') {
        let currentStyle = storeLocation.style || "";
        let newStyleValue = value || "";

        // Normalize current style: ensure it's a string, trim, and remove any trailing semicolon.
        if (typeof currentStyle === 'string' && currentStyle.trim() !== "") {
            currentStyle = currentStyle.trim();
            if (currentStyle.endsWith(';')) {
                currentStyle = currentStyle.slice(0, -1).trim(); // Trim again after slicing
            }
        } else {
            currentStyle = ""; // Reset if not a string or is empty/whitespace
        }

        // Normalize new style value: ensure it's a string, trim, and remove any leading/trailing semicolons.
        if (typeof newStyleValue === 'string' && newStyleValue.trim() !== "") {
            newStyleValue = newStyleValue.trim();
            // Remove leading semicolon
            if (newStyleValue.startsWith(';')) {
                newStyleValue = newStyleValue.substring(1).trim(); // Trim again
            }
            // Remove trailing semicolon
            if (newStyleValue.endsWith(';')) {
                newStyleValue = newStyleValue.slice(0, -1).trim(); // Trim again
            }
        } else {
            newStyleValue = ""; // Reset if not a string or is empty/whitespace
        }
        
        let combinedStyleParts = [];
        if (currentStyle) { // Only add if currentStyle is not empty after normalization
            combinedStyleParts.push(currentStyle);
        }
        if (newStyleValue) { // Only add if newStyleValue is not empty after normalization
            combinedStyleParts.push(newStyleValue);
        }
        
        // Join with '; ' only if there are multiple valid, non-empty parts.
        // Trim the result to remove any potential leading/trailing space if only one part exists or if empty.
        storeLocation.style = combinedStyleParts.join('; ').trim();

    } 
    // Other attributes
    else {
        // For boolean attributes, an empty string value (e.g. {{ attribute_add('input', 'disabled', '') }})
        // will be stored as an empty string. The rendering logic (Step 3 of the main plan) will need to handle this
        // to correctly output as a boolean attribute (e.g., just 'disabled' without '= ""').
        // If value is null or undefined, it can signify removal or no value, which is fine for storage.
        storeLocation[attributeName] = value;
    }

    return ""; // Function should not output anything directly into the template
});
