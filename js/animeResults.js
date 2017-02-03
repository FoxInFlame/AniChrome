$.fn.animeResults = function(data, callback) {
  var shownType = "grid"; // grid or list
  var display = "<div class=\"__animeResults_wrapper\">"; // Final HTML
  
  this.css("overflow", "scroll");
  this.css("height", "100%");
  
  /*
  [
    {
      "id": 21,
      "title": "One Piece",
      "image": "Whatever URL goes here",
      "type": "TV",
      "score": 8.58, <--- String when not defined
      "episodes": null, <--- String when not defined
      "synopsis_snippet": "OPTIONAL"
    },
    {
      ...
    }
  ]
  */
  if(data === null || data === undefined ||  data.constructor !== Array) {
    throw new Error("animeResults() expects correctly formatted array to be passed as a parameter.");
  }
  for(var x = 0; x < data.length; x++) {
    
    /*
    Required: id, title
    Otherwise use default value
    */
    
    // If values are not defined
    if(data[x] === null || typeof data[x] !== "object" || !data[x] || !data[x].id || !data[x].title) {
      throw new Error("animeResults() expects correctly formatted array to be passed as a parameter.");
    }
    
    // If image is not defined use placeholder
    if(data[x].image === "" || !data[x].image) {
      data[x].image = "/images/default_cover.png";
    }
    // If type is not defined use placeholder
    if(data[x].type === "" || !data[x].type) {
      data[x].type = "No Data";
    }
    // If score is not defined use placeholder
    if(data[x].score === "" || !data[x].score) {
      data[x].score = "No Data";
    }
    // If episode is not defined use placeholder
    if(data[x].episodes === "" || !data[x].episodes) {
      data[x].episodes = "No Data";
    }
    // If synopsis_snippet is not defined use placeholder
    if(data[x].synopsis_snippet === "" || !data[x].synopsis_snippet) {
      data[x].synopsis_snippet = "No Data";
    }
    
    display += "<div class=\"__animeResults_result __animeResults_result_" + data[x].id.toString() + "\">"  + data[x].title + "<br>" + data[x].type + "<br>" + data[x].score + "</div>";
  }

  display += "</div>";
  
  this.html(display);
  
  for(var y = 0; y < data.length; y++) {
    loadImage(data[y].image, data[y].id);
  }
  function loadImage(image_url, id) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", image_url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      $(".__animeResults_result_" + id.toString()).css("background-image", "url(" + window.URL.createObjectURL(this.response) + ")").css("background-repeat", "no-repeat").css("background-size", "100% 100%");
    };
    xhr.send();
  }
  
  console.log(data);
  
  if(callback) {
    callback();
  }
};