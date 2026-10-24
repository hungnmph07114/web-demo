/**
 * Balance Scale Stages Data
 */
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BALANCE_STAGES;
}
