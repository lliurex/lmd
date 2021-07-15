<?php

# Global dirs
$path="/var/lib/tftpboot/ltsp/";
$dir_desc = opendir($path);
$base_dir="/opt/ltsp/";
$MenuEntryList=array();

#GET VARS
$MANUFACTURER=$_GET["manufacturer"];
$PRODUCT=$_GET["product"];
$IP=$_GET["ip"];
$MAC=$_GET["mac"];



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



function add_entry($label, $kernel, $init,$kernel_extra_params){
	$server = $_SERVER['SERVER_ADDR'];
	global $MenuEntryList;
	$MenuEntry=new stdClass();
	$MenuEntry->id="ltsp_label".$label;
	$MenuEntry->label= "menu label ${label}";
	//$MenuEntry->label=$this->label;
	$MenuEntry->menuString="\n
# {$label}
LABEL {$label}
MENU LABEL {$label}
KERNEL pxe-ltsp/{$label}/{$kernel}
INITRD pxe-ltsp/ltsp.img,pxe-ltsp/{$label}/{$init}
APPEND root=/dev/nfs nfsroot={$server}:/opt/ltsp/{$label}/ {$kernel_extra_params}
\n
\n";
	array_push($MenuEntryList, $MenuEntry);
}

while ($dir = readdir($dir_desc)){
	if ( ($dir!=".") && ($dir!="..") && is_file($path.$dir."/vmlinuz") ){
		if (is_dir($base_dir.$dir)){

			try{
				$string = file_get_contents("/etc/ltsp/images/".$dir.".json"); 
		        $json=json_decode($string,true);
				$name = getName($dir);
				if ($json["kernel_extra_params"] != "undefined"){
					$kernel_extra_params = $json["kernel_extra_params"];
				}
				else{
					$kernel_extra_params = "";
				}

			}catch( Exception $e){
				$name = $dir;
				$kernel_extra_params = "";
			}
			add_entry( $name, "vmlinuz", "initrd.img",$kernel_extra_params);
		}
	}
}

// "Return" MenuEntryListObject
$MenuEntryListObject=$MenuEntryList;

?>
