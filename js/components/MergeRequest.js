import { post, processParams } from '../utils.js';
import { api } from '../apiUrls.js';

Vue.component('MergeRequest', {
  render(createElement) {
    return createElement('a', {
      class: {
        'merge-request': true,
      },
      attrs: {
        href: this.mergeRequest.web_url,
      },
      on: {
        click: this.openMergeRequest,
      },
    }, [
      createElement('div', {
        class: {
          'merge-request__main-info': true
        },
      }, [
        createElement('div', {
          class: {
            'merge-request__name': true,
          },
        }, [
          createElement('a', {
            class: {
              'merge-request__task': true,
            },
            attrs: {
              href: this.getTaskUrl(this.getTaskFromTitle(this.mergeRequest.title)),
            },
            on: {
              click:this.openTask,
            },
          }, [
            this.getTaskFromTitle(this.mergeRequest.title),
          ]),
          createElement('div', {
            class: {
              'merge-request__title': true,
            },
          }, [
            this.cutTitle(this.mergeRequest.title),
          ])
        ]),
        createElement('div', {
          class: {
            'merge-request__info': true,
          },
        }, [
          createElement('div', {
            class: {
              'merge-request__author': true,
            },
          }, [
            this.mergeRequest.author.name,
          ]),
          createElement('div', {
            class: {
              'merge-request__vote': true,
              'merge-request__vote--upvote': true,
            },
          }, [
            this.mergeRequest.upvotes,
          ]),
          createElement('div', {
            class: {
              'merge-request__vote': true,
              'merge-request__vote--downvote': true,
            },
          }, [
            this.mergeRequest.downvotes,
          ]),
          createElement('div', {
            class: {
              'merge-request__expand': true,
            },
            on: {
              click: (event) => {
                event.stopPropagation();
                event.preventDefault();
                this.expanded = !this.expanded;
              },
            },
          }),
        ]),
      ]),
      this.expanded
        ? createElement('div', {
          class: 'merge-request__additional-info'
        }, [
          createElement('div', {
            class: 'merge-request__destination',
          }, [
            createElement('div', {
              class: {
                'merge-request__branch': true,
              },
            }, this.mergeRequest.source_branch),
            createElement('div', {
              class: {
                'merge-request__branch-arrow': true,
              },
            }),
            createElement('div', {
              class: {
                'merge-request__branch': true,
              },
            }, this.mergeRequest.target_branch),
          ]),
          this.private_token
            ? createElement('div', {
              class: {
                'merge-request__actions': true,
              },
            }, [
              createElement('button', {
                class: {
                  'merge-request__action': true,
                },
                on: {
                  click: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.upvote()
                  },
                }
              }, 'Upvote'),
              createElement('button', {
                class: {
                  'merge-request__action': true,
                },
                on: {
                  click: (event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    this.downvote();
                  },
                }
              }, 'Downvote'),
            ])
            : ''
        ])
        : ''
    ]);
  },

  props: {
    mergeRequest: {
      type: Object,
      required: true,
    },
    project: {
      type: String,
    }
  },

  data() {
    return {
      expanded: false,
      private_token: null,
    };
  },

  created() {
    this.updateToken();
    this.$root.$on('tokenSet', this.updateToken);
  },

  methods: {
    getTaskFromTitle(title) {
      return title.match(/[A-Z]{1,2}-\d+/);
    },

    getTaskUrl(taskId) {
      return `https://jira.betlab.com/browse/${taskId}`;
    },

    cutTitle(title) {
      return title.match(/[A-Z]{1,2}-\d+[\]\s]+?(.+)$/)[1];
    },

    openMergeRequest() {
      this.openLink(this.mergeRequest.web_url);
    },

    openTask() {
      this.openLink(this.getTaskUrl(this.getTaskFromTitle(this.mergeRequest.title)))
    },

    openLink(href) {
      window.open(href,'_blank');
    },

    upvote() {
      this.vote('thumbsup');
    },

    downvote() {
      this.vote('thumbsdown');
    },

    vote(name) {
      const url = `${api.mergeRequests}/${this.mergeRequest.iid}/award_emoji`.replace(
        '{project}',
        encodeURIComponent(this.project),
      );
      const params = {
        name: name,
        private_token: this.private_token,
      };
      post(`${url}?${processParams(params)}`).then(console.log).catch(console.log);
    },

    updateToken() {
      chrome.storage.sync.get(['private_token'], (storage) => {
        if (storage.private_token) {
          this.private_token = storage.private_token;
        }
      });
    },
  }
});
