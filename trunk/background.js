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

chrome.extension.onConnect.addListener(
				function( port ){
						console.assert("wtf");
				});

const API_KEY = "ea1d492fa9803aa760d8039ccb5f73ee";

console.log( 'setting defaults for localstorage...' );

if( localStorage['ecRound'] == undefined ){ localStorage['ecRound'] = true; }
if( localStorage['ecShadow'] == undefined ){ localStorage['ecShadow'] = true; }
if( localStorage['briFooter'] == undefined ){ localStorage['briFooter'] = true; localStorage['briUnder'] = false; }
if( localStorage['iconSmallSize'] == undefined ){ localStorage['iconSmallSize'] = 24; }
if( localStorage['bigPool'] == undefined ){ localStorage['bigPool'] = true; }
if( localStorage['bigPoolNew'] == undefined ){ localStorage['bigPoolNew'] = true; }
if( localStorage['moveInfo'] == undefined ){ localStorage['moveInfo'] = true; }
if( localStorage['nLogo'] == undefined ){ localStorage['nLogo'] = true; }
if( localStorage['addRef'] == undefined ){ localStorage['addRef'] = true; }
if( localStorage['showEXIF'] == undefined ){ localStorage['showEXIF'] = true; }
if( localStorage['showAS'] == undefined ){ localStorage['showAS'] = true; }
if( localStorage['showASL'] == undefined ){ localStorage['showASL'] = true; }
if( localStorage['ASLdefault'] == undefined ){ localStorage['ASLdefault'] = false; }
if( localStorage['ASLdefaultText'] == undefined ){ localStorage['ASLdefaultText'] = ''; }

console.log("Adding chrome.extension.onMessage.addListener...");

//chrome.extension.onRequest.addListener(
chrome.extension.onMessage.addListener(
	function( request, sender, sendResponse) {
			console.log('inside onmessage listener');
	if( request.type == "getSizes"){
		sendResponse( getSizes( request.photo_id ) );
	}else if( request.type == "API" ){
        sendResponse( sendRequest( request.fn, request.params ) );
    }else if( request.type == "cAPI" ){ //make cookie API call - POST
        //console.log('cAPI call\n'+request.fn);
        sendResponse( sendDirty( request.fn, request.params ) );
    }else if( request.type == 'xAPI' ){
        console.log(' xAPI CALLLLL ');
        sendResponse( sendDirtyX( request.fn, request.params ) );
    }else if( request.type == "localStorage" ){
        var param = request.param;
        if( typeof param == 'object' ){
            var value = {};
            for( var key in param ){
                value[ param[key] ] = localStorage[ param[key] ];
            }
        }else{
            var value = localStorage[ request.param ];
        }
        sendResponse( value );
    }
});

// Generic Request function
function sendRequest( type, params ){
  var response;
  var req = new XMLHttpRequest();

  var URL = "http://api.flickr.com/services/rest/?" +
            "method=flickr." + type +"&" +
            "format=json&" +
            "nojsoncallback=1&" +
            "api_key=" + API_KEY;

            for( var opt in params ){
               URL += "&" + opt + "=" + params[opt] ;
            }
            //console.log( 'params: ');
            //console.log( params );

   req.onreadystatechange = function() {
     if( req.readyState == 4 && req.status == 200 ){
         //console.log( 'req.responseText: ');
         //console.log( req.responseText );
         response = JSON.parse( req.responseText );

     }else{
         response = JSON.parse( req.responseText );
     }
   }
   
   req.open( "GET", URL, false );
   req.send(null);

   return response;
}

// Dirty API request
function sendDirty( type, params ){
    console.log('sendDirty' + type +'\n'+params);
    var response;
    var req = new XMLHttpRequest();
    var cookie = params.cookie;
    delete params.cookie;

    var URL = "http://www.flickr.com/services/rest/?" +
            "method=flickr." + type + "&" +
            "format=json&" +
            "nojsoncallback=1&";
            //"api_key=" + API_KEY;

                for( var opt in params ){
               URL += "&" + opt + "=" + params[opt] ;
            }

    // Don't set header data on the call, it will throw an XHR exception...
    req.onreadystatechange = function(){
        if( req.readyState == 4 && req.status == 200 ){
            console.log( 'req.responseText' );
            console.log( req.responseText );
            response = JSON.parse( req.responseText );
        }
    }
    
    req.open("POST", URL, false);
    req.send( cookie );

    return response;
}

function sendDirtyX( type, params ){
    var response;
    var req = new XMLHttpRequest();
    var cookie = params.cookie;
    delete params.cookie;

    var URL = "http://www.flickr.com/services/rest/?" +
            "method=flickr." + type + "&" +
            "format=json&" +
            "nojsoncallback=1&";
            //"api_key=" + API_KEY;

                for( var opt in params ){
               URL += "&" + opt + "=" + params[opt] ;
            }

    // Don't set header data on the call, it will throw an XHR exception...
    req.onreadystatechange = function(){
        if( req.readyState == 4 && req.status == 200 ){
            console.log( 'req.responseText' );
            console.log( req.responseText );
            response = JSON.parse( req.responseText );
        }
    }
    
    req.open("POST", URL, false);
    req.send( cookie );

    return response;
}


