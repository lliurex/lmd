#!/bin/bash

##

#lang=$(locale | grep LANGUAGE | cut -d= -f2 | cut -d_ -f1)
lang=$LANG
if [[ ${lang} == "ca_ES" ]] || [[ ${lang} == "ca_ES@valencia" ]] || [[ ${lang} == "ca" ]] || [[ ${lang} == "ca@valencia" ]]  || [[ ${lang} == "ca_ES.utf8@valencia" ]];
then
    MSG_INFO_IMPORT="Aneu a importar la imatge: "
    MSG_EXTRACTING="Extraient la imatge. Espereu un moment... "
    MSG_CANCELLED="El procés ha estat cancel·lat"
    MSG_CREATE_SQUASHFS="S'està creant la imatge al servidor."
    MSG_SUCCESS="La imatge de client s'ha importat"
    MSG_PASS_TITLE="Contrassenya d'administrador"
    MSG_PASS="Inseriu la contrassenya d'administrador"
    MSG_EXISTS_CHROOT="Ja existeix una imatge amb este nom. Voleu sobreescriure-la?"
    MSG_REMOVING="Esborrant la imatge prèvia..."
    MSG_OK="Accepta"
    MSG_CANCEL="Cancel·la"
elif  [[ ${lang} == "es_ES" ]] || [[ ${lang} == "es" ]] || [[ ${lang} == "es_ES.UTF-8" ]];
then
    MSG_INFO_IMPORT="Va a importar la imagen: "
    MSG_EXTRACTING="Extrayendo imagen. Espere un momento. "
    MSG_CANCELLED="El proceso se ha cancelado"
    MSG_CREATE_SQUASHFS="Creando la imagen en el servidor..."
    MSG_SUCCESS="La imagen de cliente se ha importado"
    MSG_PASS_TITLE="Contraseña del administrador"
    MSG_PASS="Inserte la contraseña de administrador"
    MSG_EXISTS_CHROOT="¿Ya existe una imagen con este nombre. Desea sobreescribirla?"
    MSG_REMOVING="Borrando la imagen previa..."
    MSG_OK="Aceptar"
    MSG_CANCEL="Cancelar"
else
    MSG_INFO_IMPORT="You are going to import image: "
    MSG_EXTRACTING="Extracting image. Please wait... "
    MSG_CANCELLED="Process has been cancelled"
    MSG_CREATE_SQUASHFS="Creating image in server..."
    MSG_SUCCESS="Thin client image has been exporported"
    MSG_PASS_TITLE="Admin Password"
    MSG_PASS="Insert admin password"
    MSG_EXISTS_CHROOT="An image with this name alreasy exists. Overwrite it?"
    MSG_REMOVING="Deleting previous image..."
    MSG_OK="Ok"
    MSG_CANCEL="Cancel"
fi

ZEN_ERROR="--ok-label=$MSG_OK"
ZEN_QUESTION="--cancel-label=$MSG_CANCEL $ZEN_ERROR"

if [ $# -ne 1 ]; 
    then echo "USAGE: lmd-import-img.sh image.lmdimg" 
    exit -1;
fi

# Confirm message
zenity --question --text "${MSG_INFO_IMPORT} ${1}" $ZEN_QUESTION --width=500 --height=100
if [ $? -eq 1 ];
then
    exit 1
fi

# Admin Password
PASS=`zenity --password --text "${MSG_PASS}" --title "${MSG_PASS_TITLE}" $ZEN_QUESTION` --width=500 --height=100
    
# Remove previous images in tmp
echo "[lmd Import] Removing prevous uncompressed images in tmp..."

if [[ -d /tmp/extracted_image ]]
then
    rm -r /tmp/extracted_image
fi
mkdir /tmp/extracted_image

#### Ubicar dins la llista d'opcions el que hem creat n4d

echo "[lmd Import] Extracting file..."
echo "[lmd Import] Extracting file... " > /tmp/importlog.txt
tar -xvzf ${1} -C /tmp/extracted_image | zenity --progress --pulsate --auto-close --text "${MSG_EXTRACTING}" $ZEN_QUESTION --width=500 --height=100

if [ $? -ne 0 ] ; then
zenity --error --text "${MSG_CANCELLED}" $ZEN_ERROR --width=500 --height=100
exit -1
fi

echo "[lmd Import] Extracted. No errors untaring. " >> /tmp/importlog.txt


# Moving
extracted_image=`ls /tmp/extracted_image/opt/ltsp/*/*.json | cut -d "/" -f 6`
extracted_filename=`ls /tmp/extracted_image/opt/ltsp/*/*.json | cut -d "/" -f 7`
new_imagename="${extracted_filename%.*}"

echo "[lmd Import] Extracted image is  $extracted_image" >> /tmp/importlog.txt


if [ -d /opt/ltsp/${new_imagename} ];
then
    zenity --question --text "${MSG_EXISTS_CHROOT}" $ZEN_QUESTION --width=500 --height=100
    if [ $? -eq  1 ]; then
        echo "[lmd Import] Cancelled. Image exists." >> /tmp/importlog.txt
        exit -1
    else
        echo "[lmd Import] Image already exists, but deleting that" >> /tmp/importlog.txt
        rm -r /opt/ltsp/${new_imagename} | zenity --progress --auto-close --pulsate --text "${MSG_REMOVING}" $ZEN_QUESTION --width=500 --height=100
    fi
fi


echo "moving /tmp/extracted_image/opt/ltsp/${extracted_image} to /opt/ltsp/${new_imagename}"
echo "moving /opt/ltsp/${new_imagename}/${extracted_filename} to /etc/ltsp/images/"

echo "moving /tmp/extracted_image/opt/ltsp/${extracted_image} to /opt/ltsp/${new_imagename}"  >> /tmp/importlog.txt
echo "moving /opt/ltsp/${new_imagename}/${extracted_filename} to /etc/ltsp/images/"  >> /tmp/importlog.txt


mv /tmp/extracted_image/opt/ltsp/${extracted_image}  /opt/ltsp/${new_imagename}
mv /opt/ltsp/${new_imagename}/${extracted_filename}  /etc/ltsp/images/

# Update kernels and regenerate image
echo "[lmd Import] Updating kernels into image" >> /tmp/importlog.txt
ltsp-update-kernels ${new_imagename}

echo "[lmd Import] Updating keys" >> /tmp/importlog.txt
ltsp-update-sshkeys

echo "[lmd Import] Update image" >> /tmp/importlog.txt
ltsp-update-image ${new_imagename} | zenity --progress --pulsate --text "${MSG_CREATE_SQUASHFS}" $ZEN_QUESTION --width=500 --height=100
# WTF !!! lmd-server.install/usr/sbin/lmd-import-img.sh

if [ $? -ne 0 ] ; then
echo "[lmd Import] Some error has success... updating image..." >> /tmp/importlog.txt
zenity --error --text "${MSG_CANCELLED}" $ZEN_ERROR --width=500 --height=100
exit -1
fi

# Setting image into bootMenu
echo "[lmd Import] Pushing to boot list" >> /tmp/importlog.txt
n4d-client -c LlxBootManager -m pushToBootList -u ${USER} -p ${PASS} -a ltp_label${new_imagename}
 
# Restarting NBD
echo "[lmd Import] Restarting NBD" >> /tmp/importlog.txt
invoke-rc.d nbd-server restart

echo "[lmd Import] All worked fine" >> /tmp/importlog.txt
zenity --info --text "${MSG_SUCCESS}" $ZEN_ERROR --width=500 --height=100
exit 0
