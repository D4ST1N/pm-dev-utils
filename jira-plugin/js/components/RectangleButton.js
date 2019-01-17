Vue.component('RectangleButton', {
  template: `
  <button
    :class="buttonClass"
    @click="buttonClick"
    @mouseover="over"
    @mouseleave="leave"
  >{{ buttonText }}</button>
  `,

  props: {
    color: {
      type: String,
      default: 'white',
    },
    text: {
      type: String,
      default: '',
    },
    shiftText: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      hover: false
    };
  },

  computed: {
    buttonText() {
      return this.hover ? this.shiftText || this.text : this.text;
    },
    buttonClass() {
      return {
        'rectangle-button': true,
        [`rectangle-button--${this.color}`]: true,
      };
    },
  },

  methods: {
    buttonClick(event) {
      if (event.shiftKey) {
        this.$emit('shiftClick', event);
      } else {
        this.$emit('click', event);
      }
    },

    over(event) {
      this.hover = event.shiftKey;
    },

    leave() {
      this.hover = false;
    }
  },
});
