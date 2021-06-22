document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
  let cards = document.querySelectorAll(".card")

  console.log(cards)

  let animationTimer

  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('mouseenter', function(event){
      console.log(event.target.dataset.id)
      var animImage = new Image()
      animImage.src = '//assets.storyboarders.com/' + event.target.dataset.id + '/thumbnailanim.jpg';
      animImage.addEventListener('load', function() {
        let containerDiv = event.target.querySelector(".card-thumbnail__img")
        let height = containerDiv.offsetHeight
        let width = containerDiv.offsetWidth

        let numFrames = Math.min(10, parseInt(event.target.dataset.numBoards, 10))

        let frameWidth = animImage.width / numFrames
        let frameHeight = animImage.height

        let correctedWidth
        let correctedHeight

        let offsetLeft
        let offsetTop

        if ((frameWidth/frameHeight) > (width/height)) {
          correctedWidth = (height/animImage.height) * frameWidth
          offsetLeft = (correctedWidth - width) / 2
          animImage.style.height = height + 'px'
           
        } else {
          correctedHeight = (width/(animImage.width/numFrames)) * frameHeight
          offsetTop = (correctedHeight - height) / 2
          animImage.style.width = (width * numFrames) + 'px'
        }

        animImage.style.position = "absolute"
        var node = document.createElement('div')
        node.appendChild(animImage)


        node.classList.add("animation")
        let timer = 1

        if (correctedWidth) {
          animImage.style.left = -(((timer % numFrames) *correctedWidth)+offsetLeft) + 'px'
        } else {
          console.log("I AM HERE", offsetTop)
          animImage.style.top = -(offsetTop) + 'px'
        }
          
        event.target.querySelector(".card-thumbnail__img").appendChild(node)


        animationTimer = setInterval(function(){
          timer++
          if (correctedWidth) {
            animImage.style.left = -(((timer % numFrames) *correctedWidth)+offsetLeft) + 'px'
          } else {
            animImage.style.left = -((timer % numFrames) * width) + 'px'
          }
          console.log(timer, correctedWidth)
        }, 150)

      }, false);

      console.log(event.target.querySelector(".card-thumbnail__img").offsetWidth)
    });


    cards[i].addEventListener('mouseleave', function(event){
      let animEl = event.target.querySelector(".card-thumbnail__img .animation")
      if (animEl) animEl.remove()
      clearInterval(animationTimer)
    });


  }
});