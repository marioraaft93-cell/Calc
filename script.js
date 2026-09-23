// ---------- Sound engine (Web Audio API, no external files) ----------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function ctx(){
  if(!actx) actx = new AudioCtx();
  return actx;
}

function beep(freq, duration, type='square', vol=0.05, delay=0){
  const a = ctx();
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function playStartJingle(){
  beep(440, 0.09, 'square', 0.06, 0);
  beep(660, 0.09, 'square', 0.06, 0.09);
  beep(880, 0.14, 'square', 0.06, 0.18);
}

function playRowTick(i){
  // pitch rises slightly with each row for a satisfying climb
  const freq = 300 + i * 25;
  beep(freq, 0.06, 'square', 0.045);
}

function playDoneChime(){
  beep(523, 0.08, 'triangle', 0.05, 0);
  beep(659, 0.08, 'triangle', 0.05, 0.08);
  beep(784, 0.16, 'triangle', 0.06, 0.16);
}

function playError(){
  beep(140, 0.2, 'sawtooth', 0.06);
}

// ---------- Same logic as the Python program ----------
// print("***Welcome to the multiplication table***")
// number = int(input("Enter a number:\n"))
// print(f"multiplication table for {number}:\n")
// for i in range(1, 11):
//     result = number * i
//     print(f"{number} x {i} = {result}")

const screen = document.getElementById('screen');
const input = document.getElementById('numInput');
const btn = document.getElementById('runBtn');

function runProgram(){
  const raw = input.value.trim();
  const number = parseInt(raw, 10);

  screen.innerHTML = '';

  if(raw === '' || isNaN(number)){
    playError();
    const err = document.createElement('p');
    err.className = 'error';
    err.textContent = '⚠ لازم تكتب رقم صحيح الأول!';
    screen.appendChild(err);
    input.focus();
    return;
  }

  playStartJingle();

  const banner = document.createElement('p');
  banner.className = 'banner';
  banner.textContent = `جدول الضرب لـ ${number}:`;
  screen.appendChild(banner);

  // for i in range(1, 11)
  for(let i = 1; i <= 10; i++){
    const result = number * i;
    const line = document.createElement('div');
    line.className = 'table-line';
    line.innerHTML = `<span>${number} × ${i}</span><span class="res">= ${result}</span>`;
    screen.appendChild(line);

    // stagger the reveal + tick sound for a "typing" arcade feel
    setTimeout(((el, idx) => () => {
      el.classList.add('show', 'flash');
      playRowTick(idx);
      setTimeout(() => el.classList.remove('flash'), 180);
    })(line, i), i * 160);
  }

  setTimeout(playDoneChime, 10 * 160 + 100);
}

btn.addEventListener('click', runProgram);
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') runProgram();
});
