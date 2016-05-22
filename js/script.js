/**
 *
 * Copyright 2016, Script
 * by Wangjinlei@shanghaitech.edu.cn
 *
 */


var config = {
    path_img: "texture/Pano_Canon/panoRGB.png",
    path_disp: "texture/Pano_Canon/panoDM.png",
    path_kernel: "texture/kernel/circular64.png",
    fusing_sigma: 80.0 / 255.0,
    scale_kernel: 0.20,
    d_focal: 0.5,
    rf_speed: 0.05,
};

var uni_img, uni_disp, uni_kernel;

var view_shift = 0.0;
var uni_d_focal = config.d_focal;
var uni_R_kernel = 5;
var uni_h_img = 700;
var uni_w_img = 500;

var texture_ready_flag = false;

var uni_refocus_flag = 0;
var update_flag = false;

var depth_data;

var house = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    controls: null,
    clock: null,
	skyMaterial: null,
	skyBox: null,
	planeMesh: null,

    // Initialization
	init: function ()
	{
	    // create main scene
        this.scene = new THREE.Scene();

        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;

        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 10000;
        this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);
        this.camera.position.set(0, 0, 60);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.renderer = new THREE.WebGLRenderer( {
            antialias: false,
            //clearColor: 0x000000,
            //clearAlpha: 0,
            alpha: true,
            preserveDrawingBuffer: true,
        } );
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.renderer.setClearColor(0xffffff);

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;

        // prepare container
        this.container = document.createElement('div');
		this.container.id = "panorama";
		this.container.style.top = "0px";
		this.container.style.zindex = 1;
		this.container.setAttribute("onclick","addClickEvent(event)");
        document.body.appendChild(this.container);
        this.container.appendChild(this.renderer.domElement);

		var parentEle = document.getElementById('panoramaDiv');
		parentEle.appendChild(this.container);

        // events
        THREEx.WindowResize(this.renderer, this.camera);

        // prepare controls (OrbitControls)
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(0, 0, 0);
        this.controls.maxDistance = 700;

		//this.controls.maxDistance = 300;

        // prepare clock
        this.clock = new THREE.Clock();

        // add point light
        var spLight = new THREE.PointLight(0xffffff, 1.75, 1000);
        spLight.position.set(-100, 200, 200);
        this.scene.add(spLight);

        this.drawSphericalSkybox(config);

    },

    drawSphericalSkybox: function ( panoConfig )
    {
        // Load shader materials
        // Load texture image
        var loader = new THREE.TextureLoader();


        loader.load(panoConfig.path_disp, function(texture){
          uni_disp = texture;

          depth_data = getImageData(texture.image);
        });

        loader.load(panoConfig.path_kernel, function(texture){
          uni_kernel = texture;
          uni_R_kernel = (texture.image.width -1)/2 * panoConfig.scale_kernel;
        });

        loader.load(panoConfig.path_img, function(texture){
          uni_img = texture;
          uni_w_img = texture.image.width;
          uni_h_img = texture.image.height;

          // prepare ShaderMaterial
          var uniforms = {
              d_focal: { type: "f", value: uni_d_focal },
              R_kernel: { type: "f", value: uni_R_kernel },
              h_img: { type: "i", value: uni_h_img },
              w_img: { type: "i", value: uni_w_img },
              tex_img: { type: "t", value: uni_img },
              tex_disp: { type: "t", value: uni_disp },
              tex_kernel: { type: "t", value: uni_kernel },
              tex_fusing_weight: { type: "t", value: uni_fusing_weight },
              refocus: { type: "i", value: uni_refocus_flag },
          };

          var skyMaterial = new THREE.ShaderMaterial( {
              uniforms: uniforms,
              vertexShader: document.getElementById('sky-vertex').textContent,
              fragmentShader: document.getElementById('sky-fragment').textContent
          });

          // create Mesh with sphere geometry and add to the scene
          house.skyBox = new THREE.Mesh(new THREE.SphereGeometry(250, 60, 40), skyMaterial);
          house.skyBox.material.side = THREE.DoubleSide;
          house.skyBox.scale.set(-1, 1, 1);
          house.skyBox.eulerOrder = 'XZY';
          house.skyBox.renderDepth = 500.0;

          house.scene.add(house.skyBox);
          house.skyBox.material.needsUpdate = true;

          uni_refocus_flag = true;
          texture_ready_flag = true;
        });

        // buf -> for what?
        buf = new Uint8Array( 4 * 256 );
        fusing_sigma = panoConfig.fusing_sigma;
        for ( var i = 0; i < 256; i++ )
        {
            buf[4 * i] = ( Math.exp( -( 0.5 * i / 255.0 - 0.5 ) * ( 0.5 * i / 255.0 - 0.5 ) / ( fusing_sigma * fusing_sigma ) ) * 254.0 ) + 1;
            buf[4 * i + 1] = buf[4 * i];
            buf[4 * i + 2] = buf[4 * i];
            buf[4 * i + 3] = buf[4 * i];
        }

        var uni_fusing_weight = new THREE.DataTexture( buf, 256, 1, THREE.RGBAFormat, THREE.UnsignedByteType );
        //uni_fusing_weight= THREE.ImageUtils.generateDataTexture (256, 1,  new THREE.Color(0xffffffff));
        uni_fusing_weight.wrapS = THREE.ClampToEdgeWrapping;
        uni_fusing_weight.wrapT = THREE.ClampToEdgeWrapping;
        uni_fusing_weight.minFilter = THREE.NearestFilter;
        uni_fusing_weight.magFilter = THREE.NearestFilter;
        uni_fusing_weight.needsUpdate = true;
    },
};

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    if (texture_ready_flag)
    {
      render();
      update();
    }
}

// Update controls and stats
function update() {
	//house.stats.update();
    house.controls.update( house.clock.getDelta() );

    if ( house.skyBox.material.uniforms.refocus.value != uni_refocus_flag )
    {
        house.skyBox.material.uniforms.refocus.value = uni_refocus_flag;

        if ( uni_refocus_flag == 1 )
        {
            house.skyBox.material.uniforms.d_focal.value = uni_d_focal;
            update_flag = true;
            uni_refocus_flag = 0;
        }

        house.skyBox.material.needsUpdate = true;
    }
}

// Render the scene
function render() {
    if ( house.renderer && update_flag )
    {
        house.renderer.render( house.scene, house.camera );
        // preserve current result
        house.container.children[0] = house.renderer.domElement;
        update_flag = false;
    }
}

// Initialize lesson on page load
function initializeLesson() {
    house.init();
    animate();
}

window.addEventListener( "keydown", function ( e )
{
    if ( e.keyCode == 83 )
    {
        window.uni_refocus_flag = 1;
        window.uni_d_focal += config.rf_speed;
        if ( window.uni_d_focal > 1 )
            window.uni_d_focal -= 1;
    }

    else if ( e.keyCode == 87 )
    {
        window.uni_refocus_flag = 1;
        window.uni_d_focal -= config.rf_speed;
        if ( window.uni_d_focal < 0 )
            window.uni_d_focal += 1;
    }
}, false );

function addClickEvent( event )
{
    // test get uv for current position
    // mouse position
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(event.clientX/window.innerWidth*2 + 1, event.clientY/window.innerHeight*2-1);
    raycaster.setFromCamera(mouse, house.camera);
    var uv = raycaster.intersectObjects(house.scene.children)[0].uv;
    var index = Math.ceil((1-uv.y)*uni_h_img*uni_w_img + uv.x*uni_w_img);
    uni_d_focal = depth_data.data[index]/255;
    uni_refocus_flag = 1;
}

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

if (window.addEventListener)
    window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
    window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
