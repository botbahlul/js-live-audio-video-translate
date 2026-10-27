// backend_player.js
// Pemutar yang memakai backend webserver.py (/resolve + /proxy, berbasis yt-dlp/streamlink).
// Muat file ini SEBELUM js/index.js.

var HLSJS_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1';
var _backend_hls = null;
var _script_promises = {};

function load_script_once(src) {
	if (!_script_promises[src]) {
		_script_promises[src] = new Promise(function(resolve, reject) {
			var s = document.createElement('script');
			s.src = src;
			s.onload = resolve;
			s.onerror = function() {
				delete _script_promises[src];
				reject(new Error('gagal memuat ' + src));
			};
			document.head.appendChild(s);
		});
	}
	return _script_promises[src];
}

// embed() lama menghapus #my_video dari DOM saat memutar YouTube, jadi buat ulang kalau hilang.
function ensure_video_element() {
	var v = document.querySelector('#my_video');
	if (!v) {
		v = document.createElement('video');
		v.id = 'my_video';
		v.className = 'video-js vjs-default-skin';
		v.controls = true;
		v.preload = 'auto';
		var holder = document.querySelector('.video_container .video') || document.body;
		holder.appendChild(v);
	}
	if (!document.querySelector('#video_source')) {
		var s = document.createElement('source');
		s.id = 'video_source';
		v.appendChild(s);
	}
	return v;
}

// Hentikan pemutaran sebelumnya (hls.js, atribut src yang dipasang hls.js, dsb.)
function stop_backend_player() {
	if (_backend_hls) {
		try { _backend_hls.destroy(); } catch (e) {}
		_backend_hls = null;
	}
	var v = document.querySelector('#my_video');
	if (v) {
		v.pause();
		if (v.hasAttribute('src')) {
			v.removeAttribute('src');
			v.load();
		}
	}
}

function hide_iframe() {
	var f = document.querySelector('#my_iframe');
	if (f) {
		f.style.display = 'none';
		if (f.getAttribute('src')) f.src = 'about:blank';
	}
}

// info = respons /resolve: {url: '/proxy?id=...', kind: 'hls' | 'file', ...}
function play_in_video_element(info) {
	hide_iframe();
	var v = ensure_video_element();
	v.style.display = 'block';
	v.style.width = '100%';
	v.style.height = '100%';
	var src_el = document.querySelector('#video_source');

	function start() {
		var p = v.play();
		if (p && p.catch) {
			p.catch(function(e) { console.warn('autoplay diblokir browser, tekan tombol play:', e); });
		}
	}

	if (info.kind === 'hls') {
		if (v.canPlayType('application/vnd.apple.mpegurl')) {   // Safari, dan Chrome versi baru
			src_el.src = info.url;
			src_el.type = 'application/x-mpegURL';
			v.load();
			start();
			return Promise.resolve();
		}
		return load_script_once(HLSJS_URL).then(function() {
			if (!window.Hls || !Hls.isSupported()) throw new Error('browser tidak mendukung HLS (MediaSource)');
			_backend_hls = new Hls();
			_backend_hls.on(Hls.Events.ERROR, function(ev, d) {
				if (d.fatal) console.error('hls.js fatal:', d.type, d.details);
			});
			_backend_hls.on(Hls.Events.MANIFEST_PARSED, start);
			_backend_hls.loadSource(info.url);
			_backend_hls.attachMedia(v);
		});
	}

	src_el.src = info.url;
	src_el.removeAttribute('type');
	v.load();
	start();
	return Promise.resolve();
}

// engine: 'auto' (yt-dlp lalu streamlink) | 'yt-dlp' | 'streamlink'
function embed_via_backend(page_url, engine) {
	engine = engine || 'auto';
	var btn = document.querySelector('#embed_button');
	var old_label = btn ? btn.textContent : '';
	if (btn) { btn.disabled = true; btn.textContent = 'Resolving...'; }

	return fetch('/resolve?engine=' + encodeURIComponent(engine) + '&url=' + encodeURIComponent(page_url))
		.then(function(r) {
			return r.json().catch(function() { return { ok: false, error: 'HTTP ' + r.status }; });
		})
		.then(function(info) {
			if (!info.ok) throw new Error(info.error || 'error tidak diketahui');
			console.log('resolved via', info.engine, info);
			return play_in_video_element(info);
		})
		.catch(function(err) {
			console.error('embed_via_backend:', err);
			alert('Gagal memutar: ' + err.message);
		})
		.then(function() {
			if (btn) { btn.disabled = false; btn.textContent = old_label; }
			if (typeof maintain_video_size === 'function') maintain_video_size();
		});
}
