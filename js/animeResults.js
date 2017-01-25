$.fn.animeResults = function(data) {
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
  }
  
  console.log(data);
  
};