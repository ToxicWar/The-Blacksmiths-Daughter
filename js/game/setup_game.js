core.on("game-turn-done", function(turnPlayer, curPlayer) {
	console.log(
		"turn done by ", turnPlayer.color.toString(),
		", now turn of ", curPlayer.color.toString());
});

core.on("game-player-loss", function(player) {
	alert(player.color.toString()+" out");
});


//--------------------------------
// Управляющий игровой частью
//--------------------------------
function GameMaster(configProvider) {
	var gm = this;
	this.map = null;
	this.players = null;
	this.turn_number = 0;
	this.cur_player_id = 0;
	
	this.benchmark = false; // DEBUG
	
	configProvider.getConfig(function(err) {
		throw err;
	}, function(conf) {
		gm.setup(conf.generators, conf.players, conf.onGameOver);
		gm.start();
	});
}

//---------------------------
// Всякости и полезности
//---------------------------
GameMaster.prototype.isReady = function() {
	return !!this.map;
}

GameMaster.prototype.currentPlayer = function() { //TODO: геттеры-сеттеры?
	return this.players[this.cur_player_id];
}

GameMaster.prototype.previousPlayer = function() {
	var id = this.cur_player_id==0 ? this.players.length-1 : this.cur_player_id-1;
	return this.players[id];
}


//-------------------
// Инициализация
//-------------------
GameMaster.prototype.setup = function(generators, players, onGameOver) {
	if (this.isReady()) throw new Error("Already initialized");
	var gm = this;
	
	this.map = new Map({
		canvas: theGameCanvas,
		cell_width: pupsConf.cw,
		generators: generators
	});
	
	this.players = players.map(function(p) {
		//TODO: мб http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
		return new p[0](gm, p[1]); //function, color
	});
	this.allPlayers = this.players.slice();
	
	this.colorFor = function(id) {
		return this.allPlayers[id].color;
	}
	
	core.on("map-animation-end", function() {
		var player = gm.currentPlayer();
		
		if (gm.map.hasColorsLike(player.color)) {
			player.gotTurn();
			//TODO: mb player.loss();
		} else {
			gm.players.splice(gm.cur_player_id, 1);
			if (gm.cur_player_id == gm.players.length) gm.cur_player_id = 0;
			if (gm.players.length == 1) onGameOver(gm.players[0]);
			core.emit("game-player-loss", [player]);
		}
		
		core.emit("game-animation-end", [gm.previousPlayer(), gm.currentPlayer()]);
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
		this.cur_player_id++;
		if (this.cur_player_id == this.players.length) this.cur_player_id = 0;
		core.emit("game-turn-done", [this.previousPlayer(), this.currentPlayer()]);
	}
	return done;
}
GameMaster.prototype.doTurnReal = function(x, y, player) {
	return this.doTurn(this.map.x2i(x), this.map.y2j(y), player);
}



var gameMaster = null;
core.on("window-onload", function() {
	
	//gameMaster = new GameMaster(MapConfigProvider.procedural);
	//gameMaster = new GameMaster(MapConfigProvider.URL);
	//gameMaster = new GameMaster(MapConfigProvider.story);
	gameMaster = new GameMaster(
		MapConfigProvider.makeSequential(
			[MapConfigProvider.URL, MapConfigProvider.story]
		)
	);
	
	// сокеты? а чего, оно всё равно не работает
});


function LocalPlayer(gm, color) {
	this.color = color;
	
	this.gotTurn = function() {
		
	}
}


var MapConfigProvider = {};

MapConfigProvider.procedural = {
	_getMapGenerators: function() {
		return [
			[MapGenerator.sizeFixed, pupsConf.w, pupsConf.h],
			[MapGenerator.cellRandom, Color.GRAY],
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
			onGameOver: function(winner){ alert("Win! reload..."); location.reload() }
		});
	}
};

MapConfigProvider.URL = {
	_players: [
		[LocalPlayer, Color.GREEN],
		[TestAi, Color.RED]
	],
	_getColors: function() {
		return {
			players: this._players.map(function(p){ return p[1] }),
			neutral: Color.GRAY
		};
	},
	getConfig: function(onErr, onOk) {
		var provider = this;
		var m = location.hash.match(/lvl:(.+)/);
		if (m == null) {
			onErr(new Error("No valid lvl data in URL"));
		} else {
			onOk({
				generators: [[MapGenerator.openLevel, decodeURI(m[1]), provider._getColors()]],
				players: provider._players,
				onGameOver: function(winner){ alert("Win! reload..."); location.reload() }
			});
		}
	}
};

MapConfigProvider.story = {
	_level_id: 0,
	_players: [
		[LocalPlayer, Color.GREEN],
		[TestAi, Color.RED]
	],
	_getColors: function() {
		return {
			players: this._players.map(function(p){ return p[1] }),
			neutral: Color.GRAY
		};
	},
	_onGameOver: function(winner) {
		if (winner instanceof LocalPlayer) location.hash = "n:"+(this._level_id+1);
		alert("Win! next...");
		location.reload();
	},
	getConfig: function(onErr, onOk) {
		var provider = this;
		var m = location.hash.match(/n:(\d+)/);
		if (m != null) this._level_id = +m[1];
		
		XHR('GET', "./res/lvl"+this._level_id+".txt", null, function(code, data) {
			// ноль? да, ноль. оно при загрузке с file:/// возвращает туда ноль
			// TODO: убрать проверку на ноль потом отсюда нафиг
			if (code != 200 && code != 0) {
				onErr(new Error("Level loading failed, <"+code+">: "+data));
			} else {
				onOk({
					generators: [[MapGenerator.openLevel, data, provider._getColors()]],
					players: provider._players,
					onGameOver: provider._onGameOver.bind(provider)
				});
			}
		});//TODO: on XHR error
	}
};

MapConfigProvider.makeSequential = function(providers) {
	return {
		getConfig: function(onErr, onOk) {
			var i = 0;
			function iter(err) {
				if (i == providers.length) onErr(err);
				providers[i++].getConfig(iter, onOk);
			}
			iter(null);
		}
	}
}


