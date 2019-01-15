COLORS="client #6ba4ff musica #ab6eff infantil #fff580 pime #c3c3c3 desktop #74ff97 lite #ffbbf1"
WIDTH=235
HEIGHT=110

RELEASE=16
COPY_PATH="../lmd-manager-gui.install/usr/share/lmd-gui/css/icons/"
INK=$(type -fp inkscape)
SVG="lliurex-ltsp.svg"
DIR=$( cd $( dirname ${BASH_SOURCE[0]} ) && pwd)

do_png(){

while ((${#})); do

    ${INK} ${DIR}/${SVG} -e ${DIR}/llx-${1}${RELEASE}.png -w $WIDTH -h $HEIGHT -b ${2}
    shift 2
    
done;

}

move_png(){

while ((${#})); do

    mv ${DIR}/llx-${1}${RELEASE}.png ${DIR}/${COPY_PATH}/
    shift 2
done;

}

[ -z ${INK} ] && exit 1

do_png $COLORS
move_png $COLORS