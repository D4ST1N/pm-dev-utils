import { get, processParams } from './utils.js';
import { api } from './apiUrls.js';
import './components/User.js';
import './components/Authorization.js';
import './components/Header.js';
import './components/Platform.js';
import './components/AddToken.js';

const app = new Vue({
  render(createElement) {
    return createElement(
      'div',
      {
        class: {
          'main-container': true,
        },
      },
      [
        createElement('Authorization'),
        createElement('Header', {
          on: {
            toggleFilter: this.toggleFilter
          }
        }),
        this.platforms.map(
          platform => createElement('Platform', {
            props: {
              platform,
              filterActive: this.filterActive,
            }
          }),
        ),
        this.platforms[0].mergeRequests.length
          ? createElement('AddToken', {
              props: {
                checkData: {
                  project: this.platforms[0].key,
                  iid: this.platforms[0].mergeRequests[0].iid,
                }
              }
            })
          : ''
      ],
    );
  },
  data() {
    return {
      platforms: [
        {
          label: 'Desktop',
          key: 'air/air-pm',
          mergeRequests: [],
        },
        {
          label: 'Mobile',
          key: 'air/air-mobile',
          mergeRequests: [],
        },
      ],
      filterActive: true,
    };
  },

  created() {
    this.getMergeRequests();
  },

  methods: {
    getMergeRequests() {
      this.platforms.forEach((platform) => {
        const params = processParams({
          private_token: '5VK28u4H9d39NFv1r7sv',
          state: 'opened',
        });
        const baseUrl = api.mergeRequests.replace(
          '{project}',
          encodeURIComponent(platform.key),
        );
        const url = `${baseUrl}?${params}`;

        get(url).then((response) => {
          platform.mergeRequests = JSON.parse(response);
        })
                .catch(console.error);
      });
    },

    toggleFilter(isActive) {
      this.filterActive = isActive;
    },
  },
}).$mount('#app');
