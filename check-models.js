const { GoogleGenerativeAI } = require("@google/generative-ai");

// Replace with your actual API key
const genAI = new GoogleGenerativeAI("AIzaSyAGugMkEF6pLWr2XqcEos-tZ4WjBoW7dIg");

async function listModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${genAI.apiKey}`
    );
    const data = await response.json();
    
    console.log("Available Models:");
    data.models.forEach(model => {
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`- ${model.name.replace("models/", "")}`);
      }
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();