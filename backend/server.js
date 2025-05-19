import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath  } from 'url';
import {promises as fs} from 'fs';
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const API_URL = process.env.API_URL;
const API_KEY = process.env.API_KEY;
const MODEL = process.env.MODEL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Load local jokes
let localJokes = [];

async function loadLocalJokes() {
    if (localJokes.length > 0) return;
    try {
        const data = await fs.readFile(path.join(__dirname, 'joke.json'), 'utf8');
        const json = JSON.parse(data);
        localJokes = json.jokes;
    } catch (err) {
        console.error('Failed to load local jokes:', err);
    }
}

// Load local jokes or AI jokes fetch at random
app.get("/api/joke", async (req,res) =>{
    await loadLocalJokes();

    const useLocal = Math.random() < 0.6;

    if ( useLocal && localJokes.length > 0) {
        const joke = localJokes[Math.floor(Math.random() * localJokes.length)];
        return res.json(joke);
    }
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'user',
                        content: 'The response should be a valid JSON object with only setup and punchline properties, like this: {"setup": "the joke setup", "punchline": "the punchline"}.'
                    }
                ],
                temperature: 0.7,
            })
        });
        if (!response.ok) throw new Error(response.statusText || "Network response was not ok");
        try {
            const data = await response.json();
            console.log(data);
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("Invalid response format");
            }
            const rawJoke = data.choices[0].message.content
            const jsonString = rawJoke.replace(/```json\s*|```/g, '').trim();
            const joke = JSON.parse(jsonString);
            console.log(joke)
            return res.json(joke);
        }
        catch (error) {
            console.error("error in getting joke from response", error);
            jokeDisplay.textContent = "Failed to format the joke. Try again!";
            punchlineDisplay.textContent = "";
        }
        
    } catch (error) {
        console.error("joke fetch failed", error);
        res.status(500).json({error: "Failed to fetch joke"});
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});