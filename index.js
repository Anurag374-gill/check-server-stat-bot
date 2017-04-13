const express = require('express'),
bodyParser = require('body-parser'),
controller = require('./serverController.js'),
request = require('request'),
requireAll = require('require-all'),
validUrl = require('valid-url'),
firebase  = require('firebase'),
admin = require("firebase-admin"),
TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('261219001:AAEtz7spMMNwQQ_AcbCBtKXHAN01gCFVQSI', {
   polling:true 
});
const twilio = require('twilio'),
client = twilio('ACf0d4bb9691bd0aaec2712128dd4e8635', 'AC236f8fe2eff6d382d67267fcb043586c:76f974593dd373a33ae7e8a1359caa6e'),
cronJob = require('cron').CronJob;


bot.setWebHook('https://t.me/GetServerNotificationBot');

// Start Server 
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var serviceAccount = require("./chatbot-61827-firebase-adminsdk.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatbot-61827.firebaseio.com/"
});


var ref = admin.database().ref();
var userRef = ref.child('/user');


//----------------------------------------------------Commands for Telegram Bot------------------------------------------------------//


// 1.  User types /start to get the introdution to the bot

bot.onText(/^\/start/, message => {
    const fromId = message.from.id;
    const response = 'Hi there, I can show you server health status. Enter the command /url followed by a valid url.';
    bot.sendMessage(fromId, response);
});




//2. User types /url www.abc.com to find its response stats continuously

bot.onText(/^\/url/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  if(validUrl.isUri(srcUrl)) { // Check url is valid or not
     controller.checkServerStatus(fromId,srcUrl);
     }
  else
   {
    bot.sendMessage(fromId,"Invalid url : "+'<b>' + srcUrl + '</b>',{ parse_mode: 'HTML' });
   }
});



//3. User types /status www.abc.com to find its response stats only once

bot.onText(/^\/status/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  if(validUrl.isUri(srcUrl)) {
     controller.checkServerStatusOnce(fromId,srcUrl);
     }
  else
   {
     bot.sendMessage(fromId,{ parse_mode: 'Markdown' }, "Invalid url : "+'<b>' + srcUrl + '</b>');
   }
});




//4. User types /process to get processes running on his server
bot.onText(/^\/process/, message => {
  const fromId = message.from.id;
     controller.checkRunningProcesses(fromId);
});



//5. User types /cmd [command] to execute in the server directly
bot.onText(/^\/cmd/, message => {
  const fromId = message.from.id;
  const cmdC = message.text.split(' ').slice(1).join(' ');
  if(cmdC)
     controller.userCmd(fromId,cmdC);
  if(cmdC == '' || cmdC == " ")
    bot.sendMessage("Please enter a valid command");
});



//6. User type /stop to stop receiving server status
bot.onText(/^\/stop/, message => {
  const fromId = message.from.id;
  controller.stopServer(fromId);
});

//7. User types /serverStatus to get server status
bot.onText(/^\/serverstatus/, message => {
  const fromId = message.from.id;
     // push userid and url into the firebase
    var chatId = userRef.push({
      id:fromId
        });
     controller.checkServerStat(fromId);
});


// Notify user with server stats every 6 hours


var jobTest = new cronJob('* */6 * * *', function (){
      console.log("Server is ok ");        
      userRef.orderByKey().once('value')
      .then( id => {
        console.log(id.val());
        controller.checkServerStat(id.val());

      });
  },null,true);


// Notify user if server down for more that 5 seconds id --> 358238116

var job = new cronJob('*/10 * * * *', function (){
      console.log("Testing server");
      if(!controller.checkServerStat(32833282)){     
      userRef.orderByKey().once('value')
      .then( id => {
        console.log(id.val());
        bot.sendMessage(id.val(),"Sever is not responding");
        }
      }
  },null,true);*/




app.get(`/`, (req, res) => res.redirect('https://t.me/GetServerNotificationBot'));
app.listen(process.env.PORT || 3434); 
