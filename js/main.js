/* ============================================================
   GRAPHITE AURORA — motion engine
   Spatial Glass portfolio · Bruno Mello
   ============================================================ */
(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    var spatial = fine && !reduce; // pointer-driven 3D effects allowed

    var on = function (el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt || false); };
    var $ = function (s, c) { return (c || doc).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
    var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
    var lerp = function (a, b, t) { return a + (b - a) * t; };

    doc.addEventListener('DOMContentLoaded', init);

    function init() {
        $('#year').textContent = new Date().getFullYear();
        buildStars();
        loaderChoreography();
        setupTheme();
        setupNav();
        setupReveal();
        setupStats();
        setupTimeline();
        setupConstellation();
        setupContact();
        setTranslateZ();
        if (spatial) {
            setupCursor();
            setupTilt();
            setupMagnetic();
            setupRackFocus();
            setupGlassSpecular();
        }
        if (!reduce) setupTypewriter(); else $('#roleText').textContent = 'Senior iOS Engineer & AI';
        startRAF();
        on(window, 'scroll', kick, { passive: true });
        on(window, 'resize', function () { dirty = true; kick(); }, { passive: true });
        on(doc, 'visibilitychange', function () { if (!doc.hidden) startRAF(); });
    }

    /* ---------- Star field ---------- */
    function buildStars() {
        var host = $('#stars'); if (!host) return;
        var n = window.innerWidth < 768 ? 26 : 52;
        var frag = doc.createDocumentFragment();
        for (var i = 0; i < n; i++) {
            var s = doc.createElement('span');
            s.className = 'star';
            var size = (Math.random() * 2 + 1).toFixed(2);
            s.style.width = size + 'px';
            s.style.height = size + 'px';
            s.style.left = (Math.random() * 100).toFixed(2) + '%';
            s.style.top = (Math.random() * 100).toFixed(2) + '%';
            s.style.setProperty('--tw', (Math.random() * 5 + 4).toFixed(1) + 's');
            s.style.setProperty('--ri', (Math.random() * 40 + 50).toFixed(0) + 's');
            s.style.animationDelay = '-' + (Math.random() * 9).toFixed(1) + 's, -' + (Math.random() * 60).toFixed(0) + 's';
            frag.appendChild(s);
        }
        host.appendChild(frag);
    }

    /* ---------- Loader : Lens Calibration ---------- */
    function loaderChoreography() {
        var loader = $('#loader');
        var done = function () {
            root.classList.remove('is-loading');
            doc.body.classList.add('is-ready');
            if (loader) loader.classList.add('done');
            setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 1100);
        };
        if (reduce) { setTimeout(done, 200); return; }
        // Reveal the world once everything has had a beat to settle.
        var t = 1500;
        if (doc.readyState === 'complete') setTimeout(done, t);
        else on(window, 'load', function () { setTimeout(done, 600); });
        // hard fallback
        setTimeout(done, 3200);
    }

    /* ---------- Theme ---------- */
    function setupTheme() {
        var btn = $('#themeToggle');
        if (!btn) return;
        var sync = function (theme) {
            var dark = theme === 'dark';
            var icon = btn.querySelector('i');
            if (icon) icon.className = dark ? 'fas fa-moon' : 'fas fa-sun';
            btn.setAttribute('aria-pressed', dark ? 'false' : 'true');
            btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
            var meta = $('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', dark ? '#0E0F13' : '#EEF0F4');
        };
        sync(root.getAttribute('data-theme') || 'dark');
        on(btn, 'click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
            sync(next);
            drawConstellation();
        });
    }

    /* ---------- Navigation ---------- */
    function setupNav() {
        var nav = $('#nav');
        var links = $$('.nav-link');
        var pill = $('#navPill');
        var linksWrap = $('#navLinks');
        var menuToggle = $('#menuToggle');

        // scrolled state handled in RAF (reads scrollState)

        // smooth scroll with fixed-nav offset
        $$('a[href^="#"]').forEach(function (a) {
            on(a, 'click', function (e) {
                var id = a.getAttribute('href');
                if (id.length < 2) return;
                var target = $(id);
                if (!target) return;
                e.preventDefault();
                var y = target.getBoundingClientRect().top + window.pageYOffset - 88;
                window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
                closeMenu();
            });
        });

        // FLIP pill
        function movePill(link) {
            if (!pill || !link || window.innerWidth <= 768) return;
            pill.style.width = link.offsetWidth + 'px';
            pill.style.setProperty('--pill-x', link.offsetLeft + 'px');
            pill.style.opacity = '1';
        }
        var activeLink = links[0];
        links.forEach(function (l) {
            on(l, 'pointerenter', function () { movePill(l); });
        });
        on(linksWrap, 'pointerleave', function () { if (activeLink) movePill(activeLink); else if (pill) pill.style.opacity = '0'; });

        // active link via IO
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var id = en.target.id;
                links.forEach(function (l) {
                    var match = l.getAttribute('href') === '#' + id;
                    l.classList.toggle('active', match);
                    if (match) { l.setAttribute('aria-current', 'page'); activeLink = l; movePill(l); }
                    else l.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('section[id]').forEach(function (s) { io.observe(s); });

        // mobile menu
        on(menuToggle, 'click', function () { linksWrap.classList.contains('open') ? closeMenu() : openMenu(); });
        on(doc, 'keydown', function (e) { if (e.key === 'Escape') closeMenu(true); });
        on(doc, 'click', function (e) { if (!nav.contains(e.target)) closeMenu(); });
        window.addEventListener('resize', function () { if (window.innerWidth > 768) closeMenu(); });
    }
    function openMenu() {
        var lw = $('#navLinks'), mt = $('#menuToggle');
        lw.classList.add('open'); mt.classList.add('active');
        mt.setAttribute('aria-expanded', 'true'); mt.setAttribute('aria-label', 'Close menu');
    }
    function closeMenu(restoreFocus) {
        var lw = $('#navLinks'), mt = $('#menuToggle');
        if (!lw) return;
        var wasOpen = lw.classList.contains('open');
        lw.classList.remove('open'); mt.classList.remove('active');
        mt.setAttribute('aria-expanded', 'false'); mt.setAttribute('aria-label', 'Open menu');
        // keep keyboard users oriented: send focus back to the toggle on Escape
        if (wasOpen && restoreFocus) mt.focus();
    }

    /* ---------- Reveal on scroll ---------- */
    function setupReveal() {
        var els = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        if (reduce) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var el = en.target;
                var d = parseFloat(el.getAttribute('data-d') || '0');
                el.style.transitionDelay = (d * 0.08) + 's';
                el.classList.add('is-in');
                io.unobserve(el);
                // drop will-change after settle
                setTimeout(function () { el.style.willChange = 'auto'; el.style.transitionDelay = ''; }, 900 + d * 80);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
        els.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Stats counters ---------- */
    function setupStats() {
        var nums = $$('.stat-num');
        var run = function (el) {
            var target = parseInt(el.getAttribute('data-count'), 10) || 0;
            var suffix = el.getAttribute('data-suffix') || '';
            if (reduce) { el.textContent = target + suffix; return; }
            var start = performance.now(), dur = 1600;
            var step = function (now) {
                var p = clamp((now - start) / dur, 0, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
        }, { threshold: 0.6 });
        nums.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Timeline pour + beads ---------- */
    var timelineState = null;
    function setupTimeline() {
        var tl = $('#timeline');
        var fill = $('#timelineFill');
        if (!tl || !fill) return;
        var beads = $$('.tl-item', tl);
        timelineState = { tl: tl, fill: fill, beads: beads };
    }
    function updateTimeline() {
        if (!timelineState) return;
        var tl = timelineState.tl;
        var rect = tl.getBoundingClientRect();
        var vh = window.innerHeight;
        var anchor = vh * 0.5;
        var prog = clamp((anchor - rect.top) / Math.max(rect.height, 1), 0, 1);
        timelineState.fill.style.setProperty('--fill', (prog * 100) + '%');
        timelineState.beads.forEach(function (b) {
            var br = b.getBoundingClientRect();
            var bc = (br.top + 8 - rect.top) / Math.max(rect.height, 1);
            b.classList.toggle('lit', prog >= bc - 0.01);
        });
    }

    /* ---------- Constellation links ---------- */
    function setupConstellation() {
        drawConstellation();
        window.addEventListener('resize', debounce(drawConstellation, 150));
    }
    function drawConstellation() {
        $$('.constellation').forEach(function(box) {
            var svg = $('svg', box);
            if (!svg || !box) return;
            var nodes = $$('.edu', box);
            if (window.innerWidth <= 768 || nodes.length < 2) { svg.innerHTML = ''; return; }
            var br = box.getBoundingClientRect();
            svg.setAttribute('viewBox', '0 0 ' + br.width + ' ' + br.height);
            var pts = nodes.map(function (n) {
                var r = n.getBoundingClientRect();
                return { x: r.left - br.left + r.width / 2, y: r.top - br.top + r.height / 2 };
            });
            var lines = '';
            for (var i = 0; i < pts.length - 1; i++) {
                lines += '<line x1="' + pts[i].x + '" y1="' + pts[i].y + '" x2="' + pts[i + 1].x + '" y2="' + pts[i + 1].y + '"/>';
            }
            svg.innerHTML = lines;
        });
    }

    /* ---------- translateZ from data-tz ---------- */
    function setTranslateZ() {
        $$('.tz[data-tz]').forEach(function (el) {
            el.style.setProperty('--tz', el.getAttribute('data-tz') + 'px');
        });
    }

    /* ---------- Cursor light + halo (RAF-driven) ---------- */
    var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, has: false };
    var lightPos = { x: pointer.x, y: pointer.y };
    var haloPos = { x: pointer.x, y: pointer.y };
    var cursorLight, cursorHalo;
    function setupCursor() {
        cursorLight = $('#cursorLight');
        cursorHalo = $('#cursorHalo');
        on(doc, 'pointermove', function (e) {
            pointer.x = e.clientX; pointer.y = e.clientY;
            if (!pointer.has) {
                // first real move — snap visuals to the pointer, then reveal them
                pointer.has = true;
                lightPos.x = haloPos.x = e.clientX;
                lightPos.y = haloPos.y = e.clientY;
                doc.body.classList.add('pointer-active');
            }
            kick(); // re-start the loop if it idled out
        }, { passive: true });
        on(doc, 'pointerdown', function () { if (cursorHalo) cursorHalo.classList.add('is-down'); });
        on(doc, 'pointerup', function () { if (cursorHalo) cursorHalo.classList.remove('is-down'); });
        // soft halo over interactive things
        var soft = 'a, button, .btn, .chip, [data-tilt], input, textarea, .nav-link, .contact-row, .feat';
        $$(soft).forEach(function (el) {
            on(el, 'pointerenter', function () { if (cursorHalo) cursorHalo.classList.add('is-soft'); });
            on(el, 'pointerleave', function () { if (cursorHalo) cursorHalo.classList.remove('is-soft'); });
        });
    }

    /* ---------- Tilt + internal depth ---------- */
    function setupTilt() {
        $$('[data-tilt]').forEach(function (card) {
            var max = parseFloat(card.getAttribute('data-tilt-max') || '6');
            var r = null; // cached pre-transform rect, captured on enter
            on(card, 'pointerenter', function () { r = card.getBoundingClientRect(); });
            on(card, 'pointermove', function (e) {
                if (!r || !card.classList.contains('is-in')) return; // don't fight the entrance reveal
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transition = 'transform 0s';
                card.style.transform = 'perspective(1200px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg)';
            });
            on(card, 'pointerleave', function () {
                r = null;
                card.style.transition = 'transform .6s var(--ease-glass)';
                card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
            });
        });
    }

    /* ---------- Magnetic CTAs ---------- */
    function setupMagnetic() {
        $$('[data-magnetic]').forEach(function (el) {
            var strength = el.classList.contains('btn') ? 0.32 : 0.25;
            var r = null; // cached on enter, before the element slides under translate
            on(el, 'pointerenter', function () { r = el.getBoundingClientRect(); });
            on(el, 'pointermove', function (e) {
                if (!r) return;
                var x = e.clientX - r.left - r.width / 2;
                var y = e.clientY - r.top - r.height / 2;
                el.style.transform = 'translate(' + (x * strength).toFixed(2) + 'px,' + (y * strength).toFixed(2) + 'px)';
            });
            on(el, 'pointerleave', function () { r = null; el.style.transform = 'translate(0,0)'; });
            on(el, 'pointerdown', function (e) { ripple(el, e); });
        });
    }
    function ripple(el, e) {
        if (!el.classList.contains('btn')) return;
        var r = el.getBoundingClientRect();
        var d = Math.max(r.width, r.height);
        var s = doc.createElement('span');
        s.className = 'ripple';
        s.style.width = s.style.height = d + 'px';
        s.style.left = (e.clientX - r.left - d / 2) + 'px';
        s.style.top = (e.clientY - r.top - d / 2) + 'px';
        el.appendChild(s);
        setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 650);
    }

    /* ---------- Rack focus ---------- */
    function setupRackFocus() {
        var groups = {};
        $$('[data-focus-group]').forEach(function (el) {
            var g = el.getAttribute('data-focus-group');
            (groups[g] = groups[g] || []).push(el);
        });
        Object.keys(groups).forEach(function (g) {
            var members = groups[g];
            members.forEach(function (el) {
                var enter = function () { members.forEach(function (m) { if (m !== el) m.classList.add('is-dimmed'); }); };
                var leave = function () { members.forEach(function (m) { m.classList.remove('is-dimmed'); }); };
                on(el, 'pointerenter', enter);
                on(el, 'pointerleave', leave);
                on(el, 'focusin', enter);
                on(el, 'focusout', leave);
            });
        });
    }

    /* ---------- Glass specular tracking ---------- */
    function setupGlassSpecular() {
        on(doc, 'pointermove', function (e) {
            var g = e.target.closest && e.target.closest('.glass');
            if (!g) return;
            var r = g.getBoundingClientRect();
            g.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
            g.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
        }, { passive: true });
    }

    /* ---------- Typewriter ---------- */
    function setupTypewriter() {
        var el = $('#roleText');
        if (!el) return;
        var roles = ['Senior iOS Engineer & AI', 'Swift, SwiftUI & Vision Pro developer', 'Spatial computing explorer', 'AI + Machine Learning practitioner', 'Clean Architecture advocate'];
        var ri = 0, ci = 0, deleting = false;
        function tick() {
            var word = roles[ri];
            el.textContent = word.slice(0, ci);
            if (!deleting && ci < word.length) { ci++; setTimeout(tick, 62); }
            else if (!deleting && ci === word.length) { deleting = true; setTimeout(tick, 1700); }
            else if (deleting && ci > 0) { ci--; setTimeout(tick, 28); }
            else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, 320); }
        }
        setTimeout(tick, 1300);
    }

    /* ---------- Contact form ---------- */
    function setupContact() {
        var form = $('#contactForm');
        if (!form) return;
        var fields = ['name', 'email', 'subject', 'message'].map(function (id) { return $('#' + id); });
        var clearInvalid = function () { fields.forEach(function (f) { if (f) f.removeAttribute('aria-invalid'); }); };
        on(form, 'input', clearInvalid);
        var fail = function (msg, bad) {
            clearInvalid();
            bad.forEach(function (f) { if (f) f.setAttribute('aria-invalid', 'true'); });
            if (bad[0]) bad[0].focus();
            notify(msg, 'error');
        };
        on(form, 'submit', function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var name = (data.get('name') || '').trim();
            var email = (data.get('email') || '').trim();
            var subject = (data.get('subject') || '').trim();
            var message = (data.get('message') || '').trim();
            var empties = [];
            if (!name) empties.push($('#name'));
            if (!email) empties.push($('#email'));
            if (!subject) empties.push($('#subject'));
            if (!message) empties.push($('#message'));
            if (empties.length) return fail('Please fill in all fields.', empties);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.', [$('#email')]);
            clearInvalid();
            var btn = form.querySelector('button[type="submit"]');
            var label = btn.querySelector('span');
            var orig = label.textContent;
            label.textContent = 'Sending…'; btn.disabled = true;
            setTimeout(function () {
                notify('Thanks, ' + name + '! I\'ll get back to you soon.', 'success');
                form.reset(); label.textContent = orig; btn.disabled = false;
            }, 1400);
        });
    }
    function notify(msg, type) {
        $$('.toast').forEach(function (t) { t.remove(); });
        var t = doc.createElement('div');
        t.className = 'toast toast--' + type;
        t.setAttribute('role', type === 'error' ? 'alert' : 'status');
        t.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        t.innerHTML = '<span class="toast-ic">' + (type === 'success' ? '✓' : '!') + '</span><span>' + msg + '</span>';
        t.style.cssText = 'position:fixed;top:88px;right:20px;z-index:100001;display:flex;align-items:center;gap:.7rem;' +
            'padding:.9rem 1.2rem;border-radius:16px;color:var(--text-primary);font-weight:500;max-width:min(360px,calc(100vw - 40px));' +
            'background:var(--glass-reg-bg);-webkit-backdrop-filter:blur(28px) saturate(185%);backdrop-filter:blur(28px) saturate(185%);' +
            'box-shadow:inset 0 1px 0 0 var(--glass-border-lit),var(--shadow-contact),var(--shadow-lift);' +
            'border:1px solid var(--glass-border);transform:translateX(130%);transition:transform .55s var(--spring-soft);';
        var ic = t.querySelector('.toast-ic');
        ic.style.cssText = 'display:grid;place-items:center;width:24px;height:24px;border-radius:50%;font-weight:700;flex:0 0 auto;' +
            'color:#06070A;background:' + (type === 'success' ? 'var(--accent)' : 'var(--ember)') + ';';
        doc.body.appendChild(t);
        requestAnimationFrame(function () { t.style.transform = 'translateX(0)'; });
        setTimeout(function () { t.style.transform = 'translateX(130%)'; setTimeout(function () { if (t.parentNode) t.remove(); }, 600); }, 4600);
    }

    /* ---------- Main RAF loop (dirty-driven: idles when nothing moves) ---------- */
    var rafId = null;
    var scrollY = window.pageYOffset, lastScrollY = -1;
    var lastPx = -1, lastPy = -1, dirty = true;
    var nav = null, scrollProgress = null, envAurora = null, envStars = null;

    function kick() { if (!rafId) startRAF(); }
    function startRAF() {
        nav = nav || $('#nav');
        scrollProgress = scrollProgress || $('#scrollProgress');
        envAurora = envAurora || $('.env-aurora');
        envStars = envStars || $('.env-stars');
        if (rafId) return;
        dirty = true;
        rafId = requestAnimationFrame(frame);
    }
    function frame() {
        if (doc.hidden) { rafId = null; return; }
        scrollY = window.pageYOffset;
        var scrolled = scrollY !== lastScrollY;

        // scroll-derived work — only when the page actually moved (no idle reflow)
        if (scrolled || dirty) {
            if (nav) nav.classList.toggle('scrolled', scrollY > 40);
            if (scrollProgress) {
                var h = doc.documentElement.scrollHeight - window.innerHeight;
                scrollProgress.style.setProperty('--sp', h > 0 ? clamp(scrollY / h, 0, 1) : 0);
            }
            updateTimeline();
            lastScrollY = scrollY;
        }

        var busy = false;
        if (spatial) {
            var moved = pointer.x !== lastPx || pointer.y !== lastPy;
            if (!reduce && (scrolled || dirty || moved)) {
                if (envAurora) envAurora.style.transform = 'translate3d(' + (pointerOffsetX() * 14).toFixed(1) + 'px,' + (scrollY * 0.04 + pointerOffsetY() * 10).toFixed(1) + 'px,0)';
                if (envStars) envStars.style.transform = 'translate3d(0,' + (scrollY * 0.09).toFixed(1) + 'px,0)';
            }
            lastPx = pointer.x; lastPy = pointer.y;
            if (cursorLight && cursorHalo) {
                lightPos.x = lerp(lightPos.x, pointer.x, 0.12);
                lightPos.y = lerp(lightPos.y, pointer.y, 0.12);
                haloPos.x = lerp(haloPos.x, pointer.x, 0.28);
                haloPos.y = lerp(haloPos.y, pointer.y, 0.28);
                cursorLight.style.setProperty('--clx', lightPos.x + 'px');
                cursorLight.style.setProperty('--cly', lightPos.y + 'px');
                cursorHalo.style.setProperty('--hx', haloPos.x + 'px');
                cursorHalo.style.setProperty('--hy', haloPos.y + 'px');
                var dist = Math.abs(lightPos.x - pointer.x) + Math.abs(lightPos.y - pointer.y) +
                           Math.abs(haloPos.x - pointer.x) + Math.abs(haloPos.y - pointer.y);
                if (dist > 0.5 || moved) busy = true;
            }
        }

        dirty = false;
        if (scrolled || busy) rafId = requestAnimationFrame(frame);
        else rafId = null; // idle — re-kicked by scroll / pointermove / resize / visibility
    }
    function pointerOffsetX() { return spatial && pointer.has ? (pointer.x / window.innerWidth - 0.5) : 0; }
    function pointerOffsetY() { return spatial && pointer.has ? (pointer.y / window.innerHeight - 0.5) : 0; }

    /* ---------- utils ---------- */
    function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

    // Console signature
    try {
        console.log('%c GRAPHITE AURORA ', 'background:linear-gradient(135deg,#7FB2FF,#5BE9FF);color:#06070A;font-weight:700;padding:8px 16px;border-radius:8px;font-size:13px;');
        console.log('%cBruno Mello · Senior iOS Engineer → Spatial Computing', 'color:#9AA4B2;font-size:12px;');
    } catch (e) {}
})();
