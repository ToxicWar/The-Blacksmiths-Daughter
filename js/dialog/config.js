var resources = [
	    { id: "ino11", src: "./static/img/ino11.png" },
	    { id: "ino22", src: "./static/img/ino22.png" },
	    { id: "ino33", src: "./static/img/ino33.png" },
	    { id: "cuz11", src: "./static/img/cuz11.png" },
	    { id: "cuz22", src: "./static/img/cuz22.png" },
	    { id: "cuz33", src: "./static/img/cuz33.png" }
	];

var resourcesLow = [
	    { id: "ino11", src: "./static/img/ino11_lowres.png" },
	    { id: "ino22", src: "./static/img/ino22_lowres.png" },
	    { id: "ino33", src: "./static/img/ino33_lowres.png" },
	    { id: "cuz11", src: "./static/img/cuz11_lowres.png" },
	    { id: "cuz22", src: "./static/img/cuz22_lowres.png" },
	    { id: "cuz33", src: "./static/img/cuz33_lowres.png" }
	];


var options = {
	standart: {
		inoDialogX: "180",
		inoDialogY: "850",
		kuzDialogX: "280",
		kuzDialogY: "950"
	}

};

var stages = {
	stage1: {
		dialogImage:"ino11",
		dialogImageX:"0",
		dialogImageY:"0",
		align:"left",

		dialogText:"Хахахаха",
		textCoordX: 230,
		textCoordY: options.standart.inoDialogY,
		fontStyle: "60px Arial",
		fontColor: "#00FF00"
	},

	stage2: {
		dialogImage:"cuz11",
		dialogImageX:"0",
		dialogImageY:"0",
		align:"right",

		dialogText:"Верните мою дочь,\n гнусные инопланетяне!",
		textCoordX: options.standart.kuzDialogX,
		textCoordY: options.standart.kuzDialogY,
		fontStyle: "60px Arial",
		fontColor: "#EBEBEB"
	},

	stage3: {
		dialogImage:"ino22",
		dialogImageX:"0",
		dialogImageY:"0",
		align:"left",

		dialogText:"Хочешь ее назад? \nТогда сыграй со мной в одну игру",
		textCoordX: options.standart.inoDialogX,
		textCoordY: options.standart.inoDialogY,
		fontStyle: "60px Arial",
		fontColor: "#EBEBEB"
	},

	stage4: {
		dialogImage:"cuz22",
		dialogImageX:"0",
		dialogImageY:"0",
		align:"right",

		dialogText:"А без этого никак?",
		textCoordX: options.standart.kuzDialogX,
		textCoordY: options.standart.kuzDialogY,
		fontStyle: "60px Arial",
		fontColor: "#EBEBEB"
	},

	stage5: {
		dialogImage:"ino33",
		dialogImageX:"0",
		dialogImageY:"0",
		align:"left",

		dialogText:"Не",
		textCoordX: options.standart.inoDialogX,
		textCoordY: options.standart.inoDialogY,
		fontStyle: "60px Arial",
		fontColor: "#EBEBEB"
	},

	stage6: {
		dialogImage:"cuz33",
		dialogImageX:"0",
		dialogImageY:"0",
		align:"right",

		dialogText:"эх, создавай",
		textCoordX: options.standart.kuzDialogX,
		textCoordY: options.standart.kuzDialogY,
		fontStyle: "60px Arial",
		fontColor: "#EBEBEB"
	}
};

var stageW = 1137;
var stageH = 1110;
