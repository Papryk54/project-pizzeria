import { select, classNames, settings, templates } from "../settings.js";
import utils from "../utils.js";
import CartProduct from "./CartProduct.js";

class Cart {
	constructor(element) {
		const thisCart = this;
		thisCart.products = [];
		thisCart.totalPrice = 0;
		thisCart.subtotalPrice = 0;
		thisCart.totalNumber = 0;
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
		thisCart.dom.address = thisCart.dom.wrapper.querySelector(
			select.cart.address
		);
		thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
		thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
	}
	initActions() {
		const thisCart = this;
		thisCart.dom.toggleTrigger.addEventListener("click", function () {
			thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
		});
		thisCart.dom.productList.addEventListener("updated", function () {
			thisCart.update();
		});
		thisCart.dom.productList.addEventListener("remove", function (event) {
			thisCart.remove(event.detail.cartProduct);
		});
		thisCart.dom.form.addEventListener("submit", function (event) {
			event.preventDefault();
			thisCart.sendOrder();
		});
	}
	sendOrder() {
		const thisCart = this;
		const url = settings.db.url + "/" + settings.db.orders;
		const payload = {
			address: thisCart.dom.address.value,
			phone: thisCart.dom.phone.value,
			totalPrice: thisCart.totalPrice,
			subtotalPrice: thisCart.subtotalPrice,
			totalNumber: thisCart.totalNumber,
			deliveryFee: settings.cart.defaultDeliveryFee,
			products: [],
		};
		for (let prod of thisCart.products) {
			payload.products.push(prod.getData());
		}
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		};
		fetch(url, options).then(function (response) {
			return response.json();
		});
	}

	add(menuProduct) {
		const thisCart = this;
		const generatedHTML = templates.cartProduct(menuProduct);
		const cartContainer = document.querySelector(select.cart.productList);
		const generatedDOM = utils.createDOMFromHTML(generatedHTML);
		cartContainer.appendChild(generatedDOM);
		thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
		this.update();
	}

	update() {
		const thisCart = this;
		const deliveryFee = settings.cart.defaultDeliveryFee;
		let totalNumber = 0;
		let subtotalPrice = 0;
		for (let productInCart of thisCart.products) {
			totalNumber += productInCart.amount;
			subtotalPrice += productInCart.price;
		}
		if (subtotalPrice != 0) {
			thisCart.totalPrice = subtotalPrice + deliveryFee;
			thisCart.subtotalPrice = subtotalPrice;
			thisCart.totalNumber = totalNumber;
		} else {
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

export default Cart;
