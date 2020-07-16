const SUCCESS = 'success';
const FAIL = 'fail';

const donateWidget = new Vue({
  el: '#donate-widget',
  data: {
    currencies: [
      { code: 'USD', name: 'US Dollar', rate: 1, symbol: '$' },
      { code: 'EUR', name: 'Euro', rate: 0.897597, symbol: '€' },
      { code: 'GBP', name: 'British Pound', rate: 0.81755, symbol: '£' },
      { code: 'RUB', name: 'Russian Ruble', rate: 63.461993 , symbol: '₽'},
    ],
    defaults: {
      batch: 3,
      localeString: 'en-US',
      currencyCode: 'USD',
    },
    enteredManually: false,
    presets: [40, 100, 200, 1000, 2500, 5000],
    selectedCurrency: {
      name: 'US Dollar',
      rate: 1,
    },
    selectedCurrencyCode: 'USD',
    showAlert: {
      display: false,
      alertMode: SUCCESS,
    },
    suggestion: 40,
    suggestionPrevious: 40,
  },
  methods: {
    asPresetValue(sum, rate) {
      const sumInUsd = parseInt(sum / rate, 10);
      const foundPreset = this.presets.find(preset => {
        const percent = preset / sumInUsd;
        return percent > 0.5 && percent <= 1;
      });
      return foundPreset || sumInUsd;
    },
    batchedPresets(batch = this.defaults.batch) {
      const { presets, selectedCurrency: { rate } } = this;
      const presetsInBatch = parseInt(presets.length / batch, 10);
      let batchedPresets = [];
      for (let batchIndex = 0; batchIndex < presetsInBatch; batchIndex += 1) {
        const oneBatch = presets.slice(batchIndex * batch, (batchIndex + 1) * batch);
        batchedPresets.push(oneBatch.map(preset => this.calculateRate(preset, rate)));
      }
      return batchedPresets;
    },
    calculateRate(sum, rate = 1, pretty = true) {
      const convertedSum = parseInt(sum * rate, 10);

      let rounded;
      if (pretty && rate !== 1) {
        rounded = Math.ceil(convertedSum);
        let diff;
        
        if (rounded < 100) {
          diff = 10 - rounded % 10;
        } else if (rounded >= 100 && rounded < 500) {
          diff = 50 - rounded % 50;
        } else if (rounded >= 500 && rounded < 1000) {
          diff = 100 - rounded % 100;
        } else if (rounded >= 1000 && rounded < 3000) {
          diff = 250 - rounded % 250;
        } else if (rounded >= 3000 && rounded < 5000) {
          diff = 500 - rounded % 500;
        } else if (rounded >= 5000 && rounded < 15000) {
          diff = 1000 - rounded % 1000;
        } else if (rounded >= 15000 && rounded < 150000) {
          diff = 5000 - rounded % 5000;
        } else {
          diff = 10000 - rounded % 10000;
        }
        rounded += diff;
      }
      return rounded || convertedSum;
    },
    checkForPresets() {
      const contains = this.presetContains(this.suggestion);
      if (contains) {
        this.enteredManually = false;
      }
    },
    localeFormat(sum = 0) {
      const { code = this.defaults.currencyCode, rate, symbol } = this.selectedCurrency;
      const excludeParts = ['decimal', 'fraction'];
      const formatOptions = {
        style: 'currency',
        currency: code,
      };
      const mergeFormatParts = (accum, { type, value }) => {
        const addFormat = !excludeParts.includes(type);
        const currencyType = type === 'currency';
        const addValue = currencyType && !!symbol && symbol !== value
          ? symbol
          : value;
        return addFormat
          ? [...accum, addValue]
          : [...accum];
      };
      return new Intl.NumberFormat(this.defaults.localeString, formatOptions)
        .formatToParts(sum)
        .reduce(mergeFormatParts, [])
        .join('');
    },
    async sendDonation() {
      const { selectedCurrencyCode, suggestion } = this;
      const headers = new Headers([
        ['Content-Type', 'application/json']
      ]);
      
      const data = { amount: suggestion, currency: selectedCurrencyCode };
      try {
        const response = await fetch('/donate', {
          headers,
          method: 'post',
          body: JSON.stringify(data),
        });
        const { ok } = await response.json();
        const alertMode = ok ? SUCCESS : FAIL;
        this.showAlert = { display: true, alertMode };
      } catch (err) {
        console.error(err);
        this.showAlert = { display: true, alertMode: FAIL };
      }
    },
    presetContains(inputSum) {
      const { presets, selectedCurrency: { rate }, suggestion } = this;
      const foundInPresetWithRate = presets
        .map(preset => this.calculateRate(preset, rate));
      const foundInPresets = Number(suggestion) === Number(inputSum)
        && foundInPresetWithRate.includes(Number(inputSum));
      if (foundInPresets) {
        this.enteredManually = false;
      }
      return foundInPresets;
    },
    validateSuggestInput({ target: { value: suggestInput } }) {
      const nonDigits = new RegExp(/\D/);
      const excludeSymbols = ['.', ',', '-', '=', '+'];
      const { suggestion, suggestionPrevious } = this;
      // add .,-+= as well in regExp
      const hasChars = nonDigits.test(suggestInput);
      const hasExcludeSymbols = excludeSymbols
        .find(exclude => suggestInput.includes(exclude));
      if (!hasChars && !hasExcludeSymbols) {
        this.enteredManually = true;
        this.suggestionPrevious = suggestion;
      } else {
        this.suggestion = suggestionPrevious;
      }
    },
  },
  watch: {
    selectedCurrencyCode(code) {
      const { enteredManually, suggestion, selectedCurrency: { rate } } = this;
      const currencyByCode = ({ code: curCode }) => curCode === code;
      const newCurrency = this.currencies.find(currencyByCode);
      const sumInUsd = enteredManually
        ? parseInt(suggestion / rate, 10)
        : this.asPresetValue(suggestion, rate);
      this.selectedCurrency = newCurrency;
      this.suggestion = this.calculateRate(sumInUsd, newCurrency.rate, !enteredManually);
    },
  },
});
