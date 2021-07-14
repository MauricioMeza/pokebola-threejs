//----Initial Setup
var w = 1.4
var h = 1.03

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


//----Control Setup
var controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 5;	
controls.update();


//----Load PBR Textures
const textureLoader = new THREE.TextureLoader();
	//Load Texture Maps for the object
	const diffuse = textureLoader.load("./3DFiles/45634.png");
	const roughness = textureLoader.load("./3DFiles/45634-rg.png");
	const normal = textureLoader.load("./3DFiles/45634-n.png");
	const height = textureLoader.load("./3DFiles/45634-h.png");


//----Geometry and Material Setup
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


//----Load Enviroment Map
var images = ["./3DFiles/sunset.exr", "./3DFiles/interior.exr", "./3DFiles/studio.exr", "./3DFiles/courtyard.exr"]
var initial = 0;
const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();
loadAmbientLight(initial)


//----Frame by Frame animation
function animate(){
	requestAnimationFrame(animate);
	sphere.rotation.y += .01;
 	controls.update();
	renderer.render(scene, camera);
}


//----Load HDRI from exr image
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


//----Functions for sliders and buttons
var sliderNormal = document.getElementById("normalRange");
sliderNormal.oninput = function() {
	val = this.value/100
	sphere.material.normalScale = new THREE.Vector2( val, val ); 
}

var sliderRoughness = document.getElementById("roughnessRange");
sliderRoughness.oninput = function() {
	val = this.value/50
	if(val > 1){
		val = val*val*val;
	}
	sphere.material.roughness = val; 
}

var sliderMetal = document.getElementById("metalRange");
sliderMetal.oninput = function() {
	val = this.value/200;
	sphere.material.metalness = val; 
}

var sliderAmbient = document.getElementById("ambientRange");
sliderAmbient.oninput = function() {
	val = this.value/50
	if(val > 1){
		val = val*val;
	}
	sphere.material.envMapIntensity = val; 
}

var buttonAmbient = document.getElementById("ambientButton");
buttonAmbient.onclick = function() {
	initial++;
	loadAmbientLight(initial);
}

animate();