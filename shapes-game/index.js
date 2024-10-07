const config = {
    type: Phaser.AUTO,
    width: window.innerWidth, // Set initial width to window width
    height: window.innerHeight, // Set initial height to window height
    physics: {
        default: 'arcade',
        arcade: {
            gravity: 0,
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.RESIZE, // Enable resizing mode
        autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game on the screen
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
let baseWidth = 800; // Base width for positioning scaling
let baseHeight = 600; // Base height for positioning scaling

// Preload shapes
function preload() {
    this.load.image('circle', './assets/circle.png');
    this.load.image('square', './assets/square.png');
    this.load.image('triangle', './assets/triangle.png');
    this.load.image('rectangle', './assets/rectangle.png');
    this.load.image('pentagon', './assets/pentagon.png');
}

// Function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index
        // Swap elements
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function create() {
    // Clear previous shapes
    shapes.forEach(shape => shape.destroy());
    shapes = []; // Reset the shapes array

    const scaleX = this.scale.width / baseWidth; // Scaling factor for X based on window width
    const scaleY = this.scale.height / baseHeight; // Scaling factor for Y based on window height

    // Define target positions for each shape (scaled based on screen size)
    const shapeNames = ['circle', 'square', 'triangle', 'rectangle', 'pentagon'];
    const targetPositions = [
        { x: 100 * scaleX, y: 400 * scaleY },
        { x: 250 * scaleX, y: 400 * scaleY },
        { x: 400 * scaleX, y: 400 * scaleY },
        { x: 550 * scaleX, y: 400 * scaleY },
        { x: 700 * scaleX, y: 400 * scaleY },
    ];

    // Create target pairs and shuffle
    targets = targetPositions.map((pos, index) => ({
        ...pos,
        shape: shapeNames[index], // Associate each position with the corresponding shape name
        id: index, // Assign an ID to each target
        textObject: null // Initialize the textObject property to store the reference later
    }));

    // Shuffle the targets
    targets = shuffle(targets);

    // Create the target positions with names
    targets.forEach(target => {
        const targetRect = this.add.rectangle(target.x, target.y, 100 * scaleX, 100 * scaleY, 0xcccccc)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x000000)
            .setInteractive({ dropZone: true }); // Mark as drop zone

        // Add text label for each target with the shape name
        const text = this.add.text(target.x, target.y, target.shape, {
            fontSize: `${16 * scaleX}px`, // Adjust font size based on scaling
            fill: '#000000',
            align: 'center'
        }).setOrigin(0.5); // Center the text on the rectangle

        target.textObject = text; // Store reference to the text object in the target
    });

    // Shuffle shape names for draggable shapes
    const shuffledShapeNames = shuffle(shapeNames.slice()); // Use slice() to create a copy
    console.log("shuffledShapeNames", shuffledShapeNames);

    // Create draggable shapes
    shuffledShapeNames.forEach((name, index) => {
        const shape = this.add.image(100 * scaleX + index * 150 * scaleX, 100 * scaleY, name).setInteractive();
        shape.setScale(0.2 * scaleX); // Adjust scale based on screen size
        shape.id = shapeNames.indexOf(name); // Assign an ID to each shape matching the target's ID
        shape.originalX = shape.x; // Store original position
        shape.originalY = shape.y;

        this.input.setDraggable(shape);

        // Events for drag behavior
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

    // Handle drop events
    this.input.on('drop', (pointer, gameObject, dropZone) => {
        console.log("Dropping event detected");

        const target = targets.find(t => {
            const bounds = new Phaser.Geom.Rectangle(t.x - 50 * scaleX, t.y - 50 * scaleY, 100 * scaleX, 100 * scaleY);
            return Phaser.Geom.Intersects.RectangleToRectangle(gameObject.getBounds(), bounds);
        });

        // If dropped on a target
        if (target) {
            console.log("Target found");

            // Check if the shape ID matches the target ID
            if (gameObject.id === target.id) {
                console.log("Shape matches target");

                // Snap the shape to the target
                gameObject.x = target.x;
                gameObject.y = target.y; 

                // Destroy the text object of the target when matched
                if (target.textObject) {
                    console.log(`Destroying text for ${target.shape}`);
                    target.textObject.destroy(); // Remove the text
                    target.textObject = null; // Set to null to avoid reuse
                }
            } else {
                console.log("Shape does not match target");
                // Incorrect target, move back to original position
                gameObject.x = gameObject.originalX;
                gameObject.y = gameObject.originalY;
            }
        } else {
            // Not dropped on any target, move back to original position
            console.log("No target found, returning to original position");
            gameObject.x = gameObject.originalX;
            gameObject.y = gameObject.originalY;
        }
    });

    // Enable drag for shapes
    this.input.on('dragleave', (pointer, gameObject, dropZone) => {
        console.log("Left drop zone");
    });

    // Add a resize event listener to adjust positions and scale on window resize
    this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
        const width = gameSize.width;
        const height = gameSize.height;

        // Update scaling factors
        const newScaleX = width / baseWidth;
        const newScaleY = height / baseHeight;

        // Resize and reposition targets and shapes accordingly
        targets.forEach(target => {
            target.x *= newScaleX;
            target.y *= newScaleY;
            if (target.textObject) {
                target.textObject.setFontSize(16 * newScaleX); // Adjust font size
                target.textObject.setPosition(target.x, target.y);
            }
        });

        shapes.forEach(shape => {
            shape.x *= newScaleX;
            shape.y *= newScaleY;
            shape.setScale(0.2 * newScaleX); // Scale shape based on new window size
        });
    });
}

function update() {
    // Update logic if needed
}
