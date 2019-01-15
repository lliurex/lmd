/* LMD Tabs library */

// MAGIC: to show content when tab is selected
// from: http://viralpatel.net/blogs/jquery-trigger-custom-event-show-hide-element/
(function ($) {
      $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
          this.trigger(ev);
          return el.apply(this, arguments);
        };
      });
    })(jQuery);
// End of magic


$(document).ready(function() {
	 
     // Remove all content in tabs
	 $(".lmd_tab_content").hide();
	  //$("#tab_templates").show(); //Cal fer un document ready per a tot!
	 $("#tab_images").show(); //Cal fer un document ready per a tot!
	
     // Clean all tab classes (selected or unselected)
	 $(".lmd_tab").removeClass("Unselected");
	 $(".lmd_tab").removeClass("Selected");
	 $(".lmd_tab").addClass("Unselected"); // Unselect all
	 
	 
	 // Hide Advanced tabs
	 $(".adv").hide();
	 $(".adv").css("width","0");
	 
	// Add handler to click on lmd_tab_changer
	$("#lmd_tab_changer").bind("click", function(){
		 status=$(this).attr("status");
		 if (status=="basic") {
			// Change to advanced
			$(this).attr("status","adv");
			// Show advanced tabs
			$(".adv").show();
			$(".adv").animate({width: '150px'});
			// Hide Basic tabs
			$(".basic").animate({width: '0px'},  function(){$(".basic").hide();});
			// Change text
			$("#lmd_tab_changer").empty();
			//$("#lmd_tab_changer").append("Basic");
            $("#lmd_tab_changer").append("<i class='myicon-basic'></i> ");
		 } else {
			// Change to advanced
			$(this).attr("status","basic");
			// Show basic tabs
			$(".basic").show();
			$(".basic").animate({width: '150px'});
			// Hide Advanced tabs
			$(".adv").animate({width: '0px'}, function(){$(".adv").hide();});
			// Change text
			$("#lmd_tab_changer").empty();
			//$("#lmd_tab_changer").append("Advanced");
            $("#lmd_tab_changer").append("<i class='myicon-advanced'></i> ");
            
		 }
		
		
		})

	
    // Add handlers to click on tabs
	$(".lmd_tab").bind("click", function(){
        // Get tab clicked
		 target=$(this).attr("target");
         // Hide content of all tabs
		 $(".lmd_tab_content").hide();
         // Clean tab classes and mark as unselected
		 $(".lmd_tab").removeClass("Unselected"); 
		 $(".lmd_tab").removeClass("Selected");
		 $(".lmd_tab").addClass("Unselected");
		 
         // Mark clicked tab as selected
		 $(this).removeClass("Unselected");
         // Show clicked tab content
		 $(this).addClass("Selected");
		 
		 $("#"+target).show();
    })
})




