import fs from "fs";

export default async function handler(req, res) {
    console.log(req.query.image);
    const { Configuration, OpenAIApi } = require("openai");
    require("dotenv").config();
    const apiKey = process.env.OPENAI_API_KEY;
    const configuration = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createImageEdit({
        image: fs.createReadStream(req.query.image),
        mask: fs.createReadStream(req.query.mask),
        prompt: req.query.p,
        n: 1,
        size: "256x256",
    });
    console.log(response.data.data);
    res.status(200).json({ result: response.data.data });
}
