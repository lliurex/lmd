#!/bin/bash

##

if [[ ${LANGUAGE} == "ca_ES" ]] || [[ ${LANGUAGE} == "ca_ES@valencia" ]] || [[ ${LANGUAGE} == "ca" ]] || [[ ${LANGUAGE} == "ca@valencia" ]];
then
    MSG_INFO_IMPORT="Aneu a importar la imatge: "
    MSG_EXTRACTING="Extraient la imatge. Espereu un moment... "
    MSG_CANCELLED="El procés ha estat cancel·lat"
    MSG_CREATE_SQUASHFS="S'està creant la imatge al servidor."
    MSG_SUCCESS="La imatge de client lleuger s'ha exportat"
    MSG_PASS_TITLE="Contrassenya d'administrador"
    MSG_PASS="Inseriu la contrassenya d'administrador"
    MSG_EXISTS_CHROOT="Ja existeix una imatge amb este nom. Voleu sobreescriure-la?"
    MSG_REMOVING="Esborrant la imatge prèvia..."
elif  [[ ${LANGUAGE} == "es_ES" ]] || [[ ${LANGUAGE} == "es" ]];
then
    MSG_INFO_IMPORT="Va a importar la imagen: "
    MSG_EXTRACTING="Extrayendo imagen. Espere un momento. "
    MSG_CANCELLED="El proceso se ha cancelado"
    MSG_CREATE_SQUASHFS="Creando la imagen en el servidor..."
    MSG_SUCCESS="La imagen de cliente ligero se ha exportado"
    MSG_PASS_TITLE="Contraseña del administrador"
    MSG_PASS="Inserte la contraseña de administrador"
    MSG_EXISTS_CHROOT="¿Ya existe una imagen con este nombre. Desea sobreescribirla?"
    MSG_REMOVING="Borrando la imagen previa..."
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
fi


if [ $# -ne 1 ]; 
    then echo "USAGE: lmd-import-img-non-ui.sh image.lmdimg" 
    exit -1;
fi

# Confirm message
read -p "${MSG_INFO_IMPORT} ${1} (y/n) " yn
if [ "${yn}" = "n" ];
then
    exit 1
fi

# Admin Password
echo -n "${MSG_PASS}"
read -s PASS
    
# Remove previous images in tmp
echo "[lmd Import] Removing prevous uncompressed images in tmp..."

if [[ -d /tmp/extracted_image ]]
then
    rm -r /tmp/extracted_image
fi
mkdir /tmp/extracted_image

#### Ubicar dins la llista d'opcions el que hem creat n4d

echo "[lmd Import] Extracting file..."
tar -xvzf ${1} -C /tmp/extracted_image

# Moving
extracted_image=`ls /tmp/extracted_image/opt/ltsp/*/*.json | cut -d "/" -f 6`
extracted_filename=`ls /tmp/extracted_image/opt/ltsp/*/*.json | cut -d "/" -f 7`
new_imagename="${extracted_filename%.*}"


if [ -d /opt/ltsp/${new_imagename} ];
then
    
    read -p "${MSG_EXISTS_CHROOT} ${1} (y/n) " resp
    if [ "${resp}" = "n" ];
    then
        exit 1
    else
        rm -r /opt/ltsp/${new_imagename}
    fi
fi

echo "moving /tmp/extracted_image/opt/ltsp/${extracted_image} to /opt/ltsp/${new_imagename}"
echo "moving /opt/ltsp/${new_imagename}/${extracted_filename} to /etc/ltsp/images/"

mv /tmp/extracted_image/opt/ltsp/${extracted_image}  /opt/ltsp/${new_imagename}
mv /opt/ltsp/${new_imagename}/${extracted_filename}  /etc/ltsp/images/

# Update kernels and regenerate image
ltsp-update-kernels ${new_imagename}
ltsp-update-sshkeys
ltsp-update-image ${new_imagename}
ltsp-set-domain-search-ltsconf

# Setting image into bootMenu
n4d-client -c LlxBootManager -m pushToBootList -u ${USER} -p ${PASS} -a ltp_label${new_imagename}
 
# Restarting NBD
invoke-rc.d nbd-server restart

echo "DONE.."
exit 0
