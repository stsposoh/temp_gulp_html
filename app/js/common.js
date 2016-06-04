;(function() {
    'use-strict';

 
  
  $(".toggle-mnu").click(function() {
  $(this).toggleClass("on");
  $(".main-mnu").slideToggle();
  return false;
});

  
  //SVG Fallback
  /*
  if(!Modernizr.svg) {
    $("img[src*='svg']").attr("src", function() {
      return $(this).attr("src").replace(".svg", ".png");
    });
  };
  */


  //E-mail Ajax Send
  $("form").submit(function() { //Change
    var th = $(this);
    $.ajax({
      type: "POST",
      url: "mail.php", //Change
      data: th.serialize()
    }).done(function() {
      alert("Thank you!");
      setTimeout(function() {
        // Done Functions
        th.trigger("reset");
      }, 1000);
    });
    return false;
  });


  //Запрет перетаскивать картинки
  $("img, a").on("dragstart", function(event) {
    event.preventDefault();
  });

})();