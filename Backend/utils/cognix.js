import OpenAI from "openai";
import "dotenv/config";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getCongnixAPIResponse = async (message) => {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini", // stable and safe model
      input: message,
    });

    return response.output[0].content[0].text;
  } catch (err) {
    console.error("OpenAI Error:", err);
    return "Something went wrong with AI response.";
  }
};

export default getCongnixAPIResponse;
