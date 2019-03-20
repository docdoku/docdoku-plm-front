/*global define,App*/
define([
    'backbone',
    'common-objects/websocket/channel',
    'common-objects/websocket/channelListener',
    'common-objects/websocket/channelMessagesType',
    'modules/coworkers-access-module/app',
    'modules/user-popover-module/app',
    'modules/chat-module/app',
    'modules/webrtc-module/app'
], function (Backbone, Channel, ChannelListener, ChannelMessagesType, CoWorkersAccessModuleView, UserPopoverModule, chatListener, webRTCInvitationListener) {
	'use strict';

    if(App.config.admin){
        return {};
    }

    var userStatusListener = new ChannelListener({

        isApplicable: function (messageType) {
            return messageType === ChannelMessagesType.USER_STATUS;
        },

        onMessage: function (message) {
            Backbone.Events.trigger('UserStatusRequestDone', message);
        },

        onStatusChanged: function () {

        }

    });

    App.mainChannel = new Channel();
    App.mainChannel.addChannelListener(userStatusListener);
    App.mainChannel.addChannelListener(webRTCInvitationListener);
    App.mainChannel.addChannelListener(chatListener);
    App.mainChannel.init(App.config.webSocketEndPoint);

    return {
        CoWorkersAccessModuleView: CoWorkersAccessModuleView
    };

});
