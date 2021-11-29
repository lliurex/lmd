# This file is part of LTSP, https://ltsp.org
# Copyright 2019 the LTSP team, see AUTHORS
# SPDX-License-Identifier: GPL-3.0-or-later

# Copy vmlinuz and initrd.img from image to TFTP
# @LTSP.CONF: RPI_IMAGE

lliurex_cmdline() {
    local args

    run_main_functions "$_SCRIPTS" "$@"
}

lliurex_main() {
    local img_src img_name runipxe tmp

    if [ "$#" -eq 0 ]; then
       die "Refusing to run ltsp $_APPLET . Needed chroot"
    fi
    for img_src in "$@"; do
	echo $img_src
        img_path=$(add_path_to_src "${img_src%%,*}")
        img_name=$(img_path_to_name "$img_path")
	echo $img_path
	echo $img_name
	rs rm $img_path/etc/resolv.conf
	rs rm $img_path/etc/default/locale
	rs rm $img_path/etc/default/keyboard
	re cp /etc/default/locale $img_path/etc/default/locale
	re cp /etc/default/keyboard $img_path/etc/default/keyboard
	re llx-chroot $img_path dpkg-reconfigure openssh-server
	re cp /etc/nslcd.conf $img_path/etc/nslcd.conf
	rs mkdir -p $img_path/var/lib/lmd
	rs touch $img_path/var/lib/lmd/semi
    done
}

