API_KEY = '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';
API_URL = 'https://openrouter.ai/api/v1/chat/completions';
MODEL = 'deepseek/deepseek-r1:free';

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
// const darkMode = document.getElementById('dark-mode');
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
    document.addEventListener('DOMContentLoaded', initDarkMode);
    rateButtons.forEach(button => {
        button.addEventListener('click', () => rateJoke(button.dataset.level));
    });

    subscribeForm.addEventListener('submit', handleSubscribe);
    darkModeToggle.addEventListener('click', handleDarkModeToggle);

}

let localJokes = [];

async function loadLocalJokes() {
    if (localJokes.length > 0) return;
    try {
        const res = await fetch('assets/joke.json');
        const data = await res.json()
        localJokes = data.jokes;
    } catch (error) {
        console.error("service Failure.", error);
    }
}

async function getRandomJoke() {
    //my randon joke function
    punchlineDisplay.classList.remove('show');
    revealBtn.textContent = 'Show Punchline';
    jokeDisplay.textContent = "thinking of a funny joke.....";


    const useLocal = Math.random() < 0.5;

    if (useLocal) {
        await loadLocalJokes();
        if (localJokes.length === 0) {
            jokeDisplay.textContent = "Couldn't load local jokes!";
            return;
        }
        const joke = localJokes[Math.floor(Math.random() * localJokes.length)];
        jokeDisplay.textContent = joke.setup;
        punchlineDisplay.textContent = joke.punchline;
        return;
    }
    //use API 
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
    punchlineDisplay.classList.remove('show');
    getRandomJoke();
    createConfetti();

    //code timeout 
    // Show punchline after a delay
    setTimeout(() => {
        punchlineDisplay.classList.add('show');
        revealBtn.textContent = 'Hide Punchline';
    }, 1000);

    // Change face to laughing
    interactiveFace.textContent = "🤣";

    // Show positive feedback
    ratingFeedback.textContent = "That was a ROFL joke!";
    ratingFeedback.classList.add('animate-bounce');
    setTimeout(() => {
        ratingFeedback.classList.remove('animate-bounce');
    }, 2000);
}

function togglePunchLine() {
    //toggle punchline display
    punchlineDisplay.classList.toggle('show');
    revealBtn.textContent = punchlineDisplay.classList.contains('show') ? 'Hide Punchline' : 'Show Punchline';
}

function createConfetti() {
    //create confetti
    confettiContainer.innerHTML = '';

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');

        // random position 
        const xPos = Math.random() * window.innerWidth;

        // Random color 
        const colors = ['#f00', "#0f0", '#00f', '#ff0', '#f0f', '#0ff'];
        
        //set Size
        const size = Math.floor(Math.random() * 10) + 5;

        //set style
        confetti.style.left = `${xPos}px`;
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;

        const animationDuration = Math.random() * 3 + 2;
        const animationDelay = Math.random() * 2;

        confetti.style.animation = `fall ${animationDuration}s ease-in ${animationDelay}s forwards`;

        //add to conatainer
        confettiContainer.appendChild(confetti);

        //create key frame for animation
        const keyframes = `
                        @keyframes fall {
                        to {
                            transform: translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg);
                            opacity: 0;
                        }
                    }
                `;
        if (!document.getElementById('confetti-aimation')) {
            const style = document.createElement('style');
            style.id = 'confetti-aimation';
            style.innerHTML = keyframes;
            document.head.appendChild(style);
        }
    }
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 8000);
}

function rateJoke(level) {
    //rate joke function
    const feedback = [
        "That joke was terrible!",
        "Meh, could be better.",
        "That was pretty good!",
        "Hahaha! That was funny!",
        "OMG I can't stop laughing!!!"
    ];
    ratingFeedback.textContent = feedback[level - 1];

    //add animation 
    ratingFeedback.classList.add('animate-pluse');
    setTimeout(() => {
        ratingFeedback.classList.remove('animate-pluse');
    }, 500);
}

function handleSubscribe(e) {
    //handle subscribe form
    e.preventDefault(); // Prevent the default form submission

    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();
    console.log(email)

    // Basic email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Let Netlify handle the submission
    e.target.submit();

    // Optional: Show success message
    alert('Thanks for subscribing!');
    e.target.reset();
}

function changeFaceExpression() {
    //change face expression
    const randonIndex = Math.floor(Math.random() * faceExpressions.length);
    interactiveFace.textContent = faceExpressions[randonIndex];

    if (randonIndex < 6) {
        interactiveFace.classList.add('animate-spin');
        setTimeout(() => {
            interactiveFace.classList.remove('animate-spin');
        }, 1000);
    }
}

function handleDarkModeToggle() {
    // Toggle dark mode class on html element
    document.documentElement.classList.toggle('dark');

    // Update button icon and localStorage
    const isDark = document.documentElement.classList.contains('dark');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDark);
}

function initDarkMode() {
    // Initialize dark mode from localStorage
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedMode ? savedMode === 'true' : systemPrefersDark;

    if (isDark) {
        document.documentElement.classList.add('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Add event listener to toggle button
    darkModeToggle.addEventListener('click', handleDarkModeToggle);
}

//initialize the app 
init()