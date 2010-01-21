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

// Pre-load the page image
lightBox.preLoad = function(){
  console.log("[lightbox.js]: pre-loading image\n" + flickrPage.lb_src );
  lightBox.image.src = flickrPage.lb_src;
}

// Toggle the LB...
lightBox.doLightBox = function() {
	
	if( lightBox.open ){ // If LB is already open, close it
       document.body.removeChild( lightBox.bg );
       lightBox.open = false ;
       return lightBox.open ;

	} 

       console.log("[lightbox.js]: Starting up lightbox...");
	console.log("lightbox.js]: " + lightBox.image.height );
};

