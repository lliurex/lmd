import json
import os
import crypt

from pathlib import Path
import n4d.responses

class LmdBootManager:
        
                
    def __init__(self):
        self.imagepath = Path("/etc/ltsp/bootopts/")
        self.timemenufile = self.imagepath.joinpath("menutimeout.json")
        self.defaultboot = self.imagepath.joinpath("defaultboot.json")
        self.defaultboot_template = '{"default_boot":"{image}"}'
        self.imagepath.mkdir(parents=True, exist_ok=True) 
    #def __init__
        
        def getLtsConf(self):
            #Raul este si que hay que migrarlo a python3
                # Reads $tftpboot/ltsp/i386/lts.conf and returns it in json format
                
                try:
                        conf_file="/var/lib/tftpboot/ltsp/i386/lts.conf"
                        cp = ConfigParser.ConfigParser()
                        cp.optionxform=str
                        cp.read(conf_file)
                        aux = cp._sections
                        print("**",aux,"$$$")
                        for x in list(aux.keys()):
                                for y in aux[x]:
                                        if aux[x][y][0] == '"' and aux[x][y][-1] == '"':
                                                aux[x][y] = aux[x][y][1:-1]

                        print("@@",aux,"##")
                        return json.dumps(aux)
                        pass
                        #return json.dumps(cp.items('default'));
                        
                except Exception as e:
                        return "Exception: "+str(e)
                # END def getListTemplate(self, template)
                                
                pass
        
        
        def setLtsClientsConf(self):
            #Raul este si que hay que migrarlo a python3
                # Writes json config in $tftpboot/ltsp/i386/lts.conf
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
                                                
                                                if ("forceThin" in data) and (data["forceThin"].lower()=="true"):
                                                        cfgfile.write("LTSP_FATCLIENT = False\n");
                                                        if not ldm_set:
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
            #Raul este si que hay que migrarlo a python3
                # Writes json config in $tftpboot/ltsp/i386/lts.conf
                try:
                        conf_file="/var/lib/tftpboot/ltsp/i386/lts.default.conf"
                        cfgfile = open(conf_file,'w')
                        
                        #cp = ConfigParser.ConfigParser()
                        conf=json.loads(config)                                                 
                        
                        for (section) in conf:
                                cfgfile.write("["+section+"]\n");
                                for i in conf[section]:
                                        if i.lower()=="__name__":
                                                pass
                                        else:
                                                if (conf[section][i]).find(' ')!=-1: # ound spaces, adding " 
                                                        cfgfile.write("{0}=\"{1}\"\n".format(i, (conf[section][i])))
                                                else:
                                                        cfgfile.write("{0}={1}\n".format(i, (conf[section][i])))
                        cfgfile.close()
                        
                        # Finally merge both conf files:
                        return (self.mergeLtsConf());
                        
                except Exception as e:
                        return {"status":"false", "msg":str(e)}

        
        def ReadNBDSwapSize(self):
            # Raul este esta en el admin center, hay que migrarlo pero que no haga nada
                try:
                        nbd_swap_file="/etc/ltsp/nbdswapd.conf"
                        f1 = open(nbd_swap_file,'r')
                        data=f1.readlines()
                        size=data[0][5:];
                        f1.close()
                        return size
                except Exception as e:
                        # If file does not exists, returns default 512
                        return "512"
                

        def SaveNBDSwapSize(self, swap_size):
            # Raul este esta en el admin center, hay que migrarlo pero que no haga nada
                '''
                Saves properly options to set swap size
                '''
                try:
                        # Saving nbdswapd.conf
                        nbd_swap_file="/etc/ltsp/nbdswapd.conf"
                        f1 = open(nbd_swap_file,'w')
                        data='SIZE='+str(swap_size)+'\n';
                        f1.writelines(data)
                        f1.close()

                        # Saving swap.conf
                        swap_conf_file="/etc/nbd-server/conf.d/swap.conf"
                        f2 = open(swap_conf_file,'w')
                        f2.writelines("[swap]\n")
                        f2.writelines("exportname = /tmp/nbd-swap/%s\n")
                        f2.writelines("prerun = nbdswapd %s\n")
                        f2.writelines("postrun = rm -f %s\n")
                        f2.writelines("authfile = /etc/ltsp/nbd-server.allow\n")
                        f2.close()

                        # Checking /etc/hosts.allow
                        needs_nbdswap_line=True
                        
                        if os.path.isfile("/etc/hosts.allow"):
                                # if file exists, read it
                                f3=open("/etc/hosts.allow", 'r')                                
                                for line in f3.readlines():
                                        print(line)
                                        if (line=="nbdswapd: ALL: keepalive\n"):
                                                needs_nbdswap_line=False
                                f3.close();
                        
                        # If file does not exists or has no line for nbdwap, write it
                        if (needs_nbdswap_line):
                                f4=open("/etc/hosts.allow", 'a')
                                f4.writelines("nbdswapd: ALL: keepalive\n")
                                f4.close()
                        
                        return {"status":True, "msg":"finished"}
                
                except Exception as e:
                        print("exc,"+str(e))
                        return {"status":False, "msg":str(e)}
                
    def getDefaultBootImage(self):
        if self.defaultboot.exists():
            with self.defaultboot.open("r",encoding="utf-8") as fd:
                try:
                    data = json.load(fd)
                except Exception:
                    data = json.load(self.defaultboot_template.format(image=""))
            return n4d.responses.build_successful_call_response(data)
        else:
            data = json.load(self.defaultboot_template.format(image=""))
            return n4d.responses.build_successful_call_response()
            
    def setDefaultBootImage(self, image):
        with self.defaultboot.open("w",encoding="utf-8") as fd:
            fd.writelines(self.defaultboot_template.format(image=image))
        return n4d.responses.build_successful_call_response(True)
