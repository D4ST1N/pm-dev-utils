import { get } from '../utils.js';
import { api } from '../apiUrls.js';

Vue.component('Authorization', {
  created() {
    get(api.user).then((userData) => {
      const user = JSON.parse(userData);
      chrome.storage.sync.set({ user }, () => {
        console.log('authorization success!');
        console.log('current user data:');
        console.log(user);
        this.$root.$emit('authorize');
      });
    }).catch(console.error);
  },
});
