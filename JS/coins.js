export class CryptoCoinObj {
  constructor(img, currPrice, currTime) {
    this.image = img;
    this.price = {
      Usd: `${currPrice.usd}`,
      Eur: `${currPrice.eur}`,
      Ils: `${currPrice.ils}`
    };
    this.time = currTime;
  }
  showCoinInfo() {
    console.log(`
    Current Price in US Dollar: ${this.usd}\n
    Current Price in Euru: ${this.eur}\n
    Current Price in IL Shekel: ${this.ils}\n
    `);
  }
}


export class Coins {
  static arrAllListOfCoins = [];
  static arrCoinsWithExtraParam = [];
  static searchCoinObj = {}

  static addToList(obj) {
    this.arrAllListOfCoins.push(obj);
  }
  static getList() {
    return this.arrAllListOfCoins;
  }
  static findCoinBySearch(userSearch) {
    if (userSearch === userSearch.toUpperCase()) {
      userSearch = userSearch.toLowerCase();
    }
    let arr = Coins.getList();
    let findAMatchingCurrency = arr.find(coin => coin.symbol === userSearch);

    return findAMatchingCurrency;
  }

  static addExtraParam(obj) {
    this.arrCoinsWithExtraParam.push(obj);
  }
  static getArrWithExtraParam() {
    return this.arrCoinsWithExtraParam;
  }
}
