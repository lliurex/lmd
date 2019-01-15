// Class for build Buttons

function BannerButton(){
	this.id='';
	this.name = '';
	this.description='';
	this.background='';
	this.status='';
	self = this;
	
	
	this.createButton=function createButton(id, name, desc, background, status){
		this.id=id;
		this.description=desc;
		this.name=name;
		///if (background==="") alert("*"+typeof(background)+"*");
	
		if (typeof(background)!=="undefined" && background !== null && background !== "") {
			this.background = background;
		} else this.background = 'icon_unknown.png';
		
		//this.background=background;
		this.status=status;
		
		// Think how to manage error, rebuild...
		
	};
	
	
	this.renderMe = function renderMe(divtoappend,listbinds){
		/*listbinds = {
			edit: function
			delete: function
			listen: function
		}

		 */
		//Add button to create new image
		var content;
		
		if (this.status ==='enabled'||this.status==='edited' || this.status=="enabled-non-editable"){
				
			//Create element
			var staticcontent = $(document.createElement('div')).addClass('desc').html(this.description);
			var slide = $(document.createElement('div')).addClass('slide');
			name_to_write=this.name;
			
			if (this.status=='edited') name_to_write=name_to_write+i18n.gettext("buttonsuite.needsupdate");
			//content = $(document.createElement('div')).attr('statusname',this.status).html(name_to_write);
			content = $(document.createElement('div')).attr('statusname',this.status);
			
			$(content).css("background-image", "url(css/icons/"+this.background+")");
			//$(content).css("background-color", "#ff0000");
			
			/*background-image: url('icons/llx-client16.png') !important;*/
			content.append($(document.createElement('div')).html(name_to_write).append(staticcontent));
			//content.append(staticcontent);
			
			
			var buttonPannel=$(document.createElement('div')).addClass("buttonPanel");
			
			// Customize Client
			var edit_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.customize'));
			edit_button.addClass("green template_button_panel");
			
			// Parameters
			var edit_boot_options = $(document.createElement('button')).html(i18n.gettext('buttonsuite.parameters'));
			edit_boot_options.addClass("green template_button_panel");			
			
			// Delete Button
			var delete_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.delete'));
			delete_button.addClass("red template_button_panel");
			
			// Refresh button
			var refresh_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.refresh'));
			refresh_button.addClass("orange template_button_panel");
						
			// Export
			var export_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.export'));
			export_button.addClass("lmdblue template_button_panel");
			
			// If image is non editable, remove buttons
			if (this.status=="enabled-non-editable") {
				edit_button=undefined;
				edit_boot_options=undefined;
				refresh_button=undefined;
				export_button=undefined;
			}			
			
			// Top button bar, for edit template meta-info and clean refresh button
			//slide.append(staticcontent,edit_button,refresh_button,delete_button, export_button);
			//slide.append(edit_button,refresh_button,delete_button, export_button);
			buttonPannel.append(edit_button,edit_boot_options,refresh_button,delete_button, export_button);
			slide.append(buttonPannel);
			
			content.append(slide);
	
			//var edit_image_info=$(document.createElement('i')).addClass('icon-editalt').addClass('top_icon_bt').attr('title', i18n.gettext('buttonsuite.editimagedescription'));
			var edit_image_info=$(document.createElement('div')).css("background-image","url(css/icons/icon_edit.png)").addClass('top_icon_bt').attr('title', i18n.gettext('buttonsuite.editimagedescription'));
			var top_bt=$(document.createElement('div')).addClass('top_button_bar');
			top_bt.append(edit_image_info);
						
			var set_default_boot=$(document.createElement('div')).css("background-image","url(css/icons/icon_default_boot_unselected.png)").addClass('top_icon_bt').attr('title', i18n.gettext('buttonsuite.set_default_boot')).addClass("image_boot_star").attr("id",this.id);
			if (this.id!="armhf") top_bt.append(set_default_boot);

			
			if (this.status=='edited'){
				//var unset_editable_bt=$(document.createElement('i')).addClass('icon-remove-sign').addClass('top_icon_bt').attr('title', i18n.gettext('buttonsuite.unmarkneedupdate'));
				var unset_editable_bt=$(document.createElement('div')).css("background-image","url(css/icons/icon_delete.png)").addClass('top_icon_bt').attr('title', i18n.gettext('buttonsuite.unmarkneedupdate'));
				top_bt.append(unset_editable_bt);
			}
			content.append(top_bt);
			
			// Bind all buttons (if are available)
			if (typeof(edit_button)!="undefined") edit_button.bind('click',listbinds['edit']['args'],function(event){listbinds['edit']['function'](event)});
			if (typeof(edit_image_info)!="undefined") edit_image_info.bind('click',listbinds['edit_meta_info']['args'],function(event){listbinds['edit_meta_info']['function'](event)});
			if (typeof(set_default_boot)!="undefined") set_default_boot.bind('click',listbinds['set_default_boot']['args'],function(event){listbinds['set_default_boot']['function'](event)});
			if (typeof(edit_boot_options)!="undefined") edit_boot_options.bind('click',listbinds['edit_boot_options']['args'],function(event){listbinds['edit_boot_options']['function'](event)});
			if (typeof(delete_button)!="undefined") delete_button.bind('click',listbinds['delete']['args'],function(event){listbinds['delete']['function'](event)});
			if (typeof(refresh_button)!="undefined") refresh_button.bind('click',listbinds['refresh']['args'],function(event){listbinds['refresh']['function'](event)});
			if (typeof(export_button)!="undefined") export_button.bind('click',listbinds['export']['args'],function(event){listbinds['export']['function'](event)});
			
			// Bind top button bar
			//edit_image_info.bind('click',listbinds['edit_meta_info']['args'],function(event){listbinds['edit_meta_info']['function'](event)});
			
			if (unset_editable_bt) unset_editable_bt.bind('click',listbinds['unmark_refresh']['args'],function(event){listbinds['unmark_refresh']['function'](event)});			
			
			/*
			content += '<div><button>edit</button><button>delete</button></div>';
			staticcontent = "<div class='desc'>"+this.description+"</div>";
			slide = '<div class="slide">'+staticcontent+'\
					<button class="bt_edit">Editar</button> \
					<button class="bt_delete">Borrar</button><div>';
			content += "<div statusname='"+status+"'>" + slide + "</div>";
			*/
			// //content += "<div statusname='"+status+"'>" + staticcontent + slide + "</div>";
			
		}
		else if (this.status === 'running') {
			
			//Create element
			var staticcontent = $(document.createElement('div')).addClass('desc').html(this.description);
			var slide = $(document.createElement('div')).addClass('slide');
			content = $(document.createElement('div')).attr('statusname',this.status).html(this.name);
			
			var listen_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.listen')).addClass("lmdblue template_button_panel").attr("style","margin-left: 85px;");
			
			
			listen_button.bind('click',listbinds['listen']['args'],function(event){listbinds['listen']['function'](event)});
			
			content.append(staticcontent);
			slide.append(listen_button);
			content.append(slide);
			
			// Caldria vore com apanyar els divs i tal per a que es comportara tot bé
			// i decidir on posem la descripció (no recorde si canviarem el css per a les
			// descripcions per a que quadrara en el quadret de darrere, i per això el botó de
			// baix no es veu)
			
		}
		else if (this.status === 'disabled') {
			
			//Create element
			var staticcontent = $(document.createElement('div')).addClass('desc').html(this.description);
			var slide = $(document.createElement('div')).addClass('slide');
			content = $(document.createElement('div')).attr('statusname',this.status).html(this.name);
			// Background
			$(content).css("background", "repeating-linear-gradient(45deg, rgba(255,255,255,0.8), rgba(255,255,255,0.8) 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px), url(css/icons/"+this.background+")");
			
			
			
			var edit_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.edit'));
			var delete_button = $(document.createElement('button')).html(i18n.gettext('buttonsuite.delete'));
			
			//edit_button.bind('click',listbinds['edit'])
			//delete_button.bind('click',listbinds['delete'])
			
			slide.append(staticcontent,edit_button,delete_button);
			content.append(slide);
		}
		item = $(document.createElement('div')).addClass('ImageItem').attr('id','btimg_'+this.id);
		item.append(content);
		//item="<div class='ImageItem' id='btimg_"+this.id+"'>"+content+"</div>";

		elementdiv = $('#btimg_'+this.id);
		if (elementdiv.length === 0){
			$(divtoappend).append(item);
		}
		else{
			elementdiv.replaceWith(item);
		}
		// Binding buttons
		
		self.bindButton(this.id);
		
		// Setting awesome style
		$("button").button();
		/*$("button").addClass("blue template_button");*/
		
	};
	
	this.setStatus=function setStatus(status){
		this.status=status;
	}
	
	
	
	
	this.slide_txt = function slide_text(icon){
			$("#"+icon).find(".slide").stop().animate({height:'110px', 'margin-top':'20px', 'top':'0px'}, 400);
			$("#"+icon).find(".top_button_bar").css("display", "block");
	}

	this.unslide_txt = function unslide_txt(icon){
		$("#"+icon).find(".slide").stop().animate({'height':'0', 'margin-top':'110'},400);
		//$("#"+icon).find(".slide").stop().animate({'height':'0', 'margin-top':'110'},400, function(){
		//	$(this).removeAttr("style").addClass("slide");});
		$("#"+icon).find(".top_button_bar").css("display", "none");
	}

	this.bindButton = function bindButton(id){
		
		$("#btimg_"+id).bind("mouseover", function(event){
            event.stopImmediatePropagation();
			id=$(this).attr('id');
			self.slide_txt(id);
			}
		);
		
		$("#btimg_"+id).bind("mouseout", function(event){
			event.stopImmediatePropagation();
			id=$(this).attr('id');
			self.unslide_txt(id); }
		);
		/*
		$("#btimg_"+id).find(".bt_edit").bind("click", function(event){
			alert("clicked on edit for "+id);
			})
		
		$("#btimg_"+id).find(".bt_delete").bind("click", function(event){
			alert("clicked on delete for "+id);
			})
		*/
	}
	
	
	
	
}

function ButtonSuite(){
	this.addState = function addState(id,state,desc){
		staticcontent = '';
		slide = '';
		if (state == 'available') {
			staticcontent = "<div class='desc'>"+desc+"</div>";
			slide = '<div class="slide"><button>'+i18n.gettext('buttonsuite.edit')+'</button><button>'+i18n.gettext('buttonsuite.delete')+'</button><div>';
		}
		else if (state == 'locked') {
			staticcontent = "<div class='desc'>"+desc+"</div>";
			slide = '<div class="slide"><button disabled="disabled">'+i18n.gettext('buttonsuite.edit')+'</button><button disabled="disabled">'+i18n.gettext('buttonsuite.delete')+'</button><div>';
		}
		else if (state == 'wip') {
			
			staticcontent = "<div class='desc'>Waiting</div>";
			slide = '<div class="slide"><button>'+i18n.gettext('buttonsuite.listen')+'</button><div>';
		}
		content = "<div statusname='"+state+"'>" + staticcontent + slide + "</div>";
		$("#img_"+idbutton+" div.ItemContent").append(content);
		var x = $("#btimg_"+idbutton +" div[statusname="+state+"]");
		x.hide();
	}	
}