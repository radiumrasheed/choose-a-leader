/**
 * Created by oladapo on 6/27/15.
 */
'use strict';

module.exports = function (ct) {
    ct = ct||5;
    var text = "",
        possible = 'ABCDEFGHJKLMNPQRSTUVWXY123456789';
    for( var i=0; i < ct; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};