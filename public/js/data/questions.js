/**
 * Math Thinking Questions Bank (Grades 1 to 5)
 */
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTION_BANK;
}
