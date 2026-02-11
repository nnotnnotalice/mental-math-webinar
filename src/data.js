export const GRADES = {
  "1-2": { label: "1 – 2 классы" },
  "3-4": { label: "3 – 4 классы" }
};

export const TOOLS = [
  { key: "wrench", label: "Ключ", icon: "🔧" },
  { key: "hammer", label: "Молоток", icon: "🔨" },  
  { key: "magnet", label: "Магнит", icon: "🧲" },
  { key: "scales", label: "Весы", icon: "⚖️" },
  { key: "chooser", label: "Спаси мастерскую", icon: "💧" }
];

export const WRENCH_TASKS = {
  "1-2": [
    {
      id: "a",
      title: null,
      initial: [8, 5, 2],
      movable: 2,
      // допустимые расстановки (после перетаскивания)
      accepted: [
        [8, 2, 5],
        [2, 8, 5]
      ],
      answer: 15
    },
    {
      id: "b",
      title: null,
      initial: [7, 2, 3],
      movable: 3,
      accepted: [
        [7, 3, 2],
        [3, 7, 2]
      ],
      answer: 12
    }
  ],
  "3-4": [
    {
      id: "a",
      title: null,
      initial: [36, 7, 4],
      movable: 4,
      accepted: [
        [36, 4, 7],
        [4, 36, 7]
      ],
      answer: 47
    },
    {
      id: "b",
      title: null,
      initial: [2, 11, 58],
      movable: 58,
      accepted: [
        [2, 58, 11],
        [58, 2, 11]
      ],
      answer: 71
    }
  ]
};
export const HAMMER_TASKS = {
  "1-2": [
    {
      id: "hammer-12-1",
      original: [18, "+", 7],
      clickable: 7,
      options: [
        [2, 5], // ✅
        [4, 3],
        [1, 6],
      ],
      correct: [2, 5],
      expanded: [18, "+", 2, "+", 5],
      answer: 25,
    },
    {
      id: "hammer-12-2",
      original: [21, "–", 6],
      clickable: 6,
      options: [
        [2, 4],
        [3, 3],
        [1, 5], // ✅
      ],
      correct: [1, 5],
      expanded: [21, "–", 1, "–", 5],
      answer: 15,
    },
  ],

  "3-4": [
    {
      id: "hammer-34-1",
      original: [143, "+", 8],
      clickable: 8,
      options: [
        [7, 1], // ✅ (143+7=150)
        [3, 5],
        [2, 6],
      ],
      correct: [7, 1],
      expanded: [143, "+", 7, "+", 1],
      answer: 151,
    },
    {
      id: "hammer-34-2",
      original: [245, "–", 7],
      clickable: 7,
      options: [
        [5, 2], // ✅ (245-5=240)
        [3, 4],
        [1, 6],
      ],
      correct: [5, 2],
      expanded: [245, "–", 5, "–", 2],
      answer: 238,
    },
  ],
};