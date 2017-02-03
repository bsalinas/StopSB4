// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');
  
  $('#role_select').change(function(e){
    console.log("Role changed");
    var toShow = $(this).find(":selected").val();
    if(toShow.toLowerCase() == "all")
    {
      $('.statement').show();
    } else {
      $(".statement").hide();
      $('.statement[data-role="'+toShow+'"').show();
    }

  });

});
