<?php
     
$MenuEntryList=array();
  
class menu_entry{
	var $label;
	var $menu_label;
	var $kernel;
	var $append;
	
	public function menu_entry(){
	$this->label;
	$this->menu_label;
	$this->kernel;
	$this->append;
	}
	
	public function is_empty(){
	//echo "FUNC IS EMPRTY\n";
		if ($this->label!="") return false;
		else return true;
		
	}
	
	public function get_kernel_version($kernel){
	
		// Exclude first part of kernel
		
		if ($kernel=="") return "";
		
		$pos_vmlinuz=strpos($kernel,'vmlinuz');
		$tmp_str=substr($kernel,$pos_vmlinuz+8);
		
		// Search first char
		
		$str_array=str_split($tmp_str);
		$kernel_str="";
		$i=0;
		
		while ( (preg_match("/^[a-zA-Z]$/", $str_array[$i])==0)&&($i<20) ){ // is not a char
			//echo "!".preg_match("/^[a-zA-Z]$/", $str_array[$i])."!\n";
			$kernel_str=$kernel_str.$str_array[$i];
			$i++;
		}
		
		$kernel_str=substr ($kernel_str, 0, strlen($kernel_str)-1) ;
		return ($kernel_str);
		
		
	}
	
	public function compare_kernels($v1, $v2){

		if($v1==$v2) return 0;
		else if($v1=="") return 1;
		else if($v2=="") return -1;
		
		
		$v1_array=explode("-", $v1);
		$v1_version=$v1_array[0];
		$v1_subversion=$v1_array[1];
		$v2_array=explode("-", $v2);
		$v2_version=$v2_array[0];
		$v2_subversion=$v2_array[1];
		
		// Compare version
		
		$v1_version_exploded=explode(".", $v1_version);
		$v2_version_exploded=explode(".", $v2_version);
		
		for($i=0; $i<count($v1_version_exploded); $i++ ){
			//echo "* Comparing ".$v1_version_exploded[$i]." with ".$v2_version_exploded[$i]."*\n";
			if($v1_version_exploded[$i] > $v2_version_exploded[$i]) return -1;
			else if ($v1_version_exploded[$i] < $v2_version_exploded[$i]) return 1;
			// elsewhere $v1_version_exploded[$i] = $v2_version_exploded[$i]
		}
		// Here, versions are equal
		if ($v1_subversion>$v2_subversion) return -1;
		else  if ($v1_subversion>$v2_subversion) return 1;
		else return 0; // Are equal
		
		return -2; // unknown error
		
	}
	
	public function is_pae($kernel){
		return  (strpos($kernel,'pae') !== false);
	}
	
	public function set_menu_entry($label, $menu_label, $kernel, $append){
		//echo  "TESTING MENU ENTRY to $kernel AND append=$append\n";
		
		$v1=$this->get_kernel_version($this->kernel);  // v1 is current kernel
		
		
		if ($v1==""){ // If v1 is null, set kernel
			$this->label=$label;
			$this->menu_label=$menu_label;
			$this->kernel=$kernel;
			$this->append=$append;
		} else { // if not, compare versions
			
			$v2=$this->get_kernel_version($kernel);		// v2 is candidate kernel
			
			$result_compare_versions=$this->compare_kernels($v1, $v2);
			
			
			if ($result_compare_versions==-1 || $result_compare_versions==0) // v1 is major
			{
				if($this->is_pae($this->kernel) && !($this->is_pae($kernel))) { // but v2 is not pae and v1 is -> So, v2
					$this->label=$label;
					$this->menu_label=$menu_label;
					$this->kernel=$kernel;
					$this->append=$append;
				} // nothing to do if v1 is major
			}
			else {
				if( !($this->is_pae($kernel) && !($this->is_pae($this->kernel)))) {  // v2 is major and v1 is PAE
					$this->label=$label;
					$this->menu_label=$menu_label;
					$this->kernel=$kernel;
					$this->append=$append;
				}
				}
			} // else if ($v1=="")
		} // function
	

	private function get_default_boot(){
	    try{
	        $string = file_get_contents("/etc/ltsp/bootopts/defaultboot.json");
                $json=json_decode($string,true);
		$GLOBALS['default_boot']=$json["default_boot"]; // Setting defualt boot,
                return $json["default_boot"];
            } catch (Exception $e) {
                return "";
            }

	}


	public function print_entry(){		
		global $MenuEntryList;
		$MenuEntry=new stdClass();
		$MenuEntry->id="ltsp_".preg_replace('/\s+/', '', $this->label);
		$MenuEntry->label=$this->menu_label;
		//$MenuEntry->label=$this->label;
		$MenuEntry->menuString="";
		
		$MenuEntry->menuString=$MenuEntry->menuString.$this->label;
		$MenuEntry->menuString=$MenuEntry->menuString.$this->menu_label;
		// Debug: echo substr($this->label,6, -1);
		// Debug: echo $this->get_default_boot();
		//if($this->get_default_boot()==substr($this->label,6,-1))
                //    $MenuEntry->menuString=$MenuEntry->menuString."menu default\n";
		$MenuEntry->menuString=$MenuEntry->menuString.$this->kernel;
		$MenuEntry->menuString=$MenuEntry->menuString.$this->append;
		$MenuEntry->menuString=$MenuEntry->menuString."ipappend 3\n\n";
		
		array_push($MenuEntryList, $MenuEntry);
	}

}
  
  
function check_sanity($nbd_name,$nbd_id){
	// Check if nbd_name is according to its nbd_id, exists conf file and img.

	//echo "Checking: $nbd_name with $nbd_id";

	$nbd_conf_dir="/etc/nbd-server/conf.d/";
	$nbd_conf_prefix="ltsp_";
	$nbd_conf_ext=".conf";
	$lines=file($nbd_conf_dir.$nbd_conf_prefix.$nbd_name.$nbd_conf_ext);

	if (substr($lines[0], 0, -1)=="[".$nbd_id."]") {
		$i=1;
		do{
			list($attribute, $value)=explode( "=" ,$lines[$i]);
			if (trim($attribute)=="exportname"){
				// Exist this exportname img?
    				if (is_file(trim($value))) return true;
			}
			$i++;
		} while ($i<count($lines));
	}

	// If we are here... bad luck...
	return false;
	
}


function getName($dir){
	// Check if exists /etc/ltsp/images/$dir and gets image name
	try{
		$string = file_get_contents("/etc/ltsp/images/".$dir.".json");	
		$json=json_decode($string,true);
		return $json["name"];
	} catch (Exception $e) {
		return $dir;
	}
}



# Global dirs
$path="/var/lib/tftpboot/ltsp/";
$dir_desc = opendir($path);
$base_dir="/opt/ltsp/";

#GET VARS
$MANUFACTURER=$_GET["manufacturer"];
$PRODUCT=$_GET["product"];
$IP=$_GET["ip"];
$MAC=$_GET["mac"];


//Main loop
while ($dir = readdir($dir_desc)) 
{
    if (is_file($path.$dir."/pxelinux.cfg/default")&&($dir!=".")&&($dir!="..")){

	//echo "dir is $dir and default is a file\n";
	$lines = file($path.$dir."/pxelinux.cfg/default");

	// Setting candidate menu entry
	$candidate=new menu_entry();
	
	foreach ($lines as $line_num => $line) {

            // getting vmlinuz
	    if ((strpos($line,'vmlinuz') !== false)&&(strpos($line,'kernel') !== false)){
                $kernel=trim(str_replace("kernel", "", $line ));
		$kernel_line="kernel pxe-ltsp/$dir/$kernel\n";
	    }
	
 	    if (strpos($line,'nbdroot') !== false){
		if (check_sanity($dir, $base_dir.$dir)){
			
			// Append Line:
			$append_line=$line;

			// Getting ip for next-server:
			$server=str_replace("'","",$_GET['next-server']);

			// Setting nbd_id
			$nbd_id=$base_dir.$dir;
			
			$append_line=str_replace("{server}",$server,$append_line);
			$append_line=str_replace("{nbd_id}",$nbd_id,$append_line);

			$string = file_get_contents("/etc/ltsp/images/".$dir.".json"); 
	                $json=json_decode($string,true);
			if ($json["kernel_extra_params"]!="undefined") $append_line=$append_line . " " . $json["kernel_extra_params"];

			// Checking if exists lts.conf file for image
			if (is_file(trim("/var/lib/tftpboot/ltsp/$dir/lts.conf")))
			    $mergelts=" MERGELTSCONF=true\n";
			else
			    $mergelts=" MERGELTSCONF=false\n";
			    
			$append_line=str_replace(PHP_EOL, '', $append_line);
			$append_line=str_replace("initrd=","initrd=/pxe-ltsp/$dir/",$append_line);
			$append_line=$append_line.$mergelts;

						
			//Use the ipxe vars
		
			// Getting Name for label
			$name=getName($dir); // Gets the name of $dir
			//echo "Setting $name\n";
			
			if ($candidate->is_empty()){
				$label_candidate="label $dir\n";
				$menu_candidate="menu label $name\n";
				$kernel_candidate="$kernel_line";
				$append_candidate="$append_line";
				$candidate->set_menu_entry($label_candidate, $menu_candidate,  $kernel_candidate, $append_candidate);
			} else {
				$label_candidate="label $dir\n";
				$menu_candidate="menu label $name\n";
				$kernel_candidate="$kernel_line";
				$append_candidate="$append_line";
				$candidate->set_menu_entry($label_candidate, $menu_candidate,  $kernel_candidate, $append_candidate);
			}
			
		   }
		
	      }
	      
	}  
	
	if  (!($candidate->is_empty())) {
		$candidate->print_entry();
	}
	
	
	}
	

}


// "Return" MenuEntryListObject
$MenuEntryListObject=$MenuEntryList;

?>

