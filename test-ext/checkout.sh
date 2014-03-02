#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ ! -d $DIR/twig.php ]; then
	git clone git://github.com/fabpot/Twig.git $DIR/twig.php
else
	cd $DIR/twig.php
	git pull
fi
