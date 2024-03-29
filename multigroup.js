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
    multiGroup.mgTable.innerHTML = '<tr><th colspan=2 class="mgHeader">Sendr - Add to Multiple Groups</th></tr>';

    var no = document.createElement('style');
    no.innerText += ' #sendToGroupDialogDiv { display: none !important; }';
    document.documentElement.appendChild( no );
    document.getElementById('photo_gne_button_send_to_group').addEventListener( 'click', multiGroup.start, false );
    multiGroup.ballsImg = document.createElement('img');
    //multiGroup.ballsImg.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
    multiGroup.ballsImg.src = chrome.extension.getURL('images/balls-24x12-trans-patr.gif');

    document.body.insertAdjacentHTML('beforeEnd', "<div id='mgInfo'>mgINFO</div>");
    document.getElementById('mgInfo').addEventListener('mouseout', multiGroup.Info.hide, false);
}

multiGroup.start = function(){
    if( ! multiGroup.groups ){
        multiGroup.balls( 'start' );

        document.getElementById('photo_gne_button_send_to_group').removeEventListener( 'click', multiGroup.start, false );
        document.getElementById('photo_gne_button_send_to_group').addEventListener( 'click', multiGroup.close, false );

        // Get all the groups for this person
        chrome.extension.sendRequest( { type: 'cAPI', 
                                        fn: 'groups.pools.getGroups', 
                                        params: { api_key: flickrPage.api_key, 
                                                  auth_hash: flickrPage.auth_hash, 
                                                  auth_token: '', 
                                                  src: 'js' } },
            function( response ){
                if( response.stat == 'ok' ){
                multiGroup.groups = response.groups.group;

                // Get all the groups this photo is already in
                chrome.extension.sendRequest( { type: 'cAPI',
                                                fn: 'photos.getAllContexts',
                                                params: { photo_id: flickrPage.photoID,
                                                          api_key: flickrPage.api_key } },
                            function( response ){
                                if( response.stat == 'ok' ){
                                    multiGroup.inGroup = {}
									if( response.pool ){
										for( var i = 0; i < response.pool.length; i++ ){
											multiGroup.inGroup[response.pool[i].id] = null;
										}
									}
                                    multiGroup.doList();
                                }else{
                                    console.log( 'Error retrieving current groups for this photo!' );
                                    multiGroup.inGroup = {};
                                    multiGroup.doList();
                                }
                            });

                }else{
                    console.log('ERROR: retrieving group list');
                }
            }
        );
        
    }else{ // We already had it open, so just show the div again!
        multiGroup.mgDiv.style.display = 'block';
        document.getElementById('photo_gne_button_send_to_group').removeEventListener( 'click', multiGroup.start, false );
        document.getElementById('photo_gne_button_send_to_group').addEventListener( 'click', multiGroup.close, false );
    }
}

multiGroup.doList = function(){
    // This was the old way, non-sorted by column, but it works fine
    var mgg = multiGroup.groups;
    var half = Math.ceil( mgg.length/2 );
    for( var i = 0; i < half; i++ ){
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        var td2 = document.createElement('td');
        td.innerText = mgg[i].name;
        td.id = mgg[i].id;
        td.innerHTML += '<br><small id="msg-'+ mgg[i].id +'" style="display: none;" class="mg-msg"></small>';
        if( mgg[i].id in multiGroup.inGroup ){
            td.addEventListener('click', multiGroup.Remove, false);
            td.addEventListener('contextmenu', multiGroup.Info, false);
            td.className = 'mg-ingroup';
            //td.setAttribute('title','Remove from group');
        }else{
            td.addEventListener('click', multiGroup.Add, false);
            td.addEventListener('contextmenu', multiGroup.Info, false);
            td.className = 'mg-group';
            //td.setAttribute('title','Add to group');
        }
        tr.appendChild( td );
        if( mgg[ i + half ] ){
            td2.innerText = mgg[i+half].name;
            td2.id = mgg[i+half].id;
            td2.innerHTML += '<br><small id="msg-'+ mgg[i+half].id +'" style="display: none;" class="mg-msg"></small>';
            if( mgg[i+half].id in multiGroup.inGroup ){
                td2.addEventListener('click', multiGroup.Remove, false);
                td2.addEventListener('contextmenu', multiGroup.Info, false);
                td2.className = 'mg-ingroup';
                //td2.setAttribute('title','Remove from group');
            }else{
                td2.addEventListener('click', multiGroup.Add, false);
                td2.addEventListener('contextmenu', multiGroup.Info, false);
                td2.className = 'mg-group';
                //td2.setAttribute('title','Add to group');
            }
        tr.appendChild( td2 );
        }
        multiGroup.mgTable.appendChild( tr );
    }
    multiGroup.mgTable.style.display = 'block';
    multiGroup.balls();
}

multiGroup.Info = function( e ){
    e.preventDefault();
    var mgInfo = document.getElementById('mgInfo');
    mgInfo.innerHTML = '<span>'+ e.target.innerText +'</span>';
    mgInfo.insertAdjacentHTML('beforeEnd','<br/>');

    var info = "<span style='font-size: 11px; font-weight: normal;'><a style='text-decoration: none; border-right: dotted 1px gray;' href='http://www.flickr.com/groups/"+ e.target.id +"' target='_new'>Page </a>"+
        "<a style='text-decoration: none;' href='http://www.flickr.com/groups/"+ e.target.id +"/rules' target='_new'>&nbsp;Rules</a></span>";
    mgInfo.insertAdjacentHTML('beforeEnd',info );
    mgInfo.style.top = e.pageY - (mgInfo.offsetHeight == 0 ? 41 : mgInfo.offsetHeight) + 5;
    mgInfo.style.left = e.pageX - 5;
    mgInfo.style.display = 'block';
}

multiGroup.Info.hide = function( e ){
    var rel = e.relatedTarget || null;
    if( e.target.nodeName != 'DIV') return;
    while( rel != e.target && rel.nodeName != 'BODY' ){
        rel = rel.parentNode;
        if( rel == e.target ) return;
    }
    e.target.style.display = 'none';
}

multiGroup.Add = function( el ){
    var id = el.target.id;
    var theseBalls = document.createElement('img');
    var msg = document.getElementById('msg-'+id);
    //theseBalls.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
    theseBalls.src = chrome.extension.getURL('images/balls-24x12-trans-patr.gif');
    theseBalls.id = 'balls-'+id;
    theseBalls.style.width = '18px';
    el.target.insertBefore( theseBalls, el.target.childNodes[0] );
    chrome.extension.sendRequest( { type: 'cAPI',
                                    fn: 'groups.pools.add',
                                    params: { photo_id: flickrPage.photoID,
                                              group_id: id,
                                              api_key: flickrPage.api_key,
                                              auth_hash: flickrPage.auth_hash,
                                              auth_token: '',
                                              src: 'js' } },
                function( response ){
                    if( response.stat == 'ok' ){
                        el.target.removeEventListener('click', multiGroup.Add, false);
                        theseBalls.src = 'http://l.yimg.com/g/images/icon_check.png';
                        theseBalls.style.width = '18';
                        theseBalls.style.float = 'left';
                        msg.innerHTML = 'Added!';
                        msg.style.display = 'inline';
                        msg.className = 'mg-msg';
                        el.target.className = 'mg-ingroup';

                        el.target.addEventListener('click', multiGroup.Remove, false);

                    }else if( response.stat == 'fail' ){ // Problem, tell em what it is
                        //theseBalls.src = '';
                        if( response.code == 6 || response.code == 7){
                            el.target.removeEventListener('click', multiGroup.Add, false);
                            theseBalls.src = chrome.extension.getURL('images/icon_check_gray.png');
                            theseBalls.style.width = '18';
                            theseBalls.style.float = 'left';
                            msg.innerHTML = response.message;
                            msg.style.display = 'inline';
                            msg.className = 'mg-msg';
                            el.target.className = 'mg-ingroup';
                            el.target.addEventListener('click', multiGroup.Remove, false);
                        }else{
                            el.target.removeEventListener('click', multiGroup.Add, false);
							theseBalls.src = chrome.extension.getURL('images/icon_!_red.png');
                            msg.innerHTML = response.message;
                            msg.style.display = 'inline';
                        }
                    }
                });
}

multiGroup.Remove = function( el ) {
    var id = el.target.id;
    var msg = document.getElementById('msg-'+id);
    var theseBalls = document.getElementById('balls-'+id) || document.createElement('img');
    //theseBalls.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
    theseBalls.src = chrome.extension.getURL('images/balls-24x12-trans-patr.gif');
    el.target.insertBefore( theseBalls, el.target.childNodes[0] );
    chrome.extension.sendRequest( { type: 'cAPI',
                                    fn: 'groups.pools.remove',
                                    params: { photo_id: flickrPage.photoID,
                                              group_id: id,
                                              api_key: flickrPage.api_key,
                                              auth_hash: flickrPage.auth_hash,
                                              auth_token: '',
                                              src: 'js' } },
                function( response ){
                    if( response.stat == 'ok' ){
                        msg.style.display = 'inline';
                        el.target.removeEventListener('click', multiGroup.Remove, false);
                        
                        theseBalls.style.display = 'none';
                        msg.innerHTML = 'Removed!';
                        el.target.className = 'mg-group';
                        
                        el.target.addEventListener('click', multiGroup.Add, false);
                    }else if( response.stat == 'fail' ){
                        theseBalls.src = chrome.extension.getURL('images/icon_!_red.png');
                        theseBalls.style.width = '18';
                        msg.innerHTML = response.message;
                        msg.style.display = 'inline';
                    }
                });
}

multiGroup.close = function(){
    multiGroup.mgDiv.style.display = 'none';
    document.getElementById('photo_gne_button_send_to_group').removeEventListener( 'click', multiGroup.close, false );
    document.getElementById('photo_gne_button_send_to_group').addEventListener( 'click', multiGroup.start, false );
}

multiGroup.balls = function( com ){
    //var ballsImg = document.createElement('img');
    var theseBalls = multiGroup.ballsImg;
    if( com == 'start' ){
        //ballsImg.id = 'ballsImg';
        //ballsImg.src = 'http://l.yimg.com/g/images/progress/balls-24x12-trans.gif';
        theseBalls.id = 'ballsImg';
        theseBalls.style.marginTop = '10px';
        multiGroup.mgDiv.appendChild( theseBalls );
    }else{
        document.getElementById('ballsImg').style.display = 'none';
    }
}

function noDisplay( el ){
    el.style.display = 'none';
    el.style.webkitTransition = 'opacity 0';
    el.style.opacity = '100';
}
