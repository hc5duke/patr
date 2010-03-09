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
    if( !discuss ){ 
        discuss = (document.querySelectorAll('textarea[name="body"]').length > 0 );
        txt = document.querySelector("textarea[name='body']");
    }


    if( discuss && txt ){
        
        chrome.extension.sendRequest( {type:"localStorage", param:['briFooter', 'briUnder', 'iconSmallSize'] },
            function( response ){
                var type = (response.briFooter == 'true') ? 'foot' : 'under';
                addReplies( type , response.iconSmallSize);
            });
        
        var qDiv = document.createElement('div');
        qDiv.style.visibility = 'hidden';
        qDiv.style.padding = '5px';
        qDiv.style.backgroundColor = '#888';
        qDiv.id = 'qDiv';
        var an = document.createElement('a');
        var ani = document.createElement('a');
        var quote = document.createElement('span');
        var or = document.createElement('span');
        or.setAttribute('name', 'qDivEl');
        or.innerText = ' OR ';
        var said = document.createElement('span');
        said.setAttribute('name', 'qDivEl');
        said.innerHTML = '<b> said:</b>';
        an.className = ani.className = 'Plain';
        an.id = 'qName';
        ani.id = 'qBoth';
        an.href = ani.href = '#';
        an.innerHTML = ani.innerHTML = 'LV426';
        qDiv.name = an.name = ani.name = 'qDivEl';
        qDiv.appendChild( an );
        qDiv.appendChild( or );
        qDiv.appendChild( ani );
        qDiv.appendChild( said );
        qDiv.appendChild( document.createElement('br') );
        qDiv.appendChild( quote );
        
        

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
					var rBoth = document.createElement('a');
                    var r = document.createElement('small');

                    r.innerHTML = ' reply by ';
                    rImage.innerHTML = "<small>Image</small>";
                    rImageSmall.innerHTML = "<small> [&#0392;]</small>";
                    rName.innerHTML = "<small>Name</small>";
                    rNameB.innerHTML = '<small> [b]</small>';
					rBoth.innerHTML = '<small>both</small>';
                    rImage.link = '['+ peeps[key].href +']'; 
                    rImageSmall.link = "<img src='"
                            + peeps[key].parentNode.parentNode.previousElementSibling.querySelector("img").src
                            + "' width='" + sSize + "' height='" + sSize + "'>";
                    rName.link = peeps[key].innerHTML;
                    rNameB.link = "<b>"+ rName.link +"</b>";
					rBoth.link = '['+ peeps[key].href +'] <b>'+ peeps[key].innerHTML +'</b> ';
                    rImage.href = rImageSmall.href = rName.href = rNameB.href = 'javascript:;';
                    rImageSmall.href = 'javascript:;';
                    rName.href = 'javascript:;';
                    rNameB.href = 'javascript:;';
					rBoth.href = 'javascript:;';

                    // Trying something for Quotr
                    /*
                    var p = peeps[key].parentNode.parentNode.getElementsByTagName('p')[0];
                    p.setAttribute('icon_src', peeps[key].parentNode.parentNode.previousElementSibling.querySelector('img').src );
                    */

                    if( type == 'under' ){

                        respond.appendChild( r );
                        respond.appendChild( rName );
                        respond.appendChild( rNameB );
                        respond.appendChild( document.createTextNode(' ') );
                        respond.appendChild( rImage );
                        respond.appendChild( rImageSmall );
                        respond.appendChild( document.createTextNode(' ') );
						respond.appendChild( rBoth );

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
                        rBoth.className = rImage.className = rNameB.className = rName.className = rImageSmall.className = 'Plain';
                        rImage.innerHTML = "icon";
                        rImageSmall.innerHTML = " [&#0392;]";
                        //rImage.title = "Paste icon";
                        //rImageSmall.title = "Paste custom icon size";
                        rName.innerHTML = "name";
                        rNameB.innerHTML = ' [b]';
						rBoth.innerHTML = "both";
                        //rName.title = "Paste users name";
                        //rNameB.title = "Paste users name in bold";

                        var res = document.createElement('span')
                        res.appendChild( document.createTextNode(' | ') );
                        res.appendChild( rName );
                        res.appendChild( rNameB );
                        res.appendChild( document.createTextNode(' | ') );
                        res.appendChild( rImage );
                        res.appendChild( rImageSmall );
						res.appendChild( document.createTextNode(' | ') );
						res.appendChild( rBoth );

                        p.insertBefore( res, last );
                    }

                    rImage.onmousedown = pasteLink;
                    rImageSmall.onmousedown = pasteLink;
                    rName.onmousedown = pasteLink;
                    rNameB.onmousedown = pasteLink;
					rBoth.onmousedown = pasteLink;

                    /*
                    function pasteLink(){
                        var start = txt.selectionStart;
                        var end = txt.selectionEnd;
                        txt.value = txt.value.substring(0, start)
                            + this.link
                            + txt.value.substring(end, txt.value.length);
                        return false;
                    }
                    */

                    var said = peeps[key].parentNode.parentNode;
                    said.addEventListener('mouseup', doQuote);
                    said.setAttribute('icon_src', peeps[key].parentNode.parentNode.previousElementSibling.querySelector('img').src );
                    said.setAttribute('who', peeps[key].innerHTML );
                    var ca = peeps[key].parentNode.parentNode.previousElementSibling.querySelector('a[name^="comment"]');
                    var commentLink = (ca) ? ca.name : null;
                    said.setAttribute('commentLink', commentLink);
                    
                }
            }

            an.addEventListener('click', addQuote, false);
            ani.addEventListener('click', addQuote, false);
            function addQuote( el ){
                console.log('===== addQuote =====');
                console.log( el.target );
                console.log( quote.innerHTML );
                return false;
            }

        }

            function pasteLink(){
                var start = txt.selectionStart;
                var end = txt.selectionEnd;
                txt.value = txt.value.substring(0, start)
                    + this.link
                    + txt.value.substring(end, txt.value.length);
                return false;
            }

            function doQuote( el ){
                //alert( el.target );
                //alert('doQuote');
                //console.log('el.target:');
                //console.log( el.target );
                //console.log('=====\nel.currentTarget');
                //console.log( el.currentTarget );
                var qText = document.getSelection();
                if( !qText.isCollapsed && el.target.getAttribute('name') != 'qDivEl' ){
                    //an.innerHTML = el.currentTarget.getAttribute('who');
                    //ani.innerHTML = '<img src="'+ el.currentTarget.getAttribute('icon_src')
                                    + '" width="24" height="24"/> '+ el.currentTarget.getAttribute('who');
                    //qDiv.innerHTML += '<br/><span class="quote" name="qDivEl">'+ qText +'</span>';
                    quote.innerHTML = qText;
                    el.currentTarget.appendChild( qDiv );
                    qDiv.style.visibility = 'visible';
                }else{
                    //qDiv.style.visibility = 'hidden';
                }
                
            }
        function addQuote( el ){
            alert('hi');
        }
    }

}
