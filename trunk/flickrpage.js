// flickrpage.js
//
// flickrPage contains functions for dealing with page parameters

var flickrPage = {

   getID : function() {
             var p = document.location.href.split("/");
             return p[5];
           },

   getURL : function() {
              return document.querySelector("link[rel='canonical']").href ;
            },
   
   getImageURL : function() {
                   return document.querySelector("link[rel='image_src']").href ;
                 }

};
