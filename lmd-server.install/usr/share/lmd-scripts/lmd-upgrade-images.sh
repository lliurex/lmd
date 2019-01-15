#!/bin/bash


function upgrade_image(){
	sleep 1
	image=$1
	echo "<br/><b>Updating Image to the last LliureX 13... Coffee time... $image</b>"
	ltsp-chroot -p -m -a $image lliurex-upgrade
	echo "<br/><b>Updating Image to LliureX 14... $image</b>"
	ltsp-chroot -p -m -a $image lliurex-upgrade
	echo "<br/><b>Adding lmd-client and epoptes-client</b>"
	ltsp-chroot -p -m -a $image apt-get install -y --force-yes lmd-client epoptes-client
	echo "<br/><b>Updating kernels...</b>"
	ltsp-chroot -p -m -a $image /usr/share/ltsp/update-kernels
	ltsp-update-kernels $image
	echo "<br/><b>Regenerating img for... $image</b>"
	ltsp-update-image $image	
	echo "<br/><b>Setting search domain</b>"
	ltsp-set-domain-search-ltsconf
}

function update_images {
		ltsp-update-sshkeys
		for i in $*; do
			upgrade_image $i	
		done		
    }

update_images $*
