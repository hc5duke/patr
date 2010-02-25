// flickrMultiGroup.js
//
// Object to handle asynchronous sending to multiple groups at once

var multiGroup = {};

multiGroup.preLoad = function(){
    multiGroup.mgDiv = document.createElement('div');
    multiGroup.mgDiv.style.backgroundColor = '#0F0F0F';
    multiGroup.mgDiv.id = 'mgDiv';
    multiGroup.mgDiv.innerHTML = '<table id="mgTable" style="width: 100%;"><tr><td></td><td></td></tr></table>';
    document.getElementById('About').parentNode.insertBefore( multiGroup.mgDiv, document.getElementById('About') );
}
