$(() => {
  // var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;

  let history = [],
    urlImage,
    urlImagePrev,
    urlImageModalOpen,
    newImageDate,
    lastImageDate = 0,
    newArrowDate,
    lastArrowDate = 0,
    width = $(window).width(),
    picsAmount = getPicsWidth(),
    modal = false,
    autoplay = false,
    seconds = 5,
    run;

  function getPicsWidth() {
    return (width < 480) ? 4 :
      (width < 624) ? 6 :
        (width < 776) ? 8 :
          (width < 992) ? 10 :
            9;
  };

  $(window).resize(() => {
    width = $(window).width();
    let picsAmountTmp = getPicsWidth();

    if (picsAmount != picsAmountTmp) {
      picsAmount = picsAmountTmp;
      viewImages();
    }
  });

  function viewBigImage(id, url) {
    urlImageModalOpen = url;
    $('.big-image').attr({ id: id, src: url });
    $('#caption').attr('href', url);

    const image = new Image();
    image.src = url;
    image.onload = function () {
      $('#caption').text(`Open (${this.width} x ${this.height})`);
    }
  }

  function viewImages(idStart, idEnd, idCurr) {
    $('.images img, .images button').remove();

    for (let i = idStart; i < idEnd; i++) {
      if (i < 0) continue;
      $('.images').append(`<img id="${history[i].id}" src="${history[i].src}" alt="default">`);
      if (i == idCurr) {
        $(`#id${i}`).addClass('highlight').removeClass('no-highlight');
      } else {
        $(`#id${i}`).removeClass('highlight').addClass('no-highlight');
      }
    }

    if (picsAmount == 9) $('.images').append(`<button type="button" class="btn btn-raised btn-info">&#10154;</button>`);
  }

  function getNewImage() {
    newImageDate = new Date().getTime();
    if (lastImageDate + 1499 > newImageDate) return;
    lastImageDate = newImageDate;

    $('.big-image-container').html('<img class="loader" src="./img/loader.gif" alt="pic">');

    fetch('https://source.unsplash.com/random')
      .then((responce) => {
        urlImage = responce.url;
        if (urlImage == urlImagePrev) {
          $('.loader').attr({ src: urlImagePrev, class: 'big-image' });
          return;
        };
        urlImagePrev = urlImage;

        history.push({ id: 'id' + history.length, src: urlImage })

        $('.big-image').remove();
        $('.big-image-container').html(`<img class="big-image" alt="pic">`);

        const idImage = `big${history.length - 1}`
        viewBigImage(idImage, urlImage);

        let idImagesFirst = history.length - picsAmount,
          idImagesLast = idImagesFirst + picsAmount;
        if (idImagesFirst < 0) {
          idImagesLast = picsAmount - Math.abs(idImagesFirst);
          idImagesFirst = 0;
        }
        viewImages(idImagesFirst, idImagesLast, history.length - 1);
      })
      .catch((err) => {
        console.log('Error555: ', err);
      });
  }

  if (picsAmount == 9) $('.images').append(`<button type="button" class="btn btn-raised btn-info">&#10154;</button>`);

  getNewImage();

  $('#get-new-image').click(() => {
    getNewImage();
    if (autoplay) runSetInterval();
  });

  $('.big-image-container').on('click', 'img', () => {
    modal = true;
    $('#image-modal')[0].src = $('.big-image')[0].src;
    $('#my-modal').css('display', 'block');
  });

  $('.close').click(() => {
    modal = false;
    $('#my-modal').css('display', 'none');
  });

  $('#caption').mousedown((e) => {
    if (e.which == 1) {
      window.open(urlImageModalOpen, '_blank');
    };
  });

  $('.images').on('click', 'img', function () {
    const urlImageStr = this.src,
      idImageStr = `big${+this.id.substring(2)}`;
    viewBigImage(idImageStr, urlImageStr);

    const idImagesFirst = +$('.images img:first')[0].id.substring(2),
      idImagesLast = +$('.images img:last')[0].id.substring(2),
      idImageTmp = +this.id.substring(2);
    viewImages(idImagesFirst, idImagesLast + 1, idImageTmp);
  });

  $('.images').on('click', 'button', function () {
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
      default:
        break;
    }
    $('#timeset').html(`<p>${seconds} seconds</p>`);
    if (autoplay) runSetInterval();
  }

  $('#time-up').click(() => timeSet('up'));
  $('#time-down').click(() => timeSet('down'));

  function arrow(key) {
    const idImageBig = $('.big-image')[0].id ? +$('.big-image')[0].id.substring(3) : history.length - 1,
      idImageFirst = +$('.images img:first')[0].id.substring(2),
      idImageLast = +$('.images img:last')[0].id.substring(2) + 1;

    switch (key) {
      case 'next':
        if (idImageBig == history.length - 1) {
          getNewImage();
          break;
        };
        const idNext = `big${idImageBig + 1}`,
          urlNext = history[idImageBig + 1].src;
        viewBigImage(idNext, urlNext);

        if (idImageBig == idImageLast - 1) {
          viewImages(idImageFirst + 1, idImageLast + 1, idImageBig + 1);
        } else {
          viewImages(idImageFirst, idImageLast, idImageBig + 1);
        };
        break;

      case 'prev':
        if (idImageBig == 0) break;
        const idPrev = `big${idImageBig - 1}`,
          urlPrev = history[idImageBig - 1].src;
        viewBigImage(idPrev, urlPrev);

        if (history.length > picsAmount && idImageFirst == idImageBig) {
          viewImages(idImageFirst - 1, idImageLast - 1, idImageBig - 1);
        } else {
          viewImages(idImageFirst, idImageLast, idImageBig - 1);
        };
        break;

      default:
        break;
    }
  }

  $('.button-next').click(() => { arrow('next') });
  $('.button-prev').click(() => { arrow('prev') });

  $(document).keydown((e) => {
    newArrowDate = new Date().getTime();
    if (modal || lastArrowDate + 100 > newArrowDate) return;
    lastArrowDate = newArrowDate;

    if (e.keyCode == 39 || e.keyCode == 40) arrow('next');
    if (e.keyCode == 37 || e.keyCode == 38) arrow('prev');
  });
});
