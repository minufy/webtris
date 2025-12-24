import { MINO_SHAPES, MINO_COLORS } from "./mino.js";

class Board{
    constructor(w, h){
        this.w = w;
        this.h = h;
        this.grid = new Array(this.h).fill(null).map(() => new Array(this.w).fill(" "));
    }

    /** @param {CanvasRenderingContext2D} ctx */
    draw(ctx, unit, pos){
        for (let y=0; y<this.h; y++){
            for (let x=0; x<this.w; x++){
                if (this.grid[y][x] == " "){
                    if (y >= this.h/2){
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = MINO_COLORS["X"];
                        ctx.strokeRect(pos[0]+x*unit, pos[1]+y*unit, unit, unit);
                    }
                }
                else{
                    ctx.fillStyle = MINO_COLORS[this.grid[y][x]];
                    ctx.fillRect(pos[0]+x*unit, pos[1]+y*unit, unit, unit);
                }
            }
        }
    }

    setGrid(grid){
        this.grid = grid.map(row => [...row]);
    }

    lineClear(){
        let count = 0;
        for (let y=this.h-1; y>0; y--){
            let found = false;
            for (let x=0; x<this.w; x++){
                if (this.grid[y][x] == " "){
                    found = true;
                    break;
                }
            }
            if (!found){
                this.grid.splice(y, 1);
                count++;
            }
        }
        for (let _=0; _<count; _++){
            this.grid.unshift(new Array(this.w).fill(" "));
        }
    }

    place(mino){
        const minoShape = MINO_SHAPES[mino.type][mino.r];
        for (let y=0; y<minoShape.length; y++){
            for (let x=0; x<minoShape[0].length; x++){
                if (minoShape[y][x] == 1){
                    this.grid[y+mino.y][x+mino.x] = mino.type;
                }
            }
        }
    }
}

export { Board };