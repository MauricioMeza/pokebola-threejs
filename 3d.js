//----CONFIGURACION INICIAL-----
//parametros de width y height del canvas
var w = 1.3
var h = 1.03

//configuracion de escena, camara y renderizador
container = document.getElementById( 'canvas3d' );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75, //Field of View
	(window.innerWidth/w)/ (window.innerHeight/h), //Aspect Ratio
	0.1,  //Inner Frustum
	1000 //Outter Frustum
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize((window.innerWidth)/w, window.innerHeight/h);
container.appendChild( renderer.domElement );


//----CONFIGURACION DE CONTROLES----
//implementacion de la libreria OrbitControls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 5;	
controls.update();


//----CARGAR TEXTURAS PBR ----
const textureLoader = new THREE.TextureLoader();
	//cargar los mapas como inputs en el PBR
	const diffuse = textureLoader.load("./3DFiles/45634.png");
	const roughness = textureLoader.load("./3DFiles/45634-rg.png");
	const normal = textureLoader.load("./3DFiles/45634-n.png");
	const height = textureLoader.load("./3DFiles/45634-h.png");


//----CONFIGURACION DE GEOMETRIA Y MATERIALES -----
const geometry = new THREE.SphereGeometry( 2, 32, 32);
const material = new THREE.MeshStandardMaterial( {
	map: diffuse, 
	roughnessMap: roughness, 
	metalness: 0.25,
	normalMap: normal,
	normalScale: new THREE.Vector2( .35, .35 ),
	envMapIntensity: 1.0
});

const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );


//----CONFIGURACION PARA CARGAR ARCHIVOS HDRI EN FORMATO .exr PARA IBL -----
var images = ["./3DFiles/sunset.exr", "./3DFiles/interior.exr", "./3DFiles/studio.exr", "./3DFiles/courtyard.exr"]
var initial = 0;
const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
loadAmbientLight(initial)


//----CONFIGURACION DE ANIMACION CADA FRAME -----
function animate(){
	requestAnimationFrame(animate);
	sphere.rotation.y += .01;
 	controls.update();
	renderer.render(scene, camera);
}


//----FUNCION DE SELECCION Y CARGA DE ILUMINACION AMBIENTAL -----
function loadAmbientLight(num){
	new THREE.EXRLoader()
		.setDataType( THREE.UnsignedByteType )
		.load( images[num % 4], function ( texture ) {

			exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
			exrBackground = exrCubeRenderTarget.texture;

			sphere.material.envMap = exrBackground;
			scene.background = exrBackground;
			texture.dispose();
	} );
}


//----PARAMETRIZACION DE INPUTS PBR CON SLIDERS Y BOTONES HTML -----
//parametrizacion del canal normal
var sliderNormal = document.getElementById("normalRange");
sliderNormal.oninput = function() {
	val = this.value/100
	sphere.material.normalScale = new THREE.Vector2( val, val ); 
}

//parametrizacion del canal de rugosidad/roughness
var sliderRoughness = document.getElementById("roughnessRange");
sliderRoughness.oninput = function() {
	val = this.value/50
	if(val > 1){
		val = val*val*val;
	}
	sphere.material.roughness = val; 
}

//parametrizacion del canal de metalicidad/metalness
var sliderMetal = document.getElementById("metalRange");
sliderMetal.oninput = function() {
	val = this.value/200;
	sphere.material.metalness = val; 
}

//parametrizacion de la iluminacion ambiental ibl
var sliderAmbient = document.getElementById("ambientRange");
sliderAmbient.oninput = function() {
	val = this.value/50
	if(val > 1){
		val = val*val;
	}
	sphere.material.envMapIntensity = val; 
}

//seleccion del mapa HDRI de ambiente
var buttonAmbient = document.getElementById("ambientButton");
buttonAmbient.onclick = function() {
	initial++;
	loadAmbientLight(initial);
}

animate();