function animeSearch(query) {
  chrome.storage.local.get({
    credentials_loggedIn: false
  }, function(data) {
    if(data.credentials_loggedIn) {
      $.ajax({
        url: "https://www.matomari.tk/api/0.4/methods/anime.search.QUERY.php?q=" + query,
        method: "GET",
        error: function(jqXHR, textStatus, errorThrown) {
          $("#searchResults").html("");
          if(jqXHR.status == 401) {
            $("#searchResults_query").html("You need to login to search.");
            loadScreen("finished");
            return;
          }
          if(jqXHR.status == 400) {
            $("#searchResults_query").html(jqXHR.responseJSON.message);
            loadScreen("finished");
            return;
          }
        },
        success: function(data) {
          if(data.error) {
            $("#searchResults").html("");
            $("#searchResults_query").html(data.message);
            loadScreen("finished");
            return;
          }
          if(data.results.length === 0) {
            $("#searchResults").html("");
            $("#searchResults_query").html("Search for " + query + " returned 0 anime");
            loadScreen("finished");
            return;
          }
          console.log(data);
          responseAnime = data.results;
          $("#searchResults_query").html("Search for " + query + " returned " + responseAnime.length + " anime");
          for(var x = 0; x < responseAnime.length; x++) {
            responseAnime[x].image = responseAnime[x].image_2x;
          }
          $("#searchResults").animeResults(responseAnime);
          loadScreen("finished");
        }
      });
    } else {
      $("#searchResults_query").html("You need to login to search.");
      loadScreen("finished");
    }
  });
}