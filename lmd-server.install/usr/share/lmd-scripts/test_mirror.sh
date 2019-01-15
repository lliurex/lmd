#!/bin/bash

MIRROR="http://localhost/mirror/llx1406"
DIST="platinum"
# http://localhost/mirror/llx1306/dists/pandora/Release
# testing http://localhost/mirror/llx1306/dists/pandora/Release

RELEASEFILE="${MIRROR}/dists/${DIST}/Release"

echo "File to get: "+$RELEASEFILE

wget $RELEASEFILE

result=$?

if [ $result -eq 0 ]; then
    echo "Mirror exists"
    exit 0
fi

echo "Mirror not exists. Error: "+$result
    



    
