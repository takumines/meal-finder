import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "test-api-key",
  dangerouslyAllowBrowser: process.env.NODE_ENV === "test",
});

export { openai };
