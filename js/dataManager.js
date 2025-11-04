/**
 * 数据管理模块
 * 负责单词数据和历史记录的存储、读取、导入导出等功能
 */
class DataManager {
    constructor() {
        this.words = [];
        this.history = [];
        this.settings = {
            theme: 'light',
            autoPlayAudio: true,
            showHints: true,
            defaultCardType: 'random',
            // 卡片显示设置
            enableJapaneseDisplay: true,
            enableKanaDisplay: true,
            enableChineseDisplay: true,
            enableAudioDisplay: true
        };

        this.initializeData();
    }

    /**
     * 初始化数据
     */
    initializeData() {
        // 从本地存储加载数据
        this.loadFromStorage();

        // 如果没有数据，添加示例单词
        if (this.words.length === 0) {
            this.addSampleWords();
        }
    }

    /**
     * 添加示例单词
     */
    addSampleWords() {
        const sampleWords = [
            {
                id: Date.now() + 1,
                japanese: '本',
                kana: 'ほん',
                chinese: '书',
                audio: null
            },
            {
                id: Date.now() + 2,
                japanese: '学生',
                kana: 'がくせい',
                chinese: '学生',
                audio: null
            },
            {
                id: Date.now() + 3,
                japanese: '先生',
                kana: 'せんせい',
                chinese: '老师',
                audio: null
            },
            {
                id: Date.now() + 4,
                japanese: '学校',
                kana: 'がっこう',
                chinese: '学校',
                audio: null
            },
            {
                id: Date.now() + 5,
                japanese: '友達',
                kana: 'ともだち',
                chinese: '朋友',
                audio: null
            }
        ];

        this.words = sampleWords;
        this.saveToStorage();
    }

    /**
     * 从本地存储加载数据
     */
    loadFromStorage() {
        try {
            const savedWords = localStorage.getItem('japanese_words');
            const savedHistory = localStorage.getItem('japanese_history');
            const savedSettings = localStorage.getItem('japanese_settings');

            if (savedWords) {
                this.words = JSON.parse(savedWords);
            }

            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }

            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }

    /**
     * 保存数据到本地存储
     */
    saveToStorage() {
        try {
            localStorage.setItem('japanese_words', JSON.stringify(this.words));
            localStorage.setItem('japanese_history', JSON.stringify(this.history));
            localStorage.setItem('japanese_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    /**
     * 添加新单词
     */
    addWord(wordData) {
        const newWord = {
            id: Date.now(),
            japanese: wordData.japanese || '',
            kana: wordData.kana || '',
            chinese: wordData.chinese || '',
            audio: wordData.audio || null
        };

        // 验证数据
        if (!newWord.japanese || !newWord.kana || !newWord.chinese) {
            throw new Error('日本語、仮名、中文はすべて必須です');
        }

        this.words.push(newWord);
        this.saveToStorage();
        return newWord;
    }

    /**
     * 更新单词
     */
    updateWord(id, wordData) {
        const index = this.words.findIndex(word => word.id === id);
        if (index === -1) {
            throw new Error('単語が見つかりません');
        }

        this.words[index] = { ...this.words[index], ...wordData };
        this.saveToStorage();
        return this.words[index];
    }

    /**
     * 删除单词
     */
    deleteWord(id) {
        const index = this.words.findIndex(word => word.id === id);
        if (index === -1) {
            throw new Error('単語が見つかりません');
        }

        this.words.splice(index, 1);
        this.saveToStorage();
        return true;
    }

    /**
     * 获取所有单词
     */
    getAllWords() {
        return this.words;
    }

    /**
     * 根据ID获取单词
     */
    getWordById(id) {
        return this.words.find(word => word.id === id);
    }

    /**
     * 搜索单词
     */
    searchWords(query) {
        if (!query) {
            return this.words;
        }

        const lowerQuery = query.toLowerCase();
        return this.words.filter(word =>
            word.japanese.toLowerCase().includes(lowerQuery) ||
            word.kana.toLowerCase().includes(lowerQuery) ||
            word.chinese.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * 获取随机单词
     */
    getRandomWord() {
        if (this.words.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.words.length);
        return this.words[randomIndex];
    }

    /**
     * 获取多个随机单词（不重复）
     */
    getRandomWords(count) {
        if (this.words.length === 0) {
            return [];
        }

        if (count >= this.words.length) {
            return [...this.words].sort(() => Math.random() - 0.5);
        }

        const shuffled = [...this.words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * 添加历史记录
     */
    addHistory(historyData) {
        const newRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            wordId: historyData.wordId,
            word: historyData.word,
            quizType: historyData.quizType,
            userAnswer: historyData.userAnswer,
            correctAnswer: historyData.correctAnswer,
            isCorrect: historyData.isCorrect,
            timeSpent: historyData.timeSpent || 0
        };

        this.history.unshift(newRecord);

        // 限制历史记录数量
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }

        this.saveToStorage();
        return newRecord;
    }

    /**
     * 获取历史记录
     */
    getHistory(filters = {}) {
        let filteredHistory = [...this.history];

        // 日期过滤
        if (filters.dateFilter) {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (filters.dateFilter) {
                case 'today':
                    filteredHistory = filteredHistory.filter(record =>
                        new Date(record.timestamp) >= today
                    );
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    filteredHistory = filteredHistory.filter(record =>
                        new Date(record.timestamp) >= weekAgo
                    );
                    break;
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    filteredHistory = filteredHistory.filter(record =>
                        new Date(record.timestamp) >= monthAgo
                    );
                    break;
            }
        }

        return filteredHistory;
    }

    /**
     * 清除历史记录
     */
    clearHistory() {
        this.history = [];
        this.saveToStorage();
        return true;
    }

    /**
     * 获取统计数据
     */
    getStatistics() {
        const total = this.history.length;
        if (total === 0) {
            return {
                totalPractice: 0,
                accuracyRate: 0,
                learnedWords: 0
            };
        }

        const correct = this.history.filter(record => record.isCorrect).length;
        const accuracyRate = Math.round((correct / total) * 100);

        const uniqueWords = new Set(this.history.map(record => record.wordId));
        const learnedWords = uniqueWords.size;

        return {
            totalPractice: total,
            accuracyRate,
            learnedWords
        };
    }

    /**
     * 导出数据
     */
    exportData() {
        const exportData = {
            words: this.words,
            history: this.history,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 导入数据
     */
    importData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);

            // 验证数据格式
            if (!importData.words || !Array.isArray(importData.words)) {
                throw new Error('無効なデータ形式です');
            }

            // 备份当前数据
            const backup = {
                words: [...this.words],
                history: [...this.history],
                settings: { ...this.settings }
            };

            try {
                // 导入单词数据
                if (importData.words && importData.words.length > 0) {
                    this.words = importData.words.map(word => ({
                        id: word.id || Date.now() + Math.random(),
                        japanese: word.japanese || '',
                        kana: word.kana || '',
                        chinese: word.chinese || '',
                        audio: word.audio || null
                    }));
                }

                // 导入历史记录（可选）
                if (importData.history && Array.isArray(importData.history)) {
                    this.history = importData.history;
                }

                // 导入设置（可选）
                if (importData.settings) {
                    this.settings = { ...this.settings, ...importData.settings };
                }

                this.saveToStorage();
                return { success: true };
            } catch (saveError) {
                // 如果保存失败，恢复备份数据
                this.words = backup.words;
                this.history = backup.history;
                this.settings = backup.settings;
                throw saveError;
            }

        } catch (error) {
            console.error('导入数据失败:', error);
            throw new Error('データのインポートに失敗しました: ' + error.message);
        }
    }

    /**
     * 重置所有数据
     */
    resetAll() {
        this.words = [];
        this.history = [];
        this.settings = {
            theme: 'light',
            autoPlayAudio: true,
            showHints: true,
            defaultCardType: 'random',
            // 卡片显示设置
            enableJapaneseDisplay: true,
            enableKanaDisplay: true,
            enableChineseDisplay: true,
            enableAudioDisplay: true
        };

        this.saveToStorage();
        this.addSampleWords();
        return true;
    }

    /**
     * 更新设置
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveToStorage();
        return this.settings;
    }

    /**
     * 获取设置
     */
    getSettings() {
        return this.settings;
    }

    /**
     * 保存音频文件（转换为Base64）
     */
    async saveAudioFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                });
            };
            reader.onerror = () => {
                reject(new Error('音频文件读取失败'));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * 获取音频数据URL
     */
    getAudioUrl(audioData) {
        if (!audioData) {
            return null;
        }

        if (typeof audioData === 'string') {
            return audioData;
        }

        if (audioData.data) {
            return audioData.data;
        }

        return null;
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();