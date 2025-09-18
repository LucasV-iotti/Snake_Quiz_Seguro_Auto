// Snake Quiz – Seguro Auto (Dificuldades + Feedback final + Auto-continuação 3s)

// ===================== Dados das perguntas =====================
const QUESTIONS = [
  { q: '1. Qual é o público-alvo do Seguro Auto?', options: [
      'A) Empresas com frota de veículos',
      'B) Pessoas jurídicas com financiamento',
      'C) Exclusivo para pessoa física',
      'D) Clientes com score baixo' ], correct: 2,
    justification: 'O material especifica que o seguro é exclusivo para pessoa física, especialmente clientes com contratos de seguro finalizando ou que acabaram de fazer financiamento.' },
  { q: '2. Quais são as vigências disponíveis para os planos de seguro?', options: [
      'A) 6, 12 e 18 meses', 'B) 12, 24 e 36 meses', 'C) 24, 36 e 48 meses', 'D) 12, 18 e 24 meses' ], correct: 1,
    justification: 'Os planos têm vigência de 12, 24 ou 36 meses, conforme indicado no slide sobre contratação.' },
  { q: '3. Qual é a forma de pagamento aceita para o seguro Zurich?', options: [
      'A) Boleto bancário', 'B) Cartão de crédito', 'C) Débito em conta', 'D) Pix' ], correct: 2,
    justification: 'O seguro Zurich só aceita pagamento via débito em conta, enquanto o Santander aceita débito ou boleto.' },
  { q: '4. Quais são os pacotes disponíveis no seguro Santander?', options: [
      'A) Básico, Intermediário e Premium', 'B) Completo, Roubo e Furto, Terceiros', 'C) Casco, IR, RCF', 'D) Executivo, Básico, Terceiros' ], correct: 1,
    justification: 'O material apresenta três pacotes para o Santander: Completo, Roubo e Furto, e Terceiros.' },
  { q: '5. Qual é o limite de raio contratado para cobertura de guincho para o plano Completo?', options: [
      'A) 200 km','B) 300 km','C) 400 km','D) 500 km' ], correct: 2,
    justification: 'A tabela de valores do seguro indica que o limite de raio para guincho é de 400 km.' },
  { q: '6. Qual é o valor máximo assegurado para veículos elétricos e híbridos?', options: [
      'A) R$ 450.000,00','B) R$ 600.000,00','C) R$ 750.000,00','D) R$ 800.000,00' ], correct: 3,
    justification: 'O valor assegurado para veículos elétricos e híbridos é de até R$ 800.000,00, enquanto veículos a combustão têm limite de R$ 450.000,00.' },
  { q: '7. Em até quantas horas após a assinatura o cliente recebe o link para vistoria?', options: [
      'A) 1 hora','B) 3 horas','C) 6 horas','D) 12 horas' ], correct: 1,
    justification: 'O cliente recebe o link via WhatsApp em até 3 horas após a assinatura da proposta.' },
  { q: '8. Qual é o prazo máximo para o cliente realizar a vistoria após receber o link?', options: [
      'A) 24 horas','B) 48 horas','C) 72 horas','D) 96 horas' ], correct: 2,
    justification: 'O cliente tem até 72 horas para realizar a vistoria, caso contrário a proposta será recusada.' },
  { q: '9. Qual cobertura garante transporte para retorno ao domicílio em caso de pane a mais de 50 km?', options: [
      'A) Transporte Alternativo','B) Motorista Substituto','C) Retorno Antecipado','D) Locomoção para Recuperação' ], correct: 2,
    justification: 'A cobertura adicional de Assistência 24h garante retorno antecipado ao domicílio em caso de pane a mais de 50 km.' },
  { q: '10. Qual é o valor da franquia (casco) para o plano completo?', options: [
      'A) R$ 10.000,00','B) R$ 12.500,00','C) R$ 14.348,35','D) R$ 15.000,00' ], correct: 2,
    justification: 'O valor da franquia para o plano completo Casco está especificado como R$ 14.348,35.' }
];

// ===================== Dificuldades =====================
const DIFFICULTIES = {
  facil:  { label: 'Fácil',   speedMs: 170, wrap: true  },
  medio:  { label: 'Médio',   speedMs: 130, wrap: true  },
  dificil:{ label: 'Difícil', speedMs: 100, wrap: false }
};

// ===================== Estado global =====================
const state = {
  playerName: '-',
  running: false,
  grid: 28, // cobra maior
  cols: 32,
  rows: 32,
  snake: [],
  dir: {x: 1, y: 0},
  nextDir: {x: 1, y: 0},
  food: {x: 10, y: 10},
  speedMs: 120,
  timer: null,
  pendingGrowth: 0,
  score: 0,
  correct: 0,
  answered: 0,
  qIndex: 0,
  answers: [],
  animTick: 0,
  difficultyKey: 'dificil',
  wrap: false,
  resumeTimeoutId: null,
  resumeCountdownId: null
};

// ===================== Utilidades =====================
function $(sel){ return document.querySelector(sel); }
function el(tag, cls){ const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function randInt(max){ return Math.floor(Math.random() * max); }

// Canvas e context
const canvas = $('#game');
const ctx = canvas.getContext('2d');

// Telas e HUD
function showScreen(id){
  for (const sec of document.querySelectorAll('.screen')) sec.classList.remove('active');
  $(id).classList.add('active');
}

function applyDifficulty(){
  const cfg = DIFFICULTIES[state.difficultyKey];
  state.speedMs = cfg.speedMs;
  state.wrap = cfg.wrap;
  $('#hudDiff').textContent = cfg.label;
}

function resetState(){
  state.running = false;
  state.grid = 28;
  state.cols = Math.floor(canvas.width / state.grid);
  state.rows = Math.floor(canvas.height / state.grid);
  state.snake = [ {x: Math.floor(state.cols/2), y: Math.floor(state.rows/2)} ];
  state.dir = {x: 1, y: 0};
  state.nextDir = {x: 1, y: 0};
  state.food = spawnFood();
  state.pendingGrowth = 0;
  state.score = 0;
  state.correct = 0;
  state.answered = 0;
  state.qIndex = 0;
  state.answers = [];
}

function startGame(){
  const selected = document.querySelector('input[name="difficulty"]:checked');
  state.difficultyKey = selected ? selected.value : 'dificil';
  applyDifficulty();

  $('#hudName').textContent = state.playerName || '-';
  $('#hudScore').textContent = '0';
  $('#hudCorrect').textContent = '0';
  $('#hudLength').textContent = '1';

  resetState();
  showScreen('#gameScreen');
  state.running = true;
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(tick, state.speedMs);
}

$('#btnStart').addEventListener('click', () => {
  const name = $('#playerName').value.trim();
  state.playerName = name || 'Jogador';
  startGame();
});

$('#btnRestart').addEventListener('click', () => {
  showScreen('#startScreen');
});

// ===================== Jogo (Snake) =====================
function spawnFood(){
  while (true){
    const x = randInt(state.cols);
    const y = randInt(state.rows);
    if (!state.snake.some(s => s.x === x && s.y === y)) return {x, y};
  }
}

function tick(){
  state.dir = state.nextDir;

  let nx = state.snake[0].x + state.dir.x;
  let ny = state.snake[0].y + state.dir.y;

  if (state.wrap){
    if (nx < 0) nx = state.cols - 1; if (nx >= state.cols) nx = 0;
    if (ny < 0) ny = state.rows - 1; if (ny >= state.rows) ny = 0;
  } else {
    if (nx < 0 || nx >= state.cols || ny < 0 || ny >= state.rows){
      return gameOver('Bateu na parede');
    }
  }

  const head = {x: nx, y: ny};

  if (state.snake.some(seg => seg.x === head.x && seg.y === head.y)){
    return gameOver('Colidiu consigo mesmo');
  }

  state.snake.unshift(head);
  if (state.pendingGrowth > 0){
    state.pendingGrowth--;
  } else {
    state.snake.pop();
  }

  if (head.x === state.food.x && head.y === state.food.y){
    pauseGame();
    showQuestionModal();
  }

  $('#hudLength').textContent = String(state.snake.length);
}

// ===================== Render =====================
function roundedRectPath(x,y,w,h,r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y, x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x, y+h, rr);
  ctx.arcTo(x, y+h, x, y, rr);
  ctx.arcTo(x, y, x+w, y, rr);
  ctx.closePath();
}

function drawEyes(headX, headY, dir){
  const g = state.grid;
  const cx = headX*g + g/2;
  const cy = headY*g + g/2;
  const off = Math.max(3, Math.round(g*0.12));
  const rEye = Math.max(2, Math.round(g*0.08));
  const rPup = Math.max(1, Math.round(g*0.04));
  let ex1, ey1, ex2, ey2;
  if (dir.x === 1 && dir.y === 0){ ex1=cx+off; ey1=cy-3; ex2=cx+off; ey2=cy+3; }
  else if (dir.x === -1 && dir.y === 0){ ex1=cx-off; ey1=cy-3; ex2=cx-off; ey2=cy+3; }
  else if (dir.x === 0 && dir.y === 1){ ex1=cx-3; ey1=cy+off; ex2=cx+3; ey2=cy+off; }
  else { ex1=cx-3; ey1=cy-off; ex2=cx+3; ey2=cy-off; }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(ex1, ey1, rEye, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(ex2, ey2, rEye, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0b2f1f';
  ctx.beginPath(); ctx.arc(ex1, ey1, rPup, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(ex2, ey2, rPup, 0, Math.PI*2); ctx.fill();
}

function draw(){
  const g = state.grid;
  ctx.clearRect(0,0,canvas.width, canvas.height);

  ctx.save();
  ctx.strokeStyle = 'rgba(16, 185, 129, .18)';
  ctx.lineWidth = 1;
  for (let x=0; x<=canvas.width; x+=g){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke();
  }
  for (let y=0; y<=canvas.height; y+=g){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(0+canvas.width,y); ctx.stroke();
  }
  ctx.restore();

  // comida
  ctx.save();
  ctx.shadowColor = 'rgba(22,163,74,.35)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#16a34a';
  roundedRectPath(state.food.x*g+1, state.food.y*g+1, g-2, g-2, 5);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = `${Math.floor(g*0.9)}px system-ui`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#064e3b';
  ctx.fillText('💵', state.food.x*g + g/2, state.food.y*g + g/2 + 1);
  ctx.restore();

  // cobra
  for (let i=0; i<state.snake.length; i++){
    const seg = state.snake[i];
    const hue = 145 + i*2;
    ctx.save();
    ctx.shadowColor = 'rgba(22,163,74,.22)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;
    roundedRectPath(seg.x*g+1, seg.y*g+1, g-2, g-2, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(6,78,59,.55)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  const head = state.snake[0];
  if (head) drawEyes(head.x, head.y, state.dir);
}

function animLoop(){
  draw();
  requestAnimationFrame(animLoop);
}
requestAnimationFrame(animLoop);

function pauseGame(){
  state.running = false;
  if (state.timer){ clearInterval(state.timer); state.timer = null; }
}
function resumeGame(){
  if (!state.running){
    state.running = true;
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(tick, state.speedMs);
  }
}

function gameOver(reason){
  if (state.resumeTimeoutId){ clearTimeout(state.resumeTimeoutId); state.resumeTimeoutId = null; }
  if (state.resumeCountdownId){ clearInterval(state.resumeCountdownId); state.resumeCountdownId = null; }
  pauseGame();
  renderFinal(reason);
  showScreen('#endScreen');
}

// ===================== Controles =====================
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  let d = null;
  if (k === 'arrowup' || k === 'w') d = {x:0,y:-1};
  if (k === 'arrowdown' || k === 's') d = {x:0,y:1};
  if (k === 'arrowleft' || k === 'a') d = {x:-1,y:0};
  if (k === 'arrowright' || k === 'd') d = {x:1,y:0};
  if (d) setDir(d);
});

document.addEventListener('click', (ev) => {
  const b = ev.target.closest('.ctrl');
  if (!b) return;
  const dir = b.getAttribute('data-dir');
  if (dir === 'up') setDir({x:0,y:-1});
  if (dir === 'down') setDir({x:0,y:1});
  if (dir === 'left') setDir({x:-1,y:0});
  if (dir === 'right') setDir({x:1,y:0});
});

function setDir(d){
  if (d.x === -state.dir.x && d.y === -state.dir.y) return; // sem 180º
  state.nextDir = d;
}

// ===================== Quiz / Modal =====================
const quizModal = $('#quizModal');
const qTitle = $('#qTitle');
const qText = $('#qText');
const qForm = $('#qForm');
const qFeedback = $('#qFeedback');
const btnSubmitAnswer = $('#btnSubmitAnswer');

function showQuestionModal(){
  const i = state.qIndex;
  const total = QUESTIONS.length;

  if (state.answered >= total){
    renderFinal('Você respondeu todas as perguntas!');
    showScreen('#endScreen');
    return;
  }

  const q = QUESTIONS[i];
  qTitle.textContent = `Pergunta ${i+1} de ${total}`;
  qText.textContent = q.q;

  qForm.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const item = el('label', 'optionItem');
    const input = el('input'); input.type = 'radio'; input.name = 'opt'; input.value = String(idx);
    const span = el('span'); span.textContent = opt;
    item.appendChild(input); item.appendChild(span);
    qForm.appendChild(item);
  });

  qFeedback.textContent = '';
  btnSubmitAnswer.disabled = false;
  btnSubmitAnswer.classList.remove('hidden');

  quizModal.classList.remove('hidden');
}

btnSubmitAnswer.addEventListener('click', (e) => {
  e.preventDefault();
  const data = new FormData(qForm);
  const val = data.get('opt');
  if (val === null){
    qFeedback.textContent = 'Selecione uma alternativa antes de continuar.';
    return;
  }

  const chosen = Number(val);
  const q = QUESTIONS[state.qIndex];
  const isCorrect = chosen === q.correct;

  state.answers.push({
    q: q.q,
    options: q.options,
    chosenIndex: chosen,
    correctIndex: q.correct,
    isCorrect,
    justification: q.justification
  });
  state.answered++;

  if (isCorrect){
    state.correct++;
    state.score += 10;
    state.pendingGrowth += 1;
  }

  $('#hudScore').textContent = String(state.score);
  $('#hudCorrect').textContent = `${state.correct}`;

  state.food = spawnFood();

  // feedback curto (sem justificativa) + contagem 3s
  let remaining = 3;
  const prefix = isCorrect ? '✅ Correto.' : '❌ Incorreto.';
  qFeedback.innerHTML = `${prefix} Voltando ao jogo em <b><span id="countdown">${remaining}</span>s</b>...`;

  btnSubmitAnswer.disabled = true;

  if (state.resumeCountdownId) clearInterval(state.resumeCountdownId);
  state.resumeCountdownId = setInterval(() => {
    remaining--; const cd = document.getElementById('countdown'); if (cd) cd.textContent = String(remaining);
    if (remaining <= 0){ clearInterval(state.resumeCountdownId); state.resumeCountdownId = null; }
  }, 1000);

  if (state.resumeTimeoutId) clearTimeout(state.resumeTimeoutId);
  state.resumeTimeoutId = setTimeout(() => {
    quizModal.classList.add('hidden');
    state.qIndex++;
    if (state.answered >= QUESTIONS.length){
      renderFinal('Você respondeu todas as perguntas!');
      showScreen('#endScreen');
    } else {
      resumeGame();
    }
  }, 3000);
});

// ===================== Final =====================
function renderFinal(reason){
  $('#finalName').textContent = state.playerName || '-';
  $('#finalScore').textContent = String(state.score);
  $('#finalCorrect').textContent = String(state.correct);
  const cfg = DIFFICULTIES[state.difficultyKey];
  $('#finalDiff').textContent = cfg ? cfg.label : '-';

  const total = QUESTIONS.length;
  const msg = reason ? `🧾 ${reason}` : '';
  const resumo = `Você acertou ${state.correct} de ${total} perguntas. Pontuação total: ${state.score}.`;
  $('#finalReason').textContent = `${msg} ${resumo}`.trim();

  const tbody = $('#resultsBody');
  tbody.innerHTML = '';

  state.answers.forEach((a, i) => {
    const tr = document.createElement('tr');
    const tdIdx = document.createElement('td'); tdIdx.textContent = String(i+1);
    const tdQ = document.createElement('td'); tdQ.textContent = a.q;
    const tdYour = document.createElement('td'); tdYour.textContent = a.options[a.chosenIndex] || '-';
    const tdOk = document.createElement('td'); tdOk.textContent = a.isCorrect ? '✔' : '✘'; tdOk.style.color = a.isCorrect ? '#16a34a' : '#ef4444';
    const tdJust = document.createElement('td'); tdJust.textContent = a.justification;
    tr.append(tdIdx, tdQ, tdYour, tdOk, tdJust);
    tbody.appendChild(tr);
  });
}
