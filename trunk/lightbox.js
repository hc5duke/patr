// Creating the lightbox object

var lightBox = {};

lightBox.image = new Image();
lightBox.bg = document.createElement('div');
lightBox.bg.id = 'pattr-lightbox-bg';

lightBox.preLoad = function(){
  console.log("[lightbox]: Pre-loading image: " + flickrPage.lb_src );
	this.image.src = flickrPage.lb_src;

	this.bg.appendChild( lightBox.image );
	document.body.appendChild( lightBox.bg );

	this.bg.style.visibility = 'hidden';
	this.setOrigin();
}

lightBox.doLightBox = function() {
	
	if( lightBox.open ){ // If LB is already open, close it
       lightBox.open = false ;
       this.setOrigin();
       return lightBox.open ;

	} 

    console.log("[lightbox.js]: Starting up lightbox...");

	this.setShow();

    lightBox.open = true;
};


lightBox.setOrigin = function() {

    var tis = lightBox.image.style;
    var img = document.querySelector("div[class='photoImgDiv']");

    tis.position = 'absolute';
    tis.margin = 30;
    tis.left = img.offsetLeft - tis.margin.replace('px','');
	tis.top = img.offsetTop - tis.margin.replace('px','');
	tis.maxHeight = document.querySelector("img[class='reflect']").height;
    tis.maxWidth = document.querySelector("img[class='reflect']").width;
	tis.opacity = '0';
    tis.webkitBoxShadow = '0 0 0px #000';
	tis.webkitTransition = '400ms';

	this.bg.style.webkitTransition = '400ms';
	this.bg.style.backgroundColor = 'rgba(0,0,0,0)';
	this.bg.style.visibility = 'hidden';

}

lightBox.setShow = function() {
    console.log("[lightbox]: Showing lightbox.");

    var tis = this.image.style;
    var ti = this.image;


    tis.maxHeight = document.body.clientHeight - 2*tis.margin.replace('px','');
    tis.maxWidth = document.body.clientWidth - 2*tis.margin.replace('px','') ;
    tis.top = 0;

    if( ti.naturalWidth < tis.maxWidth.replace('px','') ){
        if( ti.naturalHeight < tis.maxHeight.replace('px','') ){
            tis.left = (document.body.clientWidth/2) - (ti.naturalWidth/2) - tis.margin.replace('px','') ;
        }else{
            tis.left = (document.body.clientWidth/2) - 
                (tis.maxHeight.replace('px',''))*(ti.naturalWidth/ti.naturalHeight)/2 -
                tis.margin.replace('px','');
        }
    }else{
        tis.left = 0;
    }

	tis.opacity = '1';
	tis.webkitBoxShadow = '0 0 30px #000';

	this.bg.style.visibility = 'visible';
	this.bg.style.backgroundColor = 'rgba(0,0,0,0.92)';


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
