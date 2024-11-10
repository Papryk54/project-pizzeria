import { select } from "../settings.js";
import amountWidget from "./AmountWidget.js";

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
	remove() {
		const thisCartProduct = this;
		const event = new CustomEvent("remove", {
			bubbles: true,
			detail: {
				cartProduct: thisCartProduct,
			},
		});
		thisCartProduct.dom.wrapper.dispatchEvent(event);
	}

	initActions() {
		const thisCartProduct = this;
		thisCartProduct.dom.edit.addEventListener("click", function (event) {
			event.preventDefault();
		});

		thisCartProduct.dom.remove.addEventListener("click", function (event) {
			event.preventDefault();
			thisCartProduct.remove();
		});
	}
	getData() {
		const thisCartProduct = this;
		return {
			id: thisCartProduct.id,
			amount: thisCartProduct.amount,
			price: thisCartProduct.price,
			priceSingle: thisCartProduct.priceSingle,
			name: thisCartProduct.name,
			params: thisCartProduct.params,
		};
	}
}

export default CartProduct;
