import json
import os
import subprocess


class LmdImageManager:
	
		
	def __init__(self):
		self.imagepath="/etc/ltsp/images/"
		self.tftppath="/var/lib/tftpboot/ltsp"
		
		pass
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

		imagelist=[]
		
		for i in os.listdir(self.imagepath):
			if i.endswith('.json'): 
				imagelist.append(str(i))
				
		return json.dumps(imagelist)
			
			
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
		
		try:
			json_data=open(self.imagepath+image)
			data = json.load(json_data)
			json_data.close()
			
			if "taskid" in data:
				taskid=data["taskid"];
			else:
				taskid="0";
			
			# Searching task id for this image
			status="DONE";
			ret=objects['TaskMan'].getTaskStatus(taskid);
			
			if ret["status"]==True:
				status=ret["taskStatus"]
			# if ret[status] is false the task has been done time ago
			data["task_status"]=status;
			
			xpraConnections=objects["RemoteWebGui"].getXpraConnections(image.replace(".json", ""));
			data["xpraConnections"]=xpraConnections;
			
			
			return json.dumps(data)
			#return data;
		except Exception as e:
			print("[LmdImageManager]: getImage Exception "+str(e))
			return str(e);

		# END def getListTemplate(self, image)
		
		
	def setImage(self, image, data):
		'''
		Saves metadata from *data to image
		data is unicoded string
		image is name
		'''
				
		path_to_write = os.path.join(self.imagepath,image + ".json")
		f = open(path_to_write,'w')
		f.writelines(data)
		f.close()

		try:
			'''
			Writing lts.conf for image
			'''
			
			'''ldm_session default
			ltsp_fatclient undefined
			fat_ram_threshold default
			lmd_extra_params'''

			# Checking if we need to write file
			
			jsondata=json.loads(data)
			
			if ((jsondata['ldm_session']!="default") or (jsondata['ltsp_fatclient']!="undefined") or (jsondata['fat_ram_threshold']!="default") or (jsondata['lmd_extra_params']!="") or (jsondata['ldm_language']!="default")):
				tftpfilename=os.path.join(self.tftppath,image + "/lts.conf")
				
				f=open(tftpfilename,'w')
				f.write("[Default]\n")
				if (jsondata['ldm_session']!="default"):
					f.write("LDM_SESSION="+jsondata['ldm_session']+"\n")
				if (jsondata['ldm_language']!="default"):
					f.write("LDM_LANGUAGE="+jsondata['ldm_language']+"\n")
				if (jsondata['ltsp_fatclient']!="undefined"):
					f.write("LTSP_FATCLIENT="+jsondata['ltsp_fatclient']+"\n")
				if (jsondata['fat_ram_threshold']!="default"):
					f.write("FAT_RAM_THRESHOLD="+jsondata['fat_ram_threshold']+"\n")
				if (jsondata['ltsp_fatclient']=="false"):
					f.write('DEFAULT_DISPLAY_MANAGER="/usr/sbin/ldm"\n')
					f.write('X_SMART_COLOR_DEPTH=false\n')
				if (jsondata['use_local_apps']!="false"):
					f.write("LOCAL_APPS_EXTRAMOUNTS=/home\n")
					f.write("LOCAL_APPS=true\n")
					f.write("LOCAL_APPS_MENU=true\n")
					f.write("LOCAL_APPS_MENU_ITEMS="+jsondata['local_apps_text']+"\n")

				if (jsondata['lmd_extra_params']!=""):
					extra_params=jsondata['lmd_extra_params'].split("<br/>")
					for param in extra_params:
						# Checking syntax and writing
						if("=" not in param): continue
						else:
							f.write(param+"\n")
				f.close()
			else:				
				# We need to check if there was an old config...
				tftpfilename=os.path.join(self.tftppath,image + "/lts.conf")				
				try:
					os.remove(tftpfilename)
				except:
					pass
				
			return {"status":True, "msg":"Config Done"}
		
		except Exception as e:
			return {"status":False, "msg":str(e)}
			
			
		'''if(data.)
		path_to_write = os.path.join(self.imagepath,image + ".json")
		f = open(path_to_write,'w')
		f.writelines(data)
		f.close()'''


		'''
		datafile="";
		for i in data:
			print i
			print "*****"
			datafile=datafile+i+" ";
				
		jsondata=json.loads(datafile)
		print type(data)
		print "****************"
		print type(datafile)
		
		fd=open(self.imagepath+image, 'w')
		fd.write('{"id":"'+jsondata['id']+'",\n')
		fd.write('"name":"'+jsondata['name']+'",\n')
		fd.write('"template":"'+jsondata['template']+'",\n')
		fd.write('"desc":"'+(jsondata['desc']).encode('utf8')+'",\n')
		fd.write('"img":"'+jsondata['img']+'"}\n')
		fd.close()
		'''
	# def setImage(self, image, data)
	
	
	def setStatusImage(self, img_id, status):
		
		json_data=open(self.imagepath+img_id+".json")
		data = json.load(json_data)
		json_data.close()
		
		# Set status
		data["status"]=status
		
		self.setImage(img_id, json.dumps(data));
		
	
	def setNewTaskIdForImage(self, img_id, newid):
		
		json_data=open(self.imagepath+img_id+".json")
		data = json.load(json_data)
		json_data.close()
		
		# Set status
		data["taskid"]=newid
		
		self.setImage(img_id, json.dumps(data));
		
		
	
	def deleteImage(self, img_id):
		'''
		N4d Method to delete an image identified by img_id
		'''
		import shutil;
		
		try:
			chroot="/opt/ltsp/"+str(img_id)
			image="/opt/ltsp/images/"+str(img_id)+".img"
			json_file="/etc/ltsp/images/"+str(img_id)+".json"
			tftpboot="/var/lib/tftpboot/ltsp/"+str(img_id)
			nbd="/etc/nbd-server/conf.d/ltsp_"+str(img_id)+".conf"
			
			# Umount anything mounted under image
			test_chroot=self.umount_chroot(chroot);
			if test_chroot['status']==False:
				return test_chroot;
			
			# Remove chroot
			if (os.path.isdir(chroot)):
				shutil.rmtree(chroot);
			
			# Removing .img
			if (os.path.isfile(image)):
				os.remove(image);
			
			# Remove nbd
			if (os.path.isfile(nbd)):
				os.remove(nbd);
			
			# Remove /var/lib/tftpboot/...
			if (os.path.isdir(tftpboot)):
				shutil.rmtree(tftpboot);
			
			# Remove .json file
			if (os.path.isfile(json_file)):
				os.remove(json_file);
			
			return {"status":True, "msg":"Image Removed"}
		except Exception as e:
			return {"status":False, "msg":str(e)}
		
		
	#def setImage(self, image, data):
	
	def umount_chroot(self,chroot_dir):
		'''
		Umount system directories with -lazy, 
		'''
		ret=""
		try:
			# Test if exists chroot
			if not os.path.isdir(chroot_dir):
				print("NO DIR CHROOT: "+chroot_dir)
				return {'status': True, 'msg':'[LmdImageManager] Directory not exists'}
			else:
				
				# umount /net/mirror/llx1406
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/net/mirror | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo", "umount","-l",chroot_dir+"/net/mirror/llx1406"])
				
				# umount /proc
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/proc | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo", "umount","-l",chroot_dir+"/proc"])
				
				# umount /sys
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/sys | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir+"/sys"])
				
				# umount /dev/pts
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/dev/pts | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir+"/dev/pts"])
				
				# Mount /dev
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/dev | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir+"/dev"])
	
				# Umount /etc
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/etc/hosts | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir+"/etc/hosts"])
				
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/etc/ld.so.conf.d | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir+"/etc/ld.so.conf.d"])
					
				if (subprocess.check_output(["mount | grep "+chroot_dir+"/etc/nsswitch.conf | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir+"/etc/nsswitch.conf"])
				
				if (subprocess.check_output(["mount | grep ' "+chroot_dir+" ' | wc -l"], shell=True))!='0\n':
					ret=subprocess.check_output(["sudo","umount","-l",chroot_dir])
				
				return {'status': True, 'msg':'[LmdImageManager] All is umounted'}
		except Exception as e:
			return {'status': False, 'msg':'[LmdImageManager] '+str(e)}
	#def umount_chroot(self,chroot_dir)
	
	def check_image_editing(self):
		try:
			if os.path.isfile("/tmp/.lmd-editing-chroot"):
				return {'status':True, 'response':True}
			else:
				return {'status':True, 'response': False}
		except Exception as e:
			return {'status': False, 'msg': str(e)}
	
	def clean_image_editing(self):
		try:
			if os.path.isfile("/tmp/.lmd-editing-chroot"):
				os.remove("/tmp/.lmd-editing-chroot");
			
			return {'status': True}
		
		except Exception as e:
			return {'status': False, 'msg': str(e)}
	# New method to check without vars, this method allow mount the mirror by nfs without use lliurex-mirror
	#   check method relies into lliurex-version call, checking structure of files and dirs into /net/mirror/llx16
	#   architectures always be all or nothing due to assumption that lliurex-mirror mirror both architectures always.
	def check_mirror(self):
		try:
			r=subprocess.check_call(["lliurex-version","-x","mirror"])

			#status will be mirrorReady, msg.llx16.ARCHITECTURES(list) will always be [i386,amd64]

			return {'status': True,'msg': {'llx16': {'ARCHITECTURES':['i386','amd64']}}}
		except Exception as e:
			return {'status': False,'msg': {'llx16':{'ARCHITECTURES':['None']},'msg':str(e)}}
	
	# OLD METHOD TO CHECK WITH VARS (Disabled)
	def check_mirror_with_vars(self):
		try:
			response=objects['MirrorManager'].get_all_configs();
			
			lliurex_mirror=objects["VariablesManager"].get_variable("LLIUREXMIRROR");
			if (lliurex_mirror["llx16"]["status_mirror"]!="Ok"):
				response["status"]=False;
			return response;
			
		except Exception as e:
			return {'status': False, 'msg': str(e)}
	
	def tryUpdateImagesToVnc(self):
		list_images = self.getImageList()
		images = json.loads(list_images)
		images_to_update = []
		for x in images:
			if objects["LmdServer"].is_needed_update_image(x["id"]):
				images_to_update.append(x["id"])
		if len(images_to_update) > 0:
			command = "update_ltsp_images_to_vnc " + " ".join(images_to_update)
			ret=objects['TaskMan'].newTask(command)
			if ret["status"]==True: ## Task has launched ok
				for x in images_to_update:
					objects['LmdImageManager'].setNewTaskIdForImage(x, ret["msg"])



