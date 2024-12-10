import { select, templates, settings, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
	constructor(element) {
		this.render(element);
		this.initWidgets();
		this.getData();
		this.timeChanged = false;
		this.changeTime();
		this.initBookingForm();
	}

	getData() {
		const thisBooking = this;

		const startDateParam =
			settings.db.dateStartParamKey +
			"=" +
			utils.dateToStr(thisBooking.datePicker.minDate);
		const endDateParam =
			settings.db.dateEndParamKey +
			"=" +
			utils.dateToStr(thisBooking.datePicker.maxDate);

		const params = {
			booking: [startDateParam, endDateParam],
			eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
			eventsRepeat: [settings.db.repeatParam, endDateParam],
		};

		const urls = {
			booking:
				settings.db.url +
				"/" +
				settings.db.bookings +
				"?" +
				params.booking.join("&"),
			eventsCurrent:
				settings.db.url +
				"/" +
				settings.db.events +
				"?" +
				params.eventsCurrent.join("&"),
			eventsRepeat:
				settings.db.url +
				"/" +
				settings.db.events +
				"?" +
				params.eventsRepeat.join("&"),
		};

		Promise.all([
			fetch(urls.booking),
			fetch(urls.eventsCurrent),
			fetch(urls.eventsRepeat),
		])
			.then(function (allResponse) {
				const bookingResponse = allResponse[0];
				const eventsCurrentResponse = allResponse[1];
				const eventsRepeatResponse = allResponse[2];
				return Promise.all([
					bookingResponse.json(),
					eventsCurrentResponse.json(),
					eventsRepeatResponse.json(),
				]);
			})
			.then(function ([bookings, eventsCurrent, eventsRepeat]) {
				thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
			});
	}

	parseData(bookings, eventsCurrent, eventsRepeat) {
		const thisBooking = this;

		thisBooking.booked = {};

		for (let item of bookings) {
			thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
		}

		for (let item of eventsCurrent) {
			thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
		}

		const minDate = thisBooking.datePicker.minDate;
		const maxDate = thisBooking.datePicker.maxDate;

		for (let item of eventsRepeat) {
			if (item.repeat == "daily") {
				for (
					let loopDate = minDate;
					loopDate <= maxDate;
					loopDate = utils.addDays(loopDate, 1)
				) {
					thisBooking.makeBooked(
						utils.dateToStr(loopDate),
						item.hour,
						item.duration,
						item.table
					);
				}
			}
		}
		thisBooking.updateDOM();
	}

	makeBooked(date, hour, duration, table) {
		const thisBooking = this;

		if (typeof thisBooking.booked[date] == "undefined") {
			thisBooking.booked[date] = {};
		}

		const startHour = utils.hourToNumber(hour);

		if (typeof thisBooking.booked[date][startHour] == "undefined") {
			thisBooking.booked[date][startHour] = [];
		}

		thisBooking.booked[date][startHour].push(table);

		for (
			let hourBlock = startHour;
			hourBlock < startHour + duration;
			hourBlock += 0.5
		) {
			if (typeof thisBooking.booked[date][hourBlock] == "undefined") {
				thisBooking.booked[date][hourBlock] = [];
			}

			thisBooking.booked[date][hourBlock].push(table);
		}
	}

	updateDOM() {
		const thisBooking = this;

		thisBooking.date = thisBooking.datePicker.value;
		thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

		let allAvailable = false;

		if (
			typeof thisBooking.booked[thisBooking.date] == "undefined" ||
			typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
				"undefined"
		) {
			allAvailable = true;
		}

		for (let table of thisBooking.dom.tables) {
			let tableId = table.getAttribute(settings.booking.tableIdAttribute);
			if (!isNaN(tableId)) {
				tableId = parseInt(tableId);
			}

			if (
				!allAvailable &&
				thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
			) {
				table.classList.add(classNames.booking.tableBooked);
			} else {
				table.classList.remove(classNames.booking.tableBooked);
			}
		}
	}

	render(element) {
		const thisBooking = this;

		thisBooking.dom = {};
		thisBooking.dom.wrapper = element;
		thisBooking.dom.wrapper.innerHTML = templates.bookingWidget();

		thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
			select.booking.peopleAmount
		);
		thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
			select.booking.hoursAmount
		);
		thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
			select.widgets.datePicker.wrapper
		);
		thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
			select.widgets.hourPicker.wrapper
		);
		thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
			select.booking.tables
		);
		thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
			select.cart.phone
		);
		thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(
			select.cart.address
		);
	}

	initWidgets() {
		const thisBooking = this;

		thisBooking.peopleAmountWidget = new AmountWidget(
			thisBooking.dom.peopleAmount
		);
		thisBooking.hoursAmountWidget = new AmountWidget(
			thisBooking.dom.hoursAmount
		);
		thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

		thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

		thisBooking.dom.wrapper.addEventListener("updated", function () {
			thisBooking.updateDOM();
		});

		thisBooking.dom.peopleAmount.addEventListener("updated", function () {});

		thisBooking.dom.hoursAmount.addEventListener("updated", function () {});

		thisBooking.dom.datePicker.addEventListener("updated", function () {});

		thisBooking.dom.hourPicker.addEventListener("updated", function () {});
	}

	handleTableSelection() {
		const thisBooking = this;

		thisBooking.dom.wrapper.addEventListener("click", function (event) {
			const clickedTable = event.target.closest(select.booking.tables);
			if (!clickedTable) return;

			if (clickedTable.classList.contains(classNames.booking.tableBooked)) {
				return;
			}

			if (clickedTable.classList.contains(classNames.booking.tableSelected)) {
				clickedTable.classList.remove(classNames.booking.tableSelected);
			} else {
				thisBooking.dom.tables.forEach((table) => {
					table.classList.remove(classNames.booking.tableSelected);
				});
				clickedTable.classList.add(classNames.booking.tableSelected);
			}
		});
	}

	changeTime() {
		const thisBooking = this;
		thisBooking.hourPicker.dom.input.addEventListener("input", function () {
			thisBooking.timeChanged = true;
			thisBooking.dom.tables.forEach((table) => {
				table.classList.remove(classNames.booking.tableSelected);
			});
		});
		thisBooking.datePicker.dom.input.addEventListener("input", function () {
			thisBooking.timeChanged = true;
			thisBooking.dom.tables.forEach((table) => {
				table.classList.remove(classNames.booking.tableSelected);
			});
		});
		thisBooking.dom.hoursAmount.addEventListener("updated", function () {
			thisBooking.timeChanged = true;
			thisBooking.dom.tables.forEach((table) => {
				table.classList.remove(classNames.booking.tableSelected);
			});
		});
		thisBooking.dom.peopleAmount.addEventListener("updated", function () {
			thisBooking.timeChanged = true;
			thisBooking.dom.tables.forEach((table) => {
				table.classList.remove(classNames.booking.tableSelected);
			});
		});
		this.handleTableSelection();
	}

	getStarters() {
		const starters = [];

		const waterCheckbox = document.getElementById("water");
		const breadCheckbox = document.getElementById("bread");

		if (waterCheckbox.checked) {
			starters.push("water");
		}
		if (breadCheckbox.checked) {
			starters.push("bread");
		}
		console.log("startery:", starters);
		return starters;
	}

	sendBooking() {
		const thisBooking = this;
		this.getStarters();
		const url = settings.db.url + "/" + settings.db.bookings;
		const payload = {
			date: utils.dateToStr(new Date(thisBooking.datePicker.value)),
			hour: thisBooking.hourPicker.value,
			table: thisBooking.getSelectedTable(),
			duration: parseInt(thisBooking.hoursAmountWidget.value),
			ppl: parseInt(thisBooking.peopleAmountWidget.value),
			starters: thisBooking.getStarters(),
			phone: thisBooking.dom.phone.value,
			address: thisBooking.dom.address.value,
		};
		console.log(payload);

		//Send payload on server

		console.log(JSON.stringify(payload));
		fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("reservation", data);
				thisBooking.makeBooked(
					payload.date,
					payload.hour,
					payload.duration,
					parseInt(payload.table)
				);
			})
			.catch((error) => {
				console.error("error", error);
			});
	}

	getSelectedTable() {
		const thisBooking = this;
		for (let table of thisBooking.dom.tables) {
			if (table.classList.contains(classNames.booking.tableSelected)) {
				return table.getAttribute(settings.booking.tableIdAttribute);
			}
		}
		return null;
	}

	initBookingForm() {
		const thisBooking = this;
		thisBooking.dom.wrapper
			.querySelector("form")
			.addEventListener("submit", function (event) {
				event.preventDefault();
				thisBooking.sendBooking();
			});
	}
}
export default Booking;
