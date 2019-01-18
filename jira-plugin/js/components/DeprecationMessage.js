Vue.component('DeprecationMessage', {
  template: `
  <div v-if="show" class="deprecation-message">
    <h1 class="deprecation-message__title">
      You use deprecated version of Jira Plugin, please disable it in tampermonkey settings
    </h1>
    <div class="deprecation-message__image"></div>
    <RectangleButton color="green" text="Ok" @click="close" />
  </div>
  `,

  data() {
    return {
      show: false,
    };
  },

  created() {
    this.$root.$on('showDeprecationMessage', () => {
      this.show = true;
    });
  },

  methods: {
    close() {
      this.show = false;
    }
  }
});
