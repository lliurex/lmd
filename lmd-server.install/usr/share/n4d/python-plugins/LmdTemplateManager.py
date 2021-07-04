from pathlib import Path
from io import StringIO
import json
from configparser import ConfigParser

import json
import shlex
from urllib.request import urlopen

import n4d.responses

class LmdTemplateManager:
   
    CONFIG_FAILED = -40
    FILE_NOT_EXISTS = -50
   

    def __init__(self):
        self.templatepath = Path("/etc/ltsp/templates")

    #def __init__
        
        
    def testMirror(self, mirror, dist):
        '''
        Tests if file Release exists inside mirror in template
        '''
        
        release_file=str(mirror+"/dists/"+dist+"/Release")
        result = True 
        if release_file[0:4]=='file':
            if not os.path.isfile(release_file[7:]):
                result = False
        else:
            try:
                content = urlopen(release_file).read()
            except Exception as e:
                result = False

        return n4d.responses.build_successful_call_response(result)
    
    
    def getTemplateList(self):
        '''
        Reads the file list of templates from /etc/ltsp/templates
        Returna a JSON List.
        '''
        templatelist=[]
        
        for i in self.templatepath.iterdir():
            if i.suffix == ".conf" :
                templatelist.append(str(i.name))
                    
        return n4d.responses.build_successful_call_response(json.dumps(templatelist))
                
                    
        # END def GetListTemplates(self)

    def deleteTemplate(self, filename):
        result = False
        if self.templatepath.joinpath(filename).exists():
            self.templatepath.joinpath(filename).unlink()
            result = True
        return n4d.responses.build_successful_call_response(result)

    def checkTemplateExists(self, template):
        return n4d.responses.build_successful_call_response(self.templatepath.joinpath(template).exists())

    def setTemplate(self, template, config):
        '''
        Writes in /etc/ltsp/templates the config file "template" with
        the "config" (JSON format) content.
        '''
        with self.templatepath.joinpath(template).open("w") as fd:
            fd.write("# LMD Customuzation file for LTSP\n\n")

            conf = json.loads(config)
                                
            for (key, value) in list(conf['default'].items()):
                if (key.upper()=="__NAME__"):
                    continue
            # Removing " from value and ignore comments
            fd.write("{0}=\"{1}\"\n".format(key.upper(), value.replace('"', '').split("#")[0]))
        return n4d.responses.build_successful_call_response(True)

    # def setTemplate(self, template, config)

    def getTemplate(self, template):
        '''
        Reads the file template from /etc/ltsp/templates
        Returna a JSON string with the config options
        '''

        if not self.templatepath.joinpath(template).exists():
            return n4d.responses.build_failed_call_response(LmdTemplateManager.FILE_NOT_EXISTS)

        config = StringIO.StringIO()
        config.write('[meta_inf]\n')
        config.write('name="'+template+'"\n')
        config.write('[default]\n')
        
        with self.templatepath.joinpath(template).open("r") as fd:
            config.write(fd.read())
        config.seek(0, os.SEEK_SET)
        cp = ConfigParser()

        try:
            cp.readfp(config)
        except Exception as e:
            return n4d.responses.build_failed_call_response(LmdTemplateManager.CONFIG_FAILED)
        
        aux = cp._sections
        for x in list(aux.keys()):
            for y in aux[x]:
                if len(aux[x][y])>0 and aux[x][y][0] == '"' and aux[x][y][-1] == '"':
                    aux[x][y] = aux[x][y][1:-1]

        # Checking Mirror

        json_template = aux['default']
        mirror = json_template['mirror']
        dist = json_template['dist']
        result = self.testMirror(mirror, dist)
        if result['status'] == n4d.responses.CALL_SUCCESSFUL :
            aux["meta_inf"]["available"] = result["result"]

        return n4d.responses.build_successful_call_response(json.dumps(aux,encoding="utf-8",ensure_ascii=False))
        
        # END def getListTemplate(self, template)
        
