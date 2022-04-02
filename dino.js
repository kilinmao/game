class Actor{
    constructor(pos, speed, img) {
        this.pos = pos;
        this.img = img;
        this.speed = speed;
        this.top = this.pos.dy
        this.bottom = this.pos.dy + this.pos.dHeight
        this.left = this.pos.dx
        this.right = this.pos.dx + this.pos.dWidth
    }

    draw(){
        console.log('actor')
    }

}

class Catus extends Actor{
    draw() {

        if (this.pos.dx <= canvas.width && this.pos.dx + this.pos.dWidth > 0) {
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
        }
        else if (this.pos.dx + this.pos.dWidth <= 0){
            this.pos.dx = window.canvas.width + Math.random()*200
        }
        this.pos.dx = this.pos.dx - this.speed; 
    }

}

class Player extends Actor {
    constructor(pos, speed, img){
        super(pos, speed, img)
        this.isJump = true
        this.isVideo = true
    }

    draw() {
        if (this.img.width + this.pos.dx >= canvas.width) {
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
        }
    }

    jump() {
        if (this.isJump === true){
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
            this.pos.dy = 2 * (this.speed - 5) * (this.speed - 5) + 10
            this.speed = this.speed + 0.3
        }

        if(this.isVideo === true){
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
        }

        if (this.pos.dy > 80){
            this.isJump = false 
        }
        
    }

}

class Horizon extends Actor {

    draw(){
        if (this.img.width + this.pos.dx >= canvas.width) {
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
        }
        else if (this.pos.dx > -this.img.width) {
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
            window.ctx.drawImage(this.img, this.pos.sx, this.pos.sy, this.pos.sWidth, this.pos.sHeight, this.pos.dWidth + this.pos.dx, this.pos.dy, this.pos.dWidth, this.pos.dHeight);
        }
        else {
            this.pos.dx = 0;
        }
        this.pos.dx = this.pos.dx - this.speed;    
    }
}


class Tracker{
    constructor(){
        this.isVideo = false
        this.modelParams = {
            flipHorizontal: true, // flip e.g for video  
            maxNumBoxes: 1, // maximum number of boxes to detect
            iouThreshold: 0.5, // ioU threshold for non-max suppression
            scoreThreshold: 0.6, // confidence threshold for predictions.
        }
        this.videoInterval = 1
        this.midval_x = 0
        this.midval_y = 0
        this.model = null
        
    }

    // track() {
    //     this.toggleVideo();
        // const that = this;
        // trackButton.addEventListener("click", function () {
        //     that.toggleVideo();
        // })
    // }

    toggleVideo() {
        if (!this.isVideo) {            
            this.startVideo();
        } else {
            handTrack.stopVideo(video)
            this.isVideo = false;
        }
    }
    
    startVideo() {
        const that = this;
        handTrack.startVideo(video).then(function (status) {
            // console.log("video started", status);
            if (status) {
                // console.log(that)
                that.isVideo = true
                that.runDetection()
            } else {
                console.log("Please enable video")
            }
    })}

    loadModel(){
        handTrack.load(this.modelParams).then(lmodel => {
            // detect objects in the image.
            this.model = lmodel
            console.log(this.model)
            trackButton.disabled = false
        });
    }

    runDetection(){
        this.model.detect(video).then(predictions => {
            
            // get the middle x value of the bounding box and map to paddle location
            this.model.renderPredictions(predictions, window.videoCanvas, window.videoCtx, video);
            if (predictions[0]) {
                this.midval_x = predictions[0].bbox[0] + (predictions[0].bbox[2] / 2)
                this.midval_y = predictions[0].bbox[1] + (predictions[0].bbox[3] / 2)
            }
            if (this.isVideo) {
                setTimeout(() => {
                    this.runDetection(video) // [mao] idk
                }, this.videoInterval);
            }
        });
    }
}



export class Game{

    constructor(){

        this.isStart = false
        
        // https://mdn.mozillademos.org/files/225/Canvas_drawimage.jpg
        let spriteImg = document.getElementById("sprite")

        let horizonPos = {sx:2, sy:54, sWidth: 1200, sHeight:12, dx:0, dy: window.canvas.height-20, dWidth: spriteImg.width, dHeight: 12}
        let horizonSpeed = 2;
        this.horizon = new Horizon(horizonPos, horizonSpeed, spriteImg);

        let catusPos = { sx: 332, sy: 2, sWidth: 49, sHeight: 50, dx: window.canvas.width, dy: window.canvas.height - 45, dWidth: 49*0.5, dHeight: 59*0.5 }
        let catusSpeed = 2;
        this.catus = new Catus(catusPos, catusSpeed, spriteImg); 

        let playerPos = { sx: 40, sy: 4, sWidth: 44, sHeight: 45, dx: 0, dy: window.canvas.height - 60, dWidth: 44, dHeight: 45 }
        let playerSpeed = 0;
        this.player = new Player(playerPos, playerSpeed, spriteImg);

        this.tracker = new Tracker()
        this.tracker.loadModel()
        
        
        


        // Actor* A[20] = {};
        // A[0] = &this.horizon;
    }

    
    start() {
        // init
        // ........
        this.isStart = true; 
        // this.tracker.track();
        this.update()
              
        
    }



    draw(){
        // for a in A:
        //     a->draw()
        window.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.horizon.draw();
        this.catus.draw();
        this.player.draw()    
    }

    collide(){
        // this.top = this.pos.dy
        // this.bottom = this.pos.dy + this.pos.dHeight
        // this.left = this.pos.dx
        // this.right = this.pos.dx + this.pos.dWidth
        if (
            this.player.pos.dx + this.player.pos.dWidth > this.catus.pos.dx 
            && this.player.pos.dy + this.player.pos.dHeight > this.catus.pos.dy 
            && this.player.pos.dx < this.catus.pos.dx
            ){
            this.horizon.speed = 0
            this.catus.speed = 0
        }
    }

    jump(){
        if(this.tracker.isVideo === true){
            this.player.isVideo = true
            this.player.pos.dy = this.tracker.midval_y - 100
        }
        else {
            this.player.jump()

            let that = this
            document.onkeydown = function (evt) {
                evt = evt || window.event;
                if (evt.code == 'Space' || evt.code == 'touchend') {
                    evt.preventDefault()
                    that.player.isJump = true
                    that.player.speed = 0
                }
            };

        }


    }


    ticklogic(){
        
    }

    tickrender(){
        this.jump()
        this.collide();
        this.draw();
        window.requestAnimationFrame(this.tickrender.bind(this))
    }

    update() {
        this.ticklogic();
        this.tickrender();
    }

}
