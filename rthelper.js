/**
 * Roosterteeth helper.
 * Kind of like Reddit Enhancement Suite but shittier.
 *
 *
 * @author Sam Tubbax <roosterteeth@samtubbax.be>
 */
var jsRTHelper = {
    origtabbedPage: '',

    showSeenVideos: function () {
        // set up watch timer
        if($("#socialVideo").length > 0)
        {
            var videoId = $("#socialVideo").data("id");
            // check if I've seen this
            if(localStorage['RT_VIDEO_' + videoId])
            {

            }
            else
            {
                setTimeout(jsRTHelper.watchedVideo, 20000);
            }
        }

        var checkImage = chrome.extension.getURL("images/seen.png");
        $('.videoChooseA').each(function () {
            // get classname Chunks
            var classNameChunks = $(this).attr('class').split(/\s+/);

            // get the video ID from the second classname
            var videoId = classNameChunks[1].substr(11);

            // check local storage
            if(localStorage['RT_VIDEO_' + videoId])
            {
                $(this).css('position', 'relative');
                $(this).append('<img style="position:absolute;top:58px;right:11px;" src="' + checkImage + '" />');
            }
        });
    },

    init: function (e) {
        // @todo Removing "Seen" from videos in case it's wrong
        // @todo Achievements
        // @todo manually add videos

        window.onpopstate = function (event) {
            jsRTHelper.showSeenVideos();
        }
    },

    watchedVideo: function () {
        var videoId = $("#socialVideo").data("id");
        localStorage['RT_VIDEO_' + videoId] = true;
    }
}
$(jsRTHelper.init);