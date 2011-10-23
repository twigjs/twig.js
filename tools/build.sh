#!/bin/bash

# Combine the js files into a single file
INPUT="twig.core.js twig.fills.js twig.logic.js twig.expression.js twig.expression.operator.js twig.filters.js twig.tests.js twig.module.js"

# Write the combined output to this file
OUTPUT="twig.js"
OUTPUT_MIN="twig.min.js"

# assume this script is running from the scripts, src or root directory
if [ -f twig.core.js ]; then
	BASE="../"
elif [ -f src/twig.core.js ]; then
	BASE="./"
else
	echo "build.sh must be run from the root or src directories"
        exit;
fi

echo "" > $BASE/$OUTPUT

for file in $INPUT; do
    echo "Adding $file"
    cat $BASE/src/$file >> $BASE/$OUTPUT
    echo >> $BASE/$OUTPUT
done

# Minimize with Google Closure Compiler
echo "Minimizing"
java -jar $BASE/tools/closure/compiler.jar --js $BASE/$OUTPUT --js_output_file=$BASE/$OUTPUT_MIN
