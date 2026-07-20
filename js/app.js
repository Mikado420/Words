/**
 * GamiWord - アプリケーションコントロールロジック
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
        satiety: 100, // 満腹度（0 - 100）
        words: [],
        currentCardIndex: 0,
        isFlipped: false
    };

    // DOM要素の取得
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
        
        comboBadge: document.getElementById('combo-badge'),
        comboCount: document.getElementById('combo-count'),
        remainingCount: document.getElementById('remaining-count'),
        
        wordCard: document.getElementById('word-card'),
        cardInner: document.getElementById('card-inner'),
        wordEnglish: document.getElementById('word-english'),
        wordPhonetic: document.getElementById('word-phonetic'),
        wordJapanese: document.getElementById('word-japanese'),
        wordExample: document.getElementById('word-example'),
        
        btnSpeak: document.getElementById('btn-speak'),
        btnForget: document.getElementById('btn-forget'),
        btnRemember: document.getElementById('btn-remember'),
        
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

    // 1. ビュー切り替え
    const views = {
        'learn': { tab: elements.tabLearn, view: elements.viewLearn, title: '単語演習' },
        'dict': { tab: elements.tabDict, view: elements.viewDict, title: 'データ図鑑' },
        'pet': { tab: elements.tabPet, view: elements.viewPet, title: 'ペット育成' }
    };

    function showView(targetKey) {
        Object.keys(views).forEach(key => {
            const current = views[key];
            if (key === targetKey) {
                current.view.classList.remove('hidden');
                current.tab.classList.remove('text-slate-500');
                current.tab.classList.add('text-emerald-400');
                elements.headerModeTitle.textContent = current.title;
            } else {
                current.view.classList.add('hidden');
                current.tab.classList.remove('text-emerald-400');
                current.tab.classList.add('text-slate-500');
            }
        });
        
        if (targetKey === 'dict') renderDict();
        if (targetKey === 'pet') updatePetUI();
    }

    // 2. セーブ ＆ ロード
    function loadGame() {
        const saved = localStorage.getItem('gamiword_save');
        if (saved) {
            try {
                state = { ...state, ...JSON.parse(saved) };
            } catch (e) {
                console.error('セーブデータのパースに失敗しました', e);
            }
        }
        if (!state.words || state.words.length === 0) {
            state.words = [...INITIAL_WORDS];
        }
        updateStreak();
    }

    function saveGame() {
        localStorage.setItem('gamiword_save', JSON.stringify({
            streak: state.streak,
            score: state.score,
            combo: state.combo,
            xp: state.xp,
            level: state.level,
            foods: state.foods,
            satiety: state.satiety,
            words: state.words,
            lastActiveDate: new Date().toDateString()
        }));
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('gamiword_last_active');
        if (lastActive) {
            const diff = Math.ceil(Math.abs(new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24));
            if (diff === 1) state.streak += 1;
            else if (diff > 1) state.streak = 1;
        } else {
            state.streak = 1;
        }
        localStorage.setItem('gamiword_last_active', today);
        elements.headerStreak.textContent = `${state.streak} 日`;
    }

    // 3. 記憶保持度の計算ロジック（エビングハウス簡略モデル）
    function calculateStrength(word) {
        if (!word.lastReviewed) return 0; // 未学習
        const elapsedMinutes = (Date.now() - word.lastReviewed) / 60000; // デモ用に「分」単位
        // SRSレベルに応じて減衰速度を変化させる
        const halfLife = (word.srsLevel || 1) * 10; // レベルが高いほど記憶が長く残る（半減期: 分）
        const retention = Math.pow(0.5, elapsedMinutes / halfLife) * 100;
        return Math.max(0, Math.min(100, Math.round(retention)));
    }

    // 4. 音声読み上げ
    function speakWord(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(text);
            speech.lang = 'en-US';
            speech.rate = 0.9;
            window.speechSynthesis.speak(speech);
        }
    }

    // 5. 単語演習ロジック
    function flipCard() {
        state.isFlipped = !state.isFlipped;
        elements.cardInner.classList.toggle('rotate-y-180', state.isFlipped);
    }

    function speakCurrent() {
        const current = state.words[state.currentCardIndex];
        if (current) speakWord(current.english);
    }

    function handleDecision(remembered) {
        const word = state.words[state.currentCardIndex];
        if (!word) return;

        word.lastReviewed = Date.now();
        const prevLevel = word.srsLevel;

        if (remembered) {
            word.correctCount += 1;
            word.srsLevel = Math.min(5, word.srsLevel + 1);
            state.combo += 1;
            
            // コンボによるおやつ獲得ボーナス
            let gotFood = false;
            if (state.combo % 3 === 0) {
                state.foods += 1;
                gotFood = true;
            }

            // スコア追加
            const earnedScore = 10 + (state.combo * 2);
            state.score += earnedScore;

            // 満腹度が少し下がる（学習するとペットがお腹をすかせるアクション）
            state.satiety = Math.max(0, state.satiety - 2);

            // SRS配列処理: 覚えた単語は後ろへ移動
            state.words.push(state.words.splice(state.currentCardIndex, 1)[0]);
            
            if (gotFood) triggerToast("🍪 おやつを1個見つけたピ！");
        } else {
            word.incorrectCount += 1;
            word.srsLevel = Math.max(1, word.srsLevel - 1);
            state.combo = 0;

            // SRS配列処理: 忘れた単語はすぐに再出題するため、3枚先に差し込む
            const failed = state.words.splice(state.currentCardIndex, 1)[0];
            const insertIdx = Math.min(3, state.words.length);
            state.words.splice(insertIdx, 0, failed);
        }

        saveGame();

        // 状態遷移演出
        if (state.isFlipped) {
            flipCard();
            setTimeout(() => {
                renderLearn();
                speakCurrent();
            }, 300);
        } else {
            renderLearn();
            speakCurrent();
        }
    }

    function renderLearn() {
        elements.headerScore.textContent = state.score;
        elements.remainingCount.textContent = state.words.length - state.currentCardIndex;

        const current = state.words[state.currentCardIndex];
        if (current) {
            elements.wordEnglish.textContent = current.english;
            elements.wordPhonetic.textContent = current.phonetic;
            elements.wordJapanese.textContent = current.japanese;
            elements.wordExample.textContent = current.example;
        }

        if (state.combo > 0) {
            elements.comboBadge.classList.remove('invisible');
            elements.comboCount.textContent = state.combo;
        } else {
            elements.comboBadge.classList.add('invisible');
        }
    }

    // 6. 図鑑描画ロジック
    function renderDict() {
        elements.dictList.innerHTML = '';
        state.words.forEach(word => {
            const strength = calculateStrength(word);
            const total = word.correctCount + word.incorrectCount;
            const stateStr = word.lastReviewed ? `SRS Lv.${word.srsLevel}` : '未学習';
            
            // 記憶強度に応じた色判定
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
                        記憶強度 ${strength}%
                    </span>
                </div>
            `;
            card.addEventListener('click', () => openModal(word));
            elements.dictList.appendChild(card);
        });
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

    // 7. ペット育成ロジック
    function updatePetUI() {
        const stage = PET_STAGES.find(s => state.level >= s.minLevel && state.level <= s.maxLevel) || PET_STAGES[0];
        elements.petAvatar.textContent = stage.avatar;
        elements.petLevelName.textContent = `Lv.${state.level} ${stage.name}`;
        elements.petXpText.textContent = `${state.xp} / 100 XP`;
        elements.petXpBar.style.width = `${state.xp}%`;
        
        elements.petSatietyText.textContent = `${state.satiety}%`;
        elements.petSatietyBar.style.width = `${state.satiety}%`;
        elements.petFoodCount.textContent = `🍪 ${state.foods} 個`;

        // 満腹度に応じたメッセージ
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
            triggerToast("おやつ（🍪）が足りないピ！単語を解いて獲得するピ！");
            return;
        }
        if (state.satiety >= 100) {
            triggerToast("お腹いっぱいだピ！これ以上食べられないピ！");
            return;
        }

        state.foods -= 1;
        state.satiety = Math.min(100, state.satiety + 20);
        
        // おやつをあげると経験値獲得
        const earnedXp = 15;
        state.xp += earnedXp;
        
        if (state.xp >= 100) {
            state.level += 1;
            state.xp -= 100;
            triggerToast("🎉 レベルアップ！進化に一歩近づいたピ！");
        }

        saveGame();
        updatePetUI();

        // 食べるアニメーション
        elements.petAvatar.classList.remove('animate-idle');
        elements.petAvatar.classList.add('animate-happy');
        setTimeout(() => {
            elements.petAvatar.classList.remove('animate-happy');
            elements.petAvatar.classList.add('animate-idle');
        }, 800);
    }

    // 簡易トースト表示機能
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

    // 8. イベントリスナーの設定
    function setupEvents() {
        // 起動処理（タイトル2秒間強制）
        setTimeout(() => {
            elements.viewTitle.classList.add('opacity-0');
            setTimeout(() => {
                elements.viewTitle.classList.add('hidden');
                elements.mainApp.classList.remove('hidden');
                speakCurrent();
            }, 500);
        }, 2000);

        // タブボタンイベント
        elements.tabLearn.addEventListener('click', () => showView('learn'));
        elements.tabDict.addEventListener('click', () => showView('dict'));
        elements.tabPet.addEventListener('click', () => showView('pet'));

        // カードフリップ
        elements.wordCard.addEventListener('click', (e) => {
            if (e.target.closest('#btn-speak')) return;
            flipCard();
        });

        // 判定ボタン
        elements.btnForget.addEventListener('click', () => handleDecision(false));
        elements.btnRemember.addEventListener('click', () => handleDecision(true));

        // 読み上げ
        elements.btnSpeak.addEventListener('click', speakCurrent);

        // おやつボタン
        elements.btnFeed.addEventListener('click', feedPet);

        // ダイアログ閉じる
        elements.btnCloseModal.addEventListener('click', () => {
            elements.dictModal.classList.add('hidden');
        });
        elements.dictModal.addEventListener('click', (e) => {
            if (e.target === elements.dictModal) elements.dictModal.classList.add('hidden');
        });
    }

    // 起動
    loadGame();
    renderLearn();
    setupEvents();
});
