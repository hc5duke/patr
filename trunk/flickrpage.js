/*
	Patr - Pats Flickr Extension
    Copyright (C) 2010  Patrick David

	This file is part of Patr.

    Patr is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Patr is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
  flickrPage.reflect = document.querySelector("img[class='reflect']");
  flickrPage.spaceball = document.querySelector("div.photoImgDiv > img[src*='spaceball.gif']");
  flickrPage.dragproxy = document.getElementById('photo-drag-proxy');
  flickrPage.ICBM = document.querySelector("meta[name='ICBM']") || false;
  flickrPage.flic = document.querySelector("link[rev='canonical']") || false;

	if( flickrPage.spaceball ) flickrPage.spaceball.offsetParent.removeChild( flickrPage.spaceball );
	if( flickrPage.dragproxy ) flickrPage.dragproxy.style.visibility = 'hidden';

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
				flickrPage.preSizes();
                lightBox.preLoad();
        }else{
            // Response not ok, so do something
			flickrPage.lb_src = flickrPage.image_src.replace("_m", "");
        }
    } 
  );

  // Dress up some quick links...

}

flickrPage.preSizes = function(){
	var d = document.createElement('div');
	for( var key in flickrPage.sizes ){
		var a = document.createElement('a');
		a.setAttribute('href', flickrPage.sizes[ key ].source );
		a.setAttribute('class', 'plain');
		//a.style.float = 'right';
		a.appendChild( document.createTextNode( key.slice(0, 2) + " "  ) );
		d.appendChild( a );
		//document.querySelector("div.Widget").appendChild( a );
	}
	d.style.marginTop = 3;
	d.style.marginLeft = 28;

	document.querySelector("div.Widget").appendChild( d );
}
