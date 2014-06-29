<?php 
error_reporting(1);
if(isset($_GET["grupo"]) && $_GET["grupo"] == "all"){
	//buscamos los grupos ac� y armamos una sola tabla
	$grupos = array("Grupo ATL ROJO","Grupo ATL Verde","Grupo ATL Negro");
                    
	$tr_necesario = true;
	$tabla_total = new DOMNode();
	foreach($grupos as $g){
		$dom = getDataMundialConAmigos($g, false);
		
		$table = $dom->childNodes->item(3);
                //var_dump(($table->textContent));
if(count($table->childNodes->length ) > 0 ){
                foreach( $table as $i=>$child){
			 //print $child->textContent; print $i->textContent;
			//print $child-> . " ad ";
		}
                echo "poco";
}else{
    echo "nada";
}
		
		//print DOMinnerHTML( $table );
		
		$tr_necesario= false;
	}
        print( DOMinnerHTML($tabla_total));	
	
}else{
	print getDataMundialConAmigos($_GET["grupo"]);
}

//$innerHtml si False devuelve un DOMNode o true = un String
function getDataMundialConAmigos($grupo,$innerHtml = true){
	//extract data from the post
	extract($_POST);

	//set POST variables
	$url = 'http://mundialconamigos.com/index.php?id=18';
	$fields = array(
		'cual' => urlencode($grupo),
	);

	//url-ify the data for the POST
	foreach($fields as $key=>$value) { 
		$fields_string .= $key.'='.$value.'&'; 
	}
	rtrim($fields_string, '&');

	//open connection
	$ch = curl_init();

	//set the url, number of POST vars, POST data
	curl_setopt($ch,CURLOPT_URL, $url);
	curl_setopt($ch,CURLOPT_POST, count($fields));
	curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	//execute post
	$result = curl_exec($ch);

	//close connection
	curl_close($ch);
	$DOM = new DOMDocument;
	$DOM->loadHTML($result);
	$pos = $DOM->getElementById('posiciones_grupo');
	if($innerHtml){
		return DOMinnerHTML($pos);
	}else{
		return $pos;
	}
}


function DOMinnerHTML(DOMNode $element) 
{ 
    $innerHTML = ""; 
    $children  = $element->childNodes;

    foreach ($children as $child) 
    { 
        $innerHTML .= $element->ownerDocument->saveHTML($child);
    }

    return $innerHTML; 
} 