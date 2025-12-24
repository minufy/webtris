import { Game } from "./modules/game.js";

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

const UNIT = 24;

const handling = {
    "das": 117,
    "arr": 0,
    "sdf": 0
};
let game = new Game(handling, null);

let lastTime = 0;
function gameLoop(currentTime){
    const dt = currentTime-lastTime;
    lastTime = currentTime;

    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    game.update(dt);
    game.draw(ctx, UNIT);

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

const keysToCode = {
    "Shift": "hold",
    "ArrowUp": "cw",
    "Control": "ccw",
    "a": "180",
    "ArrowLeft": "left",
    "ArrowRight": "right",
    " ": "harddrop",
    "ArrowDown": "softdrop",
    "r": "restart",
}

document.addEventListener("keydown", function (e){
    if (e.repeat) return;
    game.keyDown(keysToCode[e.key])
});
document.addEventListener("keyup", function (e){
    if (e.repeat) return;
    game.keyUp(keysToCode[e.key])
});