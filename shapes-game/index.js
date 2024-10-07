const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, 
    height: window.innerHeight, 
    physics: {
        default: 'arcade',
        arcade: {
            gravity: 0,
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

const game = new Phaser.Game(config);

let shapes = [];
let targets = [];
let baseWidth = 800; 
let baseHeight = 600; 


function preload() {
    this.load.image('circle', './assets/circle.png');
    this.load.image('square', './assets/square.png');
    this.load.image('triangle', './assets/triangle.png');
    this.load.image('rectangle', './assets/rectangle.png');
    this.load.image('pentagon', './assets/pentagon.png');
}


function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function create() {
   
    shapes.forEach(shape => shape.destroy());
    shapes = []; 

    const scaleX = this.scale.width / baseWidth;
    const scaleY = this.scale.height / baseHeight; 

   
    const shapeNames = ['circle', 'square', 'triangle', 'rectangle', 'pentagon'];
    const targetPositions = [
        { x: 100 * scaleX, y: 400 * scaleY },
        { x: 250 * scaleX, y: 400 * scaleY },
        { x: 400 * scaleX, y: 400 * scaleY },
        { x: 550 * scaleX, y: 400 * scaleY },
        { x: 700 * scaleX, y: 400 * scaleY },
    ];

   
    targets = targetPositions.map((pos, index) => ({
        ...pos,
        shape: shapeNames[index], 
        id: index,
        textObject: null 
    }));

    
    targets = shuffle(targets);

    
    targets.forEach(target => {
        const targetRect = this.add.rectangle(target.x, target.y, 100 * scaleX, 100 * scaleY, 0xcccccc)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x000000)
            .setInteractive({ dropZone: true }); 

     
        const text = this.add.text(target.x, target.y, target.shape, {
            fontSize: `${16 * scaleX}px`, 
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5); 

        target.textObject = text; 
    });

    
    const shuffledShapeNames = shuffle(shapeNames.slice()); 
    console.log("shuffledShapeNames", shuffledShapeNames);

   
    shuffledShapeNames.forEach((name, index) => {
        const shape = this.add.image(100 * scaleX + index * 150 * scaleX, 100 * scaleY, name).setInteractive();
        shape.setScale(0.2 * scaleX); 
        shape.id = shapeNames.indexOf(name); 
        shape.originalX = shape.x; 
        shape.originalY = shape.y;

        this.input.setDraggable(shape);

        shape.on('dragstart', () => {
            shape.setAlpha(0.5);
            console.log("dragging");
        });
        shape.on('dragend', () => {
            shape.setAlpha(1);
            console.log("dragged");
        });
        shape.on('drag', (pointer, dragX, dragY) => {
            shape.x = dragX;
            shape.y = dragY;
            console.log("dragging");
        });

        shapes.push(shape);
    });

    
    this.input.on('drop', (pointer, gameObject, dropZone) => {
        console.log("Dropping event detected");

        const target = targets.find(t => {
            const bounds = new Phaser.Geom.Rectangle(t.x - 50 * scaleX, t.y - 50 * scaleY, 100 * scaleX, 100 * scaleY);
            return Phaser.Geom.Intersects.RectangleToRectangle(gameObject.getBounds(), bounds);
        });

      
        if (target) {
            console.log("Target found");

           
            if (gameObject.id === target.id) {
                console.log("Shape matches target");

                gameObject.x = target.x;
                gameObject.y = target.y; 

                if (target.textObject) {
                    console.log(`Destroying text for ${target.shape}`);
                    target.textObject.destroy(); 
                    target.textObject = null; 
                }
            } else {
                console.log("Shape does not match target");
             
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        } else {
            console.log("No target found, returning to original position");
            gameObject.x = gameObject.originalX;
            gameObject.y = gameObject.originalY;
        }
    });

    
    this.input.on('dragleave', (pointer, gameObject, dropZone) => {
        console.log("Left drop zone");
    });

  
    this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
        const width = gameSize.width;
        const height = gameSize.height;
        const newScaleX = width / baseWidth;
        const newScaleY = height / baseHeight;

        targets.forEach(target => {
            target.x *= newScaleX;
            target.y *= newScaleY;
            if (target.textObject) {
                target.textObject.setFontSize(16 * newScaleX);
                target.textObject.setPosition(target.x, target.y);
            }
        });

        shapes.forEach(shape => {
            shape.x *= newScaleX;
            shape.y *= newScaleY;
            shape.setScale(0.2 * newScaleX); 
        });
    });
}

function update() {

}
