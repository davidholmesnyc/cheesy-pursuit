
const DEFAULT_SCORE = 0
const DEFAULT_MOUSE_WHEEL = 0
const DEFAULT_ROTTEN_CHEESE = 0
const DEFAULT_LIVES = 3
const DEFAULT_LEVEL = 3
var SCORE = 0
const UP_DOWN_AMOUNT = 8
const LEFT_RIGHT_AMOUNT = 1
// mouse default position
const MOUSE = 1 
const CAT = 2
const CHEESE = 3
const EMPTY = 4
const ROTTEN_CHEESE = 8
const MOUSE_WHEEL = 9
const SPECIAL_CHEESE = [ROTTEN_CHEESE,MOUSE_WHEEL]

var CATS = [5,6,7]
const _CHEESE_ITEM_IMG = "<img src='imgs/cheese.png' width='16' height='16'/>"
const _MOUSE_ITEM_IMG = "<img class='mouse' src='imgs/mouse.png'width='16' height='16'/>"
const _CAT_ITEM_IMG = function(row,column){
  return `<img src='imgs/cat.png' class='cat cat-${row}-${column}' width='16' height='16'/>`
}
const _MOUSE_WHEEL_IMG = "<img src='imgs/MOUSE_WHEEL.png' width='16' height='16'/>"
const _ROTTEN_CHEESE_IMG = "<img src='imgs/ROTTEN_CHEESE.png' width='16' height='16'/>"
var _DIRECTIONS = ["down","up","left","right"]

function newGame(){
  location.reload();
}
const _START_OF_MOUSE = [2,3]


var GRID = [
  [CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE],
  [CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE],
  [CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE],
  [CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE],
  [CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE],
]
GRID[_START_OF_MOUSE[0]][_START_OF_MOUSE[1]] = MOUSE
var GRID_OG = GRID
var CAT_STORE = [CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE,CHEESE]
var CAT_STORE = []

class GameSettings{
	
	constructor(){
		this._level = 1
		this.localStorageName = 'settings'
		this._settings = {
			'MOUSE_WHEEL':DEFAULT_MOUSE_WHEEL,
			'ROTTEN_CHEESE':DEFAULT_ROTTEN_CHEESE,
			'lives':DEFAULT_LIVES,
      'score':DEFAULT_SCORE,
      'level':DEFAULT_LEVEL,
      'grid':GRID
		}
		var settings = this.AllSettings();
		
		if(!settings){
			localStorage.setItem(this.localStorageName,JSON.stringify(this._settings));
		}else{
      this.checkForNewSettings()
    }
    
	}
  newGame(){
      location.reload()
  }
  checkForNewSettings(){
    var settings  = this.AllSettings()
    var current_settings = Object.keys(settings)
    var new_settings = this._settings

    for(let key in this._settings){
      if(!current_settings.includes(key)){
        this.set(key,this._settings[key])
      }
    }
  }

	AllSettings(){
		return JSON.parse(localStorage.getItem(this.localStorageName))
	} 

	get(key){
		return JSON.parse(localStorage.getItem(this.localStorageName))[key]
	} 
	set(key,value) {
		var settings  = this.AllSettings()
		settings[key] = value
		localStorage.setItem(this.localStorageName, JSON.stringify(settings)) ;
	}
	
	resetAll(){
		return localStorage.setItem(this.localStorageName,JSON.stringify(this._settings));
	}   
  reset(key){
    return this.set(key,this._settings[key])
  }
}



function simulateKeyPress (keyCode, type, modifiers) {
	var evtName = (typeof(type) === "string") ? "key" + type : "keydown";	
	var modifier = (typeof(modifiers) === "object") ? modifier : {};

	var event = document.createEvent("HTMLEvents");
	event.initEvent(evtName, true, false);
	event.keyCode = keyCode;
	
	for (var i in modifiers) {
		event[i] = modifiers[i];
	}

	document.dispatchEvent(event);
}

function simulateKey(key){
	simulateKeyPress(key)
}



function simulateKeyPress_(character) {
	// jQuery.event.trigger({ type : 'keydown', which : character.charCodeAt(0) });

	var kbEvent= document.createEvent("KeyboardEvent");
	var initMethod = typeof kbEvent.initKeyboardEvent !== 'undefined' ? "initKeyboardEvent" : "initKeyEvent";

	kbEvent[initMethod](
     "keypress", // event type : keydown, keyup, keypress
      true, // bubbles
      true, // cancelable
      window, // viewArg: should be window
      false, // ctrlKeyArg
      false, // altKeyArg
      false, // shiftKeyArg
      false, // metaKeyArg
      38, // keyCodeArg : unsigned long the virtual key code , else 0
      0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
	);
	document.dispatchEvent(kbEvent);

}


class CheesyPursuit {
constructor(options) {
	this._id = options.id
	this.speed = options.speed || 1000
	this.cat_directions = ["left","up","down","right"]
	this.last_cat_direction  = 0
	this.last_cat_apperence = 1
	this.current_cat_direction = []
	this.mouseFlipped = false
	this.timer = []
	this.settings = new GameSettings()
	// this.settings.score = new Score()
	// this.level = new Level()
	this.mouseIMG = ()=> {

			if(this.mouseFlipped){
				return "<img class='mouse mouse-fliped' src='imgs/mouse.png'width='16' height='16'/>"
			}else{
				return "<img class='mouse' src='imgs/mouse.png' width='16' height='16'/>"
			}
			
	} 
	this._started = 0
	this.MAX_CATS = options.MAX_CATS  || 1
	// this.settings.score = options.score || 0
}

start(){
	this.randomCheese()
	
	this.buildBox()
	// this.startOnKeyPresss
	this.bindKeys(this.startOnKeyPresss)
}

resetBoardAfterBeingCaught(){
	var mouseLocation = this.getIndex(MOUSE)
	
	this.stopTimers()
	this.removeCats()
	this.settings.set("lives",_LIVES)
	
	GRID[mouseLocation[0]][mouseLocation[1]] = EMPTY
	GRID[_START_OF_MOUSE[0]][_START_OF_MOUSE[1]] = MOUSE
	
	this.buildBox()
	this._started = 0 
}

startOnKeyPresss(self,e){
	const arrow_keys = [38, 40, 37,39];
	if (arrow_keys.includes(e.keyCode) && self._started == 0  ){
		
		self.sendCatsTimer = setInterval(function(){ 
				var i = self.cats
				self.startCat() 

		},self.speed)
		// self.sendCat(false)
		self._started = 1 
	}
}

// set started(value) {
//   this._started =value
// }
// get started() {
//     return this._started
// }


getPos(el) {
    // yay readability
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
}

randomCheese(){
	var self = this
	function randomFunc(){
		var random_row = self.random(4)
		var random_column = self.random(6)

		if(self.arraysMatch(_START_OF_MOUSE, [random_row,random_column])){
				return  randomFunc()
				
		}
		return [random_row,random_column]
	}
	for(let cheese in SPECIAL_CHEESE){
				var r = randomFunc()
				console.log("R",r)
				GRID[r[0]][r[1]] = SPECIAL_CHEESE[cheese]
	}
}


youWon(){
	console.log("CHEESE",this.getIndex(CHEESE))
	if(!this.getIndex(CHEESE) && !this.catStoreHasCheese() ){
		this.stopGame()
		this.settings.set("level",1 + this.settings.get("level"))
		this.playSound("win")

		setTimeout(function(){
			alert("Winner Winner Chicken Dinner!")
			
			location.reload()
		},200)
		//location.reload()
		// this.nextLevel()
	}
}

playSound(sound){
	var x = document.getElementById("myAudio");
	x.pause()
	x.src = `sounds/${sound}.WAV`
	x.play()
}

nextLevel(){
	var t = new Game({
		id: this.id,
		speed:(this.speed - 100),
		score:this.settings.get('score')  	
  })

	game.start()
}


bindKeys(callback){

	document.onkeydown = checkKey;
	var self = this
	function checkKey(e) {

	    e = e || window.event;
	   	if (callback) callback(self,e)
      
      if (e.keyCode == '38') {
	     	game.move(MOUSE,"up")
	    }
	    else if (e.keyCode == '40') {
	    	game.move(MOUSE,"down")
	    }
	    else if (e.keyCode == '37') {
	    	self.mouseFlipped = true
	      game.move(MOUSE,"right")
	      
	      
	    }
	    else if (e.keyCode == '39') {
	    	self.mouseFlipped = false
	      game.move(MOUSE,"left")
	     	
	    }
	}

}


gameover(){

	var lives = parseInt(this.settings.get("lives")) - 1 
	this.settings.set("lives",lives)
	if(lives < 0){
		$(".score").html("gameover")
		var self = this
		this.playSound("lost")
		setTimeout(function(){
			alert("Game Over")
			self.settings.set("lives",_LIVES)
			location.reload()
		},500)

		
		this.stopGame()

    this.settings.reset("score")
    this.settings.reset("level")
  //   this.level.reset()
		// this.score.reset()
		// this.level.reset()
		return
	}

	this.playSound("cat_caught_mouse")
	this.resetBoardAfterBeingCaught()
	setTimeout(function(){
		alert("Oh no you got caught")
	},200)
	$(".livescounter").html(lives)
	//alert("gameover")
	
}

displayBoxItem(item,row,column){ 
	return `<span class='box box-${row}-${column}'>${item}</span>` 
}
// youWon(){
// 	if(!this.getIndex(CHEESE)){
// 		alert("you won")
// 	}
// }

stopTimers(){
	clearInterval(this.timer)
	clearInterval(this.sendCatsTimer)

	for(var x in this.timer){
		clearInterval(this.timer[x])
	}
}
stopGame(){
		this.stopTimers()
		document.onkeydown = false
		console.log("STOPP")

}

getIndex(type){
	var row = 0
	var column = 0
	var arr = []
	for(let x in GRID){
		row = x 
		for(let b in GRID[x]){
			if( GRID[x][b] === type){
				column = b
				// arr.push([parseInt(row),parseInt(column)])
				return [parseInt(row),parseInt(column)]
			} 
		}


	}

  	// if (arr.length > 0){
  	// 	return arr
  	// }

  	return false
  }
getCatLocations(){
	var row = 0
	var column = 0
	var arr = []
	for(let x in GRID){
		row = x 
		for(let b in GRID[x]){
			if(CATS.includes(GRID[x][b])){
				column = b
				arr.push([parseInt(row),parseInt(column)])
				
			} 
		}
	}

	if (arr.length > 0){
		return arr
	}

	return false
}




livesBox(){
	return `<div class='lives top'><img src='imgs/mouse.png'width="12"><span class="livescounter">${this.settings.get('lives')}</span></div>`
}

scoreBox(){
	return `<div class='score top'>${this.settings.get("score")}</div>`
}

levelBox(){
	return `<div class='level top'>Level: ${this.settings.get("level")}</div>`
}

rottenCheeseBox(){
	return `<div class='ROTTEN_CHEESE top'>${_ROTTEN_CHEESE_IMG} ${this.settings.get("ROTTEN_CHEESE")}</div>`
}  
mouseWheelBox(){
	return `<div class='MOUSE_WHEEL top'>${_MOUSE_WHEEL_IMG} ${this.settings.get("MOUSE_WHEEL")}</div>`
}



buildBox(){
	var html = `<div class="topContainer">
	${this.scoreBox()}
	${this.livesBox()}
	
	${this.rottenCheeseBox()}
	${this.mouseWheelBox()}
	${this.levelBox()}

	</div>`

	html += "<div class='grid'>"

	var row = ""
	for (let row in GRID){

		html += `<div class='row'>`
		for(let column in GRID[row]){
			switch(GRID[row][column]) {
			  case MOUSE:
			    var boxItem = this.mouseIMG()
			    break;
			  case CHEESE:
			    var boxItem = _CHEESE_ITEM_IMG
			    break;
			  case CAT:
			    var boxItem = _CAT_ITEM_IMG(row,column)
			    break;
			  case MOUSE_WHEEL:
			    var boxItem = _MOUSE_WHEEL_IMG
			    break;
			  case ROTTEN_CHEESE:
			    var boxItem = _ROTTEN_CHEESE_IMG
			    break;
			  default:
			    var boxItem = ''
			}
			
			
			if(CATS.includes(GRID[row][column])){
				var boxItem = _CAT_ITEM_IMG(row,column)
			}

			html += this.displayBoxItem(boxItem,row,column)
		}
		html += "</div>"
	}

	html +="</div>" // grid html 
	$(this._id).html(html)
	this.youWon()
}


// moveCat(){
// 	for(let cat in CATS){
// 			var get_cat_location = this.getIndex(CATS[cat])
// 			if(get_cat_location){
// 				setInterval()
// 				console.log(get_cat_location)
	// 		}
// 	}

// }
avaiablegridBox(row,column){
	if
	(
		typeof GRID[row] === 'undefined'  || 
		typeof GRID[row][column] === 'undefined' 
	)
	{
		return false
	}
	return true
}

// progress(){
// 	$("#score").html()
// }
arraysMatch(arr1, arr2) {

	// Check if the arrays are the same length
	if (arr1.length !== arr2.length) return false;

	// Check if all items exist and are in the same order
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	// Otherwise, return true
	return true;

};

addScore(nextPosition){

	if(GRID[nextPosition[0]][nextPosition[1]] === CHEESE ){

    var current_score = this.settings.get("score")
    var new_score = 1 * (parseInt(this.settings.get("MOUSE_WHEEL")) || 1) + current_score
    this.settings.set("score", new_score )
		$("#score").html(this.settings.get("score"))
		
	}
	
	if(GRID[nextPosition[0]][nextPosition[1]] === MOUSE_WHEEL ){
		
		var itemScore = parseInt(this.settings.get("MOUSE_WHEEL")) + 1 
		this.settings.set("MOUSE_WHEEL",itemScore)
		$(".MOUSE_WHEEL").html(itemScore)
		
		return this.playSound('woohoo-mouse')
		
	}
	
	if(GRID[nextPosition[0]][nextPosition[1]] === ROTTEN_CHEESE ){
		
		var itemScore = parseInt(this.settings.get("ROTTEN_CHEESE")) + 1 
		this.settings.set("ROTTEN_CHEESE",itemScore)
		$(".ROTTEN_CHEESE").html(itemScore)
		
		return this.playSound('woohoo-mouse')
		
	}

	this.playSound("mouse_mov")
	return 



	

}
checkForCat(nextPosition){
	if(GRID[nextPosition[0]][nextPosition[1]] === this.getIndex(CAT)){
		this.gameOver()
	}else{
		return true
	}
}

checkifCatnearby(location){
	for(let cat in CATS){
		var get_cat_location = this.getIndex(CATS[cat])
		if(get_cat_location){
			if(this.arraysMatch(location,[get_cat_location[0],get_cat_location[1]]) ){
				console.log("CATS NERBY")
					return true

			}
		}
	}
	return false
}
// MOVE FUNCTIONS 
move(itemType,direction){
	var row = this.getIndex(itemType)[0]
	var column = this.getIndex(itemType)[1]
	var nextPosition = {
		'down':[( row + 1), column],
		'up':[row - 1,column],
		'left':[row,column + 1],
		'right':[row,column - 1],
		"topright":[row,column - 1]
	}
	var [newRow,newColumn] = [nextPosition[direction][0],nextPosition[direction][1]]
	
	// if they don't exist but it's a cat then restore previous one
		if (!this.avaiablegridBox(newRow,newColumn) && CATS.includes(itemType)){
				
				clearInterval(this.timer[itemType])
			GRID[row][column] = CAT_STORE[itemType]
			this.buildBox()
  		return
		}

		// if they don't exist on the grid then don't make any changes 
		if (!this.avaiablegridBox(newRow,newColumn)) return 
	
	
	if(itemType === MOUSE){
		// if my next move has a cat then it's game over
		if(CATS.includes(GRID[newRow][newColumn])){
		// if(GRID[newRow][newColumn] === CAT ){
			return this.gameover()
		}


		
		// you got the cheese so now empty  
		GRID[row][column] = EMPTY	
		this.youWon()
		
		// add score if cheese
		this.addScore(nextPosition[direction])

	}

	if(CATS.includes(itemType)){
		if(this.checkifCatnearby([newRow,newColumn])) return 
	// 	if(CAT_STORE[itemType] === CHEESE){
	// 		GRID[row][column] = CAT_STORE[itemType]
	// 		CAT_STORE[itemType] = GRID[newRow][newColumn]
	// 	}else{
	// 		GRID[row][column] = EMPTY
	// 		CAT_STORE[itemType] =  GRID[newRow][newColumn]
		// }
		console.log("catstore",CAT_STORE[itemType])
		GRID[row][column] = CAT_STORE[itemType]
		CAT_STORE[itemType] = GRID[newRow][newColumn]
		
		var mouselocation = this.getIndex(MOUSE)
		
		if( this.arraysMatch(mouselocation, [newRow,newColumn])){
			this.gameover()
		} 
		// check if cat nearby	
		
	}
	
	// set the next postion
	GRID[newRow][newColumn] = itemType
	// rebuild box
	this.buildBox()


	return [newRow,newColumn]
}


random(max){
	var oldValue = parseInt(oldValue)
	var max = parseInt(max)
	var r = Math.round(Math.random() * max)
	// if(r === oldValue){
	// 	return this.random(oldValue,max)
	// }
	return parseInt(r)
}

	
addCat(direction){
 	var cd = {
 		"down":[0,2],
 		"up":[4,5],
 		"left":[1,0],
 		"right":[2,6],
	}
	console.log("CAT LOCATIONS",this.getCatLocations().length )
	if(this.getCatLocations().length >= this.MAX_CATS){
		return 
	}

	console.log("DIRECCCTIN",direction)
 	for(let cat in CATS){
 		var get_cat_location = this.getIndex(CATS[cat])
 		if(!get_cat_location && get_cat_location === false){
 			
 			CAT_STORE[CATS[cat]] = GRID[cd[direction][0]][cd[direction][1]]
 			
 			GRID[cd[direction][0]][cd[direction][1]] = CATS[cat]

 			this.current_cat_direction[CATS[cat]] = direction




 			this.buildBox()

 			// var div = $(`.cat-${cd[direction][0]}-${cd[direction][1]}`);
 			// console.log("div",div)
 			// div.animate({direction: '100px'},this.speed);


 			this.autoCat(CATS[cat],direction)
 			return true
		}
 	}
}

removeCats(){

	 	for(let cat in CATS){
			var get_cat_location = this.getIndex(CATS[cat])
	 		if(get_cat_location){
	 			GRID[get_cat_location[0]][get_cat_location[1]] = CAT_STORE[CATS[cat]]
	 			
				
	 			return true
			}
	 	}
}


catStoreHasCheese(){
	

	for(let cat in CATS){
		var get_cat_location = this.getIndex(CATS[cat])
		if( get_cat_location && CAT_STORE[CATS[cat]] === CHEESE){
			return true
		}

	}
	return false
}


autoCat(cat,direction){
	 	var self = this
	 	if(typeof this.timer[cat] != "undefined") {
	 		clearInterval(this.timer[cat])
	 		// alert(true)
	 	}
	 	var timerFunction= function(){
	 		game.move(cat,direction)
	 	}



	 	this.timer[cat] = setInterval(timerFunction,this.speed)

 }

 startCat(){
 		// var random = this.random(this.last_cat_direction,this.cat_directions.length)
 		var random = this.random( (this.cat_directions.length - 1 ))
 		var randomCatLocation = this.cat_directions[random]	
 		// this.addCat("right")
 		this.addCat(randomCatLocation)

 		// this.last_cat_direction = random
 }

}
