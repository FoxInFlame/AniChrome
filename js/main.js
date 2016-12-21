(function() {
  loadScript("libraries/jQuery/jquery-2.2.4.min.js", function() {
    console.log("jQuery loaded");
    loadScript("js/parser.js", function() {
      loadStylesheet("css/base.css", function() {
        console.log("css loaded");
        loadScript("libraries/Waves/waves.min.js", function() {
          loadStylesheet("libraries/Waves/waves.min.css", function() {
            Waves.init();
            launchLogin();
          });
        });
      });
    });
  });
})(window);

function loadScript(src, callback) {
  var scriptElem = document.createElement("script");
  scriptElem.type = "text/javascript";
  scriptElem.onload = function() {
    if(callback) {
      callback();
    }
  };
  scriptElem.src = src;
  document.getElementsByTagName("head")[0].appendChild(scriptElem);
}
function loadStylesheet(src, callback) {
  var linkElem = document.createElement("link");
  linkElem.type = "text/css";
  linkElem.rel = "stylesheet";
  linkElem.onload = function() {
    if(callback) {
      callback();
    }
  };
  linkElem.href = src;
  document.getElementsByTagName("head")[0].appendChild(linkElem);
}
function loadScreen(status) {
  if(status != "finished") status == "loading";
  if(status == "loading") {
    $("#loading").removeClass("finish");
  } else if(status == "finished") {
    $("#loading").addClass("finish");
  }
}

function registerEvents() {
  reloadProfile_navbar();
  $("#navbar_search_icon").on("click", function() {
    $("#navbar #navbar_search").toggleClass("shown");
  });
  $("#navbar #navbar_search_search").keyup(function(event) {
    if(event.keyCode == 13) {
      loadScreen("loading");
      $("#content").load("sections/animeSearch.html #content > *", function() {
        loadScript("js/animeSearch.js", function() {
          animeSearch($("#navbar #navbar_search_search").val().trim());
        });
      });
    }
  });
  $("#navbar #navbar_profile").on("click", function() {
    loadScreen("loading");
    chrome.storage.sync.set({
      credentials_username: "",
      credentials_password: "",
      credentials_loggedIn: false,
      credentials_userImage: "images/default_user.png"
    }, function() {
      loadScreen("finished");
      window.setTimeout(function() {
        $("#launch_loading").removeClass("finish");
        launchLogin();
      });
    });
  });
}

function reloadProfile_navbar() {
  chrome.storage.sync.get({
    credentials_username: "",
    credentials_password: ""
  }, function(data) {
    console.log(data);
    $.ajax({
      url: 'http://www.foxinflame.tk/dev/matomari/api/userInfo.php?username=' + data.credentials_username,
      method: 'GET',
      error: function(jqXHR, textStatus, errorThrown) {
        $("#navbar #navbar_profile img").src = 'images/default_user.png';
        console.log('Error at reloadProfile_navbar() :');
        console.log(jqXHR);
      },
      success: function(data) {
        if(data.error) {
          console.log('Error at reloadProfile_navbar() :');
          console.log(data.error);
          return;
        }
        console.log(data.profile_image);
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open('GET', data.profile_image, true);
        var imageUrl;
        xhr.onload = function(e) {
          var urlCreator = window.URL || window.webkitURL;
          imageUrl = urlCreator.createObjectURL(this.response);
          chrome.storage.sync.set({
            credentials_userImage: imageUrl,
          }, function() {
            $("#navbar #navbar_profile img").attr("src", imageUrl);
          });
        };
        xhr.send();
      }
    });
  });
}

function launchLogin() {
  chrome.storage.sync.get({
    launch_firstTime: true,
    credentials_loggedIn: false,
    credentials_username: "",
    credentials_password: "",
    credentials_userImage: "images/default_user.png"
  }, function(data) {
    if(data.credentials_loggedIn === true && data.launch_firstTime === false) {
      registerEvents();
      $("#launch_loading").addClass("finish");
    } else {
      $("#launch_loading").addClass("login");
      $("#launch_loading").append($("<div>").load("sections/login.html #login"));
      window.setTimeout(function() {
        $("#login form").addClass("fadeIn");
        $("#login form #login_skip").on("click", function() {
          chrome.storage.sync.set({
            launch_firstTime: false
          }, function() {
            registerEvents();
            $("#launch_loading").removeClass("login");
            $("#launch_loading #login").remove();
            window.setTimeout(function() {
              $("#launch_loading").addClass("finish");
            }, 1000);
          });
          $(this).off("click");
        });
        $("#login form #login_login").on("click", function() {
          $("#login form").removeClass("fadeIn");
          $.ajax({
            url: "https://myanimelist.net/api/account/verify_credentials.xml",
            type: "GET",
            dataType: "xml",
            username: $("#login form #login_username").val().trim(),
            password: $("#login form #login_password").val().trim(),
            error: function(jqXHR, textStatus, errorThrown) {
              if(jqXHR.status == 401) {
                $("#login form").addClass("fadeIn");
              }
            },
            success: function(data) {
              var credentials_userImage = "images/default_user.png";
              $.ajax({
                url: "http://www.foxinflame.tk/dev/matomari/api/userInfo.php?username=" + $("#login form #login_username").val().trim(),
                method: "GET",
                error: function(jqXHR, textStatus, errorThrown) {
                  credentials_userImage = "images/default_user.png";
                },
                success: function(data) {
                  credentials_userImage = data.profile_image;
                  chrome.storage.sync.set({
                    credentials_loggedIn: true,
                    credentials_username: $("#login form #login_username").val().trim(),
                    credentials_password: $("#login form #login_username").val().trim(),
                    credentials_userImage: credentials_userImage,
                    launch_firstTime: false
                  }, function() {
                    registerEvents();
                    $("#launch_loading").removeClass("login");
                    $("#launch_loading #login").remove();
                    window.setTimeout(function() {
                      $("#launch_loading").addClass("finish");
                    }, 1000);
                    $("#login form #login_login").off("click");
                  });
                }
              });
            }
          });
        });
      }, 1000);
    }
  });
}