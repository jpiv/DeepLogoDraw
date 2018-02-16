// Synaptic test
const {
    Architect,
    Trainer
} = require('synaptic');

window.onload = loadImage;

const WIDTH = 50;
const HEIGHT = 50;
const TOTAL = WIDTH * HEIGHT;

function loadImage() {
    const imageUrl = 'http://localhost:8081/ig_logo.png';
    const image = new Image(WIDTH, HEIGHT);
    image.src = imageUrl;
    image.crossOrigin = 'Anonymous';
    image.onload = boot.bind(this, image);
}

function boot(image) {
    // Referenece Image
    const canvas1 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    canvas1.width = WIDTH;
    canvas1.height = HEIGHT;
    ctx1.drawImage(image, 0, 0, WIDTH, HEIGHT);
    const refPixelData = ctx1.getImageData(0, 0, WIDTH, HEIGHT).data;
    document.body.append(canvas1);

    // Canvas
    const canvas2 = document.createElement('canvas');
    canvas2.width = WIDTH;
    canvas2.height = HEIGHT;
    const ctx2 = canvas2.getContext('2d');
    const initialAction = (i, data) => { 
        return [1, 0, 0, 255];
    };
    setCanvasImage(ctx2, initialAction);
    document.body.append(canvas2);

    const network = new Architect.Perceptron(2, 10, 15, 3);
    const trainer = new Trainer(network);
    const getPxColor = (refData, i) => {
        return [
            refData[i],
            refData[i+1],
            refData[i+2],
            refData[i+3],
        ];
    };
    const trainingSet = createTrainingSet(refPixelData);
    console.log(trainingSet)
    let iter = 0;
    const train = () => {
        const learnRate = .0003 / (1 + .00001 * iter);
        let error = 0;
        let output;
        trainingSet.forEach((trainItem, i) => {
            output = network.activate(trainItem.input);
            error += Trainer.cost.MSE(trainItem.output, output);
            network.propagate(learnRate, trainItem.output)
            // ctx2.putImageData(pixelData, 0, 0);
        });
        setCanvasImage(ctx2, pi => {
            return [...network.activate(getXY(pi/4)), 255]
        });
        document.getElementById('iters').innerHTML = iter;
        console.log(error/trainingSet.length, learnRate);
        iter ++;
        requestAnimationFrame(train);
    };
    requestAnimationFrame(train);
};

const getXY = i => [i % WIDTH, Math.floor(i / WIDTH)]

function pixelDataFromNetwork(network) {
    const pixelData = new Uint8ClampedArray(TOTAL * 4);
    for(let i = 0; i < (TOTAL * 4); i += 4) {
        let rgba = [...network.activate(getXY(i)), 255];
        pixelData[i] = rgba[0] * 255;
        pixelData[i + 1] = rgba[1] * 255;
        pixelData[i + 2] = rgba[2] * 255;
        pixelData[i + 3] = rgba[3];
    }
    return pixelData;
};

function setCanvasImage(ctx, action) {
    const imageData = new ImageData(WIDTH, HEIGHT);
    for(let i = 0; i < (TOTAL * 4); i += 4) {
        let rgba = action(i, imageData.data);
        // console.log(rgba)
        imageData.data[i] = rgba[0] * 255;
        imageData.data[i + 1] = rgba[1] * 255;
        imageData.data[i + 2] = rgba[2] * 255;
        imageData.data[i + 3] = rgba[3];
    }
    ctx.putImageData(imageData, 0, 0);
};

function createTrainingSet(pixelData) {
    const trainingData = [];
    for(let i = 0; i < TOTAL; i++) {
        trainingData.push({
            input: getXY(i),
            output: [
                pixelData[i*4] / 255,
                pixelData[i*4+1] / 255,
                pixelData[i*4+2] / 255,
            ],
        });
    }
    return trainingData;
};


