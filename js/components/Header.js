Vue.component('Header', {
  render(createElement) {
    return createElement('div', {
      class: {
        'header': true,
      },
    }, [
      createElement('div', {
        class: {
          'header__votes-filter': true,
        },
      }, [
        createElement('div', {
          class: {
            'header__votes-switcher': true,
          },
          on: {
            click: this.toggleFilter,
          }
        }, [
          createElement('div', {
            class: {
              'header__votes-switcher-toggler': true,
              'header__votes-switcher-toggler--toggled': this.filterActive,
            },
          }),
        ]),
        'Show only less than 3 approves',
      ]),
      createElement('User'),
    ]);
  },

  data() {
    return {
      filterActive: true,
    };
  },

  methods: {
    toggleFilter() {
      this.filterActive = !this.filterActive;
      this.$emit('toggleFilter', this.filterActive);
    },
  }
});
