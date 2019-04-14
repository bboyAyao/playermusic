(function (window) {
    function Player($audio) {
        return new Player.prototype.init($audio);
    }

    Player.prototype = {
        constructor: Player,
        musicList: [],
        isSame: false,
        init: function ($audio) {
            this.$audio = $audio;
            this.audio = $audio.get(0);
        },
        timeDiff: [],
        currentIndex: -1,
        playMusic: function (index, music) {
            //判断是否同一个音乐
            if (this.currentIndex == index) {
                this.isSame = true;
                //是同一首
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
            } else {
                this.isSame = false;
                //不是同一首
                this.$audio.attr("src", music.link_url);
                this.audio.play();
                this.currentIndex = index;
            }
        },
        preIndex: function () {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = this.musicList.length - 1;
            }
            return index;
        },
        nextIndex: function () {
            var index = this.currentIndex + 1;
            if (index > this.musicList.length - 1) {
                index = 0;
            }
            return index;
        },
        changeMusic: function (index) {
            //删除对应的数据
            this.musicList.splice(index, 1);

            //判断当前删除的是否正在播放音乐的前面的音乐,解决下一首跳歌bug
            if (index < this.currentIndex) {
                this.currentIndex = this.currentIndex - 1;
            }

        },
        musicTimeUpdate: function (callback) {
            var $this = this;
            this.$audio.on("timeupdate", function () {
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime, duration);
                callback(duration,currentTime,timeStr);
            })
        },
        formatDate: function (currentTime, duration) {
            var endMin = parseInt(duration / 60);
            var endSec = parseInt(duration % 60);
            if (endMin < 10) {
                endMin = "0" + endMin;
            }
            if (endSec < 10) {
                endSec = "0" + endSec;
            }
            var startMin = parseInt(currentTime / 60);
            var startSec = parseInt(currentTime % 60);
            if (startMin < 10) {
                startMin = "0" + startMin;
            }
            if (startSec < 10) {
                startSec = "0" + startSec;
            }

            return startMin + ":" + startSec + " / " + endMin + ":" + endSec;
        },
        musicSeekTo: function (value) {

            if (isNaN(value)) return;
            var oldCur = this.audio.currentTime;
            var newCur = this.audio.duration * value;
            this.audio.currentTime = newCur;
            if (oldCur != newCur && Math.abs(oldCur - newCur)>20){
                return [oldCur, newCur, Math.abs(oldCur - newCur)]
            }
        },
        musicVoiceSeekTo: function (value) {
            if (isNaN(value)) return;
            if (value < 0 || value > 1) return;
            // 0~1
            this.audio.volume = value;
        },
        musicLyricSeekTo: function (oldCur,newCur,newAbr) {
            return [oldCur,newCur,newAbr]
        }
    };
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);
