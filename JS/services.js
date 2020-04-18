import { UI } from './ui.js';
import { Coins } from './coins.js';
import { Storage } from './Storage.js';

export class Ajax {
  //%---Get Html Template -> Then Draw The Template Inside The Parent 'Div'

  static getHtmlTemplate(url, id, callback) {
    console.log(id);
    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'text',
    }).done((res) => {
      document.getElementById(id).innerHTML = res;
    });
  }

  //%---Send 'GET' Request to API And get All Crypto Coins list

  static getDataFromURL(url) {
    $.ajax({
      type: 'GET',
      url: `${url}`,
      dataType: 'json',
    })
      .done((response) => {
        //%---Done() - If The Request Succses === No Error

        //%---Placing The Array Response To Array of all list coins in Coins class
        Coins.arrAllListOfCoins = response;

        //this function enable to some functions to build the 'main' page
        console.log(UI.startIndex);
        console.log(UI.endIndex);
        buildMainPage(UI.startIndex, UI.endIndex, UI.howManyCards);
      })
      //%---Fail() - If The Request Not Succses === Error
      .fail((err) => {
        console.log(err.responseText);
      });
  }

  static async sendAPI_GETRequestByID(id, target) {
    //Get the date
    const date1 = new Date();
    //The time right now
    const timeOnFirstClick = date1.getTime();

    //Send URL To fetch & Wait response
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}`
    );
    //Then response.json()
    const obj = await response.json();

    //Temp vars contain coin image & coin prices array
    const currImg = obj.image.large;
    const currPrice = obj.market_data.current_price;

    //Create Temp object with the current parameters
    const currCryptoCoin = {};
    currCryptoCoin.image = currImg;
    currCryptoCoin.price = {
      Usd: `${currPrice.usd}`,
      Eur: `${currPrice.eur}`,
      Ils: `${currPrice.ils}`,
    };
    currCryptoCoin.time = timeOnFirstClick;

    //Set to session storage - Need to send coin obj & coin Id
    Storage.setToSessionStorage(currCryptoCoin, id);

    //Send target & coin Id to this function
    Storage.getCoinDetailsFromSessionStorage(id, target);
  }
}

export function moreInfo(target, id, img, price) {
  if (target !== 'moreInfo') {
    $(
      `#boxOfAllCards > div#${id} > .card-body > .collapse > .accordion > .progress`
    ).show();
    //If the target name !== 'moreInfo'
    UI.drawInfoCardsDynamicly(id, img, price);
  } else {
    //If the target name === 'moreInfo'
    UI.drwaSearchingExtraInfo(img, price);
  }
}

function searchCryptoCoin() {
  const promise = new Promise((resolve, reject) => {
    const userSearch = document.getElementById('searchCoin').value;
    console.log(userSearch);
    //Search coin from all coin array by symbol
    const findAMatchingCurrency = Coins.findCoinBySearch(userSearch);

    if (findAMatchingCurrency !== undefined) {
      //If the search result !== 'undefined'
      //Placing the result parameters in temp object
      Coins.searchCoinObj.id = findAMatchingCurrency.id;
      Coins.searchCoinObj.sym = findAMatchingCurrency.symbol;

      //Get 'SpecialBox' page template & insert to 'Div# innerContent'
      Ajax.getHtmlTemplate('../docs/specialBox.html', 'searchBoxSctn');
      //Then show search result
      setTimeout(() => {
        UI.drawSearchCoinResult();
      }, 100);
      resolve("Ok! It's Worked!");
    } else {
      //If the search result === 'undefined' - Show Alert message
      const output = `
      No matching currency found.
      Search for currency by currency symbol.
        `;
      $('.myAlert').text(output);

      $('.myAlert').fadeIn(500);
      setTimeout(() => {
        $('.myAlert').fadeOut(1000);
      }, 2500);

      reject('Please search for the currency exactly according to its symbol');
    }
  });
  return promise;
}

//%---This Function Get Information About Specific Crypto Coin By 'Id' --- First Check In Session Storage And If The Specific 'Id' Does not exist There --- Send API 'GET' Request By the same 'Id'

export function getCoinInfoByID() {
  //Get The Array of all coins
  let coinsList = Coins.getList();
  $.each(coinsList, function (indexInArray, valueOfElement) {
    let id = valueOfElement.id;

    $(`div#${id}`).each(function (index, element) {
      //When Click on 'More Info' Button of each div that his id is The same Like coin 'Id'
      $(this).on('click', `button#btn-${id}`, function (e) {
        let target = e.target;

        //Send this function coin 'Id' & Event.target
        Storage.getCoinDetailsFromSessionStorage(id, target);
      });
    });
  });
}

export class LiveReports {
  static liveRep = [];
  static newsym;
  static liveInterval;
  static myChart;

  static resetLiveRep() {
    //Reset Live Reports array
    LiveReports.liveRep = [];

    //Set empty array to local storage
    Storage.setLiveRepToLocalStorage(LiveReports.liveRep);

    // Change each switch tuggle to 'No'
    $('input.liveRepCheck').each(function (index, element) {
      $(this).prop('checked', false);
    });
  }

  static pushAndRemovedFromLiveReportsBefore6(sym) {
    //Check if the symbol coin already imside the Live Reports Array.
    if (LiveReports.liveRep.includes(sym)) {
      let num = LiveReports.liveRep.indexOf(sym);
      console.log(num);
      // If 'true' - Remove him
      LiveReports.liveRep.splice(num, 1);
    } else {
      //If 'false' - Push him to Live Reports array
      LiveReports.liveRep.push(sym);
    }
    console.log(LiveReports.liveRep);
    //Then Set the Live Reports array to local storage
    Storage.setLiveRepToLocalStorage(LiveReports.liveRep);
  }

  static pushFromModal() {
    if (
      LiveReports.liveRep.length < 5 &&
      !LiveReports.liveRep.includes(LiveReports.newsym)
    ) {
      //Push new symbol coin to live report array
      LiveReports.liveRep.push(LiveReports.newsym);
      console.log(LiveReports.liveRep);

      let coinObj = Coins.findCoinBySearch(LiveReports.newsym);
      //Change the switch of the current coin card to 'Yes'
      $(`div#${coinObj.id} > label > .liveRepCheck`).prop('checked', true);

      //Set the live report array to local storage
      Storage.setLiveRepToLocalStorage(LiveReports.liveRep);
    }
  }

  static removeAttrToOpenModal() {
    //Send coin symbol -> Return coin object
    let coinObj = Coins.findCoinBySearch(LiveReports.newsym);

    //Remove the attributes that open the modal
    $(`div#${coinObj.id} > label > .liveRepCheck`).removeAttr('data-toggle');

    $(`div#${coinObj.id} > label > .liveRepCheck`).removeAttr('data-target');
  }

  static drawChart() {
    let chartArrLenght = LiveReports.liveRep.length;
    //When click on 'LIVE REPORTS' - If The Array of live reports length !== 0
    if (chartArrLenght !== 0) {
      //First get 'Chart' page template & insert to 'Div# innerContent'
      Ajax.getHtmlTemplate('../docs/chart.html', 'innerContent');
      //Then run chart function
      setTimeout(() => {
        LiveReports.chart();
      }, 100);
    } else {
      //If The Array of live reports length === 0
      let output = `
      To view the real-time reports - first you need to choose which
      currencies by moving the switch from "No" to "Yes". You can select
      up to 5 coins at a time.
      `;
      //Show alert message
      $('.myAlert').text(output);

      $('.myAlert').fadeIn(500);
      //FadeOut Alert
      setTimeout(() => {
        $('.myAlert').fadeOut(1000);
      }, 4000);
    }
  }

  static async getLiveInfoData(symArr) {
    let response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symArr}&tsyms=USD`
    );
    let resulte = await response.json();

    //Get current time
    let currTime = LiveReports.getFetchTime();
    let indexNum = 0;
    console.log(resulte);
    //Save the keys in array
    let resArr = Object.keys(resulte);

    $.each(resulte, function (indexInArray, valueOfElement) {
      let currPrice;
      //Each result
      for (let usdPrice of Object.values(valueOfElement)) {
        //Get the result value(price)
        currPrice = usdPrice;
      }
      //Add color to the data object by index number
      LiveReports.addColor(LiveReports.myChart, indexNum);
      //Add data to the data object by index number
      LiveReports.addData(LiveReports.myChart, indexNum, currPrice);

      //Each round add 1 to 'indexNum'
      indexNum += 1;
    });

    //Add time lebel to chart
    LiveReports.addTimeLabel(LiveReports.myChart, currTime);
    //return the array of keys of result
    return resArr;
  }

  static async createDataObjByFetchResolteAndPushToChartDatasets(symArr) {
    let response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symArr}&tsyms=USD`
    );
    let resulte = await response.json();
    console.log(resulte);
    return resulte;

    // if (resulte.Response !== Error) {
    //   //Reset chart datasets & Update chart

    //   LiveReports.myChart.data.datasets = [];
    //   LiveReports.myChart.update();
    //   $.each(resulte, function (indexInArray, valueOfElement) {
    //     //Create data object for each resulte
    //     let currDataObj = {
    //       label: `${indexInArray}`,
    //       fill: true,
    //       lineTension: 0,
    //       borderWidth: 1,
    //       data: [],
    //     };
    //     //Push the data object to the chart datasets & Update chart
    //     LiveReports.myChart.data.datasets.push(currDataObj);
    //     LiveReports.myChart.update();
    //     console.log(LiveReports.myChart.data.datasets);
    //   });
    // }
  }

  static chart() {
    //Clear chart interval
    clearInterval(LiveReports.liveInterval);

    //Send the live reports array to fetch function
    LiveReports.createDataObjByFetchResolteAndPushToChartDatasets(
      LiveReports.liveRep
    ).then((res) => {
      if (res.Response === 'Error') {
        setTimeout(() => {
          const output = `
          Sorry, we are unable to provide real-time information on the selected currencies.
          `;
          //Show alert message
          $('.myAlert').text(output);
          const icon = `
          <i class="fas fa-times fa-2x" ></i>
          `;
          $('.myAlert').append(icon);

          $('.myAlert').fadeIn(500);
          //Clear Interval
          clearInterval(LiveReports.liveInterval);
          //OnClick close icon - Back to main page
          $('.myAlert > i').on('click', function () {
            Ajax.getHtmlTemplate('../docs/main.html', 'innerContent');
            $('.myAlert').fadeOut(500);

            setTimeout(() => {
              buildMainPage(UI.startIndex, UI.endIndex, UI.howManyCards);
            }, 100);
          });
        }, 100);
      } else {
        //Reset chart datasets & Update chart
        LiveReports.myChart.data.datasets = [];
        LiveReports.myChart.update();
        $.each(res, function (indexInArray, valueOfElement) {
          //Create data object for each resulte
          let currDataObj = {
            label: `${indexInArray}`,
            fill: true,
            lineTension: 0,
            borderWidth: 1,
            data: [],
          };
          //Push the data object to the chart datasets & Update chart
          LiveReports.myChart.data.datasets.push(currDataObj);
          LiveReports.myChart.update();
          console.log(LiveReports.myChart.data.datasets);
        });
      }
    });

    //Set Interval
    LiveReports.liveInterval = setInterval(() => {
      //Send live reports array to get live information
      LiveReports.getLiveInfoData(LiveReports.liveRep).then((res) => {
        //Update chart title
        LiveReports.updateChartTitle(LiveReports.myChart, res);
      });
    }, 2000);

    Chart.defaults.global.defaultFontSize = 15;
    Chart.defaults.global.maintainAspectRatio = false;

    const ctx = document.getElementById('myChart').getContext('2d');

    LiveReports.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        tooltips: {
          mode: 'point',
        },
        title: {
          display: true,
          text: '',
        },
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Coins Value',
                fontStyle: 'bold',
                fontSize: '20',
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }

  static addTimeLabel(chart, currTime) {
    chart.data.labels.push(currTime);

    chart.update();
  }

  static addDataLabel(chart, index, label) {
    chart.data.datasets[index].label = label;

    chart.update();
  }

  static addData(chart, index, data) {
    chart.data.datasets[index].data.push(data);

    chart.update();
  }

  static updateChartTitle(chart, arr) {
    chart.options.title.text = `${arr} To USD`;
    chart.update();
  }

  static addColor(chart, index) {
    switch (index) {
      case 0:
        chart.data.datasets[index].backgroundColor = 'rgba(33, 25, 102, 0.2)';
        chart.data.datasets[index].borderColor = 'rgba(33, 25, 102, 1)';
        break;
      case 1:
        chart.data.datasets[index].backgroundColor = 'rgba(111, 236, 39, 0.2)';
        chart.data.datasets[index].borderColor = 'rgba(111, 236, 39, 1)';
        break;
      case 2:
        chart.data.datasets[index].backgroundColor = 'rgba(230, 115, 8, 0.2)';
        chart.data.datasets[index].borderColor = 'rgba(230, 115, 8, 1)';
        break;
      case 3:
        chart.data.datasets[index].backgroundColor = 'rgba(185, 4, 4, 0.2)';
        chart.data.datasets[index].borderColor = 'rgba(185, 4, 4, 1)';
        break;
      case 4:
        chart.data.datasets[index].backgroundColor = 'rgba(7, 95, 91, 0.2)';
        chart.data.datasets[index].borderColor = 'rgba(7, 95, 91, 1)';
        break;
    }
    chart.update();
  }

  static getFetchTime() {
    let d = new Date();
    let hh = d.getHours();
    let mm = d.getMinutes();
    let ss = d.getSeconds();

    if (mm < 10) {
      mm = '0' + mm;
    }
    if (hh < 10) {
      hh = '0' + hh;
    }
    if (ss < 10) {
      ss = '0' + ss;
    }
    let fetchTime = `${hh}:${mm}:${ss}`;
    return fetchTime;
  }
}

export function buildMainPage(startIndex, endIndex, numOfCards) {
  UI.startIndex = startIndex;
  UI.endIndex = endIndex;

  //Display 'Reset Switches' button & 'Show checked only' Checkbox When First time Website loading
  UI.addButtons();

  //Display Cards of coins When First time Website loading
  UI.CardsToDisplay(
    //Slice new Array to display from 'Coins.arrAllListOfCoins'
    UI.sliceNewArr(UI.startIndex, UI.endIndex, numOfCards)
  );

  //Display Pagination When First time Website loading
  UI.appendPagination();

  $('#loadNext').on('click', function () {
    //Load The next cards to display On Click 'Next' Button
    UI.showNextCoins(UI.startIndex, numOfCards);
    $('#loadPrevious').parent().removeClass('disabled');
  });

  $('#loadPrevious').on('click', function () {
    //Load The previous cards to display On Click 'Previous' Button
    UI.showPreviousCoins(UI.startIndex, numOfCards);
    if (UI.startIndex === 0) {
      $('#loadPrevious').parent().addClass('disabled');
    }
  });

  $('#checkSwitch').on('click', function () {
    //Display just the cards that their tuggle button is 'Yes'
    UI.showSwitchYes(numOfCards);
  });

  $('#clearSwitch').on('click', function () {
    //Reset the Array of coin to live reports & move theirs tuggle button to 'No'
    LiveReports.resetLiveRep();
  });

  //Draw Charts onClick on 'Live Reports'
  //Change Css Parameters Dynamic
  UI.changeZIndexForToggleBTN();
  UI.changeHeaderHeightToAuto();

  //Close Navbar collapse onClick on 'li' Tag
  UI.closeNavbarCollapseWhenClickOnLiTag();

  //Remove Coins from an Live Reports Array from the Modal
  UI.removeFromLiveRepArrFromTheModal(LiveReports.pushFromModal);

  $('#srcBtn').click(function (e) {
    //Checks whether the search value exists in the Array of currencies received from the API

    //if the search value !== undefined - draw Box With the information --- else - Show Alert message
    searchCryptoCoin()
      .then((a) => {
        console.log(a);
      })
      .catch((err) => console.log(err));
    e.preventDefault();
  });
}
