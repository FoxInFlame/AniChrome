function animeSearch(query) {
  chrome.storage.local.get({
    credentials_loggedIn: false
  }, function(data) {
    if(data.credentials_loggedIn) {
      $.ajax({
        url: "http://matomari.tk/api/0.3/anime/search/" + query + ".json",
        method: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
          if(jqXHR.status == 401) {
            $("#searchResults_query").html("You need to login to search.");
            loadScreen("finished");
          }
        },
        success: function(data) {
          if(data.error) {
            $("#searchResults_query").html(data.error);
            loadScreen("finished");
            return;
          }
          if(data.results.length === 0) {
            $("#searchResults_query").html("Search for " + query + " returned 0 anime");
            loadScreen("finished");
            return;
          }
          console.log(data);
          responseAnime = data.results;
          $("#searchResults_query").html("Search for " + query + " returned " + responseAnime.length + " anime");
          $("#searchResults").html("");
          responseAnime.forEach(function(index, i) {
            index.image = index.image.split(" 1x, ")[1];
            index.image = index.image.slice(0, -3);
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
                  "<span class=\"searchResult-anime-status\">" + index.score + "</span>" +
                  "<span class=\"searchResult-anime-type\">" + index.type + "</span>" +
                  "<span class=\"searchResult-anime-episodes\">" + index.episodes +"</span>" +
                "</div>" +
              "</div>"
            );
          });
          loadScreen("finished");
        }
      });
    } else {
      $("#searchResults_query").html("You need to login to search.");
      loadScreen("finished");
    }
  });
}