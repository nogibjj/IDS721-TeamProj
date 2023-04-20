import axios from "axios";
import sharp from "sharp";

export default async function handler(req, res) {

  const url = req.body.url;
  const type = req.body.type;

  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const base64 = Buffer.from(response.data, "binary").toString("base64");

  if (type == 'landscape') {
    const png = await sharp(Buffer.from(base64, "base64"))
      .png()
      .toBuffer();
    const pngBase64 = Buffer.from(png, "binary").toString("base64");
    res.status(200).json({ result: `data:image/png;base64,${pngBase64}` });
  } else if (type == 'normal') {
    
  } else if (type == 'classic') {
    
  } else if (type == 'square') {
    
  }
  else {
    
  }

}
