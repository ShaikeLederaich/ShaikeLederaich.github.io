export class Coins {
  static arrAllListOfCoins = [];
  static arrCoinsWithExtraParam = [];
  static searchCoinObj = {}

  //Get the all coins array 
  static getList() {
    return this.arrAllListOfCoins;
  }

  //Find specific coin
  //Send coin Symbol -> return coin Object
  static findCoinBySearch(userSearch) {
    if (userSearch === userSearch.toUpperCase()) {
      userSearch = userSearch.toLowerCase();
    }
    let arr = Coins.getList();
    let findAMatchingCurrency = arr.find(coin => coin.symbol === userSearch);

    return findAMatchingCurrency;
  }
}
