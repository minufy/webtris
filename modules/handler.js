class Handler{
    constructor(das, arr, softdrop){
        this.das = das;
        this.arr = arr;
        this.softdrop = softdrop;

        this.held = [];

        this.rightHoldMs = 0;
        this.leftHoldMs = 0;

        this.rightArrTimer = 0;
        this.leftArrTimer = 0;

        this.softdropHeld = false;
        this.softdropTimer = 0;
    }

    downRight(){
        this.held.push("right");
        this.rightHoldMs = 0;
        this.rightArrTimer = 0;
    }

    downLeft(){
        this.held.push("left");
        this.leftHoldMs = 0;
        this.leftArrTimer = 0;
    }

    downSoftDrop(){
        this.softdropHeld = true;
        this.softdropTimer = 0;
    }

    upRight(){
        this.held.splice(this.held.indexOf("right"), 1);
    }

    upLeft(){
        this.held.splice(this.held.indexOf("left"), 1);
    }

    upSoftDrop(){
        this.softdropHeld = false;
    }

    update(dt, board){
        let movementQueue = []

        if (this.softdropHeld){
            this.softdropTimer += dt;
            for (let _=0; _<board.h; _++){
                if (this.softdropTimer >= this.softdrop){
                    this.softdropTimer -= this.softdrop;
                    movementQueue.push([0, 1]);
                }
                else{
                    break;
                }
            }
        }
        
        if (this.held && this.held[this.held.length-1] == "right"){
            this.rightHoldMs += dt;
            if (this.rightHoldMs >= this.das){
                this.rightArrTimer += dt;
                for (let _=0; _<board.h; _++){
                    if (this.rightArrTimer >= this.arr){
                        this.rightArrTimer -= this.arr;
                        movementQueue.push([1, 0]);
                    }
                    else{
                        break;
                    }
                }
            }
        }

        if (this.held && this.held[this.held.length-1] == "left"){
            this.leftHoldMs += dt;
            if (this.leftHoldMs >= this.das){
                this.leftArrTimer += dt;
                for (let _=0; _<board.h; _++){
                    if (this.leftArrTimer >= this.arr){
                        this.leftArrTimer -= this.arr;
                        movementQueue.push([-1, 0]);
                    }
                    else{
                        break;
                    }
                }
            }
        }

        return movementQueue
    }
}

export { Handler }