/**
 * GamiWord Pro - 統合管理・非同期API連携・画面遷移制御
 */

window.addEventListener('DOMContentLoaded', () => {
    let state = {
        streak: 1,
        score: 0,
        combo: 0,
        xp: 0,
        level: 1,
        foods: 0,
        satiety: 100,
        
        folders: [],
        words: [], 
        customWords: [],
        
        activeFolderId: null,
        practiceWords: [], 
        currentCardIndex: 0,
        isHintShown: false
    };

    // DOM要素の防衛的定義 (ID不整合時のクラッシュを防止)
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
        aiStatus: document.getElementById('ai-status'),
        
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
        tagDerivative: document.getElementById('tag-derivative'),
        btnSpeak: document.getElementById('btn-speak'),
        choicesContainer: document.getElementById('choices-container'),

        checkBase: document.getElementById('check-base'),
        checkApplied: document.getElementById('check-applied'),

        dictList: document.getElementById('dict-list'),
        btnFeed: document.getElementById('btn-feed'),

        btnOpenSettings: document.getElementById('btn-open-settings'),
        modalSettings: document.getElementById('modal-settings'),
        inputApiKey: document.getElementById('input-api-key'),
        btnCancelSettings: document.getElementById('btn-cancel-settings'),
        btnSaveSettings: document.getElementById('btn-save-settings'),

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

    // ================= 1. AI API連携 ＆ ひっかけ選択肢生成 =================
    
    function updateAIStatusUI() {
        const key = localStorage.getItem('gamiword_api_key');
        if (elements.aiStatus) {
            if (key) {
                elements.aiStatus.textContent = "AI: オンライン";
                elements.aiStatus.className = "text-[8px] text-emerald-400 font-bold";
            } else {
                elements.aiStatus.textContent = "AI: ローカル";
                elements.aiStatus.className = "text-[8px] text-slate-500";
            }
        }
    }

    function generateChoicesLocal(word) {
        const eng = word.english.toLowerCase();
        const jap = word.japanese;
        const base = jap.replace(/～|する/g, '');

        let spellingFake = `～を段階的に${base}する`;
        if (eng.includes('allow')) spellingFake = "～を矢のように放つ";
        else if (eng.includes('expect')) spellingFake = "～を除外する";
        else if (eng.includes('decide')) spellingFake = "～を欺く";
        else if (eng.includes('consider')) spellingFake = "～を思いやる";

        const nuanceFake = `～を強引に${base}する`;

        const pool = state.words && state.words.length > 0 ? state.words : SYSTEM_WORDS_PRESET;
        const validWords = pool.filter(w => w.english.toLowerCase() !== eng);
        const distractorFake = (validWords.length > 0) 
            ? validWords[Math.floor(Math.random() * validWords.length)].japanese 
            : "～を検査する";

        return [
            { text: jap, isCorrect: true },
            { text: spellingFake, isCorrect: false, type: 'spelling' },
            { text: nuanceFake, isCorrect: false, type: 'nuance' },
            { text: distractorFake, isCorrect: false, type: 'distractor' }
        ];
    }

    async function fetchAIOptionChoices(word) {
        const apiKey = localStorage.getItem('gamiword_api_key');
        if (!apiKey) return generateChoicesLocal(word);

        const prompt = `
JSON形式で、英語"${word.english}"、日本語"${word.japanese}"の4択クイズの選択肢を出力してください。
正解(isCorrect: true)は、必ず"${word.japanese}"。
不正解(isCorrect: false)は、スペル酷似、意味類似、他動詞の3パターンを構築してください。
装飾無しのプレーンJSONのみを返却してください。
{
  "choices": [
    {"text": "${word.japanese}", "isCorrect": true},
    {"text": "スペル酷似訳", "isCorrect": false, "type": "spelling"},
    {"text": "ニュアンス類似訳", "isCorrect": false, "type": "nuance"},
    {"text": "関係ない意味", "isCorrect": false, "type": "distractor"}
  ]
}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.4
                })
            });

            if (!response.ok) throw new Error();
            const data = await response.json();
            const parsed = JSON.parse(data.choices[0].message.content.trim());
            return parsed.choices;
        } catch (e) {
            return generateChoicesLocal(word);
        }
    }

    async function processGenerationQueue() {
        const ungenerated = state.words.filter(w => !w.choices || w.choices.length !== 4);
        if (ungenerated.length === 0) return;

        for (const word of ungenerated) {
            word.choices = await fetchAIOptionChoices(word);
            saveState(); // 1単語生成ごとにバックアップ
        }
    }

    // ================= 2. アプリケーションのライフサイクル ＆ 確実な画面遷移 =================
    function init() {
        const saved = localStorage.getItem('gamiword_pro_core_v2');
        if (saved) {
            try {
                state = { ...state, ...JSON.parse(saved) };
            } catch (e) {
                console.error("データの破損を検知。クリアして開始します。");
            }
        }

        // 統合単語DBがなければchapter1.jsのプリセットデータをディープコピー
        if (!state.words || state.words.length === 0) {
            state.words = JSON.parse(JSON.stringify(SYSTEM_WORDS_PRESET));
        }

        // フォルダの初期化
        if (!state.folders || state.folders.length === 0) {
            state.folders = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
        }
        const presetFolder = state.folders.find(f => f.id === 'folder_preset_ch1');
        if (presetFolder) {
            presetFolder.wordIds = state.words.map(w => w.id);
        }

        // ペットのバインド
        if (window.PetSystem) {
            window.PetSystem.init();
        }

        updateStreak();
        renderFolderList();
        renderHeader();
        updateAIStatusUI();
        setupEvents();

        // 【デバッグ済みの確実な初期画面遷移】
        // setTimeout処理を安全にガードし、IDが存在する場合にのみ確実にスタイル操作を実行。
        setTimeout(() => {
            if (elements.viewTitle) {
                elements.viewTitle.classList.add('opacity-0');
                setTimeout(() => {
                    elements.viewTitle.classList.add('hidden');
                    if (elements.mainApp) {
                        elements.mainApp.classList.remove('hidden');
                        // 遷移後に非同期にAPIキー検出及び自動選択肢生成を開始
                        processGenerationQueue();
                    }
                }, 500);
            }
        }, 2000);
    }

    function saveState() {
        localStorage.setItem('gamiword_pro_core_v2', JSON.stringify({
            streak: state.streak,
            score: state.score,
            combo: state.combo,
            xp: state.xp,
            level: state.level,
            foods: state.foods,
            satiety: state.satiety,
            folders: state.folders,
            words: state.words
        }));
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('gamiword_pro_core_v2_active');
        if (lastActive) {
            const diff = Math.ceil(Math.abs(new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24));
            if (diff === 1) state.streak += 1;
            else if (diff > 1) state.streak = 1;
        } else {
            state.streak = 1;
        }
        localStorage.setItem('gamiword_pro_core_v2_active', today);
    }

    function renderHeader() {
        if (elements.headerStreak) elements.headerStreak.textContent = `${state.streak} 日`;
        if (elements.headerScore) elements.headerScore.textContent = state.score;
    }

    // ================= 3. ビューマネージャー =================
    const tabs = {
        'learn': { btn: elements.tabLearn, view: elements.viewLearn, title: 'フォルダ選択' },
        'dict': { btn: elements.tabDict, view: elements.viewDict, title: 'データ図鑑' },
        'pet': { btn: elements.tabPet, view: elements.viewPet, title: 'ペット育成' }
    };

    function showTab(targetKey) {
        if (elements.modalCreateFolder) elements.modalCreateFolder.classList.add('hidden');
        if (elements.modalAddWord) elements.modalAddWord.classList.add('hidden');
        if (elements.dictModal) elements.dictModal.classList.add('hidden');

        Object.keys(tabs).forEach(key => {
            const tab = tabs[key];
            if (tab.view && tab.btn) {
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
            if (window.PetSystem) window.PetSystem.updateUI(state);
        }
    }

    // ================= 4. フォルダ機能 ＆ 演習オプション =================
    function renderFolderList() {
        if (!elements.folderContainer) return;
        elements.folderContainer.innerHTML = '';
        state.folders.forEach(folder => {
            const div = document.createElement('div');
            div.className = 'bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center cursor-pointer active:scale-98 transition';
            const isPreset = folder.isPreset;
            const trashButton = isPreset 
                ? '<span class="text-xs text-slate-600">🔒</span>' 
                : `<button class="btn-delete-folder text-xs bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg font-bold" data-id="${folder.id}">削除</button>`;

            div.innerHTML = `
                <div class="flex-1 text-left mr-2">
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
                    btn.className = "btn-delete-folder text-xs bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold";
                } else {
                    deleteFolder(id);
                }
            });
        });
    }

    function createFolder(name) {
        if (!name.trim()) return;
        state.folders.push({
            id: 'folder_' + Date.now(),
            name: name.trim(),
            isPreset: false,
            wordIds: []
        });
        saveState();
        renderFolderList();
        elements.modalCreateFolder.classList.add('hidden');
        elements.inputFolderName.value = '';
    }

    function deleteFolder(id) {
        const folder = state.folders.find(f => f.id === id);
        if (folder && folder.isPreset) return;
        if (folder) {
            state.words = state.words.filter(w => !folder.wordIds.includes(w.id));
        }
        state.folders = state.folders.filter(f => f.id !== id);
        saveState();
        renderFolderList();
        triggerToast("フォルダを削除しました。");
    }

    function openFolderDetail(folderId) {
        state.activeFolderId = folderId;
        const folder = state.folders.find(f => f.id === folderId);
        if (!folder) return;

        elements.subFolderList.classList.add('hidden');
        elements.subFolderDetail.classList.remove('hidden');
        elements.detailFolderName.textContent = folder.name;
        
        if (folder.isPreset) {
            elements.btnOpenAddWord.classList.add('hidden');
        } else {
            elements.btnOpenAddWord.classList.remove('hidden');
        }

        renderFolderWordList();
    }

    function renderFolderWordList() {
        if (!elements.detailWordList) return;
        elements.detailWordList.innerHTML = '';
        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (!folder) return;

        const words = state.words.filter(w => folder.wordIds.includes(w.id));
        if (words.length === 0) {
            elements.detailWordList.innerHTML = `<div class="text-center py-8 text-slate-600 text-xs">単語が登録されていません</div>`;
            elements.btnStartSession.disabled = true;
            elements.btnStartSession.classList.add('opacity-50');
            return;
        }

        elements.btnStartSession.disabled = false;
        elements.btnStartSession.classList.remove('opacity-50');

        words.forEach(word => {
            const div = document.createElement('div');
            div.className = 'bg-slate-900 border border-slate-800 rounded-lg p-3 flex justify-between items-center';
            const deleteBtn = folder.isPreset ? '' : `<button class="btn-delete-word text-[10px] text-rose-400" data-id="${word.id}">削除</button>`;
            div.innerHTML = `
                <div class="text-left flex-1">
                    <span class="font-bold text-xs text-slate-200">${word.english}</span>
                    <span class="text-[10px] text-slate-500 ml-2">${word.japanese}</span>
                </div>
                ${deleteBtn}
            `;
            if (!folder.isPreset) {
                div.querySelector('.btn-delete-word').addEventListener('click', () => {
                    deleteWord(word.id);
                });
            }
            elements.detailWordList.appendChild(div);
        });
    }

    function addWordToFolder(eng, pho, jap, hintText, ex) {
        if (!eng.trim() || !jap.trim()) return;
        const wordId = 'word_' + Date.now();
        const newWord = {
            id: wordId,
            english: eng.trim(),
            phonetic: pho.trim() ? `/${pho.trim()}/` : '/--/',
            japanese: jap.trim(),
            hint: hintText.trim() || `${eng.trim()}を答えよ`,
            example: ex.trim() || '例文なし',
            correctCount: 0,
            incorrectCount: 0,
            lastReviewed: null,
            srsLevel: 0
        };

        newWord.choices = generateChoicesLocal(newWord);
        state.words.push(newWord);

        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (folder) folder.wordIds.push(wordId);

        saveState();
        renderFolderWordList();
        elements.modalAddWord.classList.add('hidden');
        triggerToast("単語を追加したピ！");
        processGenerationQueue(); // 非同期API生成待ちへ追加
    }

    function deleteWord(wordId) {
        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (folder) folder.wordIds = folder.wordIds.filter(id => id !== wordId);
        state.words = state.words.filter(w => w.id !== wordId);
        saveState();
        renderFolderWordList();
    }

    // ================= 5. 4択演習システム =================
    function startPractice() {
        const folder = state.folders.find(f => f.id === state.activeFolderId);
        if (!folder) return;

        const baseWords = state.words.filter(w => folder.wordIds.includes(w.id));
        if (baseWords.length === 0) return;

        const useBase = elements.checkBase.checked;
        const useApplied = elements.checkApplied.checked;

        if (!useBase && !useApplied) {
            triggerToast("少なくとも1つの出題オプションをONにしてくださいピ。");
            return;
        }

        let practicePool = [];
        baseWords.forEach(word => {
            if (useBase) {
                practicePool.push({
                    id: word.id,
                    english: word.english,
                    phonetic: word.phonetic,
                    japanese: word.japanese,
                    hint: word.hint,
                    choices: word.choices || generateChoicesLocal(word),
                    isDerivative: false,
                    parentWord: word
                });
            }
            if (useApplied && word.derivatives && word.derivatives.length > 0) {
                word.derivatives.forEach(deriv => {
                    practicePool.push({
                        id: `${word.id}_deriv`,
                        english: `${deriv.english} (${deriv.partOfSpeech})`,
                        phonetic: `/derivative/`,
                        japanese: deriv.japanese,
                        hint: `【派生語】 ${word.english}（${word.japanese}）の関連語`,
                        choices: generateChoicesLocal({ english: deriv.english, japanese: deriv.japanese }),
                        isDerivative: true,
                        parentWord: word
                    });
                });
            }
        });

        if (practicePool.length === 0) {
            triggerToast("派生語が存在しないフォルダですピ。");
            return;
        }

        state.practiceWords = practicePool.sort(() => Math.random() - 0.5);
        state.currentCardIndex = 0;
        state.combo = 0;

        elements.subFolderDetail.classList.add('hidden');
        elements.subCardPractice.classList.remove('hidden');
        elements.headerModeTitle.textContent = "演習中...";

        renderLearn();
        speakCurrent();
    }

    function renderLearn() {
        if (!elements.choicesContainer) return;
        elements.remainingCount.textContent = state.practiceWords.length - state.currentCardIndex;

        const current = state.practiceWords[state.currentCardIndex];
        if (!current) return;

        elements.wordEnglish.textContent = current.english;
        elements.wordPhonetic.textContent = current.phonetic;
        state.isHintShown = false;
        elements.wordHint.classList.add('hidden');
        elements.cardHintNotice.textContent = "タップしてヒントを表示";

        if (current.isDerivative) {
            elements.tagDerivative.classList.remove('hidden');
        } else {
            elements.tagDerivative.classList.add('hidden');
        }

        elements.choicesContainer.innerHTML = '';
        const shuffled = [...current.choices].sort(() => Math.random() - 0.5);
        shuffled.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-3.5 px-4 rounded-xl font-bold flex items-center justify-between active:scale-95 transition';
            btn.innerHTML = `
                <span class="text-slate-500 font-extrabold mr-2">${String.fromCharCode(65 + index)}</span>
                <span class="flex-1 text-left">${choice.text}</span>
            `;
            btn.addEventListener('click', () => handleChoiceSelect(choice, btn));
            elements.choicesContainer.appendChild(btn);
        });

        if (state.combo > 0) {
            elements.comboBadge.classList.remove('invisible');
            elements.comboCount.textContent = state.combo;
        } else {
            elements.comboBadge.classList.add('invisible');
        }
    }

    function handleChoiceSelect(choice, clickedBtn) {
        const allButtons = elements.choicesContainer.querySelectorAll('button');
        allButtons.forEach(btn => btn.disabled = true);

        const current = state.practiceWords[state.currentCardIndex];
        const parent = current.parentWord; 
        const isCorrect = choice.isCorrect;

        if (isCorrect) {
            clickedBtn.className = "w-full bg-emerald-950/80 border-emerald-700 text-emerald-200 text-xs py-3.5 px-4 rounded-xl font-bold flex items-center justify-between";
            state.combo += 1;
            state.score += 10 + (state.combo * 2);
            state.satiety = Math.max(0, state.satiety - 2);

            let gotFood = false;
            if (state.combo % 3 === 0) {
                state.foods += 1;
                gotFood = true;
            }

            if (parent) {
                parent.correctCount += 1;
                parent.srsLevel = Math.min(5, parent.srsLevel + 1);
            }

            state.practiceWords.splice(state.currentCardIndex, 1);
            if (gotFood) triggerToast("おやつ🍪を獲得したピ！");
        } else {
            clickedBtn.className = "w-full bg-rose-950/80 border-rose-700 text-rose-200 text-xs py-3.5 px-4 rounded-xl font-bold flex items-center justify-between";
            allButtons.forEach(btn => {
                const btnText = btn.querySelector('.flex-1').textContent;
                const correct = current.choices.find(c => c.isCorrect);
                if (correct && btnText === correct.text) {
                    btn.className = "w-full bg-emerald-950/20 border-emerald-500/50 text-emerald-400 text-xs py-3.5 px-4 rounded-xl font-bold flex items-center justify-between";
                }
            });

            state.combo = 0;
            if (parent) {
                parent.incorrectCount += 1;
                parent.srsLevel = Math.max(1, parent.srsLevel - 1);
            }

            const failed = state.practiceWords.splice(state.currentCardIndex, 1)[0];
            const idx = Math.min(3, state.practiceWords.length);
            state.practiceWords.splice(idx, 0, failed);
        }

        saveState();

        setTimeout(() => {
            if (state.practiceWords.length === 0) {
                triggerToast("🎉 全てクリアしたピ！素晴らしいピ！");
                showTab('learn');
            } else {
                renderLearn();
                speakCurrent();
            }
        }, 1000);
    }

    function speakCurrent() {
        const current = state.practiceWords[state.currentCardIndex];
        if (current && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(current.english.split('(')[0]);
            utterance.lang = 'en-US';
            utterance.rate = 0.95;
            window.speechSynthesis.speak(utterance);
        }
    }

    // ================= 6. データ図鑑 ＆ その他UI =================
    function renderDict() {
        if (!elements.dictList) return;
        elements.dictList.innerHTML = '';
        state.words.forEach(word => {
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
                <span class="text-[10px] ${strengthColor} border px-2 py-0.5 rounded-full">
                    記憶度 ${strength}%
                </span>
            `;
            card.addEventListener('click', () => openModal(word));
            elements.dictList.appendChild(card);
        });
    }

    function calculateStrength(word) {
        if (!word.lastReviewed) return 0;
        const elapsedMin = (Date.now() - word.lastReviewed) / 60000;
        const halfLife = (word.srsLevel || 1) * 10;
        const retention = Math.pow(0.5, elapsedMin / halfLife) * 100;
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

    function triggerToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-slate-200 text-xs py-2.5 px-4 rounded-xl shadow-2xl z-50 transition-opacity duration-300 pointer-events-none';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    // ================= 7. イベントバインド =================
    function setupEvents() {
        elements.tabLearn.addEventListener('click', () => showTab('learn'));
        elements.tabDict.addEventListener('click', () => showTab('dict'));
        elements.tabPet.addEventListener('click', () => showTab('pet'));

        elements.btnOpenSettings.addEventListener('click', () => {
            elements.inputApiKey.value = localStorage.getItem('gamiword_api_key') || '';
            elements.modalSettings.classList.remove('hidden');
        });
        elements.btnCancelSettings.addEventListener('click', () => elements.modalSettings.classList.add('hidden'));
        elements.btnSaveSettings.addEventListener('click', () => {
            const val = elements.inputApiKey.value.trim();
            if (val) {
                localStorage.setItem('gamiword_api_key', val);
            } else {
                localStorage.removeItem('gamiword_api_key');
            }
            saveState();
            updateAIStatusUI();
            elements.modalSettings.classList.add('hidden');
            triggerToast("設定を保存しました。");
            processGenerationQueue();
        });

        elements.btnOpenCreateFolder.addEventListener('click', () => elements.modalCreateFolder.classList.remove('hidden'));
        elements.btnCancelFolder.addEventListener('click', () => elements.modalCreateFolder.classList.add('hidden'));
        elements.btnSaveFolder.addEventListener('click', () => createFolder(elements.inputFolderName.value));

        elements.btnBackToFolders.addEventListener('click', () => showTab('learn'));
        elements.btnStartSession.addEventListener('click', startPractice);

        elements.wordQuestionCard.addEventListener('click', (e) => {
            if (e.target.closest('#btn-speak')) return;
            state.isHintShown = !state.isHintShown;
            elements.wordHint.classList.toggle('hidden', !state.isHintShown);
            elements.cardHintNotice.textContent = state.isHintShown ? "ヒント表示中" : "タップしてヒントを表示";
        });
        elements.btnExitPractice.addEventListener('click', () => showTab('learn'));
        elements.btnSpeak.addEventListener('click', speakCurrent);

        elements.btnOpenAddWord.addEventListener('click', () => elements.modalAddWord.classList.remove('hidden'));
        elements.btnCancelAddWord.addEventListener('click', () => elements.modalAddWord.classList.add('hidden'));
        elements.btnSaveAddWord.addEventListener('click', () => {
            addWordToFolder(
                elements.inputWordEng.value,
                elements.inputWordPhonetic.value,
                elements.inputWordJap.value,
                elements.inputWordHint.value,
                elements.inputWordExample.value
            );
        });

        elements.btnFeed.addEventListener('click', () => {
            if (window.PetSystem) {
                window.PetSystem.feed(state, triggerToast, saveState);
            }
        });

        elements.btnCloseModal.addEventListener('click', () => elements.dictModal.classList.add('hidden'));
    }

    init();
});
