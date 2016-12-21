navigator.webkitPersistentStorage.queryUsageAndQuota(
  function(usedBytes, grantedBytes) {
    console.log("We are using", usedBytes, " of ", grantedBytes, " bytes");
  },
  function(e) {
    console.log("Error", e);
  }
);


var launchAniChrome = function () {
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
