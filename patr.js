// Handle keypress events
function handleKey(e){
	// charCode 108 = l
	// charCode  76 = L
	if( e.charCode == 108 ){ // If l is pressed...
		if( flickrPage.isPhotoPage && (e.target.tagName != 'TEXTAREA') && (e.target.tagName != 'INPUT') ){ 
			lightBox.doLightBox();
		}

	}
}

document.addEventListener('keypress', handleKey, false);
