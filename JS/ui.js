import { Animations } from './animations.js';
import { Ajax, LiveReports, getCoinInfoByID } from './services.js';
import { Storage } from './Storage.js';
import { Coins } from './coins.js';

export class UI {
  //%---How many cards to Display By screen Width
  static endIndex;
  static startIndex = 0;
  static arrToDisplay = [];

  static howManyCardsToDisplay(innerWidth) {
    if (innerWidth < 576) {
      this.endIndex = 10;
    } else if (innerWidth > 575 && innerWidth < 769) {
      this.endIndex = 20;
    } else if (innerWidth > 768) {
      this.endIndex = 36;
    }
    return this.endIndex;
  }

  static sliceNewArr(startIndex, numberOfCardsToDisplay, length) {
    //%---Slice new Array To Display
    this.arrToDisplay = Coins.arrAllListOfCoins.slice(
      startIndex,
      numberOfCardsToDisplay
    );
    if (this.arrToDisplay.length < length) {
      $('#loadNext')
        .parent()
        .addClass('disabled');
    } else {
      $('#loadNext')
        .parent()
        .removeClass('disabled');
    }
    return this.arrToDisplay;
  }

  static CardsToDisplay(arrToDisplay) {
    $('#boxOfAllCards').empty();
    this.appendParallaxImg();
    //%---Draw Cards to UI
    $.each(arrToDisplay, function(indexInArray, valueOfElement) {
      UI.drawCardsInsideboxOfAllCards(
        indexInArray,
        valueOfElement.symbol,
        valueOfElement.name,
        valueOfElement.id
      );
    });
    Storage.getLiveRepFromLocalStorage();
    UI.updateModalAndLiveArrFromAllCards();
    getCoinInfoByID();
  }

  static showNextCoins(index, numOfCards) {
    this.startIndex = index + numOfCards;
    this.endIndex += numOfCards;

    this.CardsToDisplay(
      this.sliceNewArr(this.startIndex, this.endIndex, numOfCards)
    );
  }

  static showPreviousCoins(index, numOfCards) {
    this.startIndex = index - numOfCards;
    this.endIndex -= numOfCards;

    this.CardsToDisplay(
      this.sliceNewArr(this.startIndex, this.endIndex, numOfCards)
    );
  }

  static showSwitchYes(numOfCards) {
    if (!$('#checkSwitch > input')[0].checked === false) {
      let currArr = [];
      $.each(LiveReports.liveRep, function(indexInArray, valueOfElement) {
        currArr.push(Coins.findCoinBySearch(valueOfElement));
      });
      UI.CardsToDisplay(currArr);
    } else {
      this.CardsToDisplay(
        this.sliceNewArr(this.startIndex, this.endIndex, numOfCards)
      );
    }
  }

  static addButtons() {
    let output = `
    <div id="buttonBox">
    <div id="checkSwitch">
    
    <label class=" form-check-label" for="exampleCheck1">Show Checked Only</label>
    <input type="checkbox" id="exampleCheck1">
    </div>
    <button class="myBTN btn" id="clearSwitch" type="button" class="btn">Reset Switches</button>
    </div>
    `;
    $('#sctn1 > .container-fluid > .row').prepend(output);
  }

  static appendPagination() {
    let output = `
    <nav aria-label="Search results" class="d-flex w-100">
      <ul class="pagination m-auto justify-content-center">
        <li class="page-item disabled">
          <a id="loadPrevious" class="page-link" href="#" tabindex="-1">Previous</a>
        </li>
        <li class="page-item">
          <a id="loadNext" class="page-link" href="#">Next</a>
        </li>
      </ul>
    </nav>`;

    $('#sctn1 > .container-fluid > .row').append(output);
  }

  static appendParallaxImg() {
    let output = `
    <div id="parallaxImg"></div>
    `;
    $('#boxOfAllCards').append(output);
  }

  static drawCardsInsideboxOfAllCards(index, symbol, name, id) {
    let output = `
      <div data-index="${index}" id="${id}" class="card myCardBox">
        <label class="rocker rocker-small">
          <input type="checkbox" class="liveRepCheck"/>
          <span class="switch-left">Yes</span>
          <span class="switch-right">No</span>
        </label>
        <div class="card-body">
          <h5 class="card-title font-weight-bolder">${symbol}</h5>
          <p class="card-text font-weight-bold text-center">${name}</p>
          <button id="btn-${id}" class="btn myBTN btn-block" data-toggle="collapse" data-target="#collapse-${id}">More Info</button>
          <div class="collapse mb-5" id="collapse-${id}">
          <div class="accordion">
          <div class="progress mt-4">
            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%">
            </div>
          </div>
          <div class="card">

          </div>
          </div>
          </div>
        </div>
      </div>
      `;
    $('#boxOfAllCards').append(output);
  }

  static pushCollapseToDivByID(id, imgLink, currPriceObj) {
    $(
      `#boxOfAllCards > div#${id} > .card-body > .collapse > .accordion > .progress`
    ).hide();
    $(`button#btn-${id}`).hide();

    $(
      `div#${id} > div.card-body > div#collapse-${id} > div.accordion > div.card`
    ).html(`
        <div class="card-body">
          <img class="card-img-top" src="${imgLink}" alt="Card image cap">
          <h5 class="card-title">Current Price:</h5>
          <p class="card-text text-center">
          <span id="spn1">US Dollar: </span><br/><span id="spn2"> &#36;${currPriceObj.Usd}</span>
          </p>
          <p class="card-text text-center">
          <span id="spn3">Euru:</span><br/><span id="spn4"> &#8364;${currPriceObj.Eur}</span>
          </p>
          <p class="card-text text-center">
          <span id="spn5">IL Shekel:</span><br/><span id="spn6"> &#8362;${currPriceObj.Ils}</span>
          </p>
          <button id="readLess-${id}" class="btn myBTN btn-primary btn-block" data-toggle="collapse" data-target="#collapse-${id}">Less Info</button>
        </div>
      `);

    $(`#readLess-${id}`).click(function(e) {
      $(`button#btn-${id}`).show();
      e.preventDefault();
    });
  }

  static drawSearchCoinResult() {
    let mainHeader = document.getElementById('myHeader');
    let boxOfAllCards = document.getElementById('boxOfAllCards');
    let sctn2 = document.getElementById('sctn2');
    sctn2.style.zIndex = 1;
  
    $('article#extraInfo').hide();
    $('h2 > span').text(`${Coins.searchCoinObj.sym}`);
    $('h3 > span').text(`${Coins.searchCoinObj.id}`);
    Animations.testSpecialBoxAnimation();
    mainHeader.style.zIndex = -1;
    boxOfAllCards.style.zIndex = -1;
    UI.drawAndHideMoreInfoForSpeacialBox(Coins.searchCoinObj.id);
    UI.updateModalAndLiveArrFromSpecialBox(Coins.searchCoinObj.sym, Coins.searchCoinObj.id);
  }

  static drawAndHideMoreInfoForSpeacialBox(id) {
    let mainHeader = document.getElementById('myHeader');

    $('#mySpecialSrcBox > #moreInfo').click(function(e) {
      let target = e.target.id;

      console.log(target);

      Storage.getCoinDetailsFromSessionStorage(id, target);

      $('article#extraInfo').fadeIn(2000);
      e.preventDefault();
    });

    $('#mySpecialSrcBox > i').click(function(e) {
      $('#mySpecialSrcBox').fadeOut(1500);
      mainHeader.style.zIndex = 0;
      setTimeout(() => {
        boxOfAllCards.style.zIndex = 1;
        sctn2.style.zIndex = -1;
      }, 1500);
      e.preventDefault();
    });
  }

  static drwaSearchingExtraInfo(img, price) {
    $('#extraInfo > #currPrice > #text > #p1 > span').text(price.Usd);
    $('#extraInfo > #currPrice > #text > #p2 > span').text(price.Eur);
    $('#extraInfo > #currPrice > #text > #p3 > span').text(price.Ils);
    let imgPlace = document.getElementById('currCoinImg');
    imgPlace.style.backgroundImage = `url(${img})`;
  }

  static updateModalAndLiveArrFromSpecialBox(sym, id) {
    sym = sym.toUpperCase();
    console.log(sym);
    if (LiveReports.liveRep.includes(sym)) {
      $('#mySpecialSrcBox > label > input').prop('checked', true);
      $('#mySpecialSrcBox > label > input').on('click', function() {
        updateModalAndLiveArr(sym, id);
        $(`div#${id} > label > .liveRepCheck`).prop('checked', false);
      });
      console.log('Yes');
    } else {
      $('#mySpecialSrcBox > label > input').on('click', function() {
        updateModalAndLiveArr(sym, id);
        $(`div#${id} > label > .liveRepCheck`).prop('checked', true);
      });
      console.log('No');
    }
  }

  static updateModalAndLiveArrFromAllCards() {
    let coinsList = Coins.getList();
    let eTarget;

    $.each(coinsList, function(indexInArray, valueOfElement) {
      let id = valueOfElement.id;
      let sym = valueOfElement.symbol;
      sym = sym.toUpperCase();

      $(`div#${id}`).each(function(index, element) {
        $(this).on('click', 'input', function(e) {
          eTarget = e.target;
          updateModalAndLiveArr(sym, id);
        });
      });
    });
  }

  static removeFromLiveRepArrFromTheModal(callback) {
    $('.modal-footer > #confirm').on('click', function(e) {
      let allInputsAtList = $('ol')
        .children()
        .children()
        .children('label')
        .children('input');

      $.each(allInputsAtList, function(indexInArray, input) {
        if (this.checked === true) {
          let currSym = $(
            `ol > li:nth-child(${indexInArray + 1}) > p > span:nth-child(2)`
          ).text();
          currSym = currSym.toUpperCase();
          console.log(currSym);

          let indexLiveRep = LiveReports.liveRep.indexOf(currSym);

          console.log(indexLiveRep);

          let currId = $(
            `ol > li:nth-child(${indexInArray + 1}) > p > span:first-child`
          ).text();
          console.log(currId);

          LiveReports.liveRep.splice(indexLiveRep, 1);
          console.log(LiveReports.liveRep);

          $(`div#${currId} > label > .liveRepCheck`).prop('checked', false);
        }
      });
      $('#myModal').modal('hide');
    });

    $('#myModal').on('hidden.bs.modal', function(e) {
      console.log('12345');

      LiveReports.removeAttrToOpenModal();
      $('.liveRepCheck').prop('disabled', false);

      callback();
    });
  }

  static addLiToModalList(arr) {
    $('#myModal > .modal-dialog > .modal-content > .modal-body > ol').empty();

    let newSym = arr[5];

    arr.pop();
    Storage.setLiveRepToLocalStorage(arr);

    for (let sym of arr) {
      sym = sym.toLowerCase();
      let currObj = Coins.findCoinBySearch(sym);
      // console.log(currObj);

      let output = `
      <li id="${currObj.id}">
        <p>
        Id: <span id="spn1-${currObj.id}">${currObj.id}</span>, <br/> Symbol: <span id="spn2-${sym}" class="spnSym">${sym}</span>
        <label class="rocker rocker-small">
          <input type="checkbox"/>
          <span class="switch-left">Yes</span>
          <span class="switch-right">No</span>
        </label>
        </p>
      </li>
      `;

      $('#myModal > .modal-dialog > .modal-content > .modal-body > ol').append(
        output
      );

      //%---Style For Modal List

      //%--01) 'ol' Style
      $('#myModal > .modal-dialog > .modal-content > .modal-body > ol').css({
        'list-style-position': 'inside'
      });

      //%--02) 'li' Style
      $(
        '#myModal > .modal-dialog > .modal-content > .modal-body > ol > li'
      ).css({
        'font-size': '1.3rem',
        'border-bottom': '4px dashed black',
        'padding-bottom': '20px'
      });

      //%--03) 'p' Style
      $(
        '#myModal > .modal-dialog > .modal-content > .modal-body > ol > li > p'
      ).css({
        display: 'inline-block',
        'font-weight': 'bold',
        'font-style': 'italic',
        margin: '10px 15px'
      });

      //%--04) 'btn toggle' Style
      $(
        `#myModal > .modal-dialog > .modal-content > .modal-body > ol > li > p > .rocker`
      ).css({
        right: '3%',
        'font-size': '0.65em'
      });

      //%--05) 'span' Style
      $(
        '#myModal > .modal-dialog > .modal-content > .modal-body > ol > li > p > span'
      ).css({
        'font-size': '1.4rem',
        color: 'Blue',
        'background-color': 'rgba(0, 0, 0, 0.25)',
        'font-weight': 'bold',
        'font-style': 'none'
      });
    }
    return newSym;
  }

  static closeCollapseWhenClickOnALink() {
    let navBar = document.getElementsByTagName('nav');
    let navUL = navBar[0].children[0].children[1].children[0];

    $(navUL).on('click', 'li', function() {
      $('.animated-icon2').removeClass('open');
      $('#collapsibleNavId').collapse('hide');
    });
  }

  //%---Change 'Header' Height From '20%' To 'Auto' When 'Click' on Collapse Button inside Navbar
  static changeHeaderHeightToAuto() {
    let myHeader = document.getElementById('myHeader');
    $(myHeader).on('click', 'button#navCollapseBtn', function() {
      myHeader.style.height = 'auto';
      myHeader.style.zIndex = 2;
    });
    $('#collapsibleNavId').on('hidden.bs.collapse', function() {
      myHeader.style.height = '182px';
      myHeader.style.zIndex = 0;
    });
  }

  //%---Change Toggle-BTN Z-Index When Nav Collapse Is Open
  static changeZIndexForToggleBTN() {
    let cardToggle = document.querySelectorAll('label.rocker');
    $('#collapsibleNavId').on('show.bs.collapse', function() {
      console.log('Open');
      cardToggle[0].style.zIndex = 0;
      cardToggle[1].style.zIndex = 0;
    });
    $('#collapsibleNavId').on('hide.bs.collapse', function() {
      console.log('Close');
      cardToggle[0].style.zIndex = 2;
      cardToggle[1].style.zIndex = 2;
    });
  }
  static getCurrYear() {
    let d = new Date();
    let a = $('#myFooter')
      .children('#p2')
      .children()[1];
    $(a).text(d.getFullYear());
  }
}

function updateModalAndLiveArr(sym, id) {
  LiveReports.pushAndRemovedFromLiveReportsBefore6(sym);

  if (LiveReports.liveRep.length > 5) {
    $(this).attr({
      'data-toggle': 'modal',
      'data-target': '#myModal'
    });

    LiveReports.newsym = UI.addLiToModalList(LiveReports.liveRep);

    setTimeout(() => {
      $('#myModal').modal('show');

      $(`div#${id} > label > .liveRepCheck`).prop('checked', false);
    }, 200);

    $('.liveRepCheck').prop('disabled', true);
  }
}
