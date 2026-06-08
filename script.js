// =========================
// PROPORTIONAL CARD
// =========================
AFRAME.registerComponent("proportional-card", {
  schema: {
    maxWidth: { type: "number", default: 1.35 },
    maxHeight: { type: "number", default: 0.95 }
  },

  init: function () {
    const src = this.el.getAttribute("src");
    const asset = src && src.startsWith("#") ? document.querySelector(src) : null;
    const imageSrc = asset ? asset.getAttribute("src") : src;

    if (!imageSrc) return;

    const image = new Image();

    image.onload = () => {
      const ratio = image.naturalWidth / image.naturalHeight;
      let width = this.data.maxWidth;
      let height = width / ratio;

      if (height > this.data.maxHeight) {
        height = this.data.maxHeight;
        width = height * ratio;
      }

      this.el.setAttribute("width", width);
      this.el.setAttribute("height", height);
    };

    image.src = imageSrc;
  }
});

// =========================
// VR BUTTON
// =========================
const vrButton = document.getElementById("vrButton");
const scene = document.querySelector("a-scene");

if (vrButton && scene) {
  vrButton.addEventListener("click", () => {
    if (scene.is("vr-mode")) {
      scene.exitVR();
      return;
    }

    scene.enterVR();
  });
}

// =========================
// RESPONSIVE SCENE
// =========================
function updateResponsiveScene() {
  const wrapper1 = document.getElementById("wrapper1");
  const wrapper2 = document.getElementById("wrapper2");

  if (!wrapper1 || !wrapper2) return;

  if (window.innerWidth <= 560) {
    wrapper1.setAttribute("position", "-0.82 1.2 -3.25");
    wrapper2.setAttribute("position", "0.82 1.2 -3.25");
    return;
  }

  if (window.innerWidth <= 900) {
    wrapper1.setAttribute("position", "-1.1 1.28 -3.15");
    wrapper2.setAttribute("position", "1.1 1.28 -3.15");
    return;
  }

  wrapper1.setAttribute("position", "-1.5 1.35 -3");
  wrapper2.setAttribute("position", "1.5 1.35 -3");
}

window.addEventListener("resize", updateResponsiveScene);
window.addEventListener("orientationchange", updateResponsiveScene);

if (scene) {
  scene.addEventListener("loaded", updateResponsiveScene);
}

updateResponsiveScene();

// =========================
// FLOATY (FLUTUAÇÃO SUAVE)
// =========================
AFRAME.registerComponent("floaty", {
  schema: {
    speed: { type: "number", default: 1 }
  },

  init: function () {
    this.baseY = this.el.object3D.position.y;
  },

  tick: function (time) {
    this.el.object3D.position.y =
      this.baseY + Math.sin(time * 0.001 * this.data.speed) * 0.15;
  }
});

// =========================
// DRAG ROTATE (GIRAR OBJETO)
// =========================
AFRAME.registerComponent("drag-rotate", {
  schema: {
    target: { type: "selector" },
    speed: { type: "number", default: 0.45 }
  },

  init: function () {
    const el = this.el;
    this.target = this.data.target || el;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.pointer = { x: 0, y: 0 };
    this.camera = document.querySelector("a-camera");

    this.trackPointer = this.trackPointer.bind(this);
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    window.addEventListener("mousedown", this.trackPointer, true);
    window.addEventListener("touchstart", this.trackPointer, true);
    window.addEventListener("mousemove", this.trackPointer);
    window.addEventListener("touchmove", this.trackPointer, { passive: true });
    el.addEventListener("mousedown", this.onStart);
    el.addEventListener("touchstart", this.onStart, { passive: false });
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("touchmove", this.onMove, { passive: false });
    window.addEventListener("mouseup", this.onEnd);
    window.addEventListener("touchend", this.onEnd);
    window.addEventListener("touchcancel", this.onEnd);
  },

  getPointer: function (event) {
    const source =
      (event.touches && event.touches[0]) ||
      (event.changedTouches && event.changedTouches[0]) ||
      (event.detail && event.detail.mouseEvent) ||
      (event.detail && event.detail.touchEvent && event.detail.touchEvent.touches && event.detail.touchEvent.touches[0]) ||
      event;

    if (!source || !Number.isFinite(source.clientX) || !Number.isFinite(source.clientY)) {
      return this.pointer;
    }

    return {
      x: source.clientX,
      y: source.clientY
    };
  },

  trackPointer: function (event) {
    this.pointer = this.getPointer(event);
  },

  onStart: function (event) {
    event.preventDefault();
    event.stopPropagation();

    const pointer = this.getPointer(event);
    this.isDragging = true;
    this.lastX = pointer.x;
    this.lastY = pointer.y;

    if (this.camera) {
      this.camera.setAttribute("look-controls", "enabled", false);
    }
  },

  onMove: function (event) {
    if (!this.isDragging) return;

    event.preventDefault();
    const pointer = this.getPointer(event);
    const deltaX = pointer.x - this.lastX;
    const deltaY = pointer.y - this.lastY;

    this.target.object3D.rotation.y += THREE.MathUtils.degToRad(deltaX * this.data.speed);
    this.target.object3D.rotation.x += THREE.MathUtils.degToRad(deltaY * this.data.speed);

    this.lastX = pointer.x;
    this.lastY = pointer.y;
  },

  onEnd: function () {
    if (!this.isDragging) return;

    this.isDragging = false;

    if (this.camera) {
      this.camera.setAttribute("look-controls", "enabled", true);
    }
  },

  remove: function () {
    const el = this.el;

    window.removeEventListener("mousedown", this.trackPointer, true);
    window.removeEventListener("touchstart", this.trackPointer, true);
    window.removeEventListener("mousemove", this.trackPointer);
    window.removeEventListener("touchmove", this.trackPointer);
    el.removeEventListener("mousedown", this.onStart);
    el.removeEventListener("touchstart", this.onStart);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("touchmove", this.onMove);
    window.removeEventListener("mouseup", this.onEnd);
    window.removeEventListener("touchend", this.onEnd);
    window.removeEventListener("touchcancel", this.onEnd);
  }
});

// =========================
// HOVER ZOOM (SUAVE E ESTÁVEL)
// =========================
AFRAME.registerComponent("hover-zoom", {
  schema: {
    scale: { type: "number", default: 1.08 },
    smoothness: { type: "number", default: 0.08 }
  },

  init: function () {
    const el = this.el;

    this.baseScale = el.object3D.scale.clone();
    this.targetScale = this.baseScale.clone();

    el.addEventListener("mouseenter", () => {
      this.targetScale.copy(this.baseScale).multiplyScalar(this.data.scale);
    });

    el.addEventListener("mouseleave", () => {
      this.targetScale.copy(this.baseScale);
    });
  },

  tick: function () {
    this.el.object3D.scale.lerp(this.targetScale, this.data.smoothness);
  }
});

// =========================
// HOVER TOOLTIP
// =========================
AFRAME.registerComponent("hover-tooltip", {
  init: function () {
    this.tooltip = document.getElementById("hoverTooltip");
    this.text = this.el.dataset.tooltip;
    this.image = this.el.dataset.tooltipImage;
    this.side = this.el.dataset.tooltipSide || "left";
    this.lastClickTime = 0;

    this.showHint = this.showHint.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.showInfo = this.showInfo.bind(this);
    this.hide = this.hide.bind(this);

    this.el.addEventListener("mouseenter", this.showHint);
    this.el.addEventListener("mouseleave", this.hide);
    this.el.addEventListener("click", this.handleClick);
    this.el.addEventListener("dblclick", this.showInfo);
  },

  setTooltipPosition: function () {
    this.tooltip.classList.toggle("left", this.side === "left");
    this.tooltip.classList.toggle("right", this.side === "right");
  },

  showHint: function () {
    if (!this.tooltip) return;

    this.setTooltipPosition();
    this.tooltip.textContent = "Drag it, or double click it";
    this.tooltip.classList.add("hint");
    this.tooltip.classList.remove("info");
    this.tooltip.classList.remove("hidden");
    requestAnimationFrame(() => {
      this.tooltip.classList.add("visible");
    });
  },

  handleClick: function () {
    const now = Date.now();

    if (now - this.lastClickTime < 350) {
      this.showInfo();
    }

    this.lastClickTime = now;
  },

  showInfo: function () {
    if (!this.tooltip || (!this.text && !this.image)) return;

    this.tooltip.classList.remove("visible");
    this.tooltip.style.transition = "none";
    this.setTooltipPosition();
    this.tooltip.textContent = "";

    if (this.image) {
      const image = document.createElement("img");

      image.src = this.image;
      image.alt = "";
      image.className = "tooltip-card-image";
      this.tooltip.appendChild(image);
    } else {
      this.tooltip.textContent = this.text;
    }

    this.tooltip.classList.add("info");
    this.tooltip.classList.remove("hint");
    this.tooltip.classList.remove("hidden");
    this.tooltip.offsetHeight;
    this.tooltip.style.transition = "";

    requestAnimationFrame(() => {
      this.tooltip.classList.add("visible");
    });
  },

  hide: function () {
    if (!this.tooltip) return;

    this.tooltip.classList.remove("visible");

    window.setTimeout(() => {
      if (!this.tooltip.classList.contains("visible")) {
        this.tooltip.classList.add("hidden");
      }
    }, 280);
  },

  remove: function () {
    this.el.removeEventListener("mouseenter", this.showHint);
    this.el.removeEventListener("mouseleave", this.hide);
    this.el.removeEventListener("click", this.handleClick);
    this.el.removeEventListener("dblclick", this.showInfo);
  }
});