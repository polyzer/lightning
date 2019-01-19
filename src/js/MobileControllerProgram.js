/*
  That class defines Programs that will be
  executed on computer/mobile "slave" device.


*/

class MobileControllerProgram {
  constructor(){
    //it's a users array, that represents as lights on scene;
    this.update = this.update.bind(this);
    this.onLightFireButtonTouchStart = this.onLightFireButtonTouchStart.bind(this);
    this.onLightFireButtonTouchEnd = this.onLightFireButtonTouchEnd.bind(this);

    this.AccelParameters = {
      Acceleration: new THREE.Vector3(),
      RotationRate: new THREE.Vector3() 
    };

    this.MobileCodeController = new MobileCodeController(this.onCodeSend.bind(this));

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.onWindowResie);
    this.onDeviceMotion = this.onDeviceMotion.bind(this);
    //window.addEventListener("devicemotion", this.onDeviceMotion);


    // Copy the object that will be changeble;
    this.MessagesController = new MessagesController();

    this.SocketWasConfirm = false;

    this.Socket = new WebSocket(CONSTANTS.WEB_SOCKET_ADDR);

    this.Socket.onopen = function (event) {
        console.log("Socket was open.");
    }.bind(this);

    this.Socket.onmessage = function(event) {
        console.log(event.data);
        let data = JSON.parse(event.data);
        switch(data.Type)
        {
          //Server sent notification that we need to enter code from screen;
          case CONSTANTS.MESSAGES_TYPES.ENTER_YOUR_CODE:

          break;

          //Server sent notification that our code is right;
          case CONSTANTS.MESSAGES_TYPES.USER_CODE_IS_SUBMITTED:
            this.MobileCodeController.hideCodeViewWindow();
            console.log("SUBMITTED");
            this.start();
          break;

          //our code isn't right;
          case CONSTANTS.MESSAGES_TYPES.USER_CODE_IS_NOT_SUBMITTED:
              console.log("NOT SUBMITTED");
          break;

          default:
            console.log("WTF?");
        }
    }.bind(this);


    this.Socket.onclose = function (event) {
      if(event.data)
        event.data = JSON.parse(event.data);
      console.log("Socket was closed.");
      /*
        Now we need to tell User. that Connection was Closed;
      */
    }.bind(this);

  }

  start(){
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
  
    this.LightFireButton = document.createElement("div");
    this.LightFireButton.id = "LightFireButton";
    this.LightFireButton.classList.add("LightFireButton");
    this.LightFireButton.dataset.pressed = 0;

    this.LightFireButton.addEventListener("touchstart", this.onLightFireButtonTouchStart);
    this.LightFireButton.addEventListener("touchend", this.onLightFireButtonTouchEnd);
    
    this.LightFireButton.addEventListener("mousedown", this.onLightFireButtonTouchStart);
    this.LightFireButton.addEventListener("mouseup", this.onLightFireButtonTouchEnd);

    document.body.appendChild(this.LightFireButton);

    
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

    this.Container = document.createElement("div");
    this.Container.id = "Container";
    document.body.appendChild(this.Container);

    this.Renderer = new THREE.WebGLRenderer();
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    this.Container.appendChild(this.Renderer.domElement);
    this.update();

  }

  onCodeSend(code){
    this.MessagesController.AddUserMessageObject.Code = code;
    this.Socket.send(JSON.stringify(this.MessagesController.AddUserMessage));
  }

  update(){
    this.Controls.update();
//    this.mesh.position.add(this.AccelParameters.Acceleration);
//    this.AccelParameters.Acceleration.set(0,0,0);
    
    this.MessagesController.SetPositionMessage = {
      UserID: 0,
      Position: this.mesh.position,
      Rotation: this.mesh.rotation
    };
    
    if(this.Socket.readyState === WebSocket.OPEN){
      this.Socket.send(JSON.stringify(this.MessagesController.SetPositionMessage));
    }
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

  onLightFireButtonTouchStart(event) {
    /**
     * Send to Desktop event about LightFireButton touchstart.
     */
    if(this.Socket.readyState === WebSocket.OPEN && this.LightFireButton.dataset.pressed === "0")
    {
      console.log("down");
      this.Socket.send(JSON.stringify(this.MessagesController.ButtonDownMessage));
      this.LightFireButton.dataset.pressed = "1";
    }
  }

  onLightFireButtonTouchEnd(event) {
    /**
     * Send to Desktop event about LightFireButton touchend.
     */
    if(this.Socket.readyState === WebSocket.OPEN && this.LightFireButton.dataset.pressed === "1")
    {
      console.log("up");
      this.Socket.send(JSON.stringify(this.MessagesController.ButtonUpMessage));
      this.LightFireButton.dataset.pressed = "0";
    }
}

};
