/**
 * 音频播放模块
 * 负责音频文件的播放、暂停、音量控制等功能
 */
class AudioPlayer {
    constructor() {
        this.audioElement = null;
        this.currentAudioUrl = null;
        this.isPlaying = false;
        this.volume = 0.8;
        this.onPlayCallback = null;
        this.onEndedCallback = null;
        this.onErrorCallback = null;

        this.initialize();
    }

    /**
     * 初始化音频播放器
     */
    initialize() {
        this.audioElement = document.getElementById('audio-player');

        if (!this.audioElement) {
            console.error('音频元素未找到');
            return;
        }

        // 设置音频事件监听器
        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            if (this.onPlayCallback) {
                this.onPlayCallback();
            }
        });

        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
        });

        this.audioElement.addEventListener('ended', () => {
            this.isPlaying = false;
            if (this.onEndedCallback) {
                this.onEndedCallback();
            }
        });

        this.audioElement.addEventListener('error', (e) => {
            console.error('音频播放错误:', e);
            this.isPlaying = false;
            if (this.onErrorCallback) {
                this.onErrorCallback(e);
            }
        });

        // 设置默认音量
        this.audioElement.volume = this.volume;
    }

    /**
     * 播放音频
     * @param {string} audioUrl - 音频文件URL
     * @param {Object} options - 播放选项
     */
    async play(audioUrl, options = {}) {
        if (!audioUrl) {
            throw new Error('音频URL不能为空');
        }

        try {
            // 如果有正在播放的音频，先停止
            if (this.isPlaying && !this.currentAudioUrl) {
                this.stop();
            }

            // 如果是新的音频文件，加载它
            if (audioUrl !== this.currentAudioUrl) {
                this.audioElement.src = audioUrl;
                this.currentAudioUrl = audioUrl;

                // 等待音频加载完成
                await this.waitForLoad();
            }

            // 设置播放选项
            if (options.volume !== undefined) {
                this.setVolume(options.volume);
            }

            if (options.startTime !== undefined) {
                this.audioElement.currentTime = options.startTime;
            }

            // 播放音频
            await this.audioElement.play();

            return Promise.resolve();

        } catch (error) {
            console.error('音频播放失败:', error);
            throw error;
        }
    }

    /**
     * 暂停音频
     */
    pause() {
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
        }
    }

    /**
     * 停止音频
     */
    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
        }
    }

    /**
     * 重新播放
     */
    replay() {
        if (this.audioElement && this.currentAudioUrl) {
            this.audioElement.currentTime = 0;
            this.audioElement.play();
        }
    }

    /**
     * 等待音频加载完成
     */
    waitForLoad() {
        return new Promise((resolve, reject) => {
            if (this.audioElement.readyState >= 2) {
                resolve();
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error('音频加载超时'));
            }, 10000);

            const onLoad = () => {
                clearTimeout(timeout);
                this.audioElement.removeEventListener('canplay', onLoad);
                this.audioElement.removeEventListener('error', onError);
                resolve();
            };

            const onError = () => {
                clearTimeout(timeout);
                this.audioElement.removeEventListener('canplay', onLoad);
                this.audioElement.removeEventListener('error', onError);
                reject(new Error('音频加载失败'));
            };

            this.audioElement.addEventListener('canplay', onLoad);
            this.audioElement.addEventListener('error', onError);
        });
    }

    /**
     * 设置音量
     * @param {number} volume - 音量值 (0.0 - 1.0)
     */
    setVolume(volume) {
        if (volume < 0) volume = 0;
        if (volume > 1) volume = 1;

        this.volume = volume;
        if (this.audioElement) {
            this.audioElement.volume = volume;
        }
    }

    /**
     * 获取当前音量
     */
    getVolume() {
        return this.volume;
    }

    /**
     * 设置播放速度
     * @param {number} speed - 播放速度 (0.5 - 2.0)
     */
    setPlaybackRate(speed) {
        if (speed < 0.5) speed = 0.5;
        if (speed > 2.0) speed = 2.0;

        if (this.audioElement) {
            this.audioElement.playbackRate = speed;
        }
    }

    /**
     * 获取当前播放状态
     */
    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    /**
     * 获取当前播放时间
     */
    getCurrentTime() {
        return this.audioElement ? this.audioElement.currentTime : 0;
    }

    /**
     * 获取音频总时长
     */
    getDuration() {
        return this.audioElement ? this.audioElement.duration : 0;
    }

    /**
     * 跳转到指定时间
     * @param {number} time - 时间（秒）
     */
    seekTo(time) {
        if (this.audioElement && this.audioElement.duration) {
            this.audioElement.currentTime = Math.max(0, Math.min(time, this.audioElement.duration));
        }
    }

    /**
     * 设置播放事件回调
     */
    setOnPlayCallback(callback) {
        this.onPlayCallback = callback;
    }

    /**
     * 设置播放结束事件回调
     */
    setOnEndedCallback(callback) {
        this.onEndedCallback = callback;
    }

    /**
     * 设置播放错误事件回调
     */
    setOnErrorCallback(callback) {
        this.onErrorCallback = callback;
    }

    /**
     * 播放单词音频
     * @param {Object} word - 单词对象
     * @param {Object} options - 播放选项
     */
    async playWordAudio(word, options = {}) {
        if (!word || !word.audio) {
            throw new Error('单词没有音频文件');
        }

        const audioUrl = window.dataManager.getAudioUrl(word.audio);

        if (!audioUrl) {
            throw new Error('无法获取音频URL');
        }

        try {
            await this.play(audioUrl, options);
        } catch (error) {
            console.error('播放单词音频失败:', error);
            throw error;
        }
    }

    /**
     * 录制音频（如果需要的话）
     * 这个功能为未来的扩展预留
     */
    startRecording() {
        return new Promise((resolve, reject) => {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('浏览器不支持音频录制'));
                return;
            }

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    // 这里可以实现音频录制功能
                    console.log('音频录制功能待实现');
                    resolve(stream);
                })
                .catch(error => {
                    console.error('无法访问麦克风:', error);
                    reject(error);
                });
        });
    }

    /**
     * 停止录制
     */
    stopRecording(stream) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    /**
     * 创建音频可视化效果（可选）
     */
    createVisualizer() {
        if (!this.audioElement || !window.AudioContext) {
            return null;
        }

        try {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaElementSource(this.audioElement);

            source.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 256;

            return analyser;
        } catch (error) {
            console.error('创建音频可视化失败:', error);
            return null;
        }
    }

    /**
     * 获取音频频率数据
     */
    getFrequencyData(analyser) {
        if (!analyser) {
            return null;
        }

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        return dataArray;
    }

    /**
     * 清理资源
     */
    destroy() {
        this.stop();
        this.currentAudioUrl = null;
        this.onPlayCallback = null;
        this.onEndedCallback = null;
        this.onErrorCallback = null;

        if (this.audioElement) {
            this.audioElement.src = '';
            this.audioElement = null;
        }
    }
}

// 创建全局音频播放器实例
window.audioPlayer = new AudioPlayer();