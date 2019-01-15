#!/bin/bash


if [ $# -ne 3 ]; 
    then echo "lmd-exoprt-img.sh needs 3 parameters. "
    echo "<b>Finished with status -1</b>"
    exit -1;
fi

# Create  exported directory if does not exists
[ -d /var/www/exported ] || mkdir /var/www/exported

# copy new img descriptor (tmp/xxx) into chroot image
echo "[LMD Export Image] Copying configuration file... from ${1} to ${2}"
cp $1 $2

echo "[LMD Export Image] Compressing image"
echo "tar -cvzf /var/www/exported/${3} --one-file-system --exclude=/lost+found ${2}"
tar -cvzf /var/www/exported/${3} --one-file-system --exclude=/lost+found ${2}


echo "<br/>Go to Exported LMD Images to got it (or /var/www/exported if you are on server).<br/>"
echo "<b>Finished with status 0</b>"
exit 0
