import socket from "./ws-client";
import {
  UserStore
} from "./storage";
import {
  ChatForm,
  ChatList,
  promptForUsername
} from "./dom";

const FORM_SELECTOR = "[data-chat=\"chat-form\"]";
const INPUT_SELECTOR = "[data-chat=\"message-input\"]";
const LIST_SELECTOR = "[data-chat=\"message-list\"]"; //for messages list

//let username = ""; //calls username prompt to appear
let userStore = new UserStore("x-chattrbox/u");
let username = userStore.get();
if (!username){
  username = promptForUsername();
  userStore.set(username);
}
//will be used for application logic
class ChatApp{
  //constructor
  constructor(){
    this.chatForm = new ChatForm(FORM_SELECTOR, INPUT_SELECTOR); //creates new ChatForm with
    this.chatList = new ChatList(LIST_SELECTOR, username); // used to be 'wonderwoman'
    socket.init("ws://localhost:3001");

    socket.registerOpenHandler(() => {
      this.chatForm.init((data) => {
        let message = new ChatMessage({message: data});
        socket.sendMessage(message.serialize());
      });
      this.chatList.init(); // initializes the chatList init for timestamp
    });

    socket.registerMessageHandler((data) => {
      console.log(data);
      let message = new ChatMessage(data); //gets the data and creates new ChatMessage
      this.chatList.drawMessage(message.serialize()); //serializes the data and sends it to the
    });
  }
}

class ChatMessage{
  constructor({
    message: m,
    user: u = username,
    timestamp: t =  (new Date()).getTime()
  }){
    this.message = m;
    this.user = u;
    this.timestamp = t;
  }
  serialize(){
    return{
      user: this.user,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

export default ChatApp;