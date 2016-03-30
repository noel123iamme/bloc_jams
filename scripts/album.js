var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButtton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span';

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumImage = $('.album-cover-art');
var $albumSongList = $('.album-view-song-list');

var albumList = [albumPicasso, albumMarconi, albumPop];

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

var setCurrentTimeInPlayerBar = function(currentTime) {
    $('.seek-control .current-time').text(currentTime);
};

var setTotalTimeInPlayerBar = function(totalTime) {
    $('.seek-control .total-time').text(totalTime);
};

var filterTimeCode = function(timeInSeconds) {
    var seconds = Math.floor(parseFloat(timeInSeconds));
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    seconds = (seconds < 10 ? '0' + seconds: seconds);
    return (minutes + ':' + seconds);
};

var setVolume = function (volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};

var setSong = function(number) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(number);
    currentSongFromAlbum = currentAlbum.songs[number - 1];
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: ['mp3'],
        preload: true
    });
    
    setVolume(parseInt($('.volume .fill').width()))
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};
    
var updatePlayerBarSong = function(htmlPlayPause) {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    
    $('.main-controls .play-pause').html(htmlPlayPause);
    
    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.duration));
};

var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
        + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
        + '  <td class="song-item-title">' + songName + '</td>'
        + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
        + '</tr>'
    ;

    var clickHandler = function() {
        var songNumber = parseInt($(this).attr('data-song-number'));

        if (parseInt(currentlyPlayingSongNumber) !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell.html(currentlyPlayingSongNumber);
        }
        
        if (parseInt(currentlyPlayingSongNumber) !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.
            setSong(songNumber);
            $(this).html(pauseButtonTemplate);
            updatePlayerBarSong(playerBarPauseButton);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else if (parseInt(currentlyPlayingSongNumber) === songNumber) {
            // Switch from Pause -> Play button to pause currently playing song.
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                updatePlayerBarSong(playerBarPauseButton); 
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                updatePlayerBarSong(playerBarPlayButtton);                
                currentSoundFile.pause();
            }
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        if (songNumber !== parseInt(currentlyPlayingSongNumber)) {
            songNumberCell.html(playButtonTemplate);
        }
    };
    
    var offHover = function() {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        if (songNumber !== parseInt(currentlyPlayingSongNumber)) {
            songNumberCell.html(songNumber);
        }
    };
    
    var $row = $(template);
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _incrementing_ the song here
    currentSongIndex++;
    
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();

    // Update the Player Bar information
    updatePlayerBarSong(playerBarPauseButton);
    updateSeekBarWhileSongPlays();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var previousSong = function() {
    
    // Note the difference between this implementation and the one in
    // nextSong()
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    // Note that we're _decrementing_ the index here
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    // Set a new current song
    setSong(currentSongIndex + 1)
    currentSoundFile.play();

    // Update the Player Bar information
    updatePlayerBarSong(playerBarPauseButton);
    updateSeekBarWhileSongPlays();
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var togglePlayFromPlayerBar = function() {
    var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber)
    if (currentSongFromAlbum && currentSoundFile) {
        if (currentSoundFile.isPaused()) {
            $currentlyPlayingCell.html(pauseButtonTemplate);
            $(this).html(playerBarPauseButton);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
        } else {
            $currentlyPlayingCell.html(playButtonTemplate);
            $(this).html(playerBarPlayButtton);
            currentSoundFile.pause();
        }
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentabeString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentabeString);
    $seekBar.find('.thumb').css({left: percentabeString});
};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        currentSoundFile.bind('timeupdate', function(event) {
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            updateSeekPercentage($seekBar, seekBarFillRatio);
            
            setCurrentTimeInPlayerBar(filterTimeCode(this.getTime()));
        });
    }
};

var seekTime = function(timeRatio) {
    if (currentSoundFile) {
        currentSoundFile.setTime(timeRatio * currentSoundFile.getDuration());
    }
};

var seekVolume = function(volumeRatio) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volumeRatio * 100);
    }
};

var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        var seekBarFillRatio = offsetX / barWidth;
        
        updateSeekPercentage($(this), seekBarFillRatio);
        
        if ($(this).parent().hasClass('seek-control')) {
            seekTime(seekBarFillRatio);
        } else {
            seekVolume(seekBarFillRatio);
        }
    });
    
    $seekBars.find('.thumb').mousedown(function(event) {
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            
            if ($(this).parent().hasClass('seek-control')) {
                seekTime(seekBarFillRatio);
            } else {
                seekVolume(seekBarFillRatio);
            }
        });
        
        $(document).bind('mouseup.thumb', function(event){
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

$(document).ready(function() {
    var imgNum = location.search.substr(1,2);
    albumPicasso.albumArtUrl.replace(/[0-9]{2}\.png/, imgNum + '.png');
    
    setCurrentAlbum(albumPicasso);    
    setupSeekBars();
    
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar)
});