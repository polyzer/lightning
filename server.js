/**
 * This object defines:
 * Master - computer program, that displays Scene,
 * Controllers - mobilet programs, that works as controllers for Master program.
 */
let MasterAndControllers = {
  Master: null,
  Controllers: []
};

let MasterAndController = {
  Master: null,
  Controller: null,
  Code: null
};

/**
 * It's main program.
 */
class ServerProgram {
  constructor() {
    this.removeFromUnsortedAndAddToMasters = this.removeFromUnsortedAndAddToMasters.bind(this);
    this.removeFromUnsortedAndAddToClients = this.removeFromUnsortedAndAddToClients.bind(this);
    this.onConnection = this.onConnection.bind(this);

    const fs = require('fs');
    const https = require('https');
    //let WebSocketServer = new require("ws");
    const WebSocket = require('ws');
    this.CONSTANTS = require('./src/js/constants');
    
    const server = new https.createServer({
      key: fs.readFileSync("/etc/apache2/ssl/www_polyzer_org/www.polyzer.org_private.key"),
    	cert: fs.readFileSync("/etc/apache2/ssl/www_polyzer_org/www_polyzer_org.crt")
    });
    this.webSocketServer = new WebSocket.Server({ server });

    // There adds all users on connection;
    this.Unsorted = [];

    this.MastersAndControllers = [];


    //    this.webSocketServer = new WebSocketServer.Server({port: 8081});

    this.webSocketServer.on("connection", this.onConnection);
    server.listen(8081);
    console.log("WebSocketServer start!");
  }
  /* There we set our data parameters to WebSocket object;
    that will help us find ID as soon as possible.
  */
  onConnection (ws) {
    ws.progDataArray = this.Unsorted;
    ws.progDataID = this.Unsorted.length;
    ws.progDataSelf = this;

    this.Unsorted.push(ws);
    console.log("There is new Connection");

    ws.onmessage = this.onUnsortedMessage.bind(ws);
    ws.close = this.onUnsortedClose.bind(ws);
  }
  /* There we set to msg ID;
    that ID knows only one server cause Main(Desktop) Script
    has only one.
  */
  onUnsortedMessage (event) {
    console.log(event.data);
    console.log(this.progDataSelf.CONSTANTS.MESSAGES_TYPES.ADD_USER);

    let data = JSON.parse(event.data);

    switch(data.Type)
    {
      case this.progDataSelf.CONSTANTS.MESSAGES_TYPES.ADD_USER:
        /**
         * Add controller by Code to Master.
         */
        let answer_message = {
          Type: null
        };

         for(let i = 0; i < this.progDataSelf.MastersAndControllers.length; i++)
         {
           if(this.progDataSelf.MastersAndControllers[i].Code === data.Code)
           {
            this.progDataSelf.MastersAndControllers[i].Controller = this;
            this.progDataSelf.Unsorted.splice(this.progDataID, 1);
            this.progDataPair = this.progDataSelf.MastersAndControllers[i];
            this.onmessage = this.progDataSelf.onControllerMessage.bind(this);
            this.onclose = this.progDataSelf.onControllerClose.bind(this);
            answer_message.Type = this.progDataSelf.CONSTANTS.MESSAGES_TYPES.USER_CODE_IS_SUBMITTED;
            this.send(JSON.stringify(answer_message));   
            this.progDataPair.Master.send(JSON.stringify(answer_message));
            return;
           }
         }
         /**If Code, that user send isn't right! 
          * we must send him notification.
         */
         answer_message.Type = this.progDataSelf.CONSTANTS.MESSAGES_TYPES.USER_CODE_IS_NOT_SUBMITTED;
         this.send(JSON.stringify(answer_message));
      break; 
      case this.progDataSelf.CONSTANTS.MESSAGES_TYPES.ADD_MASTER:
        //this.progDataSelf.removeFromUnsortedAndAddToMasters(this);  
        /**
         * Add controller by code to Master.
         */
        let pair = Object.create(MasterAndController);
        pair.Master = this;
        pair.Code = data.Code;
        this.progDataSelf.MastersAndControllers.push(pair);
        this.progDataSelf.Unsorted.splice(this.progDataID, 1);
        this.progDataPair = pair;
        this.onmessage = this.progDataSelf.onMasterMessage.bind(this);
        this.onclose = this.progDataSelf.onMasterClose.bind(this);
        console.log("WS was remove from Unsorted and Add to MastersAndControllers pair: " + this.progDataID);
        console.log(this.progDataPair);
//      this.progDataSelf.removeFromUnsortedAndCreate_MasterControllersObject_AndAddMaster(this);  
      
      break; 
      default:
        throw new Error("sho za huynya???");

    }
  }

  onUnsortedClose (event) {
    this.progDataSelf.Unsorted.splice(this.progDataID);
  }
  
  ///////////////////////////////////
  onControllerClose (event) 
  {
    let idx = this.progDataSelf.MastersAndControllers.indexOf(this.progDataPair);
    if(idx !== -1)
      if(!this.progDataPair.Controller)
      {
        this.progDataSelf.MastersAndControllers.splice(idx, 1);
        this.progDataPair = null;
      } else {
        let answer_message = {Type: this.progDataSelf.CONSTANTS.MESSAGES_TYPES.CONTROLLER_IS_DISCONNECTED};
        this.progDataPair.Master.send(JSON.stringify(answer_message));
        this.progDataPair.Master.close();
        this.progDataSelf.MastersAndControllers.splice(idx, 1);
        this.progDataPair = null;
      }    
  }

  onControllerMessage (event) {
    let data = JSON.parse(event.data);
    data.UserID = this.progDataID;
    //console.log(data);
    this.progDataPair.Master.send(JSON.stringify(data));

  }
  /////////////////////////////
  onMasterClose (event) 
  {
    let idx = this.progDataSelf.MastersAndControllers.indexOf(this.progDataPair);
    if(idx !== -1)
      if(!this.progDataPair.Controller)
      {
        this.progDataSelf.MastersAndControllers.splice(idx, 1);
        this.progDataPair = null;
      } else {
        let answer_message = {Type: this.progDataSelf.CONSTANTS.MESSAGES_TYPES.MASTER_IS_DOSCONNECTED};
        this.progDataPair.Controller.send(JSON.stringify(answer_message));
        this.progDataPair.Controller.close();
        this.progDataSelf.MastersAndControllers.splice(idx, 1);
        this.progDataPair = null;
      }    
  }
  onMasterMessage (msg) {
    console.log("Was message from Master: " + this.progDataID + " " + msg);
  }
  //////////////////////////////
  removeFromUnsortedAndAddToMasters (ws) {
    this.Unsorted.splice(ws.progDataID, 1);
    ws.progDataArray = this.Masters;
    ws.progDataID = this.Masters.length;
    ws.onmessage =  this.onMasterMessage.bind(ws);
    ws.onclose = this.onMasterClose.bind(ws);
    this.Masters.push(ws);    
    console.log("WS was remove from Unsorted and Add to Masters: " + (ws.progDataID));
  }
  removeFromUnsortedAndAddToClients (ws) {
    this.Unsorted.splice(ws.progDataID, 1);
    ws.progDataArray = this.Clients;
    ws.progDataID = this.Clients.length;
    ws.onmessage = this.onClientMessage.bind(ws);
    ws.onclose = this.onClientClose.bind(ws);

    /// PHUCKIN KOSTYL'.
    /// There we need to use MessagesController ... But we have no him.
    let data = JSON.stringify({Type: this.CONSTANTS.MESSAGES_TYPES.ADD_USER, UserID: ws.progDataID});
    for(let i = 0; i < this.Masters.length; i++)
    {
      this.Masters[i].send(data);
      console.log("was SEND: " + data);
    }

    this.Clients.push(ws);    
    console.log("WS was remove from Unsorted and Add to Clients: " + (ws.progDataID));
  }

  /**
   * 
   * @param {WebSocket} ws  
   */
  removeFromUnsortedAndCreate_MasterControllersObject_AndAddMaster(ws){
  
  }

  /**
   * 
   * @param {WebSocket} ws WebSocket object
   * @param {string} code It's a code that identifies Master_Controller_Pair 
   */
  removeFromUnsortedAndAddControllerToMaster(ws, code, master)
  {
    this.Unsorted.splice(ws.progDataID, 1);
    ws.progDataCode = code;
    ws.progDataMaster = master;
    ws.onmessage = this.onClientMessage.bind(ws);
    ws.onclose = this.onClientClose.bind(ws);
    master.progDataController = ws;
    for(let i = 0; i < this.MastersAndControllers.length; i++){

    }

    console.log("WS was remove from Unsorted and Add to Clients: " + (ws.progDataCode));
  }
};

let serverProgram = new ServerProgram();
