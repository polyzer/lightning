/*
  That class defines Programs that will be
  executed on computer/mobile "slave" device.
*/

class DesktopSlaveProgram {
  constructor(){
    //it's a users array, that represents as lights on scene;
    this.update = this.update.bind(this);
    // Copy the object that will be changeble;
    this.Messages = Object.create(MESSAGES);

    this.Controls = new THREE.FlyControls();

    let geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.add(new THREE.AxesHelper(5));

    this.Socket = new WebSocket("ws://localhost:8081");

    this.Socket.onopen = function (event) {
        console.log("Socket was open.");
    }.bind(this);

    this.Socket.onmessage = function(event) {

    }.bind(this);


    this.Socket.onclose = function (event) {
      if(event.data)
        event.data = JSON.parse(event.data);
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

    this.Scene = new THREE.Scene();
    this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000);
  }

  update(){
    this.Controls.update();
    this.Renderer.render(this.Scene, this.Camera);

    this.Socket.send(JSON.stringify());
    requestAnimationFrame(this.update);
  }
};
