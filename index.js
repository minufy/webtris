import { Game } from "./modules/game.js";

let canvas = document.getElementById("game");
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

function rgbDistance(c1, c2) {
  const dr = c1[0]-c2[0];
  const dg = c1[1]-c2[1];
  const db = c1[2]-c2[2];
  return Math.sqrt(dr*dr+dg*dg+db*db);
}
function getPixel(pixels, x, y) {
    const i = (y * pixels.width+x) * 4;
    return [
        pixels.data[i],
        pixels.data[i+1],
        pixels.data[i+2],
        pixels.data[i+3],
    ];
}
function fileToImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(file);
    });
}
function getPixelsFromImage(img) {
    const pasteCanvas = document.getElementById("paste");
    const pasteCtx = canvas.getContext("2d");

    pasteCanvas.width = img.width;
    pasteCanvas.height = img.height;

    pasteCtx.drawImage(img, 0, 0);
    return pasteCtx.getImageData(0, 0, img.width, img.height);
}

const COLOR_NAMES = ["I", "J", "L", "O", "S", "T", "Z"]
const COLORS = [
    [0, 255, 255, 1],
    [0, 0, 255, 1],
    [255, 160, 0, 1],
    [255, 255, 0, 1],
    [0, 255, 0, 1],
    [255, 0, 255, 1],
    [255, 0, 0, 1],
]
// const COLORS = [
//     [49, 199, 239, 1],
//     [90, 101, 173, 1],
//     [239, 121, 33, 1],
//     [247, 211, 8, 1],
//     [66, 182, 66, 1],
//     [173, 77, 156, 1],
//     [239, 32, 41, 1],
// ]
const MIN_DIST = 130;
function makeBoardFromPixels(pixels){
    const h = Math.floor(game.board.h/2);
    const pw = pixels.width/game.board.w;
    const ph = pixels.height/h;
    const divide = 2;
    const divideRep = 1/divide/2;
    for (let y=0; y<h; y++){
        for (let x=0; x<game.board.w; x++){
            let closest = 0;
            let dist = MIN_DIST;
            for (let px=0; px<divide; px++){
                for (let py=0; py<divide; py++){
                    const p = getPixel(pixels, Math.floor((x+px/divide+divideRep)*pw), Math.floor((y+py/divide+divideRep)*ph));
                    for (let i=0; i<COLORS.length; i++){
                        const d = rgbDistance(p, COLORS[i]);
                        if (d < dist){
                            dist = d;
                            closest = i;
                        }
                    }
                }
            }
            if (dist < MIN_DIST)
                game.board.set(x, y+h, COLOR_NAMES[closest]);
        }
    }
}
document.getElementById("edit-next").addEventListener("click", function (e){
    const nexts = prompt("enter next pieces. ex) ZLOSIJT");
    game.addQueue(nexts);
    document.activeElement.blur();
});
document.getElementById("edit-current").addEventListener("click", function (e){
    const current = prompt("enter current piece. ex) T").toUpperCase();
    game.setCurrent(current);
    document.activeElement.blur();
});
document.getElementById("edit-hold").addEventListener("click", function (e){
    const hold = prompt("enter hold piece. ex) T").toUpperCase();
    if (COLOR_NAMES.includes(hold)){
        game.holdType = hold;
    }
    document.activeElement.blur();
});
document.addEventListener("paste", async function (e){
    const items = e.clipboardData.items;

    for (const item of items){
        if (item.type.startsWith("image/")){
            const file = item.getAsFile();
            const img = await fileToImage(file);
            const pixels = getPixelsFromImage(img);

            makeBoardFromPixels(pixels);
        }
    }
});
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