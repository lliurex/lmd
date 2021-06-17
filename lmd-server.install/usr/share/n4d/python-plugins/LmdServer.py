import socket
import subprocess
import sys

import time
import datetime

import os
import signal
import re

import shutil
import tempfile

import tarfile
import apt_pkg

import lliurex.net

# New list imports

import threading
import json
from shutil import rmtree

from pathlib import Path

import n4d.responses
from n4d.server import Core


class LmdServer:

    ''' ERROR LIST '''

    FILE_NOT_EXISTS = -50
    SERVER_BUSY = -40

    def __init__(self):

        self.core = Core.get_core()
        
        self.logfolder = Path("/run/lmdserver")
        self.ltsp_path = Path("/opt/ltsp")
        self.template_path = Path("/etc/ltsp/templates")
        self.clean_logfolder_environment()
       
    #def __init__
   
    def clean_logfolder_environment(self):
        if self.logfolder.exists():
            rmtree(self.logfolder)
        self.logfolder.mkdir(parents=True,exist_ok=True)
        

    def set_default_boot(self,imgid):
        lmd_boot_manager = self.core.get_plugin("LmdBootManager")
        
        result = lmd_boot_manager.getDefaultBootImage()
        if result['result']["default_boot"] == "":
            lmd_boot_manager.setDefaultBootImage(imgid)


    def check_chroot_exists(self, name):
        '''
        Check if exists chroot /opt/ltsp/name and /opt/ltsp/images/name.img
        DATE: 03/04/2014
        '''
        if self.ltsp_path.joinpath(name).exists():
            return n4d.responses.build_successful_call_response({"status": True, "error": 'chroot_exists'})
        if self.ltsp_path.joinpath("images",name+".img"):
            return n4d.responses.build_successful_call_response({"status": True, "error": 'image_exists'})
            
        return n4d.responses.build_successful_call_response({"status": False})

                
    def create_imageWS(self, imgid, name, template, description='', bgimg='', arch='i386', env='', extraopts=''): template_file = self.template_path.joinpath(template)
        if template_file.exists():
            if "--isopath" in extraopts:
                command = "ltsp-build-client --chroot {imgid} " + extraopts
            else:
                command = "ltsp-build-client --config {template_file} --chroot {imgid}".format(template_file=template_file, imgid=imgid)

            cancelcommand = "ltsp-build-client clean"
            taskman = self.core.get_plugin("TaskMan")
            lmd_image_manager = self.core.get_plugin("LmdImageManager")
            llx_boot_manager = self.core.get_plugin("LlxBootManager")
            result = taskman.newTask(command, cancelcommand)
            if result["status"]:
                metadata = {'id':imgid, 'name' : name,
                            'desc' : description ,
                            "template" : template,
                            'img': bgimg,
                            'arch': arch,
                            'taskid': ret["msg"],
                            'ltsp_fatclient': 'undefined',
                            'ldm_session': 'default',
                            'fat_ram_threshold': 'default',
                            'lmd_extra_params':'' }

                metadata_string = unicode( json.dumps( metadata, indent=4, encoding="utf-8", ensure_ascii=False ) ).encode( "utf-8" )
                lmd_image_manager.setImage( imgid, metadata_string )
                self.set_default_boot( imgid )
                label="ltsp_label"+str(imgid)
                llx_boot_manager.pushToBootList(label)
                boot_order = llx_boot_manager.getBootOrder()
                if boot_order['status']:
                    if len(boot_order['result']) > 0 and boot_order["result"][0] == "bootfromhd":
                        llx_boot_manager.prependBootList(label)
                return n4d.responses.build_successful_call_response(result["result"])
            else:
                return n4d.responses.build_failed_call_response(LmdServer.SERVER_BUSY)
        else:
            return n4d.responses.build_failed_call_response(LmdServer.FILE_NOT_EXISTS)
        
        def refresh_imageWS(self, imgid, delay = ''):
                
                try:
                        
                        # umount anything
                        path="/opt/ltsp/"+imgid                                         
                        objects['LmdImageManager'].umount_chroot(path);

                        # read json

                        json_file = open('/etc/ltsp/images/' + imgid + '.json','r')
                        jsonClient=json.loads(json_file.read())
                        json_file.close()

                        arch="linux32"
                        
                        # Ask for arch in image description
                        if ('arch' in jsonClient):
                                arch="linux64"
                                if jsonClient['arch']=="i386":
                                        arch="linux32"
                        else:
                                # If arch does not exists, let's ask it to chroot
                                cmd="ltsp chroot -p -m -a "+imgid+" uname -m"
                                proc=subprocess.Popen("uname -m", stdout=subprocess.PIPE, shell=True)
                                (out, err) = proc.communicate()
                                machine2arch = {'AMD64': 'linux64', 'x86_64': 'linux64'}
                                arch=machine2arch.get(out.strip("\n"), "linux32")
                                                        
                        command=arch + " ltsp-chroot -p -m -a "+imgid+" dpkg-reconfigure libgl1-mesa-dri ;  "
                        command=command + arch + " ltsp-chroot -p -m -a "+imgid+" /usr/share/ltsp/update-kernels && "
                        if delay != '' :
                                command = command + " lmd-update-image-delay " + imgid + " '" + delay +"'"
                        else:
                                command = command + arch + " ltsp-update-image " + imgid
                        command = command + "; systemctl restart nbd-server; ltsp-set-domain-search-ltsconf"
                                
                        # Let's rebuild image
                        
                        ret=objects['TaskMan'].newTask(command)
                        if ret["status"]==True: ## Task has launched ok
                                
                                
                                print ("[LmdServer] Refreshing image for "+str(imgid))
                                
                                # we does not have to push to boot list! Bug fixed!
                                #objects['LlxBootManager'].pushToBootList("ltsp_label"+str(imgid));
                                
                                # Setting new taskid to the image, so we know that it is refreshing
                                objects['LmdImageManager'].setNewTaskIdForImage(imgid, ret["msg"]);
                                return {"status": True, "msg": ret["msg"]} # Returns task id!!
                                
        
                        else:
                                if ret["msg"]=="SERVER_BUSY":
                                        return {'status':False, 'msg':'SERVER_BUSY'}
                                else:
                                        return {'status':False, 'msg':'EXCEPTION'}
                        
                        
                except Exception as e:
                        print ("Except: "+str(e))
                        return {"False": True, "msg": str(e)}
                
        
    def CreateImgJSON(self, imgid, newLabel, newid, description, path):
        try:
            
            # Removing previous .json into image
            files=os.listdir('/opt/ltsp/'+imgid );
            for i in files:
                f,ext=os.path.splitext(i)
                if (ext==".json"):
                    os.remove('/opt/ltsp/' +imgid+"/"+i);

            # Create and copy new json
            json_file = open('/etc/ltsp/images/' + imgid + '.json','r')
            jsonClient=json.loads(json_file.read());
            json_file.close();              
            #print jsonClient;
            jsonClient['name']=newLabel;
            jsonClient['id']=newid;
            jsonClient['desc']=description;
            
            json_file = open(path,'w')
            metadata_string = unicode(json.dumps(jsonClient,indent=4,encoding="utf-8",ensure_ascii=False)).encode("utf-8")
            json_file.write(metadata_string);
            json_file.close();
            
            return {"status": True, "msg": "Saved"}
        
        except Exception as e:
            print ("Except: "+str(e))
            return {"status": False, "msg": str(e)}
        
    
        def CloneOrExportWS(self, targetid, newid, newLabel, newDesc, is_export):
                '''
                Export or Clone an image via web
                # New Version of import/export
                # Last Modification: 23/09/2016
                '''
                
                new_json_descriptor_file="/tmp/"+newid+".json";
                original_path_image="/opt/ltsp/"+targetid;
                self.CreateImgJSON(targetid, newLabel, newid, newDesc, new_json_descriptor_file);
                
                if str(is_export)=="True": #Export to a tar.gz with lmdimg extension
                        #command="lmd-export-img.sh "+targetid+" "+newLabel+" "+newDesc;
                        
                        command="lmd-export-img.sh "+new_json_descriptor_file+" "+original_path_image+" "+newid+".lmdimg"
                else:
                        #command="lmd-clone-img.sh "+targetid+" "+newLabel+" "+newDesc;
                        
                        command="echo "+targetid+" "+original_path_image+" "+newid;
                        command="lmd-clone-img.sh "+new_json_descriptor_file+" "+original_path_image+" "+newid;
                        
                
                try:
                        ret=objects['TaskMan'].newTask(command);
                        if ret["status"]==True: ## Task has launched ok
                                # Returns true and ret.msg, that is job id
                                print ("**********************************************");
                                return {"status": True, "msg": ret["msg"]}
                                pass
                        
                        else:
                                if ret["msg"]=="SERVER_BUSY":
                                        return {'status':False, 'msg':'SERVER_BUSY'}
                                else:
                                        return {'status':False, 'msg':'EXCEPTION'}
                except Exception as e:
                        print ("Except: "+str(e))
                        return {"status": False, "msg": str(e)}
                
                return {"status": True, "msg": "Done"}
        
        
        def ImportImageWS(self, filename):
                
                command="lmd-import-from-admin-center.sh "+filename;
                        
                try:
                        ret=objects['TaskMan'].newTask(command);
                        if ret["status"]==True: ## Task has launched ok
                                # Returns true and ret.msg, that is job id
                                return {"status": True, "msg": ret["msg"]}
                                pass
                        
                        else:
                                if ret["msg"]=="SERVER_BUSY":
                                        return {'status':False, 'msg':'SERVER_BUSY'}
                                else:
                                        return {'status':False, 'msg':'EXCEPTION'}
                except Exception as e:
                        print ("Except: "+str(e))
                        return {"status": False, "msg": str(e)}
                
                return {"status": True, "msg": "Done"}
                
                pass
        
        def getExportedList(self):
                exported_path="/var/www/exported";
                
                try:
                        list=os.listdir(exported_path)
                        return {"status":True, "msg":list}
                        pass
                except Exception as e:
                        return {"status":False, "msg": str(e)}
                        pass
                        

        def deploy_minimal_clientWS(self):
            return n4d.responses.build_successful_call_response(False)

        def chek_minimal_client(self):
            return n4d.responses.build_successful_call_response(True)
