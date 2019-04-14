(function (window) {
    function Lyric(path) {
        return new Lyric.prototype.init(path);
    }

    Lyric.prototype = {
        constructor: Lyric,
        init: function (path) {
            this.path = path;
        },
        times : [],
        lyrics : [],
        index : 0,
        loadLyric: function (callback) {
            var $this = this;
            $.ajax({
                url: $this.path,
                dataType: "text",
                success: function (data) {
                    $this.parseLyric(data);
                    callback()
                },
                error: function (e) {
                    console.log(e)
                }
            });
        },
        parseLyric :function (data) {
            this.times = [];
            this.lyrics = [];
            this.index = 0;
            var $this = this;
            var array = data.split("\r");
            var timeReg = /\[(\d*:\d*\.\d*)\]/;
            //遍历取出每一行歌词
            $.each(array, function (index, ele) {
                //排除空字符串（没有歌词）
                var lrc = ele.split("]")[1];
                if (lrc.length == 0) return true;
                var res = timeReg.exec(ele);
                if (res == null) return true;
                var timeStr = res[1];
                var res2 = timeStr.split(":");
                var min = parseInt(res2[0]) * 60;
                var sec = parseFloat(res2[1]);
                var time = parseFloat(Number(min+sec).toFixed(2));
                $this.times.push(time);
                $this.lyrics.push(lrc);

            });
        },
        currentIndex: function (currentTime) {
            if (currentTime >= this.times[this.index]){
                this.index ++;
            }
            // if (currentTime>=this.times[0]) {
            //     console.log(this.index);
            //     this.index ++;
            //     this.times.shift(); //删除数组第一个元素
            // }
            return  this.index == 0 ? -1:this.index-1;
        },
        dealTimeDiff: function (timelist) {
            // console.log(timelist+' ly')
        }
    }
    Lyric.prototype.init.prototype = Lyric.prototype;
    window.Lyric = Lyric;
})(window);
