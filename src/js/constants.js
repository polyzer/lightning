/*
  CONSTANTS defines all constants
*/
function setJSONParams(json_params, names_array, obj)
{
  for(let param_name in names_array)
    if(json_params[param_name])
      obj[param_name] = json_params[param_name];
    else
      throw new Error("We have no needed parameter: " + param_name);
};

const CONSTANTS = {
   MESSAGES_TYPES : {
     ADD_USER: 0,
     REMOVE_USER: 1,
     SET_POSITION: 2,
     FIRE_BUTTON_DOWN: 3,
     FIRE_BUTTON_UP: 4,
     ADD_MASTER: 5
   },
   WEB_SOCKET_ADDR : "wss://www.polyzer.org:8081"
};

if(typeof(module) !== "undefined")
{
  module.exports = CONSTANTS;
}