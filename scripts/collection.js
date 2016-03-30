var buildCollectionItemTemplate = function(number) {
    var item = '';
    if (number < 10) {item += '0' + number;} else {item += number;}

    var template = 
      '<div class="collection-album-container column fourth">'
    + '   <img src="assets/images/album_covers/' + item + '.png"/>'
    + '   <div class="collection-album-info caption">'
    + '      <p>'
    + '         <a class="album-name" href="album.html?' + item + '">The Colors</a>'
    + '         <br/>'
    + '         <a href="album.html?' + item + '">Pablo Picasso</a>'
    + '         <br/>'
    + '         X songs'
    + '         <br/>'
    + '      </p>'
    + '   </div>'
    + '</div>';
    
    return $(template)
};

$(window).load(function() {
    var $collectionContainer = $('.album-covers');
    $collectionContainer.empty();
    for (var i = 0; i < 20; i++) {
        var $newThumbnail = buildCollectionItemTemplate(i+1);
        $collectionContainer.append($newThumbnail);
    }
});
