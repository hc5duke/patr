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

	var type = 'foot';
	
    addReplies( type );

    function addReplies( type ){

        var peeps = document.querySelectorAll("h4 > a[href^='/photos/']");
		var txt = document.querySelector("textarea[name='message']");
        for( var key in peeps ){
            if( parseInt(key+1) ){
                var respond = document.createElement('div');
                var rImage = document.createElement('a');	
				var rImageSmall = document.createElement('a');
                var rName = document.createElement('a');
                var r = document.createElement('small');

                r.innerHTML = ' reply by ';
                rImage.innerHTML = "<small>Image</small>";
				rImageSmall.innerHTML = "<small>&frac12; Image</small>";
                rName.innerHTML = "<small>Name</small>";
				rImage.link = '['+ peeps[key].href +']'; 
				rImageSmall.link = "<img src='"
						+ peeps[key].parentNode.parentNode.previousElementSibling.querySelector("img").src
						+ "' width='24' height='24'>";
				rName.link = peeps[key].innerHTML;
				rImage.href = 'javascript:;';
				rImageSmall.href = 'javascript:;';
				rName.href = 'javascript:;';

                respond.appendChild( r );
                respond.appendChild( rName );
				respond.appendChild( document.createTextNode(' ') );
                respond.appendChild( rImage );
				respond.appendChild( document.createTextNode(' ') );
				respond.appendChild( rImageSmall );

				if( type == 'under' ){
					peeps[key].parentNode.insertBefore( respond, peeps[key].nextSibling );

					respond.className = 'responseDiv';
					respond.style.left = respond.offsetLeft - peeps[key].offsetWidth;
					respond.style.top = respond.offsetTop + peeps[key].offsetHeight - 1;

					peeps[key].parentNode.onmouseover = function () { this.querySelector("div").style.webkitTransform = 'scaleY(1)'; }
					peeps[key].parentNode.onmouseout = function () { this.querySelector("div").style.webkitTransform = 'scaleY(0)'; }
				}else if( type == 'foot' ){
					var p = peeps[key].parentNode.nextElementSibling.querySelector("small");
					var a = p.querySelectorAll("a");
					var last = a[a.length-1].nextSibling;
					rImage.className = rName.className = rImageSmall.className = 'Plain';
					rImage.innerHTML = "icon";
					rImageSmall.innerHTML = "&frac12; icon";
					rName.innerHTML = "name";

					var res = document.createElement('span')
					res.appendChild( document.createTextNode(' | ') , last);
					res.appendChild( rName, last );
					res.appendChild( document.createTextNode(' | ') , last);
					res.appendChild( rImage, last );
					res.appendChild( document.createTextNode(' | ') , last);
					res.appendChild( rImageSmall, last );
					p.insertBefore( res, last );
				}


				rImage.onmousedown = pasteLink;
				rImageSmall.onmousedown = pasteLink;
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
