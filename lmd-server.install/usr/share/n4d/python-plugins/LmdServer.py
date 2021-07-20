import json
from shutil import rmtree

from pathlib import Path

import n4d.responses
from n4d.server.core import Core


class LmdServer:

    ''' ERROR LIST '''

    FILE_NOT_EXISTS = -50
    SERVER_BUSY = -40

    def __init__(self):

        self.core = Core.get_core()
        
        self.logfolder = Path("/run/lmdserver")
        self.ltsp_path = Path("/opt/ltsp")
        self.template_path = Path("/etc/ltsp/templates")
        self.image_path = Path("/etc/ltsp/images")
        self.clean_logfolder_environment()
       
    #def __init__
   
    def clean_logfolder_environment(self):
        if self.logfolder.exists():
            rmtree(self.logfolder)
        self.logfolder.mkdir(parents=True,exist_ok=True)
        

    def set_default_boot(self,imgid):
        lmd_boot_manager = self.core.get_plugin("LmdBootManager")
        
        result = lmd_boot_manager.getDefaultBootImage()
        if result['return']["default_boot"] == "":
            lmd_boot_manager.setDefaultBootImage(imgid)


    def check_chroot_exists(self, name):
        '''
        Check if exists chroot /opt/ltsp/name and /opt/ltsp/images/name.img
        DATE: 03/04/2014
        '''
        if self.ltsp_path.joinpath(name).exists():
            return n4d.responses.build_successful_call_response({"status": True, "error": 'chroot_exists'})
        if self.ltsp_path.joinpath("images",name+".img").exists():
            return n4d.responses.build_successful_call_response({"status": True, "error": 'image_exists'})
            
        return n4d.responses.build_successful_call_response({"status": False})

                
    def create_imageWS(self, imgid, name, template, description='', bgimg='', arch='i386', env='', extraopts=''): 
        template_file = self.template_path.joinpath(template)
        if not template_file.exists():
            return n4d.responses.build_failed_call_response(LmdServer.FILE_NOT_EXISTS)
        
        if "--isopath" in extraopts:
            command = "ltsp-build-client --chroot {imgid} " + extraopts
        else:
            command = "ltsp-build-client --config {template_file} --chroot {imgid} -f".format(template_file=template_file, imgid=imgid)
# New list imports
        cancelcommand = "ltsp-build-client --clean"
        taskman = self.core.get_plugin("TaskMan")
        lmd_image_manager = self.core.get_plugin("LmdImageManager")
        llx_boot_manager = self.core.get_plugin("LlxBootManager")
        result = taskman.newTask(command, cancelcommand)
        if result["status"] == n4d.responses.CALL_SUCCESSFUL :
            metadata = {'id':imgid, 'name' : name,
                        'desc' : description ,
                        "template" : template,
                        'img': bgimg,
                        'arch': arch,
                        'taskid': result["return"],
                        'ltsp_fatclient': 'undefined',
                        'ldm_session': 'default',
                        'fat_ram_threshold': 'default',
                        'lmd_extra_params':'' }

            metadata_string = json.dumps( metadata, indent=4, ensure_ascii=False )
            lmd_image_manager.setImage( imgid, metadata_string )
            self.set_default_boot( imgid )
            label="ltsp_label"+str(imgid)
            llx_boot_manager.pushToBootList(label)
            boot_order = llx_boot_manager.getBootOrder()
            if boot_order['status'] == n4d.responses.CALL_SUCCESSFUL:
                if len(boot_order['return']) > 0 and boot_order["return"][0] == "bootfromhd":
                    llx_boot_manager.prependBootList(label)
            return n4d.responses.build_successful_call_response({"status":True,"msg":result["return"]})
        else:
            return n4d.responses.build_failed_call_response(LmdServer.SERVER_BUSY)
    def refresh_imageWS(self, imgid, delay = ""):
        lmd_image_manager = self.core.get_plugin("LmdImageManager")
        taskman = self.core.get_plugin("TaskMan")

        img_path = self.ltsp_path.join(imgid)
        lmd_image_manager.umount_chroot(img_path)

        command = "ltsp kernel ${imgid}".format(imgid=imgid)
        ret = taskman.newTask(command)
        if ret["status"] == n4d.responses.CALL_SUCCESSFUL:
            lmd_image_manager.setNewTaskIdForImage(imgid, ret["return"])
            return n4d.responses.build_successful_call_response(ret["return"])
        else:
            return n4d.responses.build_failed_call_response(LmdServer.SERVER_BUSY)

    def CreateImgJSON(self, imgid, newLabel, newid, description, json_path):
        
        if not self.ltsp_path.joinpath(imgid).exists():
            return n4d.responses.build_failed_call_response(LmdServer.FILE_NOT_EXISTS)

        for i in self.ltsp_path.joinpath(imgid).iterdir():
            if i.suffix == ".json":
                i.unlink()

        with self.image_path.joinpath(imgid + ".json").open("r") as fd:
            jsonClient = json.load(fd)
        
        jsonClient['name']=newLabel;
        jsonClient['id']=newid;
        jsonClient['desc']=description;
        
        if not isinstance(json_path,Path):
            json_path = Path(json_path)
        json_path.parent.mkdir(parents=True,exist_ok=True)
       
        with json_path.open("w",encoding="utf-8") as fd:
            json.dump(jsonClient, fd, indent=4, ensure_ascii=False )
        return n4d.responses.build_successful_call_response(True)
    

    def CloneOrExportWS( self,targetid, newid, newLabel, newDesc, is_export ):
        new_json_descriptor_file = "/tmp/{newid}.json".format(newid=newid)
        original_path_image = self.ltsp_path.joinpath(targetid)
        self.CreateImgJSON(targetid, newLabel, newid, newDesc, new_json_descriptor_file)
        taskman = self.core.get_plugin("TaskMan")
        lmd_image_manager = self.core.get_plugin("LmdImageManager")
        
        if str(is_export)=="True": #Export to a tar.gz with lmdimg extension
            command = "lmd-export-img.sh {newjson} {origpath} {newid}.lmdimg".format(newjson=new_json_descriptor_file, origpath=original_path_image, newid=newid)
        else:
            command = "lmd-clone-img.sh {newjson} {origpath} {newid}".format(newjson=new_json_descriptor_file, origpath=original_path_image, newid=newid)
        
        ret = taskman.newTask(command)

        if ret["status"] == n4d.responses.CALL_SUCCESSFUL:
            lmd_image_manager.setNewTaskIdForImage(targetid, ret["return"])
            if str(is_export) == "True":
                lmd_image_manager.setNewTaskIdForImage(newid, ret["return"])
            return n4d.responses.build_successful_call_response(ret["return"])
        else:
            return n4d.responses.build_failed_call_response(LmdServer.SERVER_BUSY)

    def ImportImageWS(self, filename):
            
        command="lmd-import-from-admin-center.sh {filename}".format(filename=filename)
        taskman = self.core.get_plugin("TaskMan")
        result = taskman.newTask(command)
        if result["status"] == n4d.responses.CALL_SUCCESSFUL:
            return n4d.responses.build_successful_call_response(result["return"])
        else:
            return n4d.responses.build_failed_call_response(LmdServer.SERVER_BUSY)

    
    def getExportedList(self):
        exported_path = Path("/var/www/exported")
        if not exported_path.exists():
            return n4d.responses.build_failed_call_response(LmdServer.FILE_NOT_EXISTS)
        return n4d.responses.build_successful_call_response([str(x) for x in exported_path.iterdir()])

    def deploy_minimal_clientWS(self):
        return n4d.responses.build_successful_call_response(False)

    def chek_minimal_client(self):
        return n4d.responses.build_successful_call_response(True)
