#!/bin/bash


MOUNTED_DIRS=`mount | grep opt/ltsp | cut -f 3 -d' '`

for dir in $MOUNTED_DIRS; do
    umount -l $dir 2>/dev/null
done
