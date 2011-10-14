#!/bin/bash

# Combine the js files into a single file
INPUT="twig.core.js twig.fills.js twig.logic.js twig.expression.js twig.expression.operator.js twig.module.js"

# Write the combined output to this file
OUTPUT="twig.dev.js"

# assume this script is running from the scripts, src or root directory
if [ -f twig.core.js ]; then
	BASE="."
elif [ -f src/twig.core.js ]; then
	BASE="./src"
else
	BASE="../src"
fi

echo "" > $BASE/$OUTPUT

for file in $INPUT; do
	cat $BASE/$file >> $BASE/$OUTPUT
	echo >> $BASE/$OUTPUT
done

