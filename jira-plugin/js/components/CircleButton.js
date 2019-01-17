Vue.component('CircleButton', {
  template: `
  <button
    :class="buttonClass"
    @click="buttonClick"
    @mouseover="buttonHover"
    @mouseout="buttonLeave"
  >
    <span :class="iconClass"></span>
  </button>
  `,

  props: {
    color: {
      type: String,
      default: 'white',
    },
    icon: {
      type: String,
      default: 'add',
    },
  },

  computed: {
    buttonClass() {
      return {
        'circled-button': true,
        [`circled-button--${this.color}`]: true,
        [`circled-button--${this.icon}`]: true,
      };
    },

    iconClass() {
      return {
        'circled-button__icon': true,
        [`circled-button__icon--${this.icon}`]: true,
      };
    },
  },

  methods: {
    buttonClick(event) {
      this.$emit('click', event);
    },

    buttonHover(event) {
      this.$emit('mouseenter', event);
    },

    buttonLeave(event) {
      this.$emit('mouseout', event);
    },
  },
});
