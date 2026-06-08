// FLOATING EFFECT (FLUTUAR)

AFRAME.registerComponent('floaty', {
    schema: {
      speed: { type: 'number', default: 1 }
    },
  
    tick: function (time) {
      this.el.object3D.position.y += Math.sin(time * 0.001 * this.data.speed) * 0.002;
    }
  });
  
  
  // CLICK NO PONTO VERMELHO
  document.addEventListener("DOMContentLoaded", () => {
  
    const hotspot = document.querySelector("#hotspot");
  
    hotspot.addEventListener("click", () => {
      alert("🔥 Tattoo Machine Info: modelo inspirado em design clássico de estúdio.");
    });
  
  });