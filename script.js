const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioCtx;
let analyser;
let dataArray;
let bufferLength;
let particles = [];

async function initMic() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  analyser.getByteTimeDomainData(dataArray);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawWaveform();
  updateParticles();
}

function drawWaveform() {
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00ffcc';
  ctx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * canvas.height / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function updateParticles() {
  for (let i = 0; i < 5; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }

  particles.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
      particles.splice(i, 1);
    }
  });
}

document.body.addEventListener('click', () => {
  if (!audioCtx) initMic();
});
