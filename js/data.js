/**
 * GamiWord AI - システム英単語 Ch.1 データベース
 */

// 「システム英単語 チャプター1」より抜粋された15単語の基礎DB
// （choicesが未定義のものは、アプリ起動時に疑似AI生成ロジックにより動的生成され永続化されます）
const SYSTEM_WORDS_PRESET = [
    { 
        id: 'sys_1', 
        english: 'follow', 
        phonetic: '/ˈfɑːloʊ/', 
        japanese: '～の後に続く、従う', 
        hint: 'follow her advice（彼女の助言に従う）',
        example: 'Follow the instructions carefully on the sheet.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0,
        choices: [
            { text: '～の後に続く、従う', isCorrect: true },
            { text: '～を矢のように放つ', isCorrect: false, type: 'spelling' }, // arrowからのひっかけ
            { text: '～を不必要に繰り返す', isCorrect: false, type: 'nuance' },
            { text: '～を不当に非難する', isCorrect: false, type: 'distractor' }
        ]
    },
    { 
        id: 'sys_2', 
        english: 'consider', 
        phonetic: '/kənˈsɪdər/', 
        hint: 'consider the problem seriously',
        japanese: '～を考慮する、考える', 
        example: 'We should consider all available options before deciding.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0,
        choices: [
            { text: '～を考慮する、考える', isCorrect: true },
            { text: '～を思いやる、親切にする', isCorrect: false, type: 'spelling' }, // considerateからの連想
            { text: '～について何となく思い浮かべる', isCorrect: false, type: 'nuance' },
            { text: '～の価値を低く見積もる', isCorrect: false, type: 'distractor' }
        ]
    },
    { 
        id: 'sys_3', 
        english: 'increase', 
        phonetic: '/ɪnˈkriːs/', 
        hint: 'increase by 20%',
        japanese: '増える、～を増やす', 
        example: 'The number of tourists continues to increase.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0,
        choices: [
            { text: '増える、～を増やす', isCorrect: true },
            { text: '～に墨を塗る', isCorrect: false, type: 'spelling' }, // inkからのひっかけ
            { text: '～を急速に２倍にする', isCorrect: false, type: 'nuance' },
            { text: '～を段階的に縮小させる', isCorrect: false, type: 'distractor' }
        ]
    },
    { 
        id: 'sys_4', 
        english: 'expect', 
        phonetic: '/ɪkˈspekt/', 
        hint: 'expect you to arrive soon',
        japanese: '～を予期する、期待する', 
        example: 'I expect that they will arrive here by noon.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
        // choicesが未定義のため、起動時にAI自動生成されます
    },
    { 
        id: 'sys_5', 
        english: 'decide', 
        phonetic: '/dɪˈsaɪd/', 
        hint: 'decide to tell the truth',
        japanese: '～を決定する、決意する', 
        example: 'She decided to accept the job offer.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
        // choicesが未定義のため、起動時にAI自動生成されます
    },
    { 
        id: 'sys_6', 
        english: 'develop', 
        phonetic: '/dɪˈveləp/', 
        hint: 'develop a unique ability',
        japanese: '～を発達させる、開発する', 
        example: 'The company is trying to develop new materials.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_7', 
        english: 'provide', 
        phonetic: '/prəˈvaɪd/', 
        hint: 'provide him with information',
        japanese: '～を供給する、与える', 
        example: 'The server provides users with secure connections.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_8', 
        english: 'continue', 
        phonetic: '/kənˈtɪnjuː/', 
        hint: 'continue to grow fast',
        japanese: '続く、～を続ける', 
        example: 'We must continue our efforts to succeed.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_9', 
        english: 'include', 
        phonetic: '/ɪnˈkluːd/', 
        hint: 'The list includes his name.',
        japanese: '～を含む、含める', 
        example: 'Does the total price include delivery fee?', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_10', 
        english: 'remain', 
        phonetic: '/rɪˈmeɪn/', 
        hint: 'remain silent',
        japanese: '～のままでいる、残る', 
        example: 'He remained silent throughout the meeting.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_11', 
        english: 'reach', 
        phonetic: '/riːtʃ/', 
        hint: 'reach the mountain top',
        japanese: '～に到着する、達する', 
        example: 'The temperature is expected to reach 35 degrees.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_12', 
        english: 'allow', 
        phonetic: '/əˈlaʊ/', 
        hint: 'allow him to go out',
        japanese: '～を許可する、許す', 
        example: 'My parents do not allow me to stay out late.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_13', 
        english: 'force', 
        phonetic: '/fɔːrs/', 
        hint: 'be forced to work',
        japanese: '～を強制する', 
        example: 'They were forced to leave their homes due to the flood.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_14', 
        english: 'offer', 
        phonetic: '/ˈɔːfər/', 
        hint: 'offer help to the poor',
        japanese: '～を申し出る、提供する', 
        example: 'The company offered him a promotion.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    },
    { 
        id: 'sys_15', 
        english: 'realize', 
        phonetic: '/ˈriːəlaɪz/', 
        hint: 'realize the error',
        japanese: '～を悟る、実現する', 
        example: 'He finally realized his lifelong dream of writing a novel.', 
        correctCount: 0, 
        incorrectCount: 0, 
        lastReviewed: null, 
        srsLevel: 0
    }
];

// 初期フォルダ設定
const DEFAULT_FOLDERS = [
    {
        id: 'folder_preset_ch1',
        name: 'システム英単語 Ch.1 🔒',
        isPreset: true,
        wordIds: ['sys_1', 'sys_2', 'sys_3', 'sys_4', 'sys_5', 'sys_6', 'sys_7', 'sys_8', 'sys_9', 'sys_10', 'sys_11', 'sys_12', 'sys_13', 'sys_14', 'sys_15']
    }
];
