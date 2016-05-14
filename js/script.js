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

var uni_fusing_weight;

var uni_refocus_flag = 1;

var delta_d_focal = 0;

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
		this.container.setAttribute("onclick","addClickEvent()");
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
        uni_img = THREE.ImageUtils.loadTexture(panoConfig.path_img, undefined, this.onLoadTexture_img);
        uni_img.wrapS = THREE.ClampToEdgeWrapping;
        uni_img.wrapT = THREE.ClampToEdgeWrapping;
        uni_img.minFilter = THREE.LinearFilter;
        uni_img.magFilter = THREE.LinearFilter;

        uni_disp = THREE.ImageUtils.loadTexture(panoConfig.path_disp, undefined);
        uni_disp.wrapS = THREE.ClampToEdgeWrapping;
        uni_disp.wrapT = THREE.ClampToEdgeWrapping;
        uni_disp.minFilter = THREE.LinearFilter;
        uni_disp.magFilter = THREE.LinearFilter;

        uni_kernel = THREE.ImageUtils.loadTexture(panoConfig.path_kernel, undefined, this.onLoadTexture_kernel);

        uni_kernel.wrapS = THREE.ClampToEdgeWrapping;
        uni_kernel.wrapT = THREE.ClampToEdgeWrapping;
        uni_kernel.minFilter = THREE.LinearFilter;
        uni_kernel.magFilter = THREE.LinearFilter;

        uni_R_kernel = ( uni_kernel.image.width - 1 ) / 2;
        uni_R_kernel *= panoConfig.scale_kernel;

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

        uni_fusing_weight = new THREE.DataTexture( buf, 256, 1, THREE.RGBAFormat, THREE.UnsignedByteType );
        //uni_fusing_weight= THREE.ImageUtils.generateDataTexture (256, 1,  new THREE.Color(0xffffffff));
        uni_fusing_weight.wrapS = THREE.ClampToEdgeWrapping;
        uni_fusing_weight.wrapT = THREE.ClampToEdgeWrapping;
        uni_fusing_weight.minFilter = THREE.NearestFilter;
        uni_fusing_weight.magFilter = THREE.NearestFilter;
        uni_fusing_weight.needsUpdate = true;

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

        skyMaterial = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: document.getElementById('sky-vertex').textContent, 
			fragmentShader: document.getElementById('sky-fragment').textContent
        });
		
        // create Mesh with sphere geometry and add to the scene
        this.skyBox = new THREE.Mesh(new THREE.SphereGeometry(250, 60, 40), skyMaterial);
		this.skyBox.material.side = THREE.DoubleSide;
        this.skyBox.scale.set(-1, 1, 1);
        this.skyBox.eulerOrder = 'XZY';
        this.skyBox.renderDepth = 500.0;

        this.scene.add(this.skyBox);
    },
    
    onLoadTexture_img: function (texture)
    {
        uni_w_img = uni_img.image.width;
        uni_h_img = uni_img.image.height;

        house.skyBox.material.uniforms.w_img.value = uni_w_img;
        house.skyBox.material.uniforms.h_img.value = uni_h_img;

        //house.renderer.setSize(uni_w_img, uni_h_img);
    },

    onLoadTexture_kernel:function (kernel)
    {
        uni_R_kernel = (uni_kernel.image.width - 1) / 2;
        uni_R_kernel *= config.scale_kernel;

        house.skyBox.material.uniforms.refocus.value = uni_refocus_flag;
        house.skyBox.material.uniforms.R_kernel.value = uni_R_kernel;
    },
};

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    render();
    update();
}

// Update controls and stats
function update() {
	//house.stats.update();
    house.controls.update( house.clock.getDelta() );

    if (house.skyBox.material.uniforms.refocus.value != uni_refocus_flag)
    {
        house.skyBox.material.uniforms.refocus.value = uni_refocus_flag;
        
        if (uni_refocus_flag == 1)
            house.skyBox.material.uniforms.d_focal.value = uni_d_focal;
        
        house.skyBox.material.uniforms
    }

    //uni_d_focal = house.controls.focalDist;
    //keyboard.update();
    //if (keyboard.down('A'))
    //{
    //    uni_d_focal -= 0.05;
    //    if (uni_d_focal < 0)
    //    {
    //        uni_d_focal += 1;
    //    }
    //    house.skyBox.material.uniforms.d_focal.value = uni_d_focal;
    //    house.skyBox.material.needsUpdate = true;
    //    refocus = 1;

    //    console.log(uni_d_focal);
    //}

    //if (keyboard.down('D'))
    //{
    //    uni_d_focal += 0.05;
    //    if (uni_d_focal > 1)
    //    {
    //        uni_d_focal -= 1;
    //    }
    //    house.skyBox.material.uniforms.d_focal.value = uni_d_focal;
    //    house.skyBox.needsUpdate = true;
    //    refocus = 1;

    //    console.log(uni_d_focal);
    //}
}

// Render the scene
function render() {
    if ( house.renderer )
    {
        house.renderer.render( house.scene, house.camera );

        uni_refocus_flag = 0;
        //var imgData;
        //var imgNode;
        //try {
        //    imgData = house.renderer.domElement.toDataURL(); 
        //    console.log(imgData);
        //    imgNode = document.getElementById( 'result' );
        //    imgNode.src = imgData;
			
        //    //window.win = open(imgData);
        //} catch(e) {
        //    console.log("Browser does not support taking screenshot of 3d context");
        //    return;

        //uni_refocus_flag = 0;
        //window.refocus = 0;
    }
}

// Initialize lesson on page load
function initializeLesson() {
    house.init();
    animate();
}

window.addEventListener("keypress", changeFocalDepth, false);

function changeFocalDepth(e)
{
    // far
    if (e.charCode == 119)
    {
        uni_d_focal -= config.rf_speed;
        if ( uni_d_focal < 0 )
            uni_d_focal += 1;
    }
    
    if (e.charCode == 115)
    {
        uni_d_focal += config.rf_speed;
        if ( uni_d_focal > 1 )
            uni_d_focal -= 1;
    }
    uni_refocus_flag = 1;
}

if (window.addEventListener)
    window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
    window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
