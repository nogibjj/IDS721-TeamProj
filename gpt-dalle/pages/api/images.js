var getPixels = require("get-pixels");

export default async function handler(req, res) {
    const { Configuration, OpenAIApi } = require("openai");
    require('dotenv').config();
    const apiKey = process.env.OPENAI_API_KEY;
    const configuration = new Configuration({
        apiKey: apiKey
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
        prompt: req.query.p,
        n: 1,
        size: "256x256",
    });
    // url for the image
    const url = response.data.data[0].url;
    // convert the image to 2D array of pixels 256 * 256 * 4
    let pixelsMatrix = await urlImage2PixelMatrix(url);
    
    // crop the image
    const cropDimensions = await getCropDimensions("landscape", 256, 256); // console.log(req.body.type);
    let cropped = await cropImage(pixelsMatrix, cropDimensions);
    console.log(cropped);
    res.status(200).json({ result: response.data.data }) // now is the url for the image
    // TODO: send the cropped image (pixel matrix) to the frontend
}

async function urlImage2PixelMatrix(url) {
    return new Promise((resolve, reject) => {
        getPixels(url, function (err, pixels) {
        if (err) {
            console.log("Bad image path");
            reject(err);
            return;
        }
        console.log("got pixels", pixels.shape.slice());
        let data = pixels.data;
        let matrix = new Array(256);
        for (let i = 0; i < 256; i++) {
            matrix[i] = new Array(256);
        }

        let dataIndex = 0;
        for (let i = 0; i < 256; i++) {
            for (let j = 0; j < 256; j++) {
            matrix[i][j] = [data[dataIndex],
                data[dataIndex + 1],
                data[dataIndex + 2],
                data[dataIndex + 3],
            ];
            dataIndex += 4;
            }
        }
        resolve(matrix);
        });
    });
}

async function toMusk(matrix, x, y, width, height) {
    let musk = [...matrix];
    for (let i = y; i < y + height; i++) {
        for (let j = x; j < x + width; j++) {
        musk[i][j] = [0, 0, 0, 0];
        }
    }
    return musk;
}; 

function getCropDimensions(type, width, height) {
    let cropWidth = width; // the width of the croped image
    let cropHeight = height; // the height of the croped image
    let cropX = 0; // the staring x point of the croped image
    let cropY = 0; // the starting y point of the croped image

    if (type === "landscape") {
        cropHeight = Math.ceil((9 / 16) * height);
        console.log(cropHeight);
        cropY = Math.floor((height - cropHeight) / 2);
    } else if (type === "normal") {
        cropHeight = Math.ceil((3 / 4) * height);
        cropY = Math.floor((height - cropHeight) / 2);
    } else if (type === "classic") {
        cropHeight = Math.ceil((2 / 3) * height);
        cropY = Math.floor((height - cropHeight) / 2);
    } else if (type === "portrait") {
        cropWidth = Math.ceil((3 / 4) * height);
        cropX = Math.floor((width - cropWidth) / 2);
    }
    return { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
};

async function cropImage(matrix, cropDimensions) {
    const { x, y, width, height } = cropDimensions;
    let croppedPixels = [];

    for (let i = y; i < y + height; i++) {
        const row = matrix[i].slice(x, x + width);
        croppedPixels.push(row);
    }
    return croppedPixels;
};
