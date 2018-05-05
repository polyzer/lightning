/*
  That class defines Programs that will be
  executed on computer/mobile "slave" device.


*/

class MobileSlaveProgram {
  constructor(){
    //it's a users array, that represents as lights on scene;
    this.update = this.update.bind(this);

    this.AccelParameters = {
      Acceleration: new THREE.Vector3(),
      RotationRate: new THREE.Vector3() 
    };

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.onWindowResie);
    this.onDeviceMotion = this.onDeviceMotion.bind(this);
    //window.addEventListener("devicemotion", this.onDeviceMotion);


    // Copy the object that will be changeble;
    this.MessagesController = new MessagesController();
    this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000);
    this.Camera.position.z = 100;
    this.Scene = new THREE.Scene();
    let geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0xffff00} )
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.add(new THREE.AxesHelper(50));
    this.Scene.add(this.mesh);

    this.DEVICE_TYPES = {
      DESKTOP: 0,
      MOBILE: 1
    };
  
    var testExp = new RegExp('Android|webOS|iPhone|iPad|' +
                'BlackBerry|Windows Phone|'  +
                'Opera Mini|IEMobile|Mobile' , 
              'i');
  
    if (testExp.test(navigator.userAgent)){
      this.DeviceType = this.DEVICE_TYPES.MOBILE;
    }else{
      this.DeviceType = this.DEVICE_TYPES.DESKTOP;
    }

    if(this.DeviceType === this.DEVICE_TYPES.MOBILE)
		{
			this.Controls = new THREEx.ComputerMobileControls({
				Object3D: this.mesh
			});
		} else {
      this.Controls = new THREE.DeviceOrientationControls(this.mesh);
		}

    this.SocketWasConfirm = false;

    this.Socket = new WebSocket(CONSTANTS.WEB_SOCKET_ADDR);

    this.Socket.onopen = function (event) {
        this.Socket.send(JSON.stringify(this.MessagesController.AddUserMessage));
        this.SocketWasConfirm = true;
        console.log("Socket was open.");
    }.bind(this);

    this.Socket.onmessage = function(event) {
        console.log(event.data);
    }.bind(this);


    this.Socket.onclose = function (event) {
      if(event.data)
        event.data = JSON.parse(event.data);
      console.log("Socket was closed.");
      /*
        Now we need to tell User. that Connection was Closed;
      */
    }.bind(this);


    this.Container = document.createElement("div");
    this.Container.id = "Container";
    document.body.appendChild(this.Container);

    this.Renderer = new THREE.WebGLRenderer();
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    this.Container.appendChild(this.Renderer.domElement);
    this.update();
  }

  update(){
    this.Controls.update();

    this.mesh.position.add(this.AccelParameters.Acceleration);
    this.AccelParameters.Acceleration.set(0,0,0);
    
    this.MessagesController.SetPositionMessage = {
      UserID: 0,
      Position: this.mesh.position,
      Rotation: this.mesh.rotation
    };
    
    if(this.Socket.readyState === WebSocket.OPEN && this.SocketWasConfirm)
      this.Socket.send(JSON.stringify(this.MessagesController.SetPositionMessage));
    this.Renderer.render(this.Scene, this.Camera);
    requestAnimationFrame(this.update);
  }

  onWindowResize(){
    this.Camera.aspect = window.innerWidth / window.innerHeight;
    this.Camera.updateProjectionMatrix();

    this.Renderer.setSize( window.innerWidth, window.innerHeight );
  }

  onDeviceMotion(event) {
    this.AccelParameters.RotationRate.x = event.rotationRate.alpha;
    this.AccelParameters.RotationRate.y = -event.rotationRate.beta;
    
    this.AccelParameters.deviceMotionInterval = event.interval;

    this.AccelParameters.Acceleration.x += event.acceleration.x;
    this.AccelParameters.Acceleration.y += event.acceleration.y;
    this.AccelParameters.Acceleration.z += event.acceleration.z;

    this.AccelParameters.phi = 0;
    this.AccelParameters.theta = 0;    
}

};
