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
    console.log('doDiscuss()');
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
        
        /* OLD STUFF - PROBABLY DELETE THIS LATER
        var qDiv = document.createElement('div');
        qDiv.style.visibility = 'hidden';
        qDiv.style.padding = '5px';
        qDiv.style.backgroundColor = '#888';
        qDiv.id = 'qDiv';
        var an = document.createElement('span');
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
        an.href = ani.href = 'javascript:;';
        an.innerHTML = '<span id="qNameText">LV426</span> <b>said:</b>';
        ani.innerHTML = 'LV426';
        qDiv.name = an.name = ani.name = 'qDivEl';
        qDiv.appendChild( an );
        qDiv.appendChild( or );
        qDiv.appendChild( ani );
        qDiv.appendChild( said );
        qDiv.appendChild( document.createElement('br') );
        qDiv.appendChild( quote );
        */
        var qDiv = document.createElement('div');
        qDiv.id = 'qDiv';

        var nameButton = document.createElement('span');
        nameButton.id = 'nameButt';
        nameButton.className = 'qButton';

        var qName = document.createElement('span');
        qName.setAttribute('Name', 'qName');
        qName.id = 'qName';

        nameButton.insertAdjacentHTML('beforeEnd', ' ');
        nameButton.appendChild( qName );
        nameButton.insertAdjacentHTML('beforeEnd', ' <b>said:</b>');

        var bothButton = nameButton.cloneNode(true);
        bothButton.id = 'bothButt';

        var qIcon = document.createElement('img');
        qIcon.setAttribute('height', '24px');
        bothButton.insertBefore( qIcon, bothButton.childNodes[0] );
        var qBoth = bothButton.querySelector('[name="qName"]');
        qBoth.id = 'qBoth';

        var quote = document.createElement('blockquote');
        quote.id = 'qQuote';

        qDiv.appendChild( nameButton );
        qDiv.insertAdjacentHTML('beforeEnd', ' ');
        qDiv.appendChild( bothButton );
        qDiv.insertAdjacentHTML('beforeEnd', '<br/>');
        qDiv.appendChild( quote );

        function addReplies( type , sSize ){

            var peeps = document.querySelectorAll("td.Said > h4 > a[href^='/photos/']");
            peeps = peeps.length != 0 ? peeps : document.querySelectorAll('h4[data-ywa-name^="Commenter"] > a[href^="/photos/"]');
            if( peeps.length == 0 ){
                peeps = document.querySelectorAll("span.comment-owner > a[href^='/photos/']");
            }
            //console.log( peeps );

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
                    rImageSmall.link = "<img src='";
                    if( flickrPage.isPhotoPage ){
                        rImageSmall.link += peeps[key].parentNode.parentNode.parentNode.previousElementSibling.querySelector('img').src;
                    }else{
                        rImageSmall.link += peeps[key].parentNode.parentNode.previousElementSibling.querySelector("img").src;
                    }
                     rImageSmall.link +=  "' width='" + sSize + "' height='" + sSize + "'>";
                     //console.log( rImageSmall.link );
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

                    if( type == 'under' && !flickrPage.isPhotoPage ){

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

                    }else if( type == 'foot' && !flickrPage.isPhotoPage ){
                        
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

                    }else if( flickrPage.isPhotoPage ){ // Put buddy reply options in new location for photo pages
                    }

                    rImage.onmousedown = pasteLink;
                    rImageSmall.onmousedown = pasteLink;
                    rName.onmousedown = pasteLink;
                    rNameB.onmousedown = pasteLink;
					rBoth.onmousedown = pasteLink;

                    /* MORE OLD STUFF
                    function pasteLink(){
                        var start = txt.selectionStart;
                        var end = txt.selectionEnd;
                        txt.value = txt.value.substring(0, start)
                            + this.link
                            + txt.value.substring(end, txt.value.length);
                        return false;
                    }
                    */

                    if( flickrPage.isPhotoPage ){
                        var said = peeps[key].parentNode.parentNode.parentNode;
                        //console.log( 'said: '+said );
                        said.addEventListener('mouseup', doQuote);
                        said.setAttribute('icon_src', peeps[key].parentNode.parentNode.parentNode.previousElementSibling.querySelector('img').src );
                        said.setAttribute('user_link', peeps[key].href );
                        said.setAttribute('who', peeps[key].innerHTML );
                        var ca = peeps[key].parentNode.parentNode.parentNode.previousElementSibling.querySelector('a[name^="comment"]');
                        var commentLink = (ca) ? ca.name : null;
                        //console.log('commentLink: '+ commentLink );
                        said.setAttribute('commentLink', commentLink);
                        qDiv.style.marginTop = '10px';
                    }else{
                        var said = peeps[key].parentNode.parentNode;
                        //console.log( 'said: '+said);
                        said.addEventListener('mouseup', doQuote);
                        said.setAttribute('icon_src', peeps[key].parentNode.parentNode.previousElementSibling.querySelector('img').src );
                        said.setAttribute('user_link', peeps[key].href );
                        said.setAttribute('who', peeps[key].innerHTML );
                        var ca = peeps[key].parentNode.parentNode.previousElementSibling.querySelector('a[name^="comment"]');
                        var commentLink = (ca) ? ca.name : null;
                        //console.log('commentLink: '+ commentLink );
                        said.setAttribute('commentLink', commentLink);
                    }
                    
                }
            }

            nameButton.addEventListener('click', addQuote, false);
            bothButton.addEventListener('click', addQuote, false);
            function addQuote( el ){
                
                var start = txt.selectionStart;
                var end = txt.selectionEnd;
                var qTxt = '';
                if( el.currentTarget.id == 'bothButt' ){
                    qTxt = '['+ qDiv.getAttribute('user_link') +'] ';
                }
                qTxt += '<b>'+ qDiv.getAttribute('username');
                if( qDiv.getAttribute('commentlink') != 'null' ){
                    qTxt += ' <a href="#'+ qDiv.getAttribute('commentlink') +'">said:</a></b>';
                }else{
                    qTxt += ' said:</b>';
                }
                qTxt += '<blockquote><b>&#8220;</b><em>'+ quote.innerHTML +'</em><b>&#8221;</b></blockquote>';

                txt.value = txt.value.substring(0, start)
                    + qTxt
                    + txt.value.substring(end, txt.value.length);
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
                var qText = document.getSelection();
                if( !qText.isCollapsed && el.target.getAttribute('name') != 'qDivEl' && qText != ' '){
                    quote.innerHTML = qText;
                    qName.innerText = qBoth.innerText = el.currentTarget.getAttribute('who');
                    qIcon.src = el.currentTarget.getAttribute('icon_src');
                    qDiv.setAttribute('commentlink', el.currentTarget.getAttribute('commentlink') );
                    qDiv.setAttribute('user_link', el.currentTarget.getAttribute('user_link') );
                    qDiv.setAttribute('username', el.currentTarget.getAttribute('who') );
                    el.currentTarget.appendChild( qDiv );
                }else{
                }
                
            }
    }
}
