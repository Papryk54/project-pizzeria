import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import Booking from "./components/Booking.js";
import initHome from "./components/Home.js";

const app = {
	initMenu: function () {
		const thisApp = this;
		for (let productData in thisApp.data.products) {
			new Product(
				thisApp.data.products[productData].id,
				thisApp.data.products[productData]
			);
		}
	},
	initData: function () {
		const thisApp = this;
		thisApp.data = {};
		const url = settings.db.url + "/" + settings.db.products;
		fetch(url)
			.then(function (rawResponse) {
				return rawResponse.json();
			})
			.then(function (parsedResponse) {
				/*save parsedResponse as thisApp.data.products*/
				thisApp.data.products = parsedResponse;
				/*execute initMenu method*/
				thisApp.initMenu();
			});
	},
	init: function () {
		const thisApp = this;
		thisApp.initData();
		thisApp.initCart();
		thisApp.initPages();
		thisApp.initBooking();
		thisApp.initOrderButton();
		thisApp.initBookingTableButton();
		// thisApp.forceDoubleRefresh();
		initHome();
	},
	initCart: function () {
		const thisApp = this;

		const cartElem = document.querySelector(select.containerOf.cart);
		thisApp.cart = new Cart(cartElem);

		thisApp.productList = document.querySelector(select.containerOf.menu);

		thisApp.productList.addEventListener("add-to-cart", function (event) {
			app.cart.add(event.detail.product);
		});
	},
	initPages: function () {
		const thisApp = this;

		thisApp.pages = document.querySelector(select.containerOf.pages).children;
		thisApp.navLinks = document.querySelectorAll(select.nav.links);
		let idFromHash = "";
		if (window.location.hash) {
			idFromHash = window.location.hash.replace("#/", "");
		} else {
			window.location.hash = "#/home";
		}
		let pageMatchingHash = thisApp.pages[0].id;

		for (let page of thisApp.pages) {
			if (page.id == idFromHash) {
				pageMatchingHash = page.id;
				break;
			}
		}
		thisApp.activatePage(pageMatchingHash);

		for (let link of thisApp.navLinks) {
			link.addEventListener("click", function (event) {
				const clickedElement = this;
				event.preventDefault();

				const id = clickedElement.getAttribute("href").replace("#", "");
				thisApp.activatePage(id);

				window.location.hash = "#/" + id;
			});
		}
	},
	initBooking: function () {
		const thisApp = this;
		const bookingContainer = document.querySelector(select.containerOf.booking);

		thisApp.booking = new Booking(bookingContainer);
	},
	initOrderButton: function () {
		const thisApp = this;

		const orderButton = document.getElementById("orderOnlineButton");

		orderButton.addEventListener("click", function (event) {
			event.preventDefault();

			window.location.hash = "#/order";
			thisApp.activatePage("order");
		});
	},
	initBookingTableButton: function () {
		const thisApp = this;

		const orderButton = document.getElementById("bookTableButton");

		orderButton.addEventListener("click", function (event) {
			event.preventDefault();

			window.location.hash = "#/booking";
			thisApp.activatePage("booking");
		});
	},

	activatePage: function (pageId) {
		const thisApp = this;

		for (let page of thisApp.pages) {
			page.classList.toggle(classNames.pages.active, page.id == pageId);
		}

		for (let link of thisApp.navLinks) {
			link.classList.toggle(
				classNames.nav.active,
				link.getAttribute("href") == "#" + pageId
			);
		}
	},
	forceDoubleRefresh: function () {
		const hasRefreshed = sessionStorage.getItem("hasRefreshed");

		if (!hasRefreshed) {
			sessionStorage.setItem("hasRefreshed", "true");
			location.reload();
		} else {
			sessionStorage.removeItem("hasRefreshed");
		}
	},
};

app.init();
