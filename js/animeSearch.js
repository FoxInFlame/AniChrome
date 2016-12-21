function animeSearch(query) {
  $.ajax({
    url: "https://myanimelist.net/api/anime/search.xml?q=" + query,
    method: "GET",
    error: function(jqXHR, textStatus, errorThrown) {
      if(jqXHR.status == 401) {
        $("#searchResults_query").html("You need to login to search.");
        loadScreen("finished");
      }
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