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

// function getPixel(pixels, x, y) {
//     const i = (y * pixels.width+x) * 4;
//     return [
//         pixels.data[i],
//         pixels.data[i+1],
//         pixels.data[i+2],
//         pixels.data[i+3],
//     ];
// }
// function fileToImage(file) {
//     return new Promise((resolve) => {
//         const img = new Image();
//         img.onload = () => resolve(img);
//         img.src = URL.createObjectURL(file);
//     });
// }
// function getPixelsFromImage(img) {
//     const pasteCanvas = document.getElementById("paste");
//     const pasteCtx = canvas.getContext("2d");

//     pasteCanvas.width = img.width;
//     pasteCanvas.height = img.height;

//     pasteCtx.drawImage(img, 0, 0);
//     return pasteCtx.getImageData(0, 0, img.width, img.height);
// }

// function rgba(r, g, b, a){
//     return [r, g, b, a];
// }
// function getRgbDistance(color1, color2){
//     return Math.sqrt(
//         Math.pow(color1[0] - color2[0], 2) +
//         Math.pow(color1[1] - color2[1], 2) +
//         Math.pow(color1[2] - color2[2], 2)
//     );
// }
// const COLOR_NAMES = ["I", "J", "L", "O", "S", "T", "Z", "G", " "];
// const MIN_DIST = 120;
// function makeBoardFromPixels(pixels){
//     const h = Math.floor(game.board.h/2);
//     const pw = pixels.width/game.board.w;
//     const ph = pixels.height/h;
//     const divide = 2;
//     const divideRep = 1/divide/2;
//     let darkestColor = rgba(0, 0, 0, 1);
//     for (let y=0; y<h; y++){
//         for (let x=0; x<game.board.w; x++){
//             const p = getPixel(pixels, Math.floor((x+divideRep)*pw), Math.floor((y+divideRep)*ph));
//             if (p[0] < darkestColor[0] || p[1] < darkestColor[1] || p[2] < darkestColor[2]){
//                 darkestColor = p;
//             }
//         }
//     }
//     const COLORS = [
//         rgba(58, 202, 152, 1),
//         rgba(102, 82, 182, 1),
//         rgba(199, 120, 69, 1),
//         rgba(234, 221, 127, 1),
//         rgba(151, 206, 57, 1),
//         rgba(180, 65, 171, 1),
//         rgba(201, 55, 65, 1),
//         rgba(66, 66, 66, 1),
//         darkestColor,
//     ]; 
//     for (let y=0; y<h; y++){
//         for (let x=0; x<game.board.w; x++){
//             let dist = MIN_DIST;
//             let closest = 0;
//             for (let px=0; px<divide; px++){
//                 for (let py=0; py<divide; py++){
//                     const p = getPixel(pixels, Math.floor((x+px/divide+divideRep)*pw), Math.floor((y+py/divide+divideRep)*ph));
//                     for (let i=0; i<COLORS.length; i++){
//                         const d = getRgbDistance(p, COLORS[i]);
//                         if (d < dist){
//                             dist = d;
//                             closest = i;
//                         }
//                     }
//                     if (dist < MIN_DIST){
//                         console.log(p, dist, COLOR_NAMES[closest]);
//                         game.board.set(x, y+h, COLOR_NAMES[closest]);
//                     }
//                 }
//             }
//         }
//     }
// }
// document.addEventListener("paste", async function (e){
//     const items = e.clipboardData.items;

//     for (const item of items){
//         if (item.type.startsWith("image/")){
//             const file = item.getAsFile();
//             const img = await fileToImage(file);
//             const pixels = getPixelsFromImage(img);

//             makeBoardFromPixels(pixels);
//         }
//     }
// });
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