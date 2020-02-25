import json
import os


class LmdClientManager:
	
		
	def __init__(self):
		self.clientpath="/etc/ltsp/bootopts/clients/"
		
		pass
	#def __init__
	
	def getClientList(self):
		'''
		Reads the file list of clients from /etc/ltsp/bootopts/clients
		Returna a JSON List.
		'''
		
		clientlist=[]
		
		for i in os.listdir(self.clientpath):
			if '.json' in i:
				clientlist.append(str(i))
				
		return json.dumps(clientlist)
			
	

	def getClient(self, client):
		'''
		Returns the metadata from certain client
		'''
		try:
			json_data=open(self.clientpath+client)
			data = json.load(json_data)
			json_data.close()
			return json.dumps(data)
			#return data;
		except Exception as e:
			return {"status":False};

		
		
	def setClient(self, client, data):
		'''
		Saves metadata from *data to client
		data is unicoded string
		client is a mac
		'''
		client=client.replace(":", "")
				
		path_to_write = os.path.join(self.clientpath,client + ".json")
		f = open(path_to_write,'w')
		f.writelines(data)
		f.close()
		
	
	def deleteClient(self, client):
		'''
		N4d Method to delete a client
		'''
		import shutil;
		
		try:
			client=client.replace(":", "")
			json_file = os.path.join("/etc/ltsp/bootopts/clients",client + ".json")
						
			# Remove .json file
			if (os.path.isfile(json_file)):
				os.remove(json_file);
			
			return {"status":True, "msg":"Client Removed"}
		except Exception as e:
			return {"status":False, "msg":str(e)}
		
	def getArpTable(self):
		
		f=open("/proc/net/arp")
		lines=f.readlines()
		f.close()
		
		arptable=[];

		iface=objects["VariablesManager"].get_variable("INTERNAL_INTERFACE")
		
		for line in lines:
			macarray=re.sub(' +',' ',line).split(" ");
			ip=macarray[0]
			mac=macarray[3]
			if (macarray[5].replace('\n', '')==iface):
				print("adding")
				arptable.append({"ip":ip, "mac":mac});
			
		return arptable[0:];
