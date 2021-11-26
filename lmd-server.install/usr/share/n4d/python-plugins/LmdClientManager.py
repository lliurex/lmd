import json
import re
from pathlib import Path
import configparser
import os

import n4d.responses
from n4d.server.core import Core

class LmdClientManager:
        
        CANT_PARSE_JSON = -10
                
        def __init__(self):
                #self.clientpath = Path("/etc/ltsp/bootopts/clients")
                self.clientpath="/etc/ltsp/ltsp.conf"
                self.clientsConfPath="/etc/llxbootmanager/clients.json"
                self.core = Core.get_core()
                self.clientsAutologin=[]
                self.clientsInLtspConf=[]
                self.count=0;
                
                pass
        #def __init__
        
        def getClientList(self):
                '''
                        Reads the file list of clients from /etc/ltsp/ltsp.conf
                        Returna a List.
                '''
                self._readFile()
                return n4d.responses.build_successful_call_response(self.clientsInLtspConf)
        
        #def getClientList

        def getClient(self, client):
                '''
                        Returns the metadata from certain client
                '''
                '''
                try:
                        with self.clientpath.joinpath(client).open('r') as fd:
                                return n4d.responses.build_successful_call_response(json.dumps(json.load(fd)) )
                except Exception:
                        return n4d.responses.build_failed_call_response(LmdClientManager.CANT_PARSE_JSON)
                '''
                clientInfo={}
                if client in self.clientsInLtspConf:
                        for item in self.clientsAutologin:
                                if item["id"]==client:
                                        clientInfo["mac"]=item["mac"]
                                        clientInfo["extraOptions"]=""
                                        clientInfo["defaultBoot"]=self._readLlxbootmanager(item["mac"])
                                        if item["autologin"]!="":
                                                clientInfo["autologin"]="true"
                                                clientInfo["user"]=item["autologin"]
                                        else:
                                                clientInfo["autologin"]="false"
                                                clientInfo["user"]=''

                return n4d.responses.build_successful_call_response(clientInfo)
        
        #def getClient

        def _readFile(self):
            
                self.clientsAutologin=[]
                self.clientsInLtspConf=[]
                configFile=configparser.ConfigParser()
                configFile.optionxform = str
                configFile.read(self.clientpath)
            
                for section in configFile.sections():
                        tmpSection=section.split(":")
                        if len(tmpSection)==6:
                                if section.replace(":","") not in self.clientsInLtspConf:
                                        tmp={}
                                        tmp["id"]=section.replace(":","")
                                        tmp["mac"]=section
                                        if configFile.has_option(section,"AUTOLOGIN"):
                                                tmp["autologin"]=configFile[section]["AUTOLOGIN"]
                                        else:
                                                tmp["autologin"]=''
                                        self.clientsAutologin.append(tmp) 
                                        self.clientsInLtspConf.append(tmp["id"])
            #return n4d.responses.build_successful_call_response( json.dumps([i.name for i in self.clientpath.glob("**/*.json")]) )
        
        #def readFile
        
        def _readLlxbootmanager(self,mac):
            
                if os.path.exists(self.clientsConfPath):
                        with open(self.clientsConfPath,'r') as fd:
                                data=json.load(fd)
                                fd.close()
                        for item in data:
                                for element in data[item]:
                                        try:
                                                if element["mac"]==mac:
                                                        return "ltsp_label%s"%element["boot"]
                                        except:
                                                return "default"
                else:
                        return "default"

         #def _readLlxbootmanager                            
        
        def setClient(self, client, data):
                '''
                        Saves metadata from *data to client
                        data is unicoded string
                        client is a mac
                '''
                #client=client.replace(":", "") + ".json"
                configFile=configparser.ConfigParser()
                configFile.optionxform = str
                configFile.read(self.clientpath)
            
                if client not in self.clientsInLtspConf: 
                        configFile.add_section(data["mac"])
            
                macSection=configFile[data["mac"]]
            
                if data["autologin"]=='true':
                        macSection["AUTOLOGIN"]=data["user"]
                else:
                        configFile.remove_option(data["mac"],"AUTOLOGIN")

                with open(self.clientpath,'w') as fd:
                        configFile.write(fd)

                '''
                with self.clientpath.joinpath(client).open('w') as fd:
                       fd.writelines(data)
                '''
                self._readFile()
                self._regenerateInitrd()
                return n4d.responses.build_successful_call_response()   
        
        #def setClient
        
        def deleteClient(self, client):
                '''
                N4d Method to delete a client
            
                client=client.replace(":", "") + ".json"
                json_file = self.clientpath.joinpath( client )
                if json_file.exists():
                        json_file.unlink()
                '''   
                for item in self.clientsAutologin:
                        if item["id"]==client:
                                configFile=configparser.ConfigParser()
                                configFile.optionxform = str
                                configFile.read(self.clientpath)
                                configFile.remove_section(item["mac"])
                                with open(self.clientpath,'w') as fd:
                                        configFile.write(fd)
                                break

                self._readFile()
                self._regenerateInitrd()      
                return n4d.responses.build_successful_call_response()
        
        #def deleteClient

        def getArpTable(self):
            
                with open('/proc/net/arp','r') as fd:
                        lines = fd.readlines()
                
                arptable=[]
                iface = self.core.get_variable("INTERNAL_INTERFACE")['return']
                spliter = re.compile(r"(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)")
                for line in lines:
                        result = spliter.match(line.strip())
                        if result is not None and result.groups()[5] == iface :
                                arptable.append({"ip":result.groups()[0], "mac":result.groups()[3]})
                return n4d.responses.build_successful_call_response(arptable)   
        
        #def getArpTable
        
        def _regenerateInitrd(self):
                
                cmd="ltsp initrd"
                os.system(cmd)

        #def _regenerateInitrd

#class LmdClientManager