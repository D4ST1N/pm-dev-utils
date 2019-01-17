Vue.component('BranchSelector', {
  template: `
  <div v-if="show" class="branch-selector">
    <div class="branch-selector__header">
      <div class="branch-selector__branch" @click="selectBranch(defaultBranch)">{{ defaultBranch }}</div>
      <div class="branch-selector__filter-wrapper">
        <input type="text" class="branch-selector__filter ajs-dirty-warning-exempt" placeholder="find branch..." @input="onInput">
        <Loader v-if="showLoader" class="branch-selector__loader" />
      </div>
    </div>
    <div class="branch-selector__branches-container">
      <div
       v-for="branch in branches"
       class="branch-selector__branch"
       @click="selectBranch(branch.name)"
      >
        {{ branch.name }}
      </div>
    </div>
  </div>
  `,

  props: {
    defaultBranch: {
      type: String,
      required: true,
    },
    project: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      show: false,
      branches: [],
      filter: '',
      showLoader: false,
    };
  },

  created() {
    this.$root.$on('showBranchSelector', () => {
      this.show = true;
    });
  },

  methods: {
    onInput(event) {
      this.filter = event.target.value;
      this.getBranches();
    },

    selectBranch(branch) {
      this.$root.$emit('selectCustomBranch', branch);
      this.show = false;
    },

    getBranches() {
      const project = encodeURIComponent(this.project);
      const url = `https://git.betlab.com/api/v4/projects/${project}/repository/branches?${processParams({
        per_page: 20,
        search: this.filter,
      })}`;

      this.showLoader = true;

      get(url)
        .then((branches) => {
          this.branches = JSON.parse(branches);
        })
        .catch(console.error)
        .then(() => {
          this.showLoader = false;
        });
    }
  },
});
