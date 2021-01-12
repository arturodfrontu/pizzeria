import {select, settings} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){
    const thisWidget = this;
    const newValue =parseInt(value);

    function isValid(thisWidget, newValue) {
      return thisWidget.value !== newValue
      && !isNaN(newValue)
      && newValue <= settings.amountWidget.defaultMax
      && newValue >= settings.amountWidget.defaultMin;
    }

    if(isValid(thisWidget, newValue)) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
  }

  announce() {
    const thisWidget = this;
    const event = new CustomEvent('update', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
    });
  }
}

export default AmountWidget;
