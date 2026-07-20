/**
 * GamiWord - 初期英単語データベースおよびゲーム定数
 */

// 初期の英単語リスト
const INITIAL_WORDS = [
    { 
        id: 1, 
        english: 'mitigate', 
        phonetic: '/ˈmɪtɪɡeɪt/', 
        japanese: '緩和する、和らげる', 
        example: 'We must mitigate potential security risks immediately.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null, // timestamp
        srsLevel: 0 // 0: 未学習, 1~: 定着度段階
    },
    { 
        id: 2, 
        english: 'acquire', 
        phonetic: '/əˈkwaɪər/', 
        japanese: '取得する、習得する', 
        example: 'It takes time to acquire a native accent.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 3, 
        english: 'diligent', 
        phonetic: '/ˈdɪlɪdʒənt/', 
        japanese: '勤勉な、入念な', 
        example: 'Through diligent study, he cleared the exam.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 4, 
        english: 'adversity', 
        phonetic: '/ədˈvɜːrsəti/', 
        japanese: '逆境、不運', 
        example: 'She showed great resilience in the face of adversity.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 5, 
        english: 'subtle', 
        phonetic: '/ˈsʌtl/', 
        japanese: '微妙な、捕らえがたい', 
        example: 'There are subtle hints of vanilla in this coffee.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 6, 
        english: 'advocate', 
        phonetic: '/ˈædvəkeɪt/', 
        japanese: '主張する、支持する', 
        example: 'They advocate for environmental protection policies.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 7, 
        english: 'cohesive', 
        phonetic: '/koʊˈhiːsɪv/', 
        japanese: '結束した、粘着性のある', 
        example: 'A cohesive design makes the application clean.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 8, 
        english: 'prevalent', 
        phonetic: '/ˈprevələnt/', 
        japanese: '普及している、一般的な', 
        example: 'Online classes are prevalent in contemporary education.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 9, 
        english: 'scrutinize', 
        phonetic: '/ˈskruːtənaɪz/', 
        japanese: '精査する、詳細に調べる', 
        example: 'Engineers scrutinize the code before release.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    },
    { 
        id: 10, 
        english: 'resilient', 
        phonetic: '/rɪˈzɪliənt/', 
        japanese: '回復力がある、弾力的な', 
        example: 'She is resilient enough to bounce back from failure.',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        srsLevel: 0
    }
];

// ペットの進化段階テーブル
const PET_STAGES = [
    { minLevel: 1, maxLevel: 2, avatar: '🥚', name: 'タマゴ', messages: ["トントン...中から音がするピ", "動かすと少し揺れるピ！"] },
    { minLevel: 3, maxLevel: 5, avatar: '🐣', name: 'ひよこ（殻つき）', messages: ["パカッ！生まれたピ！", "もっと単語を食べたいピ！", "おやつはいつも大歓迎だピ！"] },
    { minLevel: 6, maxLevel: 9, avatar: '🐥', name: 'ひよこ', messages: ["羽がフサフサしてきたピ！", "頑張る主人が大好きだピ！", "たくさん正解しておやつをくれピ！"] },
    { minLevel: 10, maxLevel: 999, avatar: '🐉', name: 'ミニドラゴン', messages: ["ウオオオン！強くなったピ！", "完全にマスターしたピ！", "もう教えることは何もないピ！"] }
];
