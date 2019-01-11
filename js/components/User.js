Vue.component('User', {
  render(createElement) {
    if (this.user) {
      return createElement('div', {
        class: {
          'user': true,
        },
      }, [
        createElement('div', {
          class: {
            'user__name': true,
          },
        }, this.user.name),
        createElement('img', {
          class: {
            'user__avatar': true,
          },
          attrs: {
            src: this.user.avatar_url,
          },
        })
      ]);
    }
  },

  data() {
    return {
      user: null,
    };
  },

  created() {
    chrome.storage.sync.get(['private_key'], (storage) => {
      console.log(storage);
    });
    this.$root.$on('authorize', () => {
      chrome.storage.sync.get(['user'], (storage) => {
        this.user = storage.user;
      });
    });
  },
});
