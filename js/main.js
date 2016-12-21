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
  $("#navbar_search").on("click", function() {
    $("#navbar #navbar_search_search").toggleClass("shown");
  });
  $("#navbar #navbar_search_search").keyup(function(event) {
    if(event.keyCode == 13) {
      loadScreen("loading");
      $("#content").load("sections/animeSearch.html #content > *", function() {
        animeSearch($("#navbar #navbar_search_search").val().trim());
      });
    }
  });
}

function launchLogin() {
  chrome.storage.sync.get({
    launch_firstTime: true,
    credentials_loggedIn: false,
    credentials_username: "Example",
    credentials_password: ""
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
            $("#launch_loading #login").removeClass("fadeIn");
            window.setTimeout(function() {
              $("#launch_loading #login").remove();
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
              chrome.storage.sync.set({
                credentials_loggedIn: true,
                launch_firstTime: false
              }, function() {
                $("#launch_loading").removeClass("login");
                window.setTimeout(function() {
                  $("#launch_loading").addClass("finish");
                  $("#launch_loading #login").remove();
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

function animeSearch(query) {
  $.ajax({
    url: "https://myanimelist.net/api/anime/search.xml?q=" + query,
    method: "GET",
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    },
    success: function(data) {
      if(!data) {
        $("#searchResults_query").html("Search for " + query + " returned 0 anime");
        loadScreen("finished");
        return;
      }
      data = xml2json(data);
      console.log(data);
      responseAnime = data.anime;
      $("#searchResults_query").html("Search for " + query + " returned " + responseAnime.length + " anime");
      responseAnime.forEach(function(index, i) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open('GET', index.image, true);
        var imageUrl;
        xhr.onload = function(e) {
          var urlCreator = window.URL || window.webkitURL;
          imageUrl = urlCreator.createObjectURL(this.response);
          document.getElementById("searchResult-anime-image-" + index.id).src = imageUrl;
        };
        xhr.send();
        $("#searchResults").append(
          "<div class=\"searchResult-anime\" data-id=\"" + index.id + "\">" +
            "<div class=\"searchResult-anime-image\">" +
              "<img id=\"searchResult-anime-image-" + index.id + "\" src=\"#\">" +
            "</div>" +
            "<div class=\"searchResult-anime-info\">" +
              "<span class=\"searchResult-anime-title\">" + index.title + "</span>" +
              "<span class=\"searchResult-anime-status\">" + index.status + "</span>" +
              "<span class=\"searchResult-anime-type\">" + index.type + "</span>" +
              "<span class=\"searchResult-anime-episodes\">" + index.episodes +"</span>" +
            "</div>" +
          "</div>"
        );
      });
      loadScreen("finished");
    }
  });
}