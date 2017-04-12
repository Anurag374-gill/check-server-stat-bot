const pidusage = require("pidusage"),
os =require('os'),
request = require('request'),
express = require('express'),
exec = require('child_process').exec;
TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('261219001:AAEtz7spMMNwQQ_AcbCBtKXHAN01gCFVQSI', {
   polling:false 
});


// CHECK SERVER HEALTH STATUS CONTINUOUSLY TILL USER SESSION CONTINUOUSLY
 exports.checkServerStatus = function (fromId,url){
      request(url, function(socket,response,err){
      	var date = '';
      	var connection = false;
        if(err){
          if(err.code == 408 || err.code == 404 || err.code == 400 || err.code == 403)	
          {
          	let result = "Server Error. Please try again."
          bot.sendMessage(fromId,result);
      }
    	}
        if(socket){
        	setTimeout(function(){
        	 bot.sendMessage(fromId,'Cannot connect to the server');
        },5000);
          var start = process.hrtime();
          var usageInStart = process.cpuUsage();
        }
        if(response){
        intervalId = setInterval(function(){
          let response_code = response.statusCode;
          let response_time = process.hrtime(start);
          let response_msg = response.statusMessage;
          date = Date(Date.now()).toString();
          connection = true;

          //let cpu_usage = process.cpuUsage(usageInStart);
          //let totalUserTime = ~~(cpu_usage.user)/1000;
          //let totalSystemTime = ~~(cpu_usage.system)/1000;
          //let idleTime = ~~(cpu_usage.idle)/1000;
          //let load = process.loadavg()[0];
          bot.sendMessage(fromId,
            "Response time: " + ~~((response_time[0]/1000000)-1) + " s, " + ~~(response_time[1]/1000000) +"ms" + "\nStatus: " + response_code +
             "\nResponse: " + response_msg + "\nDate: " + date + 
             "\nAlive: " + connection);
          },5000);
        }
      });
    }


// To stop the server

exports.stopServer = function(fromId){
      clearInterval(intervalId);
      bot.sendMessage(fromId,'Monitoring stopped');
}

// CHECK SERVER STATUS ONLY ONCE
 exports.checkServerStatusOnce = function (fromId,url){
      request(url, function(socket,response,err){
      	var date = '';
      	var connection = false;
        if(err){
          if(err.code == 408 || err.code == 404 || err.code == 400 || err.code == 403)	
          {
          	let result = "Server Error. Please try again."
          bot.sendMessage(fromId,result);
      }
    	}
        if(socket){
        	setTimeout(function(){
        	 bot.sendMessage(fromId,'Cannot connect to the server');
        },5000);
          var start = process.hrtime();
          var usageInStart = process.cpuUsage();
        }
        if(response){
          let response_code = response.statusCode;
          let response_time = process.hrtime(start);
          let response_msg = response.statusMessage;
          date = Date(Date.now()).toString();
          connection = true;
          bot.sendMessage(fromId,
            "Response time: " + ~~((response_time[0]/1000000)-1) + " s, " + response_time[1]/1000000+"ms" + "\nStatus: " + response_code +
             "\nResponse: " + response_msg + "\nDate: " + date + 
             "\nAlive: " + connection);
        }
      });
    }

 // CHECK RUNNING PROCESSES

exports.checkRunningProcesses = function(fromId) {
			cmd = 'ps -r';
		exec(cmd, function(err, stdout, stderr) {
			    if (err) {
			        bot.sendMessage(fromId,"\n"+stderr);
			    } else {
			    	console.log(stdout);
			        bot.sendMessage(fromId,"Running Processes - " + stdout);
			    }
			});

	}

/*
 // check running processes  (systeminfo | findstr Physical) & (systeminfo | findstr Boot)
export function checkRunningProcesses(fromId,url){
  const process= require('child_process');
  request(url,function(err,response){
    if(err){
      let result = "Server Error"
          bot.sendMessage(fromId,result);
    }
      
      if(response){
        let command = 'ps -e command,%cpu,%mem';
       process.exec(command,function (err,stdout,stderr){
        if (err) {
              bot.sendMessage(fromId,"\n"+stderr);
          } else {
              bot.sendMessage(fromId,"Running Processes - :" + stdout);
          }

       });
     }
     });
}


// commands From user on server
export function userCmd(fromId){

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




// check server down time
export function checkServer (fromId,url){
   request(url,function(socket,response){
    if(socket){
      var start = process.hrtime();
    }
    if(response){
      let responsetime = process.hrtime(start);
      let uptime = responsetime[1]/1000000;
      if(uptime > 5){
        bot.sendMessage(fromId,'Server is slow/down');
      }
      bot.sendMessage(fromId,(checkServerStatus(fromId,url)));
    }
   });
 }









/*function exitHandler(exitCode) {
    storage.flush();
    process.exit(exitCode);
}

process.on('SIGINT', exitHandler.bind(null, 0));
process.on('uncaughtException', exitHandler.bind(null, 1));*/