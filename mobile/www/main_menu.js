var startGame = {
    prologue: function(n, obj) {
        switch (n) {
            case 1:
                document.getElementById("start-ino-and-blk").style.display = "block";
                document.getElementById("start-game-slide1").style.display = "block";
                break;
            case 2:
                document.getElementById("start-game-slide1").style.display = "none";
                document.getElementById("start-game-slide2").style.display = "block";
                break;
            case 3:
                document.getElementById("start-game-slide2").style.display = "none";
                document.getElementById("start-game-slide3").style.display = "block";
                break;
            default:
                window.location = "game";
        }
    }
}