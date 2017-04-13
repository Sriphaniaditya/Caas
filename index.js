var functions = require('firebase-functions');
var express=require('express');
var schedule=require('node-schedule');
const cors=require('cors')({origin:true});
app=express();
app.use(cors);
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.schedule = functions.https.onRequest((req, res) => {
	var rule = new schedule.RecurrenceRule();
	rule.minute=0;
	rule.hour= [new schedule.Range(4,12)];
	rule.dayOfWeek=[new schedule.Range(1,5)];

	var j=schedule.scheduleJob(rule,function(){
		var ref=admin.database().ref('/Students');
		ref.once("value").then(function(snapshot){
			var snapObj=snapshot.val();
			var myDate = new Date( );
 			var d=myDate.toLocaleString().substring(0,9);
			for(var key in snapObj)
			{	
				refer=admin.database().ref('/Students/'+key);
				calt(refer,d);			
			}
		});
	})
	res.send("OK");
});

exports.addStamp = functions.https.onRequest((req, res) => {
  	const uid = req.query.rfid;
  	if(/(1)[1-6](1)[1-3][0-3](0)(0)[0-9][0-9]/.test(uid))
  	{
		var str=Date(admin.database.ServerValue.TIMESTAMP);
		var hours=parseInt(str.substring(16,18));
		var min=parseInt(str.substring(19,21));
		hours+=5;
		min+=30;
		if(min>60)
			{hours+=1;
			 min-=60}
		var time=hours*100+min;
	  	var check=admin.database().ref('/Students/'+ uid);
	  	check.once("value").then(function(snapshot){
	  		if(snapshot.child("count").exists())
	  		{	
	  			var count=snapshot.child("count").exportVal();
	  			count=count+1;  			
	  		}
	  		else
	  		{
	  			admin.database().ref('/Students/'+ uid+'/count').set(1);
	  			var count=1;
	  		}
	  		admin.database().ref('/Students/'+ uid+'/'+count).set(time);
	  		admin.database().ref('/Students/'+ uid+'/count').set(count);
	  		res.send("OK");
	  	});
  	}
  	else
  		res.send("ERROR");
});

function calt(obj,rd)
{					
	var str=Date(admin.database.ServerValue.TIMESTAMP);																								
	var hours=parseInt(str.substring(16,18));										//Getting hours and minutes out of current date
	var min=parseInt(str.substring(19,21));
	var date="",month="",year="";
	hours+=5;																		//Converting it to IST
	min+=min+30;
	if(min>60)
	{
		hours+=1;
		min-=60
	}	

	obj.once("value").then(function(snapshot)						//Listening once to get the values
	{															
		var count=snapshot.child("count").exportVal();
		var even=0,odd=0,i=0,totalTime=0;
		for(i=1;i+1<=count;i=i+2)
		{															//Calculating time intervals
			even=snapshot.child(i+1+"").exportVal();
			odd=snapshot.child(i+"").exportVal();
			totalTime+=even-odd;
			if(even%100<odd%100)									//Correcting the hours(since full is 60 not 100)
			{
				totalTime-=40;
			}
		}
		if(snapshot.child(i+"").exists())							//if student is in the class at the end
		{	var d=1;
			if(snapshot.child(i+"").exportVal()<hours*100)
			{	
				totalTime+=(hours*100)-snapshot.child(i+"").exportVal()+30-40;
			}
			else
				totalTime+=(hours*100+30)-snapshot.child(i+"").exportVal();
		}
		for(i=1;i<=count;i++)										//Removing the timestamps and count
		{	
			admin.database().ref('/Students/'+ obj.key+'/'+i).remove();	
		}	
		admin.database().ref('/Students/'+obj.key+'/count').remove();
		if(d==1)
		{
			admin.database().ref('/Students/'+obj.key + '/1').set(hours*100+30);
			admin.database().ref('/Students/'+ obj.key+'/count').set(1);
		}
		var day=str.substring(0,4);
		hours-=1;
		if(rd.length==10)
		{
			month=rd.substring(0,2);
			date=rd.substring(3,5);
			year=rd.substring(7,9);
		}
		if(rd.length==9)
		{
			if(rd[1]=='/')
			{
				month="0"+rd[0];
				date=rd.substring(2,4);
				year=rd.substring(7);
			}
			if(rd[2]=='/')
			{
				month=rd.substring(0,2);
				date="0"+rd[3];
				year=rd.substring(7);
			}
		}
		if(rd.length==8)
		{
			month="0"+rd[0];
			date="0"+rd[2];
			year=rd.substring(6);
		}
		var final=day+date+"-"+month+"-"+year+" "+hours+":"+"30";
		if(totalTime>45)
			admin.database().ref('/Students/'+ obj.key + '/'+final).set("Present");
		else
			admin.database().ref('/Students/'+ obj.key + '/'+final).set("Absent");
	});
	console.log("Calculation done at "+Date(admin.database.ServerValue.TIMESTAMP))
}
// 4/12/2017

// led 
// lcd
// hex
// 7seg
// gps
// relay
// dc
