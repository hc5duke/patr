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

var lightbox = {};
lightbox.image = new Image();
lightbox.bg = document.createElement('div');
lightbox.bg.id = 'pattr-lightbox-bg';
