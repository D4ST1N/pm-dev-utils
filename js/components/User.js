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
        }),
        this.privateTokenWarning
          ? createElement('div', {
            class: {
              'user__token-missing': true,
            },
            attrs: {
              title: 'Please add private_token to Upvote & Downvote'
            },
            on: {
              click: this.addToken
            },
          })
          : '',
      ]);
    }
  },

  data() {
    return {
      user: null,
      privateTokenWarning: false,
    };
  },

  created() {
    this.updateToken();
    this.$root.$on('authorize', () => {
      chrome.storage.sync.get(['user'], (storage) => {
        this.user = storage.user;
      });
    });
    this.$root.$on('tokenSet', this.updateToken);
  },

  methods: {
    addToken() {
      this.$root.$emit('addToken');
    },

    updateToken() {
      chrome.storage.sync.get(['private_token'], (storage) => {
        if (!storage.private_token) {
          this.privateTokenWarning = true;
        }
      });
    }
  }
});
