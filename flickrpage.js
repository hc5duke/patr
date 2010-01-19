// flickrpage.js
//
// flickrPage contains functions for dealing with page parameters

var flickrPage = {};

flickrPage.getID = function() {
	var p = document.location.href.split("/");
	return p[5];
}

flickrPage.getURL = function() {
	return document.querySelector("link[rel='canonical']").href ;
}
   
flickrPage.getImageURL = function() {
	return document.querySelector("link[rel='image_src']").href ;
}
