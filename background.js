var launchAniChrome = function () {
  queryMessages();
  queryNotifications();
  chrome.app.window.create('main.html', {
    outerBounds: {
      width: 800,
      height: 600
    },
    //alwaysOnTop: true,
    resizable: false,
    frame: {
      type: 'chrome',
      color: '#2e51a2'
    }
  });
};

var onNotificationsClicked = function(id) {
  // Only launch if no other windows exist.
  var windows = chrome.app.window.getAll();
  if (windows && windows.length === 0) {
    chrome.notifications.clear(id, function() {}); // Callback required.
    launchAniChrome();
  }
};
chrome.app.runtime.onLaunched.addListener(launchAniChrome);
chrome.notifications.onClicked.addListener(onNotificationsClicked);
chrome.alarms.onAlarm.addListener(function(alarm) {
  if(alarm.name == "queryMessages") {
    console.log("Querying for new messages...");
    queryMessages();
    console.log("Querying for new notifications...");
    queryNotifications();
    chrome.alarms.create("queryMessages", {
      when: Date.now() + 300000
    });
  }
});

chrome.alarms.create("queryMessages", {
  when: Date.now() + 300000 // 5 minute,
});


function queryMessages() {
  chrome.storage.local.get({
    credentials_username: "",
    credentials_password: "",
    credentials_loggedIn: false,
    data_messages: {
      messages: [],
      total: 0
    }
  }, function(data) {
    callAjax(data);
  });
  function callAjax(storage) {
    $.ajax({
      url: "http://www.matomari.tk/api/0.3/user/messages.php",
      method: "GET",
      username: storage.credentials_username,
      password: storage.credentials_password,
      error: function(jqXHR, textStatus, errorThrown) {
        chrome.notifications.create("notification_newmessage_error", {
          type: "basic",
          title: "Error when loading new messages",
          message: jqXHR.status + " - " + textStatus,
          iconUrl: "icons/64.png"
        }, function() {});
      },
      success: function(data) {
        console.log(storage.data_messages);
        console.log(data);
        for(var i = 0; i < data.messages.length; i++) {
          if(data.messages[i].read === false) {
            createNewMessageNotification(data.messages[i], i + 1);
          }
        }
        /*var newmessageCount = data.total - storage.data_messages.total;
        if(newmessageCount === 0) {
          // No new messages
          return;
        }
        if(newmessageCount > 5) {
          chrome.notifications.create("notification_newmessage_count", {
            type: "basic",
            title: "New Messages",
            message: "You have " + newmessageCount.toString() + " new messages!",
            iconUrl: "icons/128.png"
          }, function() {
            window.setTimeout(function() {
              chrome.notifications.clear("notification_newmessage_count", function() {});
            }, 10000);
          });
        }
        chrome.storage.local.set({
          data_messages: data
        }, function() {
          for(var i = 0; i < newmessageCount; i++) {
            createNewMessageNotification(data.messages[i], i + 1);
          }
        });*/
      }
    });
  }
}

function queryNotifications() {
  chrome.storage.local.get({
    credentials_username: "",
    credentials_password: "",
    credentials_loggedIn: false,
    data_notifications: {
      notifications: [],
      total: 0
    }
  }, function(data) {
    callAjax(data);
  });
  function callAjax(storage) {
    $.ajax({
      url: "http://www.matomari.tk/api/0.3/user/notifications/Example.json",
      method: "GET",
      username: storage.credentials_username,
      password: storage.credentials_password,
      error: function(jqXHR, textStatus, errorThrown) {
        chrome.notifications.create("notification_newnotification_error", {
          type: "basic",
          title: "Error when loading new notifications",
          message: jqXHR.status + " - " + textStatus,
          iconUrl: "icons/64.png"
        }, function() {});
      },
      success: function(data) {
        var newnotificationCount = data.items.length - storage.data_notifications.total;
        if(newnotificationCount === 0) {
          // No new messages
          return;
        }
        if(newnotificationCount > 5) {
          chrome.notifications.create("notification_newnotification_count", {
            type: "basic",
            title: "New Notifications",
            message: "You have " + newnotificationCount.toString() + " new notifications!",
            iconUrl: "icons/128.png"
          }, function() {
            window.setTimeout(function() {
              chrome.notifications.clear("notification_newnotification_count", function() {});
            }, 10000);
          });
        }
        chrome.storage.local.set({
          data_notifications: {
            notifications: data.items,
            total: data.items.length
          }
        }, function() {
          for(var i = 0; i < newnotificationCount; i++) {
            createNewNotificationNotification(data.items[i], i + 1);
          }
        });
      }
    });
  }
}

function createNewNotificationNotification(notification, i) {
  chrome.notifications.create("notification_newnotification_" + notification.id, {
    type: "basic",
    title: notification.categoryName,
    message: notification.url + "\n" + notification.createdAtForDisplay,
    iconUrl: "icons/128.png"
  }, function() {});
}

function createNewMessageNotification(message, i) {
  $.ajax({
    url: "http://www.matomari.tk/api/0.3/user/info/" + message.sender.username + ".json",
    method: "GET",
    error: function(jqXHR, textStatus, errorThrown) {
      chrome.notifications.create("notification_newnotification_error", {
        type: "basic",
        title: "Error when loading new notifications",
        message: jqXHR.status + " - " + textStatus,
        iconUrl: "icons/128.png"
      }, function() {});
    },
    success: function(data) {
      showNotification(data);
    }
  });
  function showNotification(userInfo) {
    var options = {
      type: "basic",
      title: message.sender.username + " - " + message.subject,
      message: message.body_preview,
      buttons: [
        {
          title: "Mark as read",
          iconUrl: "icons/64.png"
        }
      ]
    };
    var xhr = new XMLHttpRequest();
    xhr.open("GET", userInfo.profile_image);
    xhr.responseType = "blob";
    xhr.onload = function() {
      var blob = this.response;
      options.iconUrl = window.URL.createObjectURL(blob);
      chrome.notifications.create("notification_newmessage_" + message.id, options, function() {});
    };
    xhr.send();
  }
}
