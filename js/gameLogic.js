/**
 * 游戏逻辑模块
 * 负责抽卡游戏的核心逻辑，包括卡片选择、答案验证、游戏模式控制等
 */
class GameLogic {
    constructor() {
        this.currentWord = null;
        this.currentQuizType = null;
        this.gameMode = 'manual'; // manual | auto
        this.autoTimer = null;
        this.autoQueue = [];
        this.autoIndex = 0;
        this.startTime = null;
        this.isGameActive = false;

        // 配置选项
        this.autoSettings = {
            cardCount: 5,
            interval: 3000 // 毫秒
        };

        // 出题类型
        this.quizTypes = ['japanese', 'kana', 'chinese', 'audio'];

        // 回调函数
        this.onCardDrawn = null;
        this.onAnswerChecked = null;
        this.onGameStarted = null;
        this.onGameStopped = null;
        this.onAutoProgress = null;
    }

    /**
     * 开始游戏
     * @param {string} mode - 游戏模式 ('manual' | 'auto')
     * @param {Object} settings - 游戏设置
     */
    startGame(mode = 'manual', settings = {}) {
        this.gameMode = mode;
        this.isGameActive = true;

        if (mode === 'auto') {
            this.autoSettings = { ...this.autoSettings, ...settings };
            this.startAutoMode();
        }

        if (this.onGameStarted) {
            this.onGameStarted(mode);
        }
    }

    /**
     * 停止游戏
     */
    stopGame() {
        this.isGameActive = false;
        this.currentWord = null;
        this.currentQuizType = null;
        this.startTime = null;

        if (this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
        }

        this.autoQueue = [];
        this.autoIndex = 0;

        if (this.onGameStopped) {
            this.onGameStopped();
        }
    }

    /**
     * 抽取一张卡片
     * @param {string} quizType - 指定的出题类型，如果不指定则随机
     */
    drawCard(quizType = null) {
        if (!this.isGameActive) {
            throw new Error('游戏未开始');
        }

        const words = window.dataManager.getAllWords();
        if (words.length === 0) {
            throw new Error('没有可用的单词');
        }

        // 选择单词
        this.currentWord = window.dataManager.getRandomWord();

        // 确定出题类型
        if (!quizType) {
            quizType = this.getRandomQuizType();
        }
        this.currentQuizType = quizType;

        // 记录开始时间
        this.startTime = Date.now();

        // 触发卡片抽取事件
        if (this.onCardDrawn) {
            this.onCardDrawn(this.currentWord, this.currentQuizType);
        }

        return {
            word: this.currentWord,
            quizType: this.currentQuizType,
            displayContent: this.getDisplayContent()
        };
    }

    /**
     * 获取随机出题类型
     */
    getRandomQuizType() {
        const settings = window.dataManager.getSettings();

        // 首先检查是否指定了默认出题类型
        if (settings.defaultCardType && settings.defaultCardType !== 'random') {
            // 检查指定的类型是否被启用
            if (this.isQuizTypeEnabled(settings.defaultCardType)) {
                return settings.defaultCardType;
            }
        }

        // 获取所有启用的出题类型
        const enabledTypes = this.getEnabledQuizTypes();

        if (enabledTypes.length === 0) {
            throw new Error('没有启用任何出题类型，请在设置中启用至少一种显示选项');
        }

        // 从启用的类型中随机选择
        const randomIndex = Math.floor(Math.random() * enabledTypes.length);
        return enabledTypes[randomIndex];
    }

    /**
     * 获取所有启用的出题类型
     */
    getEnabledQuizTypes() {
        const settings = window.dataManager.getSettings();
        const enabledTypes = [];

        if (settings.enableJapaneseDisplay) {
            enabledTypes.push('japanese');
        }
        if (settings.enableKanaDisplay) {
            enabledTypes.push('kana');
        }
        if (settings.enableChineseDisplay) {
            enabledTypes.push('chinese');
        }
        if (settings.enableAudioDisplay) {
            enabledTypes.push('audio');
        }

        return enabledTypes;
    }

    /**
     * 检查出题类型是否被启用
     */
    isQuizTypeEnabled(quizType) {
        const settings = window.dataManager.getSettings();

        switch (quizType) {
            case 'japanese':
                return settings.enableJapaneseDisplay;
            case 'kana':
                return settings.enableKanaDisplay;
            case 'chinese':
                return settings.enableChineseDisplay;
            case 'audio':
                return settings.enableAudioDisplay;
            default:
                return false;
        }
    }

    /**
     * 获取显示内容
     */
    getDisplayContent() {
        if (!this.currentWord || !this.currentQuizType) {
            return null;
        }

        switch (this.currentQuizType) {
            case 'japanese':
                return {
                    type: 'text',
                    content: this.currentWord.japanese,
                    hint: '仮名と中文を入力してください'
                };
            case 'kana':
                return {
                    type: 'text',
                    content: this.currentWord.kana,
                    hint: '日本語と中文を入力してください'
                };
            case 'chinese':
                return {
                    type: 'text',
                    content: this.currentWord.chinese,
                    hint: '日本語と仮名を入力してください'
                };
            case 'audio':
                return {
                    type: 'audio',
                    content: this.currentWord.audio,
                    hint: '聞こえた単語の日本語、仮名、中文を入力してください'
                };
            default:
                return null;
        }
    }

    /**
     * 检查答案
     * @param {Object} userAnswer - 用户答案
     */
    checkAnswer(userAnswer) {
        if (!this.currentWord || !this.currentQuizType) {
            throw new Error('没有当前活动的题目');
        }

        const timeSpent = this.startTime ? Date.now() - this.startTime : 0;
        const result = this.evaluateAnswer(userAnswer);

        // 保存到历史记录
        const historyData = {
            wordId: this.currentWord.id,
            word: { ...this.currentWord },
            quizType: this.currentQuizType,
            userAnswer: { ...userAnswer },
            correctAnswer: this.getCorrectAnswer(),
            isCorrect: result.isCorrect,
            timeSpent: timeSpent
        };

        window.dataManager.addHistory(historyData);

        // 触发答案检查事件
        if (this.onAnswerChecked) {
            this.onAnswerChecked(result, historyData);
        }

        return result;
    }

    /**
     * 评估答案
     * @param {Object} userAnswer - 用户答案
     */
    evaluateAnswer(userAnswer) {
        // 根据出题类型确定需要检查的字段和总分
        let fieldsToCheck = [];
        let maxScore = 3;

        switch (this.currentQuizType) {
            case 'japanese':
                // 题目显示日语，只检查假名和中文
                fieldsToCheck = ['kana', 'chinese'];
                maxScore = 2;
                break;
            case 'kana':
                // 题目显示假名，只检查日语和中文
                fieldsToCheck = ['japanese', 'chinese'];
                maxScore = 2;
                break;
            case 'chinese':
                // 题目显示中文，只检查日语和假名
                fieldsToCheck = ['japanese', 'kana'];
                maxScore = 2;
                break;
            case 'audio':
                // 音频题，检查所有三项
                fieldsToCheck = ['japanese', 'kana', 'chinese'];
                maxScore = 3;
                break;
        }

        const result = {
            isCorrect: true,
            details: {
                japanese: { correct: true, expected: this.currentWord.japanese, actual: userAnswer.japanese, checked: fieldsToCheck.includes('japanese') },
                kana: { correct: true, expected: this.currentWord.kana, actual: userAnswer.kana, checked: fieldsToCheck.includes('kana') },
                chinese: { correct: true, expected: this.currentWord.chinese, actual: userAnswer.chinese, checked: fieldsToCheck.includes('chinese') }
            },
            score: 0,
            maxScore: maxScore
        };

        // 检查需要验证的字段
        fieldsToCheck.forEach(field => {
            result.details[field].correct = this.compareStrings(userAnswer[field], this.currentWord[field]);
        });

        // 计算总分
        let score = 0;
        fieldsToCheck.forEach(field => {
            if (result.details[field].correct) score++;
        });

        result.score = score;
        result.isCorrect = score === maxScore;

        return result;
    }

    /**
     * 比较字符串（支持宽松匹配）
     * @param {string} actual - 实际答案
     * @param {string} expected - 期望答案
     */
    compareStrings(actual, expected) {
        if (!actual || !expected) {
            return false;
        }

        // 去除空格并转换为小写进行比较
        const normalizeString = (str) => {
            return str.trim().toLowerCase().replace(/\s+/g, '');
        };

        return normalizeString(actual) === normalizeString(expected);
    }

    /**
     * 获取正确答案
     */
    getCorrectAnswer() {
        if (!this.currentWord) {
            return null;
        }

        return {
            japanese: this.currentWord.japanese,
            kana: this.currentWord.kana,
            chinese: this.currentWord.chinese
        };
    }

    /**
     * 跳过当前题目
     */
    skipCard() {
        if (!this.isGameActive) {
            throw new Error('游戏未开始');
        }

        // 保存跳过记录
        if (this.currentWord && this.currentQuizType) {
            const historyData = {
                wordId: this.currentWord.id,
                word: { ...this.currentWord },
                quizType: this.currentQuizType,
                userAnswer: { japanese: '', kana: '', chinese: '' },
                correctAnswer: this.getCorrectAnswer(),
                isCorrect: false,
                timeSpent: this.startTime ? Date.now() - this.startTime : 0
            };

            window.dataManager.addHistory(historyData);
        }

        // 清除当前题目
        this.currentWord = null;
        this.currentQuizType = null;
        this.startTime = null;

        // 如果是自动模式，继续下一题
        if (this.gameMode === 'auto' && this.autoIndex < this.autoQueue.length) {
            this.autoIndex++;
            this.scheduleNextAutoCard();
        }
    }

    /**
     * 开始自动模式
     */
    startAutoMode() {
        const words = window.dataManager.getAllWords();
        if (words.length === 0) {
            throw new Error('没有可用的单词');
        }

        // 生成题目队列
        this.autoQueue = window.dataManager.getRandomWords(this.autoSettings.cardCount);
        this.autoIndex = 0;

        // 开始第一题
        this.nextAutoCard();
    }

    /**
     * 自动模式的下一题
     */
    nextAutoCard() {
        if (this.autoIndex >= this.autoQueue.length) {
            // 自动模式结束
            this.stopGame();
            return;
        }

        // 抽取当前题目的卡片
        const word = this.autoQueue[this.autoIndex];
        this.currentWord = word;
        this.currentQuizType = this.getRandomQuizType();
        this.startTime = Date.now();

        // 触发卡片抽取事件
        if (this.onCardDrawn) {
            this.onCardDrawn(this.currentWord, this.currentQuizType);
        }

        // 触发进度事件
        if (this.onAutoProgress) {
            this.onAutoProgress(this.autoIndex + 1, this.autoQueue.length);
        }

        // 播放音频（如果设置自动播放）
        const settings = window.dataManager.getSettings();
        if (settings.autoPlayAudio && this.currentQuizType === 'audio') {
            window.audioPlayer.playWordAudio(this.currentWord).catch(error => {
                console.error('自动播放音频失败:', error);
            });
        }

        // 自动跳转到下一题
        this.scheduleNextAutoCard();
    }

    /**
     * 安排下一张自动卡片
     */
    scheduleNextAutoCard() {
        if (this.autoTimer) {
            clearTimeout(this.autoTimer);
        }

        this.autoTimer = setTimeout(() => {
            if (this.isGameActive && this.gameMode === 'auto') {
                // 自动提交答案（如果用户没有手动提交）
                if (this.currentWord && this.currentQuizType) {
                    const userAnswer = this.getUserInput();
                    if (userAnswer) {
                        this.checkAnswer(userAnswer);
                    } else {
                        this.skipCard();
                    }
                }

                // 进入下一题
                this.autoIndex++;
                this.nextAutoCard();
            }
        }, this.autoSettings.interval);
    }

    /**
     * 获取用户输入（需要在UI中实现）
     */
    getUserInput() {
        // 这个方法需要在主应用中实现，因为需要访问DOM元素
        if (window.app && window.app.getUserInput) {
            return window.app.getUserInput();
        }
        return null;
    }

    /**
     * 手动提交答案（自动模式中使用）
     */
    submitAnswerInAutoMode(userAnswer) {
        if (this.gameMode !== 'auto' || !this.isGameActive) {
            return;
        }

        // 取消自动计时器
        if (this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
        }

        // 检查答案
        this.checkAnswer(userAnswer);

        // 手动进入下一题
        this.autoIndex++;
        this.nextAutoCard();
    }

    /**
     * 获取当前游戏状态
     */
    getGameState() {
        return {
            isGameActive: this.isGameActive,
            gameMode: this.gameMode,
            currentWord: this.currentWord,
            currentQuizType: this.currentQuizType,
            autoProgress: this.gameMode === 'auto' ? {
                current: this.autoIndex + 1,
                total: this.autoQueue.length
            } : null
        };
    }

    /**
     * 设置游戏配置
     */
    setAutoSettings(settings) {
        this.autoSettings = { ...this.autoSettings, ...settings };
    }

    /**
     * 获取游戏统计信息
     */
    getGameStatistics() {
        const history = window.dataManager.getHistory();
        const stats = window.dataManager.getStatistics();

        // 按出题类型分组统计
        const typeStats = {};
        this.quizTypes.forEach(type => {
            const typeHistory = history.filter(h => h.quizType === type);
            const typeCorrect = typeHistory.filter(h => h.isCorrect);
            typeStats[type] = {
                total: typeHistory.length,
                correct: typeCorrect.length,
                accuracy: typeHistory.length > 0 ? Math.round((typeCorrect.length / typeHistory.length) * 100) : 0
            };
        });

        return {
            ...stats,
            typeStats,
            recentGames: history.slice(0, 10)
        };
    }

    /**
     * 重置游戏
     */
    reset() {
        this.stopGame();
        this.autoSettings = {
            cardCount: 5,
            interval: 3000
        };
    }

    // 事件回调设置方法
    setOnCardDrawn(callback) {
        this.onCardDrawn = callback;
    }

    setOnAnswerChecked(callback) {
        this.onAnswerChecked = callback;
    }

    setOnGameStarted(callback) {
        this.onGameStarted = callback;
    }

    setOnGameStopped(callback) {
        this.onGameStopped = callback;
    }

    setOnAutoProgress(callback) {
        this.onAutoProgress = callback;
    }
}

// 创建全局游戏逻辑实例
window.gameLogic = new GameLogic();