var recognition, recognizing, src, src_language, src_language_index, src_dialect, src_dialect_index, show_src, dst, dst_language, dst_language_index, dst_dialect, dst_dialect_index, show_dst;

document.querySelector("#embed_button").addEventListener('click', function(){
	embed();
});

document.querySelector("#select_src_language").addEventListener('change', function(){
	update_src_country()
	console.log('document.querySelector("#select_src_language") on change: src =', src);
	//console.log('document.querySelector("#select_src_language") on change: src_language_index =', src_language_index);
});

document.querySelector("#select_src_dialect").addEventListener('change', function(){
	src_dialect = document.querySelector("#select_src_dialect").value;
	//console.log('document.querySelector("#select_src_dialect") on change: document.querySelector("#select_src_dialect").value =', document.querySelector("#select_src_dialect").value);
	console.log('document.querySelector("#select_src_dialect") on change: src_dialect =', src_dialect);
});

document.querySelector("#select_dst_language").addEventListener('change', function(){
	update_dst_country();
	console.log('document.querySelector("#select_dst_language") on change: src =', src);
	//console.log('document.querySelector("#select_dst_language") on change:dst_language_index =', dst_language_index);
});

document.querySelector("#select_dst_dialect").addEventListener('change', function(){
	console.log('document.querySelector("#select_dst_dialect") on change: dst =', dst);
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	console.log('document.querySelector("#select_dst_dialect") on change: document.querySelector("#select_dst_dialect").value =', document.querySelector("#select_dst_dialect").value);
	console.log('document.querySelector("#select_dst_dialect") on change: dst_dialect =', dst_dialect);
});

document.querySelector("#checkbox_show_src").addEventListener('change', function(){
	show_src = document.querySelector("#checkbox_show_src").checked;
	console.log('document.querySelector("#checkbox_show_src") on change: show_src =', show_src);
	if (!show_src) {
			if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").style.display = 'none';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
	}
});

document.querySelector("#checkbox_show_dst").addEventListener('change', function(){
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	console.log('document.querySelector("#checkbox_show_dst") on change: show_dst =', show_dst);
	if (!show_dst) {
		if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'none';			
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
	}
});

document.querySelector("#start_button").addEventListener('click', function(){
	startButton(event);
});

var src_language =
[['Afrikaans',       ['af-ZA']],
 ['Amharic',         ['am-ET']],
 ['Armenian',        ['hy-AM']],
 ['Azerbaijani',     ['az-AZ']],
 ['Bangla',          ['bn-BD', 'Bangladesh'],
                     ['bn-IN', 'India']],
 ['Basque',          ['eu-ES']],
 ['Bulgarian',       ['bg-BG']],
 ['Catalan',         ['ca-ES']],
 ['Chinese',         ['cmn-Hans-CN', 'Chinese Mandarin (Mainland China)'],
                     ['cmn-Hans-HK', 'Chinese Mandarin (Hongkong)'],
                     ['cmn-Hant-TW', 'Chinese (Taiwan)'],
                     ['yue-Hant-HK', 'Chinese Cantonese (Hongkong)']],
 ['Croatian',        ['hr-HR']],
 ['Czech',           ['cs-CZ']],
 ['Dansk',           ['da-DK']],
 ['Deutsch',         ['de-DE']],
 ['Dutch',           ['nl-NL']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-KE', 'Kenya'],
                     ['en-TZ', 'Tanzania'],
                     ['en-GH', 'Ghana'],
                     ['en-NZ', 'New Zealand'],
                     ['en-NG', 'Nigeria'],
                     ['en-ZA', 'South Africa'],
                     ['en-PH', 'Philippines'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Filipino',        ['fil-PH']],
 ['Finland',         ['fi-FI']],
 ['French',          ['fr-FR']],
 ['Galician',        ['gl-ES']],
 ['Georgian',        ['ka-GE']],
 ['Greek',           ['el-GR']],
 ['Gujarati',        ['gu-IN']],
 ['Hindi',           ['hi-IN']],
 ['Hungarian',       ['hu-HU']],
 ['Icelandic',       ['is-IS']],
 ['Indonesian',      ['id-ID']],
 ['Italian',         ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Japanese',        ['ja-JP']],
 ['Javanese',        ['jv-ID']],
 ['Kannada',         ['kn-IN']],
 ['Khmer',           ['km-KH']],
 ['Kiswahili',       ['sw-TZ', 'Tanzania'],
                     ['sw-KE', 'Kenya']],
 ['Korean',          ['ko-KR']],
 ['Lao',             ['lo-LA']],
 ['Latvian',         ['lv-LV']],
 ['Lithuanian',      ['lt-LT']],
 ['Malay',           ['ms-MY']],
 ['Malayalam',       ['ml-IN']],
 ['Marathi',         ['mr-IN']],
 ['Nepali',          ['ne-NP']],
 ['Norwegian Bokmål',['nb-NO']],
 ['Polish',          ['pl-PL']],
 ['Portuguese',      ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Romania',         ['ro-RO']],
 ['Russian',         ['ru-RU']],
 ['Serbian',         ['sr-RS']],
 ['Sinhala',         ['si-LK']],
 ['Slovene',         ['sl-SI']],
 ['Slovak',          ['sk-SK']],
 ['Spanish',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Sundanese',       ['su-ID']],
 ['Swedish',         ['sv-SE'],
                     ['sw-KE', 'Kenya']],
 ['Tamil',           ['ta-IN', 'India'],
                     ['ta-SG', 'Singapore'],
                     ['ta-LK', 'Sri Lanka'],
                     ['ta-MY', 'Malaysia']],
 ['Telugu',          ['te-IN']],
 ['Thai',            ['th-TH']],
 ['Turkish',         ['tr-TR']],
 ['Urdu',            ['ur-PK', 'Pakistan'],
                     ['ur-IN', 'India']],
 ['Vietnamese',      ['vi-VN']],
 ['Ukrainian',       ['uk-UA']],
 ['Zulu',            ['zu-ZA']]];

 
for (var i = 0; i < src_language.length; i++) {
    document.querySelector("#select_src_language").options[i] = new Option(src_language[i][0], i);
}
document.querySelector("#select_src_language").selectedIndex = 25;
src_language_index = document.querySelector("#select_src_language").selectedIndex;
update_src_country();
if (src_language[src_language_index].length>2) {
	src_dialect = document.querySelector("#select_src_dialect").value;
} else {
	src_dialect = src_language[document.querySelector("#select_src_language").selectedIndex][1][0];
};
//console.log('after update_src_country(): src_dialect =', src_dialect);

function update_src_country() {
    for (var i = document.querySelector("#select_src_dialect").options.length - 1; i >= 0; i--) {
        document.querySelector("#select_src_dialect").remove(i);
    }
	//console.log('update_src_country(): document.querySelector("#select_src_language").selectedIndex =', document.querySelector("#select_src_language").selectedIndex);
    var list = src_language[document.querySelector("#select_src_language").selectedIndex];
	//console.log('src_language[document.querySelector("#select_src_language").selectedIndex]) =', src_language[document.querySelector("#select_src_language").selectedIndex]);
    for (var i = 1; i < list.length; i++) {
        document.querySelector("#select_src_dialect").options.add(new Option(list[i][1], list[i][0]));
    }
    document.querySelector("#select_src_dialect").style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    src = document.querySelector("#select_src_dialect").value.split('-')[0];
	src_language_index = document.querySelector("#select_src_language").selectedIndex;
	if (src_language[src_language_index].length>2) {
		for (var j=0;j<document.querySelector("#select_src_dialect").length;j++) {
			if (document.querySelector("#select_src_dialect")[j].value===src_dialect) {
				src_dialect_index = j;
				document.querySelector("#select_src_dialect").selectedIndex = src_dialect_index;
				break;
			}
		}
	}
	if (src_language[src_language_index].length>2) {
		src_dialect = document.querySelector("#select_src_dialect").value;
	} else {
		src_dialect = src_language[document.querySelector("#select_src_language").selectedIndex][1][0];
	};
	//console.log('update_src_country(): src_dialect =', src_dialect);
}

var dst_language =
[['Afrikaans',       ['af-ZA']],
 ['Amharic',         ['am-ET']],
 ['Armenian',        ['hy-AM']],
 ['Azerbaijani',     ['az-AZ']],
 ['Bangla',          ['bn-BD', 'Bangladesh'],
                     ['bn-IN', 'India']],
 ['Basque',          ['eu-ES']],
 ['Bulgarian',       ['bg-BG']],
 ['Catalan',         ['ca-ES']],
 ['Chinese',         ['cmn-Hans-CN', 'Chinese Mandarin (Mainland China)'],
                     ['cmn-Hans-HK', 'Chinese Mandarin (Hongkong)'],
                     ['cmn-Hant-TW', 'Chinese (Taiwan)'],
                     ['yue-Hant-HK', 'Chinese Cantonese (Hongkong)']],
 ['Croatian',        ['hr-HR']],
 ['Czech',           ['cs-CZ']],
 ['Dansk',           ['da-DK']],
 ['Deutsch',         ['de-DE']],
 ['Dutch',           ['nl-NL']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-KE', 'Kenya'],
                     ['en-TZ', 'Tanzania'],
                     ['en-GH', 'Ghana'],
                     ['en-NZ', 'New Zealand'],
                     ['en-NG', 'Nigeria'],
                     ['en-ZA', 'South Africa'],
                     ['en-PH', 'Philippines'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Filipino',        ['fil-PH']],
 ['Finland',         ['fi-FI']],
 ['French',          ['fr-FR']],
 ['Galician',        ['gl-ES']],
 ['Georgian',        ['ka-GE']],
 ['Greek',           ['el-GR']],
 ['Gujarati',        ['gu-IN']],
 ['Hindi',           ['hi-IN']],
 ['Hungarian',       ['hu-HU']],
 ['Icelandic',       ['is-IS']],
 ['Indonesian',      ['id-ID']],
 ['Italian',         ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Japanese',        ['ja-JP']],
 ['Javanese',        ['jv-ID']],
 ['Kannada',         ['kn-IN']],
 ['Khmer',           ['km-KH']],
 ['Kiswahili',       ['sw-TZ', 'Tanzania'],
                     ['sw-KE', 'Kenya']],
 ['Korean',          ['ko-KR']],
 ['Lao',             ['lo-LA']],
 ['Latvian',         ['lv-LV']],
 ['Lithuanian',      ['lt-LT']],
 ['Malay',           ['ms-MY']],
 ['Malayalam',       ['ml-IN']],
 ['Marathi',         ['mr-IN']],
 ['Nepali',          ['ne-NP']],
 ['Norwegian Bokmål',['nb-NO']],
 ['Polish',          ['pl-PL']],
 ['Portuguese',      ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Romania',         ['ro-RO']],
 ['Russian',         ['ru-RU']],
 ['Serbian',         ['sr-RS']],
 ['Sinhala',         ['si-LK']],
 ['Slovene',         ['sl-SI']],
 ['Slovak',          ['sk-SK']],
 ['Spanish',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Sundanese',       ['su-ID']],
 ['Swedish',         ['sv-SE'],
                     ['sw-KE', 'Kenya']],
 ['Tamil',           ['ta-IN', 'India'],
                     ['ta-SG', 'Singapore'],
                     ['ta-LK', 'Sri Lanka'],
                     ['ta-MY', 'Malaysia']],
 ['Telugu',          ['te-IN']],
 ['Thai',            ['th-TH']],
 ['Turkish',         ['tr-TR']],
 ['Urdu',            ['ur-PK', 'Pakistan'],
                     ['ur-IN', 'India']],
 ['Vietnamese',      ['vi-VN']],
 ['Ukrainian',       ['uk-UA']],
 ['Zulu',            ['zu-ZA']]];

 
for (var j = 0; j < dst_language.length; j++) {
    document.querySelector("#select_dst_language").options[j] = new Option(dst_language[j][0], j);
}

document.querySelector("#select_dst_language").selectedIndex = 14;
dst_language_index = document.querySelector("#select_dst_language").selectedIndex;
update_dst_country();
document.querySelector("#select_dst_dialect").selectedIndex = 11;
//console.log('dst_language[dst_language_index].length =', dst_language[dst_language_index].length);
if (dst_language[dst_language_index].length>2) {
	dst_dialect = document.querySelector("#select_dst_dialect").value;
} else {
	dst_dialect = dst_language[document.querySelector("#select_dst_language").selectedIndex][1][0];
};
//console.log('after update_dst_country(): dst_dialect =', dst_dialect);

function update_dst_country() {
    for (var j = document.querySelector("#select_dst_dialect").options.length - 1; j >= 0; j--) {
        document.querySelector("#select_dst_dialect").remove(j);
    }
	//console.log('update_dst_country(): document.querySelector("#select_dst_language").selectedIndex =', document.querySelector("#select_dst_language").selectedIndex);
    var list = dst_language[document.querySelector("#select_dst_language").selectedIndex];
	//console.log('dst_language[document.querySelector("#select_dst_language").selectedIndex]) =', dst_language[document.querySelector("#select_dst_language").selectedIndex]);
    for (var j = 1; j < list.length; j++) {
        document.querySelector("#select_dst_dialect").options.add(new Option(list[j][1], list[j][0]));
    }
    document.querySelector("#select_dst_dialect").style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    dst = document.querySelector("#select_dst_dialect").value.split('-')[0];
	dst_language_index = document.querySelector("#select_dst_language").selectedIndex;
	if (dst_language[dst_language_index].length>2) {
		for (var j=0;j<document.querySelector("#select_dst_dialect").length;j++) {
			if (document.querySelector("#select_dst_dialect")[j].value===dst_dialect) {
				dst_dialect_index = j;
				document.querySelector("#select_dst_dialect").selectedIndex = dst_dialect_index;
				break;
			}
		}
	}
	if (dst_language[dst_language_index].length>2) {
		dst_dialect = document.querySelector("#select_dst_dialect").value;
	} else {
		dst_dialect = dst_language[document.querySelector("#select_dst_language").selectedIndex][1][0];
	};
	//console.log('update_dst_country(): dst_dialect =', dst_dialect);
}

function youtube_parser(url){
	var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	var match = url.match(regExp);
	return (match&&match[7].length==11)? match[7] : false;
}

function embed(){
	var url = url_box.value;
	//url_box.value=url;
	if (url.includes(('https://www.youtube')||('https://youtube')||('https://youtu.be'))) {
		var ytID=youtube_parser(url);
		var src="https://www.youtube.com/embed/"+ytID;
		url = src;
		yt_iframe.src = url;
		console.log('url =', url)
	} else if (url.includes("file:")) {
		yt_iframe.src = src;
		console.log(yt_iframe.src);
	}
}

embed_button.addEventListener("click", embed);

recognizing = false;
document.querySelector("#checkbox_show_src").checked = true;
document.querySelector("#checkbox_show_dst").checked = true;
show_src = document.querySelector("#checkbox_show_src").checked;
show_dst = document.querySelector("#checkbox_show_dst").checked;

var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
	.width(0.5*window.innerWidth)
	.height(0.09*window.innerHeight)
	.resizable().draggable({
		cancel: 'text',
		start: function (){
			$('#src_textarea').focus();
		},
		stop: function (){
			$('#src_textarea').focus();
		}
	})
	.css({
		'position': 'absolute',
		'background-color': 'rgba(0,0,0,0.3)',
		'color': 'yellow',
		'border': 'none',
		'display': 'block',
		'overflow': 'hidden',
		'z-index': '2147483647'
	})
	.offset({top:0.1*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})

if (!document.querySelector("#src_textarea_container")) {
	console.log('appending src_textarea_container to html body');
	src_textarea_container$.appendTo('body');
} else {
	console.log('src_textarea_container has already exist');
}

document.querySelector("#src_textarea").style.width = '100%';
document.querySelector("#src_textarea").style.height = '100%';
document.querySelector("#src_textarea").style.color = 'yellow';
document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
document.querySelector("#src_textarea").style.border = 'none';
document.querySelector("#src_textarea").style.display = 'inline-block';
document.querySelector("#src_textarea").style.overflow = 'hidden';
document.querySelector("#src_textarea").style.allow="fullscreen";
//document.querySelector("#src_textarea").style.position="relatif";

src_h0 = $('#src_textarea').height();
document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h0)+'px';
document.querySelector("#src_textarea").offsetParent.onresize = (function(){
	src_h = $('#src_textarea').height();
	document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h)+'px';
	document.querySelector("#src_textarea").style.position='absolute';
	document.querySelector("#src_textarea").style.width = '100%';
	document.querySelector("#src_textarea").style.height = '100%';
});

var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
	.width(0.5*window.innerWidth)
	.height(0.09*window.innerHeight)
	.resizable().draggable({
		cancel: 'text',
		start: function (){
			$('#dst_textarea').focus();
		},
		stop: function (){
			$('#dst_textarea').focus();
		}
	})
	.css({
		'position': 'absolute',
		'background-color': 'rgba(0,0,0,0.3)',
		'color': 'yellow',
		'border': 'none',
		'display': 'block',
		'overflow': 'hidden',
		'z-index': '2147483647'
	})
	.offset({top:0.65*window.innerHeight, left:0.5*(window.innerWidth-0.5*window.innerWidth)})

if (!document.querySelector("#dst_textarea_container")) {
	console.log('appending dst_textarea_container to html body');
	dst_textarea_container$.appendTo('body');
} else {
	console.log('src_textarea_container has already exist');
}

document.querySelector("#dst_textarea").style.width = '100%';
document.querySelector("#dst_textarea").style.height = '100%';
document.querySelector("#dst_textarea").style.color = 'yellow';
document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
document.querySelector("#dst_textarea").style.border = 'none';
document.querySelector("#dst_textarea").style.display = 'inline-block';
document.querySelector("#dst_textarea").style.overflow = 'hidden';
document.querySelector("#dst_textarea").style.allow="fullscreen";
//document.querySelector("#dst_textarea").style.position="relatif";

dst_h0 = $('#dst_textarea').height();
document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h0)+'px';
document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
	dst_h = $('#dst_textarea').height();
	document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h)+'px';
	document.querySelector("#dst_textarea").style.position='absolute';
	document.querySelector("#dst_textarea").style.width = '100%';
	document.querySelector("#dst_textarea").style.height = '100%';
});

window.addEventListener('resize', function(event){
	document.querySelector("#src_textarea_container").style.width = String(0.5*window.innerWidth)+'px';
	document.querySelector("#src_textarea_container").style.height = String(0.1*window.innerHeight)+'px';
	document.querySelector("#src_textarea_container").style.top = String(0.1*window.innerHeight)+'px';
	document.querySelector("#src_textarea_container").style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

	document.querySelector("#src_textarea").style.width = String(0.5*window.innerWidth)+'px';
	document.querySelector("#src_textarea").style.height = String(0.09*window.innerHeight)+'px';

	src_h0 = $('#src_textarea').height();
	document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h0)+'px';
	if (document.querySelector("#src_textarea").offsetParent) {
		document.querySelector("#src_textarea").offsetParent.onresize = (function(){
			src_h = $('#src_textarea').height();
			document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h)+'px';
			document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
		});
	}
	document.querySelector("#dst_textarea_container").style.width = String(0.5*window.innerWidth)+'px';
	document.querySelector("#dst_textarea_container").style.height = String(0.1*window.innerHeight)+'px';
	document.querySelector("#dst_textarea_container").style.top = String(0.65*window.innerHeight)+'px';
	document.querySelector("#dst_textarea_container").style.left = String(0.5*(window.innerWidth-0.5*window.innerWidth))+'px';

	document.querySelector("#dst_textarea").style.width = String(0.5*window.innerWidth)+'px';
	document.querySelector("#dst_textarea").style.height = String(0.09*window.innerHeight)+'px';

	dst_h0 = $('#dst_textarea').height();
	document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h0)+'px';
	if (document.querySelector("#dst_textarea").offsetParent) {
		document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
			dst_h = $('#dst_textarea').height();
			document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h)+'px';
			document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
		});
	}
});

console.log('Initializing recognition: recognizing =', recognizing);
var final_transcript = '';
var interim_transcript = '';
document.querySelector("#src_textarea_container").style.display = 'none';
document.querySelector("#dst_textarea_container").style.display = 'none';
var start_timestamp = Date.now();
var translate_time = Date.now();

if (!(('webkitSpeechRecognition'||'SpeechRecognition') in window)) {
	alert('Web Speech API is not supported by this browser. upgrade_info to Chrome version 25 or later');
} else {
    var recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
	recognition.lang = src_dialect;
	console.log('Initializing recognition: src_dialect =', src_dialect);
	console.log('Initializing recognition: recognition.lang =', recognition.lang);

	recognition.onstart = function() {
		final_transcript = '';
		interim_transcript = '';
		if (!recognizing) {
			recognizing = false;
			document.querySelector("#start_img").src = 'images/mic.gif';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onstart: stopping because recognizing =', recognizing);
			return;
		} else {
			console.log('recognition.onstart: recognizing =', recognizing);
			recognition.lang = src_dialect;
			document.querySelector("#start_img").src = 'images/mic-animate.gif';
		}
	};

	/*recognition.onspeechstart = function(event) {
		console.log('recognition.onspeechstart: recognizing =', recognizing);
		final_transcript = '';
		interim_transcript = '';
		start_timestamp = Date.now();
		translate_time = Date.now();
	};

	recognition.onspeechend = function(event) {
		console.log('recognition.onspeechend: recognizing =', recognizing);
		final_transcript = '';
		interim_transcript = '';
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		start_timestamp = Date.now();
		translate_time = Date.now();
	};*/

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
            document.querySelector("#start_img").src = 'images/mic.gif';
			console.log('recognition.no-speech: recognizing =', recognizing);
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		}
		if (event.error == 'audio-capture') {
            document.querySelector("#start_img").src = 'images/mic.gif';
			alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
			console.log('recognition.audio-capture: recognizing =', recognizing);
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
		}
		if (event.error == 'not-allowed') {
			if (Date.now() - start_timestamp < 100) {
				alert('Permission to use microphone is blocked, go to chrome://settings/contentExceptions#media-stream to change it');
			} else {
				alert('Permission to use microphone was denied');
			}
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.not-allowed: recognizing =', recognizing);
		}
	};

	recognition.onend = function() {
		final_transcript='';
		interim_transcript='';
		if (!recognizing) {
			document.querySelector("#start_img").src = 'images/mic.gif';
			if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").style.display = 'none';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'none';			
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onend: stopping because recognizing =', recognizing);
			return;
		} else {
			console.log('recognition.onend: keep recognizing because recognizing =', recognizing);
			recognition.start();
			start_timestamp = Date.now();
			translate_time =  Date.now();
		}
	};

	recognition.onresult = function(event) {
		console.log('recognition.onresult: recognizing =', recognizing);
		//console.log('document.querySelector("#src_textarea_container").style.display =', document.querySelector("#src_textarea_container").style.display);

		show_src = document.querySelector("#checkbox_show_src").checked;
		show_dst = document.querySelector("#checkbox_show_dst").checked;
        update_src_country();
        update_dst_country();

        var interim_transcript = '';

		if (!recognizing) {
			final_transcript='';
			interim_transcript='';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'none';			
			console.log('recognition.onresult: stopping because recognizing =', recognizing);
			return;
		} else {
			recognition.lang=src_dialect;
			var interim_transcript = '';
			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					final_transcript += event.results[i][0].transcript;
					final_transcript = final_transcript + '. '
					final_transcript = capitalize(final_transcript);
					final_transcript = remove_linebreak(final_transcript);
				} else {
					interim_transcript += event.results[i][0].transcript;
					interim_transcript = remove_linebreak(interim_transcript);
				}
			}

			//console.log('show_src =', show_src);
			if (show_src) {
				document.querySelector("#src_textarea_container").style.display = 'block';
				document.querySelector("#src_textarea").style.display = 'inline-block';
				document.querySelector("#src_textarea").innerHTML = final_transcript + interim_transcript;
				document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
			} else {
				document.querySelector("#src_textarea_container").style.display = 'none';
				document.querySelector("#src_textarea").style.display = 'none';
			}

			//console.log('show_dst =', show_dst);
			if (show_dst) {
				var  t = final_transcript + interim_transcript;
				if ((Date.now() - translate_time > 1000) && recognizing) {

					if (t) var tt=translate(t,src,dst).then((result => {
						document.querySelector("#dst_textarea_container").style.display = 'block';
						document.querySelector("#dst_textarea").style.display = 'inline-block';
						dst_textarea.value=result;
						document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
					}));

					translate_time = Date.now();
				};
			} else {
				document.querySelector("#dst_textarea_container").style.display = 'none';
				document.querySelector("#dst_textarea").style.display = 'none';
			}
		}
	};

	if (recognizing) {
		console.log('starting recognition: recognizing =', recognizing);
		recognition.start();
		start_timestamp = Date.now();
		translate_time =  Date.now();
	}

}

var two_line = /\n\n/g;
var one_line = /\n/g;
function remove_linebreak(s) {
	return s.replace(two_line, '').replace(one_line, '');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function startButton(event) {
	show_src = document.querySelector("#checkbox_show_src").checked;
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	src_dialect = document.querySelector("#select_src_dialect").value;
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	console.log('src_dialect =', src_dialect);
	console.log('dst_dialect =', dst_dialect);

	recognizing=!recognizing;
	console.log('startButton clicked recognizing =', recognizing);
	if (!recognizing) {
		recognition.stop();
		return;
	} else {
		//document.querySelector("#src_textarea").value='';
		//document.querySelector("#dst_textarea").value='';
		final_transcript='';
		interim_transcript='';
		recognition.lang = src_dialect;
		start_timestamp = event.timeStamp;
		translate_time = event.timeStamp;
		recognition.start();
		//ignore_onend = false;
		//document.querySelector("#start_img").src = 'images/mic-slash.gif';
	}
}

var translate = async (t,src,dst) => {
	var tt = new Promise(function(resolve) {
		var i=0, len=0, r='', tt='';
		const url = 'https://clients5.google.com/translate_a/';
		var params = 'single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl='+src+'&tl='+dst+'&q='+t;
		var xmlHttp = new XMLHttpRequest();
		var response;
		xmlHttp.onreadystatechange = function(event) {
			if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
				response = JSON.parse(xmlHttp.responseText);
				for (var i = 0, len = response.sentences?.length; i < len; i++) {
					var r=(((response.sentences[i].trans).replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
					r=((r.replace('}','')).replace(')','')).replace('\%20/g', ' ');
					tt += r;
				}
				if (tt.includes('}'||')'||'%20')) {
					tt=((tt.replace('}/g','')).replace(')/g','')).replace('\%20/g', ' ');
				}
				resolve(tt);
			}
		}
		xmlHttp.open('GET', url+params, true);
		xmlHttp.send(null);
		xmlHttp.onreadystatechange();
	});
	return await tt;
}
