
function Llx_ltsconf(){
  this.helpers=null;
  this.ltsconf=null;
  this.swapSize="128";
}

Llx_ltsconf.prototype._=function _(text){
  return ( i18n.gettext("lliurex-ltsp", text));
}


Llx_ltsconf.prototype.init=function init(){
    var self=this; 
    // Reading all possible options for lts.conf in dictionary
     
    $.getJSON('modules/lliurex-ltsp/src/js/llx_ltsconf_fields_actual.json?_=' + new Date().getTime(),function (data){
      self.helpers=data;
      console.log(self.helpers);
      //self.readNBDSwapSize(self.readLTSConf());
      self.readNBDSwapSize(function(){
        self.readLTSConf();
        });
    });    
};

Llx_ltsconf.prototype.getHelpForItem=function getHelpForItem(item){
  var self=this;
  var ret=$.grep(self.helpers , function(element){ return element.name == item; });
  if (ret.length>0) return self._(ret[0].help);
  else return self._("unknown");
  
}


Llx_ltsconf.prototype.createFormItem=function createFormItem(data, tag){
  var self=this;
  
      var row=$(document.createElement("div")).addClass("col-md-12").addClass("ltsconfRowOption").attr("id", "ltsconf_"+tag);
        
        if (data.toLowerCase()=="true" || data.toLowerCase()=="false"){
          item=Utils.formFactory.createCheckbox({"id":"ltsconf_option_"+tag.toString(),
                                                "label":tag,
                                                "default":data,
                                                "help":self.getHelpForItem(tag)}, true);
        } else {
          item=Utils.formFactory.createText({"id":"ltsconf_option_"+tag.toString(),
                                        "label": tag,
                                        "help":self.getHelpForItem(tag),
                                        "value":data}, true);
        }
        
        // Check for NBD_SWAP
        var nbd_item=null;
        if(tag=="NBD_SWAP"){
          
          //console.log(tag);
          //console.log(data);
          //console.log(self.swapSize);
          nbd_item=Utils.formFactory.createSelect({"id":"lts_nbd_swap_size",
                               "label":self._("NBD.Swap.Size"),
                               "help":self._("NBD.Swap.Size.Desc"),
                               "default":self.swapSize,
                               "options":[
                                {"value":"128", "label":"128 Mb"},
                                {"value":"256", "label":"256 Mb"},
                                {"value":"512", "label":"512 Mb"},
                                {"value":"1024", "label":"1024 Mb"}, ]}, true);
          
        //console.log("**********");
        //console.log(nbd_item);
        }
        
        
        
        //rmBt=$(document.createElement("div")).addClass("floatingDeleteButton").attr("title", self._("ltsconf.delete.option")).attr("target", "ltsconf_"+i);
        rmBt=$(document.createElement("div")).addClass("floatingDeleteButton").attr("title", self._("ltsconf.delete.option")).attr("target", "ltsconf_"+tag);
        $(row).append(item, rmBt);
        if (nbd_item!==null) $(row).append(nbd_item);
  
  return row;
}


Llx_ltsconf.prototype.readLTSConf=function readLTSConf(){
  var self=this;
  $("#llx_ltsconf_bootoptions").empty();
  
  // Get lts.conf options
  
  var n4dClass="LmdBootManager";
  var n4dmethod = "getLtsConf";
  var credentials="";
  var argList=[];
         
  Utils.n4d(credentials,n4dClass,n4dmethod,argList,function(response){
      dades = JSON.parse(response);
      dades = dades.Default;
      var content=document.createElement("div");
      
      for (var i in dades){
        if (i=="__name__") continue;
        
        var row=self.createFormItem(dades[i], i);
        
        $(content).append(row);
        
      }
      
      
  
      $("#llx_ltsconf_bootoptions").append(content);
      $.material.init();
      
      $(".floatingDeleteButton").off("click");
      $(".floatingDeleteButton").on("click", function(){
        var itemToDelete="#"+$(this).attr("target");
        $(itemToDelete).css("background-color", "#ffeeee");
        $(itemToDelete).fadeOut(300, function(){
          $(itemToDelete).remove();
          });
        });
      
  },0);
 
};

Llx_ltsconf.prototype.readNBDSwapSize=function readNBDSwapSize(callback){
  var self=this;
  var n4dClass="LmdBootManager";
  var n4dmethod = "ReadNBDSwapSize";
  var argList=[];
  var credentials ="";
  
  Utils.n4d(credentials,n4dClass,n4dmethod,argList,function(response,status){
        if (typeof(response)=="string") {
          self.swapSize=response;
          //alert(self.swapSize);
          callback();
        }
    },0); // Syncronous
}

Llx_ltsconf.prototype.add_new_option= function add_new_option(){
  var self=this;
  
  var content="";
  for (i in self.helpers){
    if ($("#ltsconf_option_"+self.helpers[i].name).length==0){
      // If not exists option in configuration, let's show it as an option to add
    
    var optionRow=$(document.createElement("div")).addClass("ltsOptionsRow col-md-12").attr("id","ltsconf_to_add_"+self.helpers[i].name).attr("select", "false").attr("value", self.helpers[i].default);
    $(optionRow).append($(document.createElement("div")).attr("target","ltsconf_to_add_body_"+self.helpers[i].name).addClass("ltsOptionsRowHeader col-md-12").html(self.helpers[i].name));
    
    //var optionRowBody=$(document.createElement("div")).addClass("ltsOptionsRowBody");
    var optionRowBody=$(document.createElement("div")).addClass("ltsOptionsRowBody col-md-11 col-md-offset-1").attr("id","ltsconf_to_add_body_"+self.helpers[i].name);
    var optionRowBodyRow=$(document.createElement("div")).addClass("col-md-12").css("border-bottom","1px solid #aaaaaa");
    $(optionRowBodyRow).append($(document.createElement("div")).addClass("col-md-3 optionRowCol").html(self._("ltsconf_helper_type")));
    $(optionRowBodyRow).append($(document.createElement("div")).addClass("col-md-9 optionRowCol").html(self.helpers[i].type));
    $(optionRowBody).append(optionRowBodyRow);
    $(optionRow).append(optionRowBody);
    
    optionRowBodyRow=$(document.createElement("div")).addClass("col-md-12").css("border-bottom","1px solid #aaaaaa");
    $(optionRowBodyRow).append($(document.createElement("div")).addClass("col-md-3 optionRowCol").html(self._("ltsconf_helper_default_value")));
    $(optionRowBodyRow).append($(document.createElement("div")).addClass("col-md-9 optionRowCol").html(self.helpers[i].default));
    $(optionRowBody).append(optionRowBodyRow);
    $(optionRow).append(optionRowBody);
    
    optionRowBodyRow=$(document.createElement("div")).addClass("col-md-12").css("border-bottom","1px solid #aaaaaa");
    $(optionRowBodyRow).append($(document.createElement("div")).addClass("col-md-3 optionRowCol").html(self._("ltsconf_helper_description")));
    $(optionRowBodyRow).append($(document.createElement("div")).addClass("col-md-9 optionRowCol").html(self.helpers[i].help));
    $(optionRowBody).append(optionRowBodyRow);
    $(optionRow).append(optionRowBody);
    
       
    
    /*content+=self.helpers[i].name+"<br/>";
    content+=self.helpers[i].type+"<br/>";
    content+=self.helpers[i].default+"<br/>";
    content+=self.helpers[i].help+"<br/>";*/
    
    
    content+=$(optionRow).prop("outerHTML");
    }
    
  }
  
  
        
      var dialog=bootbox.dialog({
        message: content,
        title: self._("lts_conf_available_options"),
        buttons:{
            "Apply":{
            label:self._("lts_add_option"),
            className: "btn-success btn-raised",
                            callback: function (){
                              console.log($(".ltsOptionsRow[select='true']"));
                              var item=$(".ltsOptionsRow[select=true]").attr("id").replace("ltsconf_to_add_", "");
                              var value=$(".ltsOptionsRow[select=true]").attr("value");
                              
                              var item=self.createFormItem(value, item);
                              
                              console.log(item);
                              $("#llx_ltsconf_bootoptions").first().append(item);
                              $.material.init();
                              //alert("Adding "+item+" with "+value);
                              $(".floatingDeleteButton").off("click");
                              $(".floatingDeleteButton").on("click", function(){
                                var itemToDelete="#"+$(this).attr("target");
                                $(itemToDelete).css("background-color", "#ffeeee");
                                $(itemToDelete).fadeOut(300, function(){
                                  $(itemToDelete).remove();
                                  });
                                });
                              
                              
                            }
                        },
            cancel:{
                    label:self._("lmd.cancel"),
                    className: "btn-cancel btn-raised" }
                }
            });
                
             
        $.material.init();
        dialog.modal("show");
        $(".ltsOptionsRowHeader").off("click");
        $(".ltsOptionsRowHeader").on("click", function(){
          $(".ltsOptionsRow").css("background", "#ffffff").attr("select", "false");
          $(".ltsOptionsRowBody").css("display", "none");
          
          $(this).parent().css("background", "#eeeeee").attr("select", "true");
          $("#"+$(this).attr("target")).css("display", "block");
          
  
          });
  }

Llx_ltsconf.prototype.add_arbitrary_option= function add_arbitrary_option(){
    var self=this;
    
    var ltsconf_add_option_title=self._("ltsconf_add_option_title");
    var ltsconf_add_option_button=self._("ltsconf_add_option_button");
    
    
    var form="<label for='ltsconf_new_param_name'>"+self._("ltsconf.new.param.name")+"</label><input required type='text' name='ltsconf_new_param_name' class='form-control is-empty' id='ltsconf_new_param_name' value=''>";
    form+="<label for='ltsconf_new_param_value'>"+self._("ltsconf.new.param.value")+"</label><input required type='text' name='ltsconf_new_param_value' class='form-control is-empty' id='ltsconf_new_param_value' value=''>";
    
    var dialog=bootbox.dialog({
        message: form,
        title: ltsconf_add_option_title,
        buttons:{
            "Ok":{
                label:ltsconf_add_option_button,
                className: "btn-success btn-raised",
                callback: function (){
                var newLabel=$('#ltsconf_new_param_name').val();
                var newValue=$('#ltsconf_new_param_value').val();
                if (newLabel==="" || newValue==="" ) {
                    if (newLabel==="" ) $('#ltsconf_new_param_name').focus();
                    else $('#ltsconf_new_param_value').focus();
                    //alert(self._("ltsconf_shoud_not_be_null"));
                  return false;
                    } else {
                      //alert(newLabel + " " +newDesc);
                      var item=self.createFormItem(newValue, newLabel);
                      $("#llx_ltsconf_bootoptions").first().append(item);
                      
                      $(".floatingDeleteButton").off("click");
                      $(".floatingDeleteButton").on("click", function(){
                        var itemToDelete="#"+$(this).attr("target");
                        $(itemToDelete).css("background-color", "#ffeeee");
                        $(itemToDelete).fadeOut(300, function(){
                          $(itemToDelete).remove();
                          });
                        });
  
                      
                       }
                    }
                },
            cancel:{
                label:self._("lmd.cancel"),
                className: "btn-cancel btn-raised"
                }
                }
            });
            
            $.material.init();
            dialog.modal("show");
            
}


Llx_ltsconf.prototype.saveOptions= function saveOptions(){
  var self=this;
  
  
  // Saving NBD SWAP
  var nbd_swap_size=$("#lts_nbd_swap_size").val();
  if (typeof(nbd_swap_size)!=="undefined") {
    var credentials = [sessionStorage.username, sessionStorage.password];
    var n4dClass="LmdBootManager";
    var n4dmethod = "SaveNBDSwapSize";
    var argList=[nbd_swap_size];
    Utils.n4d(credentials,n4dClass,n4dmethod,argList,function(response){
      if (response){
        message=self._("ltsconf.msg.swap.saved");
        Utils.msg(message, MSG_INFO);
      } else {
        message=self._("ltsconf.msg.swap.error")+response.msg;
        Utils.msg(message, MSG_ERROR);
      }
      
    },0);
      
  }
  
  // SAVING OPTIONS
  
  var resJSONs ='{"Default":{\"__name__\":"Default",';
  
  var list=$("input[id^=ltsconf_option_]");
  for (var i=0; i<list.length;i++){
    console.log(list[i]);
      var name=$(list[i]).attr("id").replace("ltsconf_option_", "");
      console.log(name);
      var val;
      if ($(list[i]).attr("type")=="checkbox")
      val=$(list[i]).prop("checked");
      else val=$(list[i]).val();    
      resJSONs+= '"' +  name +'"' + ':"' + val.toString().replace(/\"/gi," ") + '"';
      if (i!=(list.length-1)) resJSONs+=",";
  } // for
  
  resJSONs += "}}";
  
  var credentials=[sessionStorage.username , sessionStorage.password];
  var n4dclass="LmdBootManager";
  var n4dmethod="setLtsConf";
  var arglist=[];
  arglist.push(resJSONs);
  
  try {
    Utils.n4d(credentials, n4dclass, n4dmethod, arglist, function(response){
        if (response){
          message=self._("ltsconf.msg.saved");
          Utils.msg(message, MSG_INFO);
        } else {
          message=self._("ltsconf.msg.error")+response.msg;
          Utils.msg(message, MSG_ERROR);
        }
      },0);
    }
    catch (error){
     var message=("Exception: ")+error;
     Utils.msg(message, MSG_ERROR);
    }
}
  

Llx_ltsconf.prototype.bindEvents= function bindEvents(){
  var self=this;
  $("#llx-ltsconf").on("componentShown", function(e, args){
  //Lliurex Instance
  self.init();
  });

  
  $("#ltsp_ltsconf_save_options_bt").off("click");
  $("#ltsp_ltsconf_save_options_bt").on("click", function(){
     self.saveOptions();
     
  });
  
  $("#ltsp_ltsconf_add_option_bt").off("click");
  $("#ltsp_ltsconf_add_option_bt").on("click", function(){
    self.add_new_option();
  });
  
  $("#ltsp_ltsconf_add_option_arbitrary_bt").off("click");
  $("#ltsp_ltsconf_add_option_arbitrary_bt").on("click", function(){
    self.add_arbitrary_option();
  });
  
  


  
  
  
}
