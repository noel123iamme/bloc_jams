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

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

var setSong = function(number) {
    currentlyPlayingSongNumber = parseInt(number);
    currentSongFromAlbum = currentAlbum.songs[number - 1];
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
};
    
var createSongRow = function (songNumber, songName, songLength) {
    var template =
        '<tr class="album-view-song-item">'
        + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
        + '  <td class="song-item-title">' + songName + '</td>'
        + '  <td class="song-item-duration">' + songLength + '</td>'
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
            $(this).html(pauseButtonTemplate);
            setSong(songNumber);
            updatePlayerBarSong();
        } else if (parseInt(currentlyPlayingSongNumber) === songNumber) {
            // Switch from Pause -> Play button to pause currently playing song.
            $(this).html(playButtonTemplate);
            setSong(null);
            updatePlayerBarSong();
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
            songNumberCell.html(songNumber)
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

    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
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

    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.title);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    
    $('.main-controls .play-pause').html(playerBarPauseButton);
};

$(document).ready(function() {
    var i = 0;
    $albumImage.click(function() {
        i = (i + 1) % 3;
        setCurrentAlbum(albumList[i]);
    });

    setCurrentAlbum(albumList[i]);
    
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
});