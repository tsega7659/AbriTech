const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // For text-only input, use the gemini-flash-latest model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Construct chat history for context if provided
        // History expected format: [{ role: "user" | "model", parts: [{ text: "..." }] }]
        let chat;
        if (history && Array.isArray(history)) {
            chat = model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });
        } else {
            chat = model.startChat({
                history: [],
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });
        }

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Gemini Chat Error:', error);
        res.status(500).json({ message: 'Failed to generate response', error: error.message });
    }
};

module.exports = {
    chatWithAI
};
