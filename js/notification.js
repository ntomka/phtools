var Notifications = {
    notifications: new Array(),
    enabled: function (type) {
        if (Options.notificationsEnabled == 0) {
            return false;
        }
        switch (type) {
            case "message" :
                if (Options.messagesNotificationEnabled == 0) {
                    return false;
                }
                break;
            case "networkError" :
                if (Options.errorsNotificationEnabled == 0) {
                    return false;
                }
                break;
            case "topic" :
                if (Options.topicsNotificatonEnabled == 0) {
                    return false;
                }
                break;
        }
        return true;
    },
    cancel: function () {
        chrome.notifications.clear(Notifications.notifications[0].id, function (wasCleared) {
        });
    },
    add: function (type, title, body) {
        if (!Notifications.enabled(type)) {
            return;
        }
        if (body == null) {
            body = '';
        }
        // generate random id
        var id = Math.random().toString(36).substring(2);
        //TODO: gombok és egyéb implementálása
        chrome.notifications.create(id, {
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: title,
            message: body
        }, function () {
        });
        chrome.notifications.onClosed.addListener(function (id, byUser) {
            for (i = 0; i < Notifications.notifications.length; i++) {
                if (Notifications.notifications[i].id == id) {
                    Notifications.notifications[i] = null;
                    break;
                }
            }
            Notifications.notifications = Notifications.notifications.clean();
        });
        Notifications.notifications.push({
            type: type,
            id: id
        });
        window.setTimeout("Notifications.cancel()", Options.notificationTimeout);
        if (type == "networkError")
            console.log(new Date(), "Hálózati hiba: " + title + " ; " + body);
    }
};
