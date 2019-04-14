(function (window) {
    function Progress($progressBar, $progressLine, $progressDot) {
        return new Progress.prototype.init($progressBar, $progressLine, $progressDot);
    }

    Progress.prototype = {
        constructor: Progress,
        init: function ($progressBar, $progressLine, $progressDot) {
            this.$progressBar = $progressBar;
            this.$progressLine = $progressLine;
            this.$progressDot = $progressDot
        },
        isMove: false,
        progressClick: function (callback) {
            var $this = this;
            this.$progressBar.click(function (event) {
                //获取背景距离窗口默认的位置
                var normalLeft = $(this).offset().left;
                //获取点击的位置距离窗口的位置
                var eventLeft = event.pageX;
                //设置前景的宽度
                $this.$progressLine.css("width", eventLeft - normalLeft);
                $this.$progressDot.css("left", eventLeft - normalLeft - $this.$progressDot.width()/2);
                //计算进度条的比例
                var value = (eventLeft - normalLeft) / $(this).width();

                //解决trigger触发click事件没有pageX的bug
                if (eventLeft == undefined){
                    var left = $this.$progressDot.offset().left-$this.$progressDot.width()/2;
                    value = (left-normalLeft) / $(this).width()
                }
                callback(value);
            });
        },
        progressMove: function (callback) {
            var $this = this;

            //获取背景距离窗口默认的位置
            var normalLeft = this.$progressBar.offset().left;
            var barWidth = this.$progressBar.width();
            var eventLeft;
            var offset;

            //监听鼠标按下事件
            this.$progressBar.mousedown(function () {
                //监听鼠标的移动事件
                $(document).mousemove(function (event) {
                    eventLeft = event.pageX;
                    offset = eventLeft - normalLeft;
                    //获取点击的位置距离窗口的位置
                    $this.isMove = true;
                    if (offset <0 ){
                        offset = 0
                    }else if (offset>barWidth){
                        offset = barWidth
                    }
                         //设置前景的宽度
                    $this.$progressLine.css("width", offset);
                    $this.$progressDot.css("left", offset - $this.$progressDot.width()/2);
                });

                //监听鼠标的抬起事件
                $(document).mouseup(function () {
                    $this.isMove = false;
                    //计算进度条的比例
                    var value = offset / $this.$progressBar.width();
                    $(document).off("mousemove");
                    callback(value);
                    //需要解绑鼠标抬起事件，否则会出现点击暂停键进度条和音乐回退现象
                    $(document).off("mouseup")
                });
            });
        },
        setProgress: function (value) {
            if (this.isMove) return;
            if (value < 0 ){
                value = 0
            }else if (value>100){
                value = 100
            }
            this.$progressLine.css({
                width: value + "%"
            });
            this.$progressDot.css({
                left: value + "%"
            });
        }
    };
    Progress.prototype.init.prototype = Progress.prototype;
    window.Progress = Progress;
})(window);
