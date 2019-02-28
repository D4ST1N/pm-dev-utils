Vue.component('CreateBranch', {
  template: `
  <div v-if="show" class="create-branch">
    <BranchSelector :defaultBranch="getForkBranch()" :project="getProject()" />
    <div class="create-branch__branch-container">
      <BranchPart :values="platforms" @selectValue="setNewValue('platforms', ...arguments)" />
      <BranchPart :values="issuesTypes" @selectValue="setNewValue('issuesTypes', ...arguments)" />
      <BranchPart :values="filteredDomains" @selectValue="setNewValue('domains', ...arguments)" />
      <BranchPart :values="projects" @selectValue="setNewValue('projects', ...arguments)" />
      <BranchPart :values="task" />
      <BranchPart :values="description" :editable="true" @updateValue="updateDescription" />
    </div>
    <div class="create-branch__actions">
      <RectangleButton color="green" text="Copy" @click="copyBranchName" />
      <RectangleButton v-if="branchExist" color="blue" text="Open" @click="openBranch" />
      <RectangleButton v-else color="blue" text="Fork" shiftText="Choose" @click="create" @shiftClick="getExtendedForkBranch" />
      <RectangleButton color="red" text="Close" @click="closeCreateBranch" />
    </div>
  </div>
  `,

  data() {
    return {
      platforms: [
        {
          name: 'desktop',
          project: 'air/air-pm',
          selected: true,
        },
        {
          name: 'mobile',
          project: 'air/air-mobile',
          selected: false,
        },
      ],
      issuesTypes: [
        {
          name: 'feature',
          selected: true,
        },
        {
          name: 'bugfix',
          selected: false,
        },
        {
          name: 'hotfix',
          selected: false,
        },
      ],
      domains: [
        {
          name: 'com',
          selected: true,
          platforms: [
            'desktop',
            'mobile',
          ],
          projects: [
            'air',
            'mvp',
          ],
          branch: {
            desktop: 'master',
            mobile: 'master',
          },
        },
        {
          name: 'ru-com',
          selected: false,
          platforms: [
            'desktop',
            'mobile',
          ],
          projects: [
            'air',
          ],
          branch: {
            desktop: 'master',
            mobile: 'master',
          },
        },
        {
          name: 'ru',
          selected: false,
          platforms: [
            'desktop',
            'mobile',
          ],
          projects: [
            'air',
          ],
          branch: {
            desktop: 'master-ru',
            mobile: 'master',
          },
        },
        {
          name: 'cy',
          selected: false,
          platforms: [
            'desktop',
            'mobile',
          ],
          projects: [
            'air',
          ],
          branch: {
            desktop: 'master-cy',
            mobile: 'master',
          },
        },
        {
          name: 'ge',
          selected: false,
          platforms: [
            'desktop',
            'mobile',
          ],
          projects: [
            'air',
          ],
          branch: {
            desktop: 'master-ge',
            mobile: 'master',
          },
        },
        {
          name: 'kz',
          selected: false,
          platforms: [
            'mobile',
          ],
          projects: [
            'air',
          ],
          branch: {
            mobile: 'master',
          },
        },
        {
          name: 'by',
          selected: false,
          platforms: [
            'desktop',
            'mobile',
          ],
          projects: [
            'air',
          ],
          branch: {
            desktop: 'master-by',
            mobile: 'master',
          },
        },
      ],
      projects: [
        {
          name: 'air',
          selected: true,
        },
        {
          name: 'mvp',
          selected: false,
        },
      ],
      task: [],
      description: [],
      show: false,
      branchExist: false,
      existedBranch: '',
    };
  },

  computed: {
    filteredDomains() {
      const selectedPlatform = this.getSelected('platforms');
      const selectedProject = this.getSelected('projects');

      return this.domains.filter(
        domain => domain.platforms.includes(selectedPlatform.name)
                  && domain.projects.includes(selectedProject.name)
      );
    },
  },

  created() {
    this.$root.$on('showCreateBranch', () => {
      this.show = true;
    });
    this.$root.$on('selectCustomBranch', (targetBranch) => {
      this.createBranch(this.getBranchName(), targetBranch);
    });

    this.task = [{
      name: (location.pathname.match(/\w+-\d+$/) || [])[0],
    }];

    const ticketName = document.getElementById('summary-val').innerText;
    this.description = [ticketName];
    this.checkBranchExist();
  },

  methods: {
    setNewValue(key, value) {
      this[key].map(prop => prop.selected = false);
      value.selected = true;
      if (key === 'platforms') {
        this.checkBranchExist();
      }
    },

    getSelected(key) {
      return this[key].find(prop => prop.selected);
    },

    closeCreateBranch() {
      this.show = false;
    },

    updateDescription(value) {
      this.description = [value];
    },

    getForkBranch() {
      const selectedPlatform = this.getSelected('platforms');
      const domain = this.getSelected('domains');

      return domain.branch[selectedPlatform.name];
    },

    getProject() {
      return this.getSelected('platforms').project;
    },

    create() {
      this.createBranch(this.getBranchName(), this.getForkBranch());
    },

    getExtendedForkBranch() {
      this.$root.$emit('showBranchSelector');
    },

    copyBranchName() {
      const branchName = this.getBranchName();
      navigator.clipboard.writeText(branchName)
               .then(() => {
                 console.log('Text copied to clipboard');
               })
               .catch(err => {
                 // This can happen if the user denies clipboard permissions:
                 console.error('Could not copy text: ', err);
               });
    },

    getBranchName() {
      const issueType = this.getSelected('issuesTypes').name;
      const domain = this.getSelected('domains').name;
      const project = this.getSelected('projects').name;
      const issueId = this.task[0].name;
      const description = this.description[0];

      return `${issueType}/${domain}/${project}/${issueId}-${description}`;
    },

    checkBranchExist() {
      const project = encodeURIComponent(this.getProject());
      const url = `https://git.betlab.com/api/v4/projects/${project}/repository/branches?${processParams({
        search: this.task[0].name,
      })}`;

      get(url)
        .then((branches) => {
          const parsedBranches = JSON.parse(branches);
          this.branchExist = parsedBranches.length > 0;

          if (this.branchExist) {
            this.existedBranch = parsedBranches[0].name;
          }
        })
        .catch(console.error)
    },

    openBranch() {
      const project = this.getProject();
      const url = 'https://git.betlab.com/{project}/tree/{branch}'
      .replace('{branch}', this.existedBranch)
      .replace('{project}', project);
      const win = window.open(url, '_blank');

      win.focus();
    },

    createBranch(branchName, targetBranch) {
      const project = encodeURIComponent(this.getProject());
      chrome.storage.sync.get(['private_token'], (storage) => {
        const params = {
          branch: branchName,
          ref: targetBranch,
          private_token: storage.private_token,
        };
        const url = `https://git.betlab.com/api/v4/projects/${project}/repository/branches?${processParams(params)}`;
        post(url)
        .then(() => {
          this.checkBranchExist();
        })
        .catch(console.error);
      });
    },
  },
});
