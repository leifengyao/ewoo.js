<?php
//遍历下面的所有js文件，整理成一个文件
$dirs=scandir(__DIR__);
$txt='';
foreach($dirs as $file){
	if (substr($file, -3) == '.js'){
		//$txt.=php_strip_whitespace("./" . $file);
        $txt.=file_get_contents(__DIR__."/" . $file);
        $txt.="\r\n\r\n";
	}
}
file_put_contents(__DIR__.'/../ewoo.js', $txt);
echo "生成成功ewoo.js！大小:".round(strlen($txt)/1024,1)."k\r\n<br>";

if($_GET['s']){
    $data=array('js_code'=>$txt,'utf8'=>'1');
    $txt2=epost('http://marijnhaverbeke.nl/uglifyjs',$data);
    file_put_contents(__DIR__.'/../ewoo-1.0.min.js', $txt2);
    echo "生成成功ewoo-1.0.min.js！大小:".round(strlen($txt2)/1024,1)."k";
}

function epost($url, $data) {
    $ch = curl_init();
    // print_r($ch);
    curl_setopt($ch, CURLOPT_URL, $url);
    //curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0); //强制协议为1.0
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Expect: ")); //头部要送出'Expect: '
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); //强制使用IPV4协议解析域名
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    $return = curl_exec($ch);
    if (curl_errno($ch)) {
        return false;
    }
    curl_close($ch);
    return $return;
}