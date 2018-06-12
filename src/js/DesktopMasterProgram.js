
/*
  That class devines object, that will be shown
  at the computer, and will be controlled by mobile users.
*/

class DesktopMasterProgram {
    constructor(){
        this.onWindowResize = this.onWindowResize.bind(this);
        this.onLaserShot = this.onLaserShot.bind(this);
        window.addEventListener("resize", this.onWindowResie);
        this.update = this.update.bind(this);

        let WORLD_CUBE = {
            SIZE: new THREE.Vector3(10, 10, 10),
            SCALE: new THREE.Vector3(6000, 6000, 6000),
            SCALED_SIZE: new THREE.Vector3(10*6000, 10*6000, 10*6000)
        };

        this.MessagesController = new MessagesController();
        this.SocketWasConfirm = false;

        this.Container = document.createElement("div");
        this.Container.id = "Container";

        this.Renderer = new THREE.WebGLRenderer();
        this.Renderer.setSize(window.innerWidth, window.innerHeight);
        this.Container.appendChild(this.Renderer.domElement);
        document.body.appendChild(this.Container);
        this.stats = new Stats();
        this.Container.appendChild(this.stats.dom);
        this.Scene = new THREE.Scene();
        this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100000);
        this.Camera.position.set(0,0,100);


        this.SkyBox = {};
        this.SkyBox.Geometry = new THREE.BoxGeometry(WORLD_CUBE.SIZE.x, WORLD_CUBE.SIZE.y, WORLD_CUBE.SIZE.z);
        this.SkyBox.Geometry.scale(WORLD_CUBE.SCALE.x, WORLD_CUBE.SCALE.y, WORLD_CUBE.SCALE.z);
        this.SkyBox.Material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load("./src/images/textures/skybox_cube_1.png"), 
            side: THREE.DoubleSide
        });
        this.SkyBox.Mesh = new THREE.Mesh(this.SkyBox.Geometry, this.SkyBox.Material);
        this.Scene.add(this.SkyBox.Mesh);

        this.CodeController = new CodeController();


        //it's a users array, that represents as lights on scene;4
        this.Lights = [];
        this.Socket = new WebSocket(CONSTANTS.WEB_SOCKET_ADDR);

        this.Socket.onopen = function (event) {
            // There we setting up parameters for AddMasterMessage, and send it to server.
            this.MessagesController.AddMasterMessage.Code = this.CodeController.Code;
            this.Socket.send(JSON.stringify(this.MessagesController.AddMasterMessage));
            console.log("Socket was open."); 
        }.bind(this);

        this.Socket.onmessage = function(event) {
            let data = JSON.parse(event.data);
            switch(data.Type) {
                case CONSTANTS.MESSAGES_TYPES.SET_POSITION:
                    this.setPosition(data);
                break;

                case CONSTANTS.MESSAGES_TYPES.ADD_USER:
                    this.addUser(data);
                break;

                case CONSTANTS.MESSAGES_TYPES.REMOVE_USER:
                    this.removeUser(data);
                break;

                case CONSTANTS.MESSAGES_TYPES.FIRE_BUTTON_DOWN:
                    this.fireButtonDown(data);
                break;

                case CONSTANTS.MESSAGES_TYPES.FIRE_BUTTON_UP:
                    this.fireButtonUp(data);
                break;

                case CONSTANTS.MESSAGES_TYPES.USER_CODE_IS_SUBMITTED:
                    this.onCodeSubmit();
                    this.addUser(data);
                break;
                
                case CONSTANTS.MESSAGES_TYPES.CONTROLLER_IS_DISCONNECTED:
                    this.onControllerDisconnect();
                break;

                default:
                    console.log(data.Type);
                    throw new Error("sho za huynya???");
            }

        }.bind(this);

        this.Socket.onclose = function (event) {
            console.log("Socket was closed");    
        /*
            Now we need to tell User. that Connection was Closed;
        */
        }.bind(this);

    }

    // If Controller is disconnected;
    onControllerDisconnect()
    {
        if(this.Container)
        {
            window.alert("Connection with Controller is closed");
        }
        console.log("Controller is disconnected");
    }

    hideContainer(){
        if(this.Container){
            this.Container.style.visibility = "hidden";

        }else{
            throw new Error("We have no Container");
        }
    }

    onCodeSubmit()
    {
        console.log("code is submitted");
        this.CodeController.hideCodeViewWindow();
        this.createScene();
        this.update();
    }

    createScene (){
        this.Cubes = [];
        for(let i=0; i< 70; i++)
        {
            let cube = new THREE.Mesh(
                new THREE.BoxBufferGeometry(100, 100, 100),
                new THREE.MeshBasicMaterial({color: 0xFFFFFF*Math.random()})
            );
            cube.rotSpeed = 0;
            cube.position.set(Math.random()*2000 - 1000, Math.random()*2000 - 1000, Math.random()*2000-1000);
            this.Scene.add(cube);
            this.Cubes.push(cube);
        }
    }

    /*
    IN: json_params = {  UserID  };
    */
    addUser(json_params) {
        // let light = new Light(json_params);
        // this.Scene.add(light.Mesh);
        let geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
        let material = new THREE.MeshBasicMaterial( {color: 0xffff00} )
        let mesh = new THREE.Mesh(geometry, material);
        this.laserBeam	= new THREEx.LaserBeam();
//        this.laserBeam.object3d.position.set(10,10,10);
        this.ContainerObject = new THREE.Object3D();
        this.laserBeam.object3d.scale.set(20,20,20);
        this.laserCooked = new THREEx.LaserCooked(this.laserBeam, this.Scene, this.onLaserShot);
        this.ContainerObject.add(mesh);
        /** There are we set looking vector of Camera. */
        this.Camera.lookAt(this.laserBeam.object3d.getWorldDirection(new THREE.Vector3()).multiplyScalar(-1));
        this.Camera.position.set(0, 18, -30);
        this.Camera.rotation.y += Math.PI;
        this.Camera.rotation.x += Math.PI/15;

        this.ContainerObject.add(this.Camera);

        this.Ambientlight = new THREE.AmbientLight( 0xffffff, 0.1 );

        this.Scene.add(this.ContainerObject);
        this.Scene.add(this.Ambientlight);

//        this.Scene.add(this.ContainerObject);
        this.Lights.push(mesh);

        console.log("User was add");
    }
    /*
    IN: json_params = {UserID};
    */
    removeUser(json_params) {
        this.Scene.remove(this.Lights[json_params.UserID]);
        this.Lights.splice(json_params.UserID, 1);
        console.log("User was spliced");
    }
    /*
    IN: json_params = {UserID, Position,Rotation}
    */
    setPosition(json_params) {
        this.ContainerObject.position.copy(json_params.Position);
        this.ContainerObject.rotation.copy(json_params.Rotation);
        //this.laserBeam.object3d.rotation.copy(json_params.Rotation);
        //this.Lights[json_params.UserID].position.copy(json_params.Position);
        //this.Lights[json_params.UserID].rotation.copy(json_params.Rotation);
    }

    fireButtonDown(json_params) {
        this.ContainerObject.add(this.laserBeam.object3d);
    }
    fireButtonUp(json_params) {
        this.ContainerObject.remove(this.laserBeam.object3d);
    }


    update(nowMsec){
        this.stats.update();
        this.Cubes.forEach(function (each){
            each.rotation.x += each.rotSpeed;
        });

        this.lastTimeMsec = this.lastTimeMsec || nowMsec-1000/60;
		this.deltaMsec = Math.min(200, nowMsec - this.lastTimeMsec);
        this.lastTimeMsec = nowMsec;
        if(this.laserCooked)
            this.laserCooked.update(this.deltaMsec/1000, nowMsec/1000);
        this.Renderer.render(this.Scene, this.Camera);
        requestAnimationFrame(this.update);
    }
    
        
    onWindowResize(){
        this.Camera.aspect = window.innerWidth / window.innerHeight;
        this.Camera.updateProjectionMatrix();
        this.Renderer.setSize( window.innerWidth, window.innerHeight );
    }

    onLaserShot(mesh){
        let rot_speed = 0.01;
        if(mesh.material.color.getHex() < 0xFFFFFF){
            mesh.material.color.r += (1 - mesh.material.color.r) / 10;
            mesh.material.color.g += (1 - mesh.material.color.g) / 10;
            mesh.material.color.b += (1 - mesh.material.color.b) / 10;
            this.Ambientlight.intensity += 0.003;
        }
        if(mesh.rotSpeed < 0.3){
            mesh.rotSpeed += rot_speed;
            
        }
    }

};