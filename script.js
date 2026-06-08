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