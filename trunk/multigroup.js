// flickrMultiGroup.js
//
// Object to handle asynchronous sending to multiple groups at once

var multiGroup = {};

//setup the table for showing all the users groups
multiGroup.preLoad = function(){
    multiGroup.mgDiv = document.createElement('div');
    //multiGroup.mgDiv.style.backgroundColor = '#0F0F0F';
    multiGroup.mgDiv.id = 'mgDiv';
    multiGroup.mgDiv.style.textAlign = 'center';
    multiGroup.mgDiv.innerHTML = '<table id="mgTable" style="width: 100%; display: none; opacity: 100; background-color: inherit;"></table>';
    document.getElementById('About').parentNode.insertBefore( multiGroup.mgDiv, document.getElementById('About') );
    multiGroup.mgTable = document.getElementById('mgTable');

    var no = document.createElement('style');
    no.innerText += ' #sendToGroupDialogDiv { display: none !important; }';
    document.documentElement.appendChild( no );
    document.getElementById('photo_gne_button_send_to_group').addEventListener( 'click', multiGroup.start, false );
    multiGroup.ballsImg = document.createElement('img');
    multiGroup.ballsImg.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
}

multiGroup.start = function(){
    if( ! multiGroup.groups ){
        multiGroup.balls( 'start' );
        // Get all the groups for this person
        chrome.extension.sendRequest( { type: 'cAPI', 
                                        fn: 'groups.pools.getGroups', 
                                        params: { api_key: flickrPage.api_key, 
                                                  auth_hash: flickrPage.auth_hash, 
                                                  auth_token: '', 
                                                  src: 'js' } },
            function( response ){
            //multiGroup.balls( 'stop' );
            multiGroup.groups = response.groups.group;
            multiGroup.doList();
            }
        );

    // Get all the groups this photo is already in

    }
}

multiGroup.doList = function(){
    for( var key in multiGroup.groups ){
        if( (1 - key%2) ){
            var tr = document.createElement('tr');
        }
        var td = document.createElement('td');
        td.innerText = multiGroup.groups[key].name;
        td.id = multiGroup.groups[key].id;
        td.addEventListener('click', multiGroup.Add, false);
        tr.appendChild( td );
        if( !(1 - key%2) ){
            multiGroup.mgTable.appendChild( tr );
        }
    }
    multiGroup.mgTable.style.display = 'block';
    multiGroup.balls();
}

multiGroup.Add = function( el ){
    var id = el.target.id;
    //below will remove the current listener, to change it to remove from group
    //el.target.removeEventListener('click', multiGroup.Add, false);
    var theseBalls = document.createElement('img');
    theseBalls.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
    theseBalls.id = 'balls-'+id;
    theseBalls.style.width = '12px';
    el.target.insertBefore( theseBalls, el.target.childNodes[0] );
    chrome.extension.sendRequest( { type: 'cAPI',
                                    fn: 'groups.pools.add',
                                    params: { photo_id: flickrPage.photoID,
                                              group_id: id,
                                              api_key: flickrPage.api_key,
                                              auth_hash: flickrPage.auth_hash,
                                              auth_token: '',
                                              src: 'js' } },
                function( response ){ //Added ok - so change listener to remove, and show yay!
                    console.log( response );
                    if( response.stat == 'ok' ){

                    }else if( response.stat == 'fail' ){ // Problem, tell em what it is
                        theseBalls.src = '';
                        var err = '<br><small>'+response.message+'</small>';
                        el.target.innerHTML += err;
                    }
                });
}


multiGroup.balls = function( com ){
    //var ballsImg = document.createElement('img');
    var theseBalls = multiGroup.ballsImg;
    if( com == 'start' ){
        //ballsImg.id = 'ballsImg';
        //ballsImg.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
        theseBalls.id = 'ballsImg';
        multiGroup.mgDiv.appendChild( theseBalls );
    }else{
        document.getElementById('ballsImg').style.display = 'none';
    }
}
