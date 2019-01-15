import json
import os
import time


class LmdNotifier:
	
		
	def __init__(self):
		self.log="/var/log/lmd-server.log"
		pass
	#def __init__
	
	def getLog(self):
		'''
		Reads log file
		Returna a JSON List.
		'''
		
		json_data=open(self.log)
		data=json.load(json_data)
		json_data.close()
		
		return data;

	def cleanLog(self):
		try:
			os.remove(self.log)
			open(self.log, 'a').close()
		except Exception as e:
			print("[LmdNotifier]"+str(e))
		
		pass

	def addNotification(self, type, title, desc):
		try:
			if (not(os.path.isfile(self.log))  or (os.stat(self.log).st_size==0)):
				json_data=open(self.log, "w")
				data=json.dumps([{"data": time.strftime("%d/%m/%y %H:%M:%S"), "type":type, "title":title, "desc":desc}])
				json_data.write(data)
				
			else:
				# read file
				json_data=open(self.log)
				data=json.load(json_data)
				json_data.close()
				
				# Open for writing
				json_data=open(self.log, "w")
				#newnote=json.dumps({"data":"aa", "type":type, "title":title, "desc":desc})
				newnote={"data":time.strftime("%d/%m/%y %H:%M:%S"), "type":type, "title":title, "desc":desc}
				data.append(newnote);
				
				json_data.write(json.dumps(data))
				json_data.close()
		
		except Exception as e:
			print("[LmdNotifier]"+str(e))
		pass