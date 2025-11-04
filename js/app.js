/**
 * 主应用程序
 * 整合所有功能模块，处理用户界面交互和事件处理
 */
class App {
    constructor() {
        this.currentTab = 'game';
        this.audioFiles = new Map(); // 缓存音频文件
        this.isAutoPlaying = false;

        this.initializeElements();
        this.initializeEventListeners();
        this.initializeGameLogic();
        this.updateUI();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 导航标签
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');

        // 游戏元素
        this.gameContainer = document.querySelector('.game-container');
        this.manualModeBtn = document.getElementById('manual-mode');
        this.autoModeBtn = document.getElementById('auto-mode');
        this.autoSettings = document.getElementById('auto-settings');
        this.autoControls = document.getElementById('auto-controls');
        this.cardCountSelect = document.getElementById('card-count');
        this.intervalSelect = document.getElementById('interval');

        // 卡片相关
        this.flashcard = document.getElementById('flashcard');
        this.cardContent = document.getElementById('card-content');

        // 输入元素
        this.japaneseInput = document.getElementById('japanese-input');
        this.kanaInput = document.getElementById('kana-input');
        this.chineseInput = document.getElementById('chinese-input');

        // 控制按钮
        this.startBtn = document.getElementById('start-btn');
        this.checkBtn = document.getElementById('check-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.showAnswerBtn = document.getElementById('show-answer-btn');
        this.autoStartBtn = document.getElementById('auto-start-btn');
        this.autoStopBtn = document.getElementById('auto-stop-btn');

        // 结果区域
        this.resultArea = document.getElementById('result-area');
        this.resultContent = document.getElementById('result-content');

        // 单词管理元素
        this.addWordForm = document.querySelector('.add-word-form');
        this.newJapaneseInput = document.getElementById('new-japanese');
        this.newKanaInput = document.getElementById('new-kana');
        this.newChineseInput = document.getElementById('new-chinese');
        this.newAudioInput = document.getElementById('new-audio');
        this.addWordBtn = document.getElementById('add-word-btn');
        this.searchWordInput = document.getElementById('search-word');
        this.wordsTbody = document.getElementById('words-tbody');
        this.totalWordsSpan = document.getElementById('total-words');

        // 历史记录元素
        this.totalPracticeSpan = document.getElementById('total-practice');
        this.accuracyRateSpan = document.getElementById('accuracy-rate');
        this.learnedWordsSpan = document.getElementById('learned-words');
        this.dateFilterSelect = document.getElementById('date-filter');
        this.historyTbody = document.getElementById('history-tbody');

        // 设置元素
        this.themeSelect = document.getElementById('theme');
        this.autoPlayAudioCheckbox = document.getElementById('auto-play-audio');
        this.showHintsCheckbox = document.getElementById('show-hints');
        this.defaultCardTypeSelect = document.getElementById('default-card-type');

        // 卡片显示设置元素
        this.enableJapaneseDisplayCheckbox = document.getElementById('enable-japanese-display');
        this.enableKanaDisplayCheckbox = document.getElementById('enable-kana-display');
        this.enableChineseDisplayCheckbox = document.getElementById('enable-chinese-display');
        this.enableAudioDisplayCheckbox = document.getElementById('enable-audio-display');
        this.resetDisplaySettingsBtn = document.getElementById('reset-display-settings');

        // 模态框
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeModalBtn = document.querySelector('.close');
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 标签切换
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 游戏模式切换
        this.manualModeBtn.addEventListener('click', () => {
            this.setGameMode('manual');
        });

        this.autoModeBtn.addEventListener('click', () => {
            this.setGameMode('auto');
        });

        // 自动设置变化
        this.cardCountSelect.addEventListener('change', () => {
            window.gameLogic.setAutoSettings({
                cardCount: parseInt(this.cardCountSelect.value)
            });
        });

        this.intervalSelect.addEventListener('change', () => {
            window.gameLogic.setAutoSettings({
                interval: parseInt(this.intervalSelect.value) * 1000
            });
        });

        // 游戏控制按钮
        this.startBtn.addEventListener('click', () => {
            this.drawNewCard();
        });

        this.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });

        this.skipBtn.addEventListener('click', () => {
            this.skipCard();
        });

        this.showAnswerBtn.addEventListener('click', () => {
            this.showAnswer();
        });

        this.autoStartBtn.addEventListener('click', () => {
            this.startAutoGame();
        });

        this.autoStopBtn.addEventListener('click', () => {
            this.stopAutoGame();
        });

        // 输入框回车事件
        [this.japaneseInput, this.kanaInput, this.chineseInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        });

        // 单词管理
        this.addWordBtn.addEventListener('click', () => {
            this.addWord();
        });

        this.searchWordInput.addEventListener('input', () => {
            this.searchWords();
        });

        // 历史记录
        this.dateFilterSelect.addEventListener('change', () => {
            this.updateHistory();
        });

        // 设置
        this.themeSelect.addEventListener('change', () => {
            this.updateSettings();
        });

        this.autoPlayAudioCheckbox.addEventListener('change', () => {
            this.updateSettings();
        });

        this.showHintsCheckbox.addEventListener('change', () => {
            this.updateSettings();
        });

        this.defaultCardTypeSelect.addEventListener('change', () => {
            this.updateSettings();
        });

        // 卡片显示设置
        this.enableJapaneseDisplayCheckbox.addEventListener('change', () => {
            this.updateCardDisplaySettings();
        });

        this.enableKanaDisplayCheckbox.addEventListener('change', () => {
            this.updateCardDisplaySettings();
        });

        this.enableChineseDisplayCheckbox.addEventListener('change', () => {
            this.updateCardDisplaySettings();
        });

        this.enableAudioDisplayCheckbox.addEventListener('change', () => {
            this.updateCardDisplaySettings();
        });

        this.resetDisplaySettingsBtn.addEventListener('click', () => {
            this.resetDisplaySettings();
        });

        // 导入导出
        document.getElementById('import-json-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('export-json-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-history-btn').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('backup-data-btn').addEventListener('click', () => {
            this.backupData();
        });

        document.getElementById('restore-data-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('reset-all-btn').addEventListener('click', () => {
            this.resetAllData();
        });

        // 模态框
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // 卡片点击事件
        this.flashcard.addEventListener('click', () => {
            if (this.currentQuizType === 'audio') {
                this.playCurrentAudio();
            }
        });
    }

    /**
     * 初始化游戏逻辑事件回调
     */
    initializeGameLogic() {
        window.gameLogic.setOnCardDrawn((word, quizType) => {
            this.onCardDrawn(word, quizType);
        });

        window.gameLogic.setOnAnswerChecked((result, historyData) => {
            this.onAnswerChecked(result, historyData);
        });

        window.gameLogic.setOnGameStarted((mode) => {
            this.onGameStarted(mode);
        });

        window.gameLogic.setOnGameStopped(() => {
            this.onGameStopped();
        });

        window.gameLogic.setOnAutoProgress((current, total) => {
            this.onAutoProgress(current, total);
        });

        // 音频播放器事件
        window.audioPlayer.setOnErrorCallback((error) => {
            this.showMessage('音频播放失败: ' + error.message, 'error');
        });
    }

    /**
     * 切换标签
     */
    switchTab(tabName) {
        // 更新标签状态
        this.navTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // 更新内容显示
        this.tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabName}-tab`) {
                content.classList.add('active');
            }
        });

        this.currentTab = tabName;

        // 根据标签更新内容
        if (tabName === 'words') {
            this.updateWordsList();
        } else if (tabName === 'history') {
            this.updateHistory();
            this.updateStatistics();
        } else if (tabName === 'settings') {
            this.updateSettingsUI();
        }
    }

    /**
     * 设置游戏模式
     */
    setGameMode(mode) {
        if (mode === 'manual') {
            this.manualModeBtn.classList.add('active');
            this.autoModeBtn.classList.remove('active');
            this.autoSettings.style.display = 'none';
            this.autoControls.style.display = 'none';
        } else {
            this.manualModeBtn.classList.remove('active');
            this.autoModeBtn.classList.add('active');
            this.autoSettings.style.display = 'flex';
            this.autoControls.style.display = 'flex';
        }

        this.stopAutoGame();
    }

    /**
     * 抽取新卡片
     */
    drawNewCard() {
        try {
            // 如果游戏未开始，自动开始
            if (!window.gameLogic.isGameActive) {
                window.gameLogic.startGame('manual');
            }

            const result = window.gameLogic.drawCard();
            this.displayCard(result.word, result.quizType, result.displayContent);
            this.enableGameControls();
            this.clearInputs();
            this.hideResult();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    /**
     * 显示卡片内容
     */
    displayCard(word, quizType, displayContent) {
        this.currentWord = word;
        this.currentQuizType = quizType;

        // 根据显示设置获取动态提示文本
        const hintText = this.updateHintText(quizType);

        if (displayContent.type === 'text') {
            this.cardContent.innerHTML = `
                <div class="card-text">${displayContent.content}</div>
                <div class="card-hint">${hintText}</div>
            `;
        } else if (displayContent.type === 'audio') {
            this.cardContent.innerHTML = `
                <div class="card-audio">
                    <div class="audio-icon">🎵</div>
                    <div class="audio-text">点击播放音频</div>
                    <div class="card-hint">${hintText}</div>
                </div>
            `;

            // 自动播放音频
            const settings = window.dataManager.getSettings();
            if (settings.autoPlayAudio) {
                setTimeout(() => {
                    this.playCurrentAudio();
                }, 500);
            }
        }

        // 更新输入框可见性
        this.updateInputVisibility();

        // 添加卡片动画
        this.flashcard.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.flashcard.style.transform = 'scale(1)';
        }, 100);
    }

    /**
     * 播放当前音频
     */
    async playCurrentAudio() {
        if (!this.currentWord || !this.currentWord.audio) {
            return;
        }

        try {
            await window.audioPlayer.playWordAudio(this.currentWord);
        } catch (error) {
            console.error('播放音频失败:', error);
            this.showMessage('音频播放失败', 'error');
        }
    }

    /**
     * 检查答案
     */
    checkAnswer() {
        const userAnswer = this.getAdjustedUserAnswer();
        if (!userAnswer) {
            this.showMessage('请输入答案', 'warning');
            return;
        }

        try {
            const result = window.gameLogic.checkAnswer(userAnswer);
            this.displayResult(result);
            this.disableGameControls();

            // 如果是自动模式，继续下一题
            if (window.gameLogic.gameMode === 'auto') {
                window.gameLogic.submitAnswerInAutoMode(userAnswer);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    /**
     * 获取用户输入
     */
    getUserInput() {
        return {
            japanese: this.japaneseInput.value.trim(),
            kana: this.kanaInput.value.trim(),
            chinese: this.chineseInput.value.trim()
        };
    }

    /**
     * 显示结果
     */
    displayResult(result) {
        let resultHTML = '<div class="result-items">';

        // 显示每个部分的结果
        Object.keys(result.details).forEach(key => {
            const detail = result.details[key];
            const isCorrect = detail.correct;
            const className = isCorrect ? 'correct' : 'incorrect';
            const icon = isCorrect ? '✅' : '❌';

            resultHTML += `
                <div class="result-item">
                    <span class="result-label">${this.getFieldLabel(key)}:</span>
                    <span class="result-actual ${className}">${detail.actual || '(空)'}</span>
                    ${isCorrect ? '' : `<span class="result-expected">正确: ${detail.expected}</span>`}
                    <span class="result-icon">${icon}</span>
                </div>
            `;
        });

        resultHTML += '</div>';

        // 显示总分
        resultHTML += `
            <div class="result-summary">
                <h4>得分: ${result.score}/${result.maxScore}</h4>
                <p class="${result.isCorrect ? 'success-message' : 'error-message'}">
                    ${result.isCorrect ? '完全正确！🎉' : '继续加油！💪'}
                </p>
            </div>
        `;

        this.resultContent.innerHTML = resultHTML;
        this.resultArea.style.display = 'block';

        // 高亮显示正确/错误的输入框
        this.highlightInputs(result.details);
    }

    /**
     * 获取字段标签
     */
    getFieldLabel(field) {
        const labels = {
            japanese: '日本語',
            kana: '仮名',
            chinese: '中文'
        };
        return labels[field] || field;
    }

    /**
     * 高亮显示输入框
     */
    highlightInputs(details) {
        const inputs = {
            japanese: this.japaneseInput,
            kana: this.kanaInput,
            chinese: this.chineseInput
        };

        Object.keys(inputs).forEach(key => {
            const input = inputs[key];
            const detail = details[key];

            if (detail.correct) {
                input.classList.add('correct');
                input.classList.remove('incorrect');
            } else {
                input.classList.add('incorrect');
                input.classList.remove('correct');
            }
        });
    }

    /**
     * 跳过卡片
     */
    skipCard() {
        window.gameLogic.skipCard();
        this.clearInputs();
        this.hideResult();
        this.disableGameControls();

        if (window.gameLogic.gameMode === 'auto') {
            // 自动模式会继续下一题
        } else {
            this.showMessage('已跳过此题', 'info');
        }
    }

    /**
     * 显示答案
     */
    showAnswer() {
        if (!this.currentWord) {
            return;
        }

        this.japaneseInput.value = this.currentWord.japanese;
        this.kanaInput.value = this.currentWord.kana;
        this.chineseInput.value = this.currentWord.chinese;

        this.showMessage('已显示正确答案', 'info');
        this.disableGameControls();
    }

    /**
     * 开始自动游戏
     */
    startAutoGame() {
        const settings = {
            cardCount: parseInt(this.cardCountSelect.value),
            interval: parseInt(this.intervalSelect.value) * 1000
        };

        try {
            window.gameLogic.startGame('auto', settings);
            this.isAutoPlaying = true;
            this.autoStartBtn.disabled = true;
            this.autoStopBtn.disabled = false;
            this.autoStartBtn.textContent = '⏸️ 进行中...';

            this.showMessage(`自动游戏开始，共${settings.cardCount}题`, 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    /**
     * 停止自动游戏
     */
    stopAutoGame() {
        window.gameLogic.stopGame();
        this.isAutoPlaying = false;
        this.autoStartBtn.disabled = false;
        this.autoStopBtn.disabled = true;
        this.autoStartBtn.textContent = '▶️ 自动开始';

        this.clearInputs();
        this.hideResult();
        this.disableGameControls();
        this.cardContent.innerHTML = '<p class="start-message">スタートボタンを押して始めてください</p>';
    }

    /**
     * 启用游戏控制
     */
    enableGameControls() {
        this.checkBtn.disabled = false;
        this.skipBtn.disabled = false;
        this.showAnswerBtn.disabled = false;
        this.startBtn.disabled = true;
    }

    /**
     * 禁用游戏控制
     */
    disableGameControls() {
        this.checkBtn.disabled = true;
        this.skipBtn.disabled = true;
        this.showAnswerBtn.disabled = true;
        this.startBtn.disabled = false;
    }

    /**
     * 清空输入
     */
    clearInputs() {
        this.japaneseInput.value = '';
        this.kanaInput.value = '';
        this.chineseInput.value = '';

        // 清除高亮
        [this.japaneseInput, this.kanaInput, this.chineseInput].forEach(input => {
            input.classList.remove('correct', 'incorrect');
        });
    }

    /**
     * 隐藏结果
     */
    hideResult() {
        this.resultArea.style.display = 'none';
    }

    /**
     * 添加单词
     */
    async addWord() {
        const wordData = {
            japanese: this.newJapaneseInput.value.trim(),
            kana: this.newKanaInput.value.trim(),
            chinese: this.newChineseInput.value.trim()
        };

        if (!wordData.japanese || !wordData.kana || !wordData.chinese) {
            this.showMessage('请填写所有字段', 'warning');
            return;
        }

        try {
            // 处理音频文件
            if (this.newAudioInput.files[0]) {
                wordData.audio = await window.dataManager.saveAudioFile(this.newAudioInput.files[0]);
            }

            const newWord = window.dataManager.addWord(wordData);
            this.showMessage('单词添加成功！', 'success');

            // 清空表单
            this.newJapaneseInput.value = '';
            this.newKanaInput.value = '';
            this.newChineseInput.value = '';
            this.newAudioInput.value = '';

            // 更新列表
            this.updateWordsList();

        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    /**
     * 更新单词列表
     */
    updateWordsList() {
        const words = window.dataManager.getAllWords();
        const searchTerm = this.searchWordInput.value.toLowerCase();
        const filteredWords = window.dataManager.searchWords(searchTerm);

        this.totalWordsSpan.textContent = words.length;

        // 清空现有列表
        this.wordsTbody.innerHTML = '';

        // 添加单词到列表
        filteredWords.forEach(word => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${word.japanese}</td>
                <td>${word.kana}</td>
                <td>${word.chinese}</td>
                <td>
                    ${word.audio ?
                        `<button class="audio-btn" data-word-id="${word.id}">🎵 播放</button>` :
                        '<span class="no-audio">无音频</span>'
                    }
                </td>
                <td>
                    <button class="delete-btn" data-word-id="${word.id}">🗑️ 删除</button>
                </td>
            `;
            this.wordsTbody.appendChild(row);
        });

        // 添加音频播放事件
        this.wordsTbody.querySelectorAll('.audio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wordId = parseInt(e.target.dataset.wordId);
                const word = window.dataManager.getWordById(wordId);
                if (word && word.audio) {
                    window.audioPlayer.playWordAudio(word).catch(error => {
                        this.showMessage('音频播放失败', 'error');
                    });
                }
            });
        });

        // 添加删除事件
        this.wordsTbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wordId = parseInt(e.target.dataset.wordId);
                if (confirm('确定要删除这个单词吗？')) {
                    window.dataManager.deleteWord(wordId);
                    this.updateWordsList();
                    this.showMessage('单词已删除', 'success');
                }
            });
        });
    }

    /**
     * 搜索单词
     */
    searchWords() {
        this.updateWordsList();
    }

    /**
     * 更新历史记录
     */
    updateHistory() {
        const filter = this.dateFilterSelect.value;
        const history = window.dataManager.getHistory({ dateFilter: filter });

        // 清空现有列表
        this.historyTbody.innerHTML = '';

        if (history.length === 0) {
            this.historyTbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">暂无历史记录</td></tr>';
            return;
        }

        // 添加历史记录
        history.forEach(record => {
            const row = document.createElement('tr');
            const date = new Date(record.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

            row.innerHTML = `
                <td>${dateStr}</td>
                <td>${record.word.japanese}</td>
                <td>${record.word.kana}</td>
                <td>${record.word.chinese}</td>
                <td>${this.getQuizTypeLabel(record.quizType)}</td>
                <td class="${record.isCorrect ? 'correct-result' : 'incorrect-result'}">
                    ${record.isCorrect ? '✅ 正确' : '❌ 错误'}
                </td>
            `;
            this.historyTbody.appendChild(row);
        });
    }

    /**
     * 获取出题类型标签
     */
    getQuizTypeLabel(type) {
        const labels = {
            japanese: '日本語',
            kana: '仮名',
            chinese: '中文',
            audio: '音声'
        };
        return labels[type] || type;
    }

    /**
     * 更新统计信息
     */
    updateStatistics() {
        const stats = window.dataManager.getStatistics();

        this.totalPracticeSpan.textContent = stats.totalPractice;
        this.accuracyRateSpan.textContent = `${stats.accuracyRate}%`;
        this.learnedWordsSpan.textContent = stats.learnedWords;
    }

    /**
     * 更新设置UI
     */
    updateSettingsUI() {
        const settings = window.dataManager.getSettings();

        this.themeSelect.value = settings.theme;
        this.autoPlayAudioCheckbox.checked = settings.autoPlayAudio;
        this.showHintsCheckbox.checked = settings.showHints;
        this.defaultCardTypeSelect.value = settings.defaultCardType;

        // 更新卡片显示设置
        this.enableJapaneseDisplayCheckbox.checked = settings.enableJapaneseDisplay;
        this.enableKanaDisplayCheckbox.checked = settings.enableKanaDisplay;
        this.enableChineseDisplayCheckbox.checked = settings.enableChineseDisplay;
        this.enableAudioDisplayCheckbox.checked = settings.enableAudioDisplay;
    }

    /**
     * 更新设置
     */
    updateSettings() {
        const settings = {
            theme: this.themeSelect.value,
            autoPlayAudio: this.autoPlayAudioCheckbox.checked,
            showHints: this.showHintsCheckbox.checked,
            defaultCardType: this.defaultCardTypeSelect.value
        };

        window.dataManager.updateSettings(settings);
        this.showMessage('设置已保存', 'success');

        // 应用主题
        this.applyTheme(settings.theme);
    }

    /**
     * 应用主题
     */
    applyTheme(theme) {
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    }

    /**
     * 导出数据
     */
    exportData() {
        try {
            const dataStr = window.dataManager.exportData();
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `japanese-card-game-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('数据导出成功', 'success');
        } catch (error) {
            this.showMessage('导出失败: ' + error.message, 'error');
        }
    }

    /**
     * 导入数据
     */
    importData(file) {
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                window.dataManager.importData(e.target.result);
                this.showMessage('数据导入成功', 'success');
                this.updateUI();
            } catch (error) {
                this.showMessage('导入失败: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 备份数据
     */
    backupData() {
        this.exportData();
    }

    /**
     * 清除历史记录
     */
    clearHistory() {
        if (confirm('确定要清除所有历史记录吗？此操作不可恢复。')) {
            window.dataManager.clearHistory();
            this.updateHistory();
            this.updateStatistics();
            this.showMessage('历史记录已清除', 'success');
        }
    }

    /**
     * 重置所有数据
     */
    resetAllData() {
        if (confirm('确定要重置所有数据吗？这将清除所有单词、历史记录和设置。此操作不可恢复。')) {
            window.dataManager.resetAll();
            this.updateUI();
            this.showMessage('所有数据已重置', 'success');
        }
    }

    /**
     * 更新UI
     */
    updateUI() {
        this.updateWordsList();
        this.updateHistory();
        this.updateStatistics();
        this.updateSettingsUI();
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        // 添加样式
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // 设置背景颜色
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        messageEl.style.backgroundColor = colors[type] || colors.info;

        // 添加到页面
        document.body.appendChild(messageEl);

        // 显示动画
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 显示模态框
     */
    showModal(content) {
        this.modalBody.innerHTML = content;
        this.modal.style.display = 'block';
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        this.modal.style.display = 'none';
    }

    // 游戏事件处理方法
    onCardDrawn(word, quizType) {
        console.log('Card drawn:', word, quizType);
    }

    onAnswerChecked(result, historyData) {
        console.log('Answer checked:', result, historyData);
    }

    onGameStarted(mode) {
        console.log('Game started:', mode);
        if (mode === 'auto') {
            this.cardContent.innerHTML = '<p class="start-message">自动游戏进行中...</p>';
        }
    }

    onGameStopped() {
        console.log('Game stopped');
    }

    onAutoProgress(current, total) {
        console.log('Auto progress:', current, total);
        this.showMessage(`进度: ${current}/${total}`, 'info');
    }

    /**
     * 更新卡片显示设置
     */
    updateCardDisplaySettings() {
        const settings = {
            enableJapaneseDisplay: this.enableJapaneseDisplayCheckbox.checked,
            enableKanaDisplay: this.enableKanaDisplayCheckbox.checked,
            enableChineseDisplay: this.enableChineseDisplayCheckbox.checked,
            enableAudioDisplay: this.enableAudioDisplayCheckbox.checked
        };

        // 检查是否至少启用了一个选项
        const hasEnabledOption = Object.values(settings).some(value => value === true);
        if (!hasEnabledOption) {
            this.showMessage('至少需要启用一种显示选项', 'warning');
            // 恢复之前的设置
            this.updateSettingsUI();
            return;
        }

        window.dataManager.updateSettings(settings);
        this.showMessage('卡片显示设置已更新', 'success');

        // 如果当前游戏正在进行，提醒用户重新开始
        if (window.gameLogic.isGameActive) {
            this.showMessage('设置已更新，请重新开始游戏以应用新设置', 'info');
        }
    }

    /**
     * 重置显示设置
     */
    resetDisplaySettings() {
        const defaultSettings = {
            enableJapaneseDisplay: true,
            enableKanaDisplay: true,
            enableChineseDisplay: true,
            enableAudioDisplay: true
        };

        window.dataManager.updateSettings(defaultSettings);
        this.updateSettingsUI();
        this.showMessage('显示设置已重置', 'success');
    }

    /**
     * 根据当前出题类型更新输入框的可见性和必填状态
     */
    updateInputVisibility() {
        // 显示所有输入框
        this.japaneseInput.style.display = 'block';
        this.kanaInput.style.display = 'block';
        this.chineseInput.style.display = 'block';

        // 根据当前出题类型设置必填状态
        let requiredFields = [];
        let optionalFields = [];

        if (this.currentQuizType === 'japanese') {
            // 显示日语，用户只需填写假名和中文
            optionalFields.push('japanese');
            requiredFields.push('kana', 'chinese');
        } else if (this.currentQuizType === 'kana') {
            // 显示假名，用户只需填写日语和中文
            optionalFields.push('kana');
            requiredFields.push('japanese', 'chinese');
        } else if (this.currentQuizType === 'chinese') {
            // 显示中文，用户只需填写日语和假名
            optionalFields.push('chinese');
            requiredFields.push('japanese', 'kana');
        } else if (this.currentQuizType === 'audio') {
            // 音频题，所有字段都需要填写
            requiredFields.push('japanese', 'kana', 'chinese');
        }

        // 应用视觉样式
        const fieldStyle = (fieldName, isRequired) => {
            const input = this[fieldName + 'Input'];
            if (isRequired) {
                input.style.opacity = '1';
                input.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                input.style.border = '2px solid #3498db';
                input.setAttribute('required', 'true');
            } else {
                input.style.opacity = '0.6';
                input.style.backgroundColor = 'rgba(245, 245, 245, 1)';
                input.style.border = '2px solid #ddd';
                input.removeAttribute('required');
                input.value = ''; // 清空可选字段
            }
        };

        fieldStyle('japanese', requiredFields.includes('japanese'));
        fieldStyle('kana', requiredFields.includes('kana'));
        fieldStyle('chinese', requiredFields.includes('chinese'));
    }

    /**
     * 根据当前出题类型调整答案验证逻辑
     */
    getAdjustedUserAnswer() {
        const userAnswer = {
            japanese: this.japaneseInput.value.trim(),
            kana: this.kanaInput.value.trim(),
            chinese: this.chineseInput.value.trim()
        };

        // 根据当前出题类型，已经显示的信息不需要填写
        if (this.currentQuizType === 'japanese') {
            // 题目显示日语，用户只需要填写假名和中文
            // 日语直接从当前单词获取，不需要用户输入
            userAnswer.japanese = this.currentWord ? this.currentWord.japanese : '';
        } else if (this.currentQuizType === 'kana') {
            // 题目显示假名，用户只需要填写日语和中文
            userAnswer.kana = this.currentWord ? this.currentWord.kana : '';
        } else if (this.currentQuizType === 'chinese') {
            // 题目显示中文，用户只需要填写日语和假名
            userAnswer.chinese = this.currentWord ? this.currentWord.chinese : '';
        }
        // 音频题需要填写所有三项，不做调整

        return userAnswer;
    }

    /**
     * 根据显示设置更新提示文本
     */
    updateHintText(quizType) {
        const settings = window.dataManager.getSettings();
        let hintText = '';

        // 根据当前出题类型和显示设置生成提示
        switch (quizType) {
            case 'japanese':
                if (settings.enableKanaDisplay && settings.enableChineseDisplay) {
                    hintText = '请输入假名和中文';
                } else if (settings.enableKanaDisplay) {
                    hintText = '请输入假名';
                } else if (settings.enableChineseDisplay) {
                    hintText = '请输入中文';
                } else {
                    hintText = '请输入答案';
                }
                break;
            case 'kana':
                if (settings.enableJapaneseDisplay && settings.enableChineseDisplay) {
                    hintText = '请输入日语和中文';
                } else if (settings.enableJapaneseDisplay) {
                    hintText = '请输入日语';
                } else if (settings.enableChineseDisplay) {
                    hintText = '请输入中文';
                } else {
                    hintText = '请输入答案';
                }
                break;
            case 'chinese':
                if (settings.enableJapaneseDisplay && settings.enableKanaDisplay) {
                    hintText = '请输入日语和假名';
                } else if (settings.enableJapaneseDisplay) {
                    hintText = '请输入日语';
                } else if (settings.enableKanaDisplay) {
                    hintText = '请输入假名';
                } else {
                    hintText = '请输入答案';
                }
                break;
            case 'audio':
                const requiredFields = [];
                if (settings.enableJapaneseDisplay) requiredFields.push('日语');
                if (settings.enableKanaDisplay) requiredFields.push('假名');
                if (settings.enableChineseDisplay) requiredFields.push('中文');

                if (requiredFields.length > 0) {
                    hintText = `请输入${requiredFields.join('、')}`;
                } else {
                    hintText = '请输入答案';
                }
                break;
        }

        return hintText;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 初始化应用
    window.app = new App();

    // 添加一些全局样式
    const style = document.createElement('style');
    style.textContent = `
        .dark-theme {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
        }

        .dark-theme .header,
        .dark-theme .footer {
            background: rgba(44, 62, 80, 0.95);
            color: #ecf0f1;
        }

        .dark-theme .game-container,
        .dark-theme .words-container,
        .dark-theme .history-container,
        .dark-theme .settings-container {
            background: rgba(52, 73, 94, 0.95);
            color: #ecf0f1;
        }

        .dark-theme .nav-tab {
            color: #bdc3c7;
        }

        .dark-theme .nav-tab.active {
            background: #3498db;
            color: white;
        }

        .card-text {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .card-hint {
            font-size: 1rem;
            color: #666;
            margin-top: 1rem;
        }

        .card-audio {
            text-align: center;
        }

        .audio-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: transform 0.2s ease;
        }

        .audio-icon:hover {
            transform: scale(1.1);
        }

        .audio-text {
            font-size: 1.2rem;
            color: #3498db;
            margin-bottom: 1rem;
        }

        .result-items {
            margin-bottom: 1rem;
        }

        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }

        .result-label {
            font-weight: 500;
            min-width: 80px;
        }

        .result-actual {
            flex: 1;
            margin: 0 1rem;
            text-align: center;
            font-weight: 500;
        }

        .result-expected {
            color: #e74c3c;
            font-size: 0.9rem;
        }

        .success-message {
            color: #27ae60;
            font-weight: 600;
            text-align: center;
        }

        .error-message {
            color: #e74c3c;
            text-align: center;
        }

        .no-audio {
            color: #999;
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);
});