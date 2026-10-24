/**
 * MATHKIDS.VN - ĐẤU TRƯỜNG TOÁN TƯ DUY TIỂU HỌC
 * Game Logic, Web Audio Synthesizer, Question Bank, Balance Scale & Leaderboard
 */

// Hàm mã hóa ký tự đặc biệt phòng chống tấn công XSS (Cross-Site Scripting)
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================
// 1. WEB AUDIO SYNTHESIZER (Không cần file mp3, chạy 100% offline)
// ============================================================
class SoundEffects {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.28);
      });
    } catch (e) {}
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [320, 240];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.linearRampToValueAtTime(0.001, start + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.18);
      });
    } catch (e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const fanfare = [
        { f: 523.25, t: 0.12 },
        { f: 523.25, t: 0.12 },
        { f: 523.25, t: 0.12 },
        { f: 659.25, t: 0.28 },
        { f: 783.99, t: 0.45 }
      ];
      let offset = 0;
      fanfare.forEach(item => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + offset;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, start);
        gain.gain.setValueAtTime(0.22, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + item.t);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + item.t);
        offset += item.t;
      });
    } catch (e) {}
  }

  playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }
}

const sounds = new SoundEffects();

// ============================================================
// 2. PHÁO HOA GIẤY CONFETTI (CANVAS PARTICLES)
// ============================================================
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(duration = 2500) {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    const colors = ['#facc15', '#38bdf8', '#fb7185', '#22c55e', '#c084fc', '#fb923c'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: this.canvas.width * (0.3 + Math.random() * 0.4),
        y: this.canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (!this.animating) {
      this.animating = true;
      const startTime = performance.now();
      const loop = (now) => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach((p, idx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.4; // gravity
          p.rotation += p.vRot;
          p.opacity -= 0.008;

          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0, p.opacity);
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          this.ctx.restore();

          if (p.opacity <= 0 || p.y > this.canvas.height) {
            this.particles.splice(idx, 1);
          }
        });

        if (this.particles.length > 0 && now - startTime < duration) {
          requestAnimationFrame(loop);
        } else {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.particles = [];
          this.animating = false;
        }
      };
      requestAnimationFrame(loop);
    }
  }
}

const confetti = new ConfettiCannon('confettiCanvas');

// ============================================================
// 3. TOÁN TƯ DUY QUESTION BANK (CÁC KHỐI LỚP 1 ĐẾN 5)
// ============================================================
const QUESTION_BANK = {
  // LỚP 1: Khởi đầu tư duy số học, so sánh, hình học trực quan, màu sắc
  1: [
    {
      id: 'g1_1',
      topic: 'Quy luật dãy số',
      diff: 'Dễ',
      question: 'Bé hãy tìm số thích hợp điền vào dấu chấm hỏi (?)',
      visual: {
        type: 'sequence',
        items: ['2', '4', '6', '8', '?']
      },
      options: ['9', '10', '12', '14'],
      correct: '10',
      hint: 'Mỗi số phía sau bằng số phía trước cộng thêm 2 đơn vị đó bé!',
      explanation: 'Dãy số chẵn cách nhau 2 đơn vị: 2 (+2) = 4; 4 (+2) = 6; 6 (+2) = 8; 8 (+2) = 10. Đáp án đúng là 10.'
    },
    {
      id: 'g1_2',
      topic: 'So sánh & Số lượng',
      diff: 'Dễ',
      question: 'Bên đĩa trái có 4 quả táo đỏ 🍎 và 5 quả táo xanh 🍏. Đĩa phải có 8 quả táo vàng 🍋. Hỏi đĩa nào nhiều táo hơn?',
      visual: {
        type: 'equation',
        left: '🍎🍎🍎🍎 + 🍏🍏🍏🍏🍏',
        op: 'so sánh với',
        right: '🍋🍋🍋🍋🍋🍋🍋🍋'
      },
      options: ['Đĩa trái nhiều hơn', 'Đĩa phải nhiều hơn', 'Hai đĩa bằng nhau', 'Không thể biết'],
      correct: 'Đĩa trái nhiều hơn',
      hint: 'Bé hãy tính tổng số quả táo ở đĩa bên trái xem có mấy quả nhé!',
      explanation: 'Đĩa trái có: 4 + 5 = 9 quả táo. Đĩa phải có 8 quả. Vì 9 > 8 nên đĩa bên trái nhiều táo hơn.'
    },
    {
      id: 'g1_3',
      topic: 'Hình học trực quan',
      diff: 'Vừa',
      question: 'Một chiếc bánh sandwich hình vuông 🥪 được cắt chéo thành 2 nửa. Hỏi mỗi nửa có dạng hình gì?',
      visual: {
        type: 'shapes',
        content: `
          <svg class="shape-svg-canvas" viewBox="0 0 100 100">
            <rect x="15" y="15" width="70" height="70" fill="#facc15" stroke="#ca8a04" stroke-width="3" rx="4"/>
            <line x1="15" y1="15" x2="85" y2="85" stroke="#ef4444" stroke-width="3" stroke-dasharray="4"/>
          </svg>
        `
      },
      options: ['Hình tam giác', 'Hình tròn', 'Hình chữ nhật', 'Hình thoi'],
      correct: 'Hình tam giác',
      hint: 'Hình này có 3 góc và 3 cạnh thẳng đó bé!',
      explanation: 'Khi cắt đôi hình vuông theo đường chéo, ta được 2 hình tam giác vuông cân bằng nhau.'
    },
    {
      id: 'g1_4',
      topic: 'Quy luật hình vẽ',
      diff: 'Dễ',
      question: 'Tìm hình tiếp theo cho quy luật: 🔴 🟦 🔴 🟦 🔴 [?]',
      visual: {
        type: 'sequence',
        items: ['🔴', '🟦', '🔴', '🟦', '🔴', '?']
      },
      options: ['🔴 (Hình tròn đỏ)', '🟦 (Hình vuông xanh)', '⭐ (Ngôi sao vàng)', '🔺 (Tam giác cam)'],
      correct: '🟦 (Hình vuông xanh)',
      hint: 'Màu đỏ và màu xanh xen kẽ nhau: Đỏ rồi đến Xanh, Đỏ rồi lại đến...',
      explanation: 'Quy luật lặp lại 2 hình tròn đỏ và vuông xanh xen kẽ. Sau hình tròn đỏ chắc chắn là hình vuông xanh 🟦.'
    },
    {
      id: 'g1_5',
      topic: 'Toán đố logic',
      diff: 'Vừa',
      question: 'Bé Miu có 10 chiếc kẹo. Miu cho bạn Cún 3 chiếc, cho bạn Thỏ 2 chiếc. Hỏi bé Miu còn lại mấy chiếc kẹo?',
      visual: {
        type: 'equation',
        left: '10 chiếc kẹo',
        op: 'bớt đi (3 + 2)',
        right: 'còn lại ?'
      },
      options: ['4 chiếc kẹo', '5 chiếc kẹo', '6 chiếc kẹo', '7 chiếc kẹo'],
      correct: '5 chiếc kẹo',
      hint: 'Tính xem Miu đã cho đi tất cả mấy chiếc kẹo, rồi lấy 10 trừ đi nhé!',
      explanation: 'Tổng số kẹo Miu cho đi là: 3 + 2 = 5 chiếc. Miu còn lại: 10 - 5 = 5 chiếc kẹo.'
    },
    {
      id: 'g1_6',
      topic: 'Tìm ẩn số',
      diff: 'Vừa',
      question: 'Nếu 🐱 + 🐱 = 6 và 🐱 + 🐶 = 7. Hỏi chú cún 🐶 bằng mấy?',
      visual: {
        type: 'equation',
        left: '🐱 + 🐱 = 6',
        op: '&',
        right: '🐱 + 🐶 = 7'
      },
      options: ['3', '4', '5', '2'],
      correct: '4',
      hint: 'Hai chú mèo bằng 6, vậy 1 chú mèo bằng mấy? Rồi lấy 7 trừ đi chú mèo nhé!',
      explanation: 'Ta có 🐱 + 🐱 = 6 nên 🐱 = 3. Thay vào: 3 + 🐶 = 7 => 🐶 = 7 - 3 = 4.'
    }
  ],

  // LỚP 2: Phép tính có nhớ, nhân chia 2 & 5, xem giờ, tư duy đo lường, đố vui
  2: [
    {
      id: 'g2_1',
      topic: 'Dãy số tư duy',
      diff: 'Dễ',
      question: 'Điền số còn thiếu vào chỗ trống: 5, 10, 15, 20, 25, [?]',
      visual: {
        type: 'sequence',
        items: ['5', '10', '15', '20', '25', '?']
      },
      options: ['28', '30', '35', '40'],
      correct: '30',
      hint: 'Dãy số này cứ mỗi bước lại tăng thêm đúng 5 đơn vị!',
      explanation: 'Quy luật cộng 5: 25 + 5 = 30. Đây chính là các số trong bảng nhân 5.'
    },
    {
      id: 'g2_2',
      topic: 'Bài toán thực tế',
      diff: 'Vừa',
      question: 'Một con nhện có 8 cái chân. Hỏi 4 con nhện như thế có tất cả bao nhiêu cái chân?',
      visual: {
        type: 'equation',
        left: '4 con nhện 🕷️',
        op: '× 8 chân',
        right: '? cái chân'
      },
      options: ['24 chân', '28 chân', '32 chân', '36 chân'],
      correct: '32 chân',
      hint: 'Bé lấy 8 chân nhân với 4 con nhện nhé!',
      explanation: 'Phép nhân: 8 × 4 = 32 cái chân.'
    },
    {
      id: 'g2_3',
      topic: 'Toán đố mẹo tư duy',
      diff: 'Khó',
      question: 'Một khúc gỗ dài 8 mét. Bác thợ mộc muốn cưa thành các đoạn ngắn dài 2 mét. Hỏi bác cần cưa bao nhiêu lần?',
      visual: {
        type: 'shapes',
        content: `
          <div style="font-size: 15px; color: #facc15; font-weight: bold; text-align: center;">
            🪵 [ 2m ] ✂️ [ 2m ] ✂️ [ 2m ] ✂️ [ 2m ]
          </div>
        `
      },
      options: ['4 lần cưa', '3 lần cưa', '2 lần cưa', '5 lần cưa'],
      correct: '3 lần cưa',
      hint: 'Chú ý nhé: Số đoạn gỗ cưa được nhiều hơn số nhát cưa là 1!',
      explanation: 'Khúc gỗ 8m chia thành các đoạn 2m thì được: 8 ÷ 2 = 4 đoạn. Để có 4 đoạn gỗ thì chỉ cần cưa 3 lần (nhát cưa thứ 3 đã tách được cả đoạn thứ 3 và đoạn thứ 4).'
    },
    {
      id: 'g2_4',
      topic: 'Xem giờ & Thời gian',
      diff: 'Vừa',
      question: 'Đồng hồ chỉ kim ngắn vào số 3, kim dài chỉ vào số 6. Hỏi lúc đó là mấy giờ?',
      visual: {
        type: 'equation',
        left: 'Kim ngắn: 3',
        op: '⏰',
        right: 'Kim dài: 6'
      },
      options: ['3 giờ đúng', '3 giờ 30 phút', '6 giờ 15 phút', '3 giờ 6 phút'],
      correct: '3 giờ 30 phút',
      hint: 'Kim dài chỉ số 6 là 30 phút (rưỡi) đó bạn nhỏ!',
      explanation: 'Kim ngắn qua số 3 và kim dài chỉ số 6 (6 × 5 = 30 phút), vậy lúc đó là 3 giờ 30 phút (hay 3 giờ rưỡi).'
    },
    {
      id: 'g2_5',
      topic: 'Ẩn số hình học',
      diff: 'Vừa',
      question: 'Biết: 🔺 + 🔺 = 16 và 🔺 - 🟩 = 3. Giá trị của 🟩 là bao nhiêu?',
      visual: {
        type: 'equation',
        left: '🔺 + 🔺 = 16',
        op: 'và',
        right: '🔺 - 🟩 = 3'
      },
      options: ['4', '5', '8', '11'],
      correct: '5',
      hint: 'Tìm 🔺 trước: hai số giống nhau cộng lại bằng 16 là số mấy?',
      explanation: 'Vì 🔺 + 🔺 = 16 nên 🔺 = 8. Khi đó: 8 - 🟩 = 3 => 🟩 = 8 - 3 = 5.'
    }
  ],

  // LỚP 3: Bảng cửu chương 1-9, chu vi, diện tích ô vuông, bài toán gấp lần, logic
  3: [
    {
      id: 'g3_1',
      topic: 'Tính nhẩm & Cửu chương',
      diff: 'Vừa',
      question: 'Kết quả của phép tính: 7 × 8 + 14 = ?',
      visual: {
        type: 'equation',
        left: '7 × 8',
        op: '+ 14 =',
        right: '?'
      },
      options: ['68', '70', '72', '64'],
      correct: '70',
      hint: 'Tính phép nhân 7 × 8 trước, rồi cộng thêm 14.',
      explanation: '7 × 8 = 56. Sau đó: 56 + 14 = 70.'
    },
    {
      id: 'g3_2',
      topic: 'Chu vi & Hình học',
      diff: 'Vừa',
      question: 'Một mảnh sân hình chữ nhật có chiều dài 9m và chiều rộng 6m. Chu vi của mảnh sân đó là bao nhiêu mét?',
      visual: {
        type: 'shapes',
        content: `
          <svg class="shape-svg-canvas" viewBox="0 0 120 80">
            <rect x="15" y="15" width="90" height="50" fill="none" stroke="#38bdf8" stroke-width="3" rx="4"/>
            <text x="60" y="10" fill="#facc15" font-size="10" text-anchor="middle">Dài: 9m</text>
            <text x="5" y="45" fill="#facc15" font-size="10" text-anchor="middle">Rộng: 6m</text>
          </svg>
        `
      },
      options: ['15m', '30m', '54m', '24m'],
      correct: '30m',
      hint: 'Công thức tính chu vi hình chữ nhật: (Chiều dài + Chiều rộng) × 2.',
      explanation: 'Chu vi = (9 + 6) × 2 = 15 × 2 = 30m. (54m² là diện tích, không phải chu vi).'
    },
    {
      id: 'g3_3',
      topic: 'Toán gấp nhiều lần',
      diff: 'Vừa',
      question: 'An có 6 viên bi. Bình có số bi gấp 3 lần số bi của An. Hỏi cả hai bạn có tất cả bao nhiêu viên bi?',
      visual: {
        type: 'equation',
        left: 'An: 6 bi',
        op: 'Bình: gấp 3 lần An',
        right: 'Cả hai: ?'
      },
      options: ['18 viên bi', '24 viên bi', '20 viên bi', '30 viên bi'],
      correct: '24 viên bi',
      hint: 'Đầu tiên tính số bi của Bình, sau đó cộng số bi của hai bạn lại với nhau.',
      explanation: 'Số bi của Bình là: 6 × 3 = 18 viên bi. Cả hai bạn có: 6 + 18 = 24 viên bi.'
    },
    {
      id: 'g3_4',
      topic: 'Quy luật ma trận',
      diff: 'Khó',
      question: 'Tìm số còn thiếu trong ma trận số bên dưới:',
      visual: {
        type: 'shapes',
        content: `
          <div style="display: grid; grid-template-columns: repeat(3, 50px); gap: 8px; justify-content: center;">
            <div class="seq-item">2</div><div class="seq-item">4</div><div class="seq-item">8</div>
            <div class="seq-item">3</div><div class="seq-item">6</div><div class="seq-item">12</div>
            <div class="seq-item">4</div><div class="seq-item">8</div><div class="seq-item missing">?</div>
          </div>
        `
      },
      options: ['12', '14', '16', '18'],
      correct: '16',
      hint: 'Mỗi hàng: Số thứ 2 gấp đôi số thứ 1, số thứ 3 lại gấp đôi số thứ 2!',
      explanation: 'Quy luật theo hàng ngang: 4 = 2 × 2; 8 = 4 × 2. Hàng 3: 4 -> 8 (4×2) -> ? (8×2 = 16).'
    },
    {
      id: 'g3_5',
      topic: 'Dãy số Fibonacci mini',
      diff: 'Khó',
      question: 'Tìm số tiếp theo trong dãy số bí ẩn: 1, 1, 2, 3, 5, 8, [?]',
      visual: {
        type: 'sequence',
        items: ['1', '1', '2', '3', '5', '8', '?']
      },
      options: ['11', '12', '13', '15'],
      correct: '13',
      hint: 'Kể từ số thứ ba, mỗi số bằng tổng của hai số đứng ngay trước nó!',
      explanation: 'Quy luật: 1+1=2; 1+2=3; 2+3=5; 3+5=8; 5+8 = 13. Đây chính là dãy số Fibonacci nổi tiếng thế giới!'
    }
  ],

  // LỚP 4: Tổng - Hiệu, Giả thiết tạm (Gà & Chó), phân số cơ bản, dãy số bậc hai
  4: [
    {
      id: 'g4_1',
      topic: 'Toán Tổng - Hiệu',
      diff: 'Vừa',
      question: 'Hai bạn Minh và Nam có tổng cộng 50 viên bi. Minh có nhiều hơn Nam 12 viên bi. Hỏi bạn Minh có bao nhiêu viên bi?',
      visual: {
        type: 'equation',
        left: 'Tổng = 50',
        op: 'Hiệu = 12',
        right: 'Số bi của Minh = ?'
      },
      options: ['31 viên', '28 viên', '38 viên', '19 viên'],
      correct: '31 viên',
      hint: 'Công thức tìm số lớn khi biết Tổng và Hiệu: (Tổng + Hiệu) ÷ 2.',
      explanation: 'Số bi của Minh (số lớn) = (50 + 12) ÷ 2 = 62 ÷ 2 = 31 viên bi. Nam có: 31 - 12 = 19 viên.'
    },
    {
      id: 'g4_2',
      topic: 'Bài toán Gà và Chó',
      diff: 'Khó',
      question: 'Bác Ba nuôi tất cả 10 con gồm cả gà và chó. Đếm được tất cả có 26 cái chân. Hỏi bác Ba nuôi bao nhiêu con chó?',
      visual: {
        type: 'equation',
        left: '10 con (Gà 🐓 & Chó 🐕)',
        op: '=',
        right: '26 chân'
      },
      options: ['2 con chó', '3 con chó', '4 con chó', '5 con chó'],
      correct: '3 con chó',
      hint: 'Giả sử cả 10 con đều là gà (mỗi con 2 chân) thì có 20 chân. Số chân dôi ra là do các con chó (mỗi con hơn 2 chân)!',
      explanation: 'Giả sử cả 10 con đều là gà: 10 × 2 = 20 chân. Số chân thiếu so với thực tế là: 26 - 20 = 6 chân. Mỗi con chó hơn con gà: 4 - 2 = 2 chân. Số con chó là: 6 ÷ 2 = 3 con chó. (Số gà là 7 con).'
    },
    {
      id: 'g4_3',
      topic: 'Phân số tư duy',
      diff: 'Vừa',
      question: 'Một lớp học có 40 học sinh. Trong đó có 3/5 số học sinh là học sinh nữ. Hỏi lớp đó có bao nhiêu học sinh nam?',
      visual: {
        type: 'equation',
        left: 'Tổng: 40 học sinh',
        op: 'Nữ: 3/5',
        right: 'Nam: ? học sinh'
      },
      options: ['16 học sinh', '24 học sinh', '20 học sinh', '18 học sinh'],
      correct: '16 học sinh',
      hint: 'Phân số chỉ học sinh nam là: 1 - 3/5 = 2/5 cả lớp.',
      explanation: 'Số học sinh nữ là: 40 × 3/5 = 24 học sinh. Số học sinh nam là: 40 - 24 = 16 học sinh (hoặc 40 × 2/5 = 16).'
    },
    {
      id: 'g4_4',
      topic: 'Dãy số khoảng cách tăng dần',
      diff: 'Khó',
      question: 'Tìm số tiếp theo của dãy số: 2, 5, 10, 17, 26, [?]',
      visual: {
        type: 'sequence',
        items: ['2', '5', '10', '17', '26', '?']
      },
      options: ['35', '37', '39', '42'],
      correct: '37',
      hint: 'Quan sát khoảng cách: 2 (+3) = 5; 5 (+5) = 10; 10 (+7) = 17; 17 (+9) = 26...',
      explanation: 'Khoảng cách giữa các số liên tiếp là dãy số lẻ: +3, +5, +7, +9. Khoảng cách tiếp theo là +11. Vậy số cần tìm là: 26 + 11 = 37.'
    },
    {
      id: 'g4_5',
      topic: 'Toán trồng cây',
      diff: 'Vừa',
      question: 'Một đoạn đường thẳng dài 40 mét. Người ta trồng cây ở cả 2 đầu đường và cứ cách 4 mét thì trồng 1 cây. Hỏi trồng được bao nhiêu cây?',
      visual: {
        type: 'equation',
        left: 'Đoạn đường: 40m',
        op: 'Khoảng cách: 4m/cây',
        right: 'Tổng số cây: ?'
      },
      options: ['10 cây', '11 cây', '9 cây', '12 cây'],
      correct: '11 cây',
      hint: 'Khi trồng cây ở cả 2 đầu đường thì: Số cây = Số khoảng cách + 1.',
      explanation: 'Số khoảng cách là: 40 ÷ 4 = 10 khoảng cách. Vì trồng cây ở cả 2 đầu đường nên số cây là: 10 + 1 = 11 cây.'
    }
  ],

  // LỚP 5: Chuyển động đều (v, s, t), Tỉ số phần trăm, Khối lập phương không gian, Tính nhanh
  5: [
    {
      id: 'g5_1',
      topic: 'Chuyển động đều',
      diff: 'Vừa',
      question: 'Một người đi xe máy khởi hành lúc 7 giờ và đến nơi lúc 9 giờ 30 phút. Quãng đường đi được là 100km. Vận tốc của người đó là:',
      visual: {
        type: 'equation',
        left: 'Quãng đường s = 100km',
        op: 'Thời gian t = 2.5 giờ',
        right: 'Vận tốc v = ?'
      },
      options: ['35 km/h', '40 km/h', '45 km/h', '50 km/h'],
      correct: '40 km/h',
      hint: 'Thời gian đi là 9h30 - 7h = 2h30 = 2,5 giờ. Công thức v = s ÷ t.',
      explanation: 'Thời gian đi: 9 giờ 30 phút - 7 giờ = 2 giờ 30 phút = 2,5 giờ. Vận tốc: v = 100 ÷ 2,5 = 40 km/h.'
    },
    {
      id: 'g5_2',
      topic: 'Tỉ số phần trăm',
      diff: 'Vừa',
      question: 'Một đôi giày thể thao có giá niêm yết 300.000 đồng. Nhân dịp khai giảng, cửa hàng giảm giá 20%. Hỏi người mua phải trả bao nhiêu tiền?',
      visual: {
        type: 'equation',
        left: 'Giá gốc: 300.000đ',
        op: 'Giảm: 20%',
        right: 'Phải trả: ?'
      },
      options: ['240.000 đồng', '260.000 đồng', '280.000 đồng', '60.000 đồng'],
      correct: '240.000 đồng',
      hint: 'Số tiền giảm là 300.000 × 20% = 60.000đ. Lấy giá gốc trừ đi số tiền giảm.',
      explanation: 'Số tiền được giảm: 300.000 × 20 ÷ 100 = 60.000 đồng. Số tiền thực tế phải trả: 300.000 - 60.000 = 240.000 đồng (hoặc 300.000 × 80% = 240.000).'
    },
    {
      id: 'g5_3',
      topic: 'Hình học không gian',
      diff: 'Khó',
      question: 'Một khối lập phương lớn được ghép từ 27 khối lập phương nhỏ cạnh 1cm. Người ta sơn màu xanh toàn bộ 6 mặt ngoài. Hỏi có bao nhiêu khối nhỏ được sơn đúng 3 mặt?',
      visual: {
        type: 'shapes',
        content: `
          <div style="font-size: 32px; text-align: center;">🎲 3 × 3 × 3 = 27 khối</div>
        `
      },
      options: ['6 khối', '8 khối', '12 khối', '1 khối'],
      correct: '8 khối',
      hint: 'Những khối lập phương con được sơn đúng 3 mặt nằm ở đâu trên khối lớn (mặt, cạnh hay đỉnh)?',
      explanation: 'Các khối nhỏ được sơn 3 mặt chính là các khối nằm tại 8 đỉnh của khối lập phương lớn. Vì hình lập phương luôn có đúng 8 đỉnh nên có đúng 8 khối nhỏ được sơn 3 mặt.'
    },
    {
      id: 'g5_4',
      topic: 'Giải ngược từ cuối',
      diff: 'Khó',
      question: 'Bà mang rổ cam ra chợ bán. Lần 1 bán 1/2 số cam và thêm 1 quả. Lần 2 bán 1/2 số cam còn lại và thêm 1 quả thì vừa hết cam. Hỏi ban đầu rổ có bao nhiêu quả cam?',
      visual: {
        type: 'equation',
        left: 'Lần 1: 1/2 + 1 quả',
        op: 'Lần 2: 1/2 còn lại + 1 quả',
        right: 'Ban đầu = ?'
      },
      options: ['4 quả', '6 quả', '8 quả', '10 quả'],
      correct: '6 quả',
      hint: 'Giải ngược: Trước khi bán lần 2 thì 1 quả tương ứng với 1/2 số cam còn lại.',
      explanation: 'Giải ngược từ cuối: Sau lần 1, 1/2 số cam còn lại chính là 1 quả, nên số cam còn lại sau lần 1 là: 1 × 2 = 2 quả. Số cam ban đầu trước khi bán thêm 1 quả ở lần 1 là: 2 + 1 = 3 quả. 3 quả này chính là 1/2 số cam ban đầu, do đó ban đầu có: 3 × 2 = 6 quả cam.'
    },
    {
      id: 'g5_5',
      topic: 'Tính nhanh số thập phân',
      diff: 'Vừa',
      question: 'Tính nhanh giá trị biểu thức: A = 0,25 × 48 + 0,75 × 48',
      visual: {
        type: 'equation',
        left: '0,25 × 48',
        op: '+ 0,75 × 48 =',
        right: '?'
      },
      options: ['48', '96', '36', '4,8'],
      correct: '48',
      hint: 'Áp dụng tính chất phân phối của phép nhân với phép cộng: a × b + a × c = a × (b + c).',
      explanation: 'Ta đưa thừa số chung 48 ra ngoài: A = 48 × (0,25 + 0,75) = 48 × 1 = 48. Quá nhanh và kỳ diệu!'
    }
  ]
};

// ============================================================
// 4. CÂN THĂNG BẰNG STAGES (MAGIC BALANCE SCALES)
// ============================================================
const BALANCE_STAGES = [
  {
    level: 1,
    leftItems: [
      { type: 'fruit', symbol: '🍎', name: 'Táo' },
      { type: 'weight', label: '2kg', val: 2 }
    ],
    rightItems: [
      { type: 'weight', label: '7kg', val: 7 }
    ],
    unknownItem: '🍎 Quả Táo',
    correctWeight: 5,
    options: [3, 4, 5, 6],
    explanation: '🍎 + 2kg = 7kg  =>  🍎 = 7 - 2 = 5kg.'
  },
  {
    level: 2,
    leftItems: [
      { type: 'fruit', symbol: '🍌', name: 'Chuối' },
      { type: 'fruit', symbol: '🍌', name: 'Chuối' }
    ],
    rightItems: [
      { type: 'weight', label: '8kg', val: 8 }
    ],
    unknownItem: '1 Nải Chuối 🍌',
    correctWeight: 4,
    options: [2, 3, 4, 6],
    explanation: '2 nải chuối = 8kg  =>  1 nải chuối = 8 ÷ 2 = 4kg.'
  },
  {
    level: 3,
    leftItems: [
      { type: 'fruit', symbol: '🍉', name: 'Dưa hấu' },
      { type: 'weight', label: '3kg', val: 3 }
    ],
    rightItems: [
      { type: 'weight', label: '10kg', val: 10 }
    ],
    unknownItem: '1 Quả Dưa Hấu 🍉',
    correctWeight: 7,
    options: [5, 6, 7, 8],
    explanation: '🍉 + 3kg = 10kg  =>  🍉 = 10 - 3 = 7kg.'
  },
  {
    level: 4,
    leftItems: [
      { type: 'fruit', symbol: '🍊', name: 'Cam' },
      { type: 'fruit', symbol: '🍊', name: 'Cam' },
      { type: 'weight', label: '4kg', val: 4 }
    ],
    rightItems: [
      { type: 'weight', label: '16kg', val: 16 }
    ],
    unknownItem: '1 Quả Cam 🍊',
    correctWeight: 6,
    options: [5, 6, 7, 8],
    explanation: '2 quả cam + 4kg = 16kg => 2 quả cam = 12kg => 1 quả cam = 6kg.'
  },
  {
    level: 5,
    leftItems: [
      { type: 'fruit', symbol: '🍇', name: 'Nho' },
      { type: 'fruit', symbol: '🍇', name: 'Nho' },
      { type: 'fruit', symbol: '🍇', name: 'Nho' }
    ],
    rightItems: [
      { type: 'weight', label: '15kg', val: 15 }
    ],
    unknownItem: '1 Chùm Nho 🍇',
    correctWeight: 5,
    options: [3, 4, 5, 6],
    explanation: '3 chùm nho = 15kg => 1 chùm nho = 15 ÷ 3 = 5kg.'
  },
  {
    level: 6,
    leftItems: [
      { type: 'fruit', symbol: '🍍', name: 'Dứa' },
      { type: 'weight', label: '5kg', val: 5 }
    ],
    rightItems: [
      { type: 'fruit', symbol: '🍍', name: 'Dứa' },
      { type: 'fruit', symbol: '🍍', name: 'Dứa' },
      { type: 'weight', label: '1kg', val: 1 }
    ],
    unknownItem: '1 Quả Dứa 🍍',
    correctWeight: 4,
    options: [2, 3, 4, 5],
    explanation: 'Bớt 1 quả dứa ở cả 2 đĩa: 5kg = 1 quả dứa + 1kg  =>  1 quả dứa = 4kg.'
  }
];

// ============================================================
// 5. HUY HIỆU DANH GIÁ (BADGES DEFINITION)
// ============================================================
const ALL_BADGES = [
  { id: 'first_step', name: 'Khởi Đầu Rực Rỡ', icon: '🌱', desc: 'Hoàn thành bài toán tư duy đầu tiên.' },
  { id: 'speed_demon', name: 'Chiến Thần Tốc Độ', icon: '⚡', desc: 'Đạt chuỗi Combo x3 trong Đấu trường 60s.' },
  { id: 'balance_master', name: 'Bậc Thầy Cân Não', icon: '⚖️', desc: 'Vượt qua 3 màn Cân thăng bằng ma thuật.' },
  { id: 'memory_pro', name: 'Trí Nhớ Siêu Phàm', icon: '🃏', desc: 'Chiến thắng trò chơi lật thẻ trí nhớ.' },
  { id: 'star_collector', name: 'Thợ Săn Ngôi Sao', icon: '⭐', desc: 'Tích lũy từ 15 ngôi sao trở lên.' },
  { id: 'streak_master', name: 'Chuỗi Bất Bại', icon: '🔥', desc: 'Trả lời đúng 5 câu hỏi liên tiếp.' },
  { id: 'grade5_champion', name: 'Đại Sư Lớp 5', icon: '👑', desc: 'Chinh phục câu hỏi thử thách của Lớp 5.' },
  { id: 'pipi_friend', name: 'Bạn Thân Cú PiPi', icon: '🦉', desc: 'Đổi hình đại diện và hoàn thành hồ sơ.' }
];

// ============================================================
// 6. MAIN APPLICATION STATE
// ============================================================
class MathKidsApp {
  constructor() {
    this.user = {
      name: 'Bé Thông Thái',
      avatar: '🦉',
      grade: 1,
      stars: 0,
      xp: 0,
      streak: 0,
      maxStreak: 0,
      badges: ['first_step'],
      historyCount: 0,
      correctCount: 0
    };

    // Practice state
    this.currentGrade = 1;
    this.currentQIndex = 0;
    this.gradeQuestions = [];

    // Balance state
    this.balanceIndex = 0;
    this.balanceScore = 0;

    // Speed 60s state
    this.speedGrade = 3;
    this.speedTimer = null;
    this.speedTimeLeft = 60;
    this.speedScore = 0;
    this.speedCombo = 1;
    this.speedMaxCombo = 1;
    this.speedCorrect = 0;
    this.speedTotal = 0;
    this.speedCurrentAns = 0;

    // Memory state
    this.memoryTimer = null;
    this.memorySeconds = 0;
    this.memoryFlips = 0;
    this.memoryPairs = 0;
    this.firstCard = null;
    this.secondCard = null;
    this.isLockBoard = false;

    this.loadUserData();
  }

  init() {
    this.bindEvents();
    this.updateUserUI();
    this.initPractice(1);
    this.initBalanceGame();
    this.renderBadges();
    this.loadLeaderboard('all');
  }

  // Load and save user data to localStorage
  loadUserData() {
    try {
      const saved = localStorage.getItem('mathkids_user');
      if (saved) {
        this.user = { ...this.user, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }

  saveUserData() {
    try {
      localStorage.setItem('mathkids_user', JSON.stringify(this.user));
    } catch (e) {}
    this.updateUserUI();
  }

  updateUserUI() {
    document.getElementById('userNameLabel').textContent = this.user.name;
    document.getElementById('userAvatarIcon').textContent = this.user.avatar;
    document.getElementById('userStarsCount').textContent = this.user.stars;
    document.getElementById('userStreakCount').textContent = this.user.streak;

    // Calculate level based on XP
    let levelName = 'Cấp 1 • Mầm Non 🌱';
    if (this.user.xp >= 300) levelName = 'Cấp 5 • Đại Sư Toán Học 👑';
    else if (this.user.xp >= 180) levelName = 'Cấp 4 • Pháp Sư Tư Duy 🧙‍♂️';
    else if (this.user.xp >= 90) levelName = 'Cấp 3 • Hiệp Sĩ Tính Nhẩm ⚔️';
    else if (this.user.xp >= 30) levelName = 'Cấp 2 • Thám Tử Nhí 🔍';

    document.getElementById('userLevelBadge').textContent = levelName;
    document.getElementById('modalLevelTitle').textContent = levelName;
    document.getElementById('modalTotalXP').textContent = `${this.user.xp} XP`;
    document.getElementById('modalTotalStars').textContent = `${this.user.stars} ⭐`;
  }

  unlockBadge(badgeId) {
    if (!this.user.badges.includes(badgeId)) {
      this.user.badges.push(badgeId);
      const bObj = ALL_BADGES.find(b => b.id === badgeId);
      if (bObj) {
        this.showToast(`🎉 Mở khóa huy hiệu mới: ${bObj.icon} ${bObj.name}!`);
        confetti.fire(1500);
        sounds.playVictory();
      }
      this.saveUserData();
      this.renderBadges();
    }
  }

  showToast(msg) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        sounds.playClick();
        const tabTarget = tab.dataset.tab;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tabTarget).classList.add('active');

        if (tabTarget === 'tab-memory') {
          this.initMemoryGame();
        } else if (this.memoryTimer) {
          clearInterval(this.memoryTimer);
        }

        if (tabTarget !== 'tab-speed' && this.speedTimer) {
          clearInterval(this.speedTimer);
          document.getElementById('speedGameScreen').classList.add('hidden');
          document.getElementById('speedIntroScreen').classList.remove('hidden');
        }
      });
    });

    // Logo click goes to Tab Practice
    document.getElementById('btnGoHome').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('tabPracticeBtn').click();
    });

    // Sound toggle
    const btnSound = document.getElementById('btnSoundToggle');
    const soundIcon = document.getElementById('soundIcon');
    btnSound.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
      sounds.playClick();
      this.showToast(sounds.enabled ? 'Đã bật âm thanh vui nhộn!' : 'Đã tắt âm thanh');
    });

    // Profile modal
    const profileModal = document.getElementById('profileModal');
    document.getElementById('btnOpenProfile').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('inputPlayerName').value = this.user.name;
      document.querySelectorAll('.avatar-opt').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.avatar === this.user.avatar);
      });
      profileModal.classList.remove('hidden');
    });

    document.getElementById('btnCloseProfileModal').addEventListener('click', () => {
      sounds.playClick();
      profileModal.classList.add('hidden');
    });

    document.querySelectorAll('.avatar-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        sounds.playClick();
        document.querySelectorAll('.avatar-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });

    document.getElementById('btnSaveProfile').addEventListener('click', () => {
      sounds.playClick();
      const newName = document.getElementById('inputPlayerName').value.trim();
      const activeAvatar = document.querySelector('.avatar-opt.active');
      if (newName) this.user.name = newName;
      if (activeAvatar) this.user.avatar = activeAvatar.dataset.avatar;
      this.unlockBadge('pipi_friend');
      this.saveUserData();
      profileModal.classList.add('hidden');
      this.showToast('Đã lưu hồ sơ thành công! 🌟');
    });

    // Grade Selectors in Practice Tab
    document.querySelectorAll('.grade-card').forEach(card => {
      card.addEventListener('click', () => {
        sounds.playClick();
        document.querySelectorAll('.grade-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const grade = parseInt(card.dataset.grade, 10);
        this.initPractice(grade);
      });
    });

    // Hint button
    document.getElementById('btnHint').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('hintBox').classList.toggle('hidden');
    });

    document.getElementById('btnCloseHint').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('hintBox').classList.add('hidden');
    });

    // Next Question
    document.getElementById('btnNextQuestion').addEventListener('click', () => {
      sounds.playClick();
      this.currentQIndex++;
      if (this.currentQIndex >= this.gradeQuestions.length) {
        this.currentQIndex = 0;
        this.showToast('🎉 Chúc mừng bạn nhỏ đã hoàn thành bộ câu hỏi của khối lớp này!');
        confetti.fire(2000);
        sounds.playVictory();
      }
      this.renderCurrentQuestion();
    });

    // Balance reset stage
    document.getElementById('btnResetBalance').addEventListener('click', () => {
      sounds.playClick();
      this.balanceIndex = (this.balanceIndex + 1) % BALANCE_STAGES.length;
      this.renderBalanceStage();
    });

    // Next balance stage
    document.getElementById('btnNextBalanceStage').addEventListener('click', () => {
      sounds.playClick();
      this.balanceIndex = (this.balanceIndex + 1) % BALANCE_STAGES.length;
      this.renderBalanceStage();
    });

    // Speed 60s game controls
    document.getElementById('btnStartSpeedGame').addEventListener('click', () => {
      sounds.playClick();
      this.startSpeedGame();
    });

    document.getElementById('btnSpeedPlayAgain').addEventListener('click', () => {
      sounds.playClick();
      this.startSpeedGame();
    });

    document.getElementById('btnSpeedSaveScore').addEventListener('click', () => {
      sounds.playClick();
      this.submitScoreToLeaderboard('speed', this.speedScore);
    });

    // Memory game controls
    document.getElementById('btnRestartMemory').addEventListener('click', () => {
      sounds.playClick();
      this.initMemoryGame();
    });

    document.getElementById('btnPlayNextMemory').addEventListener('click', () => {
      sounds.playClick();
      this.initMemoryGame();
    });

    // Leaderboard filters
    document.querySelectorAll('.lb-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sounds.playClick();
        document.querySelectorAll('.lb-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadLeaderboard(btn.dataset.filter);
      });
    });
  }

  // ============================================================
  // TAB 1: PRACTICE LOGIC
  // ============================================================
  initPractice(grade = 1) {
    this.currentGrade = grade;
    this.currentQIndex = 0;
    this.gradeQuestions = [...(QUESTION_BANK[grade] || QUESTION_BANK[1])];
    this.renderCurrentQuestion();

    const mascotTexts = {
      1: '"Chào bạn nhỏ Lớp 1! Cùng đếm hình và tìm số vui nhộn nhé!" 🐣',
      2: '"Lớp 2 có nhiều bài toán logic và xem giờ rất thú vị đấy!" 🦊',
      3: '"Chào mừng đến với Lớp 3! Bảng nhân chia và hình học đang chờ bạn!" 🦁',
      4: '"Thử thách Lớp 4: Bài toán Tổng - Hiệu và Gà Chó siêu hấp dẫn!" 🚀',
      5: '"Đỉnh cao Lớp 5: Vận tốc, tỉ số phần trăm và khối lập phương!" 👑'
    };
    document.getElementById('mascotMessage').textContent = mascotTexts[grade] || mascotTexts[1];
  }

  renderCurrentQuestion() {
    const q = this.gradeQuestions[this.currentQIndex];
    if (!q) return;

    // Reset UI states
    document.getElementById('hintBox').classList.add('hidden');
    document.getElementById('feedbackBox').classList.add('hidden');

    // Tags
    document.getElementById('currentGradeTag').textContent = `Lớp ${this.currentGrade}`;
    document.getElementById('currentTopicTag').textContent = q.topic;
    document.getElementById('currentDiffTag').textContent = `Độ khó: ${q.diff}`;
    document.getElementById('questionNumText').textContent = `${this.currentQIndex + 1}/${this.gradeQuestions.length}`;
    document.getElementById('questionProgressFill').style.width = `${((this.currentQIndex + 1) / this.gradeQuestions.length) * 100}%`;

    // Title & hint
    document.getElementById('questionText').textContent = q.question;
    document.getElementById('hintTextContent').textContent = q.hint;

    // Render Visual
    const visualArea = document.getElementById('questionVisual');
    visualArea.innerHTML = '';

    if (q.visual.type === 'sequence') {
      const seqDiv = document.createElement('div');
      seqDiv.className = 'visual-sequence';
      q.visual.items.forEach((item, i) => {
        const itemBox = document.createElement('div');
        itemBox.className = `seq-item ${item === '?' ? 'missing' : ''}`;
        itemBox.textContent = item;
        seqDiv.appendChild(itemBox);
        if (i < q.visual.items.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'seq-arrow';
          arrow.textContent = '➔';
          seqDiv.appendChild(arrow);
        }
      });
      visualArea.appendChild(seqDiv);
    } else if (q.visual.type === 'equation') {
      const eqDiv = document.createElement('div');
      eqDiv.className = 'visual-equation-row';
      eqDiv.innerHTML = `
        <span class="eq-chip">${q.visual.left}</span>
        <span class="eq-op">${q.visual.op}</span>
        <span class="eq-chip ${q.visual.right.includes('?') ? 'eq-missing' : ''}">${q.visual.right}</span>
      `;
      visualArea.appendChild(eqDiv);
    } else if (q.visual.type === 'shapes') {
      visualArea.innerHTML = q.visual.content;
    }

    // Answers Grid
    const ansGrid = document.getElementById('answersGrid');
    ansGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-answer';
      btn.innerHTML = `
        <span class="ans-letter">${letters[idx]}</span>
        <span class="ans-text">${opt}</span>
      `;

      btn.addEventListener('click', () => {
        this.handlePracticeAnswer(btn, opt, q);
      });

      ansGrid.appendChild(btn);
    });
  }

  handlePracticeAnswer(selectedBtn, chosenOpt, q) {
    // Disable all options
    const allBtns = document.querySelectorAll('.btn-answer');
    allBtns.forEach(b => b.classList.add('disabled'));

    const isCorrect = (chosenOpt === q.correct);
    this.user.historyCount++;

    if (isCorrect) {
      selectedBtn.classList.add('correct');
      sounds.playCorrect();
      confetti.fire(1200);

      this.user.correctCount++;
      this.user.stars += 1;
      this.user.xp += 10;
      this.user.streak++;
      if (this.user.streak > this.user.maxStreak) this.user.maxStreak = this.user.streak;

      if (this.user.streak >= 5) this.unlockBadge('streak_master');
      if (this.user.stars >= 15) this.unlockBadge('star_collector');
      if (this.currentGrade === 5) this.unlockBadge('grade5_champion');

      // Update Feedback Box
      document.getElementById('feedbackIcon').textContent = '🎉';
      document.getElementById('feedbackTitle').textContent = 'Chính Xác Tuyệt Vời!';
      document.getElementById('feedbackDesc').textContent = '+10 XP và +1 ⭐ thưởng cho bạn nhỏ!';
    } else {
      selectedBtn.classList.add('wrong');
      sounds.playWrong();
      this.user.streak = 0;

      // Highlight the correct one
      allBtns.forEach(b => {
        if (b.querySelector('.ans-text').textContent === q.correct) {
          b.classList.add('correct');
        }
      });

      document.getElementById('feedbackIcon').textContent = '💡';
      document.getElementById('feedbackTitle').textContent = 'Chưa Đúng Rồi, Cố Lên Bé Nhé!';
      document.getElementById('feedbackDesc').textContent = 'Đừng nản lòng, hãy xem lời giải thích chi tiết bên dưới nhé!';
    }

    this.saveUserData();

    // Show Explanation
    document.getElementById('explanationText').textContent = q.explanation;
    document.getElementById('feedbackBox').classList.remove('hidden');

    // Update practice stats
    document.getElementById('practiceSolvedCount').textContent = this.user.correctCount;
    const acc = Math.round((this.user.correctCount / this.user.historyCount) * 100);
    document.getElementById('practiceAccuracy').textContent = `${acc}%`;
  }

  // ============================================================
  // TAB 2: MAGIC BALANCE SCALES LOGIC
  // ============================================================
  initBalanceGame() {
    this.balanceIndex = 0;
    this.renderBalanceStage();
  }

  renderBalanceStage() {
    const stage = BALANCE_STAGES[this.balanceIndex];
    if (!stage) return;

    document.getElementById('balanceLevelText').textContent = stage.level;
    document.getElementById('balanceScoreText').textContent = this.balanceScore;
    document.getElementById('balanceQuestionPrompt').textContent = `1 ${stage.unknownItem} nặng bao nhiêu kg?`;
    document.getElementById('balanceFeedback').classList.add('hidden');

    // Reset tilt angle to tilted (left or right heavier)
    document.documentElement.style.setProperty('--tilt-angle', '-12deg');
    document.getElementById('scaleIndicatorText').textContent = '⚖️ Cân chưa thăng bằng!';

    // Render left pan items
    const panLeft = document.getElementById('panLeftItems');
    panLeft.innerHTML = '';
    stage.leftItems.forEach(item => {
      const el = document.createElement('div');
      if (item.type === 'fruit') {
        el.className = 'item-fruit';
        el.textContent = item.symbol;
      } else {
        el.className = 'item-weight';
        el.textContent = item.label;
      }
      panLeft.appendChild(el);
    });

    // Render right pan items
    const panRight = document.getElementById('panRightItems');
    panRight.innerHTML = '';
    stage.rightItems.forEach(item => {
      const el = document.createElement('div');
      if (item.type === 'fruit') {
        el.className = 'item-fruit';
        el.textContent = item.symbol;
      } else {
        el.className = 'item-weight';
        el.textContent = item.label;
      }
      panRight.appendChild(el);
    });

    // Render options
    const optGrid = document.getElementById('balanceOptionsGrid');
    optGrid.innerHTML = '';
    stage.options.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'btn-balance-opt';
      btn.textContent = `${val} kg`;
      btn.addEventListener('click', () => {
        this.handleBalanceOption(val, stage, btn);
      });
      optGrid.appendChild(btn);
    });
  }

  handleBalanceOption(chosenVal, stage, btn) {
    if (chosenVal === stage.correctWeight) {
      sounds.playCorrect();
      confetti.fire(1500);

      // Thăng bằng hoàn hảo!
      document.documentElement.style.setProperty('--tilt-angle', '0deg');
      document.getElementById('scaleIndicatorText').textContent = '🌟 CHÍNH XÁC! CÂN ĐÃ THĂNG BẰNG HOÀN HẢO!';

      this.balanceScore += 10;
      this.user.stars += 2;
      this.user.xp += 15;
      this.saveUserData();

      if (stage.level >= 3) this.unlockBadge('balance_master');

      const fb = document.getElementById('balanceFeedback');
      fb.classList.remove('hidden');
      document.getElementById('balanceFeedbackMsg').innerHTML = `
        <strong style="color: #4ade80;">🎉 Quá xuất sắc!</strong><br>
        <span>${stage.explanation}</span>
      `;
    } else {
      sounds.playWrong();
      // Tilt more
      const tilt = chosenVal < stage.correctWeight ? '-16deg' : '16deg';
      document.documentElement.style.setProperty('--tilt-angle', tilt);
      this.showToast('Chưa thăng bằng rồi! Thử lại con số khác xem nhé! ⚖️');
    }
  }

  // ============================================================
  // TAB 3: SPEED ARENA 60s
  // ============================================================
  startSpeedGame() {
    this.speedGrade = parseInt(document.getElementById('speedGradeSelect').value, 10);
    this.speedTimeLeft = 60;
    this.speedScore = 0;
    this.speedCombo = 1;
    this.speedMaxCombo = 1;
    this.speedCorrect = 0;
    this.speedTotal = 0;

    document.getElementById('speedIntroScreen').classList.add('hidden');
    document.getElementById('speedGameOverScreen').classList.add('hidden');
    document.getElementById('speedGameScreen').classList.remove('hidden');

    this.updateSpeedHUD();
    this.nextSpeedQuestion();

    if (this.speedTimer) clearInterval(this.speedTimer);
    this.speedTimer = setInterval(() => {
      this.speedTimeLeft--;
      this.updateSpeedHUD();
      if (this.speedTimeLeft <= 5 && this.speedTimeLeft > 0) {
        sounds.playTick();
      }
      if (this.speedTimeLeft <= 0) {
        this.endSpeedGame();
      }
    }, 1000);
  }

  updateSpeedHUD() {
    document.getElementById('speedTimerVal').textContent = `${this.speedTimeLeft}s`;
    document.getElementById('speedCurrentScore').textContent = this.speedScore;
    document.getElementById('speedComboVal').textContent = `x${this.speedCombo}`;

    const percent = (this.speedTimeLeft / 60) * 100;
    document.getElementById('speedTimeBar').style.width = `${percent}%`;

    const comboPill = document.getElementById('speedComboPill');
    comboPill.classList.toggle('combo-active', this.speedCombo > 1);
  }

  nextSpeedQuestion() {
    let expr = '';
    let correct = 0;
    const g = this.speedGrade;

    if (g === 1) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      const isAdd = Math.random() > 0.4;
      if (isAdd) {
        expr = `${a} + ${b} = ?`;
        correct = a + b;
      } else {
        const big = Math.max(a, b);
        const sm = Math.min(a, b);
        expr = `${big} - ${sm} = ?`;
        correct = big - sm;
      }
    } else if (g === 2) {
      if (Math.random() > 0.5) {
        const a = [2, 5][Math.floor(Math.random() * 2)];
        const b = Math.floor(Math.random() * 9) + 1;
        expr = `${a} × ${b} = ?`;
        correct = a * b;
      } else {
        const a = Math.floor(Math.random() * 40) + 10;
        const b = Math.floor(Math.random() * 30) + 10;
        expr = `${a} + ${b} = ?`;
        correct = a + b;
      }
    } else if (g === 3) {
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      expr = `${a} × ${b} = ?`;
      correct = a * b;
    } else if (g === 4) {
      const a = Math.floor(Math.random() * 80) + 20;
      const b = Math.floor(Math.random() * 40) + 10;
      const op = Math.random() > 0.5 ? '+' : '-';
      expr = `${a} ${op} ${b} = ?`;
      correct = op === '+' ? a + b : a - b;
    } else {
      // Grade 5: Decimals & Quick multiplication
      const a = (Math.floor(Math.random() * 40) + 10) / 10;
      const b = (Math.floor(Math.random() * 40) + 10) / 10;
      expr = `${a.toFixed(1)} + ${b.toFixed(1)} = ?`;
      correct = parseFloat((a + b).toFixed(1));
    }

    this.speedCurrentAns = correct;
    document.getElementById('speedExpression').textContent = expr;

    // Generate 4 options
    const options = new Set([correct]);
    while (options.size < 4) {
      let offset = (Math.floor(Math.random() * 7) - 3);
      if (offset === 0) offset = 2;
      let wrong = typeof correct === 'number' && Number.isInteger(correct) 
        ? Math.max(1, correct + offset)
        : parseFloat((correct + offset * 0.1).toFixed(1));
      options.add(wrong);
    }

    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
    const ansGrid = document.getElementById('speedAnswersGrid');
    ansGrid.innerHTML = '';

    shuffled.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'btn-speed-ans';
      btn.textContent = val;
      btn.addEventListener('click', () => {
        this.handleSpeedAnswer(val, correct);
      });
      ansGrid.appendChild(btn);
    });
  }

  handleSpeedAnswer(chosen, correct) {
    this.speedTotal++;
    if (chosen === correct) {
      sounds.playClick();
      this.speedCorrect++;
      this.speedScore += (10 * this.speedCombo);
      this.speedCombo = Math.min(5, this.speedCombo + 1);
      if (this.speedCombo > this.speedMaxCombo) {
        this.speedMaxCombo = this.speedCombo;
      }
      if (this.speedCombo >= 3) {
        this.unlockBadge('speed_demon');
      }
    } else {
      sounds.playWrong();
      this.speedCombo = 1;
    }
    this.updateSpeedHUD();
    this.nextSpeedQuestion();
  }

  endSpeedGame() {
    clearInterval(this.speedTimer);
    sounds.playVictory();
    confetti.fire(2500);

    document.getElementById('speedGameScreen').classList.add('hidden');
    document.getElementById('speedGameOverScreen').classList.remove('hidden');

    const accuracy = this.speedTotal > 0 ? Math.round((this.speedCorrect / this.speedTotal) * 100) : 0;

    document.getElementById('speedStatCorrect').textContent = this.speedCorrect;
    document.getElementById('speedStatMaxCombo').textContent = `x${this.speedMaxCombo}`;
    document.getElementById('speedStatTotalScore').textContent = this.speedScore;
    document.getElementById('speedStatAccuracy').textContent = `${accuracy}%`;

    // Save reward
    this.user.stars += Math.floor(this.speedScore / 30);
    this.user.xp += this.speedScore;
    this.saveUserData();

    // Auto submit to leaderboard
    this.submitScoreToLeaderboard('speed', this.speedScore);
  }

  // ============================================================
  // TAB 4: MEMORY MATCH CARDS
  // ============================================================
  initMemoryGame() {
    if (this.memoryTimer) clearInterval(this.memoryTimer);
    this.memorySeconds = 0;
    this.memoryFlips = 0;
    this.memoryPairs = 0;
    this.firstCard = null;
    this.secondCard = null;
    this.isLockBoard = false;

    document.getElementById('memoryTimerText').textContent = '00:00';
    document.getElementById('memoryFlipsText').textContent = '0';
    document.getElementById('memoryPairsText').textContent = '0 / 6';
    document.getElementById('memoryWinBanner').classList.add('hidden');

    this.memoryTimer = setInterval(() => {
      this.memorySeconds++;
      const m = String(Math.floor(this.memorySeconds / 60)).padStart(2, '0');
      const s = String(this.memorySeconds % 60).padStart(2, '0');
      document.getElementById('memoryTimerText').textContent = `${m}:${s}`;
    }, 1000);

    // 6 Pairs of Math expressions and answers
    const cardPairs = [
      { id: 1, text: '6 × 7', matchId: 1 },
      { id: 2, text: '42', matchId: 1 },
      { id: 3, text: '15 + 18', matchId: 2 },
      { id: 4, text: '33', matchId: 2 },
      { id: 5, text: '50 - 15', matchId: 3 },
      { id: 6, text: '35', matchId: 3 },
      { id: 7, text: '9 × 4', matchId: 4 },
      { id: 8, text: '36', matchId: 4 },
      { id: 9, text: '72 ÷ 8', matchId: 5 },
      { id: 10, text: '9', matchId: 5 },
      { id: 11, text: '25 + 25', matchId: 6 },
      { id: 12, text: '50', matchId: 6 }
    ];

    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    shuffled.forEach(item => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.matchId = item.matchId;

      card.innerHTML = `
        <div class="card-face card-back">❓</div>
        <div class="card-face card-front">${item.text}</div>
      `;

      card.addEventListener('click', () => {
        this.flipMemoryCard(card);
      });

      grid.appendChild(card);
    });
  }

  flipMemoryCard(card) {
    if (this.isLockBoard || card === this.firstCard || card.classList.contains('matched')) return;

    sounds.playClick();
    card.classList.add('flipped');
    this.memoryFlips++;
    document.getElementById('memoryFlipsText').textContent = this.memoryFlips;

    if (!this.firstCard) {
      this.firstCard = card;
      return;
    }

    this.secondCard = card;
    this.checkForCardMatch();
  }

  checkForCardMatch() {
    const isMatch = this.firstCard.dataset.matchId === this.secondCard.dataset.matchId;
    if (isMatch) {
      sounds.playCorrect();
      this.firstCard.classList.add('matched');
      this.secondCard.classList.add('matched');
      this.memoryPairs++;
      document.getElementById('memoryPairsText').textContent = `${this.memoryPairs} / 6`;
      this.resetCardSelection();

      if (this.memoryPairs === 6) {
        this.handleMemoryWin();
      }
    } else {
      this.isLockBoard = true;
      sounds.playWrong();
      setTimeout(() => {
        this.firstCard.classList.remove('flipped');
        this.secondCard.classList.remove('flipped');
        this.resetCardSelection();
      }, 900);
    }
  }

  resetCardSelection() {
    this.firstCard = null;
    this.secondCard = null;
    this.isLockBoard = false;
  }

  handleMemoryWin() {
    clearInterval(this.memoryTimer);
    sounds.playVictory();
    confetti.fire(2500);

    this.unlockBadge('memory_pro');
    this.user.stars += 3;
    this.user.xp += 25;
    this.saveUserData();

    const banner = document.getElementById('memoryWinBanner');
    document.getElementById('memoryWinDesc').textContent = 
      `Bé đã ghép xong 6 cặp thẻ trong ${this.memorySeconds} giây với ${this.memoryFlips} lượt lật!`;
    banner.classList.remove('hidden');
  }

  // ============================================================
  // TAB 5: LEADERBOARD & BADGES
  // ============================================================
  renderBadges() {
    const grid = document.getElementById('badgesGrid');
    grid.innerHTML = '';

    let unlockedCount = 0;
    ALL_BADGES.forEach(badge => {
      const isUnlocked = this.user.badges.includes(badge.id);
      if (isUnlocked) unlockedCount++;

      const item = document.createElement('div');
      item.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      item.innerHTML = `
        <div class="badge-icon-box">${badge.icon}</div>
        <div class="badge-details">
          <h5>${badge.name}</h5>
          <p>${badge.desc}</p>
        </div>
      `;
      grid.appendChild(item);
    });

    document.getElementById('unlockedBadgesCount').textContent = `${unlockedCount}/${ALL_BADGES.length} đã mở`;
  }

  async loadLeaderboard(mode = 'all') {
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Đang kết nối PostgreSQL...</p>
      </div>
    `;

    try {
      const url = mode === 'all' ? '/api/math/leaderboard' : `/api/math/leaderboard?mode=${mode}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      document.getElementById('leaderboardStatusTag').textContent = '🟢 PostgreSQL Live';
      listEl.innerHTML = '';

      if (data.length === 0) {
        listEl.innerHTML = '<div class="empty-state">Chưa có ai lưu điểm! Bạn hãy là người đầu tiên nhé!</div>';
        return;
      }

      data.forEach((p, index) => {
        const row = document.createElement('div');
        const rankClass = index === 0 ? 'top-1' : (index === 1 ? 'top-2' : (index === 2 ? 'top-3' : ''));
        row.className = `lb-row ${rankClass}`;

        const rankIcon = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `#${index + 1}`));
        const safeName = escapeHtml(p.player_name);
        const safeAvatar = escapeHtml(p.avatar || '🦉');
        const safeMode = escapeHtml(p.mode);

        row.innerHTML = `
          <div class="lb-player">
            <span class="lb-rank">${rankIcon}</span>
            <span class="lb-avatar">${safeAvatar}</span>
            <div>
              <div class="lb-name">${safeName}</div>
              <div class="lb-meta">Lớp ${parseInt(p.grade) || 1} • Chế độ: ${safeMode}</div>
            </div>
          </div>
          <div class="lb-score-box">
            <div class="lb-score-val">${parseInt(p.score) || 0} điểm</div>
            <div class="lb-stars-val">${parseInt(p.stars) || 0} ⭐</div>
          </div>
        `;
        listEl.appendChild(row);
      });
    } catch (e) {
      console.warn('Lỗi tải leaderboard online, hiển thị dữ liệu cục bộ:', e.message);
      document.getElementById('leaderboardStatusTag').textContent = '🟡 Chế độ Offline';
      // Local fallback
      const safeUserName = escapeHtml(this.user.name);
      const safeUserAvatar = escapeHtml(this.user.avatar);
      listEl.innerHTML = `
        <div class="lb-row top-1">
          <div class="lb-player">
            <span class="lb-rank">🥇</span>
            <span class="lb-avatar">${safeUserAvatar}</span>
            <div>
              <div class="lb-name">${safeUserName} (Bạn)</div>
              <div class="lb-meta">Lớp ${this.user.grade} • Thành tích hiện tại</div>
            </div>
          </div>
          <div class="lb-score-box">
            <div class="lb-score-val">${this.user.xp} điểm</div>
            <div class="lb-stars-val">${this.user.stars} ⭐</div>
          </div>
        </div>
      `;
    }
  }

  async submitScoreToLeaderboard(mode, score) {
    if (score <= 0) return;
    try {
      const payload = {
        player_name: this.user.name,
        grade: this.currentGrade,
        score: score,
        stars: this.user.stars,
        mode: mode,
        avatar: this.user.avatar
      };

      const res = await fetch('/api/math/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.showToast('🌟 Đã lưu thành tích lên Bảng Vinh Danh!');
        this.loadLeaderboard('all');
      }
    } catch (e) {
      console.warn('Lỗi lưu điểm online:', e);
    }
  }
}

// Chạy ứng dụng khi DOM tải xong
document.addEventListener('DOMContentLoaded', () => {
  window.mathKidsApp = new MathKidsApp();
  window.mathKidsApp.init();
});
