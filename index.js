const express = require('express'),
bodyParser = require('body-parser'),
pidusage = require("pidusage"),
os =require('os');
//Firebase = require('firebase'),
//usersRef = new Firebase('https://firstproject-5ee62.firebaseio.com/Users/');
/*twilio = require('twilio'),
client = twilio('ACf0d4bb9691bd0aaec2712128dd4e8635', 'AC236f8fe2eff6d382d67267fcb043586c:76f974593dd373a33ae7e8a1359caa6e'),
cron = require('node-cron');*/

const request = require('request');
const requireAll = require('require-all');
const validUrl = require('valid-url');
/*const PersistentMemoryStorage = require('./PersistentMemoryStorage'),
    storage = new PersistentMemoryStorage(
        `${__dirname}/data/userStorage.json`,
        `${__dirname}/data/chatStorage.json`
    );*/
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('261219001:AAEtz7spMMNwQQ_AcbCBtKXHAN01gCFVQSI', {
   polling:true, 
});

const app = express();

bot.setWebHook('https://t.me/GetServerNotificationBot');

///Cron job to send text to user every 6 hours
var job = setTimeout(function(){
  checkServerStatus(userStoragePath.data,chatStoragePath.data);
},3000);
  
// Take user input
bot.onText(/^\/url/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  if(validUrl.isUri(srcUrl)) {
     //pass the url to function
     checkServerStatus(fromId,srcUrl);
     }
   else
   {
    bot.sendMessage(fromId,"Invalid url -: "+srcUrl);
   }
});

// Introdution to the bot
bot.onText(/^\/start/, message => {
    const fromId = message.from.id;
    const response = `Hi, I can show you server health status. Enter the command /url followed by a valid url`;
    bot.sendMessage(fromId, response);
  });

//Function to show server status to the user on entering /url

//1.Take the url from the user
//2.Check whether the url is valid
//3. Check the status of the url entered
bot.onText(/^\/url/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  if(validUrl.isUri(srcUrl)) {
     bot.sendMessage(fromId,'Okay lets see the status');
     //pass the url to function
     checkServerStatus(fromId,srcUrl);
     }
   else
   {
    bot.sendMessage(fromId,"Invalid url -: "+srcUrl);
   }
});



//bot text to take process running command
bot.onText(/^\/process/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  //pass the url to function
     checkRunningProcesses(fromId);
});


// Run command from user to server
bot.onText(/^\/cmd/, message => {
  const fromId = message.from.id;
  const cmdC = message.text.split(' ').slice(1).join(' ');
  //pass the url to function
     userCmd(fromId);
});

// Check server stats

function checkServerStatus(fromId,url){
      request(url, function(socket,response,err){
        if(err){
          let result = "Server Error"
          bot.sendMessage(fromId,result);
        }
        if(socket){
          var start = process.hrtime();
          var usageInStart = process.cpuUsage();
        }
        if(response){
          let responsetime = process.hrtime(start);
          let responsecode = response.statusCode;
          let responsemsg = response.statusMessage;
          let cpu_usage = process.cpuUsage(usageInStart);
          let totalUser = ~~(cpu_usage.user)* 0.001;
          let totalSystem = ~~(cpu_usage.system)* 0.001;
          bot.sendMessage(fromId,
            "Execution time:" + responsetime[0]/1000000 + "s " + responsetime[1]/1000000+"ms" + "\nStatus:" + responsecode +

             "\nResponse:" + responsemsg + "\nTotal User:" + totalUser + "\nTotalSystem:" + totalSystem);
        }
      });


}

// check running processes  (systeminfo | findstr Physical) & (systeminfo | findstr Boot)
function checkRunningProcesses(fromId){
  const process= require('child_process');
  request(url,function(err,response){
    if(err){
      let result = "Server Error"
          bot.sendMessage(fromId,result);
    }
      let command = 'ps -e command';
       process.exec(cmdoutput,function (err,stdout,stderr){
        if (err) {
              bot.sendMessage(fromId,"\n"+response.stderr);
          } else {
              bot.sendMessage(fromId,"Running Processes - :" + stdout);
          }

       });
     });
}

// commands From user on server
function userCmd(fromId){

  if(!cmdC)
      return bot.sendMessage(fromId,'Not a valid command');
      var process = require('child_process');
      process.exec(cmdC,function (err,stdout,stderr) {
          if (err) {
              bot.sendMessage(fromId,"\n"+stderr);
          } else {
              bot.sendMessage(fromId,stdout + "\n\n Job done !");
          }
      });
}


app.use(bodyParser.json());
app.get(`/`, (req, res) => res.redirect('https://pure-dusk-89490.herokuapp.com/'));
app.listen(process.env.PORT || 3434); 

/*function exitHandler(exitCode) {
    storage.flush();
    process.exit(exitCode);
}

process.on('SIGINT', exitHandler.bind(null, 0));
process.on('uncaughtException', exitHandler.bind(null, 1));*/