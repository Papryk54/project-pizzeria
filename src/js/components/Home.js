function initHome() {
	const homeWrapper = document.querySelector(".home-wrapper");
	const homepageLink = document.querySelector('a[href="#home"]');
	const pageLinks = [
		document.querySelector('a[href="#order"]'),
		document.querySelector('a[href="#booking"]'),
		document.getElementById("orderOnlineButton"),
		document.getElementById("bookTableButton"),
	];

	function showHome() {
		homeWrapper.style.display = "block";
	}

	function hideHome() {
		homeWrapper.style.display = "none";
	}

	homepageLink.addEventListener("click", showHome);

	for (let link of pageLinks) {
		link.addEventListener("click", hideHome);
	}
}

export default initHome();