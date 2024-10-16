/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
	("use strict");

	const select = {
		templateOf: {
			menuProduct: "#template-menu-product",
			cartProduct: "#template-cart-product",
		},
		containerOf: {
			menu: "#product-list",
			cart: "#cart",
		},
		all: {
			menuProducts: "#product-list > .product",
			menuProductsActive: "#product-list > .product.active",
			formInputs: "input, select",
		},
		menuProduct: {
			clickable: ".product__header",
			form: ".product__order",
			priceElem: ".product__total-price .price",
			imageWrapper: ".product__images",
			amountWidget: ".widget-amount",
			cartButton: '[href="#add-to-cart"]',
		},
		widgets: {
			amount: {
				input: "input.amount",
				linkDecrease: 'a[href="#less"]',
				linkIncrease: 'a[href="#more"]',
			},
		},

		cart: {
			productList: ".cart__order-summary",
			toggleTrigger: ".cart__summary",
			totalNumber: `.cart__total-number`,
			totalPrice:
				".cart__total-price strong, .cart__order-total .cart__order-price-sum strong",
			subtotalPrice: ".cart__order-subtotal .cart__order-price-sum strong",
			deliveryFee: ".cart__order-delivery .cart__order-price-sum strong",
			form: ".cart__order",
			formSubmit: '.cart__order [type="submit"]',
			phone: '[name="phone"]',
			address: '[name="address"]',
		},
		cartProduct: {
			amountWidget: ".widget-amount",
			price: ".cart__product-price",
			edit: '[href="#edit"]',
			remove: '[href="#remove"]',
		},
	};

	const classNames = {
		menuProduct: {
			wrapperActive: "active",
			imageVisible: "active",
		},
		cart: {
			wrapperActive: "active",
		},
	};

	const settings = {
		amountWidget: {
			defaultValue: 1,
			defaultMin: 1,
			defaultMax: 9,
		},
		cart: {
			defaultDeliveryFee: 20,
		},
	};

	const templates = {
		menuProduct: Handlebars.compile(
			document.querySelector(select.templateOf.menuProduct).innerHTML
		),
		cartProduct: Handlebars.compile(
			document.querySelector(select.templateOf.cartProduct).innerHTML
		),
	};

	class amountWidget {
		constructor(element) {
			const thisWidget = this;
			thisWidget.getElements(element);
			if (thisWidget.input.value) {
				thisWidget.setValue(thisWidget.input.value);
			} else {
				thisWidget.setValue(settings.amountWidget.defaultValue);
			}

			thisWidget.initActions();
		}

		getElements(element) {
			const thisWidget = this;

			thisWidget.element = element;
			thisWidget.input = thisWidget.element.querySelector(
				select.widgets.amount.input
			);
			thisWidget.linkDecrease = thisWidget.element.querySelector(
				select.widgets.amount.linkDecrease
			);
			thisWidget.linkIncrease = thisWidget.element.querySelector(
				select.widgets.amount.linkIncrease
			);
		}

		setValue(value) {
			const thisWidget = this;
			const newValue = parseInt(value, 10);
			if (thisWidget.value !== newValue && !isNaN(newValue)) {
				if (
					newValue >= settings.amountWidget.defaultMin &&
					newValue <= settings.amountWidget.defaultMax
				) {
					thisWidget.value = newValue;
					this.announce();
				}
			}
			thisWidget.input.value = thisWidget.value;
		}
		initActions() {
			const thisWidget = this;
			thisWidget.input.addEventListener("change", function () {
				thisWidget.setValue(thisWidget.input.value);
			});
			thisWidget.linkDecrease.addEventListener("click", function (event) {
				event.preventDefault();
				thisWidget.setValue(thisWidget.value - 1);
			});
			thisWidget.linkIncrease.addEventListener("click", function (event) {
				event.preventDefault();
				thisWidget.setValue(thisWidget.value + 1);
			});
		}
		announce() {
			const thisWidget = this;
			const event = new CustomEvent("updated", {bubbles: true});
			thisWidget.element.dispatchEvent(event);
		}
	}

	class Cart {
		constructor(element) {
			const thisCart = this;
			thisCart.data = dataSource;
			thisCart.products = [];
			thisCart.totalPrice = 0;
			thisCart.getElements(element);
			thisCart.initActions();
		}
		getElements(element) {
			const thisCart = this;

			thisCart.dom = {};

			thisCart.dom.wrapper = element;

			thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
				select.cart.toggleTrigger
			);

			thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
				select.cart.productList
			);
			thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
				select.cart.deliveryFee
			);
			thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
				select.cart.subtotalPrice
			);
			thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
				select.cart.totalPrice
			);
			thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
				select.cart.totalNumber
			);
		}
		initActions() {
			const thisCart = this;
			thisCart.dom.toggleTrigger.addEventListener("click", function () {
				thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
			});
			thisCart.dom.productList.addEventListener("updated", function(){
				thisCart.update();
			});
			thisCart.dom.productList.addEventListener("remove", function (event) {
				thisCart.remove(event.detail.cartProduct);
			});
		}
		add(menuProduct) {
			const thisCart = this;
			const generatedHTML = templates.cartProduct(menuProduct);
			const cartContainer = document.querySelector(select.cart.productList);
			const generatedDOM = utils.createDOMFromHTML(generatedHTML);
			cartContainer.appendChild(generatedDOM);
			thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
			const cartProduct = new CartProduct(menuProduct, generatedDOM);
			this.update();
		}

		update(){
			const thisCart = this;
			const deliveryFee = settings.cart.defaultDeliveryFee
			let totalNumber = 0;
			let subtotalPrice = 0;
			for(let productInCart of thisCart.products){
				totalNumber += productInCart.amount;
				subtotalPrice += productInCart.price;
			}
			if (subtotalPrice != 0) {
			thisCart.totalPrice = subtotalPrice + deliveryFee;
			}
			else {
				thisCart.totalPrice = 0;
			}
			thisCart.dom.deliveryFee.innerHTML = deliveryFee;
			thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
			for (let priceElem of thisCart.dom.totalPrice) {
				priceElem.innerHTML = thisCart.totalPrice;
			}
		}
		remove(cartProduct) {
			const thisCart = this;
			cartProduct.dom.wrapper.remove();
			const indexOfProduct = thisCart.products.indexOf(cartProduct);
			if (indexOfProduct !== -1) {
				thisCart.products.splice(indexOfProduct, 1);
			}
			thisCart.update();
		}
		
	}
	const app = {
		initMenu: function () {
			const thisApp = this;
			for (let productData in thisApp.data.products) {
				new Product(productData, thisApp.data.products[productData]);
			}
		},
		initData: function () {
			const thisApp = this;

			thisApp.data = dataSource;
		},
		init: function () {
			const thisApp = this;
			thisApp.initData();
			thisApp.initMenu();
			thisApp.initCart();
		},
		initCart: function () {
			const thisApp = this;

			const cartElem = document.querySelector(select.containerOf.cart);
			thisApp.cart = new Cart(cartElem);
		},
	};

	class CartProduct {
		constructor(menuProduct, element) {
			const thisCartProduct = this;
			thisCartProduct.id = menuProduct.id;
			thisCartProduct.name = menuProduct.name;
			thisCartProduct.amount = menuProduct.amount;
			thisCartProduct.priceSingle = menuProduct.priceSingle;
			thisCartProduct.price = menuProduct.price;
			thisCartProduct.params = menuProduct.params;
			thisCartProduct.getElements(element);
			thisCartProduct.initCartAmountWidget();
			thisCartProduct.initActions();
		}
		getElements(element) {
			const thisCartProduct = this;
			thisCartProduct.dom = {};
			thisCartProduct.wrapper = element;
			thisCartProduct.dom.wrapper = thisCartProduct.wrapper;
			thisCartProduct.dom.amountWidgetElem =
				thisCartProduct.dom.wrapper.querySelector(
					select.cartProduct.amountWidget
				);
			thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
				select.cartProduct.price
			);
			thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
				select.cartProduct.edit
			);
			thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
				select.cartProduct.remove
			);
		}
		initCartAmountWidget() {
			const thisCartProduct = this;
			thisCartProduct.amountWidget = new amountWidget(
				thisCartProduct.dom.amountWidgetElem
			);
			thisCartProduct.dom.amountWidgetElem.addEventListener(
				"updated",
				function (event) {
					event.preventDefault();
					thisCartProduct.amount = thisCartProduct.amountWidget.value;
					thisCartProduct.price =
						thisCartProduct.amount * thisCartProduct.priceSingle;
					thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
				}
			);
		}
		remove(){
			const thisCartProduct = this;
			const event = new CustomEvent('remove', {
				bubbles: true,
			detail:{
				cartProduct: thisCartProduct,
			},
			});
			thisCartProduct.dom.wrapper.dispatchEvent(event);
		}

		initActions(){
			const thisCartProduct = this;
			thisCartProduct.dom.edit.addEventListener('click', function(event){				
				event.preventDefault();
			})

			thisCartProduct.dom.remove.addEventListener('click', function(event){				
				event.preventDefault();
				thisCartProduct.remove();
			})
		}
	}

	class Product {
		constructor(id, data) {
			const thisProduct = this;
			thisProduct.id = id;
			thisProduct.data = data;
			thisProduct.renderInMenu();
			thisProduct.getElements();
			thisProduct.initAccordion();
			thisProduct.initOrderForm();
			thisProduct.initAmountWidget();
			thisProduct.processOrder();
		}

		renderInMenu() {
			const thisProduct = this;

			//generate HTML based on template
			const generatedHTML = templates.menuProduct(thisProduct.data);
			// create element using utils.createElementFromHTML
			thisProduct.element = utils.createDOMFromHTML(generatedHTML);
			//finde menu container
			const menuContainer = document.querySelector(select.containerOf.menu);
			//add element to menu
			menuContainer.appendChild(thisProduct.element);
		}

		getElements() {
			const thisProduct = this;

			thisProduct.accordionTrigger = thisProduct.element.querySelector(
				select.menuProduct.clickable
			);
			thisProduct.form = thisProduct.element.querySelector(
				select.menuProduct.form
			);
			thisProduct.formInputs = thisProduct.form.querySelectorAll(
				select.all.formInputs
			);
			thisProduct.cartButton = thisProduct.element.querySelector(
				select.menuProduct.cartButton
			);
			thisProduct.priceElem = thisProduct.element.querySelector(
				select.menuProduct.priceElem
			);
			thisProduct.imageWrapper = thisProduct.element.querySelector(
				select.menuProduct.imageWrapper
			);
			thisProduct.amountWidgetElem = thisProduct.element.querySelector(
				select.menuProduct.amountWidget
			);
		}

		initAmountWidget() {
			const thisProduct = this;
			thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
			thisProduct.amountWidgetElem.addEventListener(
				"updated",
				function (event) {
					event.preventDefault();
					thisProduct.processOrder();
				}
			);
		}

		initAccordion() {
			const thisProduct = this;

			/* START: add event listener to clickable trigger on event click */
			thisProduct.accordionTrigger.addEventListener("click", function (event) {
				/* prevent default action for event */
				event.preventDefault();

				/* find active product (product that has active class) */
				const activeProduct = document.querySelector(
					select.all.menuProductsActive
				);

				/* if there is active product and it's not thisProduct.element, remove class active from it */
				if (activeProduct && activeProduct !== thisProduct.element) {
					activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
				}

				/* toggle active class on thisProduct.element */
				thisProduct.element.classList.toggle(
					classNames.menuProduct.wrapperActive
				);
			});
		}
		initOrderForm() {
			const thisProduct = this;
			thisProduct.form.addEventListener("submit", function (event) {
				event.preventDefault();
				thisProduct.processOrder();
			});

			for (let input of thisProduct.formInputs) {
				input.addEventListener("change", function () {
					thisProduct.processOrder();
				});
			}

			thisProduct.cartButton.addEventListener("click", function (event) {
				event.preventDefault();
				thisProduct.processOrder();
				thisProduct.addToCart();
			});
		}
		processOrder() {
			const thisProduct = this;

			// covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
			const formData = utils.serializeFormToObject(thisProduct.form);

			// set price to default price
			let price = thisProduct.data.price;

			// for every category (param)...
			for (let paramId in thisProduct.data.params) {
				// determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
				const param = thisProduct.data.params[paramId];
				// for every option in this category
				for (let optionId in param.options) {
					const optionImageClass = `${paramId}-${optionId}`;
					const optionImage = thisProduct.imageWrapper.querySelector(
						`.${optionImageClass}`
					);
					// determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
					const option = param.options[optionId];
					// check if there is param with a name of paramId in formData and if it includes optionId
					if (formData[paramId] && formData[paramId].includes(optionId)) {
						// check if the option is not default
						if (option.default !== true) {
							// add option price to price variable
							price += option.price;
						}
						if (optionImage) {
							optionImage.style.display = "block";
						}
					} else {
						// check if the option is default
						if (option.default) {
							// reduce price variable
							price -= option.price;
						}
						if (optionImage) {
							optionImage.style.display = "none";
						}
					}
				}
			}

			// update calculated price in the HTML
			thisProduct.priceSingle = price;
			price *= thisProduct.amountWidget.value;
			thisProduct.priceElem.innerHTML = price;
			thisProduct.price = price;
		}
		addToCart() {
			const thisProduct = this;
			const productSummary = thisProduct.prepareCartProduct();
			app.cart.add(productSummary);
		}

		prepareCartProduct() {
			const thisProduct = this;
			const params = thisProduct.prepareCartProductParams();
			const productSummary = {
				id: thisProduct.id,
				name: thisProduct.data.name,
				amount: thisProduct.amountWidget.value,
				priceSingle: thisProduct.priceSingle,
				price: thisProduct.price,
				params: params,
			};
			return productSummary;
		}
		prepareCartProductParams() {
			const thisProduct = this;
			const formData = utils.serializeFormToObject(thisProduct.form);
			const params = {};

			// for very category (param)
			for (let paramId in thisProduct.data.params) {
				const param = thisProduct.data.params[paramId];

				// create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
				params[paramId] = {
					label: param.label,
					options: {},
				};

				// for every option in this category
				for (let optionId in param.options) {
					const option = param.options[optionId];
					const optionSelected =
						formData[paramId] && formData[paramId].includes(optionId);

					if (optionSelected) {
						params[paramId].options[optionId] = option.label;
					}
				}
			}
			return params;
		}
	}
	app.init();
}
