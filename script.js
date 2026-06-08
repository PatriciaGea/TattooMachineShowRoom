// FLOAT
AFRAME.registerComponent('floaty', {
    schema: { speed: { type: 'number', default: 1 } },
  
    tick: function (time) {
      this.el.object3D.position.y += Math.sin(time * 0.001 * this.data.speed) * 0.002;
    }
  });
  
  
  // HOVER ZOOM
  AFRAME.registerComponent('hover-zoom', {
    init: function () {
      this.originalScale = this.el.object3D.scale.clone();
  
      this.el.addEventListener('mouseenter', () => {
        this.el.object3D.scale.multiplyScalar(1.2);
      });
  
      this.el.addEventListener('mouseleave', () => {
        this.el.object3D.scale.copy(this.originalScale);
      });
    }
  });
  
  
  // CLICK POPUP
  AFRAME.registerComponent('clickable', {
    schema: { text: { type: 'string' } },
  
    init: function () {
      this.el.addEventListener('click', () => {
        openPopup(this.data.text);
      });
    }
  });
  
  
  // POPUP FUNCTIONS
  function openPopup(text) {
    document.getElementById("popupText").innerText = text;
    document.getElementById("popup").classList.remove("hidden");
  }
  
  function closePopup() {
    document.getElementById("popup").classList.add("hidden");
  }
  
  
  // VR BUTTON
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("vrButton").addEventListener("click", () => {
      const scene = document.querySelector("a-scene");
      scene.enterVR();
    });
  });
  let mouseX = 0;
let mouseY = 0;

// captura mouse
document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

AFRAME.registerComponent("mouse-follow", {
  schema: {
    intensity: { type: "number", default: 1 }
  },

  tick: function () {
    const el = this.el;

    const targetX = mouseY * this.data.intensity;
    const targetY = mouseX * this.data.intensity;

    el.object3D.rotation.x += (targetX - el.object3D.rotation.x) * 0.05;
    el.object3D.rotation.y += (targetY - el.object3D.rotation.y) * 0.05;
  }
});