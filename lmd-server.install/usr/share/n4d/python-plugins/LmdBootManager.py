import json
import os

from pathlib import Path
import n4d.responses
from configparser import ConfigParser

class LmdBootManager:
    
    FILE_NOT_EXISTS = -50
    MALFORMED_LTSCONF = -40
                
    def __init__(self):
        self.imagepath = Path("/etc/ltsp/bootopts/")
        self.tftpboot_path = Path("/var/lib/tftpboot/ltsp")
        self.timemenufile = self.imagepath.joinpath("menutimeout.json")
        self.defaultboot = self.imagepath.joinpath("defaultboot.json")
        self.defaultboot_template = '{{"default_boot":"{image}"}}'
        self.imagepath.mkdir(parents=True, exist_ok=True) 

    #def __init__
        
    def getLtsConf(self):
        # Reads $tftpboot/ltsp/i386/lts.conf and returns it in json format
        conf_file = self.tftpboot_path.join("i386","lts.conf")
        if conf_file.exists():
            cp = ConfigParser()
            cp.optionxform=str
            try:
                cp.read(conf_file)
            except:
                return n4d.responses.build_failed_call_response(LmdBootManager.MALFORMED_LTSCONF)
            aux = cp._sections
            for x in aux.keys():
                for key in aux[x]:
                    if aux[x][key].startswith('"') and  aux[x][key].startswith('"'):
                        aux[x][key] = aux[x][key][1:-1]
            return n4d.responses.build_successful_call_response(json.dumps(aux))

        else:
            return n4d.responses.build_failed_call_response(LmdBootManager.FILE_NOT_EXISTS)
        
    def setLtsClientsConf(self):
        # Writes json config in $tftpboot/ltsp/i386/lts.conf
        with self.tftpboot_path.joinpath('i386','lts.clients.conf').open('w',encoding='utf-8') as fd:
            for x in self.imagepath.joinpath('clients').iterdir():
                if x.suffix == ".json":
                    with x.open('r',encoding='utf-8') as json_fd:
                        data = json.load(json_fd)

            try:
                    conf_file="/var/lib/tftpboot/ltsp/i386/lts.clients.conf"
                    clientpath="/etc/ltsp/bootopts/clients/"
                    cfgfile = open(conf_file,'w')
                                            
                    # Autologin by mac...
                    try:
                            for i in os.listdir(clientpath):
                                    if '.json' in i:
                                            json_data=open(os.path.join(clientpath,i))
                                            data = json.load(json_data)
                                            json_data.close()
                                            cfgfile.write("\n["+data["mac"]+"]\n");
                                            ldm_set=False
                                            if ("autologin" in data) and ("user" in data) and ("pass" in data):
                                                    if (data["autologin"].lower()=="true"):
                                                            cfgfile.write("LDM_AUTOLOGIN = True\n");
                                                            cfgfile.write("LDM_USERNAME = "+data["user"]+"\n");
                                                            cfgfile.write("LDM_PASSWORD = "+data["pass"]+"\n");
                                                            cfgfile.write('DEFAULT_DISPLAY_MANAGER = "/usr/sbin/ldm"\n');
                                                            ldm_set=True
                                            
                                            if ("extraOptions" in data) and (data["extraOptions"]!=""):
                                                    optList=data["extraOptions"].split("\n");
                                                    for opt in optList:
                                                            cfgfile.write(opt+"\n");
                                                    
                    except Exception as e:
                            print("[LMDBootManager] Exception "+str(e))
                    
                    cfgfile.close()
                    
                    # Finally merge both conf files:
                    return (self.mergeLtsConf());
            except Exception as e:
                    return "Exception: "+str(e)
            
            
            pass


    def setLtsConf(self, config):
        # Writes json config in $tftpboot/ltsp/i386/lts.conf
        try:
            lts_default = self.tftpboot_path.join("i386","lts.default.conf")

            if lts_default.exists():
                with lts_default.open("w",encoding="utf-8") as cfgfile:
                    #cp = ConfigParser.ConfigParser()
                    conf=json.loads(config)                                                 
            
                    for (section) in conf:
                        cfgfile.write("["+section+"]\n")
                        for i in conf[section]:
                            if i.lower()=="__name__":
                                pass
                            else:
                                if (conf[section][i]).find(' ')!=-1: # ound spaces, adding " 
                                    cfgfile.write("{0}=\"{1}\"\n".format(i, (conf[section][i])))
                                else:
                                    cfgfile.write("{0}={1}\n".format(i, (conf[section][i])))
            
            # Finally merge both conf files:
            return n4d.responses.build_successful_call_response(True)
            
        except Exception as e:
            return n4d.responses.build_failed_call_response( LmdBootManager.MALFORMED_LTSCONF )
        
    def ReadNBDSwapSize(self):
        return n4d.responses.build_successful_call_response("250")
            

    def SaveNBDSwapSize(self, swap_size):
        return n4d.responses.build_successful_call_response(True)
                
    def getDefaultBootImage(self):
        if self.defaultboot.exists():
            with self.defaultboot.open("r",encoding="utf-8") as fd:
                try:
                    data = json.load(fd)
                except Exception:
                    data = json.loads(self.defaultboot_template.format(image=""))
            return n4d.responses.build_successful_call_response(data)
        else:
            data = json.loads(self.defaultboot_template.format(image=""))
            return n4d.responses.build_successful_call_response(data)
            
    def setDefaultBootImage(self, image):
        with self.defaultboot.open("w",encoding="utf-8") as fd:
            fd.writelines(self.defaultboot_template.format(image=image))
        return n4d.responses.build_successful_call_response(True)
