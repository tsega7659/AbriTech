const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function listModels() {
    try {
        const token = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${token}`;

        console.log("Fetching models list from:", url);
        const response = await fetch(url);
        const data = await response.json();

        fs.writeFileSync('models_output.json', JSON.stringify(data, null, 2));
        console.log("Models written to models_output.json");

    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
