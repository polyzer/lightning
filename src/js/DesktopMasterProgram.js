
/*
  That class devines object, that will be shown
  at the computer, and will be controlled by mobile users.
*/

class DesktopMasterProgram {
    constructor(){
        this.onWindowResize = this.onWindowResize.bind(this);
        this.update = this.update.bind(this);

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
        this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000);
        this.Camera.position.set(0,0,100);

        //it's a users array, that represents as lights on scene;4
        this.Lights = [];
        this.Socket = new WebSocket(CONSTANTS.WEB_SOCKET_ADDR);

        this.Socket.onopen = function (event) {
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


                default:
                throw new Error("sho za huynya???");
            }

        }.bind(this);

        this.Socket.onclose = function (event) {
            console.log("Socket was closed");    
        /*
            Now we need to tell User. that Connection was Closed;
        */
        }.bind(this);



        this.createScene();
        this.update();
    }

    createScene (){
        this.Cubes = [];
        for(let i=0; i< 70; i++)
        {
            let cube = new THREE.Mesh(
                new THREE.BoxBufferGeometry(100, 100, 100),
                new THREE.MeshBasicMaterial({color: 0xFFFFFF})
            );
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
        mesh.add(new THREE.AxesHelper(50));
        this.Scene.add(mesh);
        this.Lights.push(mesh);

        console.log("User was add");
    }
    /*
    IN: json_params = {UserID};
    */
    removeUser(json_params) {
        this.Scene.remove(this.Lights[json_params.UserID].Mesh);
        this.Lights.splice(json_params.UserID, 1);
        console.log("User was spliced");
    }
    /*
    IN: json_params = {UserID, Position,Rotation}
    */
    setPosition(json_params) {
        this.Lights[json_params.UserID].position.copy(json_params.Position);
        this.Lights[json_params.UserID].rotation.copy(json_params.Rotation);
    }

    update(){
        this.stats.update();
        this.Cubes.forEach(function (each){
            each.rotation.x += 0.1;
        });
        this.Renderer.render(this.Scene, this.Camera);
        requestAnimationFrame(this.update);
    }
    
        
    onWindowResize(){
        this.Camera.aspect = window.innerWidth / window.innerHeight;
        this.Camera.updateProjectionMatrix();
        this.Renderer.setSize( window.innerWidth, window.innerHeight );
    }
};