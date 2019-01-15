import json
import StringIO
import os
import os.path
import ConfigParser
import shlex
import urllib2

class LmdTemplateManager:
	
		
	def __init__(self):
		self.templatepath="/etc/ltsp/templates"

		
		pass
	#def __init__
	
	
	def testMirror(self, mirror, dist):
		'''
		Tests if file Release exists inside mirror in template
		'''
		#template=self.getTemplate(templatefile)
		
		#json_template=json.loads(template)['default']
		#mirror=json_template['mirror']
		#dist=json_template['dist']
		
		release_file=str(mirror+"/dists/"+dist+"/Release")
		
		if release_file[0:4]=='file':
			if os.path.isfile(release_file[7:]):
				return True
			else:
				return False
		else:
			try:
				content = urllib2.urlopen(release_file).read()
			except Exception as e:
				return False

			return True
	
	
	def getTemplateList(self):
		'''
		Reads the file list of templates from /etc/ltsp/templates
		Returna a JSON List.
		'''
		templatelist=[]
		
		for i in os.listdir(self.templatepath):
			if '.conf' in i:
				templatelist.append(str(i))
				
		return json.dumps(templatelist)
			
			
	# END def GetListTemplates(self)

	def deleteTemplate(self, filename):
		try:
			fullfilename=os.path.join("/etc/ltsp/templates", filename)
			print "Deleting: ", fullfilename
			if(os.path.exists(fullfilename)):
				print "exists"
				os.remove(fullfilename)
				return True
			return False
		except Exception as e:
			return False
		


	def getTemplate(self, template):
		'''
		Reads the file template from /etc/ltsp/templates
		Returna a JSON string with the config options
		'''
		try:
			#template=self.getTemplate(templatefile)
		
		#json_template=json.loads(template)['default']
		#mirror=json_template['mirror']
		#dist=json_template['dist']
			
			
			config = StringIO.StringIO()
			config.write('[meta_inf]\n')
			config.write('name="'+template+'"\n')
			
			# Check if mirror is available
			#available=self.testMirrorTemplate(template)
			#config.write('available="'+str(available)+'"\n')
			
			
			config.write('[default]\n')
			config.write(open(str(self.templatepath)+"/"+str(template)).read())
			config.seek(0, os.SEEK_SET)
			cp = ConfigParser.ConfigParser()
			cp.readfp(config)
			aux = cp._sections
			for x in aux.keys():
				for y in aux[x]:
					if len(aux[x][y])>0 and aux[x][y][0] == '"' and aux[x][y][-1] == '"':
						aux[x][y] = aux[x][y][1:-1]

			# Checking Mirror
			json_template=aux['default']
			mirror=json_template['mirror']
			dist=json_template['dist']
			print "Mirror is"+mirror
			print "Dist is: "+dist			
			aux["meta_inf"]["available"]=self.testMirror(mirror, dist)

			return json.dumps(aux,encoding="utf-8",ensure_ascii=False)
			#return json.dumps(cp.items('default'));
			
			
		except Exception as e:
			return "Exception: "+str(e)
		# END def getListTemplate(self, template)
		
		
	def checkTemplateExists(self, template):
		if(os.path.isfile(str(self.templatepath)+"/"+str(template))):
			return "True"
		else:
			return "False"
		
	
	def setTemplate(self, template, config):
		'''
		Writes in /etc/ltsp/templates the config file "template" with
		the "config" (JSON format) content.
		'''
		try:
			print "config is:", config;
			print type(config)
			f = open(str(self.templatepath)+"/"+str(template), 'w')
			f.write("# LMD Customuzation file for LTSP\n\n")
			
			conf=json.loads(config)
						
			print conf['default']
			print "is...",type(conf['default'])
			print len(conf['default'])
			i=0
			for (key, value) in conf['default'].items():
				if (key.upper()=="__NAME__"):
					continue
				# Removing " from value and ignore comments
				f.write("{0}=\"{1}\"\n".format(key.upper(), value.replace('"', '').split("#")[0]))
			f.close()
			return True
		except Exception as e:
			
			print "Exception: "+str(e)
			return "Exception: "+str(e)
	
	# def setTemplate(self, template, config)
