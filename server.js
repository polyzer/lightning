
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
    // There will be all slaves;
    this.Clients = [];
    // There will be all masters;
    this.Masters = [];

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

    ws.onmessage = this.onUnsortedMessage.bind(ws);
    ws.close = this.onUnsortedClose.bind(ws);
  }
  /* There we set to msg ID;
    that ID knows only one server cause Main(Desktop) Script
    has only one.
  */
  onUnsortedMessage (event) {
    console.log(event.data);
    let data = JSON.parse(event.data);

    switch(data.Type)
    {
      case this.progDataSelf.CONSTANTS.MESSAGES_TYPES.ADD_USER:
        this.progDataSelf.removeFromUnsortedAndAddToClients(this);   
      break; 
      case this.progDataSelf.CONSTANTS.MESSAGES_TYPES.ADD_MASTER:
        this.progDataSelf.removeFromUnsortedAndAddToMasters(this);    
      break; 
      default:
        throw new Error("sho za huynya???");

    }
  }

  onUnsortedClose (event) {
    this.progDataSelf.Unsorted.splice(this.progDataID);
  }
  
  ///////////////////////////////////
  onClientClose (event) {
    this.progDataArray.splice(this.progDataID, 1);
    let data = JSON.stringify({Type: this.progDataSelf.CONSTANTS.MESSAGES_TYPES.REMOVE_USER, UserID: this.progDataID});
    for(let i = 0; i < this.progDataSelf.Masters.length; i++)
    {
      this.progDataSelf.Masters[i].send(data);
    }
    console.log("WebSocket Connection was closed. id: " + this.progDataID);
  }
  onClientMessage (event) {
    let data = JSON.parse(event.data);
    data.UserID = this.progDataID;
    data = JSON.stringify(data);
//    console.log(data);
    for(let i = 0; i < this.progDataSelf.Masters.length; i++)
    {
      this.progDataSelf.Masters[i].send(data);
    }
    
  }
  /////////////////////////////
  onMasterClose (event) {
    this.progDataArray.splice(this.progDataID, 1);
    console.log("WebSocket Connection was closed. id: " + this.progDataID);
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

    /// FUCKIN KOSTYL.
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
};

let serverProgram = new ServerProgram();
