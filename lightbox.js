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
test
*/

// lightbox.js
//
// Creating the lightbox object

// TURNING THIS OFF DUE TO FLICKR HAVING NATIVE LIGHTBOX!
/*
 
var lightBox = {};

lightBox.image = new Image();
lightBox.bg = document.createElement('div');
lightBox.bg.id = 'pattr-lightbox-bg';

lightBox.preLoad = function(){

	this.image.src = flickrPage.lb_src;

	this.bg.appendChild( lightBox.image );
	document.body.appendChild( lightBox.bg );

	this.bg.style.visibility = 'hidden';
	this.setOrigin();
	this.setListeners();
}

lightBox.doLightBox = function() {
	
	if( lightBox.open ){ // If LB is already open, close it
       lightBox.open = false ;
       lightBox.setOrigin();
       return lightBox.open ;
	} 

	lightBox.setShow();
};

lightBox.setOrigin = function() {

    var tis = lightBox.image.style;
    var img = document.querySelector("div[class='photoImgDiv']");

    tis.position = 'absolute';
    tis.margin = 20;
    console.log('doing offsetLeft here');
    tis.left = img.offsetLeft - tis.margin.replace('px','');
	tis.top = img.offsetTop - tis.margin.replace('px','');
	tis.maxHeight = flickrPage.reflect.height;
	tis.maxWidth = flickrPage.reflect.width;
	tis.opacity = '0';
    tis.webkitBoxShadow = '0 0 0px #000';
	tis.webkitTransition = '300ms';

	this.bg.style.webkitTransition = '300ms';
	this.bg.style.backgroundColor = 'rgba(0,0,0,0)';
	this.bg.style.visibility = 'hidden';

}

lightBox.setShow = function() {

    var tis = this.image.style;
    var ti = this.image;
    if( ti.naturalWidth == 0 ) return;


    tis.maxHeight = document.body.clientHeight - 2*tis.margin.replace('px','');
    tis.maxWidth = document.body.clientWidth - 2*tis.margin.replace('px','') ;
    tis.top = 0;
	var natHW = ti.naturalHeight / ti.naturalWidth;

	//There has got to be a better way to set these dimensions...
    if( ti.naturalWidth < tis.maxWidth.replace('px','') ){
        if( ti.naturalHeight < tis.maxHeight.replace('px','') ){
            tis.left = (document.body.clientWidth/2) - (ti.naturalWidth/2) - tis.margin.replace('px','') ;
        }else{
            tis.left = (document.body.clientWidth/2) - 
                (tis.maxHeight.replace('px',''))*(ti.naturalWidth/ti.naturalHeight)/2 -
                tis.margin.replace('px','');
        }
    }else{ // naturalWidth > maxWidth
		if( ti.naturalHeight > tis.maxHeight.replace('px','') ){
            tis.left = (document.body.clientWidth/2) - (tis.maxHeight.replace('px','') ) * ( (1/natHW)/2 ) - 
				tis.margin.replace('px','');
			tis.left = (tis.left.replace('px','') < 0) ? 0 : tis.left;
		}else{
			tis.left = 0;
		}
    }

	tis.opacity = '1';
	tis.webkitBoxShadow = '0 0 30px #000';

	this.bg.style.visibility = 'visible';
	this.bg.style.backgroundColor = 'rgba(0,0,0,0.92)';

    lightBox.open = true;

}

lightBox.setListeners = function() {

	flickrPage.reflect.addEventListener('mousedown', doLB, false);

	this.bg.addEventListener('mousedown', doLB, false);

	function doLB( e ){
		if( e.button == 0 ){ // button: 0 = left mouse
			lightBox.doLightBox();
		}
	}
}

// 
// These functions below should be moved to a utility js file
// So we can get to them everywhere...

function getStyle( obj, prop ){
    return document.defaultView.getComputedStyle( obj, null ).getPropertyValue( prop );
};

function findPos(obj){
    var curleft = curtop = 0;
    if( obj.offsetParent){
        do{
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while ( obj = obj.offsetParent );
    return [curleft, curtop];
    }
};

*/
