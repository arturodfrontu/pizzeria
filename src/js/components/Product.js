import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.selectElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    const menuContainer = document.querySelector(select.containerOf.menu);

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    menuContainer.appendChild(thisProduct.element);
  }

  selectElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    thisProduct.accordionTrigger.addEventListener('click', function(event){
      event.preventDefault();

      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);

      for(let activeProduct of allActiveProducts){

        if(activeProduct !== thisProduct.element && activeProduct !== null){
          activeProduct.classList.remove('active');
        }
      }
      thisProduct.element.classList.toggle('active');
    });
  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);

    let price = thisProduct.data.price;

    for(let paramId in thisProduct.data.params) {

      const param = thisProduct.data.params[paramId];

      for(let optionId in param.options) {

        const option = param.options[optionId];
        const selectedOption = formData[paramId] && formData[paramId].includes(optionId);

        if(selectedOption){

          if(option.default) {
            price = price + 0;
          } else if(!option.default) {
            price = price + option.price;
          }

        } else if (option.default){
          price = price - option.price;
        }

        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        if(optionImage !== null){

          if(selectedOption){
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.singlePrice = price;
    thisProduct.price = thisProduct.singlePrice * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('qtyChange', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      singlePrice: thisProduct.singlePrice,
      price: thisProduct.data.price,
      params: thisProduct.prepareCartProductParams(thisProduct.params),
    };
    return (productSummary);
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        name: param.label,
        options: {}
      };
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;
