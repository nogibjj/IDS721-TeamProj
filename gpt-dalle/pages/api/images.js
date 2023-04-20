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
    size: "1024x1024",
  });
  console.log(response.data.data);
  res.status(200).json({ result: response.data.data })
}

