#!/bin/bash


if [ $# -ne 3 ]; 
    then echo "lmd-clone-img.sh needs 3 parameters. "
    echo "<b>Finished with status -1</b>"
    exit -1;
fi

tmp_descriptor=${1}
original_path=${2}
new_imagename=${3}

cp ${tmp_descriptor} /etc/ltsp/images/
rsync -avx $original_path/* /opt/ltsp/${new_imagename}

#ltsp image ${new_imagename}
ltsp kernel ${new_imagename}
ltsp initrd
#ltsp-set-domain-search-ltsconf
 
echo "<br/>Image has been cloned.<br/>"
echo "<br/><b>You can set clients to boot it with Boot Manager in Admin Center.</b><br/><br/>"
echo "<b>Finished with status 0</b>"
exit 0
