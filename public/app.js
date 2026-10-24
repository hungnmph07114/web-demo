/**
 * MATHKIDS.VN - ĐẤU TRƯỜNG TOÁN TƯ DUY TIỂU HỌC
 * Main Orchestrator & Game State Manager
 * (Uses modules: SoundEffects, ConfettiCannon, QUESTION_BANK, BALANCE_STAGES, ALL_BADGES, ApiService, escapeHtml)
 */

// Khoi tao cac dich vu cot loi
const sounds = new SoundEffects();
const confetti = new ConfettiCannon('confettiCanvas');
const api = new ApiService();

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

  // Luu va doc ho so nguoi choi tu LocalStorage
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

    // Tinh danh hieu cap do theo diem kinh nghiem XP
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
      tab.addEventListener('click', () => {
        sounds.playClick();
        const tabTarget = tab.dataset.tab;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tabTarget).classList.add('active');

        // Quan ly timer khi doi tab tranh ro ri bo nho
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

    // Logo tro ve tab dau tien
    document.getElementById('btnGoHome').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('tabPracticeBtn').click();
    });

    // Bat / Tat am thanh
    const btnSound = document.getElementById('btnSoundToggle');
    const soundIcon = document.getElementById('soundIcon');
    btnSound.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
      sounds.playClick();
      this.showToast(sounds.enabled ? 'Đã bật âm thanh vui nhộn!' : 'Đã tắt âm thanh');
    });

    // Modal Ho So
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

    // Chon lop hoc (Grade)
    document.querySelectorAll('.grade-card').forEach(card => {
      card.addEventListener('click', () => {
        sounds.playClick();
        document.querySelectorAll('.grade-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const grade = parseInt(card.dataset.grade, 10);
        this.initPractice(grade);
      });
    });

    // Goi y
    document.getElementById('btnHint').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('hintBox').classList.toggle('hidden');
    });

    document.getElementById('btnCloseHint').addEventListener('click', () => {
      sounds.playClick();
      document.getElementById('hintBox').classList.add('hidden');
    });

    // Cau tiep theo
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

    // Can thang bang
    document.getElementById('btnResetBalance').addEventListener('click', () => {
      sounds.playClick();
      this.balanceIndex = (this.balanceIndex + 1) % BALANCE_STAGES.length;
      this.renderBalanceStage();
    });

    document.getElementById('btnNextBalanceStage').addEventListener('click', () => {
      sounds.playClick();
      this.balanceIndex = (this.balanceIndex + 1) % BALANCE_STAGES.length;
      this.renderBalanceStage();
    });

    // Dau truong 60s
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

    // Lat the tri nho
    document.getElementById('btnRestartMemory').addEventListener('click', () => {
      sounds.playClick();
      this.initMemoryGame();
    });

    document.getElementById('btnPlayNextMemory').addEventListener('click', () => {
      sounds.playClick();
      this.initMemoryGame();
    });

    // Bo loc bang xep hang
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

      document.getElementById('feedbackIcon').textContent = '🎉';
      document.getElementById('feedbackTitle').textContent = 'Chính Xác Tuyệt Vời!';
      document.getElementById('feedbackDesc').textContent = '+10 XP và +1 ⭐ thưởng cho bạn nhỏ!';
    } else {
      selectedBtn.classList.add('wrong');
      sounds.playWrong();
      this.user.streak = 0;

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

    document.getElementById('explanationText').textContent = q.explanation;
    document.getElementById('feedbackBox').classList.remove('hidden');

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

    document.documentElement.style.setProperty('--tilt-angle', '-12deg');
    document.getElementById('scaleIndicatorText').textContent = '⚖️ Cân chưa thăng bằng!';

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
      const a = (Math.floor(Math.random() * 40) + 10) / 10;
      const b = (Math.floor(Math.random() * 40) + 10) / 10;
      expr = `${a.toFixed(1)} + ${b.toFixed(1)} = ?`;
      correct = parseFloat((a + b).toFixed(1));
    }

    this.speedCurrentAns = correct;
    document.getElementById('speedExpression').textContent = expr;

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

    this.user.stars += Math.floor(this.speedScore / 30);
    this.user.xp += this.speedScore;
    this.saveUserData();

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
      document.getElementById('memoryTimerText').textContent = formatTime(this.memorySeconds);
    }, 1000);

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

    const shuffled = shuffleArray(cardPairs);
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
      const data = await api.getLeaderboard(mode);

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
              <div class="lb-meta">Lớp ${parseInt(p.grade, 10) || 1} • Chế độ: ${safeMode}</div>
            </div>
          </div>
          <div class="lb-score-box">
            <div class="lb-score-val">${parseInt(p.score, 10) || 0} điểm</div>
            <div class="lb-stars-val">${parseInt(p.stars, 10) || 0} ⭐</div>
          </div>
        `;
        listEl.appendChild(row);
      });
    } catch (e) {
      console.warn('Lỗi tải leaderboard online, hiển thị dữ liệu cục bộ:', e.message);
      document.getElementById('leaderboardStatusTag').textContent = '🟡 Chế độ Offline';
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

      await api.submitScore(payload);
      this.showToast('🌟 Đã lưu thành tích lên Bảng Vinh Danh!');
      this.loadLeaderboard('all');
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
