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

function doDiscuss(){

    var discuss = (document.getElementsByName('message').length > 0 ); 
    var txt = document.querySelector("textarea[name='message']");

    if( discuss && txt ){
        
        chrome.extension.sendRequest( {type:"localStorage", param:['briFooter', 'briUnder', 'iconSmallSize'] },
            function( response ){
                var type = (response.briFooter == 'true') ? 'foot' : 'under';
                addReplies( type , response.iconSmallSize);
            });

        function addReplies( type , sSize ){

            var peeps = document.querySelectorAll("td.Said > h4 > a[href^='/photos/']");
            peeps = peeps.length != 0 ? peeps : document.querySelectorAll('h4[data-ywa-name^="Commenter"] > a[href^="/photos/"]');

            for( var key in peeps ){
                if( parseInt(key+1) ){
                    var respond = document.createElement('div');
                    var rImage = document.createElement('a');	
                    var rImageSmall = document.createElement('a');
                    var rName = document.createElement('a');
                    var rNameB = document.createElement('a');
                    var r = document.createElement('small');

                    r.innerHTML = ' reply by ';
                    rImage.innerHTML = "<small>Image</small>";
                    rImageSmall.innerHTML = "<small> [&#0392;]</small>";
                    rName.innerHTML = "<small>Name</small>";
                    rNameB.innerHTML = '<small> [b]</small>';
                    rImage.link = '['+ peeps[key].href +']'; 
                    rImageSmall.link = "<img src='"
                            + peeps[key].parentNode.parentNode.previousElementSibling.querySelector("img").src
                            + "' width='" + sSize + "' height='" + sSize + "'>";
                    rName.link = peeps[key].innerHTML;
                    rNameB.link = "<b>"+ rName.link +"</b>";
                    rImage.href = rImageSmall.href = rName.href = rNameB.href = 'javascript:;';
                    rImageSmall.href = 'javascript:;';
                    rName.href = 'javascript:;';
                    rNameB.href = 'javascript:;';

                    if( type == 'under' ){

                        respond.appendChild( r );
                        respond.appendChild( rName );
                        respond.appendChild( rNameB );
                        respond.appendChild( document.createTextNode(' ') );
                        respond.appendChild( rImage );
                        respond.appendChild( rImageSmall );

                        peeps[key].parentNode.insertBefore( respond, peeps[key].nextSibling );

                        respond.className = 'responseDiv';
                        respond.style.left = respond.offsetLeft - peeps[key].offsetWidth;
                        respond.style.top = respond.offsetTop + peeps[key].offsetHeight - 1;

                        peeps[key].parentNode.onmouseover = function () { this.querySelector("div").style.webkitTransform = 'scaleY(1)'; }
                        peeps[key].parentNode.onmouseout = function () { this.querySelector("div").style.webkitTransform = 'scaleY(0)'; }

                    }else if( type == 'foot' ){
                        
                        var p = peeps[key].parentNode.parentNode.querySelector("small");

                        var a = p.querySelectorAll("a");
                        var last = a[a.length-1].nextSibling;
                        rImage.className = rNameB.className = rName.className = rImageSmall.className = 'Plain';
                        rImage.innerHTML = "icon";
                        rImageSmall.innerHTML = " [&#0392;]";
                        //rImage.title = "Paste icon";
                        //rImageSmall.title = "Paste custom icon size";
                        rName.innerHTML = "name";
                        rNameB.innerHTML = ' [b]';
                        //rName.title = "Paste users name";
                        //rNameB.title = "Paste users name in bold";

                        var res = document.createElement('span')
                        res.appendChild( document.createTextNode(' | ') );
                        res.appendChild( rName );
                        res.appendChild( rNameB );
                        res.appendChild( document.createTextNode(' | ') );
                        res.appendChild( rImage );
                        res.appendChild( rImageSmall );

                        p.insertBefore( res, last );
                    }

                    rImage.onmousedown = pasteLink;
                    rImageSmall.onmousedown = pasteLink;
                    rName.onmousedown = pasteLink;
                    rNameB.onmousedown = pasteLink;

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
}
