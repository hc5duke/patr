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

// flickrdiscuss.js
//
// flickrDiscuss contains functions for dealing with discussion page parameters

var discuss = (document.getElementsByName('message').length > 0 ); 

if( discuss ){

    addReplies();

    function addReplies(){
        var peeps = document.querySelectorAll("h4 > a[href^='/photos/']");
		var txt = document.querySelector("textarea[name='message']");
        for( var key in peeps ){
            if( parseInt(key+1) ){
                console.log( 'key: '+ key +' peeps[key]: '+ peeps[key] );
                var respond = document.createElement('div');
                var rImage = document.createElement('a');
                var rName = document.createElement('a');
                var r = document.createElement('small');

                r.innerHTML = ' reply by ';
                rImage.innerHTML = "<small>Image</small>";
                rName.innerHTML = "<small>Name</small>";
				rImage.link = '['+ peeps[key].href +']'; 
				rName.link = peeps[key].innerHTML;
				rImage.href = 'javascript:;';
				rName.href = 'javascript:;';

                respond.appendChild( r );
                respond.appendChild( rName );
				respond.appendChild( document.createTextNode(' ') );
                respond.appendChild( rImage );
                peeps[key].parentNode.insertBefore( respond, peeps[key].nextSibling );

				respond.className = 'responseDiv';
				respond.style.left = respond.offsetLeft - peeps[key].offsetWidth;
				respond.style.top = respond.offsetTop + peeps[key].offsetHeight - 1;

				peeps[key].parentNode.onmouseover = function () { this.querySelector("div").style.webkitTransform = 'scaleY(1)'; }
				peeps[key].parentNode.onmouseout = function () { this.querySelector("div").style.webkitTransform = 'scaleY(0)'; }
				rImage.onmousedown = pasteLink;
				rName.onmousedown = pasteLink;


				function pasteLink(){
					var start = txt.selectionStart;
					var end = txt.selectionEnd;
					txt.value = txt.value.substring(0, start)
						+ this.link
						+ txt.value.substring(end, txt.value.length);
					return false;
				}
            }
        }
    }



}
