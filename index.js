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





// connect to the database


var ref = admin.database().ref('/');
var userRef = ref.child('/user');
var urlRef =  ref.child('/url');
var statusrRef =  ref.child('/status');
var dbPush = function (fromId,srcUrl,err) {
      if(err)
        console.log('Push failed')
     userRef.push(fromId);
     urlRef.push(srcUrl);
  }



//----------------------------------------------------Commands for Telegram Bot------------------------------------------------------//


// 1.  User types /start to get the introdution to the bot

bot.onText(/^\/start/, message => {
    const fromId = message.from.id;
    const response = 'Hi there, I can show you server health status. Enter the command /url followed by a valid url.';
    bot.sendMessage(fromId, response);
});




//2. User types /url www.abc.com to find its health stats continuously DONE!

bot.onText(/^\/url/, message => {
  const fromId = message.from.id;
  const srcUrl = message.text.split(' ').slice(1).join(' ');
  if(validUrl.isUri(srcUrl)) { // Check url is valid or not
     controller.checkServerStatus(fromId,srcUrl);
     dbPush(fromId,srcUrl);
     }
  else
   {
    bot.sendMessage(fromId,"Invalid url : "+'<b>' + srcUrl + '</b>',{ parse_mode: 'HTML' });
   }
});

/*usersRef.once(‘value’, function (snap) {
 snap.forEach(function (childSnap) {
  console.log(‘user’, childSnap.val());
 });
});*/

//3. User types /status www.abc.com to find its health stats only once DONE!

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




//4. User types /process to get processes running on his server DONE!
bot.onText(/^\/process/, message => {
  const fromId = message.from.id;
  //const srcUrl = message.text.split(' ').slice(1).join(' ');
  //pass the url to function
     controller.checkRunningProcesses(fromId);
});



//5. User types /cmd [command] to execute in the server directly DONE!
bot.onText(/^\/cmd/, message => {
  const fromId = message.from.id;
  const cmdC = message.text.split(' ').slice(1).join(' ');
  //pass the url to function
  if(cmdC)
     controller.userCmd(fromId,cmdC);
  if(cmdC == '' || cmdC == " ")
    bot.sendMessage("Please enter a valid command");
});

//6. User type /stop to stop receiving server status DONE!
bot.onText(/^\/stop/, message => {
  const fromId = message.from.id;
  controller.stopServer(fromId);
});


// Cron job to send notification to user 
/*
var job = new cronJob( '* * * * *', function(){
    userRef.once('value', function (url) {
       url.forEach(function (err,url) {
        var stat = controller.checkServerStatusOnce(fromId,url);
        statusRef.push(stat);
        if(err){


        }
    });
});

    // cron job that checks a given url every 30 seconds
    var checkServerJob = new CronJob('*30 * * * * *', () => {  
    urlRef.once('value')
      .then(url => {
        return  util.checkServer(url.val());
      })
      .then((output) => {
        statusRef.push(output);
      })
      .catch((output) => {
        statusRef.push(output);
        util.sendSMS(config.twilioNum, config.clientNum, `${output.status.msg}!`);
        userRef.once('value')
          .then(user => {
            bot.sendMessage(user.val(), `Server Unresponsive, tracking is stopped\n\n----------------------------\nStatus:\n\n${JSON.stringify(output.status, null, 2)}`);
            jobEmitter.emit('stop', checkServerJob);
            jobEmitter.emit('stop', reportServerJob);
          });
      });
  }, () => { console.log('Server Unresponsive, stopping the cron job and sending sms...'); }, false);
*/

    // cron job that reports via telegram bot every minute
  var job = new cronJob('*/1 * * * *', () => {
    let user = userRef.once('value');
    let status = statusRef.orderByKey().limitToLast(5).once('value');
    Promise.all([user, status]).then(values => {
      if (values[0].val() != null && values[1].val() != null) {
        bot.sendMessage(values[0].val(), JSON.stringify(values[1].val(), null, 2));
      }
    }).catch(err => {
      console.log(err);
    });
  }, () => { console.log('Stop monitoring server...'); }, false);


app.get(`/`, (req, res) => res.redirect('https://t.me/GetServerNotificationBot'));
app.listen(process.env.PORT || 3434); 



