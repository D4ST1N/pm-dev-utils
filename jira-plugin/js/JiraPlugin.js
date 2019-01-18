const jiraPlugin = document.createElement('div');
jiraPlugin.id = 'jiraPlugin';
document.body.appendChild(jiraPlugin);

function getPointCoordinates(center, radius, angle) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: center.x + (radius * Math.cos(radians)),
    y: center.y + (radius * Math.sin(radians)),
  };
}

function createArray(size, mapper = () => 1) {
  return [...Array(size)].map(mapper);
}

const app = new Vue({
  template: `
  <div class="main-container">
    <div class="main-menu" :style="{ '--menu-turns-count': 1 }">
      <transition-group name="menu">
        <CircleButton
          v-if="show"
          v-for="(button, index) in buttons"
          :key="button.name"
          :color="button.color"
          :icon="button.icon"
          :label="button.label"
          :class="{
            'main-menu__button--menu': true,
            'main-menu__button--hidden': button.name === 'create-branch' && !showBranchButton,
            copyButton: button.name === 'copy-commit'
          }"
          :data-clipboard-text="commitMessage"
          :data-index="index"
          @mouseenter="showTooltip(button, $event)"
          @mouseout="hideTooltip"
          @click="buttonClick(button, $event)"
        />
      </transition-group>
      <CircleButton
        color="dark-grey"
        label="Toggle plugin menu"
        icon="close"
        :class="{ 'main-menu__button--main': true, 'main-menu__button--main--close': show }"
        @click="toggleMenu"
      />
      <CreateBranch />
      <div class="ju-modal" ref="modal">
        <transition
          name="subwindow"
          @after-enter="afterEnter"
          @after-leave="afterLeave"
        >
          <div v-if="modal.show" class="ju-modal__overlay">
            <div class="ju-modal__wrapper">
              <div class="ju-modal__inner">
                <div class="ju-modal__container">
                  <h1 class="ju-modal__title">{{ modal.title }}</h1>
                  <div
                    class="ju-modal__list-item"
                    v-for="(input, index) in modal.inputs"
                    :key="index"
                  >
                    <span v-if="impactSurvey.multiple" class="impact-marker"></span>
                    <input
                      type="text"
                      class="ju-modal__value"
                      v-model="input.value"
                      @keyup.enter="modal.show = false"
                    >
                  </div>
                  <RectangleButton
                    v-if="impactSurvey.multiple"
                    color="blue"
                    text="Add item"
                    class="add-impact-value"
                    @click="addModalValue"
                  />
                  <br />
                  <RectangleButton color="green" text="Ok" @click="modal.show = false" />
                  <RectangleButton color="red" text="Skip" @click="hideModal" />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <DeprecationMessage />
    </div>
  </div>`,

  el: "#jiraPlugin",
  data() {
    return {
      settings: {},
      show: true,
      showBranchButton: true,
      buttons: [
        {
          name: 'settings',
          label: 'Settings',
          icon: 'gear',
          action: 'showSettings',
          color: 'grey',
        },
        {
          name: 'add-impact',
          label: 'Add Impact Analysis',
          icon: 'table',
          action: 'addImpact',
          color: 'pink',
        },
        {
          name: 'copy-commit',
          label: 'Copy commit message',
          icon: 'pen',
          action: 'copyCommit',
          color: 'purple',
        },
        {
          name: 'create-branch',
          label: 'Create Branch',
          icon: 'branch',
          action: 'showCreateBranch',
          color: 'green',
        },
      ],
      commitMessage: '',
      modal: {
        title: '',
        inputs: [
          {
            value: '',
          },
        ],
        show: false,
      },
      impactValue: {
        version: ' ',
        feature: ' ',
        brands: ' ',
        checkList: ' ',
      },
      impactSurvey: {
        questions: [
          {
            title: 'Version / env',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
            },
            after(component, inputs) {
              component.impactValue.version = inputs[0].value || ' ';
              component.impactSurvey.step += 1;
              component.impactSurvey.questions[component.impactSurvey.step].start(component);
            },
          },
          {
            title: 'Features modified',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
            },
            after(component, inputs) {
              component.impactValue.feature = inputs[0].value || ' ';
              component.impactSurvey.step += 1;
              component.impactSurvey.questions[component.impactSurvey.step].start(component);
            },
          },
          {
            title: 'Brands /Features affected',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
            },
            after(component, inputs) {
              component.impactValue.brands = inputs[0].value || ' ';
              component.impactSurvey.step += 1;
              component.impactSurvey.questions[component.impactSurvey.step].start(component);
            },
          },
          {
            title: 'What\'s need to be checked (recommendations from developer)',
            value: '',
            start(component) {
              component.showModal(this.title, this.value);
              component.impactSurvey.multiple = true;
            },
            after(component, inputs) {
              component.impactValue.checkList = inputs.length > 1
                                                ? inputs.reduce(
                  (str, item, index) => `${str}${index > 0 ? '\n' : ''} * ${item.value}`,
                  '',
                )
                                                : inputs[0].value || ' ';
              component.impactSurvey.step = 0;
              component.impactSurvey.multiple = false;
              component.addImpact();
            },
          },
        ],
        step: 0,
        multiple: false,
      },
      impactAnalysisTemplate: '||Summary||Description||\n|*Version / env*|{version}|\n|*Features modified*|{feature}|\n|*Brands /Features affected*|{brands}|\n|*What\'s need to be checked (recommendations from developer)*|{checkList}|',
    };
  },

  created() {
    chrome.storage.sync.get(['jiraPluginSettings'], (storage) => {
      this.settings = storage.jiraPluginSettings;
      this.buttons.forEach((value, index) => {
        this.createAnimation(
          'showMenuItem',
          'hideMenuItem',
          index,
          90 + this.getRotationDegree(index)
        );
      });
    });
    this.$root.$on('addImpact', this.showImpactSurvey);
    this.$root.$on('copyCommit', this.copyCommitMessage);
  },

  mounted() {
    this.setCommitMessage();
    const oldPlugin = document.getElementById('app');

    if (oldPlugin) {
      this.$root.$emit('showDeprecationMessage');
    }
  },

  methods: {
    addModalValue() {
      this.modal.inputs.push({ value: '' });
    },

    showModal(title, value) {
      this.modal.title = title;
      this.modal.inputs.splice(1);
      this.modal.inputs[0].value = value;
      this.modal.show = true;
    },

    hideModal() {
      this.impactSurvey.step = this.impactSurvey.questions.length;
      this.modal.show = false;
    },

    afterEnter() {
      this.$refs.modal.querySelector('.ju-modal__value').focus();
    },

    afterLeave() {
      if (this.impactSurvey.questions.length > this.impactSurvey.step) {
        this.impactSurvey.questions[this.impactSurvey.step].after(this, this.modal.inputs);
      } else {
        this.impactSurvey.step = 0;
        this.addImpact();
      }
    },

    showImpactSurvey() {
      this.impactSurvey.questions[this.impactSurvey.step].start(this);
    },

    addImpact() {
      const issueId = location.pathname.match(/\w+-\d+$/)[0];
      fetch(`https://jira.betlab.com/rest/api/2/issue/${issueId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: this.enrichTemplate(),
        }),
      }).then(() => {
        const script = document.createElement('script');
        script.innerHTML = 'JIRA.trigger(JIRA.Events.REFRESH_ISSUE_PAGE, [JIRA.Issue.getIssueId()])';
        document.body.appendChild(script);
      }).catch(console.error);
    },

    enrichTemplate() {
      return this.impactAnalysisTemplate
                 .replace('{version}', this.impactValue.version)
                 .replace('{feature}', this.impactValue.feature)
                 .replace('{brands}', this.impactValue.brands)
                 .replace('{checkList}', this.impactValue.checkList);
    },

    showTooltip(button, event) {
      this.$root.$emit('showTooltip', event.target, button.label);
    },

    hideTooltip() {
      this.$root.$emit('hideTooltip');
    },

    createAnimation(
      animationNameIn,
      animationNameOut,
      index,
      startTurn = 90,
      frames = 100,
      turnRate = 360,
    ) {
      const startRadius = 0;
      const endRadius = ((this.buttons.length * 48) * 4) / Math.PI / 2;
      const scaleFrom = 0.5;
      const center = {
        x: 0,
        y: 0,
      };
      const framesArray = createArray(frames + 1);
      const radiusRate = (endRadius - startRadius) / frames;
      const angleRate = turnRate / frames;
      const scaleRate = (1 - scaleFrom) / 100;
      let animation = `.main-menu__button--menu[data-index="${index}"] {
        animation-name: ${animationNameIn}${index};
        animation-delay: ${0.12 * (this.buttons.length - index)}s;
      }
      .main-menu__button--menu[data-index="${index}"].menu-leave-active {
        animation-name: ${animationNameOut}${index};
        animation-delay: ${0.12 * index}s;
      }
      @keyframes ${animationNameIn}${index} {
      `;

      framesArray.forEach((value, frameIndex) => {
        const radius = radiusRate * frameIndex;
        const angle = (angleRate * frameIndex) - startTurn;
        const scale = scaleFrom + (scaleRate * frameIndex);
        const coordinates = getPointCoordinates(center, radius, angle);
        animation += `${frameIndex}% {
          transform: translate(${coordinates.x - center.x}px, ${coordinates.y - center.y}px) scale(${scale});
        }`;
      });

      animation = `${animation}
      }
      @keyframes ${animationNameOut}${index} {`;

      framesArray.forEach((value, frameIndex) => {
        const inverseIndex = frames - frameIndex;
        const radius = radiusRate * inverseIndex;
        const angle = (angleRate * inverseIndex) - startTurn;
        const scale = 1 - (scaleRate * frameIndex);
        const coordinates = getPointCoordinates(center, radius, angle);
        animation += `${frameIndex}% {
          transform: translate(${coordinates.x - center.x}px, ${coordinates.y - center.y}px) scale(${scale});
        }
        `;
      });

      animation = `${animation}
      }`;
      const styles = document.createElement('style');
      styles.type = 'text/css';
      styles.innerHTML = animation;
      styles.id = `animation${index}`;
      this.$el.appendChild(styles);
    },

    updateAnimations() {
      this.buttons.forEach((value, index) => {
        const style = document.getElementById(`animation${index}`);
        this.$el.removeChild(style);
        this.createAnimation('showMenuItem', 'hideMenuItem', index, 90 + this.getRotationDegree(index));
      });
    },

    getRotationDegree(index) {
      return index * (90 / (this.buttons.length - 1));
    },

    toggleMenu() {
      this.show = !this.show;

      if (this.show) {
        this.$root.$emit('mainMenuShowed');
      } else {
        this.$root.$emit('mainMenuHided');
      }
    },

    buttonClick(button, event) {
      this.$root.$emit(button.action, button, event);

      if (button.name === 'copy-commit') {
        this.$root.$emit('showNotification', {
          title: 'Copied :)',
        });
      }
    },

    setCommitMessage() {
      const issueId = location.pathname.match(/\w+-\d+$/)[0];
      const ticketName = document.getElementById('summary-val').innerText;
      const ticketNameFormatted = ticketName.replace(/\s\s/ig, ' ').replace(/\[.*?]/ig, '').trim();
      this.commitMessage = `[${issueId}] ${ticketNameFormatted}`;
    },

    copyCommitMessage() {
      navigator.clipboard.writeText(this.commitMessage)
               .then(() => {
                 console.log('Text copied to clipboard');
               })
               .catch(err => {
                 // This can happen if the user denies clipboard permissions:
                 console.error('Could not copy text: ', err);
               });
    },
  }
});
