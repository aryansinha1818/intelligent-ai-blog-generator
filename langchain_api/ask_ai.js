const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.2,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "human",
    "Give me an essay in 30 words about {topic}. Keep the tone as {tone}",
  ],
]);

async function getAIResponse(topic, tone) {
  const formattedMessages = await promptTemplate.formatMessages({
    topic,
    tone,
  });
  const response = await model.invoke(formattedMessages);
  return response.content;
}

module.exports = getAIResponse;
