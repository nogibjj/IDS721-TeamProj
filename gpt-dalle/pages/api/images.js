export default async function handler(req, res) {
  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: "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"
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

