/**
 * GamiWord AI - 4択 & 疑似AIひっかけ生成ロジックエンジン
 */

document.addEventListener('DOMContentLoaded', () => {
    // 状態管理
    let state = {
        streak: 1,
        score: 0,
        combo: 0,
        xp: 0,
        level: 1,
        foods: 0,
        satiety: 100,
        
        folders: [],
        customWords: [],
        
        activeFolderId: null,
        practiceWords: [], 
        currentCardIndex: 0,
        isHintShown: false
    };

    // DOM要素
    const elements = {
        viewTitle: document.getElementById('view-title'),
        mainApp: document.getElementById('main-app'),
        viewLearn: document.getElementById('view-learn'),
        viewDict: document.getElementById('view-dict'),
        viewPet: document.getElementById('view-pet'),
        
        tabLearn: document.getElementById('tab-learn'),
        tabDict: document.getElementById('tab-dict'),
        tabPet: document.getElementById('tab-pet'),
        
        headerStreak: document.getElementById('header-streak'),
        headerScore: document.getElementById('header-score'),
        headerModeTitle: document.getElementById('header-mode-title'),
        
        subFolderList: document.getElementById('subview-folder-list'),
        subFolderDetail: document.getElementById('subview-folder-detail'),
        subCardPractice: document.getElementById('subview-card-practice'),
        
        folderContainer: document.getElementById('folder-container'),
        btnOpenCreateFolder: document.getElementById('btn-open-create-folder'),
        modalCreateFolder: document.getElementById('modal-create-folder'),
        inputFolderName: document.getElementById('input-folder-name'),
        btnCancelFolder: document.getElementById('btn-cancel-folder'),
        btnSaveFolder: document.getElementById('btn-save-folder'),
        
        detailFolderName: document.getElementById('detail-folder-name'),
        detailWordList: document.getElementById('detail-word-list'),
        btnBackToFolders: document.getElementById('btn-back-to-folders'),
        btnStartSession: document.getElementById('btn-start-session'),
        btnOpenAddWord: document.getElementById('btn-open-add-word'),
        modalAddWord: document.getElementById('modal-add-word'),
        inputWordEng: document.getElementById('input-word-eng'),
        inputWordPhonetic: document.getElementById('input-word-phonetic'),
        inputWordJap: document.getElementById('input-word-jap'),
        inputWordHint: document.getElementById('input-word-hint'),
        inputWordExample: document.getElementById('input-word-example'),
        btnCancelAddWord: document.getElementById('btn-cancel-add-word'),
        btnSaveAddWord: document.getElementById('btn-save-add-word'),
        
        btnExitPractice: document.getElementById('btn-exit-practice'),
        comboBadge: document.getElementById('combo-badge'),
        comboCount: document.getElementById('combo-count'),
        remainingCount: document.getElementById('remaining-count'),
        wordQuestionCard: document.getElementById('word-question-card'),
        wordEnglish: document.getElementById('word-english'),
        wordPhonetic: document.getElementById('word-phonetic'),
        wordHint: document.getElementById('word-hint'),
        cardHintNotice: document.getElementById('card-hint-notice'),
        btnSpeak: document.getElementById('btn-speak'),
        choicesContainer: document.getElementById('choices-container'),

        dictList: document.getElementById('dict-list'),

        petLevelName: document.getElementById('pet-level-name'),
        petXpText: document.getElementById('pet-xp-text'),
        petXpBar: document.getElementById('pet-xp-bar'),
        petSatietyText: document.getElementById('pet-satiety-text'),
        petSatietyBar: document.getElementById('pet-satiety-bar'),
        petAvatar: document.getElementById('pet-avatar'),
        petBubble: document.getElementById('pet-bubble'),
        petFoodCount: document.getElementById('pet-food-count'),
        btnFeed: document.getElementById('btn-feed'),

        dictModal: document.getElementById('dict-modal'),
        btnCloseModal: document.getElementById('btn-close-modal'),
        modalEnglish: document.getElementById('modal-english'),
        modalPhonetic: document.getElementById('modal-phonetic'),
        modalJapanese: document.getElementById('modal-japanese'),
        modalExample: document.getElementById('modal-example'),
        modalAccuracy: document.getElementById('modal-accuracy'),
        modalCount: document.getElementById('modal-count'),
        modalStrength: document.getElementById('modal-strength')
    };

    // ================= 1. AIハズレ自動生成・保存ロジック =================
    // スペル酷似およびニュアンス類似判定を用いた疑似AI生成エンジン
    function runAIFakeGenerator(word) {
        if (word.choices && word.choices.length === 4) return; // 既に生成済み

        const eng = word.english.toLowerCase();
        const jap = word.japanese;

        // ルール1: スペル酷似の疑似生成（実在単語との混同）
        let spellingFake = "～を誤って同一視する";
        if (eng.includes('allow')) spellingFake = "～を矢のように放つ"; // arrow
        else if (eng.includes('expect')) spellingFake = "～を除外する、除く"; // except
        else if (eng.includes('decide')) spellingFake = "～をだます、欺く"; // deceive
        else if (eng.includes('develop')) spellingFake = "～を包む、封入する"; // envelope
        else if (eng.includes('realize')) spellingFake = "～を解放する、放つ"; // release
        else if (eng.includes('force')) spellingFake = "～を偽造する"; // forge
        else {
            // 一般カスタム単語用: スペル末尾を弄った適当な意味
            spellingFake = `～を段階的に${jap.replace(/～|する/g, '')}する`;
        }

        // ルール2: ニュアンス類似（核心的な誤訳・翻訳揺れ）
        let nuanceFake = `～を一時的に${jap.replace(/～|する/g, '')}する`;
        if (jap.includes('決定') || jap.includes('決意')) {
            nuanceFake = "～を何となく決める、成り行きに任せる";
        } else if (jap.includes('許可') || jap.includes('許す')) {
            nuanceFake = "～を不本意ながら目をつぶる";
        } else if (jap.includes('予期') || jap.includes('期待')) {
            nuanceFake = "～を過剰に心配して待つ";
        }

        // ルール3: ディストラクター（関係のない品詞が同じ動詞）
        const randomVerbPool = ["～を破壊する", "～を拒絶する", "～に反対する", "～を推薦する", "～を調査する"];
        const distractorFake = randomVerbPool[Math.floor(Math.random() * randomVerbPool.length)];

        // 4択構造の作成
        word.choices = [
            { text: jap, isCorrect: true },
            { text: spellingFake, isCorrect: false, type: 'spelling' },
            { text: nuanceFake, isCorrect: false, type: 'nuance' },
            { text: distractorFake, isCorrect: false, type: 'distractor' }
        ];
    }

    // すべての単語のchoicesの欠損を埋めて保存
    function ensureAllWordsHaveChoices() {
        // システム単語
        SYSTEM_WORDS_PRESET.forEach(word => runAIFakeGenerator(word));
        // ユーザーカスタム単語
        state.customWords.forEach(word => runAIFakeGenerator(word));
    }

    // ================= 2. アプリ初期化 =================
    function init() {
        const saved = localStorage.getItem('gamiword_ai_save');
        if (saved) {
            try {
                state = { ...state, ...JSON.parse(saved) };
            } catch (e) {
                console.error("データの破損を検知", e);
            }
        }
        
        if (!state.folders || state.folders.length === 0) {
            state.folders = [...DEFAULT_FOLDERS];
        }
        if (!state.customWords) {
            state.customWords = [];
        }

        // choicesの整合性を担保
        ensureAllWordsHaveChoices();
        saveState();

        updateStreak();
        renderFolderList();
        renderHeader();
        setupEvents();
    }

    function saveState() {
        localStorage.setItem('gamiword_ai_save', JSON.stringify({
            streak: state.streak,
            score: state.score,
            combo: state.combo,
            xp: state.xp,
            level: state.level,
            foods: state.foods,
            satiety: state.satiety,
            folders: state.folders,
            customWords: state.customWords,
            lastActiveDate: new Date().toDateString()
        }));
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('gamiword_ai_last_active');
        if (lastActive) {
            const diff = Math.ceil(Math.abs(new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24));
            if (diff === 1) state.streak += 1;
            else if (diff > 1) state.streak = 1;
        } else {
            state.streak = 1;
        }
        localStorage.setItem('gamiword_ai_last_active', today);
    }

    function renderHeader() {
        elements.headerStreak.textContent = `${state.streak} 日`;
        elements.headerScore.textContent = state.score;
    }

    // ================= 3. ビューマネージャー =================
    const tabs = {
        'learn': { btn: elements.tabLearn, view: elements.viewLearn, title: 'フォルダ選択' },
        'dict': { btn: elements.tabDict, view: elements.viewDict, title: 'データ図鑑' },
        'pet': { btn: elements.tabPet, view: elements.viewPet, title: 'ペット育成' }
    };

    function showTab(targetKey) {
        elements.modalCreateFolder.classList.add('hidden');
        elements.modalAddWord.classList.add('hidden');
        elements.dictModal.classList.add('hidden');

        Object.keys(tabs).forEach(key => {
            const tab = tabs[key];
            if (key === targetKey) {
                tab.view.classList.remove('hidden');
                tab.btn.classList.remove('text-slate-500');
                tab.btn.classList.add('text-emerald-400');
                elements.headerModeTitle.textContent = tab.title;
            } else {
                tab.view.classList.add('hidden');
                tab.btn.classList.add('text-slate-500');
                tab.btn.classList.remove('text-emerald-400');
            }
        });

        if (targetKey === 'learn') {
            elements.subFolderList.classList.remove('hidden');
            elements.subFolderDetail.classList.add('hidden');
            elements.subCardPractice.classList.add('hidden');
            elements.headerModeTitle.textContent = "フォルダ選択";
            renderFolderList();
        } else if (targetKey === 'dict') {
            renderDict();
        } else if (targetKey === 'pet') {
            updatePetUI();
        }
    }

    // ================= 4. フォルダ機能ロジック =================
    function renderFolderList() {
        elements.folderContainer.innerHTML = '';
        state.folders.forEach(folder => {
            const div = document.createElement('div');
            div.className = 'bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center cursor-pointer active:scale-98 transition';
            
            const isPreset = folder.isPreset;
            const trashButton = isPreset 
                ? '<span class="text-xs text-slate-600">🔒</span>' 
                : `<button class="btn-delete-folder text-xs bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg font-bold transition" data-id="${folder.id}">削除</button>`;

            div.innerHTML = `
                <div class="flex-1 text-left select-none mr-2">
                    <div class="font-bold text-sm text-slate-100">${folder.name}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">${folder.wordIds.length} 単語</div>
                </div>
                <div>${trashButton}</div>
            `;

            div.addEventListener('click', (e) => {
                if (e.target.closest('.btn-delete-folder')) return;
                openFolderDetail(folder.id);
            });

            elements.folderContainer.appendChild(div);
        });

        elements.folderContainer.querySelectorAll('.btn-delete-folder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (btn.textContent === '削除') {
                    btn.textContent = '確定？';
                    btn.classList.remove('bg-slate-800', 'text-slate-400');
                    btn.classList.add('bg-rose-700', 'text-white');
                    elements.folderContainer.querySelectorAll('.btn-delete-folder').forEach(other => {
                        if (other !== btn && other.textContent === '確定？') {
                            other.textContent = '削除';
                            other.classList.add('bg-slate-800', 'text-slate-400');
                            other.classList.remove('bg-rose-700', 'text-white');
                        }
                    });
                } else {
                    deleteFolder(id);
                }
            });
        });
    }

    function createFolder(name) {
        if (!name.trim()) return;
        const newFolder = {
            id: 'folder_' + Date.now(),
            name: name.trim(),
            isPreset: false,
            wordIds: []
        };
        state.folders.push(newFolder);
        saveState();
        renderFolderList();
        elements.modalCreateFolder.classList.add('hidden');
        elements.inputFolderName.value = '';
        triggerToast("フォルダを作成しましたピ！");
    }

    function deleteFolder(id) {
        const folder = state.folders.find(f => f.id === id);
        if (folder && folder.isPreset) return;
        
        if (folder) {
            state.customWords = state.customWords.filter(w => !folder.wordIds.includes(w.id));
        }

        state.folders = state.folders.filter(f => f.id !== id);
        saveState();
        renderFolderList();
        triggerToast("フォルダを削除しました。");
    }

    // ================= 5. フォルダ詳細 ＆ 単語追加 =================
    function openFolderDetail(folderId) {
        state.activeFolderId = folderId;
        const folder = state.folders.find(f => f.id === folderId);
        if (!folder) return;

        elements.subFolderList.classList.add('hidden');
        elements.subFolderDetail.classList.remove('hidden');
        elements.headerModeTitle.textContent = folder.name;
        elements.detailFolderName.textContent = folder.name;

        if (folder.isPreset) {
            elements.btnOpenAddWord.classList.add('hidden');
        } else {
            elements.btnOpenAddWord.classList.remove('hidden');
        }

        renderFolderWordList();
    }

    function renderFolderWordList() {
        elements.detailWordList.innerHTML = '';
        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (!folder) return;

        const words = getWordsByFolder(folder);
        if (words.length === 0) {
            elements.detailWordList.innerHTML = `
                <div class="text-center py-8 text-slate-600 text-xs">
                    単語が登録されていません。<br>「＋ 単語追加」から作成してくださいピ。
                </div>
            `;
            elements.btnStartSession.disabled = true;
            elements.btnStartSession.classList.add('opacity-50');
            return;
        }

        elements.btnStartSession.disabled = false;
        elements.btnStartSession.classList.remove('opacity-50');

        words.forEach(word => {
            const div = document.createElement('div');
            div.className = 'bg-slate-900 border border-slate-800 rounded-lg p-3 flex justify-between items-center';
            
            const deleteWordBtn = folder.isPreset 
                ? '' 
                : `<button class="btn-delete-word text-[10px] text-rose-400 active:scale-95" data-word-id="${word.id}">削除</button>`;

            div.innerHTML = `
                <div class="text-left select-none flex-1 pr-4">
                    <span class="font-bold text-xs text-slate-200">${word.english}</span>
                    <span class="text-[10px] text-slate-500 ml-2">${word.japanese}</span>
                </div>
                ${deleteWordBtn}
            `;

            if (!folder.isPreset) {
                div.querySelector('.btn-delete-word').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteWordFromFolder(word.id);
                });
            }

            elements.detailWordList.appendChild(div);
        });
    }

    function getWordsByFolder(folder) {
        if (folder.isPreset) {
            return SYSTEM_WORDS_PRESET.filter(w => folder.wordIds.includes(w.id));
        } else {
            return state.customWords.filter(w => folder.wordIds.includes(w.id));
        }
    }

    function addWordToFolder(eng, pho, jap, hintText, ex) {
        if (!eng.trim() || !jap.trim()) return;
        const wordId = 'word_' + Date.now();
        const newWord = {
            id: wordId,
            english: eng.trim(),
            phonetic: pho.trim() ? `/${pho.trim()}/` : '/--/',
            japanese: jap.trim(),
            hint: hintText.trim() || `${eng.trim()}の訳を答えよ`,
            example: ex.trim() || '例文は未設定です。',
            correctCount: 0,
            incorrectCount: 0,
            lastReviewed: null,
            srsLevel: 0
        };

        // 新規単語に対してAIハズレ選択肢を動的生成
        runAIFakeGenerator(newWord);

        state.customWords.push(newWord);

        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (folder) {
            folder.wordIds.push(wordId);
        }

        saveState();
        renderFolderWordList();
        
        elements.modalAddWord.classList.add('hidden');
        elements.inputWordEng.value = '';
        elements.inputWordPhonetic.value = '';
        elements.inputWordJap.value = '';
        elements.inputWordHint.value = '';
        elements.inputWordExample.value = '';
        triggerToast("単語を追加し、AI選択肢を自動生成したピ！");
    }

    function deleteWordFromFolder(wordId) {
        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (folder) {
            folder.wordIds = folder.wordIds.filter(id => id !== wordId);
        }
        state.customWords = state.customWords.filter(w => w.id !== wordId);

        saveState();
        renderFolderWordList();
        triggerToast("単語を削除したピ。");
    }

    // ================= 6. 4択クイズ演習ロジック =================
    function startPractice() {
        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (!folder) return;

        const words = getWordsByFolder(folder);
        if (words.length === 0) return;

        state.practiceWords = [...words].sort(() => Math.random() - 0.5);
        state.currentCardIndex = 0;
        state.combo = 0;
        state.isHintShown = false;

        elements.subFolderDetail.classList.add('hidden');
        elements.subCardPractice.classList.remove('hidden');
        elements.headerModeTitle.textContent = "演習中...";

        renderLearn();
        speakCurrent();
    }

    function renderLearn() {
        elements.headerScore.textContent = state.score;
        elements.remainingCount.textContent = state.practiceWords.length - state.currentCardIndex;

        const current = state.practiceWords[state.currentCardIndex];
        if (!current) return;

        elements.wordEnglish.textContent = current.english;
        elements.wordPhonetic.textContent = current.phonetic;
        
        // ヒントのリセット
        state.isHintShown = false;
        elements.wordHint.classList.add('hidden');
        elements.cardHintNotice.textContent = "カードをタップしてヒントを表示";

        // コンボ表示
        if (state.combo > 0) {
            elements.comboBadge.classList.remove('invisible');
            elements.comboCount.textContent = state.combo;
        } else {
            elements.comboBadge.classList.add('invisible');
        }

        // 4択ボタンのシャッフル生成
        elements.choicesContainer.innerHTML = '';
        const shuffledChoices = [...current.choices].sort(() => Math.random() - 0.5);

        shuffledChoices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-3.5 px-4 rounded-xl font-bold active:scale-98 transition text-left flex items-center justify-between hover:border-slate-700';
            btn.innerHTML = `
                <span class="text-slate-500 font-extrabold mr-2">${String.fromCharCode(65 + index)}</span>
                <span class="flex-1">${choice.text}</span>
            `;
            
            // タップ判定
            btn.addEventListener('click', () => handleChoiceSelect(choice, btn));
            elements.choicesContainer.appendChild(btn);
        });
    }

    function toggleHint() {
        const current = state.practiceWords[state.currentCardIndex];
        if (!current) return;

        state.isHintShown = !state.isHintShown;
        if (state.isHintShown) {
            elements.wordHint.textContent = current.hint || "ヒント情報なし";
            elements.wordHint.classList.remove('hidden');
            elements.cardHintNotice.textContent = "ヒント非表示中ピ";
        } else {
            elements.wordHint.classList.add('hidden');
            elements.cardHintNotice.textContent = "カードをタップしてヒントを表示";
        }
    }

    function handleChoiceSelect(choice, clickedBtn) {
        // ボタンを一時無効化（連打防止）
        const allButtons = elements.choicesContainer.querySelectorAll('button');
        allButtons.forEach(btn => btn.disabled = true);

        const isCorrect = choice.isCorrect;
        const current = state.practiceWords[state.currentCardIndex];

        current.lastReviewed = Date.now();

        if (isCorrect) {
            // 正答演出
            clickedBtn.classList.remove('bg-slate-900', 'border-slate-800', 'text-slate-200');
            clickedBtn.classList.add('bg-emerald-950/80', 'border-emerald-700', 'text-emerald-200');

            current.correctCount += 1;
            current.srsLevel = Math.min(5, current.srsLevel + 1);
            state.combo += 1;

            let gotFood = false;
            if (state.combo % 3 === 0) {
                state.foods += 1;
                gotFood = true;
            }

            state.score += 10 + (state.combo * 2);
            state.satiety = Math.max(0, state.satiety - 2);

            // 正解単語は演習リストから削除
            state.practiceWords.splice(state.currentCardIndex, 1);
            
            if (gotFood) triggerToast("🍪 おやつを1個見つけたピ！");
        } else {
            // 誤答演出
            clickedBtn.classList.remove('bg-slate-900', 'border-slate-800', 'text-slate-200');
            clickedBtn.classList.add('bg-rose-950/80', 'border-rose-700', 'text-rose-200');

            // 正解のボタンをハイライトする
            allButtons.forEach(btn => {
                const btnText = btn.querySelector('.flex-1').textContent;
                const correctChoice = current.choices.find(c => c.isCorrect);
                if (correctChoice && btnText === correctChoice.text) {
                    btn.classList.add('border-emerald-500', 'text-emerald-400');
                }
            });

            current.incorrectCount += 1;
            current.srsLevel = Math.max(1, current.srsLevel - 1);
            state.combo = 0;

            // 誤答は3問先に再挿入
            const failed = state.practiceWords.splice(state.currentCardIndex, 1)[0];
            const insertIdx = Math.min(3, state.practiceWords.length);
            state.practiceWords.splice(insertIdx, 0, failed);
        }

        saveState();

        // 演出完了後に次の問題へ
        setTimeout(() => {
            if (state.practiceWords.length === 0) {
                triggerToast("🎉 全ての単語をクリアしたピ！");
                showTab('learn');
            } else {
                renderLearn();
                speakCurrent();
            }
        }, 1000);
    }

    function speakCurrent() {
        const current = state.practiceWords[state.currentCardIndex];
        if (current) speakWord(current.english);
    }

    function speakWord(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = 'en-US';
            speech.rate = 0.95;
            window.speechSynthesis.speak(speech);
        }
    }

    // ================= 7. 図鑑表示ロジック =================
    function renderDict() {
        elements.dictList.innerHTML = '';
        const allWords = [...SYSTEM_WORDS_PRESET, ...state.customWords];
        
        allWords.forEach(word => {
            const strength = calculateStrength(word);
            const total = word.correctCount + word.incorrectCount;
            const stateStr = word.lastReviewed ? `SRS Lv.${word.srsLevel}` : '未学習';

            let strengthColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            if (strength > 70) strengthColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            else if (strength > 30) strengthColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

            const card = document.createElement('div');
            card.className = 'bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center cursor-pointer active:scale-98 transition';
            card.innerHTML = `
                <div>
                    <div class="font-bold text-sm text-white">${word.english}</div>
                    <div class="text-[10px] text-slate-500 mt-1">${stateStr} | 正答数: ${word.correctCount} / ${total}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-[10px] ${strengthColor} border px-2 py-0.5 rounded-full">
                        記憶度 ${strength}%
                    </span>
                </div>
            `;
            card.addEventListener('click', () => openModal(word));
            elements.dictList.appendChild(card);
        });
    }

    function calculateStrength(word) {
        if (!word.lastReviewed) return 0;
        const elapsedMinutes = (Date.now() - word.lastReviewed) / 60000;
        const halfLife = (word.srsLevel || 1) * 10;
        const retention = Math.pow(0.5, elapsedMinutes / halfLife) * 100;
        return Math.max(0, Math.min(100, Math.round(retention)));
    }

    function openModal(word) {
        const total = word.correctCount + word.incorrectCount;
        const accuracy = total > 0 ? Math.round((word.correctCount / total) * 100) : 0;
        const strength = calculateStrength(word);

        elements.modalEnglish.textContent = word.english;
        elements.modalPhonetic.textContent = word.phonetic;
        elements.modalJapanese.textContent = word.japanese;
        elements.modalExample.textContent = word.example;
        elements.modalAccuracy.textContent = `${accuracy}%`;
        elements.modalCount.textContent = `${total}回`;
        elements.modalStrength.textContent = `${strength}%`;

        elements.dictModal.classList.remove('hidden');
    }

    // ================= 8. ペット育成ロジック =================
    function updatePetUI() {
        const stage = PET_STAGES.find(s => state.level >= s.minLevel && state.level <= s.maxLevel) || PET_STAGES[0];
        elements.petAvatar.textContent = stage.avatar;
        elements.petLevelName.textContent = `Lv.${state.level} ${stage.name}`;
        elements.petXpText.textContent = `${state.xp} / 100 XP`;
        elements.petXpBar.style.width = `${state.xp}%`;
        
        elements.petSatietyText.textContent = `${state.satiety}%`;
        elements.petSatietyBar.style.width = `${state.satiety}%`;
        elements.petFoodCount.textContent = `🍪 ${state.foods} 個`;

        if (state.satiety < 20) {
            elements.petBubble.textContent = "「ペコペコだピ...おやつが欲しいピ」";
            elements.petAvatar.className = "text-7xl p-4 bg-slate-900 rounded-full border border-slate-800 animate-pulse";
        } else {
            elements.petAvatar.className = "text-7xl p-4 bg-slate-900 rounded-full border border-slate-800 animate-idle";
            const randomMsg = stage.messages[Math.floor(Math.random() * stage.messages.length)];
            elements.petBubble.textContent = `「${randomMsg}」`;
        }
    }

    function feedPet() {
        if (state.foods <= 0) {
            triggerToast("おやつ（🍪）が足りないピ！単語を解いて獲得してピ！");
            return;
        }
        if (state.satiety >= 100) {
            triggerToast("お腹いっぱいだピ！");
            return;
        }

        state.foods -= 1;
        state.satiety = Math.min(100, state.satiety + 20);
        state.xp += 15;

        if (state.xp >= 100) {
            state.level += 1;
            state.xp -= 100;
            triggerToast("🎉 レベルアップ！進化に一歩近づいたピ！");
        }

        saveState();
        updatePetUI();

        elements.petAvatar.classList.remove('animate-idle');
        elements.petAvatar.classList.add('animate-happy');
        setTimeout(() => {
            elements.petAvatar.classList.remove('animate-happy');
            elements.petAvatar.classList.add('animate-idle');
        }, 800);
    }

    function triggerToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-slate-200 text-xs py-2.5 px-4 rounded-xl shadow-2xl z-50 transition-opacity duration-300';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    // ================= 9. イベント設定 =================
    function setupEvents() {
        setTimeout(() => {
            elements.viewTitle.classList.add('opacity-0');
            setTimeout(() => {
                elements.viewTitle.classList.add('hidden');
                elements.mainApp.classList.remove('hidden');
            }, 500);
        }, 2000);

        elements.tabLearn.addEventListener('click', () => showTab('learn'));
        elements.tabDict.addEventListener('click', () => showTab('dict'));
        elements.tabPet.addEventListener('click', () => showTab('pet'));

        elements.btnOpenCreateFolder.addEventListener('click', () => elements.modalCreateFolder.classList.remove('hidden'));
        elements.btnCancelFolder.addEventListener('click', () => {
            elements.modalCreateFolder.classList.add('hidden');
            elements.inputFolderName.value = '';
        });
        elements.btnSaveFolder.addEventListener('click', () => {
            createFolder(elements.inputFolderName.value);
        });

        elements.btnBackToFolders.addEventListener('click', () => showTab('learn'));
        elements.btnStartSession.addEventListener('click', startPractice);

        elements.btnOpenAddWord.addEventListener('click', () => elements.modalAddWord.classList.remove('hidden'));
        elements.btnCancelAddWord.addEventListener('click', () => {
            elements.modalAddWord.classList.add('hidden');
        });
        elements.btnSaveAddWord.addEventListener('click', () => {
            addWordToFolder(
                elements.inputWordEng.value,
                elements.inputWordPhonetic.value,
                elements.inputWordJap.value,
                elements.inputWordHint.value,
                elements.inputWordExample.value
            );
        });

        // 演習
        elements.wordQuestionCard.addEventListener('click', (e) => {
            if (e.target.closest('#btn-speak')) return;
            toggleHint();
        });
        elements.btnExitPractice.addEventListener('click', () => {
            showTab('learn');
        });
        elements.btnSpeak.addEventListener('click', speakCurrent);

        // 育成
        elements.btnFeed.addEventListener('click', feedPet);

        // ダイアログ
        elements.btnCloseModal.addEventListener('click', () => elements.dictModal.classList.add('hidden'));
        elements.dictModal.addEventListener('click', (e) => {
            if (e.target === elements.dictModal) elements.dictModal.classList.add('hidden');
        });
    }

    init();
});
