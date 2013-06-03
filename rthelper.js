/**
 * Roosterteeth helper.
 * Kind of like Reddit Enhancement Suite but shittier.
 *
 *
 * @author Sam Tubbax <roosterteeth@panoptigraph.com>
 */
var jsRTHelper = {
    oldLocation: '',

    init: function (e) {
        // @todo Achievements?
        // @todo manually add videos
        // @todo autoplay

        jsRTHelper.refreshContent();

        jsRTHelper.oldLocation = location.href;
        // check if the URL has changed
        // If anyone in RT webdev is checking this: please use history.pushState for loading episodes. I don't like doing this
        setInterval(function() {
            if(location.href != jsRTHelper.oldLocation) {
                jsRTHelper.oldLocation = location.href;
                jsRTHelper.refreshContent();
            }
        }, 1000);
    },

    refreshContent: function () {
        var pathnameChunks = window.location.pathname.split('/');

        $('.seenit').remove();
        switch(pathnameChunks[1])
        {
            case 'archive':
                jsRTHelper.videos.track();
                jsRTHelper.videos.showSeen();
                break;
            case 'podcast':
                if(pathnameChunks[2] == '') jsRTHelper.podcasts.showSeen();
                if(pathnameChunks[2] == 'episode.php') jsRTHelper.podcasts.track();
                break;
            case 'gamepodcast':
                if(pathnameChunks[2] == '') jsRTHelper.gamepodcasts.showSeen();
                if(pathnameChunks[2] == 'episode.php') jsRTHelper.gamepodcasts.track();
                break;
        }
    },

    /**
     * The bit for tracking podcasts
     *
     */
    podcasts: {
        timer: null,

        track: function () {
            clearTimeout(jsRTHelper.podcasts.timer);

            var podcastId = getURLParameter('id');

            jsRTHelper.podcasts.showNavigation(podcastId);

            // check if I've seen this
            if(localStorage['RT_PODCAST_' + podcastId] === "true")
            {
                jsRTHelper.podcasts.insertIntoCurrent('<div class="seenit"><img id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
                $('.didntSee').on('click', function (e) {
                    e.preventDefault();
                    $('div.seenit').remove();
                    localStorage['RT_PODCAST_' + $(this).data('video')] = false;
                });
            }
            else
            {
                // set up watch timer (Set for 5 minutes)
                jsRTHelper.podcasts.timer = setTimeout(jsRTHelper.podcasts.watched, 300000);
            }
        },

        insertIntoCurrent: function(html)
        {
            if($('.titleLine:contains("WATCH THE VIDEO")').length > 0)
            {
                $('.titleLine:contains("WATCH THE VIDEO")').before(html);
            }
            else
            {
                $('.titleLine:contains("LISTEN")').before(html);
            }
        },

        showNavigation: function (podcastId) {
            // get a list of podcasts

            $.ajax({
                url: 'http://s3.roosterteeth.com/podcasts/index.xml',
                success: function (xml) {
                    $podcastsRSS = $(xml);

                    // they changed the name from Rooster Teeth Podcast to RT podcast at episode 133
                    if(podcastId > 133)
                    {
                        var $currentPodcast = $podcastsRSS.find('item title:contains("RT Podcast #' + podcastId + '"):last').parents('item');
                    }
                    else
                    {
                        var $currentPodcast = $podcastsRSS.find('item title:contains("Rooster Teeth Podcast #' + podcastId + '"):last').parents('item');
                    }

                    var navigationHTML = '<div class="helperNavigation clearfix">';

                    jsRTHelper.test = $podcastsRSS;

                    if($currentPodcast.prev().get(0).nodeName == 'item')
                    {
                        // show next button
                        var nextPodcastLink = $currentPodcast.prev().find('link').text();
                        navigationHTML += '<a id="helperNextButton" href="' + nextPodcastLink + '">Next</a>';
                    }

                    if($currentPodcast.next().length > 0)
                    {
                        // show next button
                        var prevPodcastLink = $currentPodcast.next().find('link').text();
                        navigationHTML += '<a id="helperPreviousButton" href="' + prevPodcastLink + '">Previous</a>';
                    }

                    navigationHTML += '</div>'

                    jsRTHelper.podcasts.insertIntoCurrent(navigationHTML);
                }
            })
        },

        showSeen: function () {
            var checkImage = chrome.extension.getURL("images/check.png");
            $('.topContentBox table[width="100%"]>tbody>tr>td>table:gt(0):not(:last)').each(function () {
                var $podcastLink = $(this).parent();

                // get classname Chunks
                var podcastId = $(this).find('a:eq(0)').attr('href').substr(15);

                console.log(podcastId);
                // check local storage
                if(localStorage['RT_PODCAST_' + podcastId] === "true")
                {
                    $(this).parent().css('position', 'relative');
                    $(this).after('<img class="seenit" src="' + checkImage + '" />');
                }
            });
        },

        watched: function () {
            var podcastId = getURLParameter('id');
            localStorage['RT_PODCAST_' + podcastId] = true;

            if($('.titleLine:contains("WATCH THE VIDEO")').length > 0)
            {
                $('.titleLine:contains("WATCH THE VIDEO")').before('<div class="seenit"><img id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
            }
            else
            {
                $('.titleLine:contains("LISTEN")').before('<div class="seenit"><img id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
            }
            $('.didntSee').on('click', function (e) {
                e.preventDefault();
                $('div.seenit').remove();
                localStorage['RT_PODCAST_' + $(this).data('video')] = false;
            });
        }
    },

    /**
     * The bit for tracking podcasts
     *
     */
    gamepodcasts: {
        timer: null,

        track: function () {
            clearTimeout(jsRTHelper.gamepodcasts.timer);

            var podcastId = getURLParameter('id');

            // check if I've seen this
            if(localStorage['RT_GAMEPODCAST_' + podcastId] === "true")
            {
                if($('.titleLine:contains("WATCH THE VIDEO")').length > 0)
                {
                    $('.titleLine:contains("WATCH THE VIDEO")').before('<div class="seenit"><img style="float:none;margin-bottom: 5px;" id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" style="margin-bottom: 10px;" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
                }
                else
                {
                    $('.titleLine:contains("LISTEN")').before('<div class="seenit"><img style="float:none;margin-bottom: 5px;" id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" style="margin-bottom: 10px;" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
                }
                $('.didntSee').on('click', function (e) {
                    e.preventDefault();
                    $('div.seenit').remove();
                    localStorage['RT_GAMEPODCAST_' + $(this).data('video')] = false;
                });
            }
            else
            {
                // set up watch timer (Set for 5 minutes)
                jsRTHelper.gamepodcasts.timer = setTimeout(jsRTHelper.gamepodcasts.watched, 300000);
            }
        },

        showSeen: function () {
            var checkImage = chrome.extension.getURL("images/check.png");
            console.log('Show seen gamepodcast');
            $('.topContentBox table[width="100%"]>tbody>tr>td>table:gt(0)').each(function () {
                var $podcastLink = $(this).parent();

                // get classname Chunks
                var podcastId = $(this).find('a:eq(0)').attr('href').substr(15);

                console.log(podcastId);
                // check local storage
                if(localStorage['RT_GAMEPODCAST_' + podcastId] === "true")
                {
                    $(this).parent().css('position', 'relative');
                    $(this).after('<img class="seenit" style="position:absolute;top:18px;right:11px;" src="' + checkImage + '" />');
                }
            });
        },

        watched: function () {
            var podcastId = getURLParameter('id');
            localStorage['RT_GAMEPODCAST_' + podcastId] = true;

            if($('.titleLine:contains("WATCH THE VIDEO")').length > 0)
            {
                $('.titleLine:contains("WATCH THE VIDEO")').before('<div class="seenit"><img style="float:none;margin-bottom: 5px;" id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" style="margin-bottom: 10px;" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
            }
            else
            {
                $('.titleLine:contains("LISTEN")').before('<div class="seenit"><img style="float:none;margin-bottom: 5px;" id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" style="margin-bottom: 10px;" href="#" data-video="' + podcastId + '">Ehm, No I didn\'t...</a></div>');
            }
            $('.didntSee').on('click', function (e) {
                e.preventDefault();
                $('div.seenit').remove();
                localStorage['RT_PODCAST_' + $(this).data('video')] = false;
            });
        }
    },

    /**
     * The bit for tracking videos
     *
     */
    videos: {
        timer: null,

        track: function () {
            clearTimeout(jsRTHelper.videos.timer);

            var videoId = $("#socialVideo").data("id");

            // check if I've seen this
            if(localStorage['RT_VIDEO_' + videoId] === "true")
            {
                $('.episodeDescription').after('<div class="seenit"><img id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" href="#" data-video="' + videoId + '">Ehm, No I didn\'t...</a></div>');
                $('.didntSee').on('click', function (e) {
                    e.preventDefault();
                    $('div.seenit').remove();
                    localStorage['RT_VIDEO_' + $(this).data('video')] = false;
                });
            }
            else
            {
                // set up watch timer (30 seconds)
                jsRTHelper.videos.timer = setTimeout(jsRTHelper.videos.watched, 30000);
            }
        },

        showSeen: function () {
            var checkImage = chrome.extension.getURL("images/seen.png");

            $('.videoChooseA').each(function () {
                // get classname Chunks
                var classNameChunks = $(this).attr('class').split(/\s+/);

                // get the video ID from the second classname
                var videoId = classNameChunks[1].substr(11);

                // check local storage
                if(localStorage['RT_VIDEO_' + videoId] === "true")
                {
                    $(this).css('position', 'relative');
                    $(this).append('<img class="seenit" src="' + checkImage + '" />');
                }
            });
        },

        watched: function () {
            var videoId = $("#socialVideo").data("id");
            localStorage['RT_VIDEO_' + videoId] = true;

            var $videoThumbnail = $('.videoChooseA.videoObject' + videoId);
            $videoThumbnail.css('position', 'relative');
            $videoThumbnail.append('<img class="seenit" src="' + chrome.extension.getURL("images/seen.png") + '" />');

            $('.episodeDescription').after('<div class="seenit"><img id="seenitCurrent" src="' + chrome.extension.getURL("images/seen.png") + '" /><br /><a class="didntSee" href="#" data-video="' + videoId + '">Ehm, No I didn\'t...</a></div>');
            $('.didntSee').on('click', function (e) {
                e.preventDefault();
                $('div.seenit').remove();
                localStorage['RT_VIDEO_' + $(this).data('video')] = false;
            });
        }
    }

}
$(jsRTHelper.init);

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}