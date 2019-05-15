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
    return;
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









  /**
 * Функция определения события swipe на элементе.
 * param {Object} el - элемент DOM.
 * param {Object} settings - объект с предварительными настройками.
 */
  var swipe = function (el, settings) {

    // настройки по умолчанию
    var settings = Object.assign({}, {
      minDist: 60,
      maxDist: 200,
      maxTime: 2000,
      minTime: 50
    }, settings);

    // коррекция времени при ошибочных значениях
    if (settings.maxTime < settings.minTime) settings.maxTime = settings.minTime + 500;
    if (settings.maxTime < 100 || settings.minTime < 50) {
      settings.maxTime = 700;
      settings.minTime = 50;
    }



    var dir,                  // направление свайпа (horizontal, vertical)
      swipeType,            // тип свайпа (up, down, left, right)
      dist,                 // дистанция, пройденная указателем
      isMouse = false,      // поддержка мыши (не используется для тач-событий)
      isMouseDown = false,  // указание на активное нажатие мыши (не используется для тач-событий)
      startX = 0,           // начало координат по оси X (pageX)
      distX = 0,            // дистанция, пройденная указателем по оси X
      startY = 0,           // начало координат по оси Y (pageY)
      distY = 0,            // дистанция, пройденная указателем по оси Y
      startTime = 0,        // время начала касания
      support = {           // поддерживаемые браузером типы событий
        pointer: !!("PointerEvent" in window || ("msPointerEnabled" in window.navigator)),
        touch: !!(typeof window.orientation !== "undefined" || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || "ontouchstart" in window || navigator.msMaxTouchPoints || "maxTouchPoints" in window.navigator > 1 || "msMaxTouchPoints" in window.navigator > 1)
      };

    /**
     * Опредление доступных в браузере событий: pointer, touch и mouse.
     * returns {Object} - возвращает объект с доступными событиями.
     */
    var getSupportedEvents = function () {
      switch (true) {
        case support.pointer:
          events = {
            type: "pointer",
            start: "PointerDown",
            move: "PointerMove",
            end: "PointerUp",
            cancel: "PointerCancel",
            leave: "PointerLeave"
          };
          // добавление префиксов для IE10
          var ie10 = (window.navigator.msPointerEnabled && Function('/*@cc_on return document.documentMode===10@*/')());
          for (var value in events) {
            if (value === "type") continue;
            events[value] = (ie10) ? "MS" + events[value] : events[value].toLowerCase();
          }
          break;
        case support.touch:
          events = {
            type: "touch",
            start: "touchstart",
            move: "touchmove",
            end: "touchend",
            cancel: "touchcancel"
          };
          break;
        default:
          events = {
            type: "mouse",
            start: "mousedown",
            move: "mousemove",
            end: "mouseup",
            leave: "mouseleave"
          };
          break;
      }
      return events;
    };


    /**
     * Объединение событий mouse/pointer и touch.
     * param e {Event} - принимает в качестве аргумента событие.
     * returns {TouchList|Event} - возвращает либо TouchList, либо оставляет событие без изменения.
     */
    var eventsUnify = function (e) {
      return e.changedTouches ? e.changedTouches[0] : e;
    };


    /**
     * Обрабочик начала касания указателем.
     * param e {Event} - получает событие.
     */
    var checkStart = function (e) {
      var event = eventsUnify(e);
      if (support.touch && typeof e.touches !== "undefined" && e.touches.length !== 1) return; // игнорирование касания несколькими пальцами
      dir = "none";
      swipeType = "none";
      dist = 0;
      startX = event.pageX;
      startY = event.pageY;
      startTime = new Date().getTime();
      if (isMouse) isMouseDown = true; // поддержка мыши
      e.preventDefault();
    };

    /**
     * Обработчик движения указателя.
     * param e {Event} - получает событие.
     */
    var checkMove = function (e) {
      if (isMouse && !isMouseDown) return; // выход из функции, если мышь перестала быть активна во время движения
      var event = eventsUnify(e);
      distX = event.pageX - startX;
      distY = event.pageY - startY;
      if (Math.abs(distX) > Math.abs(distY)) dir = (distX < 0) ? "left" : "right";
      else dir = (distY < 0) ? "up" : "down";
      e.preventDefault();

      $('.big-image').css({['left']: distX + 'px'});
      console.log(distX);

    };

    /**
     * Обработчик окончания касания указателем.
     * param e {Event} - получает событие.
     */
    var checkEnd = function (e) {
      var endTime = new Date().getTime();
      var time = endTime - startTime;
      if (time >= settings.minTime && time <= settings.maxTime) { // проверка времени жеста
        if (Math.abs(distX) >= settings.minDist && Math.abs(distY) <= settings.maxDist) {
          swipeType = dir; // опредление типа свайпа как "left" или "right"
        } else if (Math.abs(distY) >= settings.minDist && Math.abs(distX) <= settings.maxDist) {
          swipeType = dir; // опредление типа свайпа как "top" или "down"
        }
      }
      dist = (dir === "left" || dir === "right") ? Math.abs(distX) : Math.abs(distY); // опредление пройденной указателем дистанции

      // генерация кастомного события swipe
      if (swipeType !== "none" && dist >= settings.minDist) {
        var swipeEvent = new CustomEvent("swipe", {
          bubbles: true,
          cancelable: true,
          detail: {
            full: e, // полное событие Event
            dir: swipeType, // направление свайпа
            dist: dist, // дистанция свайпа
            time: time // время, потраченное на свайп
          }
        });
        el.dispatchEvent(swipeEvent);
      }
      e.preventDefault();

      console.log(swipeType);

      if (swipeType == 'left') arrow('next');
      if (swipeType == 'right') arrow('prev');

      if (isMouse && isMouseDown) { // выход из функции и сброс проверки нажатия мыши
      $('.big-image').css({['left']: 0});
        isMouseDown = false;
        return;
      }
    };

    // добавление поддерживаемых событий
    var events = getSupportedEvents();

    // проверка наличия мыши
    if ((support.pointer && !support.touch) || events.type === "mouse") isMouse = true;

    // добавление обработчиков на элемент
    el.addEventListener(events.start, checkStart);
    el.addEventListener(events.move, checkMove);
    el.addEventListener(events.end, checkEnd);

  };


  // элемент
  var myBlock = document.getElementsByClassName('big-image-container')[0];

  // вызов функции swipe с предварительными настройками
  swipe(myBlock, { maxTime: 2000, minTime: 10, maxDist: 200, minDist: 60 });

  // обработка свайпов
  myBlock.addEventListener("swipe", function () { });
});
