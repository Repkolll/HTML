// Generic gallery script for game pages
// Works on any page that contains a .game-cover and .game-screenshots
document.addEventListener('DOMContentLoaded', function () {
    // Find all game blocks on the page (in case of multiples)
    var gameBlocks = document.querySelectorAll('.game-detail');
    gameBlocks.forEach(function (block) {
        var cover = block.querySelector('.game-cover');
        var thumbs = block.querySelectorAll('.game-screenshots img');
        if (!cover || !thumbs || thumbs.length === 0) return;

        thumbs.forEach(function (img) {
            img.addEventListener('click', function () {
                // swap main cover src and alt
                cover.src = img.src;
                if (img.alt) cover.alt = img.alt;
                // mark active
                thumbs.forEach(function (t) { t.classList.remove('active'); });
                img.classList.add('active');
            });
        });
    });
});
