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
        this.mouseDrawing = false;
        this.mouseButton = null;
        this.boardX = 0;
        this.boardY = 0;
        this.boardXOld = null;
        this.boardYOld = null;
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
        if (this.queue.length <= 7)
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

    mouseDown(button){
        this.mouseDrawing = true;
        this.mouseButton = button;
    }

    mouseUp(){
        this.boardXOld = null;
        this.boardYOld = null;
        this.mouseDrawing = false;
    }

    mouseMove(ctx, unit, x, y){
        const [pos, posMargin] = this.getPos(ctx, unit);
        const boardX = Math.floor((x-posMargin[0])/unit);
        const boardY = Math.floor((y-posMargin[1])/unit);
        this.boardX = boardX;
        this.boardY = boardY;
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
        if (this.mouseDrawing){
            if (this.boardX >= 0 && this.boardX < this.board.w && this.boardY >= 0 && this.boardY < this.board.h){
                for (let _=0; _<this.board.h; _++){
                    if (this.boardXOld == null)
                        this.boardXOld = this.boardX;
                    if (this.boardYOld == null)
                        this.boardYOld = this.boardY;
                    if (this.mouseButton == 0){
                        this.board.set(this.boardXOld, this.boardYOld);
                    }
                    else{
                        this.board.set(this.boardXOld, this.boardYOld, " ");
                    }
                    this.boardXOld += Math.sign(this.boardX-this.boardXOld);
                    this.boardYOld += Math.sign(this.boardY-this.boardYOld);
                    if (this.boardXOld == this.boardX && this.boardYOld == this.boardY)
                        break;
                }
                this.boardXOld = this.boardX;
                this.boardYOld = this.boardY;
            }
        }
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
        this.drawMino(ctx, unit, pos, shadowMino.x, shadowMino.y, shadowMino.type, shadowMino.r, MINO_COLORS["H"]);
    }

    getPos(ctx, unit){
        const pos = [ctx.canvas.clientWidth/2-this.board.w*unit/2, ctx.canvas.clientHeight/2-this.board.h*unit/4];
        const posMargin = [pos[0], pos[1]-this.board.h/2*unit];
        return [pos, posMargin];
    }

    draw(ctx, unit){
        const [pos, posMargin] = this.getPos(ctx, unit);
        this.board.draw(ctx, unit, posMargin);
        this.drawShadow(ctx, unit, posMargin);
        this.drawMino(ctx, unit, posMargin, this.mino.x, this.mino.y, this.mino.type, this.mino.r, MINO_COLORS[this.mino.type]);
        if (this.holdType != ""){
            let color = MINO_COLORS[this.holdType];
            if (this.held)
                color = MINO_COLORS["H"];
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

    addQueue(s){ 
        for (let i=0; i<s.length; i++){
            const si = s[i].toUpperCase();
            if (MINO_TYPES.includes(si)){
                this.queue.unshift(si);
            }
        }
    }

    setCurrent(type){
        if (MINO_TYPES.includes(type)){
           this.mino = new Mino(type, this.board.w/2-2, this.board.h/2-4)
        }
    }
}

export { Game };