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
          bot.sendMessage(fromId,
            "Response time: " + ~~((response_time[0]/1000000)-1) + " s, " + ~~(response_time[1]/1000000) +"ms" + "\nStatus: " + response_code +
             "\nResponse: " + response_msg + "\nDate: " + date + 
             "\nAlive: " + connection);
          },5000);
        }
      });
    }


// TO STOP THE SERVER

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
		exec( 'ps -e', function(err, stdout, stderr) {
			    if (err) {
			        bot.sendMessage(fromId,"\n"+stderr);
			    } else {
			    	console.log(stdout);
			        bot.sendMessage(fromId,"Running Processes - \n" + stdout);
			    }
			});

	}


// EXECUTE COMMAND DIRECTLY TO THE SERVER 


exports.userCmd = function(fromId,cmdC){
	exec(cmdC,function (err,stdout,stderr) {
			    if (err) {
			        bot.sendMessage(fromId,"\n"+stderr);
			    } else {
			        bot.sendMessage(fromId,stdout + "\n\n Job done !");
			    }
			});
}

// CHECK SERVER AND SEND NOTIFICATIONS TO USER
exports.checkServerStat = function (fromId){
      	let date = Date(Date.now()).toString();
        var cpus = os.cpus();	
         bot.sendMessage(fromId,"The health status of this server is :\n");
		for(var i = 0, len = cpus.length; i < len; i++) {
			var cpu = cpus[i], total = 0, processTotal = 0, strPercent = '';
			console.log("User time in ms: " + cpu.times.user + "\nSystem time in ms:" + cpu.times.sys + "\n Idle time in ms: " + cpu.times.idle );
			for (type in cpu.times){
				var total = total + cpu.times[type];
			}
			for (type in cpu.times){
				var percent = ~~(100 * cpu.times[type]/total);
				strPercent += type + ' ' + percent + '%';
				if(type != 'idle'){
					processTotal += percent;	
			}
		}
		console.log("\t",strPercent)
		console.log("\t",'Total Processor: ',total);
		console.log("\t",'TOTAL: ',processTotal + "%");
		console.log("\t","free memory in MB:", os.freemem()/(1024*1024));
		console.log("\t","total memory in MB:", os.totalmem()/(1024*1024));
		console.log("\t","uptime", os.uptime()/(60*60) + "hours.");
		console.log("\t","loadavg", os.loadavg());
        bot.sendMessage(fromId,"Cpu :" + i+1 + 
         	"\nServer Performance : " + strPercent + 
             "\nProcesses comsuming: " + processTotal + "%" +
        	"\nFree memory available in MB:" + os.freemem()/(1024*1024) + "\nTotal Memory Available : " + os.totalmem()/(1024*1024) +
        	"\nUptime (in hrs): " + os.uptime()/(60*60) + "\nLoad Average : " + os.loadavg());
          }
      }
