(function() {
  loadScript("libraries/jQuery/jquery-2.2.4.min.js", function() {
    loadScript("js/parser.js", function() {
      loadScript("js/animeSearch.js", function() {
        loadStylesheet("css/base.css", function() {
          loadScript("libraries/Waves/waves.min.js", function() {
            loadStylesheet("libraries/Waves/waves.min.css", function() {
              Waves.init();
              loadScript("js/animeResults.js", function() {
                loadStylesheet("css/animeResults.css", function() {
                  launchLogin();
                });
              });
            });
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
  if(!status) {
    return !$("#loading").hasClass("finish");
  }
  if(status != "finished") status == "loading";
  if(status == "loading") {
    $("#loading").removeClass("finish");
  } else if(status == "finished") {
    $("#loading").addClass("finish");
  }
}

function registerEvents() {
  if(navigator.onLine) {
    reloadProfile_navbar();
  } else {
    chrome.storage.local.get({
      credentials_userImage64: "images/default_user.png"
    }, function(data) {
      $("#navbar #navbar_profile img").attr("src", data.credentials_userImage64);
    });
  }
  $("#navbar_search_icon").on("click", function() {
    $("#navbar #navbar_search").toggleClass("shown");
  });
  $("#navbar #navbar_search_search").keyup(function(event) {
    if(event.keyCode == 13) {
      if(loadScreen()) return;
      loadScreen("loading");
      if(!$("#searchResults")[0])  {
        $("#content").load("sections/animeSearch.html #content > *", function() {
          animeSearch($("#navbar #navbar_search_search").val().trim());
        });
      } else {
        animeSearch($("#navbar #navbar_search_search").val().trim());
      }
    }
  });
  $("#navbar #navbar_profile").on("click", function() {
    loadScreen("loading");
    chrome.storage.local.set({
      credentials_username: "",
      credentials_password: "",
      credentials_loggedIn: false,
      credentials_userImage64: "images/default_user.png"
    }, function() {
      loadScreen("finished");
      $("#navbar #navbar_profile").off("click");
      window.setTimeout(function() {
        $("#launch_loading").removeClass("finish");
        launchLogin();
      });
    });
  });
}

function reloadProfile_navbar() {
  chrome.storage.local.get({
    credentials_username: "",
    credentials_password: ""
  }, function(data) {
    $.ajax({
      url: "https://www.matomari.tk/api/0.3/user/info/" + data.credentials_username + ".json",
      method: "GET",
      error: function(jqXHR, textStatus, errorThrown) {
        $("#navbar #navbar_profile img").attr("src", "images/default_user.png");
        console.log("Error at reloadProfile_navbar() :");
        console.log(jqXHR);
      },
      success: function(data) {
        if(data.error) {
          console.log("Error at reloadProfile_navbar() : " + data.error);
          $("#navbar #navbar_profile img").attr("src", "images/default_user.png");
          return;
        }
        $("#navbar #navbar_profile").parent().attr("data-balloon", "Text goes here");
        if(data.profile_image === null) {
          chrome.storage.local.set({
            credentials_userImage64: "images/default_user.png"
          }, function() {
            $("#navbar #navbar_profile img").attr("src", "images/default_user.png");
          });
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.open("GET", data.profile_image, true);
        var imageBase64;
        xhr.onload = function(e) {
          var reader = new FileReader();
          reader.onloadend = function() {
            imageBase64 = reader.result;
            chrome.storage.local.set({
              credentials_userImage64: imageBase64,
            }, function() {
              $("#navbar #navbar_profile img").attr("src", imageBase64);
            });
          };
          reader.readAsDataURL(xhr.response);
        };
        xhr.send();
      }
    });
  });
}

function launchLogin() {
  chrome.storage.local.get({
    credentials_firstTime: true, // Not to be confused with launch_firstTime
    // credentials_firstTime gets set to false on first launch
    // launch_firstTIme gets set to false on first close
    credentials_loggedIn: false,
    credentials_username: "",
    credentials_password: "",
    credentials_userImage64: "images/default_user.png"
  }, function(data) {
    if(data.credentials_loggedIn === true && data.credentials_firstTime === false) {
      registerEvents();
      $("#launch_loading").addClass("finish");
    } else {
      $("#launch_loading").addClass("login");
      $("#launch_loading").append($("<div>").attr("id", "loginWrapper").load("sections/login.html #login"));
      window.setTimeout(function() {
        $("#login form").addClass("fadeIn");
        $("#login form #login_skip").on("click", function() {
          $("#login form").removeClass("fadeIn");
          chrome.storage.local.set({
            credentials_firstTime: false,
            credentials_loggedIn: false
          }, function() {
            registerEvents();
            $("#launch_loading").removeClass("login");
            $("#launch_loading #loginWrapper").remove();
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
              if(jqXHR.status == 401 || !navigator.onLine) {
                $("#login form").addClass("fadeIn");
              }
            },
            success: function(data) {
              console.log(data);
              console.log(data.getElementsByTagName("id")[0].childNodes[0].nodeValue);
              chrome.storage.local.set({
                credentials_loggedIn: true,
                credentials_userid: data.getElementsByTagName("id")[0].childNodes[0].nodeValue, // Hope MAL doesn't change the response... :)
                credentials_username: data.getElementsByTagName("username")[0].childNodes[0].nodeValue,
                credentials_password: $("#login form #login_password").val().trim(),
                credentials_firstTime: false
              }, function() {
                registerEvents();
                $("#launch_loading").removeClass("login");
                $("#launch_loading #loginWrapper").remove();
                window.setTimeout(function() {
                  $("#launch_loading").addClass("finish");
                }, 1000);
                $("#login form #login_login").off("click");
              });
            }
          });
        });
      }, 1000);
    }
  });
}