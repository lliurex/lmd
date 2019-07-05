import socket
import subprocess
import sys

import threading
import time
import datetime

import json

import os
import signal
import re

import shutil
import tempfile

import tarfile
import apt_pkg

import lliurex.net

class LmdServer:
	def __init__(self):

		self.last_job_id=0
		self.joblist=[]
		self.global_listeners = {}
		self.thread_jobs = {}
		# Threading Multicast process to all listeners
		self.multicast_thread = threading.Thread()
		self.logfolder = '/run/lmdserver'
		self.ltsp_path = '/opt/ltsp'
		self.locks = {}
		# Clean log folder and create
		if (os.path.exists(self.logfolder)):
			shutil.rmtree(self.logfolder)
		os.mkdir(self.logfolder)
		
		pass
	#def __init__
	
	def set_default_boot(self,imgid):
		dbm = objects['LmdBootManager'].getDefaultBootImage()
		if dbm['default_boot'] == "":
			objects['LmdBootManager'].setDefaultBootImage(imgid)


	def check_chroot_exists(self, name):
		'''
		Check if exists chroot /opt/ltsp/name and /opt/ltsp/images/name.img
		DATE: 03/04/2014
		'''
		path=os.path.join("/opt/ltsp",name)
		imagepath=os.path.join("/opt/ltsp/images",name+".img")
		
		#print "cheking "+name
		if(os.path.isdir(path)):
			#print "111"
			return {"status": True, "error": 'chroot_exists'}
		
		if (os.path.isfile(imagepath)):
			#print "22222"
			return {"status": True, "error": 'image_exists'}
		return {"status": False}

		
	def create_imageWS(self, imgid, name, template, description='', bgimg='', arch='i386', env='', extraopts=''):
		try:
			# creates an image from an specified template
		
			# Check if template exists
			path="/etc/ltsp/templates/"+template
			if(os.path.isfile(path)):
				cancelcommand = ''
				extraLliurexOpts="--apt-keys /usr/share/keyrings/lliurex-archive-keyring.gpg --accept-unsigned-packages --purge-chroot --lliurex-sourceslist"  + extraopts
				# if template exists, create an image
				print("[LmdServer] Create_imageWS from "+path)
				command="ltsp-build-client --config "+path+" "+extraLliurexOpts+" --chroot "+imgid+"; systemctl restart nbd-server; ltsp-set-domain-search-ltsconf"
				
				if env != '' :
					command = env + " " + command
				
				if extraLliurexOpts.find('--isopath') > 0:
					cancelcommand = "lmd-from-iso-clean " + extraLliurexOpts
					command = command + "; lmd-fix-architecture " + imgid
				
				ret=objects['TaskMan'].newTask(command, cancelcommand)
								
				if ret["status"]==True: ## Task has launched ok
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
					metadata_string = unicode(json.dumps(metadata,indent=4,encoding="utf-8",ensure_ascii=False)).encode("utf-8")
					objects['LmdImageManager'].setImage(imgid,metadata_string)
					self.set_default_boot(imgid)

					# Registering imgid for boot PXE MEnu
					label="ltsp_label"+str(imgid)
					objects['LlxBootManager'].pushToBootList(label)
					
					# set this new image as the default boot option if hdd is the current option
					boot_order=objects['LlxBootManager'].getBootOrder()
					if len(boot_order)>0 and boot_order[0]=="bootfromhd":
						new_boot_order=objects['LlxBootManager'].prependBootList(label)
				
					return {"status": True, "msg": ret["msg"]}

				else:
					if ret["msg"]=="SERVER_BUSY":
						return {'status':False, 'msg':'SERVER_BUSY'}
					else:
						return {'status':False, 'msg':'EXCEPTION'}
				
			else:
				return {'status':False, 'msg':'TEMPLATE_NOT:EXISTS'}
			
			pass
		except Exception as e:
			print("Except: "+str(e))
			return e
	
	
	
	
	def create_image(self, ip, port, imgid, name, template, description='', bgimg='', srv_ip='127.0.0.1'):
		try:
			# creates an image from an specified template
		
			# Check if template exists
			path="/etc/ltsp/templates/"+template
			if(os.path.isfile(path)):
				extraLliurexOpts="--apt-keys /usr/share/keyrings/lliurex-archive-keyring.gpg --accept-unsigned-packages --purge-chroot"
				# if template exists, create an image
				print("[LmdServer] Create_image from "+path)
				command="ltsp-build-client --config "+path+" "+extraLliurexOpts+" --chroot "+imgid+"&& service nbd-server restart";
				
				metadata = {'id':imgid, 'name' : name,
							'desc' : description ,
							"template" : template,
							'img': bgimg,
							'ltsp_fatclient': 'undefined',
							'ldm_session': 'default',
							'fat_ram_threshold': 'default',
							'lmd_extra_params':'' }
				
				metadata_string = unicode(json.dumps(metadata,indent=4,encoding="utf-8",ensure_ascii=False)).encode("utf-8")
				objects['LmdImageManager'].setImage(imgid,metadata_string)
				self.set_default_boot(imgid)
				#command="cat "+path+"; sleep 15; cat "+path+"; echo 'command is: ltsp-build-client --config "+path+" "+extraLliurexOpts+" --chroot "+imgid+"'";
				#command="/tmp/miscript"
				#command="tree /"
				result=self.do_command(ip, port, command, srv_ip,target=imgid)
				
				# Registering imgid for boot PXE MEnu
				
				if (result==0):
					objects['LlxBootManager'].pushToBootList("ltsp_label"+str(imgid))
				else:
					# Image has not been built correctly
					metadata = {'id':imgid, 'name' : name,
						'desc' : description ,
						"template" : template,
						'img': bgimg,
						'ltsp_fatclient': 'undefined',
						'ldm_session': 'default',
						'fat_ram_threshold': 'default',
						'status':'broken',
						'lmd_extra_params':'' }
					
				
				return result

			else:
				return "{'status':'false', 'error':'template does not exists'}"
			
			pass
		except Exception as e:
			print "Except: "+str(e)
			return e
		
	
	def refresh_image(self, ip, username, password, port, imgid, srv_ip='127.0.0.1'):
		
		# Rebuild img file for imgid
		import xmlrpclib

		try:
			# umount anything
			path="/opt/ltsp/"+imgid
			
			server = xmlrpclib.ServerProxy("https://localhost:9779")
			server.umount_chroot((username,password),'LmdImageManager',path)
			
			# Let's rebuild image
			print "[LmdServer] Refreshing image for "+str(imgid)

			# Trying to solve the non-zenity problem
			# 
			command="ltsp-chroot -p -m -a "+imgid+" dpkg-reconfigure libgl1-mesa-dri ;  "
			
			
			command=command + "ltsp-chroot -p -m -a "+imgid+" /usr/share/ltsp/update-kernels && "
			command=command + "ltsp-update-kernels "+imgid+" && ltsp-update-image "+imgid+"&& service nbd-server restart";	
			result=self.do_command(ip, port, command, srv_ip,target=imgid)
			objects['LlxBootManager'].pushToBootList("ltsp_label"+str(imgid))
			return {"status": True, "msg": 'Image Updated'}

				
			pass
		except Exception as e:
			print "Except: "+str(e)
			return {"False": True, "msg": str(e)}

	
		
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
				
				
				print "[LmdServer] Refreshing image for "+str(imgid)
				
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
			print "Except: "+str(e)
			return {"False": True, "msg": str(e)}
		
	
	
	def export_image(self, ip, port, imgid, srv_ip='127.0.0.1'):
		# Deprecated: Replaced by CloneOrExportWS
		try:
			# creates an image from an specified template
		
			# Check if template exists
			print "[LmdServer] Export_image from "+imgid
			
			name_file = str(imgid) + "_" + time.strftime("%Hh%Mm%Ss_%d%m%Y") + '.tgz'

			command="ltsp-import-export export /tmp/"+ name_file +" "+str(imgid);

			result=self.do_command(ip, port, command, srv_ip,target=imgid)
			return {"status": True, "msg": str(result)}
			pass
		except Exception as e:
			print "Except: "+str(e)
			return {"status": False, "msg": str(e)}

	def import_image(self, ip, port, imgid, path, srv_ip='127.0.0.1'):
		# Deprecated: Replaced by CloneOrExportWS and extra apps...
		try:
			
			import xmlrpclib
			client=xmlrpclib.ServerProxy("https://127.0.0.1:9779")
			n4d_server_ip=client.get_variable("", "VariablesManager", "SRV_IP")

			#if(ip==srv_ip)
			print ("COMPARING: "+lliurex.net.get_ip_from_host(ip)+ "and "+ n4d_server_ip);
			if(lliurex.net.get_ip_from_host(ip)==n4d_server_ip or ip==srv_ip):
				print "[LmdServer] Import_image from ",path, " to ", imgid

				tar = tarfile.open(path)
				l = tar.getnames()
				folder = l[0]
				imgid = folder
				f = tar.extractfile(folder + '/' + folder + '.json')
				exec("json_content="+"".join(f.readlines()))
				try:
					new_name = folder
					count = 1
					while os.path.exists(os.path.join(self.ltsp_path,new_name)):
							new_name = folder + "_" + str(count)
							count += 1

					extra_opts = ""
					if folder != new_name:
						extra_opts = new_name
				except Exception as e:
					extra_opts = ""
				command="ltsp-import-export import "+str(path)+" "+folder+" "+extra_opts+" && service nbd-server restart";
				
				if extra_opts != "":
					imgid = extra_opts
					json_content['id'] = imgid
					json_content['name'] = imgid
				json_file = open('/etc/ltsp/images/' + imgid + '.json','w')
				data = unicode(json.dumps(json_content,indent=4,encoding='utf-8',ensure_ascii=False)).encode('utf-8')
				json_file.write(data)
				json_file.close()
				self.set_default_boot(imgid)
				result=self.do_command(ip, port, command, srv_ip,target=imgid)
				return {"status": True, "msg": str(result)}
				pass
			else:
				print "[LmdServer] ERROR. Trying to import image from out of server";
				return {"status": False, "msg": "Not in server"}
		except Exception as e:
			print "Except: "+str(e)
			return {"status": False, "msg": str(e)}


	def CreateImgJSON(self, imgid, newLabel, newid, description, path):
		#self.CreateImgJSON(targetid, newLabel, newid, newDesc, new_json_descriptor_file);
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
			print "Except: "+str(e)
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
			print "Except: "+str(e)
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
			print "Except: "+str(e)
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
			

	def deploy_minimal_client(self, ip, port, srv_ip='127.0.0.1'):
		# DEPRECATED: Replaced by deploy_minimal_clientWS
		try:
			command="/usr/sbin/mini-light-client.py";
			imgid="mini-light-client"
			
			lng="es_ES.UTF-8"
			language="es_ES"
	
			# After that, set image as available
			metadata = {'status':'enabled-non-editable',
						'id':'mini-light-client',
						'name':'Client Lleuger Minim',
						'template':'Default by LMD',
						'desc':'Minimal thin client -not fat- for Lliurex LTSP.',
						'img':'llx-client16.png',
						'ltsp_fatclient': 'false',
						'ldm_session': 'plasma',
						'fat_ram_threshold': 'default',
						'lmd_extra_params':'XKBLAYOUT=es LDM_LANGUAGE="%s" LOCALE_DIR=%s'%(lng,language)}
			metadata_string = unicode(json.dumps(metadata,indent=4,encoding="utf-8",ensure_ascii=False)).encode("utf-8")
			objects['LmdImageManager'].setImage('mini-light-client',metadata_string)
			self.set_default_boot(imgid)
			result=self.do_command(ip, port, command, srv_ip,target=imgid)
					
			if result==0:
				# Step 2. Writing lts.conf for mini-light-client
				
				print "[LMDServer] Writing lts.conf for mini-light-client"
				
				if not os.path.exists('/var/lib/tftpboot/ltsp/mini-light-client'):
					os.makedirs('/var/lib/tftpboot/ltsp/mini-light-client')
				
				f=open('/var/lib/tftpboot/ltsp/mini-light-client/lts.conf', 'w')
				f.write('[Default]\n')
				f.write('LDM_LANGUAGE=es_ES.UTF-8\n')
				f.write('LTSP_FATCLIENT=false\n')
				f.write('DEFAULT_DISPLAY_MANAGER="/usr/sbin/ldm"\n')
				f.close()
				
				# Step 3. Registering imgid for boot PXE menu
				objects['LlxBootManager'].pushToBootList("ltsp_label"+str(imgid));
				
				try:
					f=open("/etc/default/locale")
					lines=f.readlines()
					f.close()
					for line in lines:
						if "LANG=" in line:
							lng=line.strip().split("=")[1].strip("'").strip('"')
							if "es_ES" in lng:
								language="es"
							if "ca_ES" in lng:
								language="ca_ES@valencia"
							
				except:
					return {"status": False, "msg": str(result)}
					pass
				
				return {"status": True, "msg": str(result)}
				pass
		
			else:
				# result is not 0 -> Image creation cancelled
				return {"status": True, "msg": str(result)}
				pass
			
		except Exception as e:
			print "Except: "+str(e)
			return {"status": False, "msg": str(e)}
	

	#def deploy_minimal_clientWS(self, ws):
	def deploy_minimal_clientWS(self):
		#ws=objects['TaskMan'].getWS() -> no cal??
		try:
			command="/usr/sbin/mini-light-client.py";
			#command="tasktest hola";
			
			
			#result=self.do_command(ip, port, command, srv_ip,target=imgid)
			ret=objects['TaskMan'].newTask(command);
			if ret["status"]==True: ## Task has launched ok
				#print ret["status"]
				
				# Writing  json metadata in /etc/ltsp/images/
				imgid="mini-light-client"
				
				lng="es_ES.UTF-8"
				language="es_ES"
				# After that, set image as available
				metadata = {'status':'enabled-non-editable',
							'taskid': ret["msg"],
							'id':'mini-light-client',
							'name':'Client Lleuger Minim',
							'template':'Default by LMD',
							'desc':'Minimal thin client -not fat- for Lliurex LTSP.',
							'img':'llx-client16.png',
							'ltsp_fatclient': 'false',
							'ldm_session': 'startxfce4',
							'fat_ram_threshold': 'default',
							'lmd_extra_params':'XKBLAYOUT=es LDM_LANGUAGE="%s" LOCALE_DIR=%s'%(lng,language)}
				metadata_string = unicode(json.dumps(metadata,indent=4,encoding="utf-8",ensure_ascii=False)).encode("utf-8")
				objects['LmdImageManager'].setImage('mini-light-client',metadata_string)
				self.set_default_boot(imgid)
				
				# Writing lts.conf
				print "[LMDServer] Writing lts.conf for mini-light-client"
				if not os.path.exists('/var/lib/tftpboot/ltsp/mini-light-client'):
					os.makedirs('/var/lib/tftpboot/ltsp/mini-light-client')
				f=open('/var/lib/tftpboot/ltsp/mini-light-client/lts.conf', 'w')
				f.write('[Default]\n')
				f.write('LDM_LANGUAGE=es_ES.UTF-8\n')
				f.write('LTSP_FATCLIENT=false\n')
				f.close()
				# Step 3. Registering imgid for boot PXE menu
				objects['LlxBootManager'].pushToBootList("ltsp_label"+str(imgid));
				try:
					f=open("/etc/default/locale")
					lines=f.readlines()
					f.close()
					for line in lines:
						if "LANG=" in line:
							lng=line.strip().split("=")[1].strip("'").strip('"')
							if "es_ES" in lng:
								language="es"
							if "ca_ES" in lng:
								language="ca_ES@valencia"
							
				except:
					return {"status": False, "msg": ret["msg"]}
					pass
								
				# Returns true and ret.msg, that is job id
				return {"status": True, "msg": ret["msg"]}
				pass
			
			else:
				if ret["msg"]=="SERVER_BUSY":
					return {'status':False, 'msg':'SERVER_BUSY'}
				else:
					return {'status':False, 'msg':'EXCEPTION'}
		
			
		except Exception as e:
			print "Except: "+str(e)
			return {"status": False, "msg": str(e)}
	


	def do_command(self, ip, port, command, srv_ip='127.0.0.1',target=None):
		try:
			# Add Job
			'''job={
				'job_id':str(self.last_job_id),
				'srv_ip': None,   					#  Server (me) IP addr
				'process': None,
				'status':'started',
				'msg':'',				# Error code
				'target':'None',
				'command':command,
				'started_by':None,
				'listeners': [{'ip':ip,
						'port':port,
						'socket':None}],
				'filepipe': ''
				}'''
			call_info = _n4d_get_user()
			job={
				'job_id':str(self.last_job_id),
				'srv_ip': srv_ip,
				'process': None,
				'status':'started',
				'msg':None,
				'target': target,
				'command':command,
				'started_by':str(ip),
				'listeners': [],
				'filepipe': '',
				'seek' : 0,
				'method':call_info['method'],
				'class': call_info['class']
				
			}
			
			lock = threading.Lock()
			self.locks[job['job_id']]={}
			self.locks[job['job_id']]['lock'] = lock
			
			self.locks[job['job_id']]['lock'].acquire()
			# Exec command
			# proc = subprocess.Popen([command],  shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE, preexec_fn=os.setsid)
			
			# Prepare file pipe
			temp = tempfile.NamedTemporaryFile(prefix='pipe_', dir=self.logfolder, delete=False)
			
			# New exec command, ignoring stderr stdin for now
			proc = subprocess.Popen([command],  shell=True, stdout=temp, preexec_fn=os.setsid)
			
			
			# Add job to tasklist
			job['process']=proc 					# Assotiate process to job
			job['status']="running"
			job['filepipe'] = temp.name

			
			self.joblist.append(job)				#Adding job
			self.add_listener_to_job(ip, port, job) # Adding the client ip:port to listeners list
			
			## PAUSA PARA PROVOCAR UNA CONDICION DE CARRERA
			##
			## time.sleep(2)
			## FIN DE LA PAUSA
			##
			#self.joblist.append(job)				#Adding job  # Moved before add_listener_to_job
		
			# Increase last_job_id
			self.last_job_id=self.last_job_id+1
			# Multicast process to all listeners
			print "[LmdServer] WAITING ...:"+str(datetime.datetime.now())
			ret=job['process'].poll()
			
			while ret is None:
				time.sleep(1)
				ret=job['process'].poll()
			
			
			#temp.close()
			if (str(ret)=='0'):
				job['status']="finished"
			elif (str(ret)=='-9'):			
				job['status']="cancelled"
			else: # return code 1 when install fails
				job['msg']="broken"
			print "[LmdServer] END WAIT AT"+str(datetime.datetime.now())
			print "[LmdServer] FINISHING!!!, return code: "+str(ret)
				
			# Force umount (to avoid morrir destruction in mirrononnet)
			proc=subprocess.call(["/usr/share/lmd-scripts/umount-chroot.sh"])

			# Sending last line to log for all listeners
			line="<b>Finished with status:"+job['status']+" and Response: "+job['msg']+" </b>\n"
			aux = open(job['filepipe'],'a')
			aux.writelines(line)
			aux.close()

			# Append result of job and release mutex. Now all inform_me return finish
			self.locks[job['job_id']]['result'] = str(ret)
			self.locks[job['job_id']]['lock'].release()
			print  str(ret)
			return str(ret)
		
		except Exception as e:
			job['status']="Error"
			print '[LmdServer]',e
			if (ret is None):
				job['msg']="Err code None (running)"
			elif (ret<0):
				job['msg']="Interrupted by signal: "+str(ret)
			else:
				job['msg']="Aparently all went well: "+str(ret)
			
	
			# Append result of job and release mutex. Now all inform_me return finish
			self.locks[job['jobid']]['result'] = str(ret)
			self.locks[job['jobid']]['lock'].release()

			return str(e)
		
		
	def inform_me(self,job_id):
		'''
			Return result of job when finish
		'''

		self.locks[job_id]['lock'].acquire()
		self.locks[job_id]['lock'].release()
		
		return {'status':True,'msg':self.locks[job_id]['result']}


	def add_listener_to_job(self, ip, port, job):
		'''
		Description:
		* Internal Function
		* Adds a listener identified by an ip and a port to a job object
		
		How it Works:
		* Creates a socket to send information to a listening socket in any client
		
		Last update:
		    * 5/02/2014: Added Functionality
		    * 2/04/2014: Add reference with job_id
		'''
		
		try:
			# Create a socket for new listener
			srv=socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
			
			# connection to socket to send log
			srv.connect((ip, int(port)))
			
			# Defines a new listener
			listener={'ip':ip,
				'port':port,
				'socket':srv}
		
			# Add listener to job
			job['listeners'].append(listener)
			print "[LmdServer] add_listener_to_job: adding "+str(listener)+"to listeners for job "+str(job['job_id'])
			
			# Sending status of job
			listener['socket'].send("<b>Start listening on "+str(listener['port'])+"</b>")			
			listener['socket'].send("<b> Task:"+str(job['command'])+"</b>")
			listener['socket'].send("<b> Started by: "+str(job['started_by'])+"</b>")
			
			
				
			# Add reference with job_id
			tuple_ip_port = (str(ip),str(port))
			self.global_listeners[tuple_ip_port] = job['job_id']
			#print "Len",len(self.global_listeners)
			#print "isAlive",self.multicast_thread.isAlive()
			if not self.multicast_thread.isAlive():
				#print "lanzando el thread"
				self.multicast_thread = threading.Thread(target=self.Multicast, args=())
				self.multicast_thread.daemon = True
				self.multicast_thread.start()
				pass
			
			return port
			
		except Exception as e:
			print("[LmdServer] add_listener_to_job Exception: "+str(e))
			return -1
		
		pass
		
	def add_listener(self, ip, port, job_id):
		'''
		Description:
		* n4d method
		* Adds a listener identified by an ip and a port to a job object identified by its id
		
		How it Works:
		* Search whic job has certain job_id and adds a listener to it
		
		Last update:
		    * 5/02/2014: Added Functionality
		'''
		from operator import itemgetter
		
		#print ("[add_listener DEBUG] address: "+str(ip)+":"+str(port)+" job id: "+str(job_id))
		try:
			# Get job identified by job_id
			current_job_index=map(itemgetter('job_id'), self.joblist).index(str(job_id))
			current_job=self.joblist[current_job_index]
			# Add listener to current_job
			self.add_listener_to_job(ip, port, current_job)
		except Exception as e:
			print ("[LmdServer] add_listener Exception "+str(e))
		pass


	def send(self, ip, job_id, info):
		'''
		receives info to send to stdin
		'''
		from operator import itemgetter

		try:
			current_job_index=map(itemgetter('job_id'), self.joblist).index(str(job_id))
			current_job=self.joblist[current_job_index]
			# Get listener identified by (ip:port)
			
			#current_job['process'].stdin.writelines(str(info))
			if(current_job['status']=='running'):
				current_job['process'].stdin.write(str(info)+"\n")
			#current_job['process'].write(info);
		except Exception as e:
			print ("ERROR writing to process: "+str(e));
		
		

	def remove_listener(self, ip, port, job_id):
		'''
		Description:
		* n4d method
		* Removes listener identified by an ip and a port to a job object identified by its id
		
		How it Works:
		* Searches which job has certain job_id (if specified) and removes it
		* If job_id is not specified, get it from ip:port
		
		Last update:
		    * 6/02/2014: Added Functionality
		    * 2/04/2014: Added checking for job_id and close socket
		'''
		
			
		from operator import itemgetter
		try:
			# If job_id is None, search job_ib by ip and port
			tuple_ip_port = (str(ip),str(port))
			if job_id == None:
				job_id = self.global_listeners[tuple_ip_port]
			# Get job identified by job_id
			print self.joblist
			print tuple_ip_port
			print jobid
			current_job_index=map(itemgetter('job_id'), self.joblist).index(job_id)
			current_job=self.joblist[current_job_index]
			# Get listener identified by (ip:port)
			current_listener_index=map(itemgetter('ip','port'), current_job['listeners']).index((ip,int (port, base=10)))

			# Close port and remove listener to current_job
			current_job['listeners'][current_listener_index]['socket'].close()
			current_job['listeners'].remove(current_job['listeners'][current_listener_index])
			#remove listener reference
			self.global_listeners.pop(tuple_ip_port)
			return True
			
		except Exception as e:
			print ("[LmdServer] remove_listener Exception "+str(e))
			return False
		pass
		
	
	def cancel_job(self, ip, port, job_id):
		'''
		Description:
		* n4d method
		*
		
		TO DO ...		
		Same functionality that remove_listener and in addition, kills process identified by job
		
		'''
		# Remove listener
		from operator import itemgetter
		try:
			# If job_id is None, search job_ib by ip and port
			tuple_ip_port = (str(ip),str(port))
			print (tuple_ip_port)
			if job_id == None:
				print self.global_listeners
				job_id = self.global_listeners[tuple_ip_port]
				print str(job_id)
				
			# Get job identified by job_id
			current_job_index=map(itemgetter('job_id'), self.joblist).index(job_id)
			print current_job_index
			current_job=self.joblist[current_job_index]
			print current_job
			# Get listener identified by (ip:port)
			try:
				current_listener_index=map(itemgetter('ip','port'), current_job['listeners']).index((ip,int (port, base=10)))
				print current_listener_index
			except:
				#print "*** jobid: ***"
				#print port
				print "*** port: ***"
				print port
				print "*** current_job: ***"
				print current_job['listeners']
				print "*** joblist: ***"
				print self.getJobList();
				current_listener_index=None
				for listener in current_job['listeners']:
					self.remove_listener(str(ip),str(port), job_id);

			# Kill process (only addition to remove_listener)
			os.killpg(current_job['process'].pid,signal.SIGKILL)
			
			# Removes target
			print "Removing target "+ str (current_job['target']) 
			r=objects['LmdImageManager'].deleteImage(current_job['target']);
			print str(r);
			print "Removied target"
			
			current_job['status']='broken'
			
			if current_listener_index!=None:
				# Close port and remove listener to current_job
				current_job['listeners'][current_listener_index]['socket'].close()
				current_job['listeners'].remove(current_job['listeners'][current_listener_index])
				#remove listener reference
				self.global_listeners.pop(tuple_ip_port)
			
			return True
			
		except Exception as e:
			print ("[LmdServer] cancel_job Exception "+str(e))
			return False
		pass

		
		
		
		
	
	def getJobList(self):
		'''
		Description:
		* N4D Method
		* Return JSON with the job list
		'''
		#import urllib
		
		#ret= urllib.quote(str(self.joblist)[1:-1])
		#ret= (str(self.joblist)[1:-1]).replace("'", "\"");
		#ret= (str(self.joblist)).replace("'", "\"");
		'''ret=ret.replace("<", "\"");
		ret=ret.replace(">", "\"");'''
		ret='[';
		count=0;
		for job in self.joblist:
			if (count>0):
				ret=ret+','
			ret=ret+'{"job_id":"'+str(job['job_id'])+'"'
			ret=ret+', "srv_ip":"'+str(job['srv_ip'])+'"'			
			ret=ret+', "status":"'+str(job['status'])+'"'
			ret=ret+', "msg":"'+str(job['msg'])+'"'
			ret=ret+', "target":"'+str(job['target'])+'"'
			ret=ret+', "command":"'+str(job['command'])+'"'
			ret=ret+', "started_by":"'+str(job['started_by'])+'"}'
			count=count+1
			#print "*********************"
			#print "Local listeners"
			#print job['listeners']
			#print "*********************"
			
			
		
		ret=ret+']'
		#print (ret)
		#print "*********************"
		#print "globals listeners"
		#print self.global_listeners
		#print "*********************"
		return str(ret)
		
	def Multicast(self):
		'''
		Description:
		* Internam method
		* Multicast the output of all processes to its listeners
		
		How it works:
		* Traverses the list of jobs and write its output to all its listeners
		
		* Last Update: 13/02/2014
		'''
		try:
			while len(self.global_listeners) > 0 :
				counter = 0
				#print "joblist",self.joblist
				#print "global_listeners",self.global_listeners
				for job in self.joblist:
					if True : #job['status'] != "finished":
						counter += 1
						try:
							if not self.thread_jobs.has_key(job['job_id']):
								self.thread_jobs[job['job_id']] = threading.Thread(target=self.send_info_by_socket, args=(job,))
								self.thread_jobs[job['job_id']].daemon = True
								self.thread_jobs[job['job_id']].start()
						except Exception as e:
							print e
				if counter == 0:
					break
				time.sleep(1)
		except Exception as e:
			print "[LmdServer] EXCEPTION in Multicast: "+str(e)
			
	def send_info_by_socket(self,job):
		try:
			if not os.path.exists(job['filepipe']):
				return False
			pipe = open(job['filepipe'],'r')
			pipe.seek(job['seek'],0)
			try:
				line = pipe.readline()
				while (line and len(self.global_listeners)>0):
					for listener in job['listeners']:
						if(listener['socket']!=None):
							try:
								listener['socket'].send(line)
							except Exception as e:
								print "[LmdServer] EXCEPTION in Multicast internal loop: "+str(e)
							continue
					line=pipe.readline()
					job['seek'] = pipe.tell()
			except Exception as e:
				print "[LMDServer] Exception wghile reading pipe "+str(e)
				pass
			
			if self.thread_jobs.has_key(job['job_id']):
				self.thread_jobs.pop(job['job_id'])
				
		except Exception as e:
				print "[LMDServer] Exception wghile reading pipe "+str(e)
				pass
	def getLastJobId(self):
		return self.last_job_id

	
	def getJobStatus(self, jobid):
		for i in self.joblist:
			if i['job_id']==jobid:
				return {"status": True, "msg": str(i['status'])}
		
		return {"status": False, "msg": 'bad luck, guy'}

	def check_lmd_status(self):
		'''
		Description:
		* N4D Method
		* check status of lmd
		'''
		import os.path
		if (os.path.isfile("/tmp/.lmd-editing-chroot")):
			return {"status": True, "lmd_status": 'lmd-editing-chroot'}
		else:
			return {"status": True, "lmd_status": 'lmd-chroot-available'}
		
	def chek_minimal_client(self):
		if (os.path.isfile("/etc/ltsp/images/mini-light-client.json") and os.path.isfile("/opt/ltsp/images/mini-light-client.img") ):
			return {"status": True}
		else:
			return {"status": False}
		

	def get_versions_13(self):
		'''
		Checks if there is any old image un system (13.06)
		'''
		
		ltsp_dir="/opt/ltsp/"
		nbd_dir="/etc/nbd-server/conf.d/"
		
		ret_list=[];

		#OBSOLETE REMOVED METHOD
		#RETURN EMPTY LIST TO LMD-GUI TO AVOID LLIUREX 13 WARNING
		#for name in os.listdir(ltsp_dir):
		#	dir=ltsp_dir+name
		#	
		#	needs_update=False
		#	if (name!='images' and os.path.isdir(dir)):
		#		proc = subprocess.Popen(["chroot "+dir +" lliurex-version"], stdout=subprocess.PIPE, shell=True)
		#		(out, err) = proc.communicate()
		#		
		#		if ((not "16.05" in out) and out!="" ): 
		#			# check nbd...
		#			for nbd_descriptor in os.listdir(nbd_dir):
		#				if (self.line_in_file("["+ltsp_dir+name+"]", nbd_dir+nbd_descriptor)):
		#					needs_update=True
		#	if (needs_update==True):
		#		ret_list.append(name)
		#
		return ret_list

	def line_in_file(self, line_to_find, filename):
		'''
		Aux function: ask for if certain line is contained in a file
		'''
		fd = open(filename, 'r')
		lines = fd.readlines()
		fd.close()
		for line in lines:
			if str(line_to_find) in line:
				return True
				
		return False
	
	def update_images(self, ip, port, imagelist, srv_ip):
		
		try:
		
			imagelist_string = " ".join(imagelist)
			##print imagelist," is ", type(imagelist)
			### n4d-client -c LmdServer -m update_images -u joamuran -p lliurex -a  2 3 "['pajarito', 'perro']"
			
			# Prepare and launch command
			command="/usr/share/lmd-scripts/lmd-upgrade-images.sh "+imagelist_string;
			result=self.do_command(ip, port, command, srv_ip, None)
			
			# Add image description
			#imagelist=imagelist_string.replace("[","").replace("]","").replace(" ","").replace("'", "").replace(","," ");
			#print imagelist_string;
			print imagelist;
			#print imagelist.split(" ");
			for i in imagelist:
				metadata = {'id':i,
					'name' : i,
					'desc' : 'Upgraded from Lliurex 13.06',
					'template' : 'none',
					'ltsp_fatclient': 'undefined',
					'ldm_session': 'default',
					'fat_ram_threshold':'default',
					'lmd_extra_params':''}
				
				metadata_string = unicode(json.dumps(metadata,indent=4,encoding="utf-8",ensure_ascii=False)).encode("utf-8")
				
				objects['LmdImageManager'].setImage(i,metadata_string)
				self.set_default_boot(imgid)
			return {"status": True}
		except Exception as e:
			print "Exception", e
			return {"status": False, 'msg':str(e)}


	def delete_images(self,imagelist):
		
		try:
		
			for img in imagelist:
				print img
				path_chroot=os.path.join("/opt/ltsp/", img)
				path_tftpboot=os.path.join("/var/lib/tftpboot/ltsp/", img)
				path_img=os.path.join("/opt/ltsp/images/", img+".img")
				path_nbd=os.path.join("/etc/nbd-server/conf.d/", "ltsp_"+img+".conf")
				path_etc_json=os.path.join("/etc/ltsp/images/"+img+".json")
				if (os.path.exists(path_chroot)):
					shutil.rmtree(path_chroot)
					#print "deleting: ",path_chroot
				if (os.path.exists(path_tftpboot)):
					shutil.rmtree(path_tftpboot)
				if (os.path.exists(path_img)):
					#print "deleting: ",path_img
					shutil.rmtree(path_img);
				if (os.path.exists(path_nbd)):
					#print "deleting: ",path_nbd
					shutil.rmtree(path_nbd);
				if (os.path.exists(path_etc_json)):
					shutil.rmtree(path_etc_json)
				
			return {"status": True, 'msg':'Finished'}

		except Exception as e:
			print "Exception", e
			return {"status": False, 'msg':str(e)}

	def LmdServerVersion(self):
		info=subprocess.check_output(["apt-cache","policy","lmd-server"])
		lines=str(info).split('\n')
		version=lines[1][13:]
		return (version)

	def check_update_images(self):
		list_dirs = [ os.path.join(self.ltsp_path,x) for x in os.listdir(self.ltsp_path) if os.path.isdir(os.path.join(self.ltsp_path,x)) ]
		list_need_update = []
		for chroot in list_dirs:
			available_file = os.path.join(chroot,'var','lib','dpkg','available')
			if os.path.exists(available_file):
				available_fd = open(available_file,'r')
				available_content = available_fd.readlines()
				try:
					pos = available_content.index('Package: lmd-client\n')
					version = None
					for i in range(pos + 1 ,len(available_content)):
						if available_content[i] == '\n':
							break
						if available_content[i].startswith('Version'):
							version = available_content[i][8:].strip()
					if version != None :
						apt_pkg.init()
						if apt_pkg.version_compare(version,'0.15') < 0 :
							list_need_update.append(os.path.basename(chroot))
				except Exception as e:
					pass
		if len(list_need_update) > 0:
			return [True,list_need_update]
		else:
			return [False,[]]
			
		
		
