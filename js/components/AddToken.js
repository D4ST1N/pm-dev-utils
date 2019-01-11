import { api }                 from '../apiUrls.js';
import { post, del, processParams } from '../utils.js';

Vue.component('AddToken', {
  render(createElement) {
    if (!this.show) return;

    return createElement('div', {
      class: 'add-token',
    }, [
      createElement('div', {
        class: 'add-token__wrapper',
      }, [
        createElement('label', {
          class: 'add-token__field-wrapper',
        }, [
          createElement('span', {
            class: 'add-token__field-label',
          }, 'Enter your private token:'),
          createElement('input', {
            class: 'add-token__field',
            attrs: {
              type: 'text',
              value: this.token,
            },
            on: {
              input: (event) => {
                this.token = event.target.value;
              },
            },
          }),
          createElement('button', {
            class: 'add-token__check',
            on: {
              click: this.checkToken
            }
          }, 'Confirm'),
          this.showError
            ? createElement('span', {
                class: 'add-token__error',
              }, 'Token invalid, try again')
            : ''
        ])
      ])
    ]);
  },

  props: {
    checkData: Object,
  },

  data() {
    return {
      show: false,
      token: '',
      showError: false,
    };
  },

  created() {
    this.$root.$on('addToken', () => {
      this.show = true;
    });
  },

  methods: {
    checkToken() {
      const url = `${api.mergeRequests}/${this.checkData.iid}/award_emoji`.replace(
        '{project}',
        encodeURIComponent(this.checkData.project),
      );
      const params = {
        name: 'dancer',
        private_token: this.token,
      };

      post(`${url}?${processParams(params)}`).then(() => {
        chrome.storage.sync.set({ private_token: this.token }, (award) => {
          this.$root.$emit('tokenSet');

          del(`${url}/${award.id}?${processParams({ private_token: this.token })}`);

          this.show = false;
          this.showError = false;
        });
      }).catch(() => {
        this.showError = true;
      });
    }
  }
});
