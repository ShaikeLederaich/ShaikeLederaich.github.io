import { Animations } from './animations.js';
import { Ajax, LiveReports, getCoinInfoByID } from './services.js';
import { Storage } from './Storage.js';
import { Coins } from './coins.js';

export class UI {
  static endIndex;
  static startIndex = 0;
  static arrToDisplay = [];

  //Toggle Navbar 'Hamburger' on Click
  static hamburgerToggle() {
    $('.second-button').on('click', function () {
      $('.animated-icon2').toggleClass('open');
    });
  }

  //Check how much cards to display By screen width
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
    //Slice new Array To Display
    this.arrToDisplay = Coins.arrAllListOfCoins.slice(
      startIndex,
      numberOfCardsToDisplay
    );
    if (this.arrToDisplay.length < length) {
      $('#loadNext').parent().addClass('disabled');
    } else {
      $('#loadNext').parent().removeClass('disabled');
    }
    return this.arrToDisplay;
  }

  static CardsToDisplay(arrToDisplay) {
    //Clear parent Box
    $('#boxOfAllCards').empty();
    //Add parallax image
    this.appendParallaxImg();
    $.each(arrToDisplay, function (indexInArray, valueOfElement) {
      //Draw Cards in the UI for every coin thats in 'arrToDisplay'
      UI.drawCardsInsideboxOfAllCards(
        indexInArray,
        valueOfElement.symbol,
        valueOfElement.name,
        valueOfElement.id
      );
    });

    //Checking out what is stored in Local Storage & After that moves the toggle switch to 'Yes' in the cards of the coins that in local storage
    Storage.getLiveRepFromLocalStorage();

    //Torn On these function
    UI.updateModalAndLiveArrFromAllCards();
    getCoinInfoByID();
  }

  static showNextCoins(index, numOfCards) {
    this.startIndex = index + numOfCards;
    this.endIndex += numOfCards;

    //Display Cards of coins
    this.CardsToDisplay(
      //Slice new Array to display from 'Coins.arrAllListOfCoins'
      this.sliceNewArr(this.startIndex, this.endIndex, numOfCards)
    );
  }

  static showPreviousCoins(index, numOfCards) {
    this.startIndex = index - numOfCards;
    this.endIndex -= numOfCards;

    //Display Cards of coins
    this.CardsToDisplay(
      //Slice new Array to display from 'Coins.arrAllListOfCoins'
      this.sliceNewArr(this.startIndex, this.endIndex, numOfCards)
    );
  }

  //Show just the coins their switch is 'Yes'
  static showSwitchYes(numOfCards) {
    //If the 'Show Only Checked' checkbox is Not false
    if (!$('#checkSwitch > input')[0].checked === false) {
      //Create new temp array
      let currArr = [];
      //Each coin that inside array of Live reports
      $.each(LiveReports.liveRep, function (indexInArray, valueOfElement) {
        //Push coin object coin to new array
        //Coin object thats what return from findCoinBySearch() function after we send coin symbol
        currArr.push(Coins.findCoinBySearch(valueOfElement));
      });
      //Send the new array this function
      UI.CardsToDisplay(currArr);
    } else {
      //If the 'Show Only Checked' checkbox is FALSE - Show The same crads that you saw before
      this.CardsToDisplay(
        this.sliceNewArr(this.startIndex, this.endIndex, numOfCards)
      );
    }
  }

  static addButtons() {
    //Add Checkbox & Button to main page
    let output = `
    <div id="buttonBox">
      <div id="checkSwitch">
      <label class=" form-check-label" for="exampleCheck1">Show Only Checked</label>
      <input type="checkbox" id="exampleCheck1">
      </div>
      <button class="myBTN btn" id="clearSwitch" type="button" class="btn">Reset Switches</button>
    </div>
    `;
    $('#mainSctn > .container-fluid > .row').prepend(output);
  }

  static appendPagination() {
    //Add Pagination to main page
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

    $('#mainSctn > .container-fluid > .row').append(output);
  }

  static appendParallaxImg() {
    //Add parallax image to main page
    let output = `
    <div id="parallaxImg"></div>
    `;
    $('#boxOfAllCards').append(output);
  }

  static drawCardsInsideboxOfAllCards(index, symbol, name, id) {
    //Draw coins cards inside the parent 'Div'
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

  //Draw Information card dynamicly to collapse
  static drawInfoCardsDynamicly(id, imgLink, currPriceObj) {
    //Hide progree bar & 'More Info' button
    $(
      `#boxOfAllCards > div#${id} > .card-body > .collapse > .accordion > .progress`
    ).hide();
    $(`button#btn-${id}`).hide();

    //Draw Info Card
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

    //OnClick on 'Read Less' button -> Close collapse & Show 'More Info' button
    $(`#readLess-${id}`).click(function (e) {
      $(`button#btn-${id}`).show();
      e.preventDefault();
    });
  }

  static drawSearchCoinResult() {
    //Draw the result of user search on Special box
    let mainHeader = document.getElementById('myHeader');
    let searchBoxSctn = document.getElementById('searchBoxSctn');
    let mySpecialSrcBox = document.getElementById('mySpecialSrcBox');

    searchBoxSctn.style.zIndex = 1;
    mySpecialSrcBox.style.display = 'flex';

    //Hide dynamicly box with extra info
    $('article#extraInfo').hide();

    $('h2 > span').text(`${Coins.searchCoinObj.sym}`);
    $('h3 > span').text(`${Coins.searchCoinObj.id}`);
    //Enable animation
    Animations.specialBoxAnimation();
    mainHeader.style.zIndex = -1;
    //Enable this functions
    //Show Extra Inofrmation
    UI.showExtraInfo(Coins.searchCoinObj.id);
    //Update Modal
    UI.updateModalAndLiveArrFromSpecialBox(
      Coins.searchCoinObj.sym,
      Coins.searchCoinObj.id
    );
    //Hide Special box
    UI.hideSpecialBox();
  }

  static showExtraInfo(id) {
    $('#mySpecialSrcBox > #moreInfo').click(function (e) {
      let target = e.target.id;

      //Set extra info to session storage
      Storage.getCoinDetailsFromSessionStorage(id, target);

      //FadeIn The box with Extra info
      $('article#extraInfo').fadeIn(2000);
      e.preventDefault();
    });
  }

  static hideSpecialBox() {
    let mainHeader = document.getElementById('myHeader');
    //Hide the Special Box
    $('#mySpecialSrcBox > i').click(function (e) {
      $('#mySpecialSrcBox').fadeOut(1500);
      mainHeader.style.zIndex = 0;
      setTimeout(() => {
        searchBoxSctn.style.zIndex = -1;
      }, 1500);
      e.preventDefault();
    });
  }

  static drwaSearchingExtraInfo(img, price) {
    //Draw Extra info (prices & image)
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
      //If the specific coin already included at the local storage & the array of live reports -> Switch is on 'Yes'
      $('#mySpecialSrcBox > label > input').prop('checked', true);
      $('#mySpecialSrcBox > label > input').on('click', function () {
        //Enable this function
        updateModalAndLiveArr(sym, id);
        $(`div#${id} > label > .liveRepCheck`).prop('checked', false);
      });
      console.log('Yes');
    } else {
      //If the specific coin NOT included at the local storage & the array of live reports
      $('#mySpecialSrcBox > label > input').on('click', function () {
        updateModalAndLiveArr(sym, id);
        $(`div#${id} > label > .liveRepCheck`).prop('checked', true);
      });
      console.log('No');
    }
  }

  static updateModalAndLiveArrFromAllCards() {
    //Get Array of all list of coins
    let coinsList = Coins.getList();

    $.each(coinsList, function (indexInArray, valueOfElement) {
      //Get 'Id' & 'Sym' from every coin
      let id = valueOfElement.id;
      let sym = valueOfElement.symbol;
      sym = sym.toUpperCase();

      $(`div#${id}`).each(function (index, element) {
        $(this).on('click', 'input', function (e) {
          //When Click ON toggle switch of each div that is 'Id' is the same like coin 'id' - Go to this function
          updateModalAndLiveArr(sym, id);
        });
      });
    });
  }

  //Remove coins from the array of live reports from the modal
  static removeFromLiveRepArrFromTheModal(callback) {
    $('.modal-footer > #confirm').on('click', function (e) {
      //Create list of all inputs at the modal
      let allInputsAtList = $('ol')
        .children()
        .children()
        .children('label')
        .children('input');

      //Each input
      $.each(allInputsAtList, function (indexInArray, input) {
        //If input (checkbox) is checked
        if (this.checked === true) {
          //Take the coin symbol from the specific line at list & placing in var
          let currSym = $(
            `ol > li:nth-child(${indexInArray + 1}) > p > span:nth-child(3)`
          ).text();

          currSym = currSym.toUpperCase();

          console.log(LiveReports.liveRep);

          //Get the index number of the coin symbol at the array of live reports
          let indexLiveRep = LiveReports.liveRep.indexOf(currSym);

          console.log(indexLiveRep);

          //Take the coin Id from the specific line at list & placing in var
          let currId = $(
            `ol > li:nth-child(${indexInArray + 1}) > p > span:first-child`
          ).text();
          console.log(currId);

          //Remove coin from array of live reports
          LiveReports.liveRep.splice(indexLiveRep, 1);
          console.log(LiveReports.liveRep);

          //Change the switch to 'No'
          $(`div#${currId} > label > .liveRepCheck`).prop('checked', false);
        }
      });
      //Hide modal
      $('#myModal').modal('hide');
    });

    //When modal is hidden
    $('#myModal').on('hidden.bs.modal', function (e) {
      LiveReports.removeAttrToOpenModal();
      $('.liveRepCheck').prop('disabled', false);

      callback();
    });
  }

  //Add line to the list on modal
  static addLiToModalList(arr) {
    //Clear list
    $('#myModal > .modal-dialog > .modal-content > .modal-body > ol').empty();

    //Take the new coin symbol that we want to put into the array of live report and put it into a variable
    let newSym = arr[5];

    //Then remove this coin symbol
    arr.pop();
    //Set to lacal storage without this symbol
    Storage.setLiveRepToLocalStorage(arr);

    //For symbol at the array
    for (let sym of arr) {
      //Find coin object
      let currObj = Coins.findCoinBySearch(sym);

      //Create new line to the list with the coin object parameters
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
      //Append to the list
      $('#myModal > .modal-dialog > .modal-content > .modal-body > ol').append(
        output
      );

      //%---Add Style For Modal List

      //%--01) 'ol' Style
      $('#myModal > .modal-dialog > .modal-content > .modal-body > ol').css({
        'list-style-position': 'inside',
      });

      //%--02) 'li' Style
      $(
        '#myModal > .modal-dialog > .modal-content > .modal-body > ol > li'
      ).css({
        'font-size': '1.3rem',
        'border-bottom': '4px dashed black',
        'padding-bottom': '20px',
      });

      //%--03) 'p' Style
      $(
        '#myModal > .modal-dialog > .modal-content > .modal-body > ol > li > p'
      ).css({
        display: 'inline-block',
        'font-weight': 'bold',
        'font-style': 'italic',
        margin: '10px 15px',
      });

      //%--04) 'btn toggle' Style
      $(
        `#myModal > .modal-dialog > .modal-content > .modal-body > ol > li > p > .rocker`
      ).css({
        right: '3%',
        'font-size': '0.65em',
      });

      //%--05) 'span' Style
      $(
        '#myModal > .modal-dialog > .modal-content > .modal-body > ol > li > p > span'
      ).css({
        'font-size': '1.4rem',
        color: 'Blue',
        'background-color': 'rgba(0, 0, 0, 0.25)',
        'font-weight': 'bold',
        'font-style': 'none',
      });
    }
    //Return the new coin symbol that we wanted to put into the array of live report before modal is opening
    return newSym;
  }

  static closeNavbarCollapseWhenClickOnLiTag() {
    let navBar = document.getElementsByTagName('nav');
    //All 'li' tag from the navbar to list
    let navUL = navBar[0].children[0].children[1].children[0];

    //OnClick Each 'li' tag
    $(navUL).on('click', 'li', function () {
      $('.animated-icon2').removeClass('open');
      $('#collapsibleNavId').collapse('hide');
    });
  }

  //%---Change 'Header' Height From '20%' To 'Auto' When 'Click' on Collapse Button inside Navbar
  static changeHeaderHeightToAuto() {
    let myHeader = document.getElementById('myHeader');
    $(myHeader).on('click', 'button#navCollapseBtn', function () {
      myHeader.style.height = 'auto';
      myHeader.style.zIndex = 2;
    });
    $('#collapsibleNavId').on('hidden.bs.collapse', function () {
      myHeader.style.height = '182px';
      myHeader.style.zIndex = 0;
    });
  }

  //%---Change Toggle-BTN Z-Index When Nav Collapse Is Open
  static changeZIndexForToggleBTN() {
    let cardToggle = document.querySelectorAll('label.rocker');
    $('#collapsibleNavId').on('show.bs.collapse', function () {
      console.log('Open');
      cardToggle[0].style.zIndex = 0;
      cardToggle[1].style.zIndex = 0;
    });
    $('#collapsibleNavId').on('hide.bs.collapse', function () {
      console.log('Close');
      cardToggle[0].style.zIndex = 2;
      cardToggle[1].style.zIndex = 2;
    });
  }

  static getCurrYear() {
    let d = new Date();
    let a = $('#myFooter').children('#p2').children()[1];
    $(a).text(d.getFullYear());
  }
}

function updateModalAndLiveArr(sym, id) {
  //First send coin symbol to this function
  LiveReports.pushAndRemovedFromLiveReportsBefore6(sym);

  // If Live Reports array already includs 5 cois - to the next coin -  Add this Attributes to open 'Modal'
  if (LiveReports.liveRep.length > 5) {
    $(this).attr({
      'data-toggle': 'modal',
      'data-target': '#myModal',
    });

    //Then send the Live Reports Array to this function.
    //This function Create 'li' tag inside the 'ol' tag for every coin at Live Reports Array.

    //This function return The symbol of the coin that not entered the Live Report array
    LiveReports.newsym = UI.addLiToModalList(LiveReports.liveRep);

    setTimeout(() => {
      //Show the 'Modal'
      $('#myModal').modal('show');

      //Change The Switch toggle Of the coin that not entered to 'No'
      $(`div#${id} > label > .liveRepCheck`).prop('checked', false);
    }, 200);

    //Make all Another Switches toggle disabled
    $('.liveRepCheck').prop('disabled', true);
  }
}
