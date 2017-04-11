const express = require('express'),
bodyParser = require('body-parser'),
controller = require('./serverController.js'),
request = require('request'),
requireAll = require('require-all'),
validUrl = require('valid-url'),
TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('261219001:AAEtz7spMMNwQQ_AcbCBtKXHAN01gCFVQSI', {
   polling:false, 
});

// Start Server 
const app = express();

bot.setWebHook('https://t.me/GetServerNotificationBot');


//----------------------------------------------------Commands for Telegram Bot------------------------------------------------------//


// 1.  User types /start to get the introdution to the bot

bot.onText(/^\/start/, message => {
    const fromId = message.from.id;
    const response = `Hi there, I can show you server health status. Enter the command /url followed by a valid url.`;
    bot.sendMessage(fromId, response);
  });




//2. User types /url www.abc.com to find its health stats continuously

bot.onText(/^\/url/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  if(validUrl.isUri(srcUrl)) { // Check url is valid or not
     controller.checkServerStatus(fromId,srcUrl);
     }
  else
   {
    bot.sendMessage(fromId,{ parse_mode: 'Markdown' }, "Invalid url : "+'<b>' + srcUrl + '</b>');
   }
});



//3. User types /status www.abc.com to find its health stats only once

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
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  //pass the url to function
     controller.checkRunningProcesses(fromId,srcUrl);
});



//5. User types /cmd [command] to execute in the server directly
bot.onText(/^\/cmd/, message => {
  const fromId = message.from.id;
  const cmdC = message.text.split(' ').slice(1).join(' ');
  //pass the url to function
     controller.userCmd(fromId);
});












app.use(bodyParser.json());
app.get(`/`, (req, res) => res.redirect('https://t.me/GetServerNotificationBot'));
app.listen(process.env.PORT || 3434); 
