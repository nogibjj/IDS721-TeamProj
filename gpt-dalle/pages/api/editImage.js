import fs from "fs";
var getPixels = require("get-pixels");
import { Canvas, CanvasRenderingContext2D } from 'canvas';
// I want to import all functions from func.js in pages folder


export default async function handler(req, res) {
    const { Configuration, OpenAIApi } = require("openai");
    require("dotenv").config();
    const apiKey = process.env.OPENAI_API_KEY;
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    const img0 = req.body.originalImage;

    let Matrix = await urlImage2PixelMatrix(img0);

    getImageDimensions(img0)
        .then((dimensions) => {
            // convert the cropped pixel matrix to a data URL
            const canvas = drawPixelMatrixOnCanvas(Matrix, dimensions.width, dimensions.height);
            const originalURL = canvas.toDataURL('image/png');
            const img = originalURL;
            const data = img.replace(/data:image\/png;base64,/, "");
            const buffer = Buffer.from(data, 'base64');
            const originalFile = 'original' + '.png';
            fs.writeFile(originalFile, buffer, (error) => {
            if (error) {
                console.log('Unable to save the file.');
            } else {
                console.log('File saved:', originalFile);
            }
            });
            console.log(`Image dimensions: ${dimensions.width} x ${dimensions.height}`);
        })
        .catch((error) => {
            console.error("Error getting image dimensions:", error);
        });

    let maskMatrix = await urlImage2PixelMatrix(req.body.results);
    let mask = await toMusk(maskMatrix, req.body.topLeftX, req.body.topLeftY, req.body.boxWidth, req.body.boxHeight);
    const canvas0 = drawPixelMatrixOnCanvas(mask, mask[0].length, mask.length);
    const maskURL = canvas0.toDataURL('image/png');

    const img = maskURL;
    const data = img.replace(/data:image\/png;base64,/, "");
    const buffer = Buffer.from(data, 'base64');
    const maskFile = 'mask' + '.png';
    fs.writeFile(maskFile, buffer, (error) => {
    if (error) {
        console.log('Unable to save the file.');
    } else {
        console.log('File saved:', maskFile);
    }
    });


    try {
    // openai.createImageEdit Arguments:
    // image string Required
    // mask string Optional
    // prompt string Required
    // n integer Optional Defaults to 1
    // size string Optional Defaults to 1024x1024
    const response = await openai.createImageEdit(
        fs.createReadStream("original.png"),
        // TODO: FIX mask algorithm
        fs.createReadStream(maskFile),
        req.query.p,
        1,
        "256x256",
    );
    // url for the image
    console.log(response.data.data[0].url);
    const url = response.data.data[0].url;
    // convert the image to 2D array of pixels 256 * 256 * 4
    let pixelsMatrix = await urlImage2PixelMatrix(url);

    // crop the image
    const cropDimensions = await getCropDimensions(req.body.type, 256, 256);
    let cropped = await cropImage(pixelsMatrix, cropDimensions);

    // convert the cropped pixel matrix to a data URL
    const canvas = drawPixelMatrixOnCanvas(cropped, cropDimensions.width, cropDimensions.height);
    const croppedDataURL = canvas.toDataURL();

    getImageDimensions(croppedDataURL)
        .then((dimensions) => {
            console.log(`Image dimensions: ${dimensions.width} x ${dimensions.height}`);
        })
        .catch((error) => {
            console.error("Error getting image dimensions:", error);
        });
    
    res.status(200).json({ result: response.data.data[0].url, croppedImage: croppedDataURL });
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
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

function checkBoundary(x) {
    if (x < 0) {
        return 0;
    }
    if (x > 255) {
        return 255;
    }
}

async function toMusk(matrix, x, y, width, height) {
    let musk = [...matrix];
    let newX = checkBoundary(Math.floor(x));
    let newY = checkBoundary(Math.floor(y));

    for (let i = newY; i < newY+ height; i++) {
        for (let j = newX ; j < newX + width; j++) {
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

function drawPixelMatrixOnCanvas(matrix, width, height) {
    const canvas = new Canvas(width, height);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(width, height);
    let count = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            imageData.data[count] = matrix[y][x][0]; // red
            imageData.data[count + 1] = matrix[y][x][1]; // green
            imageData.data[count + 2] = matrix[y][x][2]; // blue
            imageData.data[count + 3] = matrix[y][x][3]; // alpha
            count += 4; // increment by 4 to move to the next pixel
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}


const axios = require("axios");
const sharp = require("sharp");

async function getImageDimensions(url) {
    try {
        // Download the image as a buffer
        const response = await axios.get(url, { responseType: "arraybuffer" });

        // Create a Sharp instance with the image buffer
        const image = sharp(Buffer.from(response.data));

        // Get the image metadata (including dimensions)
        const metadata = await image.metadata();

        // Return the dimensions
        return { width: metadata.width, height: metadata.height };
    } catch (error) {
        throw error;
    }
}



// 