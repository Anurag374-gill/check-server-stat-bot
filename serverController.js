const pidusage = require("pidusage"),
os =require('os'),
request = require('request'),
express = require('express'),
exec = require('child_process').exec;

// CHECK SERVER HEALTH STATUS CONTINUOUSLY TILL USER SESSION CONTINUOUSLY
 function checkServerStatus(fromId,url){
      request(url, function(socket,response,err){
      	let timer = setTimeout(function(){
        if(err){
          let result = "Server Error"
          bot.sendMessage(fromId,result);
        }
    	},5000);
        clearTimeout(timer);
        if(socket){
          var start = exec.hrtime();
          var usageInStart = exec.cpuUsage();
        }
        if(response){
          let response_code = response.statusCode;
          let response_time = exec.hrtime(start);
          let response_msg = response.statusMessage;
          let cpu_usage = exec.cpuUsage(usageInStart);
          let totalUserTime = ~~(cpu_usage.user)/1000;
          let totalSystemTime = ~~(cpu_usage.system)/1000;
          let idleTime = ~~(cpu_usage.idle)/1000;
          let speed = os.cpus().speed;
          bot.sendMessage(fromId,
            "Execution time: " + response_time[0]/1000000 + " s, " + response_time[1]/1000000+"ms" + "\nStatus: " + response_code +
             "\nSpeed: " + speed + "MHz" + "\nResponse: " + response_msg + "\nUser Process Time: " + totalUserTime + " ms"+
             "\nCPU Idle Time: " + idleTime + " ms"+ "\nSystem Process Time: " + totalSystemTime + " ms.");
        }
      });


}

module.exports = checkServerStatus;
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