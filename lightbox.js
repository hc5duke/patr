// Creating the lightbox object

//var lightbox = ( function(){ } )();
//
/*

var lightbox = ( function(){

    var isOpen = true;


    return isOpen;

})();

// There is a whole thing up there to deal with later...
//========================================
// Instead, let's go about things this way:
*/

var lightBox = {};
lightBox.image = new Image();
lightBox.bg = document.createElement('div');
lightBox.bg.id = 'pattr-lightbox-bg';

console.log(" flickrPage.getID: " + flickrPage.getID() );
console.log(" flickrPage.getURL: " + flickrPage.getURL() );
console.log(" flickrPage.getImageURL: " + flickrPage.getImageURL() );
