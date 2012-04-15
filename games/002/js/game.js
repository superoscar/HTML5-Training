$(document).ready(function(){
	var canvas = $("#gameCanvas");
	var context = canvas.get(0).getContext("2d");
	
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	var playGame;
	var platformX;
	var platformY;
	var platformOuterRadius;
	var platformInnerRadius;
	
	var stars;
	
	var player;
	var playerOriginalX;
	var playerOriginalY;
	
	var playerSelected;
	var playerMaxAbsV;
	var playerVd;
	var powerX;
	var powerY;
	
	var score;
	
	var ui = $("#gameUI");
	var uiInfo = $("#gameInfo");
	var uiStats = $("#gameStats");
	var uiComplete = $("#gameComplete");
	var uiPlay = $("#gamePlay");
	var uiReset = $(".gameReset");
	var uiRemaining = $("#gameRemaining");
	var uiScore = $(".gameScore");
	
	//对象
	var Star = function(x,y,radius,m,friction){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.m = m;
		this.friction = friction;
		this.vX = 0;
		this.vY = 0;
		this.player = false;
	};
	
	function resetPlayer(){
		player.x = playerOriginalX;
		player.y = playerOriginalY;
		player.vX = 0;
		player.vY = 0;
	};
	
	function startGame(){
		playGame = false;
		platformX=canvasWidth/2;
		platformY=150;
		platformOuterRadius=100;
		platformInnerRadius=75;
		stars = new Array();
		
		playerSelected = false;
		playerMaxAbsV = 30;
		playerVd = 0.3;
		powerX = -1;
		powerY = -1;
		
		score = 0;
		
		var pRadius = 15;
		var pM = 10;
		var pFriction = 0.97;
		playerOriginalX = canvasWidth/2;
		playerOriginalY = canvasHeight-150;
		
		player = new Star(playerOriginalX,playerOriginalY,pRadius,pM,pFriction);
		player.player = true;
		stars.push(player);
		
		var outerRing = 8;
		var ringCount = 3;
		var ringSpacing = (platformInnerRadius/(ringCount-1));
		
		for(var r=0;r<ringCount;r++){
			var currentRing = 0;
			var angle = 0;
			var ringRadius = 0;
			
			if(r==ringCount-1){
				currentRing = 1;
			}else {
				currentRing = outerRing-(r*3);
				angle = 360/currentRing;
				ringRadius = platformInnerRadius-(ringSpacing*r);
			};
			
			for(var a=0;a<currentRing;a++){
				var x=0;
				var y=0;
				
				if(r==ringCount-1){
					x=platformX;
					y=platformY;
				}else{
					x=platformX+(ringRadius*Math.cos((angle*a)*(Math.PI/180)));
					y=platformY+(ringRadius*Math.sin((angle*a)*(Math.PI/180)));
				};
				
				var radius = 10;
				var m = 5;
				var friction = 0.95;
				stars.push(new Star(x,y,radius,m,friction));
			};
		};
		
		uiRemaining.html(stars.length-1);
		uiScore.html("0");
		uiStats.show();
		
		$(window).mousedown(function(e){
			if(!playerSelected && player.x==playerOriginalX && player.y==playerOriginalY){
				var canvasOffset = canvas.offset();
				var canvasX = Math.floor(e.pageX - canvasOffset.left);
				var canvasY = Math.floor(e.pageY - canvasOffset.top);
				
				if(!playGame){
					playGame = true;
					animate();
				};
				
				var dX = player.x - canvasX;
				var dY = player.y - canvasY;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
				var padding = 5;
				
				if(distance < player.radius+padding){
					powerX = player.x;
					powerY = player.y;
					playerSelected = true;
				};
				
			};
		});
		
		$(window).mousemove(function(e){
			if(playerSelected){
				var canvasOffset = canvas.offset();
				var canvasX = Math.floor(e.pageX -canvasOffset.left);
				var canvasY = Math.floor(e.pageY - canvasOffset.top);
				
				var dX = canvasX-player.x;
				var dY = canvasY-player.y;
				var distance=Math.sqrt((dX*dX)+(dY*dY));
				
				if(distance*playerVd<playerMaxAbsV){
					powerX = canvasX;
					powerY = canvasY;
				}else{
					var ratio = playerMaxAbsV/(distance*playerVd);
					powerX = player.x + (dX*ratio);
					powerY = player.y + (dY*ratio);
				};
			};
		});
		
		$(window).mouseup(function(e){
			if(playerSelected){
				var dX = powerX - player.x;
				var dY = powerY - player.y;
				player.vX = -(dX*playerVd);
				player.vY = -(dY*playerVd);
				uiScore.html(++score);
			};
			
			playerSelected = false;
			powerX = -1;
			powerY = -1;
		});
		
		animate();
	};
	
	function init(){
		uiStats.hide();
		uiComplete.hide();
		
		uiPlay.click(function(e){
			e.preventDefault();
			uiInfo.hide();
			startGame();
		});
		
		uiReset.click(function(e){
			e.preventDefault();
			uiComplete.hide();
			startGame();
		});
	};
	
	function animate(){
		context.clearRect(0,0,canvasWidth,canvasHeight);
		context.fillStyle="rgb(150,150,150)";
		context.beginPath();
		context.arc(platformX,platformY,platformOuterRadius,0,Math.PI*2,true);
		context.closePath();
		context.fill();
		
		if(playerSelected){
			context.strokeStyle="rgb(220,220,0)";
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(player.x,player.y);
			context.lineTo(powerX,powerY);
			context.closePath();
			context.stroke();
		};
		
		if(player.x != playerOriginalX && player.y != playerOriginalY){
			if(player.vX ==0 && player.vY ==0){
				resetPlayer();
			}else if(player.x + player.radius<0){
				resetPlayer();
			}else if(player.x - player.radius>canvasWidth){
				resetPlayer();
			}else if(player.y+player.radius<0){
				resetPlayer();
			}else if(player.y-player.radius>canvasHeight){
				resetPlayer();
			};
		};
		
		
		
		var deadStars = new Array();
		var starsLength = stars.length;
		
		for(var i=0;i<starsLength;i++){
			var tmpStar = stars[i];
			
			for(var j=i+1;j<starsLength;j++){
				var tmpStarB = stars[j];
				
				var dX = tmpStarB.x - tmpStar.x;
				var dY = tmpStarB.y - tmpStar.y;
				var distance = Math.sqrt((dX*dX)+(dY*dY));
				if(distance<tmpStar.radius + tmpStarB.radius){
					var angle = Math.atan2(dY,dX);
					var sine = Math.sin(angle);
					var cosine = Math.cos(angle);
					
					var x = 0;
					var y = 0;
					
					var xB = dX * cosine + dY * sine;
					var yB = dY * cosine - dX * sine;
					
					var vX = tmpStar.vX*cosine + tmpStar.vY*sine;
					var vY = tmpStar.vY*cosine - tmpStar.vX*sine;
					
					var vXb = tmpStarB.vX*cosine + tmpStarB.vY*sine;
					var vYb = tmpStarB.vY*cosine + tmpStarB.vX*sine;
					
					var vTotal = vX-vXb;
					vX=((tmpStar.m - tmpStarB.m)*vX+2*tmpStarB.m*vXb)/(tmpStar.m+tmpStarB.m);
					vXb = vTotal + vX;
					
					xB = x + (tmpStar.radius + tmpStarB.radius);
					
					tmpStar.x = tmpStar.x + (x*cosine-y*sine);
					tmpStar.y = tmpStar.y + (y*cosine+x*sine);
					
					tmpStarB.x = tmpStar.x + (xB*cosine-yB*sine);
					tmpStarB.y = tmpStar.y + (yB*cosine+xB*sine);
					
					tmpStar.vX = vX*cosine -vY*sine;
					tmpStar.vY = vY*cosine + vY*sine;
					
					tmpStarB.vX = vXb * cosine - vYb *sine;
					tmpStarB.vY = vYb * cosine - vXb * sine;
				}
				
			};
			
			tmpStar.x += tmpStar.vX;
			tmpStar.y += tmpStar.vY;
			
			if(Math.abs(tmpStar.vX)>0.1){
				tmpStar.vX *= tmpStar.friction;
			}else{
				tmpStar.vX=0;
			};
			
			if(Math.abs(tmpStar.vY)>0.1){
				tmpStar.vY *= tmpStar.friction;
			}else{
				tmpStar.vY = 0;
			};
			
			
			if(tmpStar.player){
				context.fillStyle="rgb(200,0,0)";
			}else{
				context.fillStyle="rgb(255,255,255)";
				
				var dXp = tmpStar.x - platformX;
				var dYp = tmpStar.y - platformY;
				var distanceP = Math.sqrt((dXp*dXp) + (dYp*dYp));
				if(distanceP > platformOuterRadius){
					if(tmpStar.radius>0){
						tmpStar.radius -=1;
					}else{
						deadStars.push(tmpStar);
					};
				};
			};
			context.beginPath();
			context.arc(tmpStar.x,tmpStar.y,tmpStar.radius,0,Math.PI*2,true);
			context.closePath();
			context.fill();
			
		};
		
		var deadStarLength = deadStars.length;
		if(deadStarLength>0){
			for(var di=0;di<deadStarLength;di++){
				var tmpDeadStar = deadStars[di];
				stars.splice(stars.indexOf(tmpDeadStar),1);
			};
			
			var remaining = stars.length -1;
			uiRemaining.html(remaining);
			if(remaining==0){
				playGame = false;
				uiStats.hide();
				uiComplete.show();
				$(window).unbind("mousedown");
				$(window).unbind("mouseup");
				$(window).unbind("mouseover");
			};
		};
		if(playGame){
			setTimeout(animate,33);
		};
	};
	init();
});