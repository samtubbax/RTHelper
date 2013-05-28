/**
 * Roosterteeth helper.
 * Kind of like Reddit Enhancement Suite but shittier.
 *
 *
 * @author Sam Tubbax <roosterteeth@panoptigraph.com>
 */
var jsRTHelper = {
    videoTimer: null,
    oldLocation: '',

    showSeenVideos: function () {
        $('.seenit').remove();
        clearTimeout(jsRTHelper.videoTimer);

        var checkImage = chrome.extension.getURL("images/seen.png");

        if($("#socialVideo").length > 0)
        {
            var videoId = $("#socialVideo").data("id");
            // check if I've seen this
            if(localStorage['RT_VIDEO_' + videoId] === "true")
            {
                $('.episodeDescription').after('<div class="seenit"><img style="float:none;margin-bottom: 5px;" id="seenitCurrent" src="' + checkImage + '" /><br /><a class="didntSee" href="#" data-video="' + videoId + '">Ehm, No I didn\'t...</a></div>');
                $('.didntSee').on('click', function (e) {
                    e.preventDefault();
                    $('div.seenit').remove();
                    localStorage['RT_VIDEO_' + $(this).data('video')] = false;
                })
            }
            else
            {
                // set up watch timer
                jsRTHelper.videoTimer = setTimeout(jsRTHelper.watchedVideo, 20000);
            }
        }

        $('.videoChooseA').each(function () {
            // get classname Chunks
            var classNameChunks = $(this).attr('class').split(/\s+/);

            // get the video ID from the second classname
            var videoId = classNameChunks[1].substr(11);

            // check local storage
            if(localStorage['RT_VIDEO_' + videoId] === "true")
            {
                $(this).css('position', 'relative');
                $(this).append('<img class="seenit" style="position:absolute;top:58px;right:11px;" src="' + checkImage + '" />');
            }
        });
    },

    init: function (e) {
        // @todo Achievements
        // @todo manually add videos

        jsRTHelper.showSeenVideos();

        jsRTHelper.oldLocation = location.href;
        // check if the URL has changed
        // If anyone in RT webdev is checking this: please use history.pushState for loading episodes. I don't like doing this
        setInterval(function() {
            if(location.href != jsRTHelper.oldLocation) {
                jsRTHelper.oldLocation = location.href
                jsRTHelper.showSeenVideos();
            }
        }, 1000);
    },

    watchedVideo: function () {
        var videoId = $("#socialVideo").data("id");
        localStorage['RT_VIDEO_' + videoId] = true;

        $('.episodeDescription').after('<div class="seenit"><img style="float:none;margin-bottom: 5px;" id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" href="#" data-video="' + videoId + '">Ehm, No I didn\'t...</a></div>');
        $('.didntSee').on('click', function (e) {
            e.preventDefault();
            $('div.seenit').remove();
            localStorage['RT_VIDEO_' + $(this).data('video')] = false;
        })
    }
}
$(jsRTHelper.init);