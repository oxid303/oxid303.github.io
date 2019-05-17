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
    height = $(window).height(),
    picsAmount = getPicsAmount(),
    modal = false,
    autoplay = false,
    seconds = 5,
    run,
    mobile = false;

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|SymbianOS|Opera Mini/i.test(navigator.userAgent)) {
    mobile = true;
    $('.side-button').css('display', 'none');
  }

  function getPicsAmount() {
    return (width < 480) ? 3 :
      (width < 624) ? 5 :
        (width < 776) ? 7 :
          9;
  };

  $(window).resize(() => {
    width = $(window).width();
    height = $(window).height();
    // $('html').css('width', width + 'px');

    if (mobile) viewMobile();

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

  function viewMobile() {
    if (width > height) {
      $('.images-container').css('display', 'none');
      $('.big-image').css({
        'max-height': height - 40 + 'px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
      });
    } else {
      $('.images-container').css('display', 'flex');
      $('.big-image').css({
        'max-height': height - 125 + 'px',
        position: 'absolute',
        top: '105px',
        left: '50%',
        transform: 'translate(-50%,0%)',
      });

    };
  }

  function viewBigImage(id, url) {
    if (mobile) viewMobile();
    urlModal = url;
    if ($('.loader')[0]) {
      $('.loader').addClass('big-image');
      $('.loader').removeClass('loader');
    };

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
      $('.images').append(`<img id="${history[i].id}" src="${history[i].src}" class="images-item" alt="default">`);
      if (i == idCurr) {
        $(`#id${i}`).addClass('highlight').removeClass('no-highlight');
      } else {
        $(`#id${i}`).removeClass('highlight').addClass('no-highlight');
      }
    }

    // '&#10153;' '&#10154;'
    let buttonSymbol;
    if (idCurr == history.length - 1) {
      buttonSymbol = '&#10146;'
    } else buttonSymbol = '&#10147;';
    $('.images').append(`<button class="images-item">${buttonSymbol}</button>`);
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

        history.push({ id: 'id' + history.length, src: urlImage });

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
    let idFirst = +$('.images img:first')[0].id.substring(2);

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
        if (idCurr == 0) {
          idCurr = history.length;
          idFirst = history.length - picsAmount;
          if (idFirst < 0) idFirst = 0;
        }
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

      case 'scrollNext':
        let idLast = +$('.images img:last')[0].id.substring(2);
        if (idCurr == history.length - 1) {
          getNewImage();
          break;
        }
        if (idLast == history.length - 1) {
          idCurr = history.length - 1;
          const idBig = `big${idCurr}`,
            urlBig = history[idCurr].src;
          viewBigImage(idBig, urlBig);
          viewImages(idFirst);
        } else {
          idCurr = idLast = idLast + picsAmount - 1;
          if (idCurr > history.length - 1) idCurr = idLast = history.length - 1;
          const idBig = `big${idCurr}`,
            urlBig = history[idCurr].src;
          viewBigImage(idBig, urlBig);
          idFirst = idLast - picsAmount + 1;
          if (idFirst < 0) idFirst = 0;
          viewImages(idFirst);
        }
        break;

      case 'scrollPrev':
        if (idCurr == 0) break;
        if (idFirst == 0) {
          idCurr = 0;
          const idBig = `big${idCurr}`,
            urlBig = history[idCurr].src;
          viewBigImage(idBig, urlBig);
          viewImages(idFirst);
          break;
        } else {
          idCurr = idFirst = idFirst - picsAmount + 1;
          if (idCurr < 0) idCurr = idFirst = 0;
          const idBig = `big${idCurr}`,
            urlBig = history[idCurr].src;
          viewBigImage(idBig, urlBig);
          viewImages(idFirst);
        }
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

    if (e.keyCode == 39) arrow('next');
    if (e.keyCode == 37) arrow('prev');
    if (e.keyCode == 40) arrow('scrollNext');
    if (e.keyCode == 38) arrow('scrollPrev');
  });






  if (mobile) {
    function swipe(el, settings) {

      settings = Object.assign({}, {
        minDist: 60,
        maxDist: 200,
        maxTime: 2000,
        minTime: 50,
      }, settings);

      let dir,
        swipeType,
        dist,
        isMouse = false,
        isMouseDown = false,
        startX = 0,
        distX = 0,
        startY = 0,
        distY = 0,
        startTime = 0,
        touchElement;

      function checkStart(e) {
        let event = e.changedTouches[0];
        if (typeof e.touches !== "undefined" && e.touches.length !== 1) return; // ignoring touch with a few fingers
        dir = "none";
        swipeType = "none";
        dist = 0;
        startX = event.pageX;
        startY = event.pageY;
        startTime = new Date().getTime();
        isMouseDown = true;
        // e.preventDefault();

        if (el == $('.big-image-container')[0]) touchElement = 'bigImage';
        if (el == $('.images-container')[0]) touchElement = 'imagesItem';
      };

      function checkMove(e) {
        if (isMouse && !isMouseDown) return; // exit function if the mouse is no longer active while driving
        let event = e.changedTouches[0];
        distX = event.pageX - startX;
        distY = event.pageY - startY;
        if (Math.abs(distX) > Math.abs(distY)) dir = (distX < 0) ? "left" : "right";
        else dir = (distY < 0) ? "up" : "down";
        // e.preventDefault();

        if (touchElement == 'bigImage') $('.big-image').css({ left: `calc(50% + ${distX / 4}px)` });
        if (touchElement == 'imagesItem') $('.images-item').css({ left: distX / 4 + 'px' });
      };

      function checkEnd(e) {
        let endTime = new Date().getTime();
        let time = endTime - startTime;
        if (time >= settings.minTime && time <= settings.maxTime) {
          if (Math.abs(distX) >= settings.minDist && Math.abs(distY) <= settings.maxDist) {
            swipeType = dir; // check character as "left" or "right"
          } else if (Math.abs(distY) >= settings.minDist && Math.abs(distX) <= settings.maxDist) {
            swipeType = dir; // check character as "top" or "down"
          }
        }
        dist = (dir === "left" || dir === "right") ? Math.abs(distX) : Math.abs(distY); // check distance
        // e.preventDefault();

        if (touchElement == 'bigImage' && swipeType == 'left') arrow('next');
        if (touchElement == 'bigImage' && swipeType == 'right') arrow('prev');

        if (touchElement == 'imagesItem' && swipeType == 'left') arrow('scrollNext');
        if (touchElement == 'imagesItem' && swipeType == 'right') arrow('scrollPrev');

        if (isMouse && isMouseDown) { // exit function and reset 'mouse click' test
          if (touchElement == 'bigImage') $('.big-image').css({ left: '50%' });
          if (touchElement == 'imagesItem') $('.images-item').css({ left: 0 });
          isMouseDown = false;
          return;
        }
        if (touchElement == 'bigImage') $('.big-image').css({ left: '50%' });
        if (touchElement == 'imagesItem') $('.images-item').css({ left: 0 });
      };

      // add supported events
      let events = {
        type: "touch",
        start: "touchstart",
        move: "touchmove",
        end: "touchend",
        cancel: "touchcancel",
        leave: "mouseleave",
      };

      // add handlers to an item
      el.addEventListener(events.start, checkStart);
      el.addEventListener(events.move, checkMove);
      el.addEventListener(events.end, checkEnd);

    };

    let bigImageContainer = $('.big-image-container')[0];
    swipe(bigImageContainer);
    bigImageContainer.addEventListener("swipe", () => { });

    let imagesContainer = $('.images-container')[0];
    swipe(imagesContainer);
    imagesContainer.addEventListener("swipe", () => { });
  }
});
