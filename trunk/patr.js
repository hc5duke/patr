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
