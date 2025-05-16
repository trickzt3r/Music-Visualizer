const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx;
let analyser;
let dataArray;
let bufferLength;
let particles = [];
let orb = { x: canvas.width / 2, y: canvas.height / 2, baseRadius: 80 };

let settings = {
  hue: 180,
  saturation: 100,
  lightness: 50,
  bassBoost: true,
  particleScale: 1.5,
};

async function initMic() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  animate();
}

function getBassLevel() {
  // Lower frequency bins = bass
  const bassBins = dataArray.slice(0, 10);
  return bassBins.reduce((a, b) => a + b, 0) / bassBins.length;
}

function animate() {
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawOrb();
  updateParticles();
}

function drawOrb() {
  let avg = dataArray.reduce((a, b) => a + b) / bufferLength;
  let bass = settings.bassBoost ? getBassLevel() : 0;
  let glowRadius = orb.baseRadius + avg / 2 + bass / 2;

  let gradient = ctx.createRadialGradient(orb.x, orb.y, orb.baseRadius / 2, orb.x, orb.y, glowRadius);
  gradient.addColorStop(0, `hsl(${settings.hue}, ${settings.saturation}%, ${settings.lightness}%)`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
}

function updateParticles() {
  const bass = getBassLevel();
  for (let i = 0; i < 3 + bass / 25; i++) {
    particles.push({
      x: orb.x,
      y: orb.y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      radius: (Math.random() * 3 + 1) * settings.particleScale,
      life: 100,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`
    });
  }

  particles.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;
    p.life -= 1;

    if (p.life <= 0) particles.splice(i, 1);
  });
}

document.body.addEventListener('click', () => {
  if (!audioCtx) initMic();
});
