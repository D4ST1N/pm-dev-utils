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
  // render(createElement) {
  //   return createElement(
  //     'div',
  //     {
  //       class: {
  //         'main-container': true,
  //       },
  //     },
  //   );
  // },
  template: `
  <div class="main-container">
    <div class="main-menu" :style="{ '--menu-turns-count': 2 }">
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
        icon="add"
        :class="{ 'main-menu__button--main': true, 'main-menu__button--main--close': show }"
        @click="toggleMenu"
      />
      <CreateBranch />
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
          action: 'copeCommit',
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
    };
  },

  created() {
    chrome.storage.sync.get(['jiraPluginSettings'], (storage) => {
      this.settings = storage.jiraPluginSettings;
      this.buttons.forEach((value, index) => {
        this.createAnimation('showMenuItem', 'hideMenuItem', index, 90 + this.getRotationDegree(index));
      });
    });
  },

  mounted() {
  },

  methods: {
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
      turnRate = 360 * this.settings.turnCount,
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

    setCommitMessage() {
      const ticket = jira.getTicketID();
      const ticketName = jira.getTicketName();
      const ticketNameFormatted = ticketName.replace(/\s\s/ig, ' ').replace(/\[.*?\]/ig, '').trim();
      this.commitMessage = `[${ticket}] ${ticketNameFormatted}`;
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
  }
});
