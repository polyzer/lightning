if(typeof(CONSTANTS) === undefined)
{
  CONSTANTS = require("constants");
}

class MessagesController {
  constructor() {

    this.AddMasterMessageObject = {
      Type: CONSTANTS.MESSAGES_TYPES.ADD_MASTER,
      UserID: null,
      Code: null
    };
    this.AddUserMessageObject = {
      Type: CONSTANTS.MESSAGES_TYPES.ADD_USER,
      UserID: null,
      Code: null
    };
    this.RemoveUserMessageObject = {
      Type: CONSTANTS.MESSAGES_TYPES.REMOVE_USER,
      UserID: null,
      Code: null
    };
    this.SetPositionMessageObject = {
      Type: CONSTANTS.MESSAGES_TYPES.SET_POSITION,
      UserID: null,
      Position: null,
      Rotation: null
    };
    this.ButtonDownMessageObject = {
      Type: CONSTANTS.MESSAGES_TYPES.FIRE_BUTTON_DOWN,
      UserID: null
    }
    this.ButtonUpMessageObject = {
      Type: CONSTANTS.MESSAGES_TYPES.FIRE_BUTTON_UP,
      UserID: null
    }
  }

  get AddMasterMessage(){
    return this.AddMasterMessageObject;
  }
  get RemoveMasterMessage(){
    return this.RemoveMasterMessageObject;
  }
  get AddUserMessage(){
    return this.AddUserMessageObject;
  }
  get RemoveUserMessage(){
    return this.RemoveUserMessageObject;
  }
  get SetPositionMessage(){
    return this.SetPositionMessageObject;
  }
  get ButtonDownMessage(){
    return this.ButtonDownMessageObject;
  }
  get ButtonUpMessage(){
    return this.ButtonUpMessageObject;
  }


  set AddMasterMessage(json_params){
    this.AddMasterMessageObject.UserID = json_params.UserID;
    this.AddMasterMessageObject.Code = json_params.Code;
  }
  set RemoveMasterMessage(json_params){
    this.RemoveMasterMessageObject.UserID = json_params.UserID;
  }
  set AddUserMessage(json_params){
    this.AddUserMessageObject.UserID = json_params.UserID;
  }
  set RemoveUserMessage(json_params){
    this.RemoveUserMessageObject.UserID = json_params.UserID;
  }
  set SetPositionMessage(json_params){
    this.SetPositionMessageObject.UserID = json_params.UserID;
    this.SetPositionMessageObject.Position = json_params.Position;
    this.SetPositionMessageObject.Rotation = json_params.Rotation;
  }
  set FireButtonDownMessage(json_params){
  }

  set FireButtonUpMessage(json_params){

  }

};

if(typeof(module) !== "undefined"){
  module.exports = MessagesController;
}
