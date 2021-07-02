import json
import re
from pathlib import Path

import n4d.responses
from n4d.server.core import Core

class LmdClientManager:
        
        CANT_PARSE_JSON = -10
                
        def __init__(self):
            self.clientpath = Path("/etc/ltsp/bootopts/clients")
            self.core = Core.get_core()
                
            pass
        #def __init__
        
        def getClientList(self):
            '''
            Reads the file list of clients from /etc/ltsp/bootopts/clients
            Returna a JSON List.
            '''
            
            return n4d.responses.build_successful_call_response( json.dump([i.name for i in self.clientpath.glob("**/*.json")]) )
                        
        

        def getClient(self, client):
            '''
            Returns the metadata from certain client
            '''
            try:
                with self.clientpath.joinpath(client).open('r') as fd:
                    return n4d.responses.build_successful_call_response(json.dumps(json.load(fd)) )
            except Exception as e:
                    return n4d.responses.build_failed_call_response(LmdClientManager.CANT_PARSE_JSON)
                
                
        def setClient(self, client, data):
            '''
            Saves metadata from *data to client
            data is unicoded string
            client is a mac
            '''
            client=client.replace(":", "") + ".json"
            
            with self.clientpath.joinpath(client).open('w') as fd:
                fd.writelines(data)
                
        
        def deleteClient(self, client):
            '''
            N4d Method to delete a client
            '''
            client=client.replace(":", "") + ".json"
            json_file = self.clientpath.joinpath( client )
            if json_file.exists():
                json_file.unlink()
                        
            return n4d.responses.build_successful_call_response(True)
        
        def getArpTable(self):
            
            with open('/proc/net/arp','r') as fd:
                lines = fd.readlines()
                
            arptable=[]
            iface = self.core.get_variable("INTERNAL_INTERFACE")
            spliter = re.compile(r"(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)")
            for line in lines:
                result = spliter.match(line.strip())
                if result is not None and result.groups()[5] == iface :
                    arptable.append({"ip":result.groups()[0], "mac":result.groups()[3]});
            return n4d.responses.build_successful_call_response(arptable)
