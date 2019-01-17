Vue.component('Loader', {
  template: `
  <div class="loader" :style="{ transform: 'rotate(' + degree + 'deg)' }"></div>
  `,

  data() {
    return {
      degree: 0,
      intervalId: null,
      rotationAngle: 30,
    };
  },

  created() {
    this.intervalId = setInterval(() => {
      this.degree += this.rotationAngle;

      if (this.degree === 360) {
        this.degree = 0;
      }
    }, 100);
  },

  beforeDestroy() {
    clearInterval(this.intervalId);
  }
});
