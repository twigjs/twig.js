#!/bin/bash

# Combine the js files into a single file
INPUT="twig.core.js twig.fills.js twig.lib.js twig.logic.js twig.expression.js twig.expression.operator.js twig.filters.js twig.tests.js twig.exports.js twig.module.js"

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
node_modules/.bin/docco $OUTPUT

# Minimize with Google Closure Compiler
echo "Minimizing"
node_modules/.bin/uglifyjs $OUTPUT > $OUTPUT_MIN

echo "Copying generated output to demos"
cp $OUTPUT demos/node_express/public/vendor/
cp $OUTPUT demos/twitter_backbone/vendor/

