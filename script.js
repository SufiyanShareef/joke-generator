const jokes = [
    "Why don’t skeletons fight each other? They don’t have the guts!",
    "I told my wife she was drawing her eyebrows too high. She looked surprised!",
    "Why don’t eggs tell jokes? They might crack up!",
    "I used to play piano by ear, but now I use my hands!",
    "What’s orange and sounds like a parrot? A carrot!"
  ];

  function generateJoke() {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    document.getElementById('joke').innerText = jokes[randomIndex];
  }