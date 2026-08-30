const musicButton = document.querySelector('#musicButton');
const musicLabel = document.querySelector('#musicLabel');
let musicOn = false, audioContext, timer, barIndex = 0;

// --- Afro-jazz loop: walking bass + syncopated melody + shaker groove ---
const TEMPO = 96;                 // BPM
const beat = 60 / TEMPO;          // seconds per quarter note
const eighth = beat / 2;

// ii - V - I - vi jazz progression (Dm7, G7, Cmaj7, Am7), walking bass + matching scale
const chords = [
  { bass: [73.42, 87.31, 98.00, 110.00],  scale: [293.66, 349.23, 392.00, 440.00, 523.25] },
  { bass: [98.00, 123.47, 130.81, 146.83], scale: [392.00, 440.00, 493.88, 587.33, 659.25] },
  { bass: [130.81, 146.83, 164.81, 196.00], scale: [523.25, 587.33, 659.25, 783.99, 880.00] },
  { bass: [110.00, 130.81, 146.83, 164.81], scale: [440.00, 493.88, 523.25, 659.25, 698.46] },
];

function tone(freq, time, duration, type, peak) {
  const osc = audioContext.createOscillator(), gain = audioContext.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
  osc.connect(gain).connect(audioContext.destination);
  osc.start(time); osc.stop(time + duration + .05);
}

function shaker(time) {
  const size = audioContext.sampleRate * .05;
  const buffer = audioContext.createBuffer(1, size, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  const noise = audioContext.createBufferSource(); noise.buffer = buffer;
  const filter = audioContext.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 4500;
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(.12, time);
  gain.gain.exponentialRampToValueAtTime(.001, time + .05);
  noise.connect(filter).connect(gain).connect(audioContext.destination);
  noise.start(time);
}

function scheduleBar() {
  if (!musicOn) return;
  const chord = chords[barIndex % chords.length];
  const now = audioContext.currentTime + .05;
  chord.bass.forEach((freq, i) => tone(freq, now + i * beat, beat * .9, 'triangle', .09));
  for (let i = 0; i < 8; i++) shaker(now + i * eighth);
  [1, 2.5, 4, 5.5, 7].forEach(pos => {
    const freq = chord.scale[Math.floor(Math.random() * chord.scale.length)];
    tone(freq, now + pos * eighth, eighth * 1.4, 'sine', .055);
  });
  barIndex++;
  timer = setTimeout(scheduleBar, beat * 4 * 1000 - 40);
}

function startMusic() {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === 'suspended') audioContext.resume();
  musicOn = true;
  musicButton.setAttribute('aria-pressed', 'true');
  musicLabel.textContent = 'Mute the music';
  scheduleBar();
}

function stopMusic() {
  musicOn = false;
  clearTimeout(timer);
  musicButton.setAttribute('aria-pressed', 'false');
  musicLabel.textContent = 'Unmute the music';
}

musicButton.addEventListener('click', e => { e.stopPropagation(); musicOn ? stopMusic() : startMusic(); });

// Browsers block audio until the visitor interacts with the page at least once,
// so the loop kicks in — and then keeps looping forever — on their very first tap/click/key.
function autoStartOnce() {
  if (!musicOn) startMusic();
  document.removeEventListener('click', autoStartOnce);
  document.removeEventListener('touchstart', autoStartOnce);
  document.removeEventListener('keydown', autoStartOnce);
}
document.addEventListener('click', autoStartOnce);
document.addEventListener('touchstart', autoStartOnce);
document.addEventListener('keydown', autoStartOnce);

document.querySelector('#scrollButton').addEventListener('click', () => document.querySelector('#surprise').scrollIntoView({behavior:'smooth'}));
const canvas = document.querySelector('#confetti');
function hearts() { for(let i=0;i<15;i++){ const heart=document.createElement('span'); heart.className='heart'; heart.textContent=['♥','♡','✦'][i%3]; heart.style.left=`${Math.random()*100}%`; heart.style.fontSize=`${15+Math.random()*18}px`; heart.style.animationDuration=`${5+Math.random()*5}s`; heart.style.animationDelay=`${Math.random()*2}s`; canvas.append(heart); setTimeout(()=>heart.remove(),11000); } }
function confetti(){ const colors=['#ff5c9f','#ffd364','#ffffff','#ac5cc9','#77d7cf']; for(let i=0;i<85;i++){const p=document.createElement('i');p.className='confetti-piece';p.style.left=`${Math.random()*100}%`;p.style.background=colors[i%colors.length];p.style.transform=`rotate(${Math.random()*180}deg)`;p.style.animationDelay=`${Math.random()*.65}s`;canvas.append(p);setTimeout(()=>p.remove(),3700);} }
hearts(); setInterval(hearts, 8500);
document.querySelector('#revealButton').addEventListener('click', () => { document.querySelector('#giftCard').classList.add('revealed'); confetti(); });
