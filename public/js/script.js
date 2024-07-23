document.getElementById("myButton").addEventListener("click", function() {
    var div = document.getElementById("slide");
   
      div.style.display = "block";
   div.style.backgroundColor="#ffe6eb"
   div.style.padding="0.4rem"


  });

  document.getElementById("close").addEventListener("click", function() {
    var div = document.getElementById("slide");
   
      div.style.display = "none";
  
  });
  