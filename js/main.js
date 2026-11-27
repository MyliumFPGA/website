(function () {
    'use strict';

    var root = document.documentElement;
    var nav = document.getElementById('mainNav');
    var toggle = nav.querySelector('.nav__toggle');

    // Mobile menu
    function setMenu(open) {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    }
    toggle.addEventListener('click', function () {
        setMenu(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('.nav__menu a').forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            setMenu(false);
            toggle.focus();
        }
    });

    // Solid navigation after scrolling, and highlight of the current section
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav__links a'));
    function onScroll() {
        nav.classList.toggle('is-scrolled', window.scrollY > 8);
        var current = null;
        links.forEach(function (link) {
            var hash = link.getAttribute('href');
            var section = hash.charAt(0) === '#' && document.querySelector(hash);
            if (section && section.getBoundingClientRect().top < window.innerHeight * 0.4) {
                current = link;
            }
        });
        links.forEach(function (link) {
            if (link === current) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Reveal on scroll. Content stays visible if this script or the API is unavailable.
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px' });
        root.classList.add('js-reveal');
        document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
    }

    // A mailto link does nothing if no mail app is set up, so also show the address
    var mail = document.querySelector('[data-mail]');
    var fallback = document.querySelector('.contact__fallback');
    if (mail && fallback) {
        mail.addEventListener('click', function () { fallback.hidden = false; });
        var copy = fallback.querySelector('[data-copy]');
        copy.addEventListener('click', function () {
            function failed() { copy.textContent = 'Select and copy'; }
            if (!navigator.clipboard) { failed(); return; }
            navigator.clipboard.writeText(copy.dataset.copy).then(function () {
                copy.textContent = 'Copied';
            }, failed);
        });
    }

    // Cookie consent
    var banner = document.getElementById('consent');
    if (banner) {
        var KEY = 'mylium-consent';
        var stored = null;
        try { stored = localStorage.getItem(KEY); } catch (e) {}
        banner.hidden = stored !== null;

        banner.querySelectorAll('[data-consent]').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.dataset.consent;
                try { localStorage.setItem(KEY, value); } catch (e) {}
                if (window.gtag) {
                    window.gtag('consent', 'update', { analytics_storage: value });
                }
                if (value === 'denied') {
                    // Remove analytics cookies set after an earlier "Accept"
                    document.cookie.split(';').forEach(function (cookie) {
                        var name = cookie.split('=')[0].trim();
                        if (name.indexOf('_ga') !== 0) { return; }
                        var host = location.hostname.replace(/^www\./, '');
                        ['', '; domain=' + host, '; domain=.' + host].forEach(function (domain) {
                            document.cookie = name + '=; Max-Age=0; path=/' + domain;
                        });
                    });
                }
                banner.hidden = true;
            });
        });
        document.querySelectorAll('[data-consent-open]').forEach(function (button) {
            button.addEventListener('click', function () {
                banner.hidden = false;
                banner.querySelector('button').focus();
            });
        });
    }
})();
