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

var black = document.createElement("style");
black.innerText = "html { background-color: black !important; } body { background-color: black !important; } #flickrLogo{ opacity: 0; -webkit-transition: opacity 200ms linear; }";
if( /darkr=1/.test( document.cookie ) ){ document.documentElement.insertBefore( black );  }

// insert custom css styles before page load (to avoid flicker if possible!)
var st = document.createElement("style");
var st2 = document.createElement("style");
var st3 = document.createElement("LINK");
st3.href = chrome.extension.getURL("flickrdark.css");
st3.rel = 'stylesheet';
st3.type = 'text/css';

 st.innerText="html { background-color: black !important; }"
                +" body{ background-color: black ! important; color: white !important; }";

st2.innerText = "div.sharing_options_header_open { background-image: url("+ chrome.extension.getURL('images/sharing_sprite.png') +") !important; }"
                + "[id^='photo_gne_button'] { background-image: url("+ chrome.extension.getURL('images/photo-button-bar-sprite5.png') +") !important; }"
                + "a#SlideShowButton, a[data-ywa-name='Share'] { background-image: url('" + chrome.extension.getURL('images/sharing_sprite.png') +"') !important; }";

chrome.extension.sendRequest( { type: "localStorage", param:['darkr'] },
        function(response){
            if( response.darkr == 'true' ){
                document.documentElement.insertBefore( st2 );
                document.documentElement.insertBefore( st3 );
                document.documentElement.insertBefore( st );
                document.cookie = 'darkr=1; path=/';
                }else{
                    document.cookie = 'darkr=0; path=/';
                }
            } );

flickrPage.isPoolPage = ( location.href.search(/\/pool\//) == -1 ) ? false : true;
flickrPage.isFriendPage = ( location.href.search(/\/friends\//) == -1 ) ? false : true;
flickrPage.isPhotosOf = ( location.href.search(/\/photosof\//) == -1 ) ? false : true;

// Wait till the DOM is done to call these guys...
var _startPage = setInterval( function(){
        if( /loaded|complete/.test(document.readyState) ){
            clearInterval( _startPage );
            // replacing badges & images
            var pro = document.getElementsByClassName('Pro');
            for(i = 0; i < pro.length; i++){ pro[i].src = chrome.extension.getURL('images/badge_pro.gif.v2'); }

            flickrPage.isPhotoPage = document.querySelector("link[rel='canonical']") ? true : false ;

            chrome.extension.sendRequest( {type:"localStorage", param:['ecShadow','ecRound', 'bigPool', 'moveInfo', 'nLogo'] },
                    function( response ){
                        if( response.ecShadow == 'true' ){ flickrPage.makeShadows(); }
                        if( response.ecRound  == 'true' ){ flickrPage.makeRound(); }
			            if( response.bigPool == 'true' && ( flickrPage.isPoolPage || flickrPage.isFriendPage || flickrPage.isPhotosOf) ){ doBigPool(); }
                        if( response.moveInfo == 'true' && flickrPage.isPhotoPage ){ flickrPage.moveInfo(); }
                        if( response.nLogo == 'true'){
                            var logo = document.getElementById('FlickrLogo');
                            logo.src = chrome.extension.getURL('images/flickr-yahoo-logo.png.v2');
                            logo.style.opacity = '100';
                        }else if( response.nLogo == 'false' ){
                            document.getElementById('FlickrLogo').style.opacity = '100';
                        }

                    } );

            doFlickrPage();
            doDiscuss();
        }
    }, 10 );




function doFlickrPage() {

    if( flickrPage.isPhotoPage ){

      flickrPage.photoID = document.location.href.split("/")[5] ;
      flickrPage.url = document.querySelector("link[rel='canonical']").href ;
      flickrPage.image_src = document.querySelector("link[rel='image_src']").href ;
      flickrPage.reflect = document.querySelector("img[class='reflect']");
      flickrPage.spaceball = document.querySelector("div.photoImgDiv > img[src*='spaceball.gif']");
      flickrPage.dragproxy = document.getElementById('photo-drag-proxy');
      flickrPage.ICBM = document.querySelector("meta[name='ICBM']") || false;
      flickrPage.flic = document.querySelector("link[rev='canonical']") || false;

      flickrPage.exif = {};

      preFlic();

        if( flickrPage.spaceball ) flickrPage.spaceball.offsetParent.removeChild( flickrPage.spaceball );
        if( flickrPage.dragproxy ) flickrPage.dragproxy.style.visibility = 'hidden';

      // Make API request to fill out photo sizes available
      chrome.extension.sendRequest( { type: "API", fn: "photos.GetSizes", params: { photo_id: flickrPage.photoID } },
        function( response ){ 
            if( false /*response.stat == "ok" */ ){ // Skip this section for now, and just use dirtyAPI
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

                    // Call our functions to start things off
                    flickrPage.preSizes();
                    lightBox.preLoad();

            }else if( /*document.getElementById('photo_gne_button_zoom') */ true ){
                // We failed getting photo info, let's try another method...
                //console.log( "Failed getting API info, trying workaround..." );

                var ftxt = document.head.querySelector("script").innerHTML; 
                var farray = ftxt.match( /'\w+'/g );
                var api_key = farray[0].substring( 1, farray[0].length - 1 );
                var auth_hash = farray[1].substring( 1, farray[1].length -1 );
                var cookie = document.cookie;

                //TEMPORARY - MOVE ME - Getting EXIF data
                chrome.extension.sendRequest( { type: 'cAPI', fn: 'photos.getExif', params: { photo_id: flickrPage.photoID, api_key: api_key, auth_hash: auth_hash, auth_token: '', src: 'js' } },
                        function( response ){
                            if( response.stat == 'ok' ){
                                //console.log( response );
                                var rpe = response.photo.exif;
                                var values = {'ExposureTime':{}, 'Aperture':{}, 'FocalLength':{}, 'ISO':{},
                                                'ExposureCompensation':{}, 'Flash':{}, 'Lens':{} };
                                for(var i = 0; i < rpe.length; i++){
                                    if( rpe[i].tag in values && !( values[ rpe[i].tag ].value ) ){
                                        values[ rpe[i].tag ].label = rpe[i].label;
                                        if( rpe[i].clean ){
                                            values[ rpe[i].tag ].value = rpe[i].clean._content;
                                        }else{
                                            values[ rpe[i].tag ].value = rpe[i].raw._content;
                                        }
                                    }
                                }
                                // We have EXIF values, now push them into the page
                                var newul = document.createElement('ul');
                                values.Aperture.value = 'f/'+values.Aperture.value;
                                for( var key in values ){
                                    if( values[key].value ){
                                        var li = document.createElement('li');
                                        li.innerHTML = values[key].label +': '+values[key].value;
                                        li.setAttribute('class', 'Stats');
                                        li.style.listStyleType = 'square';
                                        li.style.color = 'rgb(125,125,125)';
                                        li.style.fontSize = '100%';
                                        newul.appendChild( li );
                                    }
                                }
                                var mp = document.querySelector("td.RHS>ul>li.Stats a[data-ywa-name*='More']").previousElementSibling;
                                if( mp ){
                                    newul.querySelector("li:last-child").appendChild( document.createElement('br') );
                                    newul.querySelector("li:last-child").appendChild(mp.parentNode.removeChild(mp.nextElementSibling));
                                    mp.parentNode.insertBefore( newul, mp );
                                    mp.parentNode.removeChild( mp );
                                }
                            }
                        });

                chrome.extension.sendRequest( { type: 'cAPI', fn: 'photos.getSizes', params: { photo_id: flickrPage.photoID, api_key: api_key, auth_hash: auth_hash, auth_token: '', src: 'js' } },
                        function( response ){
                            if( response.stat == 'ok' ){
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

                                flickrPage.preSizes();
                                lightBox.preLoad();
                            }
                        });

            }else{ // Everything else failed, so just use the img on the page...
                console.log("Failed getting API info, and no zoom, so ...");
                flickrPage.lb_src = flickrPage.reflect.src;
                lightBox.preLoad();
            }
        } 
      );
}
}

flickrPage.preSizes = function(){
	var d = document.createElement('div');
	for( var key in flickrPage.sizes ){
		var a = document.createElement('a');
		a.setAttribute('href', flickrPage.sizes[ key ].source );
		a.setAttribute('class', 'plain');
        a.setAttribute('onmouseover', 'document.querySelector("span#sizebox").firstChild.nodeValue = "('+
                    flickrPage.sizes[ key ].width +' x '+ flickrPage.sizes[ key ].height +')"');
        a.setAttribute('onmouseout', 'document.querySelector("span#sizebox").firstChild.nodeValue = ""');
		a.appendChild( document.createTextNode( key.slice(0, 2) + " "  ) );
		d.appendChild( a );
	}
	d.style.marginTop = 3;
	d.style.marginLeft = 28;

    var ds = document.createElement('span');
    ds.id = 'sizebox';
    ds.style.marginLeft = '5px';

    ds.appendChild( document.createTextNode('') );
    d.appendChild( ds );
	document.querySelector("div.Widget").appendChild( d );
}

function preFlic(){

    var shortURL = flickrPage.flic ? flickrPage.flic.href : flic_kr( flickrPage.photoID );

        var ul = document.querySelector("ul > li[class='Stats']").parentNode;
        var li = document.createElement('li');
        var flink = document.createElement('a');

        li.setAttribute('class', 'Stats');
        li.appendChild( flink );

        flink.setAttribute('href', shortURL );
        flink.setAttribute('class', 'Plain');
        flink.appendChild( document.createTextNode( shortURL ) );

        ul.insertBefore( li, document.querySelector("ul > li[style*='margin-bottom']") );

}

function flic_kr(photoID){
    if( typeof photoID !== 'number' ){ photoID = parseInt( photoID ); }
    var enc = '', alpha='123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    var div = photoID, mod;
    while( photoID >= 58 ){
        div = photoID / 58;
        mod = photoID - (58 * Math.floor(div));
        enc = '' + alpha.substr( mod, 1) + enc;
        photoID = Math.floor(div);
    }
    return "http://flic.kr/p/" + ( div ? '' + alpha.substr(div, 1) + enc : enc );
}

flickrPage.makeShadows = function(){
	var filename = chrome.extension.getURL('flickrpage_shadow.css');
	var cssref = document.createElement('link');
	cssref.setAttribute('rel', 'stylesheet');
	cssref.setAttribute('type', 'text/css');
	cssref.setAttribute('href', filename);
	//document.getElementsByTagName('head')[0].appendChild( cssref );
    document.head.appendChild( cssref );
}

flickrPage.makeRound = function(){
	var filename = chrome.extension.getURL('flickrpage.css');
	var cssref = document.createElement('link');
	cssref.setAttribute('rel', 'stylesheet');
	cssref.setAttribute('type', 'text/css');
	cssref.setAttribute('href',  filename);
	//document.getElementsByTagName('head')[0].appendChild( cssref );
    document.head.appendChild( cssref );
}

flickrPage.hideContext = function(){
    var other = document.getElementById('otherContexts_div');
    var pools = document.querySelectorAll("div.contextDiv[id*='_pool'] tr[id^='nextprev_tr_pool'][style='display:none;']");
    var sets = document.querySelectorAll("div.contextDiv[id*='_set'] tr[id^='nextprev_tr_set'][style='display:none;']");
	var open = other.querySelector("h3.contextTitleOpen") || false;
    var num_pools = pools.length;
    var num_sets = sets.length;
    //console.log('pools.length: '+ pools.length +'\nsets.length: '+ sets.length);
    //console.log( sets );
    for( var key in pools ){
        if( parseInt(key+1) ){
            pools[key].parentNode.parentNode.parentNode.style.display = 'none';
            pools[key].parentNode.parentNode.parentNode.name = 'hContext';
        }
    }
    for( var key in sets ){
        if( parseInt(key+1) ){
            sets[key].parentNode.parentNode.parentNode.style.display = 'none';
            sets[key].parentNode.parentNode.parentNode.name = 'hContext';
        }
    }
    var newTotal = document.createElement('div');
	var nset = document.createElement('span');
	var npool = document.createElement('span');
	nset.innerHTML = num_sets;
	npool.innerHTML = parseInt( num_pools );
	if( num_pools !== 0 || num_sets !== 0 ){
		newTotal.innerHTML = open ? '... and ' : '';
	}
	if( num_sets > 0 ) { newTotal.appendChild( nset ); }
	newTotal.innerHTML += num_sets > 1 ? ' sets' : num_sets > 0 ? ' set' : '';
	if( num_sets !== 0 ){
		newTotal.innerHTML += ' and ';
	}
	if( num_pools > 0 ){ newTotal.appendChild( npool ); }
	newTotal.innerHTML += num_pools > 1 ? ' pools' : num_pools > 0 ? ' pool' : '';

    //newTotal.innerHTML = num_sets +" sets and "+ num_pools +" pools";
	newTotal.style.marginTop = '10px';
	newTotal.style.marginLeft = '10px';
    newTotal.style.fontWeight = 'bold';
    newTotal.style.fontSize = '17px';
    newTotal.style.color = '#C3BEBD';
    newTotal.style.color = '#ADADAD';
    //newTotal.style.color = '#666';
    newTotal.style.fontFamily = 'Arial';

    other.appendChild( newTotal );
}

function doOrig( url ){
    var xhr = new XMLHttpRequest();
    var re = /http.*static\.flickr\.com.*o\.jpg/i;
    var otxt;
    xhr.onreadystatechange=function()    {
        if( xhr.readyState == 4 && xhr.status == 200 ){
            otxt = re.exec( xhr.responseText );
        }
    }
    xhr.open("GET", url, false);
    xhr.send(null);
    console.log('after .send');
    return otxt;
}

function doBigPool(){
	var imgs = document.querySelectorAll("img.pc_img");
	for( var key = 0; key < imgs.length; key++ ){
		var img = imgs[key];
		img.src = img.src.replace('_t','_m');
		img.width = img.height = null;
		img.style.width = img.style.height = 'auto';
		var p = img.parentNode.parentNode.parentNode;
		p.style.width = p.style.height = 240;
        p.style.marginBottom = '2em';
	}
}

flickrPage.moveInfo = function(){
    var td = document.querySelector("td.RHS");
    var before = document.getElementById('otherContexts_div');
    var move = document.querySelectorAll("td.RHS > h4:last-of-type, p.Privacy, p.Privacy ~ ul, div#upload_form_container, span#upload_uploading_container");
    var i = 0;

    while( i < move.length ){
        td.insertBefore( td.removeChild( move[i] ), before );
        i++;
    }

}
