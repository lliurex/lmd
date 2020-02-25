import json
import os
import crypt

class LmdBootManager:
	
		
	def __init__(self):
		self.imagepath="/etc/ltsp/bootopts/"

		
		pass
	#def __init__
	
	def getNetinstall(self):
		'''
		DEPRECATED
		Reads file /etc/ltsp/bootopts/netinstall and returns true or false
		'''
		# 1. /opt/ltsp/name-chroot
		# 2. /opt/ltsp/images/name-chroot.img
		# 3. /var/lib/tftpboot/ltsp/name-chroot
		# if 1,2 and 3 exist -> show
		# if 1 but not exist 2 or/and 3 -> show with error
		#
		
		json_data=open(self.imagepath+"netinstall.json")
		data = json.load(json_data)
		json_data.close()
		if(data["netinstall_boot"].lower()=="true"):
			netinstall=True;
		else:
			netinstall=False;
		
		if(data["netinstall_unattended"].lower()=="true"):
			unattended=True;
		else:
			unattended=False;
			
		return {"netinstall":netinstall, "unattended":unattended}
		
		return json.dumps(imagelist)
			
			
	# END def GetListImages(self)

	def setNetinstall(self, status, unattended):
		'''
		DEPRECATED
		sets option for netinstall int bootopt.json (status and unattended install)
		'''
		try:
			mirror_var="/var/lib/n4d/variables-dir/LLIUREXMIRROR"
			if os.path.isfile(mirror_var):
				if (status.lower()=="true" or status.lower()=="false"):
					path_to_write = os.path.join(self.imagepath,"netinstall.json")
					f = open(path_to_write,'w')
					data='{"netinstall_boot":"'+str(status)+'", "netinstall_unattended":"'+str(unattended)+'"}'
					f.writelines(data)
					f.close()
					
					# Enable NETINSTALL on menu (the last option, but enabled)
					objects["LlxBootManager"].pushToBootList("netinstall")

					# Removing user and password from preseed
					self.setNetinstallUnattended(status, "", "", "")
					
					return {"status":"true", "msg":"all ok"}
	
				else:
					return {"status":"false", "msg":"option not valid"}
			else:
					return {"status":"false", "msg":"mirror is not available"}
				
			#return data;
		except Exception as e:
			return str(e);

		# END def getListTemplate(self, image)
		
	def setNetinstallUnattended(self, status, username, password, rootpassword):
		'''
		DEPRECATED
		Writing in presseed username and password
		'''				
		try:
			filedir="/var/www/preseed"
			filepath="/var/www/preseed/unattended.cfg"
			filepartman="/var/www/preseed/partman_sda.cfg"

			if not os.path.exists(filedir):
				os.makedirs(filedir)
			
			preseed=open(filepath,'w')
			preseed.write("# LMD Created user account\n")
			salt="sw9.tfRI"			
			userpassencrypted=crypt.crypt(str(password),"$1$"+salt+"$")
			rootpassencrypted=crypt.crypt(str(rootpassword),"$1$"+salt+"$")
			
			if(status==True):
				# Saving file
				
				userfullline="d-i passwd/user-fullname string "+str(username)+"\n";
				userline="d-i passwd/username string "+str(username)+"\n";
				passline="d-i passwd/user-password-crypted password "+str(userpassencrypted)+"\n"
				
				if (len(rootpassword) > 0):
					rootpassline = "d-i passwd/root-password-crypted password "+str(rootpassencrypted) + "\n"
				else:
					rootpassline = "# d-i passwd/root-password-crypted password "+str(rootpassencrypted) + "\n"
					
				# Partition preseed
				try:
					partman = open(filepartman,'r')
					preseed.writelines(partman.readlines())
					preseed.write("\n")
					partman.close()
				except Exception as e:
					return str(e)
				
			else:
				userfullline="#d-i passwd/user-fullname string \n"
				userline="#d-i passwd/username string \n"
				passline="# d-i passwd/user-password-crypted password \n"
				rootpassline = "# d-i passwd/root-password-crypted password \n"

			preseed.write("# Normal user name\n")
			preseed.write(userfullline)
			preseed.write(userline)
			preseed.write("# Normal user's password, either in clear text\n")
			preseed.write("#d-i passwd/user-password password insecure\n")
			preseed.write("# Normal user's password encrypted using an MD5 hash.\n")
			preseed.write(passline)
			preseed.write(rootpassline)
			
			# Allow weak passwords
			preseed.write("d-i user-setup/allow-password-weak boolean true\n")
			
			preseed.close()
			
		except Exception as e:
			return str(e)

		# END def getListTemplate(self, image)
		
		
		
	'''
	Methods to work with lts.conf file
	'''
	
	''' def getTemplate(self, template):
		'' '
		Reads the file template from /etc/ltsp/templates
		Returna a JSON string with the config options
		'' '
		try:
			config = StringIO.StringIO()
			config.write('[meta_inf]\n')
			config.write('name="'+template+'"\n')
			
			
			config.write('[default]\n')
			config.write(open(str(self.templatepath)+"/"+str(template)).read())
			config.seek(0, os.SEEK_SET)
			cp = ConfigParser.ConfigParser()
			cp.readfp(config)
			aux = cp._sections
			for x in aux.keys():
				for y in aux[x]:
					if aux[x][y][0] == '"' and aux[x][y][-1] == '"':
						aux[x][y] = aux[x][y][1:-1]

			return json.dumps(aux)
			#return json.dumps(cp.items('default'));
			
			
		except Exception as e:
			return "Exception: "+str(e)
		# END def getListTemplate(self, template)
	'''		
		
	def getLtsConf(self):
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
	
	def mergeLtsConf(self):
		
		# Creates lts.conf file merging lts.default.conf and lts.clients.conf
		conf_file="/var/lib/tftpboot/ltsp/i386/lts.conf"
		default_file="/var/lib/tftpboot/ltsp/i386/lts.default.conf"
		clients_file="/var/lib/tftpboot/ltsp/i386/lts.clients.conf"

		# Create clients file if not exists
		if not os.path.exists(clients_file):
			open(clients_file,"w").close()


		filenames = [default_file, clients_file]
		
		with open(conf_file, 'w') as outfile:
		    for fname in filenames:
		        with open(fname) as infile:
		            for line in infile:
		                outfile.write(line)		

		return {"status":"true", "msg":"all ok"}

	
	def setLtsClientsConf(self):
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

	

	def getBootOpts(self):
		'''
		Reads file /etc/ltsp/bootopts/netinstall and returns true or false
		'''
		# 1. /opt/ltsp/name-chroot
		# 2. /opt/ltsp/images/name-chroot.img
		# 3. /var/lib/tftpboot/ltsp/name-chroot
		# if 1,2 and 3 exist -> show
		# if 1 but not exist 2 or/and 3 -> show with error
		#
		json_data=open(self.imagepath+"netinstall.json")
		data = json.load(json_data)
		json_data.close()
		if(data["netinstall_boot"].lower()=="true"):
			return True
		else:
			return False
			
		return json.dumps(imagelist)
			
			
	# END def GetListImages(self)

	def setBootOpts(self, status):
		'''
		sets option for netinstall int bootopt.json
		'''
		try:
			mirror_var="/var/lib/n4d/variables-dir/LLIUREXMIRROR"
			if os.path.isfile(mirror_var):
				if (status.lower()=="true" or status.lower()=="false"):
					path_to_write = os.path.join(self.imagepath,"netinstall.json")
					f = open(path_to_write,'w')
					data='{"netinstall_boot":"'+str(status)+'"}'
					f.writelines(data)
					f.close()
					return {"status":"true", "msg":"all ok"}
	
				else:
					return {"status":"false", "msg":"option not valid"}
			else:
					return {"status":"false", "msg":"mirror is not available"}
				
			#return data;
		except Exception as e:
			return str(e);

	def ReadNBDSwapSize(self):
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
		try:
			if os.path.exists(self.imagepath+"defaultboot.json"):
				json_data=open(self.imagepath+"defaultboot.json")
				data = json.load(json_data)
				json_data.close()
				return data
			else:
				return {"default_boot":""}
		except Exception as e:
			return {"default_boot":""}
		
	def setDefaultBootImage(self, image):
		try:
			path_to_write = os.path.join(self.imagepath,"defaultboot.json")
			f = open(path_to_write,'w')
			data='{"default_boot":"'+str(image)+'"}'
			f.writelines(data)
			f.close()
			return {"status":"true", "msg":"all ok"}
		except Exception as e:
			return {"status":False, "msg":str(e)}


	def getMenuTimeout(self):
		try:
			if os.path.exists(self.imagepath+"menutimeout.json"):
				json_data=open(self.imagepath+"menutimeout.json")
				data = json.load(json_data)
				json_data.close()
				return data
			else:
				return {"timeout":""}
		except Exception as e:
			return {"timeout":""}
		
	def setMenuTimeout(self, time):
		try:
			path_to_write = os.path.join(self.imagepath,"menutimeout.json")
			f = open(path_to_write,'w')
			data='{"timeout":"'+str(time)+'"}'
			f.writelines(data)
			f.close()
			return {"status":"true", "msg":"all ok"}
		except Exception as e:
			return {"status":False, "msg":str(e)}
