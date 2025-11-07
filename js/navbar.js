document.addEventListener('DOMContentLoaded', () => {
	const navbar = document.querySelector('[data-navbar]');
	if (!navbar) {
		return;
	}

	const toggle = navbar.querySelector('[data-navbar-toggle]');
	const menu = navbar.querySelector('[data-navbar-menu]');
	const focusableSelectors = 'a[href], button:not([disabled]), [tabindex="0"]';

	const closeMenu = () => {
		if (!navbar.classList.contains('is-open')) {
			return;
		}
		navbar.classList.remove('is-open');
		toggle?.setAttribute('aria-expanded', 'false');
	};

	const handleScroll = () => {
		const hasScrolled = window.scrollY > 24;
		navbar.classList.toggle('is-scrolled', hasScrolled);
	};

	handleScroll();

	let scrollTicking = false;
	window.addEventListener('scroll', () => {
		if (!scrollTicking) {
			window.requestAnimationFrame(() => {
				handleScroll();
				scrollTicking = false;
			});
			scrollTicking = true;
		}
	});

	if (toggle && menu) {
		toggle.addEventListener('click', () => {
			const isOpen = navbar.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
			if (isOpen) {
				const firstFocusable = menu.querySelector(focusableSelectors);
				firstFocusable?.focus();
			}
		});

		menu.addEventListener('click', (event) => {
			const target = event.target;
			if (target instanceof HTMLElement && target.closest('a')) {
				closeMenu();
			}
		});

		const scrim = navbar.querySelector('[data-navbar-scrim]');
		scrim?.addEventListener('click', closeMenu);

		window.addEventListener('resize', () => {
			if (window.innerWidth >= 980) {
				closeMenu();
			}
		});

		document.addEventListener('keyup', (event) => {
			if (event.key === 'Escape') {
				closeMenu();
				toggle?.focus();
			}
		});
	}
});
