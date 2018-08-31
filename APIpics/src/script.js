$(function() {
  const xAppKey = "7617f81f-b406-4498-83d2-9af7c0c4138b";
  const url = 'https://api.thedogapi.com/v1/images/search';

  function getNewImage() {
    const request = $.ajax(url, {
      accepts: {
        'x-api-key': xAppKey,
        'Content-Type': 'application/json',
      },
    });

    request
      .then((results) => {
        const firstItem = results[0];
        const { url: urlImage } = firstItem;

        $('#my-image').attr('src', urlImage);

        const image = new Image();
        image.src = urlImage;

        image.onload = function() {
          $('#image-attribute').text(`Pixels: ${this.width} x ${this.height}`);
        }
      })
      .catch((err) => {
        console.log('Error555:', err);
      });
  }

  getNewImage();

  var autoplay = 0, ms =5000, run;

  function runClearInterval() {
    clearInterval(run);
  };
  function runSetInterval() {
    runClearInterval();
    getNewImage();
    run = setInterval(() => {
      getNewImage();
    }, ms);
  };

  $(document).ready(function() {
    $('#get-new-image').click(function() {
      getNewImage();
      if ( autoplay ) runSetInterval();
    });
  });

  $(document).ready(function() {
    $('#my-image').click(function() {
      getNewImage();
      if ( autoplay ) runSetInterval();
    });
  });

  $(document).ready(function() {
    $('#autoplay').click(function() {

      if ( !autoplay ) {
        autoplay = 1;
        runSetInterval();
        $('#autoplay-text').text('stop');
        $('#autoplay').attr('class', 'button button-autoplay');

      } else {
        autoplay = 0;
        runClearInterval();
        $('#autoplay-text').text('autoplay');
        $('#autoplay').attr('class', 'button');
      }
    });
  });

  $(document).ready(function() {
    $('#time-down').click(function() {
      if ( ms > 10000 ) {
        ms -= 5000;
        $('#timeset').html(`<p>${ms / 1000} seconds</p>`);
      } else if ( ms > 1000 && ms <= 10000 ) {
        ms -= 1000;
        $('#timeset').html(`<p>${ms / 1000} seconds</p>`);
      }
      if ( autoplay ) runSetInterval();
    });
  });

  $(document).ready(function() {
    $('#time-up').click(function() {
      if ( ms < 10000 ) {
        ms += 1000;
        $('#timeset').html(`<p>${ms / 1000} seconds</p>`);
      } else if ( ms >= 10000 && ms < 30000 ) {
        ms += 5000;
        $('#timeset').html(`<p>${ms / 1000} seconds</p>`);
      }
      if ( autoplay ) runSetInterval();
    });
  });
});
