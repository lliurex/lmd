#!/bin/bash

echo "[lmd Import] Import file from /var/www/exported..."

# Create tmp dir
if [ -d /tmp/extracted_image ]
then
    echo "[lmd Import] Preparing tmp dir..."
    rm -r /tmp/extracted_image
fi

mkdir /tmp/extracted_image

#### Ubicar dins la llista d'opcions el que hem creat n4d

echo "[lmd Import] Extracting file... ${1}"
tar -xvzf /var/www/exported/${1} -C /tmp/extracted_image/
ERR=$?
if [ $ERR -ne 0 ] ; then
    echo "[lmd Import] Error. File ${1} could not be extracted. Tar codeErr $ERR"
	exit -1
fi
# Moving
echo "[lmd Import] Moving files to LTSP folder"
extracted_image=`ls /tmp/extracted_image/opt/ltsp/*/*.json | cut -d "/" -f 6`
extracted_filename=`ls /tmp/extracted_image/opt/ltsp/*/*.json | cut -d "/" -f 7`
new_imagename="${extracted_filename%.*}"

if [ -d /opt/ltsp/${new_imagename} ];
then
    echo "[lmd Import] Error. Image Name already exists...! Folder: /opt/ltsp/${new_imagename}"
    exit -1
fi

echo "moving /tmp/extracted_image/opt/ltsp/${extracted_image} to /opt/ltsp/${new_imagename}"
echo "moving /opt/ltsp/${new_imagename}/${extracted_filename} to /etc/ltsp/images/"

mv /tmp/extracted_image/opt/ltsp/${extracted_image}  /opt/ltsp/${new_imagename}
mv /opt/ltsp/${new_imagename}/${extracted_filename}  /etc/ltsp/images/

echo "Updating kernels..."
# Update kernels and regenerate image
ltsp-update-kernels ${new_imagename}
ltsp-update-sshkeys
ltsp-update-image ${new_imagename}
ltsp-set-domain-search-ltsconf
 
# Restarting NBD
"echo Restarting nbd"
invoke-rc.d nbd-server restart

# Setting image into bootMenu
#echo "Setting image into bootMenu"
#n4d-client -c LlxBootManager -m pushToBootList -u ${USER} -p ${PASS} -a ltsp_label${new_imagename}

echo "DONE.."
exit 0
