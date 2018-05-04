/*
  Class defines Mobile user, that connects to the Server;
  and he will be shown on Computer Screen.
*/
class Light {
  constructor(json_params){
    let json_params_names = ["ID"];
    setJSONParams(json_params, json_params_names, this);

    let geometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0xffff00} )

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.add(new THREE.AxesHelper(5));
  }

  get Mesh(){
    return this.mesh;
  }
  set Mesh(tmesh){
    this.mesh = tmesh;
  }

  get ID(){
    return this.id;
  }
  set ID(id){
    this.id = id;
  }

  get Position(){
    return this.mesh.rotation;
  }
  set Position(position){
    this.mesh.position.copy(position);
  }

  get Rotation(){
    return this.mesh.rotation;
  }
  set Rotation(rotation){
    this.mesh.rotation.copy(rotation);
  }

};
