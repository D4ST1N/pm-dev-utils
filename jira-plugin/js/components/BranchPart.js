Vue.component('BranchPart', {
  template: `
  <div v-if="selected" class="branch-part">
    <div v-if="!editable" class="branch-part__value" @click="toggleValues">{{ selected.name }}</div>
    <input
     v-else type="text"
     ref="input"
     class="branch-part__value ajs-dirty-warning-exempt"
     :value="editableValue"
     @input="resize"
    >
    <div v-if="editable" ref="fake" class="branch-part__value--fake">{{ editableValue }}</div>
    <div v-if="showValues" class="branch-part__values">
      <div
        v-for="value in filteredValues"
        class="branch-part__value"
        @click="selectValue(value)"
      >{{ value.name }}</div>
    </div>
  </div>
  `,

  props: {
    values: {
      type: Array,

      default() {
        return [];
      },
    },

    editable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showValues: false,
      editableValue: this.editable ? this.formatToValidBranchName(this.values[0] || '') : '',
    };
  },

  created() {
    this.$emit('updateValue', this.editableValue);
  },

  computed: {
    selected() {
      return (this.values.find(value => value.selected) || this.values[0]);
    },

    filteredValues() {
      return this.values.filter(value => value.name !== this.selected.name);
    },
  },

  methods: {
    toggleValues() {
      this.showValues = !this.showValues;
    },

    selectValue(value) {
      this.showValues = false;
      this.$emit('selectValue', value);
    },

    resize(event) {
      this.editableValue = this.formatToValidBranchName(event.target.value, false);
      this.$refs.input.style.width = `${this.$refs.fake.offsetWidth}px`;
      this.$emit('updateValue', this.editableValue);
    },

    formatToValidBranchName(string, limit = 5) {
      let formattedString = string
        .replace(/["'`]/g, '') /* remove quotes */
        .replace(/\s-\s/g, '') /* remove dashes */
        .replace(/\s\s/ig, ' ') /* Replace double spaces with single space */
        .replace(/\[.*?]/ig, '') /* Strip tags in square brackets e.g.: [tag] */
        .replace(/^\s+/, '') /* After removing square brackets - there might be leading white space left */
        .replace(/\s/ig, '-') /* Replace all spaces with dashes */
        .replace(/^[./]|\.\.|@{|[\/.]$|^@$|[~^:\x00-\x20\x7F\s?*[\]\\]/ig, '')
        /* Strip all forbidden chars */
        .replace(/-+/g, '-') /* remove multiple dashes */
        .toLowerCase();

      return limit ? formattedString.split('-').slice(0, limit).join('-') : formattedString;
    }
  },
});
