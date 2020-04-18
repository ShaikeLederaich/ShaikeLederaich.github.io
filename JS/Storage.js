import { Ajax, moreInfo } from './services.js';
import { LiveReports } from './services.js';
import { Coins } from './coins.js';

export class Storage {
  static setToSessionStorage(cryptoCoin, cryptoId) {
    sessionStorage.setItem(`${cryptoId}`, JSON.stringify(cryptoCoin));
  }

  static getCoinDetailsFromSessionStorage(cryptoId, target) {
    //Get item from session storage whose name is the same like the coin Id
    let currCoin = JSON.parse(sessionStorage.getItem(`${cryptoId}`));

    if (currCoin === null) {
      //If The 'Id' Does not exist In Storage, Send Ajax 'GET' Request By 'Id' And get more information about him
      Ajax.sendAPI_GETRequestByID(cryptoId, target)
        .then(console.log('Its Null'))
        .catch(error => {
          console.log('Something Went Wrong!');
          console.error(error);
        });
    } else {
      //If the ID exists in Storage, So check when the first Ajax call was made.
      let date2 = new Date();
      let timeOnSecondClick = date2.getTime();
      let timeBetween = Math.abs(timeOnSecondClick - currCoin.time);
      //If more than two minutes have passed, Send Ajax 'GET' Request By 'Id' Again
      if (timeBetween > 120000) {
        Ajax.sendAPI_GETRequestByID(cryptoId, target)
          .then(console.log('Two minutes passed, load information again'))
          .catch(error => {
            console.log('Something Went Wrong!');
            console.error(error);
          });
      } else {
        console.log('Loading Information');
        console.log(currCoin);
        //Send Parameters to this function
        moreInfo(target, cryptoId, currCoin.image, currCoin.price);
      }
    }
  }

  static setLiveRepToLocalStorage(arrOfCoins) {
    localStorage.setItem('ChartList', JSON.stringify(arrOfCoins));
  }

  static getLiveRepFromLocalStorage() {
    if (localStorage.getItem('ChartList') === null) {
      LiveReports.liveRep = [];
      
    } else {
      let list = localStorage.getItem('ChartList');
      list = JSON.parse(list);

      for (let sym of list) {
        let currObjCoin = Coins.findCoinBySearch(sym);

        $(`div#${currObjCoin.id} > label > .liveRepCheck`).prop(
          'checked',
          true
        );
      }
      LiveReports.liveRep = list;
    }
  }
}
