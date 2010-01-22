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
//lightBox.image.id = "pattr-lightbox-image";
lightBox.bg = document.createElement('div');
lightBox.bg.id = 'pattr-lightbox-bg';

// Pre-load the page image
lightBox.preLoad = function(){
  console.log("[lightbox.js]: pre-loading image:\n" + flickrPage.lb_src );
  this.image.src = flickrPage.lb_src;
    lightBox.bg.appendChild( lightBox.image );
    document.body.appendChild( lightBox.bg );
  //this.setOrigin(); // Pre-set the image overlayed on Flickr image
}

lightBox.doLightBox = function() {
    // This should be re-worked to only setup the bg and image of the LB
    // Then we can just toggle the visibility of the objects to turn them
    // on and off.
	
	if( lightBox.open ){ // If LB is already open, close it
       //document.body.removeChild( lightBox.bg );
       //lightBox.image.id = "";
       //this.bg.style.visibility = 'hidden';
       console.log("got a lightBox.open: " + this.open );
       lightBox.open = false ;
       this.setOrigin();
       return lightBox.open ;

	} 

    console.log("[lightbox.js]: Starting up lightbox...");
    //this.setOrigin();

    // Interesting: I can try setting the image over the default display on Flickr
    // So first position a copy over the page one, then trigger transforms


    this.image.id = 'pattr-lightbox-image';
    this.image.style.position = 'absolute';
    //this.image.style.left = document.querySelector("div[class='photoImgDiv']").offsetLeft ;
    this.goRight();
    this.image.style.top = document.querySelector("div[class='photoImgDiv']").offsetTop ;
    this.image.style.maxHeight = document.querySelector("img[class='reflect']").height ;
    this.image.style.marginTop = 0;

    this.bg.style.visibility = 'hidden';
    //this.bg.style.backgroundColor = 'rgba(0,0,0,0)';



    //lightBox.image.id = "pattr-lightbox-image";
    //
    lightBox.bg.style.visibility = 'visible';

    //alert(" Just made it visible ");
    // Handle image sizes vs. window sizes
    //if( this.image.height > window.innerHeight || this.image.style.maxHeight ){
        //console.log(" image.height > window.innerHeight!");
    //this.image.style.top = 0;
    //this.image.style.marginTop = 20;
    //this.image.style.maxHeight = window.innerHeight - 2*this.image.style.marginTop.replace("px","") ;
    this.image.style.webkitBoxShadow = '0 0 30px #000';
    this.bg.style.backgroundColor = 'rgba(0,0,0,0.92)';
    //this.image.style.maxHeight = ( window.innerHeight - 2*this.image.offsetTop ) ;
    //this.image.style.maxHeight = ( window.innerHeight - 2*getStyle( this.image, 'margin-top').replace("px", "")  ) ;
    //}

    lightBox.image.style.top = 0;


    lightBox.open = true;
    console.log("getStyle: " + getStyle( this.image, 'margin-top' ) );
};

lightBox.goRight = function(){
    lightBox.image.style.left = '400px';
}

lightBox.setOrigin = function() {

    var tis = this.image.style;
    var img = document.querySelector("img[class='reflect']");
    img = document.querySelector("div[class='photoImgDiv']");

    this.bg.style.visibility = 'hidden';
    tis.position = 'absolute';
    tis.left = img.offsetLeft;
    tis.top = img.offsetTop;
    tis.maxHeight = getStyle( img, 'height').replace("px", "") ;
    tis.marginTop = 0;
    this.image.id = 'pattr-lightbox-image';

}

lightBox.setShow = function() {

    var tis = this.image.style;

    this.bg.style.visibility = 'visible';
    /*
    tis.top = 0;
    tis.marginTop = 20;
    tis.maxHeight = window.innerHeight - 2*tis.marginTop.replace("px","");
    */
    tis.webkitBoxShadow = '0 0 30px #000';
    //this.bg.style.backgroundColor = 'rgba(0,0,0,0.92)';
    //alert( this.image.id );


}

// 
// These functions below should be moved to a utility js file
// So we can get to them everywhere...

function getStyle( obj, prop ){
    return document.defaultView.getComputedStyle( obj, null ).getPropertyValue( prop );
}

function findPos(obj){
    var curleft = curtop = 0;
    if( obj.offsetParent){
        do{
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while ( obj = obj.offsetParent );
    return [curleft, curtop];
    }
};
