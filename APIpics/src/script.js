$(() => {
  let history = [],
    idCurr,
    urlImage,
    urlImagePrev,
    urlModal,
    newImageDate,
    lastImageDate = 0,
    newArrowDate,
    lastArrowDate = 0,
    width = $(window).width(),
    picsAmount = getPicsAmount(),
    modal = false,
    autoplay = false,
    seconds = 5,
    run,
    mobile = false;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    mobile = true;
  }

  function getPicsAmount() {
    return (width < 480) ? 3 :
      (width < 624) ? 5 :
        (width < 776) ? 7 :
          9;
  };

  $(window).resize(() => {
    width = $(window).width();
    let picsAmountTmp = getPicsAmount();

    if (picsAmount != picsAmountTmp) {
      picsAmount = picsAmountTmp;

      let idFirst = idCurr;
      if (history.length - idCurr < picsAmount) {
        idFirst = history.length - picsAmount;
        if (idFirst < 0) idFirst = 0;
      }
      viewImages(idFirst);
    }
  });

  function viewBigImage(id, url) {
    urlModal = url;
    $('.big-image').attr({ id: id, src: url });
    $('#caption').attr('href', url);

    const image = new Image();
    image.src = url;
    image.onload = function () {
      $('#caption').text(`Open (${this.width} x ${this.height})`);
    }
  }

  function viewImages(idFirst) {
    $('.images img, .images button').remove();

    let idLast = idFirst + picsAmount;
    if (idLast > history.length) idLast = history.length;

    for (let i = idFirst; i < idLast; i++) {
      $('.images').append(`<img id="${history[i].id}" src="${history[i].src}" alt="default">`);
      if (i == idCurr) {
        $(`#id${i}`).addClass('highlight').removeClass('no-highlight');
      } else {
        $(`#id${i}`).removeClass('highlight').addClass('no-highlight');
      }
    }
    $('.images').append(`<button>&#10154;</button>`);
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

        idCurr = history.length - 1;
        const idImage = `big${idCurr}`;
        viewBigImage(idImage, urlImage);

        let idFirst = history.length - picsAmount;
        if (idFirst < 0) idFirst = 0;
        viewImages(idFirst);
      })
      .catch((err) => {
        console.log('Error555: ', err);
      });
  }

  getNewImage();

  $('#get-new-image').click(() => {
    getNewImage();
    if (autoplay) runSetInterval();
  });

  $('.big-image-container').on('click', 'img', () => {
    // $('#caption').css({ ['display']: 'none' });
    // $('.modal').css({ ['padding-top']: '10px' });
    // $('.modal-content').css({ ['max-width']: '95%', ['max-height']: '95%' });
    if (mobile) return;
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
      window.open(urlModal, '_blank');
    };
  });

  $('.images').on('click', 'img', function () {
    idCurr = +this.id.substring(2);
    const idImageStr = `big${idCurr}`,
      urlImageStr = this.src;
    viewBigImage(idImageStr, urlImageStr);

    const idFirst = +$('.images img:first')[0].id.substring(2);
    viewImages(idFirst);
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
    const idFirst = +$('.images img:first')[0].id.substring(2);

    switch (key) {
      case 'next':
        if (idCurr == history.length - 1) {
          getNewImage();
          break;
        };
        idCurr += 1;
        const idNext = `big${idCurr}`,
          urlNext = history[idCurr].src;
        viewBigImage(idNext, urlNext);

        if (idCurr > idFirst + picsAmount - 1) {
          viewImages(idFirst + 1);
        } else {
          viewImages(idFirst);
        };
        break;

      case 'prev':
        if (idCurr == 0) break;
        idCurr -= 1;
        const idPrev = `big${idCurr}`,
          urlPrev = history[idCurr].src;
        viewBigImage(idPrev, urlPrev);

        if (idCurr < idFirst) {
          viewImages(idFirst - 1);
        } else {
          viewImages(idFirst);
        };
        break;

      default:
        break;
    }
  }

  $('.button-next').click(() => arrow('next'));
  $('.button-prev').click(() => arrow('prev'));

  $(document).keydown((e) => {
    newArrowDate = new Date().getTime();
    if (modal || lastArrowDate + 100 > newArrowDate) return;
    lastArrowDate = newArrowDate;

    if (e.keyCode == 39 || e.keyCode == 40) arrow('next');
    if (e.keyCode == 37 || e.keyCode == 38) arrow('prev');
  });
});
