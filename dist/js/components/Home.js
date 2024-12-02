class Home {
	constructor() {}
}

const homepage = document.querySelector('a[href="#home"]');
const orderpage = document.querySelector('a[href="#order"]');
const orderButton = document.getElementById("orderOnlineButton");
const bookingButton = document.getElementById("bookTableButton");
const bookingpage = document.querySelector('a[href="#booking"]');
const homeWrapper = document.querySelector(".home-wrapper");

function handleClick() {
	homeWrapper.style.display = "none";
}
orderpage.addEventListener("click", handleClick);
orderButton.addEventListener("click", handleClick);
bookingButton.addEventListener("click", handleClick);
bookingpage.addEventListener("click", handleClick);

homepage.addEventListener("click", function () {
	homeWrapper.style.display = "block";
});

export default Home;
