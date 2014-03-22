var stage, inoImage, humImage, text,
	queue = new createjs.LoadQueue(),
    text = new createjs.Text("Loading..", "40px Bold Aria"),
    image = {},
    card = {},
    currentStageId = 1,
	animContainer = new createjs.Container(),
	currentStage
	lowRes = true;


function onIntroEnd() {
	//Тут интро заканчивается и начинается игра
	console.log("end");
	window.location.href = "game.html";
}

window.onload = onLoad;
function onLoad() {
	stage = new createjs.Stage("canvas");
	stage.addChild(text);
	updateSceneSize();

	queue.addEventListener("complete", handleComplete);
	queue.loadManifest(resourcesLow);

	function handleComplete() {
		stage.removeChild(text);

		var el = ge("wrapper");
	  	// el.addEventListener("touchend", function() { openNextStage() }, false);
	  	el.addEventListener("click", function(e) { openNextStage() }, false);

	  	createjs.Ticker.addEventListener("tick", handleTick);

		showStage(currentStageId);
    }
};

function handleTick() {
	console.log("tick");
	stage.update();
}

function openNextStage() {
	createjs.Tween.get(animContainer).to({ x: -1337}, 1000, createjs.Ease.quadIn).call(onComplete);
	function onComplete() {
		console.log("tweened");
		removeStage();

		if (currentStageId == 6)
			onIntroEnd();
		else 
			showStage(++currentStageId);
	}
}

function showStage(stageId) {
	var stageName = "stage" + stageId;
	//config
	var c = stages[stageName];
	currentStage = c;

	if (c.align == "left")
		animContainer.x = -1337;
	else 
		animContainer.x = stageW;

	inoImage = new createjs.Bitmap(queue.getResult(c.dialogImage));
	inoImage.scaleX = inoImage.scaleY = 2;
	inoImage.x = 0;
	inoImage.y = 0;

	text = new createjs.Text(c.dialogText, c.fontStyle, c.fontColor);
	text.x = c.textCoordX;
	text.y = c.textCoordY;

	stage.addChild(animContainer);
	animContainer.addChild(inoImage);
	animContainer.addChild(text);
	stage.update();

	// var tweenToX;
	// console.log(stageW);
	// c.align == "left" ? tweenToX = 0 : tweenToX = stage.canvas.width - 1337;
	// console.log("tweenforX" + tweenToX);
	// createjs.Tween.get(animContainer).to({ x: tweenToX}, 1000, createjs.Ease.quadIn);
	createjs.Tween.get(animContainer).to({ x: 0}, 1000, createjs.Ease.linear);
	
}

function removeStage() {
	stage.removeChild(animContainer);
	animContainer.removeChild(inoImage);
	animContainer.removeChild(text);
}

window.onresize = function(event) {
	updateSceneSize();
};

function updateSceneSize() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	stage.canvas.width = w;
	stage.canvas.height = h;

	if (h > w) {
		var scaleCoef = (w - 50) / stageW;
	} else {
		var scaleCoef = (h - 50) / stageH;
	}
	
	console.log("Screen width=" + w + " scaleCoef=" + scaleCoef);
	stage.scaleX = stage.scaleY = scaleCoef;

	stage.update();
}

function ge(elem) {
	return document.getElementById(elem);
}