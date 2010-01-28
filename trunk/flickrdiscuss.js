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

    var txtarea = document.getElementsByName('message')[0];
    console.log( txtarea );
    addReplies();

    function addReplies(){
        var peeps = document.querySelectorAll("h4 > a[href^='/photos/']");
        for( var key in peeps ){
            if( parseInt(key+1) ){
                console.log( 'key: '+ key +' peeps[key]: '+ peeps[key] );
                var respond = document.createElement('div');
                var rImage = document.createElement('a');
                var rName = document.createElement('a');
                var r = document.createElement('small');
                respond.style.display = 'inline';
                r.innerHTML = ' respond by';
                rImage.innerHTML = " <small>Image</small>";
                rName.innerHTML = " <small>Name</small>";
                rImage.setAttribute('onclick', '');
                respond.appendChild( r );
                respond.appendChild( rName );
                respond.appendChild( rImage );
                respond.style.backgroundColor = 'blue';
                respond.style.webkitTransform = 'rotate(30deg)';
                peeps[key].parentNode.insertBefore( respond, peeps[key].nextSibling );
                //peeps[key].parentNode.insertBefore( rImage, peeps[key].nextSibling);
                //peeps[key].parentNode.insertBefore( rName, rImage );
                //peeps[key].parentNode.insertBefore( r, rName );
            }
        }
    }
    

}
