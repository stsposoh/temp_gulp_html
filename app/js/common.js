;(function() {
  'use-strict';


  
  //SVG Fallback
  if(!Modernizr.svg) {
    $("img[src*='svg']").attr("src", function() {
      return $(this).attr("src").replace(".svg", ".png");
    });
  };


  //Запрет перетаскивать картинки
  $("img, a").on("dragstart", function(event) {
    event.preventDefault();
  });

})();