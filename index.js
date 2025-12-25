import { Game } from "./modules/game.js";

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

const UNIT = 24;

let handling = {
    "das": 117,
    "arr": 0,
    "softdrop": 0
}; 
let buttons = [
    "hold",
    "cw",
    "ccw",
    "180",
    "left",
    "right",
    "harddrop",
    "softdrop",
    "restart",
]
let codeToKey = {};
function init(){
    for (let i in handling){
        handling[i] = localStorage.getItem("handling-"+i);
    }
    for (let i=0; i<buttons.length; i++){
        codeToKey[localStorage.getItem(buttons[i])] = buttons[i];
    }
}

let game = new Game(handling, ctx, null);

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

document.addEventListener("keydown", function (e){
    if (e.repeat) return;
    game.keyDown(codeToKey[e.key.toLowerCase()]);
});
document.addEventListener("keyup", function (e){
    if (e.repeat) return;
    game.keyUp(codeToKey[e.key.toLowerCase()]);
});
canvas.addEventListener("mousemove", function (e){
    const rect = canvas.getBoundingClientRect();

    const x = e.clientX-rect.left;
    const y = e.clientY-rect.top;
    
    game.mouseMove(ctx, UNIT, x, y);
});
canvas.addEventListener("mousedown", function (e){
    game.mouseDown(e.button);
});
canvas.addEventListener("mouseup", function (e){
    game.mouseUp();
});

init();