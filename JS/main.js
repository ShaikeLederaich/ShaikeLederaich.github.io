import { Animations } from './animations.js';
import {
  Ajax,
  drawMainPage,
  drawInfoPage
} from './services.js';
import { UI } from './ui.js';

$(function() {
  Animations.hamburgerAnimation();

  Ajax.getDataFromURL('https://api.coingecko.com/api/v3/coins/list');

  $('a#info').click(function (e) { 
    Ajax.getHtmlTemplate('../docs/about.html', 'InfoSctn', drawInfoPage);
    e.preventDefault();
  });
  
  drawMainPage();
  UI.getCurrYear();
  $('#InfoSctn').hide();
});
