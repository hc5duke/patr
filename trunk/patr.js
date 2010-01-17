var flickrPage = {};
flickrPage.lbImage = new Image();
flickrPage.lightbox = new Object();
flickrPage.lbImage.onload = function() { flickrPage.lbImage.loaded = true; }
var imgSrc;

imgSrc = document.querySelector("link[rel='image_src']").href;
flickrPage.image_src = document.querySelector("link[rel='image_src']").href;
flickrPage.url = document.location;
flickrPage.url = document.querySelector("link[rel='canonical']").href

imgSrc = imgSrc.replace("_m", "_b");
//alert( imgSrc );

var lbImage = new Image();
lbImage.src = imgSrc;
//lbImage.src = getImageSrc();
lbImage.id = 'lbImage';
lbImage.style.webkitBoxShadow = '0px 0px 40px #000';
lbImage.style.webkitTransform = 'rotate(10deg)';
lbImage.style.webkitBorderRadius = '50px';
lbImage.style.webkitTransform = 'scale(.5) rotate(25deg)';


//document.body.appendChild( lbImage );
// Need to run a check of available sizes.
// Two ways to accomplish this:
// 1. The correct way using the API
// 2. The incorrect way scraping the page and testing results.
// A combination of the two may be required,
// as the API sometimes misses _o or _b sizes.

//var tmp = flickrPage.url.pathname.split("/");
var tmp = flickrPage.url.split("/");
flickrPage.photo_id = tmp[5];
console.log( "flickrPage.photo_id: " + flickrPage.photo_id );

flickrPage.lightbox.div = document.createElement('div');
flickrPage.lightbox.bg = document.createElement('div');

flickrPage.lightbox.div.setAttribute( 'class', 'pattr-lightbox');
flickrPage.lightbox.bg.id = 'pattr-lightbox-bg';
/*
lb.style.position = 'fixed';
lb.style.top = '0px';
lb.style.backgroundColor = 'black';
lb.style.left = '0px';
lb.style.opacity = '0.1';
lb.style.zIndex = '10001';
lb.style.width = '100%';
lb.innerHTML = 'This is a TEST';
lb.innerHTML = 'clientHeight: ' + window.innerHeight;
lb.style.webkitTransition = 'opacity 1s linear';
//lb.style.height = window.innerHeight;
lb.style.height = '100%';
*/

//document.body.appendChild( lb );

function handleKey(e){
	// charCode 108 = l
	// charCode  76 = L
	if( e.charCode == 108 ){ // If l is pressed...
		doLightBox();
	}
}

document.addEventListener('keypress', handleKey, false);

getImageSrc();

//lbImage.src = "http://farm5.static.flickr.com/4040/4275722084_bb29edcde5_b.jpg";
//flickrPage.lbImage.style.webkitBorderRadius = '50px';
//lbImage.style.webkitTransform = 'rotateY( 45deg )';
//flickrPage.lbImage.style.opacity = '0.5';
//flickrPage.lbImage.style.webkitTransform = 'scale(.25)';
//document.body.appendChild( flickrPage.lbImage );
//flickrPage.lbImage.style.webkitBoxShadow = '0px 0px 30px #000';
//flickrPage.lbImage.style.marginTop = '50px';
flickrPage.lbImage.id = "pattr-lightbox-image";

function getImageSrc(){
	// Send request to background.html to run our XMLHttpRequest to the Flickr API
	chrome.extension.sendRequest({ type: "getSizes", photo_id: flickrPage.photo_id }, function(response){
		flickrPage.sizes = response; // ie: flickrPage.sizes.Large.source

		console.log( "rsp stat: "+ flickrPage.sizes.rsp );
		if( flickrPage.sizes.Large && flickrPage.sizes.rsp == 'ok' ){
			flickrPage.lbImage.src = flickrPage.sizes.Large.source;
		}else if( flickrPage.sizes.Original && flickrPage.sizes.rsp == 'ok'){
			flickrPage.lbImage.src = flickrPage.sizes.Original.source;
		}else if( flickrPage.sizes.Medium && flickrPage.sizes.rsp == 'ok'){
			flickrPage.lbImage.src = flickrPage.sizes.Medium.source;
		}else{
			//alert("Uh Oh, you shouldn't be seeing me");
			if( flickrPage.sizes.rsp != 'ok' ) console.log( "Unable to retrieve sizes!" );
			// As a last resort, set the image from the page as the lbImage
			flickrPage.lbImage.src = flickrPage.image_src.replace("_m", "");
			
		}
		console.log( flickrPage.lbImage.src );
	}
	)
	//alert("Inside getImageSrc()!");
}


function doLightBox() {
	if( flickrPage.lightbox.open ){  // Close open lightbox
		document.body.removeChild( flickrPage.lightbox.bg );
		flickrPage.lightbox.open = false;
		return;
	}

	// Want to implement some checking here (is image loaded, etc...)
	// If it's not loaded yet, use the medium sized version from the page itself, scaled.
	console.log("Starting lightbox up...");
	//alert( flickrPage.lbImage.loaded );

	if( flickrPage.lbImage.height > window.innerHeight ){
		flickrPage.lbImage.style.marginTop = '20px';
		flickrPage.lbImage.style.webkitTransform = 'scale(' + (window.innerHeight - 2*( parseInt(flickrPage.lbImage.style.marginTop)) )/ flickrPage.lbImage.height + ')';
	}
	flickrPage.lightbox.bg.appendChild( flickrPage.lbImage );
	document.body.appendChild( flickrPage.lightbox.bg );

	flickrPage.lightbox.open = true;
}

