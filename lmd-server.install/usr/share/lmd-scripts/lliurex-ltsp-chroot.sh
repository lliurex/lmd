#!/bin/bash

# Testing parameters

if [ $# -ne 3  ]; then
   echo  "Default use: lliurex-ltsp-chroot.sh chroot_name command arch"
   exit -1
fi

if [ -e  /tmp/.lmd-editing-chroot ]; then
	exit -1
fi

# Setting Command

case $2 in
"run_mate_terminal")
  command="/usr/sbin/ltsp_edit_command.sh coproc kwin --replace;/usr/bin/konsole --fullscreen -e bash"
  ;;
"run_synaptic")
  command="/usr/sbin/ltsp_edit_command.sh coproc kwin --replace;synaptic"
  ;;
"run_lliurex_up")
  command="/usr/sbin/ltsp_edit_command.sh coproc kwin --replace;lliurex-up;"
  ;;
*)
  command=$2
  ;;
  
esac

# Set chroot
chroot="/opt/ltsp/$1"

touch /tmp/.lmd-editing-chroot

# Mount some stuff
mount -o bind /proc $chroot/proc
mount -o bind /sys $chroot/sys
mount -o bind /dev $chroot/dev
mount -t devpts devpts $chroot/dev/pts
mount -o bind /etc/hosts $chroot/etc/hosts
mount -o bind /etc/ld.so.conf.d $chroot/etc/ld.so.conf.d
mount -o bind /etc/nsswitch.conf $chroot/etc/nsswitch.conf

# Run command on client

if [ $3 = "amd64"  ]; then
        linux64 chroot $chroot $command
else
        linux32 chroot $chroot $command
fi


# Umnount anything
umount -l $chroot/proc
umount -l $chroot/sys
umount -l $chroot/dev/pts
umount -l $chroot/dev
umount -l $chroot/etc/hosts
umount -l $chroot/etc/ld.so.conf.d
umount -l $chroot/etc/nsswitch.conf

rm /tmp/.lmd-editing-chroot
