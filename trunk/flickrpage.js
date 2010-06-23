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
var multiGroup = {};

// Pre-set CSS styles before page loads
var black = document.createElement("style");
black.innerText = "html { background-color: black !important; } body { background-color: black !important; } #flickrLogo{ opacity: 0; -webkit-transition: opacity 150ms; }";
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
flickrPage.isStatsPage = ( location.href.search(/\/photos\/.*\/stats\/($|\d{4}-\d\d-\d\d\/$)/) == -1 ) ? false : true;
flickrPage.isUploadDone = ( location.href.search(/\/photos\/upload\/done\//) == -1 ) ? false : true;
flickrPage.isArchives = ( location.href.search(/\/photos\/.*\/archives\/$/) == -1 ) ? false : true;

// Wait till the DOM is done to call these guys...
var _startPage = setInterval( function(){
        if( /loaded|complete/.test(document.readyState) ){
            clearInterval( _startPage );
            // replacing badges & images
			var pro = document.querySelectorAll('img[src$="badge_pro.gif.v2"]');
            for(i = 0; i < pro.length; i++){ pro[i].src = chrome.extension.getURL('images/badge_pro.gif.v2'); }

            flickrPage.isPhotoPage = document.querySelector("link[rel='canonical']") ? true : false ;
            chrome.extension.sendRequest( {type:"localStorage", 
                                           param:['ecShadow',
                                                  'ecRound', 
                                                  'bigPool', 
                                                  'moveInfo', 
                                                  'nLogo', 
                                                  'addRef', 
                                                  'showEXIF',
                                                  'showAS',
                                                  'showASL',
                                                  'ASLdefault',
                                                  'ASLdefaultText' ] },
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
                    if( response.addRef == 'true' && flickrPage.isPhotoPage ){ 
                        flickrPage.doReferrer();
                    }
                    if( response.showEXIF == 'true' ){ flickrPage.showEXIF = true; }
                    if( response.showASL == 'true' ){ flickrPage.showASL = true; }
                    if( response.showAS == 'true' ){ flickrPage.showAS = true; }
                    flickrPage.ASLdefault = response.ASLdefault; 
                    flickrPage.ASLdefaultText = response.ASLdefaultText; 

                    doFlickrPage();
                    doDiscuss();

                } );
        }
}, 10 );


function doFlickrPage() {

        var ftxt = document.head.querySelector("script[type='text/javascript']").innerHTML; 
        var farray = ftxt.match( /'\w+'/g );
        flickrPage.api_key = farray[0].substring( 1, farray[0].length - 1 );
        flickrPage.auth_hash = farray[1].substring( 1, farray[1].length -1 );
        flickrPage.photos_url = ftxt.match( /'\/photos\/.*\/'/g)[0].replace(/'/g,'');
        flickrPage.user_id = ftxt.match(/global_nsid = '(.*)',/)[1];
        var cookie = document.cookie;

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

        // Clear some crud off the image itself in the page.
        if( flickrPage.spaceball ) flickrPage.spaceball.offsetParent.removeChild( flickrPage.spaceball );
        if( flickrPage.dragproxy ) flickrPage.dragproxy.style.visibility = 'hidden';

        // Getting EXIF data
        if( flickrPage.showEXIF ){
            chrome.extension.sendRequest( { type: 'cAPI', 
                                            fn: 'photos.getExif', 
                                            params: { 
                                                photo_id: flickrPage.photoID, 
                                                api_key: flickrPage.api_key, 
                                                auth_hash: flickrPage.auth_hash, 
                                                auth_token: '', 
                                                src: 'js' } },
                    function( response ){
                        if( response.stat == 'ok' ){
                            var rpe = response.photo.exif;
                            var values = {'Lens':{label:'Lens'}, 
                                            'ExposureTime':{label:'Exposure'}, 
                                            'Aperture':{label:'Aperture'}, 
                                            'ISO':{label:'ISO Speed'}, 
                                            'FocalLength':{label:'Focal Length'}, 
                                            'ExposureCompensation':{label:'Exposure Bias'}, 
                                            'Flash':{label:'Flash'} };
                            for(var i = 0; i < rpe.length; i++){
                                if( rpe[i].tag in values && !( values[ rpe[i].tag ].value ) ){
                                    values[ rpe[i].tag ].label = values[ rpe[i].tag ].label || rpe[i].label;
                                    if( rpe[i].clean ){
                                        values[ rpe[i].tag ].value = rpe[i].clean._content;
                                    }else{
                                        values[ rpe[i].tag ].value = rpe[i].raw._content;
                                    }
                                }
                            }
                            if( values['Aperture'].value ){
                                values['Aperture'].value = 'f/'+values['Aperture'].value;
                            }
                            // We have EXIF values, now push them into the page
                            var newul = document.createElement('ul');

                            for( var key in values ){
                                if( values[key].value && values[key].label ){
                                    var li = document.createElement('li');
                                    li.innerHTML = values[key].label +': '+values[key].value;
                                    li.setAttribute('class', 'Stats');
                                    li.style.listStyleType = 'square';
                                    li.style.color = 'rgb(125,125,125)';
                                    li.style.fontSize = '100%';
                                    newul.appendChild( li );
                                }
                            }
                            var more = document.querySelector("td.RHS>ul>li.Stats a[data-ywa-name*='More']") || false;
                            var mp = more ? more.previousElementSibling : false;
                            if( mp ){
                                newul.querySelector("li:last-child").appendChild( document.createElement('br') );
                                newul.querySelector("li:last-child").appendChild(mp.parentNode.removeChild(mp.nextElementSibling));
                                mp.parentNode.insertBefore( newul, mp );
                                mp.parentNode.removeChild( mp );
                            }
                        }
                    });
        }

        chrome.extension.sendRequest( { type: 'cAPI', 
                                        fn: 'photos.getSizes', 
                                        params: { 
                                            photo_id: flickrPage.photoID, 
                                            api_key: flickrPage.api_key, 
                                            auth_hash: flickrPage.auth_hash, 
                                            auth_token: '', 
                                            src: 'js' } },
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

                        //flickrPage.preSizes();
                        if( flickrPage.showAS ){ flickrPage.preSizes2(); }
                        lightBox.preLoad();
                    }else{ // Everything else failed, so just use the img on the page...
                        console.log("Failed getting API info, and no zoom, so ...");
                        flickrPage.lb_src = flickrPage.reflect.src;
                        lightBox.preLoad();
    
                    }
                });

        if( document.getElementById('photo_gne_button_send_to_group') ){ // Start multigroup if enabled!
            multiGroup.preLoad();
        }

        /* Checking if user has commented on this photo before */
        var comment_urls = document.querySelectorAll("h4[data-ywa-name='Commenter names'] > a:first-of-type");
        for(var key in comment_urls){
            if( comment_urls[key].href && comment_urls[key].href.search( flickrPage.photos_url ) != -1 ){
                document.querySelector('#DiscussPhoto > h3:first-of-type').insertAdjacentHTML('beforeEnd', " <img src='"+ chrome.extension.getURL('images/icon_comment.gif') +"'/>" );
                return;
            }
        }


    }else if( flickrPage.isStatsPage ){
        flickrPage.niceStats();
    }else if( flickrPage.isPoolPage || flickrPage.isFriendPage ){
        flickrPage.enhancePool();

        //flickrPage.scroller();
        //flickrPage.scroller.test = true;
        //flickrPage.scroller.triggerHeight = 0;
        //window.onscroll = flickrPage.scroller;
    }else if( flickrPage.isUploadDone ){
        flickrPage.addBlackUploads();
    }else if( flickrPage.isArchives && location.href.match( flickrPage.photos_url ) !== null ){
        //console.log("Doing Archives...");
        flickrPage.doArchives();
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

flickrPage.preSizes2 = function(){

    var d = document.createElement('div');
    d.id = 'patr-sizes';

    var linkSizesList = document.createElement('span');
    linkSizesList.id = 'linkSizesList';

    var ds = document.createElement('span');
    ds.id = 'sizebox';

    flickrPage.linkOpts = document.createElement('div');
    var lo = flickrPage.linkOpts;
    lo.id = 'linkOpts';

    var linkExtra = document.createElement('input');
    linkExtra.id = 'linkExtra';

    flickrPage.linkText = document.createElement('textarea');
    flickrPage.linkText.id = 'patrLinkText';

	for( var key in flickrPage.sizes ){
		var a = document.createElement('a');
		a.setAttribute('href', flickrPage.sizes[ key ].source );
		a.setAttribute('class', 'plain');
        a.setAttribute('size', key );
        a.setAttribute('onmouseover', 'document.querySelector("span#sizebox").firstChild.nodeValue = "('+
                    flickrPage.sizes[ key ].width +' x '+ flickrPage.sizes[ key ].height +')"');
        a.setAttribute('pWidth', flickrPage.sizes[ key ].width);
        a.setAttribute('pHeight', flickrPage.sizes[ key].height);
        a.setAttribute('onmouseout', 'document.querySelector("span#sizebox").firstChild.nodeValue = ""');
		a.appendChild( document.createTextNode( key.slice(0, 2) + " "  ) );
        if( flickrPage.showASL ){ a.addEventListener('mouseover', flickrPage.showLinkOpts, false); }
		d.appendChild( a );

        var aList = document.createElement('a');
        aList.setAttribute('class', 'plain');
        aList.setAttribute('link', flickrPage.sizes[key].source);
        aList.href = 'javascript:;';
        aList.setAttribute('size', key);
        aList.appendChild( document.createTextNode( key.slice(0,2) + " " ) );
        aList.addEventListener('click', flickrPage.extraLinkOpts);
        linkSizesList.appendChild( aList );
	}

    ds.appendChild( document.createTextNode('') );
    d.appendChild( ds );
    document.querySelector("div.Widget").appendChild( d );

    if( flickrPage.showASL ){
        var viewonblack = document.createElement('a');
        viewonblack.setAttribute('class','plain');
        viewonblack.setAttribute('link', 'http://viewonblack.com/flickr/'+flickrPage.photoID);
        viewonblack.href='javascript:;';
        viewonblack.setAttribute('size', 'View on Black');
        viewonblack.appendChild( document.createTextNode('viewonblack.com') );
        viewonblack.addEventListener('click', flickrPage.extraLinkOpts);

        var bhlonblack = viewonblack.cloneNode(true);
        bhlonblack.setAttribute('link', 'http://bighugelabs.com/onblack.php?id='+ flickrPage.photoID +'&size=large');
        bhlonblack.setAttribute('size', 'BHL On Black');
        bhlonblack.addEventListener('click', flickrPage.extraLinkOpts);
        bhlonblack.innerText = 'BHL On Black';

        var fluidr = viewonblack.cloneNode(true);
        fluidr.setAttribute('link', 'http://www.fluidr.com/'+ location.href.split("http://www.flickr.com/")[1] ); // Add photos/user/photo_id
        fluidr.setAttribute('size', 'Fluidr');
        fluidr.addEventListener('click', flickrPage.extraLinkOpts);
        fluidr.innerText = 'Fluidr';

        var darckr = viewonblack.cloneNode(true);
        darckr.setAttribute('link', 'http://www.darckr.com/photo?photoid='+flickrPage.photoID+'&width=1024');
        darckr.setAttribute('size', 'Darckr');
        darckr.addEventListener('click', flickrPage.extraLinkOpts);
        darckr.innerText = 'Darckr';

        linkSizesList.appendChild( document.createElement('br') );
        linkSizesList.appendChild( fluidr );
        linkSizesList.appendChild( document.createElement('br') );
        linkSizesList.appendChild( bhlonblack );
        linkSizesList.appendChild( document.createElement('br') );
        linkSizesList.appendChild( darckr );
        linkSizesList.appendChild( document.createElement('br') );
        linkSizesList.appendChild( viewonblack );

        linkExtra.addEventListener('change', flickrPage.extraChange);

        flickrPage.linkText.setAttribute('rows', 9);
        flickrPage.linkText.appendChild( document.createTextNode('') );
        flickrPage.linkText.addEventListener('mouseover', function(){ this.select(); } );

        lo.insertAdjacentHTML('afterBegin', "<span class='ASLinfo'>Copy & Paste code below:</span><span id='linkSizeName'>Test</span>");
        lo.appendChild( flickrPage.linkText );
        lo.insertAdjacentHTML('beforeEnd', "<br/><span class='ASLinfo'>Add a link:</span><br/>");
        lo.appendChild( linkSizesList );
        lo.insertAdjacentHTML('beforeEnd', "<span id='extraName'></span>");
        lo.insertAdjacentHTML('beforeEnd', "<br/>");
        lo.appendChild( linkExtra );

        document.querySelector("div.Widget").appendChild( lo );
        //document.querySelector("div.Widget").setAttribute('onmouseout', "if(evt.relatedTarget.id == 'photoswftd' || evt.relatedTarget.className == 'RHS' || evt.relatedTarget.id == 'Main'){ document.getElementById('linkOpts').style.opacity=0; document.getElementById('linkOpts').style.visibility='hidden';}");
        document.querySelector("div.Widget").addEventListener('mouseout', flickrPage.hideLinkOpts);
        document.querySelector("div.Widget").style.paddingBottom = '5px';
        linkOpts.addEventListener('mouseout', flickrPage.hideLinkOpts);
        
        if( flickrPage.ASLdefault != 'false' ){
            var fireOn;
            var eventObj = document.createEvent('MouseEvents');
            eventObj.initEvent( 'click', true, true );

            if( flickrPage.ASLdefaultText != '' ){
                //console.log( flickrPage.ASLdefaultText );
                linkExtra.value = flickrPage.ASLdefaultText;
            }

            var ps = document.getElementById('patr-sizes');
            if( !document.querySelector("#linkSizesList > a[size='"+ flickrPage.ASLdefault +"']") ){

                if( flickrPage.ASLdefault == 'viewonblack.com' ){
                    fireOn = document.querySelector("#linkSizesList > a[size='View on Black']");
                    fireOn.dispatchEvent( eventObj );
                }else{
                    var biggest = ps.querySelector('a:last-of-type').getAttribute('size');
                    fireOn = document.querySelector("#linkSizesList > a[size='"+ biggest +"']");
                    fireOn.dispatchEvent( eventObj );
                }

            }else{
                fireOn = document.querySelector("#linkSizesList > a[size='"+ flickrPage.ASLdefault +"']");
                fireOn.dispatchEvent( eventObj );
            }
                
        }
    }
}

flickrPage.extraLinkOpts = function( evt ){
    var le = document.getElementById('linkExtra');
    le.value = document.getElementById('extraName').innerText = evt.currentTarget.getAttribute('size');
    //console.log('extraLinkOpts: '+ flickrPage.ASLdefaultText );
    if( flickrPage.ASLdefaultText != '' ){ le.value = flickrPage.ASLdefaultText; }
    var extra = new Array();
    extra[1] = "<a href='"+ evt.target.getAttribute('link') +"'>";
    extra[2] = le.value;
    extra[3] = "</a>";
    for( var i = 1; i < 4; i++ ){
        if( flickrPage.linkText.childNodes[i] ){
            flickrPage.linkText.childNodes[i].nodeValue = extra[i];
        }else{
            flickrPage.linkText.appendChild( document.createTextNode( extra[i] ) );
        }
    }
}

flickrPage.extraChange = function( evt ){
    flickrPage.linkText.childNodes[2].nodeValue = document.getElementById('linkExtra').value;
    flickrPage.linkText.select();
}

flickrPage.showLinkOpts = function( evt ){
    var title = document.querySelector("meta[name='title']").getAttribute('content');
    var user = document.querySelector("b[property='foaf:name']").innerText;
    var link = "<a href='"+ document.querySelector("link[rel='canonical']").href +"' ";
    link += "title='"+ title +" by "+ user +", on Flickr, via Patr' ";
    link += "alt='"+ title +"' ";
    link += "height='"+ evt.target.getAttribute('pHeight') +"' width='"+ evt.target.getAttribute('pWidth') +"'>";
    link += "<img src='"+ evt.target.href +"' alt='"+ title +"'/></a>\r";
    flickrPage.linkText.childNodes[0].nodeValue = link;
    document.getElementById('linkSizeName').innerText = evt.target.getAttribute('size');
    flickrPage.linkOpts.style.zIndex = '5000';
    flickrPage.linkOpts.style.opacity = '1'; 
}

flickrPage.hideLinkOpts = function( evt ){
    var rel = evt.relatedTarget;
    console.log( rel.className );
    if( rel.className && rel.className == 'Widget' ) return;
    if( evt.target.nodeName != 'DIV') return;
    while( rel != evt.target && rel.nodeName != 'BODY' ){
        rel = rel.parentNode
        if( rel == evt.target ) return;
    }
    flickrPage.linkOpts.style.opacity = 0;
    setTimeout("flickrPage.linkOpts.style.zIndex = -1", 250);
}

function preFlic(){

    var shortURL = flickrPage.flic ? flickrPage.flic.href : flic_kr( flickrPage.photoID );

        var ul = document.querySelector("ul > li[class='Stats']").parentNode;
        var li = document.createElement('li');
        var flink = document.createElement('a');

        li.setAttribute('class', 'Stats');
        li.appendChild( flink );

        flink.setAttribute('href', '#' );
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
    //console.log('after .send');
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

flickrPage.enhancePool = function(){
    console.log('enhancements coming...');
    var pPhotos = document.querySelectorAll(".HoldPhotos > .RecentPhotos");
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

    var feat = document.getElementsByClassName('stats-featured');
    var lastli = document.querySelector("ul > li[style*='margin-bottom']");
    for( i = 0; i < feat.length; i++ ){
        lastli.insertAdjacentElement('beforeBegin', feat[i]);
    }

}


flickrPage.niceStats = function(){
    //Let's put some fancy stats on the stats pages...
    /*
    var breakdown_today = document.querySelectorAll(".yesterday .breakdown tbody tr");
    var stats = {};

    var tmpURL = 'http://chart.apis.google.com/chart?'
                        + 'cht=p'
                        + '&chf=bg,s,00000000'
                        + '&chs=350x200'
                        + '&chco=0000FF'
                        + '&chdlp=t';
    console.log( tmpURL );
    // chl = labels on chart, chd = chart data, chdl = legend labels
    var chl = chd = chdl = '';

    for(var i = 0; i < breakdown_today.length; i++ ){
        var name = breakdown_today[i].firstElementChild.innerText;
        var num = breakdown_today[i].firstElementChild.nextElementSibling.innerText;
        var per = breakdown_today[i].firstElementChild.nextElementSibling.nextElementSibling.innerText;

        chl += name.split(' ',1)[0] +' ('+ per +')|';
        chd += ( parseInt( per ) === NaN ) ? 1+',' : parseInt( per )+',';
        chdl += num +' '+ name +'|';
    }
    chl = chl.slice(0, -1);
    chd = chd.slice(0, -1);
    chdl = escape( chdl.slice(0, -1) );
    tmpURL += '&chd=t:'+ chd +'&chl='+ chl +'&chdl='+ chdl;
    console.log( tmpURL );
    var today =  document.querySelector('#refs .yesterday');
    var img = document.createElement('img');
    img.src = tmpURL;
    img.style.marginTop = '5px';
    today.insertBefore( img , today.querySelector('.detail') );
    */
    var today = {};
    today.ref = {};
    today.ref.name = document.querySelectorAll('.yesterday > table.breakdown td.name');
    today.ref.num = document.querySelectorAll('.yesterday > table.breakdown td.num');
    today.ref.per = document.querySelectorAll('.yesterday > table.breakdown td.per');
    today.ref.url = flickrPage.chartURL( 'pie', today.ref );
    today.ref.img = document.createElement('img');
    today.ref.img.src = today.ref.url;
    today.ref.table = document.querySelector('.yesterday table.breakdown') || false;
    if( today.ref.table ){
        today.ref.table.parentNode.insertBefore( today.ref.img, today.ref.table );
    }
}

flickrPage.chartURL = function( type, obj ){
//  http://chart.apis.google.com/chart?cht=p&chd=t:60,12,2,24&chs=350x150&chl=Flickr (60%25)|Search (12%25)|Other (2%25)|Unkown (24%25)&chdl=Flickr|Search|Other|Unknown&chdlp=t&chf=bg,s,00000000

    console.log( obj );
    // expectin an obj that has name(label), chartdata, and possibly more chart label stuff
    var tmpURL = 'http://chart.apis.google.com/chart?';
    tmpURL += 'chf=bg,s,00000000'
            + '&chs=350x150'
            + '&chco=0000FF'
            + '&chdlp=t';

    var cht = chd = chl = chdl = '';

    if( obj.per && type == 'pie' ){ // percent is present, chart that as 'pie'
        cht = 'cht=p';
        for( var i = 0; i < obj.per.length; i++ ){
            chd += parseInt( obj.per[i].innerText.replace('<','') ) +',';
            chl += obj.name[i].innerText.split(' ')[0] +'%20';
            chl += '('+ escape( obj.per[i].innerText) +')|';

        }
        chd = chd.slice(0,-1);
        chl = chl.slice(0,-1);
        tmpURL += '&'+ cht
        + '&chd=t:' + chd
        + '&chl=' + chl;
        console.log( tmpURL );
        return tmpURL;
    }


}

flickrPage.scroller = function(){
    //std flickr pool count is 30
    // start getting next page +900
    console.log( 'offsetY: '+ window.scrollY );
    var g_id = document.querySelector("#headersearchform > input[name='w']").value;
    var pool = location.href.match(/\/groups\/(.*)\/pool\//)[1];
    var p_pattern = /\/pool\/page(\d+)\//;
    var match, page = 0;

    if( match = location.href.match(/\/pool\/page(\d+)\//) ){
        page = parseInt( match[1] );
    }

    if( window.scrollY > flickrPage.scroller.triggerHeight && flickrPage.scroller.test ){
        flickrPage.scroller.test = false;
        chrome.extension.sendRequest( { type: 'cAPI',
                                        fn: 'groups.pools.getPhotos',
                                        params: {
                                            group_id: g_id,
                                            per_page: 30,
                                            page: page+1,
                                            extras: 'url_s, path_alias',
                                            api_key: flickrPage.api_key,
                                            auth_hash: flickrPage.auth_hash,
                                            auth_token: '',
                                            src: 'js' } },
                function( response ){
                    console.log( response );
                    if( response.stat == 'ok' ){

                        //Add this page to Main div
                        var rpp = response.photos.photo;
                        for( var key in rpp ){
                            var p = document.querySelector('.HoldPhotos > p').cloneNode( true );
                            p.id = 'pool_'+ rpp[key].id;
                            var a = p.getElementsByTagName('a');
                            a[0].href= '/photos/'+ rpp[key].pathalias +'/in/'+ pool ; // add group name after here
                            a[0].title = rpp[key].title;
                            a[0].firstElementChild.src = rpp[key].url_s;
                            a[0].firstElementChild.alt = rpp[key].title;
                            a[1].href = '/photos/'+ rpp[key].pathalias;
                            a[1].innerText = rpp[key].ownername;
                            document.querySelector('#Main > .HoldPhotos').appendChild( p );
                        }
                        flickrPage.scroller.test = true;
                        flickrPage.scroller.triggerHeight = document.querySelector(".HoldPhotos > p:last-child").offsetTop;
                        console.log( flickrPage.scroller.triggerHeight );
                    }
                });
    }
}


flickrPage.addBlackUploads = function(){
        var allLike = document.createElement('a');
        allLike.href = 'javascript:;';
        allLike.className = 'plain';
        allLike.name = 'patr-All';
        allLike.style.float = 'right';
        allLike.style.fontSize = '11px';
        allLike.addEventListener('click', flickrPage.allLikeThis);
        allLike.innerText = "All";

        var userURL = document.head.querySelector("script[type='text/javascript']").innerText;
        userURL = userURL.match( /photos_url = '(.*)'/)[1];

        var descriptionBoxes = document.querySelectorAll("textarea[name^='description']");
        var photoID;

        var links = new Array();
        links[0] = ["http://bighugelabs.com/onblack.php?size=large&id=PHOTOID", 'BHL On Black'];
        links[1] = ["http://www.fluidr.comURLPHOTOID", 'Fluidr'];
        links[2] = ["http://www.darckr.com/photo?width=1024&photoid=PHOTOID", 'Darckr'];
        links[3] = ["http://viewonblack.com/flickr/PHOTOID", 'viewonblack.com'];


        for( var i = 0; i < descriptionBoxes.length; i++ ){
            var all = allLike.cloneNode(true);
            var allTitle = allLike.cloneNode(true);
            all.addEventListener('click', flickrPage.allLikeThis);
            all.addEventListener('mouseover', function(){ this.innerText = "Make all descriptions like this one"; } );
            all.addEventListener('mouseout', function(){ this.innerText = "All"; } );
            allTitle.addEventListener('click', flickrPage.allLikeThis);
            allTitle.addEventListener('mouseover', function(){ this.innerText = "Make all titles like this one"; } );
            allTitle.addEventListener('mouseout', function(){ this.innerText = "All"; } );
            descriptionBoxes[i].previousElementSibling.insertAdjacentElement('afterEnd', all);
            descriptionBoxes[i].previousElementSibling.parentNode.previousElementSibling.insertAdjacentElement('afterBegin', allTitle);

            var onBlack = document.createElement('div');
            onBlack.className = 'onBlackList';
            onBlack.insertAdjacentHTML('afterBegin', "<span style='color: #666; font-size: 11px;'>Add a link:</span><br/>");

            var link;
            photoID = descriptionBoxes[i].id.split('_')[1];

            var a = document.createElement('a');
            a.setAttribute('style', "font-size: 11px; line-height: 1.2em;");
            a.href = "javascript:;";
            a.className = 'plain';

                for( var j = 0; j < links.length; j++ ){
                    link = links[j][0].replace('URL', userURL);
                    link = link.replace('PHOTOID', descriptionBoxes[i].id.split('_')[1]);
                    var b = a.cloneNode(true);
                    b.setAttribute('link', link);
                    b.setAttribute('txtareaid', descriptionBoxes[i].id);
                    b.innerHTML = links[j][1];
                    b.addEventListener('click', flickrPage.addBlackLink);
                    onBlack.appendChild( b );
                    onBlack.insertAdjacentHTML('beforeEnd', "<br />");
                }
            descriptionBoxes[i].parentNode.appendChild( onBlack );
            var ud = descriptionBoxes[i];
            while( ud.className != 'data' ){
                ud = ud.parentNode;
            }
            ud.addEventListener('mouseout', flickrPage.hideUpOpts);
            ud.addEventListener('mouseover', flickrPage.showUpOpts);
            flickrPage.showUploadOptions = false;
            onBlack.addEventListener('webkitTransitionEnd', doZ, false);
        }
}

flickrPage.showUpOpts = function( e ){
    if( flickrPage.showUploadOptions == false ){
        flickrPage.showUploadOptions = true;

        var all = e.currentTarget.querySelectorAll("a[name='patr-All']");
        for(var i = 0; i < all.length; i++ ){ all[i].style.opacity = '1'; }
        e.currentTarget.querySelector("div.onBlackList").style.top = 0;
        var onBlackBox = e.currentTarget.querySelector("div.onBlackList");
        e.currentTarget.querySelector("div.photo_tags").style.top = 0;
    }
}

function doZ( e ){ 
    e.currentTarget.style.zIndex = e.currentTarget.style.top == '-90px' ? -1 : 0;
}   

flickrPage.hideUpOpts = function( e ){
    var rel = e.relatedTarget;
    while( rel != e.currentTarget && rel.nodeName != 'BODY' ){
        rel = rel.parentNode;
        if( rel == e.currentTarget ) return;
    }

    if( flickrPage.showUploadOptions == true ){
        var h = e.currentTarget.querySelectorAll("div[class^='photo_'] > a[href='javascript:;']");
        for( var i = 0; i < h.length; i++ ){
            h[i].style.opacity = 0;
        }
        var top = -90;
        e.currentTarget.querySelector("div.onBlackList").style.zIndex = -1;
        e.currentTarget.querySelector("div.onBlackList").style.top = top;
        e.currentTarget.querySelector("div.photo_tags").style.top = top;
        flickrPage.showUploadOptions = false;
    }
}

flickrPage.addBlackLink = function( e ){
    //console.log( e.currentTarget );
    var txt = document.getElementById( e.currentTarget.getAttribute('txtareaid'));
    var start = txt.selectionStart;
    var end = txt.selectionEnd;
    var qTxt = "<a href='"+ e.currentTarget.getAttribute('link') +"'>"+ e.currentTarget.innerText +"</a>";

    txt.value = txt.value.substring(0, start)
        + qTxt
        + txt.value.substring(end, txt.value.length);

}

flickrPage.allLikeThis = function( e ){
    if( e.currentTarget.parentNode.className == 'photo_description' ){
        var txt = e.currentTarget.nextElementSibling.value;
        var desc = document.querySelectorAll("textarea[name^='description_']");

        for( var i = 0; i < desc.length; i++ ){
            var reg = new RegExp( e.currentTarget.nextElementSibling.id.split('_')[1], "g");
            desc[i].value = txt.replace( reg, desc[i].id.split('_')[1] );
        }

    }else if( e.currentTarget.parentNode.className == 'photo_title' ){
        var txt = e.currentTarget.parentNode.querySelector("input").value;
        var title = document.querySelectorAll("input[name^='title_']");
        for( var i = 0; i < title.length; i++ ){
            title[i].value = txt;
        }
    }
}

flickrPage.doArchives = function(){
    var aList = new Array();
    flickrPage.doArchives.txt = '';
    flickrPage.doArchives.csv = '';
    // Add a link like: <a href="data:text/plain;one,two,three%0A%0Dfour,five,six">LINK</a>
    var aButton = document.createElement('span');
    aButton.className = 'Butt';
    aButton.innerHTML = 'Get Archive List';
    aButton.id = 'aButton';
    aButton.addEventListener('click', flickrPage.doArchives.getList );
    document.querySelector("td.Intro").insertAdjacentElement('beforeEnd', aButton);
    
}

flickrPage.doArchives.getList = function( page_num ){
    var aButton = document.getElementById('aButton');
    //var aMeter = document.getElementById('aMeter');
    var progress = '-webkit-gradient(linear, 0 0, 100% 0, from(green), to(#0063DC), color-stop(POINT, green), color-stop(POINT, green), color-stop(POINT, #0063DC))';
    if( page_num.currentTarget ){ 
        page_num = 1;
        aButton.removeEventListener('click', flickrPage.doArchives.getList );
        aButton.innerHTML = "<img src='"+ chrome.extension.getURL('images/balls-24x12-trans-patr.gif') +"'/> Loading your archives...";
        aButton.style.background = progress.replace(/POINT/g, '0');
        //aMeter.style.display = 'inline';
    }

    chrome.extension.sendRequest( { type: 'cAPI',
                                    fn: 'people.getPhotos',
                                    params: {
                                        user_id: flickrPage.user_id,
                                        //user_id: "56815560@N00",
                                        //user_id: "39543045@N06",
                                        per_page: 500,
                                        page: page_num,
                                        extras: 'license, date_upload, date_taken, original_format, path_alias, views',
                                        api_key: flickrPage.api_key,
                                        auth_hash: flickrPage.auth_hash,
                                        auth_token: '',
                                        src: 'js' } },
            function( response ){
                if( response.stat == 'ok' ){
                    console.log( response );
                    
                    var rpp = response.photos.photo;
                    var txt = "";
                    var csv = '';
                    

                    if( response.photos.page == response.photos.pages ){
                        console.log('Done!');
                        for(var i = 0; i < rpp.length; i++ ){
                                var date_taken = new Date( rpp[i].datetaken );
                                var date_upload = new Date( rpp[i].dateupload * 1000 );
                                txt += "<tr><td><a href='http://www.flickr.com/photos/"+ rpp[i].pathalias +'/'+ rpp[i].id +"'>"+ rpp[i].title +"</a></td>"+
                                "<td name='dTaken' stamp='"+ date_taken.valueOf() +"'>"+ 
                                date_taken.toLocaleDateString().slice( date_taken.toLocaleDateString().indexOf(',')+2 ) +
                                " "+ date_taken.getHours()+':'+date_taken.getMinutes()+':'+date_taken.getSeconds() +
                                "</td>"+
                                "<td>"+ 
                                date_upload.toLocaleDateString().slice( date_upload.toLocaleDateString().indexOf(',')+2 ) +
                                " "+ date_upload.getHours()+':'+date_upload.getMinutes()+':'+date_upload.getSeconds() +
                                "</td>"+
                                "<td>"+ rpp[i].views +"</td></tr>";
                                csv += '"'+ escape(rpp[i].title) +'","'+ 
                                    rpp[i].datetaken +'","'+
                                    date_upload.getFullYear() +'-'+ (date_upload.getMonth()+1) +'-'+ date_upload.getDate() +' '+
                                    date_upload.getHours()+':'+ date_upload.getMinutes() +':'+ date_upload.getSeconds() +'","'+
                                    rpp[i].views +'"%0A';
                        }
                        flickrPage.doArchives.txt += txt;
                        flickrPage.doArchives.csv += csv;
                        aButton.style.background = 'green';
                        flickrPage.doArchives.showList();
                    }else{
                        //console.log( response.photos.page );
                        //console.log( response.photos.pages );
                        flickrPage.doArchives.getList( response.photos.page + 1 );
                        for(var i = 0; i < rpp.length; i++ ){
                                var date_taken = new Date( rpp[i].datetaken );
                                var date_upload = new Date( rpp[i].dateupload * 1000 );
                                txt += "<tr><td><a href='http://www.flickr.com/photos/"+ rpp[i].pathalias +'/'+ rpp[i].id +"'>"+ rpp[i].title +"</a></td>"+
                                "<td name='dTaken' stamp='"+ date_taken.valueOf() +"'>"+ 
                                date_taken.toLocaleDateString().slice( date_taken.toLocaleDateString().indexOf(',')+2 ) +
                                " "+ date_taken.getHours()+':'+date_taken.getMinutes()+':'+date_taken.getSeconds() +
                                "</td>"+
                                "<td>"+ 
                                date_upload.toLocaleDateString().slice( date_upload.toLocaleDateString().indexOf(',')+2 ) +
                                " "+ date_upload.getHours()+':'+date_upload.getMinutes()+':'+date_upload.getSeconds() +
                                "</td>"+
                                "<td>"+ rpp[i].views +"</td></tr>";
                                csv += '"'+ escape(rpp[i].title) +'","'+ 
                                    rpp[i].datetaken +'","'+
                                    date_upload.getFullYear() +'-'+ (date_upload.getMonth()+1) +'-'+ date_upload.getDate() +' '+
                                    date_upload.getHours()+':'+ date_upload.getMinutes() +':'+ date_upload.getSeconds() +'","'+
                                    rpp[i].views +'"%0A';
                        }
                        flickrPage.doArchives.txt += txt;
                        flickrPage.doArchives.csv += csv;
                        aButton.style.background = progress.replace(/POINT/g, (response.photos.page/response.photos.pages) );
                    }
                }
            });
}

flickrPage.doArchives.showList = function(){
    //console.log( flickrPage.doArchives.txt );
    var dMain = document.querySelector('div#Main');
    var aTable = document.createElement('table');
    aTable.className = 'patr-aTable';
    aTable.style.width = '100%';
    var fda = flickrPage.doArchives.aList;
    aTable.innerHTML = "<thead><tr><th>Title</th><th>Date Taken</th><th>Date Uploaded</th><th>Views</th></tr></thead><tbody>";
    aTable.innerHTML += flickrPage.doArchives.txt;
    aTable.innerHTML += "</tbody></table>";

    dMain.querySelector('form').insertAdjacentElement('afterEnd', aTable);

    //document.querySelector("td.Intro").insertAdjacentHTML('beforeEnd', "<a href='data:text/plain;null,Title,Date%20Taken,Date%20Uploaded%0A"+ flickrPage.doArchives.csv +"'>Download</a>");
    document.getElementById('aButton').innerHTML = "<a style='color: white; text-decoration: none;' href='data:text/plain;null,Title,Date%20Taken,Date%20Uploaded,Views%0A"+ flickrPage.doArchives.csv +"'>Download List <span style='font-weight: normal; font-size: 11px;'>(Right click, 'Save link as...', filename.CSV, Save as type: All Files)</span></a>";
}
