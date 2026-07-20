/**
 * GamiWord Pro - システム英単語 Ch.1 データベース
 * 派生語（derivatives）を内包したオブジェクト構造
 */

const SYSTEM_WORDS_PRESET = [
    { 
        id: 'sys_1', 
        english: 'follow', 
        phonetic: '/ˈfɑːloʊ/', 
        japanese: '～の後に続く、従う', 
        hint: 'follow her advice（助言に従う）', 
        example: 'Follow the instructions carefully.',
        derivatives: [
            { english: 'following', partOfSpeech: '形', japanese: '次の、以下のような' }
        ]
    },
    { 
        id: 'sys_2', 
        english: 'consider', 
        phonetic: '/kənˈsɪdər/', 
        japanese: '～を考慮する、考える', 
        hint: 'consider the problem seriously（問題を考える）', 
        example: 'We should consider all options.',
        derivatives: [
            { english: 'consideration', partOfSpeech: '名', japanese: '考慮、思いやり' },
            { english: 'considerate', partOfSpeech: '形', japanese: '思いやりのある' }
        ]
    },
    { 
        id: 'sys_3', 
        english: 'increase', 
        phonetic: '/ɪnˈkriːs/', 
        japanese: '増える、～を増やす', 
        hint: 'increase by 20%（20%増加する）', 
        example: 'The population continues to increase.',
        derivatives: [
            { english: 'increasingly', partOfSpeech: '副', japanese: 'ますます' }
        ]
    },
    { 
        id: 'sys_4', 
        english: 'expect', 
        phonetic: '/ɪkˈspekt/', 
        japanese: '～を予期する、期待する', 
        hint: 'expect you to arrive soon（到着を予期する）', 
        example: 'I expect that they will arrive shortly.',
        derivatives: [
            { english: 'expectation', partOfSpeech: '名', japanese: '予期、期待' }
        ]
    },
    { 
        id: 'sys_5', 
        english: 'decide', 
        phonetic: '/dɪˈsaɪd/', 
        japanese: '～することを決定する、判断する', 
        hint: 'decide to tell the truth（真実を語る決意をする）', 
        example: 'She decided to study medicine.',
        derivatives: [
            { english: 'decision', partOfSpeech: '名', japanese: '決意、決定' },
            { english: 'decisive', partOfSpeech: '形', japanese: '決定的な、断固とした' }
        ]
    },
    { 
        id: 'sys_6', 
        english: 'develop', 
        phonetic: '/dɪˈveləp/', 
        japanese: '～を発達させる、開発する', 
        hint: 'develop a unique ability（特殊な能力を発達させる）', 
        example: 'They are trying to develop new materials.',
        derivatives: [
            { english: 'development', partOfSpeech: '名', japanese: '発達、成長、開発' }
        ]
    },
    { 
        id: 'sys_7', 
        english: 'provide', 
        phonetic: '/prəˈvaɪd/', 
        japanese: '～を供給する、与える', 
        hint: 'provide him with information（情報を与える）', 
        example: 'The course provides basic skills.',
        derivatives: [
            { english: 'provision', partOfSpeech: '名', japanese: '供給、用意' }
        ]
    },
    { 
        id: 'sys_8', 
        english: 'continue', 
        phonetic: '/kənˈtɪnjuː/', 
        japanese: '続く、～を続ける', 
        hint: 'continue to grow fast（急速に成長し続ける）', 
        example: 'He continued working despite the noise.',
        derivatives: [
            { english: 'continuous', partOfSpeech: '形', japanese: '絶え間ない、休みない' }
        ]
    },
    { 
        id: 'sys_9', 
        english: 'include', 
        phonetic: '/ɪnˈkluːd/', 
        japanese: '～を含む、含める', 
        hint: 'includes his name（名前を含む）', 
        example: 'The bill includes service charges.',
        derivatives: [
            { english: 'including', partOfSpeech: '前', japanese: '～を含めて' }
        ]
    },
    { 
        id: 'sys_10', 
        english: 'remain', 
        phonetic: '/rɪˈmeɪn/', 
        japanese: '～のままでいる、残る', 
        hint: 'remain silent（黙ったままでいる）', 
        example: 'Many questions still remain unanswered.',
        derivatives: [
            { english: 'remains', partOfSpeech: '名', japanese: '遺物、遺跡、残り物' }
        ]
    },
    { 
        id: 'sys_11', 
        english: 'reach', 
        phonetic: '/riːtʃ/', 
        japanese: '～に着く、達する', 
        hint: 'reach the mountain top（山頂に到達する）', 
        example: 'We reached our destination at noon.'
    },
    { 
        id: 'sys_12', 
        english: 'allow', 
        phonetic: '/əˈlaʊ/', 
        japanese: '～を許可する、許す、可能にする', 
        hint: 'allow him to go out（外出を許可する）', 
        example: 'Computers allow us to work faster.',
        derivatives: [
            { english: 'allowance', partOfSpeech: '名', japanese: '手当、小遣い' }
        ]
    },
    { 
        id: 'sys_13', 
        english: 'force', 
        phonetic: '/fɔːrs/', 
        japanese: '～を強制する', 
        hint: 'be forced to work（働くよう強制される）', 
        example: 'He was forced to resign.'
    },
    { 
        id: 'sys_14', 
        english: 'offer', 
        phonetic: '/ˈɔːfər/', 
        japanese: '～を申し出る、給する、与える', 
        hint: 'offer help to the poor（援助を申し出る）', 
        example: 'They offered us a warm welcome.'
    },
    { 
        id: 'sys_15', 
        english: 'realize', 
        phonetic: '/ˈriːəlaɪz/', 
        japanese: '～を悟る、気づく、実現する', 
        hint: 'realize the error（間違いを悟る）', 
        example: 'I finally realized my dream.',
        derivatives: [
            { english: 'realization', partOfSpeech: '名', japanese: '認識、実現' }
        ]
    }
];

// 初期フォルダ定義
const DEFAULT_FOLDERS = [
    {
        id: 'folder_preset_ch1',
        name: 'システム英単語 Ch.1 🔒',
        isPreset: true,
        wordIds: [] // 起動時app.jsにて動的バインド
    }
];
