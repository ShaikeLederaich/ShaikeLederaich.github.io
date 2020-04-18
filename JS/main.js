import { Ajax, LiveReports, buildMainPage } from './services.js';
import { UI } from './ui.js';
// The site ahead of you provides up-to-date information on virtual currencies and real-time reports based on CoinGecko and CryptoCompare APIs.

// On the homepage you will find cards of all crypto coins, Each card contains the ID and code of the relevant currency.
// Clicking the "More Info" button will display a photo of the crypto currency and updated prices for US Dollars, Euro & Israeli Shekels.

// In the top navigation menu you can search any crypto currency by entering the currency symbol. You can also select up to 5 crypto coins that you want to receive as real-time reports. The choice is made by moving the switch to 'Yes'.
// On the Live Report page, you'll see real-time reports of the currencies you've selected before On the About page you will find this information as well as information about the website developer.

$(function () {
  //On Load - First get Main page template & insert to 'Div# innerContent'
  Ajax.getHtmlTemplate('../docs/main.html', 'innerContent');
  //Then - Get Data from Api
  Ajax.getDataFromURL('https://api.coingecko.com/api/v3/coins/list');

  $('a#main').click(function (e) {
    //On click on 'Home' - First get 'Main' page template & insert to 'Div# innerContent'
    Ajax.getHtmlTemplate('../docs/main.html', 'innerContent');
    //Then - them Build the page
    setTimeout(() => {
      //this function enable to some functions to build the 'main' page
      buildMainPage()
    }, 150);
    //Stop Reports Interval
    clearInterval(LiveReports.liveInterval);
    e.preventDefault();
  });

  $('a#info').click(function (e) {
    //On click on 'About' - First get 'About' page template & insert to 'Div# innerContent'
    Ajax.getHtmlTemplate('../docs/about.html', 'innerContent');
    //Stop Reports Interval
    clearInterval(LiveReports.liveInterval);
    e.preventDefault();
  });
  //Enable Navbar 'Hamburger' Button
  UI.hamburgerToggle();
  //Get Current Year to the footer
  UI.getCurrYear();


});
