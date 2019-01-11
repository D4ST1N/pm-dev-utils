import './MergeRequest.js';

Vue.component('Platform', {
  render(createElement) {
    return createElement('div', {
      class: {
        'platform': true,
      },
    }, [
      createElement('div', {
        class: {
          'platform__label': true,
        },
      }, [
        this.platform.label,
      ]),
      this.filterMergeRequests(this.platform.mergeRequests).map(
        (mergeRequest, index) => createElement('MergeRequest', {
          props: {
            mergeRequest,
            project: this.platform.key,
          },
          key: index,
        }),
      ),
    ]);
  },

  props: {
    platform: {
      type: Object,
      required: true,
    },
    filterActive: {
      type: Boolean,
      default: true,
    }
  },

  methods: {
    filterMergeRequests(mergeRequests) {
      return this.filterActive
             ? mergeRequests.filter(mergeRequest => mergeRequest.upvotes < 3)
             : mergeRequests;
    },
  }
});
