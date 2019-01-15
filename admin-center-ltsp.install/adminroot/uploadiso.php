<?php
include('./n4d_lib.php');
include("./libphp/cryptojs-aes.php");

class UploadManager{
	const ISOSPATH = "/opt/ltsp/isos/";
	const FORMISONAME = "isofile";
	private $info;
	private $original_name;
	private $ext;
	private $FILES;
	
	function __construct($FILESTOUPLOAD,$POST){
		$this->file_info = pathinfo($FILESTOUPLOAD[self::FORMISONAME]['name']);
		$this->original_name = $this->file_info['filename'];
		$this->ext = $this->file_info['extension'];
		$this->FILES = $FILESTOUPLOAD;
		$this->user = $this->RSADecrypt($POST['user']);
		$this->password = $this->RSADecrypt($POST['password']);
	}

	private function get_valid_name(){
		$dest = self::ISOSPATH . $this->original_name . "." .$this->ext;
		if(!file_exists($dest)){
			return $dest;
		}
		for($i=1; $i<100; $i++){
			$dest = self::ISOSPATH . $this->original_name . $i . "." .$this->ext;
			if(!file_exists($dest)) return $dest;
		}
		return null;
	}
	public function save_file(){

		$cliente = new N4D('localhost');
		try{
				$result = $cliente->execute('validate_user',[$this->user,$this->password]);
				$groups = array('adm','admin');
				if(!($result[0] && count(array_intersect($result[1],$groups)) >= 1)){
					return array("result"=>False,"msg"=>"Invalid user");
				}
		}
		catch (Exception $e){
			return array("result"=>False,"msg"=>"Exception " . strval($e),"Exception"=>True);
		}

		$target = $this->get_valid_name();
		$result = ["target"=>$target,"result"=>False];
		if (!is_null($target)){
			$result['result'] = move_uploaded_file($this->FILES[self::FORMISONAME]['tmp_name'],$target);
			if(!$result['result']){
				$result['msg'] = "Error on upload file";
			}
		}
		return $result;
	}

	private function RSADecrypt($crypttext){
		$priv_key = openssl_pkey_get_private("file:///etc/admin-center/private_key.pem");
		openssl_private_decrypt(base64_decode($crypttext), $newsource, $priv_key );
		return $newsource;
	  }
}
$uploadManager = new UploadManager($_FILES,$_POST);
$result = $uploadManager->save_file();

# Response
header('Content-Type: application/json');
echo json_encode($result);

?>
