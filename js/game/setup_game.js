core.on("game-turn-done", function(turnColor, curColor) {
	console.log("turn done by ", turnColor.toString(), ", now turn of ", curColor.toString());
});


//--------------------------------
// Управляющий игровой частью
//--------------------------------
function GameMaster(configProvider) {
	var gm = this;
	this.map = null;
	this.players = null;
	this.turn_number = 0;
	
	this.benchmark = false; // DEBUG
	
	configProvider.getConfig(function(err) {
		throw err;
	}, function(conf) {
		gm.setup(conf.generators, conf.players);
	});
}

//---------------------------
// Всякости и полезности
//---------------------------
GameMaster.prototype.isReady = function() {
	return !!this.map;
}

GameMaster.prototype.currentPlayer = function() { //TODO: геттеры-сеттеры?
	return this.players[this.turn_number % this.players.length];
}

GameMaster.prototype.previousPlayer = function() {
	if (this.turn_number == 0) return null;
	return this.players[(this.turn_number-1) % this.players.length];
}


//-------------------
// Инициализация
//-------------------
GameMaster.prototype.setup = function(generators, players) {
	if (this.isReady()) throw new Error("Already initialized");
	var gm = this;
	
	this.map = new Map({
		canvas: theGameCanvas,
		cell_width: pupsConf.cw,
		generators: generators
	});
	
	this.players = players.map(function(p) {
		//TODO: мб http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
		return new p[0](gm, p[1]);
	});
	
	core.on("map-animation-end", function() {
		core.emit("game-animation-end", [gm.previousPlayer(), gm.currentPlayer()]);
		gm.currentPlayer().gotTurn();
	});
	
	var grab_x = NaN, grab_y = NaN, grab_len = NaN;
	function singleDown(x, y) {
		grab_x = x;
		grab_y = y;
		grab_len = 0;
		return true;
	}
	function singleMove(x, y) {
		if (grab_x != grab_x) return;
		grab_len += pointDistance(x, y, grab_x, grab_y);
		grab_x = x;
		grab_y = y;
		return true;
	}
	function singleUp(is_switching) {
		if (grab_x != grab_x) return;
		if (grab_len < 5 && !is_switching) {
			gm.doTurnReal(grab_x, grab_y);
		}
		grab_x = grab_y = grab_len = NaN;
		return true;
	}
	
	function doubleDown(x0, y0, x1, y1) {
		return true;
	}
	function doubleMove(x0, y0, x1, y1) {
		return true;
	}
	function doubleUp(is_switching) {
		return true;
	}
	
	Control.add({
		singleDown: singleDown,
		singleMove: singleMove,
		singleUp: singleUp,
		
		doubleDown: doubleDown,
		doubleMove: doubleMove,
		doubleUp: doubleUp,
		
		//wheelRot: wheelRot,
		
		startElem: theGameCanvas,
		stopElem: document.body
	});
}

//---------------------
// Игровой процесс
//---------------------
GameMaster.prototype.start = function() {
	var gm = this;
	var fps = new FPS(function(fps){ gm.benchmark && console.log(fps) }); // DEBUG
	this.map.drawAll();
	
	function step() {
		gm.map.update();
		if (gm.benchmark) map.drawAll();
		
		fps.update();
		setTimeout(step, gm.benchmark ? 1 : 32);
	}
	step();
}

GameMaster.prototype.performAbility = function(ability, i, j, player) {
	if (player && this.currentPlayer() !== player) return false;
	if (!player && !(this.currentPlayer() instanceof LocalPlayer)) return false;
	
	return ability.act(this.map, i, j, this.currentPlayer().color);
}
GameMaster.prototype.performAbilityReal = function(ability, x, y, player) {
	return this.performAbility(ability, this.map.x2i(x), this.map.y2j(y), player);
}

GameMaster.prototype.doTurn = function(i, j, player) {
	if (player && this.currentPlayer() !== player) return false;
	if (!player && !(this.currentPlayer() instanceof LocalPlayer)) return false;
	
	var delta = 1;
	var color = this.currentPlayer().color;
	var done = this.map.doTurn(i, j, delta, color);
	
	if (done) {
		this.turn_number++;
		core.emit("game-turn-done", [this.previousPlayer(), this.currentPlayer()]);
	}
	return done;
}
GameMaster.prototype.doTurnReal = function(x, y, player) {
	return this.doTurn(this.map.x2i(x), this.map.y2j(y), player);
}



var gameMaster = null;
core.on("window-onload", function() {
	
	gameMaster = new GameMaster(MapConfigProvider.procedural);
	gameMaster.start();
	
	// сокеты? а чего, оно всё равно не работает
});


function LocalPlayer(gm, color) {
	this.color = color;
	
	this.gotTurn = function() {
		//TODO: проверить тут, есть ли, чем ещё ходить
		//      иф (нечем) core.emit("player-loss", [this]);
	}
}


var MapConfigProvider = {};

MapConfigProvider.procedural = {
	_getMapGenerators: function() {
		return [
			[MapGenerator.sizeFixed, pupsConf.w, pupsConf.h],
			MapGenerator.cellRandom,
			MapGenerator.dirMiddleSnake,
			MapGenerator.wallBorder,
			[MapGenerator.hole, true, 0.75, 0.25, 0.15],
			[MapGenerator.playersPositions, this._players.map(function(p){ return p[1] })]
		];
	},
	_players: [
		[LocalPlayer, Color.GREEN],
		[TestAi, Color.RED]
	],
	getConfig: function(onErr, onOk) {
		onOk({
			generators: this._getMapGenerators(),
			players: this._players,
			onGameOver: function(winner){ location.reload() }
		});
	}
};

MapConfigProvider.URL = {
	_players: [
		[LocalPlayer, Color.GREEN],
		[TestAi, Color.RED]
	],
	getConfig: function(onErr, onOk) {
		var m = location.hash.match(/lvl:(.+)/);
		if (m == null) {
			onErr(new Error("No valid lvl data in URL"));
		} else {
			onOk({
				generators: [[MapGenerator.openLevel, decodeURI(m[1])]],
				players: this._players,
				onGameOver: function(winner){ location.reload() }
			});
		}
	}
};

MapConfigProvider.story = {
	_players: [
		[LocalPlayer, Color.GREEN],
		[TestAi, Color.RED]
	],
	_onGameOver: function(winner) {
		if (winner instanceof LocalPlayer) location.hash = "n:"+(level_id+1);
		location.reload();
	},
	getConfig: function(onErr, onOk) {
		var level_id = 0;
		var m = location.hash.match(/n:(\d+)/);
		if (m != null) level_id = +m[1];
		
		XHR('GET', "./res/lvl"+level_id+".txt", null, function(code, data) {
			// ноль? да, ноль. оно при загрузке с file:/// возвращает туда ноль
			// TODO: убрать проверку на ноль потом отсюда нафиг
			if (code != 200 && code != 0) {
				onErr(new Error("Level loading failed, <"+code+">: "+data));
			} else {
				onOk({
					generators: [[MapGenerator.openLevel, data]],
					players: this._players,
					onGameOver: this._onGameOver
				});
			}
		});
	}
}
