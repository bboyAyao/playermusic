$(function () {
    //自定义滚动条
    $('.content_list').mCustomScrollbar();

    var $audio = $("audio");
    var player = new Player($audio);
    var progress;
    var voice;
    var lyric;
    var preIndex;
    var lineH = 0;
    var newTimelist;


    //加载歌曲列表
    getPlayerList();
    function getPlayerList() {
        $.ajax({
            url: "./source/musiclist.json",
            dataType: "json",
            success: function (data) {
                player.musicList = data;
                //遍历获取到的数据
                var $musiclist = $(".content_list ul");
                $.each(data, function (index, ele) {
                    var $item = crateMusicItem(index, ele);
                    $musiclist.append($item)
                });
                initMusicInfo(data[0]);
                initMusicLyric(data[0]);
            },
            error: function (e) {
                console.log(e)
            }
        });
    }

    //初始化歌曲信息
    function initMusicInfo(music) {
        var $musicImage = $(".song_info_pic img");
        var $musicName = $(".song_info_name a");
        var $musicSinger = $(".song_info_singer a");
        var $musicAblum = $(".song_info_ablum a");
        var $musicProgressName = $(".music_progress_name");
        var $musicProgressTime = $(".music_progress_time");
        var $musicBg = $(".mask_bg");

        $musicImage.attr("src", music.cover);
        $musicName.text(music.name);
        $musicSinger.text(music.singer);
        $musicAblum.text(music.album);
        $musicProgressName.text(music.name + "/" + music.singer);
        $musicProgressTime.text("00:00 /" + music.time);
        $musicBg.css("background", "url('" + music.cover + "')")
    }

    //初始化歌词信息
    function initMusicLyric(music) {
        lyric = new Lyric(music.link_lrc);
        var $lyricContainer = $(".song_lyric");
        $lyricContainer.css({
            'marginTop': 0
        });
        $lyricContainer.html("");
        lyric.loadLyric(function () {
            $.each(lyric.lyrics, function (index, ele) {
                var $item = '<li>' + ele + '</li>';
                $lyricContainer.append($item);
            })
        });
    }

    //初始化进度条
    initProgress();

    function initProgress() {
        var $progressBar = $(".music_progress_bar");
        var $progressLine = $(".music_progress_line");
        var $progressDot = $(".music_progress_dot");

        progress = new Progress($progressBar, $progressLine, $progressDot);
        progress.progressClick(function (value) {
            newTimelist = player.musicSeekTo(value);
            //时差
        });
        progress.progressMove(function (value) {
            newTimelist = player.musicSeekTo(value);
            //时差
        });


        var $voiceBar = $(".music_voice_bar");
        var $voiceLine = $(".music_voice_line");
        var $voiceDot = $(".music_voice_dot");

        voice = new Progress($voiceBar, $voiceLine, $voiceDot);
        voice.progressClick(function (value) {
            player.musicVoiceSeekTo(value);
        });
        voice.progressMove(function (value) {
            player.musicVoiceSeekTo(value);
        });

    }

    //初始化事件监听
    initEvents();

    function initEvents() {
        //监听歌曲移入移出事件
        $('.content_list').delegate(".list_music", "mouseenter", function () {
            $(this).find('.list_time span').stop().fadeOut(1);
            $(this).find('.list_menu').stop().fadeIn(100);
            $(this).find('.list_time a').stop().fadeIn(1);
        });
        $('.content_list').delegate(".list_music", "mouseleave", function () {
            $(this).find('.list_menu').stop().fadeOut(100);
            $(this).find('.list_time a').stop().fadeOut(1);
            $(this).find('.list_time span').stop().fadeIn(1);
        });
        // 监听复选框的点击事件
        // $('.content_list').delegate(".list_check", "click", function () {
        //     $(this).toggleClass('list_checked');
        // });
        //添加子菜单播放按钮的监听
        var $musicPlay = $(".music_play");
        $('.content_list').delegate(".list_menu_play", "click", function () {
            var $item = $(this).parents(".list_music");
            //切换播放图标
            $(this).toggleClass("list_menu_play2");
            //复原其他播放图标
            $(this).parents(".list_music").siblings().find(".list_menu_play").removeClass("list_menu_play2");
            //同步底部播放按钮
            if ($(this).attr("class").indexOf("list_menu_play2") !== -1) {
                $musicPlay.addClass("music_play2");
                $item.find("div").css("color", "#fff");
                $item.siblings().find("div").css("color", "rgba(255,255,255,0.5)");
            } else {
                $musicPlay.removeClass("music_play2");
                $(this).parents(".list_music").find("div").css("color", "rgba(255,255,255,0.5)");
            }
            //切换序号的状态
            $item.find(".list_number").toggleClass("list_number2");
            $item.siblings().find(".list_number").removeClass("list_number2");

            //播放音乐
            player.playMusic($item.get(0).index, $item.get(0).music);
            //切换歌曲对应信息
            initMusicInfo($item.get(0).music);

            //切换歌词对应信息,这里做个判断，如果是同一首歌，不用初始化使歌词重新加载
            if (!player.isSame) {
                preIndex = -1;
                lineH = 0;
                initMusicLyric($item.get(0).music)
            }

        });

        //监听底部区域播放按钮的点击
        $musicPlay.click(function () {
            if (player.currentIndex == -1) {
                $(".list_music").eq(0).find(".list_menu_play").trigger('click');
            } else {
                $(".list_music").eq(player.currentIndex).find(".list_menu_play").trigger("click");
            }
        });

        //监听底部区域上一首按钮的点击
        $(".music_pre").click(function () {
            $(".list_music").eq(player.preIndex()).find(".list_menu_play").trigger("click");
        });

        //监听底部区域下一首按钮的点击
        $(".music_next").click(function () {
            $(".list_music").eq(player.nextIndex()).find(".list_menu_play").trigger("click");
        });

        //监听删除按钮的点击
        $(".content_list").delegate(".list_menu_del", "click", function () {
            //找到被点击的音乐
            var $item = $(this).parents(".list_music");

            //判断当前删除的是否是正在播放的
            if ($item.get(0).index == player.currentIndex) {
                $(".music_next").trigger("click");
            }
            $item.remove();
            player.changeMusic($item.get(0).index);

            //重新排序
            $(".list_music").each(function (index, ele) {
                ele.index = index;
                $(ele).find(".list_number").text(index + 1)
            })
        });

        //监听播放的进度
        player.musicTimeUpdate(function (duration, currentTime, timeStr) {
            //同步时间
            $(".music_progress_time").text(timeStr);
            //同步进度条
            //计算播放比例
            var value = currentTime / duration * 100;
            progress.setProgress(value);

            //处理时差
            // lyric.dealTimeDiff(newTimelist)

            //实现歌词同步
            var index = lyric.currentIndex(currentTime);
            var $item = $('.song_lyric li').eq(index);
            $item.addClass('cur');
            $item.siblings().removeClass('cur');
            var itemH = $item.height();

            if (index != preIndex) {
                lineH = -itemH + lineH;
                preIndex = index;
                if (index <= 1) return;
                $('.song_lyric').css({
                    'marginTop': lineH + $('.song_lyric li').eq(index - 1).height() + itemH
                });
            }

            //歌曲自动播放结束继续播放下一首
            if (currentTime >= duration) {
                $(".music_next").trigger('click')
            }

        });

        //监听声音按钮的点击
        $(".music_voice_icon").click(function () {
            $(this).toggleClass("music_voice_icon2");
            //声音切换
            if ($(this).attr("class").indexOf("music_voice_icon2") != -1) {
                //变为没有声音
                player.musicVoiceSeekTo(0);
            } else {
                //变为有声音
                $('.music_voice_dot').trigger('click');
            }
        });

        //监听选择框按钮的点击
        $(".list_title .list_check").click(function () {

            if ($(".list_title .list_check").hasClass('list_checked')) {
                $(".list_check").removeClass('list_checked');
            } else {
                $(".list_check").addClass('list_checked');
            }
        });

        $(".content_list").delegate('.list_music .list_check', 'click', function () {
            $(this).toggleClass('list_checked');
            var flag = false;
            $.each($(".list_music .list_check"), function (index, ele) {
                if (ele.className.indexOf('list_checked') == -1) {
                    flag = true;
                    $(".list_title .list_check").removeClass('list_checked');
                    return true;
                }
            });
            if (!flag) {
                $(".list_title .list_check").addClass('list_checked');
            }
        });

        //监听删除多个音乐的按钮点击
        $('.bar_del').click(function () {
            $.each($(".list_music .list_check"), function (index, ele) {
                if (ele.className.indexOf('list_checked') != -1) {
                    $(ele).parents('.list_music').find('.list_menu_del').trigger('click');
                }
            });
        })
    }

    //定义一个方法创建一条音乐
    function crateMusicItem(index, music) {
        var $item = $("<li class=\"list_music\">\n" +
            "                        <div class=\"list_check\"><i></i></div>\n" +
            "                        <div class=\"list_number\">" + (index + 1) + "." + "</div>\n" +
            "                        <div class=\"list_name\">" + music.name + "\n" +
            "                            <div class=\"list_menu\">\n" +
            "                                <a href=\"javascript:;\" title=\"播放\" class=\"list_menu_play\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"添加\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"下载\"></a>\n" +
            "                                <a href=\"javascript:;\" title=\"分享\"></a>\n" +
            "                            </div></div>\n" +
            "                        <div class=\"list_singer\">" + music.singer + "</div>\n" +
            "                        <div class=\"list_time\">\n" +
            "                            <span>" + music.time + "</span>\n" +
            "                            <a href=\"javascript:;\" title=\"删除\" class='list_menu_del'></a>\n" +
            "                        </div>\n" +
            "                    </li>");

        $item.get(0).index = index;
        $item.get(0).music = music;

        return $item;
    }

});