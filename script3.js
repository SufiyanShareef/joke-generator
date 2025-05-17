//MODEL API AND URL
const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1:free';

// Interactive face expressions
const faceExpressions = ["😂", "🤣", "😆", "😅", "🤪", "😜", "🤨", "😏", "😒", "🙄"];

// DOM elements
const jokeDisplay = document.getElementById('joke-display');
const punchlineDisplay = document.getElementById('punchline-display');
const revealBtn = document.getElementById('reveal-btn');
const randomJokeBtn = document.getElementById('random-joke-btn');
const surpriseBtn = document.getElementById('surprise-btn');
const interactiveFace = document.getElementById('interactive-face');
const rateButtons = document.querySelectorAll('.rate-btn');
const ratingFeedback = document.getElementById('rating-feedback');
const subscribeForm = document.getElementById('subscribe-form');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const confettiContainer = document.getElementById('confetti-container');

function init() {
    // starting function
    // Hide punchline initially
    punchlineDisplay.classList.remove('show');

    // Set up event listeners
    revealBtn.addEventListener('click', togglePunchLine);
    randomJokeBtn.addEventListener('click', getRandomJoke);
    surpriseBtn.addEventListener('click', surpriseMe);
    interactiveFace.addEventListener('click', changeFaceExpression);

    rateButtons.forEach(button => {
        button.addEventListener('click', () => rateJoke(button.dataset.level));
    });

    subscribeForm.addEventListener('submit', handleSubscribe);
    darkModeToggle.addEventListener('click', handleDarkModeToggle);

}

async function getRandomJoke() {
    //my randon joke function
    punchlineDisplay.classList.remove('show');
    revealBtn.textContent = 'Show Punchline';
    jokeDisplay.textContent = "thinking of a funny joke.....";

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
                        content: `${prompt} The response should be a valid JSON object with only setup and punchline properties, like this: {"setup": "the joke setup", "punchline": "the punchline"}.`
                    }
                ],
                temperature: 0.7,

            })
        });
        if (!response.ok) throw new Error(response.statusText || "Network response was not ok");
        try {
            const data = await response.json();
            const rawJoke = data.choices[0].message.content
            const jsonString = rawJoke.replace(/```json\s*|```/g, '').trim();
            const joke = JSON.parse(jsonString);
console.log(joke)
            //joke 
            jokeDisplay.textContent = joke.setup;
            punchlineDisplay.textContent = joke.punchline;
        } catch (error) {
            console.error("error in getting joke from response", error);
            jokeDisplay.textContent = "Failed to format the joke. Try again!";
            punchlineDisplay.textContent = "";
        }

    } catch (error) {
        console.error("error in getting joke from the API", error);
        jokeDisplay.textContent = "Failed to think of a joke. Try again!";
        punchlineDisplay.textContent = "";
    }
}

function surpriseMe() {
    getRandomJoke();
    //createConfetti();

    //code timeout 
}

function togglePunchLine() {
    //toggle punchline display
}

function createConfetti() {
    //create confetti
}

function rateJoke() {
    //rate joke function
}

function handleSubscribe(e) {
    //handle subscribe form
}

function changeFaceExpression() {
    //change face expression
}

function handleDarkModeToggle() {
    //handle dark mode toggle
}


//initialize the app 
init()