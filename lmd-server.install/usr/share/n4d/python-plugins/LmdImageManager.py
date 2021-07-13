import json
import sh
import re

from shutil import rmtree
from sh import mount, umount, lliurex_version
from pathlib import Path

import n4d.responses
from n4d.server.core import Core

class LmdImageManager:
    

    GET_IMAGE_ERROR = -50
    MIRROR_NOT_EXISTS = -40

    def __init__(self):
        self.configimagepath = Path("/etc/ltsp/images/")
        self.tftppath = Path("/var/lib/tftpboot/ltsp")
        self.chrootpath = Path("/opt/ltsp/")
        self.imagepath = Path("/opt/ltsp/images/")
        self.lmd_editing_path = Path("/tmp/.lmd-editing-chroot")

        self.core = Core.get_core() 
    #def __init__
        
    def getImageList(self):
        '''
        Reads the file list of templates from /etc/ltsp/images
        Returna a JSON List.
        '''
        # 1. /opt/ltsp/name-chroot
        # 2. /opt/ltsp/images/name-chroot.img
        # 3. /var/lib/tftpboot/ltsp/name-chroot
        # if 1,2 and 3 exist -> show
        # if 1 but not exist 2 or/and 3 -> show with error
        #

        return n4d.responses.build_successful_call_response( json.dumps([i.name for i in self.configimagepath.glob("**/*.json")]) )
                               
                    
        # END def GetListImages(self)

    def getImage(self, image):
        '''
        Returns the metadata from certain image
        
        // WIP HERE
        
        -> mirar si accepta be el tercer parametre o cal fer el kwargs...
        agafa aquest taskid i comprova amb getTask si existeix i el seu estat
        i l'afig amb data["taskstatus"]=ret(....)
        
        Aixi al renderImage de l'ImageManager ja podem tindre disponible l'estat sense haver
        d'estar consultant-ho des de la gui
        '''
        
        task_manager = self.core.get_plugin("TaskMan")

        try:

            with self.configimagepath.joinpath(image).open('r') as fd :
                data = json.load(fd)
            
            if "taskid" in data.keys():
                taskid = data["taskid"]
            else:
                taskid = "0"

            # Searching task id for this image
            ret = task_manager.getTaskStatus(taskid)
                
            data["task_status"] = "DONE"
            if ret["status"] == n4d.responses.CALL_SUCCESSFUL :
                data["task_status"] = ret["result"]["taskStatus"]
            data["xpraConnections"] = ""

            return n4d.responses.build_successful_call_response(json.dumps(data))

        except Exception:
            return n4d.responses.build_failed_call_response(LmdImageManager.GET_IMAGE_ERROR)


        # END def getListTemplate(self, image)
            
                
    def setImage(self, img_id, data):
        '''
        Saves metadata from *data to image
        data is unicoded string
        image is name
        '''
        
        with self.configimagepath.joinpath(img_id+".json").open("w") as fd:
            fd.writelines(data)

        return n4d.responses.build_successful_call_response("True") 
        
    # def setImage(self, image, data)
        
        
    def setStatusImage(self, img_id, status):
        
        with self.configimagepath.joinpath(img_id+".json").open("r") as fd:
            data = json.load(fd)

        data["status"] = status

        return self.setImage(img_id, json.dumps(data))


    def setNewTaskIdForImage(self, img_id, newid):
        
        with self.configimagepath.joinpath(img_id+".json").open("r") as fd:
            data = json.load(fd)

        data["taskid"]=newid
        
        return self.setImage(img_id, json.dumps(data))
        
        
        
    def deleteImage(self, img_id):
        '''
        N4d Method to delete an image identified by img_id
        '''
        # Umount anything mounted under image
        chroot = self.chrootpath.joinpath(img_id)
        test_chroot =  self.umount_chroot(chroot)
        if test_chroot["status"] != n4d.responses.CALL_SUCCESSFUL :
            return test_chroot
        
        # Remove chroot
        if chroot.is_dir():
            rmtree(chroot)
        
        # Removing .img
        x = self.imagepath.joinpath(img_id + ".img")
        if x.is_file():
            x.unlink()
        
        x = self.tftppath.joinpath(img_id)
        # Remove /var/lib/tftpboot/...
        if x.is_dir():
            rmtree(x);
        
        x = self.configimagepath.joinpath(img_id+".json")
        # Remove .json file
        if x.is_file():
            x.unlink()  
        
        return n4d.responses.build_successful_call_response(True)
        
    #def setImage(self, image, data):
        
    def umount_chroot(self,chroot_dir):
        '''
        Umount system directories with -lazy, 
        '''
        if not isinstance(chroot_dir,Path):
            chroot_dir = Path(chroot_dir)

        # Test if exists chroot
        if not chroot_dir.is_dir():
            print("NO DIR CHROOT: "+str(chroot_dir))
            return n4d.responses.build_successful_call_response(True)
        else:
            devices_mounted = [ z[2] for z in re.findall(r"(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\n", mount().stdout.decode('utf-8')) ]
            points_to_umount = [ "net/mirror", "proc", "sys", "dev/pts", "dev", "etc/hosts", "etc/ld.so.conf.d", "etc/nsswitch.conf" ]

            for x in points_to_umount:
                if chroot_dir.joinpath(x) in devices_mounted:
                    umount(chroot_dir.joinpath(x),lazy=True)
            if chroot_dir in devices_mounted:
                umount(chroot_dir,lazy=True)
   
        return n4d.responses.build_successful_call_response(True)

    #def umount_chroot(self,chroot_dir)
        
    def check_image_editing(self):
        if self.lmd_editing_path.is_file():
            return n4d.responses.build_successful_call_response(True)
        else:
            return n4d.responses.build_successful_call_response(False) 
    
    def clean_image_editing(self):
        if self.lmd_editing_path.is_file():
            self.lmd_editing_path.unlink()

        return n4d.responses.build_successful_call_response(True)

    def check_mirror(self):
        '''
            New method to check without vars, this method allow mount the mirror by nfs without use lliurex-mirror
            check method relies into lliurex-version call, checking structure of files and dirs into /net/mirror/llx16
            architectures always be all or nothing due to assumption that lliurex-mirror mirror both architectures always.
        '''
        try:
            lliurex_version(x="mirror")
            return n4d.responses.build_successful_call_response({"status":True,"msg":{"llx16":{"ARCHITECTURES":["i386","amd64"]}}})
        except sh.ErrorReturnCode_1:
            return n4d.responses.build_failed_call_response(LmdImageManager.MIRROR_NOT_EXISTS)
    
    # OLD METHOD TO CHECK WITH VARS (Disabled)
    def check_mirror_with_vars(self):
        
        lliurex_mirror = self.core.get_variable("LLIUREXMIRROR")
        
        if lliurex_mirror["llx21"]["status_mirror"] != "Ok":
            return n4d.responses.build_failed_call_response(LmdImageManager.MIRROR_NOT_EXISTS)

        mirror_manager = self.core.get_plugin("MirrorManager")
        return mirror_manager.get_all_configs()
