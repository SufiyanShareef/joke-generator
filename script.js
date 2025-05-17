const API_KEY = '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'

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

// Current joke index
let currentJokeIndex = 0;

// Initialize
function init() {
  // Hide punchline initially
  punchlineDisplay.classList.remove('show');

  // Set up event listeners
  revealBtn.addEventListener('click', togglePunchline);
  randomJokeBtn.addEventListener('click', getRandomJoke);
  surpriseBtn.addEventListener('click', surpriseMe);
  interactiveFace.addEventListener('click', changeFaceExpression);

  rateButtons.forEach(button => {
    button.addEventListener('click', () => rateJoke(button.dataset.level));
  });

  subscribeForm.addEventListener('submit', handleSubscribe);
  darkModeToggle.addEventListener('click', toggleDarkMode);
}

// Toggle punchline visibility
function togglePunchline() {
  punchlineDisplay.classList.toggle('show');
  revealBtn.textContent = punchlineDisplay.classList.contains('show') ?
    'Hide Punchline' : 'Show Punchline';
}

// Get a random joke
async function getRandomJoke() {
  punchlineDisplay.classList.remove('show');
  revealBtn.textContent = 'Show Punchline';
  jokeDisplay.textContent = "thinking of a funny joke.....";

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Joke Generator",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: "You are a comedy AI that ONLY responds with JSON jokes. Your output MUST be: {\"setup\":\"joke setup\",\"punchline\":\"punchline\"} with no other text, formatting, or commentary or explaination. Never use markdown or code blocks."
          },
          {
            role: "user",
            content: "Tell me a random joke in the exact specified JSON format."
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) throw new Error(res.statusText || "Network response was not ok");

    // const rawText = await res.text();
    // console.log("Raw response text:", rawText);

    // First parse the whole response
    const data = await res.text();
    console.log("raw data",data);
    let content = data.choices[0]?.message?.content;

    let joke = {
      setup: 'Why did the JSON parser fail?',
      punchline: "Because it couldn't handle the 'humerus' error!"
    };

    if (content) {
      try {
        // Remove any code block markers and trim whitespace
        const cleanedContent = content.replace(/```(json)?/g, '').trim();

        // Try to parse as JSON
        const parsedJoke = JSON.parse(cleanedContent);

        // Verify the parsed object has required properties
        if (parsedJoke.setup && parsedJoke.punchline) {
          joke = parsedJoke;
        }
      } catch (error) {
        console.error('Error parsing joke:', error);

        // Fallback: Try to extract setup and punchline using regex if JSON parse fails
        const setupMatch = content.match(/"setup":\s*"([^"]+)"/) || content.match(/setup[": ]+"([^"]+)"/i);
        const punchlineMatch = content.match(/"punchline":\s*"([^"]+)"/) || content.match(/punchline[": ]+"([^"]+)"/i);

        if (setupMatch && punchlineMatch) {
          joke = {
            setup: setupMatch[1],
            punchline: punchlineMatch[1]
          };
        }
      }
    }
    console.log(joke);
    jokeDisplay.textContent = joke.setup;
    punchlineDisplay.textContent = joke.punchline;

  } catch (err) {
    console.error("Error fetching joke:", err);
    jokeDisplay.textContent = "Failed to think of a joke. Try again!";
    punchlineDisplay.textContent = "";
  }

  // // Hide punchline when getting new joke
  // punchlineDisplay.classList.remove('show');
  // revealBtn.textContent = 'Show Punchline';

  // // Get random joke that's not the current one
  // let newIndex;
  // do {
  //   newIndex = Math.floor(Math.random() * jokes.length);
  // } while (newIndex === currentJokeIndex && jokes.length > 1);

  // currentJokeIndex = newIndex;

  // // Display new joke
  // jokeDisplay.textContent = jokes[currentJokeIndex].setup;
  // punchlineDisplay.textContent = jokes[currentJokeIndex].punchline;
}

// Surprise me function with confetti
function surpriseMe() {
  getRandomJoke();
  createConfetti();

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
  }, 1000);
}

// Change face expression
function changeFaceExpression() {
  const randomIndex = Math.floor(Math.random() * faceExpressions.length);
  interactiveFace.textContent = faceExpressions[randomIndex];

  // Add giggle animation for laughing faces
  if (randomIndex < 6) {
    interactiveFace.classList.add('animate-spin');
    setTimeout(() => {
      interactiveFace.classList.remove('animate-spin');
    }, 1000);
  }
}

// Rate the joke
function rateJoke(level) {
  const feedbacks = [
    "That joke was terrible!",
    "Meh, could be better.",
    "That was pretty good!",
    "Hahaha! That was funny!",
    "OMG I can't stop laughing!!!"
  ];

  ratingFeedback.textContent = feedbacks[level - 1];

  // Add animation
  ratingFeedback.classList.add('animate-pulse');
  setTimeout(() => {
    ratingFeedback.classList.remove('animate-pulse');
  }, 500);
}

// Handle subscription
function handleSubscribe(e) {
  e.preventDefault();
  alert("Thanks for subscribing! You'll get your first joke soon!");
  e.target.reset();
}

// Toggle dark mode
function toggleDarkMode() {
  document.body.classList.toggle('bg-gray-900');
  document.body.classList.toggle('text-white');

  // Change icon
  const icon = darkModeToggle.querySelector('i');
  if (document.body.classList.contains('bg-gray-900')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// Create confetti effect
function createConfetti() {
  // Clear previous confetti
  confettiContainer.innerHTML = '';

  // Create 50 confetti pieces
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');

    // Random position
    const xPos = Math.random() * window.innerWidth;

    // Random color
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Random size
    const size = Math.random() * 10 + 5;

    // Set styles
    confetti.style.left = `${xPos}px`;
    confetti.style.top = '-10px';
    confetti.style.backgroundColor = randomColor;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    // Random animation
    const animationDuration = Math.random() * 3 + 2;
    const animationDelay = Math.random() * 2;

    confetti.style.animation = `fall ${animationDuration}s ease-in ${animationDelay}s forwards`;

    // Add to container
    confettiContainer.appendChild(confetti);

    // Create keyframes for falling animation
    const keyframes = `
                    @keyframes fall {
                        to {
                            transform: translateY(${window.innerHeight + 10}px) rotate(${Math.random() * 360}deg);
                            opacity: 0;
                        }
                    }
                `;

    // Add style if not already added
    if (!document.getElementById('confetti-animation')) {
      const style = document.createElement('style');
      style.id = 'confetti-animation';
      style.innerHTML = keyframes;
      document.head.appendChild(style);
    }
  }

  // Remove confetti after animation
  setTimeout(() => {
    confettiContainer.innerHTML = '';
  }, 5000);
}

// Initialize the app
init();
