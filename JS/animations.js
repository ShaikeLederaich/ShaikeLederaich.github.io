import anime, { default as Anime } from './anime.es.js';

export class Animations {
  static specialBoxAnimation() {
    anime({
      targets: '#mySpecialSrcBox',
      translateX: [-1500, 0],
      rotateZ: 360,
      rotateX: 360,
      rotateY: 360,
      skewX: 165,
      scale: 1.2,
      duration: 5000
    });
  }
}
