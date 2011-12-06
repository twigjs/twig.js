#!/bin/bash

# Combine the js files into a single file
INPUT="twig.core.js twig.fills.js twig.logic.js twig.expression.js twig.expression.operator.js twig.filters.js twig.tests.js twig.exports.js twig.module.js"

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

cd $BASE

# remove the file if it already exists
if [ -f $OUTPUT ]; then
    rm $OUTPUT
fi

touch $OUTPUT
for file in $INPUT; do
    echo "Adding $file"
    cat src/$file >> $OUTPUT
    echo >> $OUTPUT
done

# Generate annotated docs with docco
echo "Generating annotated source"
docco twig.js

# Minimize with Google Closure Compiler
echo "Minimizing"
java -jar tools/closure/compiler.jar --js $OUTPUT --js_output_file=$OUTPUT_MIN


