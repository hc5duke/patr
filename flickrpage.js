// flickrpage.js
//
// flickrPage contains functions for dealing with page parameters

var flickrPage = {};

// Check if this is a photo page, or something else. 
flickrPage.isPhotoPage = 
   document.querySelector("link[rel='canonical']").href ? true : false ;

if( flickrPage.isPhotoPage ){

  flickrPage.photoID = document.location.href.split("/")[5] ;
  flickrPage.url = document.querySelector("link[rel='canonical']").href ;
  flickrPage.image_src = document.querySelector("link[rel='image_src']").href ;
  flickrPage.ICBM = document.querySelector("meta[name='ICBM']").content;

}

