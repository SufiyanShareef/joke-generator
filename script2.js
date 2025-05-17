// script.js
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const jokeDisplay = document.getElementById('joke-display');
    const punchlineDisplay = document.getElementById('punchline-display');
    const revealBtn = document.getElementById('reveal-btn');
    const randomJokeBtn = document.getElementById('random-joke-btn');
    const surpriseBtn = document.getElementById('surprise-btn');
    const interactiveFace = document.getElementById('interactive-face');
    const rateButtons = document.querySelectorAll('.rate-btn');
    const ratingFeedback = document.getElementById('rating-feedback');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const subscribeForm = document.getElementById('subscribe-form');
    const confettiContainer = document.getElementById('confetti-container');

    // Current joke storage
    let currentJoke = {
        setup: "Why don't scientists trust atoms?",
        punchline: "Because they make up everything!"
    };

    // API Configuration
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const API_KEY = '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'; // Add your API key here
    const MODEL = 'deepseek/deepseek-r1:free';

    // Initialize the page
    initPage();

    function initPage() {
        // Set initial joke
        updateJokeDisplay();

        // Set up event listeners
        revealBtn.addEventListener('click', togglePunchline);
        randomJokeBtn.addEventListener('click', fetchRandomJoke);
        surpriseBtn.addEventListener('click', fetchSurpriseJoke);
        interactiveFace.addEventListener('click', changeFaceExpression);
        darkModeToggle.addEventListener('click', toggleDarkMode);
        subscribeForm.addEventListener('submit', handleSubscribe);

        rateButtons.forEach(button => {
            button.addEventListener('click', () => rateJoke(button.dataset.level));
        });

        // Initialize punchline as hidden
        punchlineDisplay.classList.remove('show');
    }

    function updateJokeDisplay() {
        jokeDisplay.textContent = currentJoke.setup;
        punchlineDisplay.textContent = currentJoke.punchline;
        punchlineDisplay.classList.remove('show');
    }

    function togglePunchline() {
        punchlineDisplay.classList.toggle('show');
        revealBtn.textContent = punchlineDisplay.classList.contains('show') ? 'Hide Punchline' : 'Show Punchline';
    }

    async function fetchRandomJoke() {
        try {
            // Show loading state
            randomJokeBtn.disabled = true;
            randomJokeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Loading...';

            const response = await fetchJokeFromAPI('Tell me a random joke in JSON format with setup and punchline properties. The joke should be funny and appropriate for all ages.');

            if (response) {
                currentJoke = response;
                updateJokeDisplay();
                createConfetti();
            }
        } catch (error) {
            console.error('Error fetching joke:', error);
            showError('Failed to load a new joke. Try again!');
        } finally {
            // Reset button state
            randomJokeBtn.disabled = false;
            randomJokeBtn.innerHTML = '<i class="fas fa-random mr-2"></i> Random Joke';
        }
    }

    async function fetchSurpriseJoke() {
        try {
            // Show loading state
            surpriseBtn.disabled = true;
            surpriseBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Preparing...';

            const themes = ['animal', 'science', 'food', 'technology', 'school'];
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            const prompt = `Tell me a ${randomTheme}-themed joke in JSON format with setup and punchline properties. Make it unexpected and funny.`;

            const response = await fetchJokeFromAPI(prompt);

            if (response) {
                currentJoke = response;
                updateJokeDisplay();
                createConfetti();
                interactiveFace.textContent = '🤪';
                setTimeout(() => {
                    interactiveFace.textContent = '😐';
                }, 2000);
            }
        } catch (error) {
            console.error('Error fetching surprise joke:', error);
            showError('The surprise failed! Try again.');
        } finally {
            // Reset button state
            surpriseBtn.disabled = false;
            surpriseBtn.innerHTML = '<i class="fas fa-gift mr-2"></i> Surprise Me!';
        }
    }

    async function fetchJokeFromAPI(prompt) {
        if (!API_KEY) {
            showError('API key is missing. Please configure the API key.');
            return null;
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
                            content: `${prompt} The response should be a valid JSON object with only setup and punchline properties, like this: {"setup": "the joke setup", "punchline": "the punchline"}.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error?.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();

            // Extract the content which should be our JSON string
            const content = data.choices?.[0]?.message?.content;
            if (!content && data.choices?.[0]?.text) {
                content = data.choices?.[0]?.text;
            }
            if (!content && data.choices?.[0]) {
                content = JSON.stringify(data.choices[0])
            }
            if (!content) {
                throw new Error('Invalid API response format');
            }

            // Try to parse the JSON response
            let joke;
            try {
                joke = JSON.parse(content);
            } catch (e) {
                const jsonMatch = content.match(/{.*}/s);
                if (jsonMatch) {
                    joke = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not extract JSON from API response');
                }
            }

            // Validate the joke structure
            if (!joke || typeof joke !== 'object' || !joke.setup || !joke.punchline) {
                console.error('Invalid joke format from API', joke);
                throw new Error('Invalid joke format from API');
            }

            return joke;
        } catch (error) {
            console.error('Error in fetchJokeFromAPI:', error);
            const fallbackJokes = [
                {
                    setup: "Why don't scientists trust atoms?",
                    punchline: "Because they make up everything!"
                },
                {
                    setup: "Did you hear about the mathematician who's afraid of negative numbers?",
                    punchline: "He'll stop at nothing to avoid them!"
                },
                {
                    setup: "Why did the scarecrow win an award?",
                    punchline: "Because he was outstanding in his field!"
                }
            ];

            showError(`API error: ${error.message}. Using fallback joke`);
            return fallbackJokes[Math.floor(Math.random() * fallbackJokes.length)];
        }
    }

    function changeFaceExpression() {
        const expressions = ['😐', '😊', '😂', '🤣', '😭', '😡', '🤔', '😴'];
        const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
        interactiveFace.textContent = randomExpression;
    }

    function rateJoke(level) {
        const feedbacks = [
            "That wasn't funny at all!",
            "Meh, I've heard better.",
            "That got a chuckle!",
            "Hahaha! That was great!",
            "I can't breathe! Too funny! 🤣"
        ];

        ratingFeedback.textContent = feedbacks[level - 1];

        // Highlight the selected rating
        rateButtons.forEach(btn => {
            btn.classList.remove('bg-yellow-300', 'scale-110');
            if (btn.dataset.level === level) {
                btn.classList.add('bg-yellow-300', 'scale-110');
            }
        });
    }

    function toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        // Store preference in localStorage
        localStorage.setItem('darkMode', isDark);
    }

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    function handleSubscribe(e) {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (email && validateEmail(email)) {
            // In a real app, you would send this to your server
            showSuccess('Thanks for subscribing! Get ready for daily laughs!');
            emailInput.value = '';
        } else {
            showError('Please enter a valid email address');
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.classList.add('animate-fade-out');
            setTimeout(() => errorDiv.remove(), 500);
        }, 3000);
    }

    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.classList.add('animate-fade-out');
            setTimeout(() => successDiv.remove(), 500);
        }, 3000);
    }

    function createConfetti() {
        // Clear existing confetti
        confettiContainer.innerHTML = '';

        // Create new confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Random properties
            const size = Math.random() * 10 + 5;
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 3 + 2;

            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.backgroundColor = color;
            confetti.style.left = `${left}vw`;
            confetti.style.top = '-10px';
            confetti.style.animation = `fall ${animationDuration}s linear forwards`;

            confettiContainer.appendChild(confetti);

            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, animationDuration * 1000);
        }

        // Add CSS animation for falling
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out forwards;
            }
            .animate-fade-out {
                animation: fadeOut 0.5s ease-out forwards;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
});