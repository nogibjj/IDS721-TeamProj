// import axios from "axios";
// import sharp from "sharp";

// export default async function handler(req, res) {

//   const url = req.body.url;
//   const type = req.body.type;

//   const response = await axios.get(url, {
//     responseType: "arraybuffer",
//   });

//   const base64 = Buffer.from(response.data, "binary").toString("base64");

//   if (type == 'landscape') {
//     const png = await sharp(Buffer.from(base64, "base64"))
//       .png()
//       .toBuffer();
//     const pngBase64 = Buffer.from(png, "binary").toString("base64");
//     res.status(200).json({ result: `data:image/png;base64,${pngBase64}` });
//   } else if (type == 'normal') {
    
//   } else if (type == 'classic') {
    
//   } else if (type == 'square') {
    
//   }
//   else {
    
//   }

// }

import axios from 'axios'; // Import axios library for making HTTP requests
import sharp from 'sharp'; // Import sharp library for image processing

async function resizeImage(base64Image, targetWidth, targetHeight) {
  const buffer = await sharp(Buffer.from(base64Image, "base64"))
    .resize({ 
      fit: 'cover',
      position: 'entropy',
      width: targetWidth,
      height: targetHeight,
    })
    .png()
    .toBuffer();
  const pngBase64 = buffer.toString("base64");
  return `data:image/png;base64,${pngBase64}`;
}

// Request handler for processing the image
async function handler(req, res) {
  const url = req.body.url; // Get the URL of the input image from the request body
  const type = req.body.type; // Get the type of image to resize from the request body

  const response = await axios.get(url, {
    responseType: "arraybuffer", // Make the request to fetch the image as a binary buffer
  });

  const base64 = Buffer.from(response.data, "binary").toString("base64"); // Convert the binary buffer to base64 encoded string

  const { width, height } = await sharp(Buffer.from(base64, "base64")).metadata(); // Get the width and height of the input image

  let targetWidth = width, targetHeight = height; // Initialize target width and height with original width and height

  // Conditionally update the target width and/or height based on the specified image type
  if (type === 'landscape') targetHeight = Math.ceil((9 / 16) * width);
  else if (type === 'normal') targetHeight = Math.ceil((3 / 4) * width);
  else if (type === 'classic') targetHeight = Math.ceil((2 / 3) * width);
  else if (type === 'portrait') targetWidth = Math.ceil((3 / 4) * height);
  else if (type === 'square') targetHeight = targetWidth = Math.min(width, height);
  else return res.status(400).json({ message: "Invalid image type" }); // Return an error response if the image type is invalid

  const result = await resizeImage(base64, targetWidth, targetHeight); // Resize the image to the target size
  res.status(200).json({ result }); // Return the resized image as a data URL in the response body
}  
