$(() => {
  const xApiKey = "7617f81f-b406-4498-83d2-9af7c0c4138b";
  const url = 'https://api.thedogapi.com/v1/images/search';

  let autoplay = false,
    seconds = 5,
    run;

  function viewImage(urlImage) {
    $('#my-image').attr('src', urlImage);

    const image = new Image();
    image.src = urlImage;
    image.onload = function () {
      $('#image-attribute').text(`Pixels: ${this.width} x ${this.height}`);
    }
  }

  function getNewImage() {
    const request = $.ajax(url, {
      accepts: {
        'x-api-key': xApiKey,
        'Content-Type': 'application/json',
      },
    });

    $('#my-image').attr('src', './img/default.gif');

    request
      .then((results) => {

        const firstItem = results[0];
        const { url: urlImage } = firstItem;

        $('#my-image').remove();
        $('.image-content').html('<img src="" id="my-image" class="image" alt="pic" />');

        viewImage(urlImage);

        $('#images button').remove();

        $('#images').append(`<img src="${urlImage}" alt="default" />`);
        if ($('#images img').length > 9) {
          $('#images img:first').remove();
        }

        $('#images').append(`<button class="button-new-image">&#10154;</button>`);
      })
      .catch((err) => {
        console.log('Error555:', err);
      });
  }

  $('#images').append(`<button class="button-new-image">&#10154;</button>`);

  getNewImage();

  $('#get-new-image').click(() => {
    getNewImage();
    if (autoplay) runSetInterval();
  });

  $('.image-content').on('click', 'img', () => {
    $('#image-modal')[0].src = $('#my-image')[0].src;
    $('#my-modal').css('display', 'block');
    // $('#caption').html($('#my-image')[0].alt);
  });

  $('.close').click(() => {
    $('#my-modal').css('display', 'none');
  });

  $('#images').on('click', 'img', function() {
    let urlImage = this.src;
    viewImage(urlImage);
  });

  $('#images').on('click', 'button', function() {
    getNewImage();
    if (autoplay) runSetInterval();
  });

  function runClearInterval() {
    clearInterval(run);
  };

  function runSetInterval() {
    runClearInterval();
    getNewImage();
    run = setInterval(() => {
      getNewImage();
    }, seconds * 1000);
  };

  $('#autoplay').click(() => {
    if (!autoplay) {
      runSetInterval();
      $('#autoplay').addClass('button-autoplay');
    } else {
      runClearInterval();
      $('#autoplay').removeClass('button-autoplay');
    }
    $('#autoplay-text').text(autoplay ? 'autoplay' : 'stop');
    autoplay = !autoplay;
  });

  function timeSet(timeWay) {
    switch (timeWay) {
      case 'up':
        if (seconds >= 10 && seconds < 30) seconds += 5;
        if (seconds < 10) seconds += 1;
        break;
      case 'down':
        if (seconds > 1 && seconds <= 10) seconds -= 1;
        if (seconds > 10) seconds -= 5;
        break;
    }
    $('#timeset').html(`<p>${seconds} seconds</p>`);
    if (autoplay) runSetInterval();
  }

  $('#time-up').click(() => timeSet('up'));
  $('#time-down').click(() => timeSet('down'));

  function arrow(key) {
    const urlImageNow = $('#my-image')[0].src;
    const allImg = $('#images img');

    for (let i = allImg.length - 1; i >= 0; i--) {
      const urlTmp = allImg[i].src;

      if (urlTmp == urlImageNow) {
        if (key == 'next') {
          if (i == allImg.length - 1) {
            getNewImage();
            break;
          }
          const urlNext = allImg[i + 1].src;
          viewImage(urlNext);
          break;
        }
        if (key == 'prev') {
          if (i == 0) break;
          const urlPrev = allImg[i - 1].src;
          viewImage(urlPrev);
          break;
        }
      }
    }
  }

  $(document).keydown((e) => {
    if (e.keyCode == 39 || e.keyCode == 40) arrow('next');
    if (e.keyCode == 37 || e.keyCode == 38) arrow('prev');
  });
});
