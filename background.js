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
    chrome.notifications.clear(id, function() {
      launchAniChrome();
    });
  }
};

chrome.app.runtime.onLaunched.addListener(launchAniChrome);
chrome.notifications.onClicked.addListener(onNotificationsClicked);
chrome.notifications.onButtonClicked.addListener(function(id, buttonIndex) {
  if(id.indexOf("notification_newmessage_") !== -1) {
    var action_id = id.substring(24);
    var action;
    var action_display;
    if(buttonIndex === 0) {
      action = "read";
      action_display = "read";
    } else if(buttonIndex === 1){
      action = "delete";
      action_display = "deleted";
    }
    chrome.notifications.clear(id, function() {
      chrome.storage.local.get({
        credentials_username: "",
        credentials_password: "",
        credentials_loggedIn: false
      }, function(data) {
        console.log("Notification clicked");
        if(data.credentials_loggedIn) callAjax(data);
      });
      function callAjax(storage) {
        $.ajax({
          url: "http://www.matomari.tk/api/0.4/methods/user.messages.2.php",
          method: "POST",
          dataType: "json",
          username: storage.credentials_username,
          password: storage.credentials_password,
          data: JSON.stringify({
            id: action_id,
            action: action
          }),
          error: function(jqXHR, textStatus, errorThrown) {
            chrome.notifications.create("notification_newmessage_markas" + action_display + "_error", {
              type: "basic",
              title: "Error marking as " + action_display,
              message: "Could not mark message with action_id " + action_id + " as " + action_display + "\nStatus:" + jqXHR.status,
              iconUrl: "images/notification_warning_red.png"
            }, function() {
              chrome.notifications.clear("notification_newmessage_markas" + action_display + "_error", function() {});
            }, 4000);
          },
          success: function(data) {
            if(data.error) {
              chrome.notifications.create("notification_newmessage_markas" + action_display + "_error", {
                type: "basic",
                title: "Error marking as " + action_display,
                message: data.error,
                iconUrl: "images/notification_warning_red.png"
              }, function() {
                window.setTimeout(function() {
                  chrome.notifications.clear("notification_newmessage_markas" + action_display + "_error", function() {});
                }, 4000);
              });
              return;
            }
          }
        });
      }
    });
  }
});
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

function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

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
      url: "http://www.matomari.tk/api/0.4/methods/user.messages.php",
      method: "GET",
      username: storage.credentials_username,
      password: storage.credentials_password,
      error: function(jqXHR, textStatus, errorThrown) {
        chrome.notifications.create("notification_newmessage_error", {
          type: "basic",
          title: "Error when loading new messages",
          message: jqXHR.status + " - " + textStatus,
          iconUrl: "images/notification_warning_red.png"
        }, function() {});
      },
      success: function(data) {
        console.log(storage.data_messages);
        console.log(data);
        chrome.storage.local.set({
          data_messages: data
        }, function() {
          for(var i = 0; i < data.messages.length; i++) {
            if(data.messages[i].read === false) {
              createNewMessageNotification(data.messages[i], i + 1);
            }
          }
        });
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
      url: "http://www.matomari.tk/api/0.4/methods/user.notifications.php",
      method: "GET",
      dataType: "json",
      username: storage.credentials_username,
      password: storage.credentials_password,
      error: function(jqXHR, textStatus, errorThrown) {
        chrome.notifications.create("notification_newnotification_error", {
          type: "basic",
          title: "Error when loading new notifications",
          message: jqXHR.status + " - " + textStatus,
          iconUrl: "images/notification_warning_red.png"
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
    url: "http://www.matomari.tk/api/0.4/methods/user.info.USERNAME.php?username=" + message.sender.username,
    method: "GET",
    datatType: "json",
    error: function(jqXHR, textStatus, errorThrown) {
      chrome.notifications.create("notification_newnotification_error", {
        type: "basic",
        title: "Error when loading user image for " + message.sender.username,
        message: jqXHR.status + " - " + textStatus,
        iconUrl: "images/notification_warning_red.png"
      }, function() {});
    },
    success: function(data) {
      showNotification(data);
    }
  });
  function showNotification(userInfo) {
    var options = {
      type: "basic",
      title: message.sender.username + " - " + htmlDecode(message.subject),
      message: htmlDecode(message.body_preview),
      buttons: [
        {
          title: "Mark as read",
          iconUrl: "images/notification_check.png"
        },
        {
          title: "Delete",
          iconUrl: "images/notification_delete.png"
        }
      ]
    };
    var xhr = new XMLHttpRequest();
    xhr.open("GET", userInfo.image_url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      var blob = this.response;
      options.iconUrl = window.URL.createObjectURL(blob);
      chrome.notifications.create("notification_newmessage_" + message.action_id, options, function() {});
    };
    xhr.send();
  }
}
