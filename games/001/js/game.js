$(document).ready(function(){
	var canvas = $("#gameCanvas");
	var context= canvas.get(0).getContext("2d");
	
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	
	var playGame;
	var stars;
	var numStars;
	var player;
	var score;
	var scoreTimeout;
	var arrowUp = 38;
	var arrowRight = 39;
	var arrowDown = 40;
	
	var Player = function(x,y){
		this.x = x;
		this.y = y;
		this.width=24;
		this.height = 24;
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;
		this.vX = 0;
		this.vY = 0;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.flameLength = 20;
	}
	var Star = function(x,y,radius,vX){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
	}
	
	var ui=$("#gameUI");
	var uiInfo=$("#gameInfo");
	var uiStats=$("#gameStats");
	var uiComplete=$("#gameComplete");
	var uiPlay=$("#gamePlay");
	var uiReset=$(".gameReset");
	var uiScore=$(".gameScore");
	
	function startGame(){
		uiScore.html("0");
		uiStats.show();
		
		playGame=false;
		
		stars = new Array();
		numStars = 10;
		score = 0;
		player = new Player(150,canvasHeight/2);
		
		for(var i=0;i<numStars;i++){
			var radius = 5 + (Math.random()*10);
			var x=canvasWidth+radius+Math.floor(Math.random()*canvasWidth);
			var y=Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			
			stars.push(new Star(x,y,radius,vX));
		};
		
		$(window).keydown(function(e){
			var keyCode = e.keyCode;
			if(!playGame){
				playGame = true;
				animate();
				timer();
			};
			
			if(keyCode == arrowRight){
				player.moveRight=true;
			}else if(keyCode==arrowUp){
				player.moveUp=true;
			}else if(keyCode == arrowDown){
				player.moveDown=true;
			};
		});
		$(window).keyup(function(e){
			var keyCode = e.keyCode;
			if(keyCode == arrowRight){
				player.moveRight=false;
			}else if(keyCode==arrowUp){
				player.moveUp=false;
			}else if(keyCode == arrowDown){
				player.moveDown=false;
			};
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
			$(window).unbind("keyup");
			$(window).unbind("keydown");
			clearTimeout(scoreTimeout);
			startGame();
			});
	};
	
	function timer(){
		if(playGame){
			scoreTimeout = setTimeout(function(){
				uiScore.html(++score);
				timer();
				},1000);
		};
	};
	
	function animate(){
		context.clearRect(0,0,canvasWidth,canvasHeight);
		
		
		var starsLength = stars.length;
		for(var i=0;i<starsLength;i++){
			var tmpStar = stars[i];
			tmpStar.x += tmpStar.vX;
			if(tmpStar.x+tmpStar.radius<0){
				tmpStar.radius=5+(Math.random()*10);
				tmpStar.x = canvasWidth+tmpStar.radius;
				tmpStar.y = Math.floor(Math.random()*canvasHeight);
				tmpStar.vX = -5-(Math.random()*5);
			};
			
			var dX = player.x - tmpStar.x;
			var dY = player.y - tmpStar.y;
			var distance = Math.sqrt((dX*dX)+(dY*dY));
			
			if(distance < player.halfWidth + tmpStar.radius){
				playGame = false;
				clearTimeout(scoreTimeout);
				uiStats.hide();
				uiComplete.show();
				
				$(window).unbind("keyup");
				$(window).unbind("keydown");
			};
			
			context.fillStyle="rgb(255,255,255)";
			context.beginPath();
			context.arc(tmpStar.x,tmpStar.y,tmpStar.radius,0,Math.PI*2,true);
			context.closePath();
			context.fill();
		};
		
		
		player.vX =0;
		player.vY =0;
		if(player.moveRight){
			player.vX=3;
		}else{
			player.vX=-2;
		};
		if(player.moveUp){
			player.vY=-3;
		};
		if(player.moveDown){
			player.vY=3;
		};
		
		
		player.x+=player.vX;
		player.y+=player.vY;
		
		if(player.x-player.halfWidth<20){
			player.x=20+player.halfWidth;
		}else if(player.x+player.halfWidth>canvasWidth-20){
			player.x = canvasWidth-20-player.halfWidth;
		};
		if(player.y-player.halfHeight<20){
			player.y=20+player.halfHeight;
		}else if(player.y+player.halfHeight>canvasHeight-20){
			player.y = canvasHeight-20-player.halfHeight;
		};
		
		
		if(player.moveRight){
			context.save();
			context.translate(player.x-player.halfWidth,player.y);
			if(player.flameLength == 20){
				player.flameLength = 15;
			}else{
				player.flameLength = 20;
		};
		context.fillStyle="orange";
		context.beginPath();
		context.moveTo(0,-5);
		context.lineTo(-player.flameLength,0);
		context.lineTo(0,5);
		context.closePath();
		context.fill();
		
		context.restore();
		};
		
		context.fillStyle="rgb(200,120,0)";
		context.beginPath();
		context.moveTo(player.x+player.halfWidth,player.y);
		context.lineTo(player.x-player.halfWidth,player.y-player.halfHeight);
		context.lineTo(player.x-player.halfWidth,player.y+player.halfHeight);
		context.closePath();
		context.fill();
		
		while(stars.length<numStars){
			var radius = 5 +(Math.random()*10);
			var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);
			
			stars.push(new Star(x,y,radius,vX));
		};
		
		if(playGame){
			setTimeout(animate,33);
		}
	}
	init();
});