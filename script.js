async function generateJoke(){
  try {
    const res = await fetch('/assets/joke.json');
    const data = await res.json();
    const jokes = data.jokes;
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    document.getElementById('joke').innerText = joke;
  } catch (error) {
    console.error('failed to fetch jokes:',error);
  }
}
document.getElementById('generate-joke-button').addEventListener('click', generateJoke);