import { UI } from './ui.js';
import { CryptoCoinObj, Coins } from './coins.js';
import { Storage } from './Storage.js';

export class Ajax {
  //%---Get Html Template -> Then Draw The Template Inside The Parent 'Div' -> and Then Run Callback Func---

  static getHtmlTemplate(url, id, callback) {
    console.log(id);
    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'text'
    }).done(res => {
      document.getElementById(id).innerHTML = res;
      callback();
    });
  }

  //%---Send API 'GET' Request And get All Crypto Coins list

  static getDataFromURL(url) {
    $.ajax({
      type: 'GET',
      url: `${url}`,
      dataType: 'json'
    })
      .done(response => {
        //%---Done() - If The Request Succses === No Error

        //%---Placing The Array Response To Array of all list coins in Coins class
        Coins.arrAllListOfCoins = response;

        let numOfCards = UI.howManyCardsToDisplay(window.innerWidth);

        UI.addButtons();

        UI.CardsToDisplay(
          UI.sliceNewArr(UI.startIndex, numOfCards, numOfCards)
        );

        UI.appendPagination();

        $('#loadNext').on('click', function() {
          UI.showNextCoins(UI.startIndex, numOfCards);
          $('#loadPrevious')
            .parent()
            .removeClass('disabled');
        });

        $('#loadPrevious').on('click', function() {
          UI.showPreviousCoins(UI.startIndex, numOfCards);
          if (UI.startIndex === 0) {
            $('#loadPrevious')
              .parent()
              .addClass('disabled');
          }
        });

        $('#checkSwitch').on('click', function() {
          UI.showSwitchYes(numOfCards);
        });

        $('#clearSwitch').on('click', function() {
          LiveReports.resetLiveRep();
        });

        LiveReports.drawChart();
        UI.changeZIndexForToggleBTN();
        UI.changeHeaderHeightToAuto();
        UI.closeCollapseWhenClickOnALink();
        UI.removeFromLiveRepArrFromTheModal(LiveReports.pushFromModal);

        $('#srcBtn').click(function(e) {
          searchCryptoCoin()
            .then(a => {
              console.log(a);
            })
            .catch(err => console.log(err));
          e.preventDefault();
        });
      })
      //%---Fail() - If The Request Not Succses === Error
      .fail(err => {
        console.log(err.responseText);
      });
  }

  static async sendAPI_GETRequestByID(id, target) {
    let date1 = new Date();
    let timeOnFirstClick = date1.getTime();

    let response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);

    let obj = await response.json();

    const currImg = obj.image.large;
    const currPrice = obj.market_data.current_price;

    let currCryptoCoin = new CryptoCoinObj(
      currImg,
      currPrice,
      timeOnFirstClick
    );

    //%---Add to Array Of coins objects With Extra Info
    Coins.addExtraParam(currCryptoCoin);

    Storage.setToSessionStorage(currCryptoCoin, id);

    Storage.getCoinDetailsFromSessionStorage(id, target);

    moreInfo(target, id, currCryptoCoin.image, currCryptoCoin.price);
  }
}

export function moreInfo(target, id, img, price) {
  if (target !== 'moreInfo') {
    $(
      `#boxOfAllCards > div#${id} > .card-body > .collapse > .accordion > .progress`
    ).show();
    UI.pushCollapseToDivByID(id, img, price);
  } else {
    UI.drwaSearchingExtraInfo(img, price);
  }
}

function searchCryptoCoin() {
  let promise = new Promise((resolve, reject) => {
    let userSearch = document.getElementById('searchCoin').value;

    let findAMatchingCurrency = Coins.findCoinBySearch(userSearch);

    if (findAMatchingCurrency !== undefined) {
      Coins.searchCoinObj.id = findAMatchingCurrency.id;
      Coins.searchCoinObj.sym = findAMatchingCurrency.symbol;

      Ajax.getHtmlTemplate(
        '../docs/specialBox.html',
        'sctn2',
        UI.drawSearchCoinResult
      );

      resolve("Ok! It's Worked!");
    } else {
      reject('Please search for the currency exactly according to its symbol');
    }
  });
  return promise;
}

//%---This Function Get Information About Specific Crypto Coin By 'Id' --- First Check In Session Storage And If The Specific 'Id' Does not exist There --- Send API 'GET' Request By the same 'Id'

export function getCoinInfoByID() {
  let coinsList = Coins.getList();
  $.each(coinsList, function(indexInArray, valueOfElement) {
    let id = valueOfElement.id;
    let sym = valueOfElement.symbol;

    $(`div#${id}`).each(function(index, element) {
      $(this).on('click', `button#btn-${id}`, function(e) {
        let target = e.target;
        // console.log(target);
        //%---Get Item From Session Storage By Crypto Coin 'Id' --- The 'Id' Use to be A Key In Storage
        Storage.getCoinDetailsFromSessionStorage(id, target);
      });
    });
  });
}

export function drawInfoPage() {
  let sctnInfo = document.getElementById('InfoSctn');
  let chartWindow = document.getElementById('chartWindow');
  chartWindow.style.zIndex = -1;
  $('#sctn1').fadeOut(1500);
  $('canvas#myChart').fadeOut(1500);
  $('#canvasBox').fadeOut(1500);
  $('#InfoSctn').fadeIn(1500);
  sctnInfo.style.zIndex = 2;
}

export function drawMainPage() {
  $('a#main').click(function(e) {
    let chartWindow = document.getElementById('chartWindow');
    let sctnInfo = document.getElementById('InfoSctn');
    chartWindow.style.zIndex = -1;
    sctnInfo.style.zIndex = -1;
    $('canvas#myChart').fadeOut(1500);
    $('#canvasBox').fadeOut(1500);
    $('#InfoSctn').fadeOut(1500);
    $('#sctn1').fadeIn(1500);
    clearInterval(LiveReports.liveInterval);
    e.preventDefault();
  });
}

export class LiveReports {
  static liveRep = [];
  static newsym;

  static liveInterval;

  static myChart;

  static resetLiveRep() {
    LiveReports.liveRep = [];
    Storage.setLiveRepToLocalStorage(LiveReports.liveRep);
    $('input.liveRepCheck').each(function(index, element) {
      $(this).prop('checked', false);
    });
  }

  static pushAndRemovedFromLiveReportsBefore6(sym) {
    if (LiveReports.liveRep.includes(sym)) {
      let num = LiveReports.liveRep.indexOf(sym);
      console.log(num);
      LiveReports.liveRep.splice(num, 1);

      console.log(LiveReports.liveRep);
      Storage.setLiveRepToLocalStorage(LiveReports.liveRep);
    } else {
      LiveReports.liveRep.push(sym);
      console.log(LiveReports.liveRep);
      Storage.setLiveRepToLocalStorage(LiveReports.liveRep);
    }
  }

  static pushFromModal() {
    if (
      LiveReports.liveRep.length < 5 &&
      !LiveReports.liveRep.includes(LiveReports.newsym)
    ) {
      LiveReports.liveRep.push(LiveReports.newsym);
      console.log(LiveReports.liveRep);

      let sym = LiveReports.newsym.toLowerCase();
      let coinObj = Coins.findCoinBySearch(sym);

      $(`div#${coinObj.id} > label > .liveRepCheck`).prop('checked', true);

      Storage.setLiveRepToLocalStorage(LiveReports.liveRep);
    }
  }

  static removeAttrToOpenModal() {
    let sym = LiveReports.newsym.toLowerCase();
    let coinObj = Coins.findCoinBySearch(sym);

    $(`div#${coinObj.id} > label > .liveRepCheck`).removeAttr('data-toggle');

    $(`div#${coinObj.id} > label > .liveRepCheck`).removeAttr('data-target');
  }

  static chartCallback() {
    let chartWindow = document.getElementById('chartWindow');
    let sctnInfo = document.getElementById('InfoSctn');

    $('#sctn1').fadeOut(1500);
    $('#InfoSctn').fadeOut(1500);
    // $('#chartWindow').html(chart);
    $('#canvasBox').fadeIn(1500);
    setTimeout(() => {
      chartWindow.style.zIndex = 1;
      sctnInfo.style.zIndex = -1;
    }, 1500);
    LiveReports.chart();
  }

  static drawChart() {
    $('a#live').on('click', function(e) {
      let chartArrLenght = LiveReports.liveRep.length;

      if (chartArrLenght !== 0) {
        $('a#live')
          .parent()
          .tooltip('hide');
        Ajax.getHtmlTemplate(
          '../docs/chart.html',
          'chartWindow',
          LiveReports.chartCallback
        );
      } else {
        console.log('123');
        $('a#live')
          .parent()
          .attr({
            'data-toggle': 'tooltip',
            'data-placement': 'top',
            title:
              'To view real-time reports - You must first select which currencies by moving the switch from "No" to "Yes".'
          });
        $('a#live')
          .parent()
          .tooltip('show');
        setTimeout(() => {
          $('a#live')
            .parent()
            .tooltip('hide');
        }, 2000);
      }
      e.preventDefault();
    });
  }

  static async getLiveInfoData(symArr) {
    let response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symArr}&tsyms=USD`
    );
    let resulte = await response.json();

    let currTime = LiveReports.getFetchTime();
    let indexNum = 0;
    console.log(resulte);
    let resArr = Object.keys(resulte);

    $.each(resulte, function(indexInArray, valueOfElement) {
      let currPrice;
      for (let usdPrice of Object.values(valueOfElement)) {
        currPrice = usdPrice;
      }
      LiveReports.addColor(LiveReports.myChart, indexNum);
      LiveReports.addData(LiveReports.myChart, indexNum, currPrice);

      indexNum += 1;
    });

    LiveReports.addTimeLabel(LiveReports.myChart, currTime);
    return resArr;
  }

  static async createDataObjByFetchResolteAndPushToChartDatasets(symArr) {
    let response = await fetch(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symArr}&tsyms=USD`
    );
    let resulte = await response.json();
    console.log(resulte);

    $.each(resulte, function(indexInArray, valueOfElement) {
      let currDataObj = {
        label: `${indexInArray}`,
        fill: true,
        lineTension: 0,
        borderWidth: 1,
        data: []
      };
      LiveReports.myChart.data.datasets.push(currDataObj);
      LiveReports.myChart.update();
      console.log(LiveReports.myChart.data.datasets);
    });
  }

  static chart() {
    LiveReports.createDataObjByFetchResolteAndPushToChartDatasets(
      LiveReports.liveRep
    );

    LiveReports.liveInterval = setInterval(() => {
      LiveReports.getLiveInfoData(LiveReports.liveRep).then(res => {
        LiveReports.updateChartTitle(LiveReports.myChart, res);
      });
    }, 2000);

    // Chart.defaults.global.defaultFontSize = 20;
    Chart.defaults.global.defaultFontSize = 15;
    Chart.defaults.global.maintainAspectRatio = false;

    const ctx = document.getElementById('myChart').getContext('2d');

    LiveReports.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        tooltips: {
          mode: 'point'
        },
        title: {
          display: true,
          text: ''
        },
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Coins Value',
                fontStyle: 'bold',
                fontSize: '20'
              },
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
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
