import { MINO_COLORS, MINO_SHAPES, MINO_TYPES, Mino } from "./mino.js";
import { Board } from "./board.js";
import { Handler } from "./handler.js";
import { rng } from "./rng.js";

class Game{
    constructor(handling, seed=null){
        this.handling = handling;
        this.seed = Math.floor(Date.now());
        if (seed != null)
            this.seed = seed;
        this.rng = rng(this.seed);
        this.restart();
    }
    
    restart(seed=null){
        this.seed = Math.floor(Date.now())
        if (seed != null)
            this.seed = seed;
        this.rng = rng(this.seed);
        this.board = new Board(10, 40);
        this.queue = [];
        this.next();
        this.handler = new Handler(this.handling["das"], this.handling["arr"], this.handling["softdrop"]);
        this.holdType = "";
        this.held = false;
    }

    drawMino(ctx, unit, pos, minoX, minoY, minoType, minoR, color=null){
        if (color == null)
            color = MINO_COLORS[minoType];
        const minoShape = MINO_SHAPES[minoType][minoR];
        for (let y=0; y<minoShape.length; y++){
            for (let x=0; x<minoShape[0].length; x++){
                if (minoShape[y][x] == 1){
                    ctx.fillStyle = color;
                    ctx.fillRect(pos[0]+(minoX+x)*unit, pos[1]+(minoY+y)*unit, unit, unit);
                }
            }
        }
    }

    next(){
        if (this.queue.length <= 5)
            this.fillQueue();
        this.mino = this.popQueue();
    }

    drawNext(ctx, unit, pos){
        const gap = 2;
        for (let i=0; i<5; i++){
            const minoType = this.queue[i];
            let x = 0
            let y = 0
            if (minoType == "I")
                y = -0.5;
            if (minoType == "O")
                x = -0.5;
            this.drawMino(ctx, unit, pos, (this.board.w+1)+x, y+i+i*gap, minoType, 0, MINO_COLORS[minoType])
        }
    }

    softDrop(){
        for (let _=0; _<this.board.h; _++){
            if (!this.mino.move(0, 1, this.board))
                return;
        }
    }

    hardDrop(){
        this.held = false;
        this.softDrop();
        this.board.place(this.mino);
        this.board.lineClear();
        this.next();
    }

    keyDown(key){
        if (key == "right"){
            this.handler.downRight()
            this.mino.move(1, 0, this.board);
        }
        if (key == "left"){
            this.handler.downLeft()
            this.mino.move(-1, 0, this.board);
        }
        if (key == "softdrop"){
            this.handler.downSoftDrop();
        }
        if (key == "cw"){
            this.mino.rotate(1, this.board);
        }
        if (key == "ccw"){
            this.mino.rotate(-1, this.board);
        } 
        if (key == "180"){
            this.mino.rotate(2, this.board);
        }
        if (key == "hold"){
            this.hold();
        }
        if (key == "harddrop"){
            this.hardDrop();
        }
        if (key == "restart"){
            this.restart();
        }
    }

    keyUp(key){
        if (key == "right"){
            this.handler.upRight()
        }
        if (key == "left"){
            this.handler.upLeft()
        }
        if (key == "softdrop"){
            this.handler.upSoftDrop()
        }
    }

    hold(){
        if (this.held)
            return;
        const typeOld = this.mino.type;
        if (this.holdType == ""){
            this.next();
        }
        else{
            this.mino = new Mino(this.holdType, this.board.w/2-2, this.board.h/2-4);
        }
        this.holdType = typeOld
        this.held = true;
    }

    update(dt){
        const movementQueue = this.handler.update(dt, this.board)
        for (let i=0; i<movementQueue.length; i++){
            this.mino.move(movementQueue[i][0], movementQueue[i][1], this.board);
        }
    }

    drawShadow(ctx, unit, pos){
        let shadowMino = new Mino(this.mino.type, this.mino.x, this.mino.y, this.mino.r);
        for (let _=0; _<this.board.h; _++){
            if (!shadowMino.move(0, 1, this.board))
                break;
        }
        this.drawMino(ctx, unit, pos, shadowMino.x, shadowMino.y, shadowMino.type, shadowMino.r, MINO_COLORS["X"]);
    }

    draw(ctx, unit, offset=[0, 0]){
        const pos = [ctx.canvas.clientWidth/2-this.board.w*unit/2+offset[0], ctx.canvas.clientHeight/2-this.board.h*unit/4+offset[1]];
        const posMargin = [pos[0], pos[1]-this.board.h/2*unit];
        this.board.draw(ctx, unit, posMargin);
        this.drawShadow(ctx, unit, posMargin);
        this.drawMino(ctx, unit, posMargin, this.mino.x, this.mino.y, this.mino.type, this.mino.r, MINO_COLORS[this.mino.type]);
        if (this.holdType != ""){
            let color = MINO_COLORS[this.holdType];
            if (this.held)
                color = MINO_COLORS["X"];
            this.drawMino(ctx, unit, pos, -5, 1, this.holdType, 0, color);
        }
        this.drawNext(ctx, unit, pos);
    }

    fillQueue(){
        this.queue.push(...this.rng.shuffleArray([...MINO_TYPES]));
    }

    popQueue(){
        return new Mino(this.queue.shift(), this.board.w/2-2, this.board.h/2-4)
    }
}

export { Game };