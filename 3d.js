//----Initial Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75, //Field of View
	window.innerWidth/ window.innerHeight, //Aspect Ratio
	0.1,  //Inner Frustum
	1000 //Outter Frustum
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);


//----Control Setup
var controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 5;	
controls.update();


//----Load PBR Textures
const textureLoader = new THREE.TextureLoader();
	//Load Texture Maps for the object
	const diffuse = textureLoader.load("./3DFiles/45634.png");
	const metallic = textureLoader.load("./3DFiles/45634-mr.png");
	const roughness = textureLoader.load("./3DFiles/45634-rg.png");
	const normal = textureLoader.load("./3DFiles/45634-n.png");
	const height = textureLoader.load("./3DFiles/45634-h.png");


//----Geometry Setup
const geometry = new THREE.SphereGeometry( 2, 32, 32);

const material = new THREE.MeshStandardMaterial( {
	map: diffuse, 
	roughnessMap: roughness, 
	metalnessMap: metallic,
	normalMap: normal,
	normalScale: new THREE.Vector2( .35, .35 ),
	envMapIntensity: 1.0
});

const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );


//----Load Enviroment Map
const pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

new THREE.EXRLoader()
	.setDataType( THREE.UnsignedByteType )
	.load( "./3DFiles/sunset.exr", function ( texture ) {

		exrCubeRenderTarget = pmremGenerator.fromEquirectangular( texture );
		exrBackground = exrCubeRenderTarget.texture;

		sphere.material.envMap = exrBackground;
		scene.background = exrBackground;
		texture.dispose();
} );


function animate(){
	requestAnimationFrame(animate);
	sphere.rotation.y += .01;
 	controls.update();
	renderer.render(scene, camera);
}

animate();