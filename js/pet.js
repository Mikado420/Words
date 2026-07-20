/**
 * GamiWord Pro - ペット育成システムモジュール (pet.js)
 */

window.PetSystem = (() => {
    const PET_STAGES = [
        { minLevel: 1, maxLevel: 2, avatar: '🥚', name: 'タマゴ', messages: ["トントン...中から音がするピ", "動かすと少し揺れるピ！"] },
        { minLevel: 3, maxLevel: 5, avatar: '🐣', name: 'ひよこ（殻つき）', messages: ["パカッ！生まれたピ！", "もっと単語を食べたいピ！", "おやつはいつも大歓迎だピ！"] },
        { minLevel: 6, maxLevel: 9, avatar: '🐥', name: 'ひよこ', messages: ["羽がフサフサしてきたピ！", "頑張る主人が大好きだピ！", "たくさん正解しておやつをくれピ！"] },
        { minLevel: 10, maxLevel: 999, avatar: '🐉', name: 'ミニドラゴン', messages: ["ウオオオン！強くなったピ！", "完全にマスターしたピ！", "もう教えることは何もないピ！"] }
    ];

    let dom = {};

    function bindDOM() {
        dom = {
            levelName: document.getElementById('pet-level-name'),
            xpText: document.getElementById('pet-xp-text'),
            xpBar: document.getElementById('pet-xp-bar'),
            satietyText: document.getElementById('pet-satiety-text'),
            satietyBar: document.getElementById('pet-satiety-bar'),
            avatar: document.getElementById('pet-avatar'),
            bubble: document.getElementById('pet-bubble'),
            foodCount: document.getElementById('pet-food-count')
        };
    }

    return {
        init: function() {
            bindDOM();
        },

        updateUI: function(state) {
            if (!dom.levelName) bindDOM();

            const stage = PET_STAGES.find(s => state.level >= s.minLevel && state.level <= s.maxLevel) || PET_STAGES[0];
            
            if (dom.avatar) dom.avatar.textContent = stage.avatar;
            if (dom.levelName) dom.levelName.textContent = `Lv.${state.level} ${stage.name}`;
            if (dom.xpText) dom.xpText.textContent = `${state.xp} / 100 XP`;
            if (dom.xpBar) dom.xpBar.style.width = `${state.xp}%`;
            if (dom.satietyText) dom.satietyText.textContent = `${state.satiety}%`;
            if (dom.satietyBar) dom.satietyBar.style.width = `${state.satiety}%`;
            if (dom.foodCount) dom.foodCount.textContent = `🍪 ${state.foods} 個`;

            if (dom.bubble && dom.avatar) {
                if (state.satiety < 20) {
                    dom.bubble.textContent = "「ペコペコだピ...おやつが欲しいピ」";
                    dom.avatar.className = "text-7xl p-4 bg-slate-900 rounded-full border border-slate-800 animate-pulse";
                } else {
                    dom.avatar.className = "text-7xl p-4 bg-slate-900 rounded-full border border-slate-800 animate-idle";
                    const randomMsg = stage.messages[Math.floor(Math.random() * stage.messages.length)];
                    dom.bubble.textContent = `「${randomMsg}」`;
                }
            }
        },

        feed: function(state, onToast, onSave) {
            if (state.foods <= 0) {
                onToast("おやつ（🍪）がないピ！演習をクリアしてピ！");
                return;
            }
            if (state.satiety >= 100) {
                onToast("もうお腹いっぱいだピ！");
                return;
            }

            state.foods -= 1;
            state.satiety = Math.min(100, state.satiety + 20);
            state.xp += 15;

            if (state.xp >= 100) {
                state.level += 1;
                state.xp -= 100;
                onToast("🎉 レベルアップ！ペットが進化したピ！");
            }

            onSave();
            this.updateUI(state);

            if (dom.avatar) {
                dom.avatar.classList.remove('animate-idle');
                dom.avatar.classList.add('animate-happy');
                setTimeout(() => {
                    dom.avatar.classList.remove('animate-happy');
                    dom.avatar.classList.add('animate-idle');
                }, 700);
            }
        }
    };
})();
