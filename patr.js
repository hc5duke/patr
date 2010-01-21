var flickrPage = {};
flickrPage.lbImage = new Image();
flickrPage.lightbox = new Object();
flickrPage.lbImage.onload = function() { flickrPage.lbImage.loaded = true; }


flickrPage.image_src = document.querySelector("link[rel='image_src']").href;
flickrPage.url = document.location;
flickrPage.url = document.querySelector("link[rel='canonical']").href


// Find a more elegant way of determining current photo id...
var tmp = flickrPage.url.split("/");
flickrPage.photo_id = tmp[5];
//console.log( "flickrPage.photo_id: " + flickrPage.photo_id );

flickrPage.lightbox.div = document.createElement('div');
flickrPage.lightbox.bg = document.createElement('div');

flickrPage.lightbox.div.setAttribute( 'class', 'pattr-lightbox');
flickrPage.lightbox.bg.id = 'pattr-lightbox-bg';

// Handle keypress events
function handleKey(e){
	// charCode 108 = l
	// charCode  76 = L
	if( e.charCode == 108 ){ // If l is pressed...
		//doLightBox();
                lightBox.doLightBox();
	}
}

document.addEventListener('keypress', handleKey, false);

//getImageSrc();

flickrPage.lbImage.id = "pattr-lightbox-image";

function getImageSrc(){
	// Send request to background.html to run our XMLHttpRequest to the Flickr API
	chrome.extension.sendRequest({ type: "getSizes", photo_id: flickrPage.photo_id }, function(response){
		flickrPage.sizes = response; // ie: flickrPage.sizes.Large.source

		//console.log( "rsp stat: "+ flickrPage.sizes.rsp );
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
		//console.log( flickrPage.lbImage.src );
	}
	)
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

	if( flickrPage.lbImage.height > window.innerHeight ){
		flickrPage.lbImage.style.marginTop = '20px';
		flickrPage.lbImage.style.webkitTransform = 'scale(' + (window.innerHeight - 2*( parseInt(flickrPage.lbImage.style.marginTop)) )/ flickrPage.lbImage.height + ')';
	}
	flickrPage.lightbox.bg.appendChild( flickrPage.lbImage );
	document.body.appendChild( flickrPage.lightbox.bg );

	flickrPage.lightbox.open = true;
}

