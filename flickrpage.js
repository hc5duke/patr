// flickrpage.js
//
// flickrPage contains functions for dealing with page parameters

var flickrPage = {};

// Check if this is a photo page, or something else. 
flickrPage.isPhotoPage = 
   document.querySelector("link[rel='canonical']") ? true : false ;


if( flickrPage.isPhotoPage ){

  flickrPage.photoID = document.location.href.split("/")[5] ;
  flickrPage.url = document.querySelector("link[rel='canonical']").href ;
  flickrPage.image_src = document.querySelector("link[rel='image_src']").href ;
  flickrPage.ICBM = document.querySelector("meta[name='ICBM']") ? document.querySelector("meta[name='ICBM']").content : false;

  // Make API request to fill out photo sizes available
  chrome.extension.sendRequest( { type: "API", fn: "photos.GetSizes", params: { photo_id: flickrPage.photoID } },
    function( response ){ 
        if( response.stat == "ok" ){
                var rss = response.sizes.size;
                var sizes = {};
                for( var sz in rss ){
                    sizes[ rss[sz].label ] = rss[sz];
                }
                flickrPage.sizes = sizes;
                if( flickrPage.sizes.Large ){
                      flickrPage.lb_src =  flickrPage.sizes.Large.source;
                }else if( flickrPage.sizes.Original ){
                      flickrPage.lb_src =  flickrPage.sizes.Original.source;
                }else{
                      flickrPage.lb_src =  flickrPage.image_src.replace( "_m", "" );
                }
                //Now call function to preload image
                lightBox.preLoad();
        }else{
            // Response not ok, so do something
        }
    } 
  );


if( flickrPage.lb_src ){ console.log("got lb_src: " + flickrPage.lb_src ); };
if( ! flickrPage.lb_src ){ console.log("Don't have lb_src yet!"); };

}

