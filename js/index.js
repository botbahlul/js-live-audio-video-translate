var recognition, recognizing;
var src, src_language, src_language_index, src_dialect, src_dialect_index, show_src;
var dst, dst_language, dst_language_index, dst_dialect, dst_dialect_index, show_dst;

var src_fonts, dst_fonts;

var select_src_font, input_src_font_size, input_src_font_color;
var src_selected_font_index, src_selected_font, src_font_size, src_font_color;
var input_src_container_width_factor, input_src_container_height_factor;
var src_container_width_factor, src_container_height_factor;
var input_src_container_color, input_src_container_opacity;
var src_container_color, src_container_opacity;

var select_dst_font, input_dst_font_size, input_dst_font_color;
var dst_selected_font_index, dst_selected_font, dst_font_size, dst_font_color;
var input_dst_container_width_factor, input_dst_container_height_factor;
var dst_container_width_factor, dst_container_height_factor;
var input_dst_container_color, input_dst_container_opacity;
var dst_container_color, dst_container_opacity;

var video_info, src_width, src_height, src_top, src_left, dst_width, dst_height, dst_top, dst_left;
var startTimestamp, endTimestamp, timestamped_final_and_interim_transcript, timestamped_translated_final_and_interim_transcript;
var timestamp_separator = "-->";
var session_start_time, session_end_time;
var interim_started=false;
var pause_timeout, input_pause_threshold, pause_threshold;
var all_final_transcripts = [], formatted_all_final_transcripts;
var version = "0.2.0"

var src_language =
	[['Afrikaans',       ['af-ZA']],
	['Amharic',         ['am-ET']],
	['Arabic',          ['ar-AE', 'Uni Arab Emirates'],
						['ar-BH', 'Bahrain'],
						['ar-DZ', 'Algeria'],
						['ar-EG', 'Egypt'],
						['ar-IQ', 'Iraq'],
						['ar-JO', 'Jordan'],
						['ar-KW', 'Kuwait'],
						['ar-LB', 'Lebanon'],
						['ar-LY', 'Libya'],
						['ar-MA', 'Maroco'],
						['ar-OM', 'Oman'],
						['ar-QA', 'Qatar'],
						['ar-SA', 'Saudi Arabia'],
						['ar-SY', 'Syria'],
						['ar-TN', 'Tunisia'],
						['ar-YE', 'Yemen']],
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
	['Myanmar',         ['my-MM']],
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

if (localStorage.getItem("src_language_index")) {
	src_language_index = localStorage.getItem("src_language_index");
	document.querySelector("#select_src_language").selectedIndex = src_language_index;
	console.log('localStorage.getItem("src_language_index") =', src_language_index);
} else {
	src_language_index = 26;
	document.querySelector("#select_src_language").selectedIndex = src_language_index;
}

if (localStorage.getItem("src_dialect")) {
	src_dialect = localStorage.getItem("src_dialect");
	console.log('localStorage.getItem("src_dialect") =', src_dialect);
} else {
	//src_dialect = "id-ID";
	if (src_language[src_language_index].length>2) {
		src_dialect = document.querySelector("#select_src_dialect").value;
	} else {
		src_dialect = src_language[document.querySelector("#select_src_language").selectedIndex][1][0];
	};
}

if (localStorage.getItem("show_src")) {
	show_src = localStorage.getItem("show_src");
	document.querySelector("#checkbox_show_src").checked = show_src;
	console.log('localStorage.getItem("show_src") =', show_src);
} else {
	show_src = true;
	document.querySelector("#checkbox_show_src").checked = show_src;
}

update_src_country();
//console.log('after update_src_country(): src_dialect =', src_dialect);


var dst_language =
	[['Afrikaans',       ['af-ZA']],
	['Amharic',         ['am-ET']],
	['Arabic',          ['ar-AE', 'Uni Arab Emirates'],
						['ar-BH', 'Bahrain'],
						['ar-DZ', 'Algeria'],
						['ar-EG', 'Egypt'],
						['ar-IQ', 'Iraq'],
						['ar-JO', 'Jordan'],
						['ar-KW', 'Kuwait'],
						['ar-LB', 'Lebanon'],
						['ar-LY', 'Libya'],
						['ar-MA', 'Maroco'],
						['ar-OM', 'Oman'],
						['ar-QA', 'Qatar'],
						['ar-SA', 'Saudi Arabia'],
						['ar-SY', 'Syria'],
						['ar-TN', 'Tunisia'],
						['ar-YE', 'Yemen']],
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
	['Myanmar',         ['my-MM']],
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

if (localStorage.getItem("dst_language_index")) {
	dst_language_index = localStorage.getItem("dst_language_index");
	document.querySelector("#select_dst_language").selectedIndex = dst_language_index;
	console.log('localStorage.getItem("dst_language_index") =', dst_language_index);
} else {
	dst_language_index = 15;
	document.querySelector("#select_dst_language").selectedIndex = dst_language_index;
}

if (localStorage.getItem("dst_dialect")) {
	dst_dialect = localStorage.getItem("dst_dialect");
	console.log('localStorage.getItem("dst_dialect") =', dst_dialect);
} else {
	if (dst_language[dst_language_index].length>2) {
		dst_dialect = document.querySelector("#select_dst_dialect").value;
	} else {
		dst_dialect = dst_language[document.querySelector("#select_dst_language").selectedIndex][1][0];
	};
}

if (localStorage.getItem("show_dst")) {
	show_dst = localStorage.getItem("show_dst");
	document.querySelector("#checkbox_show_dst").checked = show_dst;
	console.log('localStorage.getItem("show_dst") =', show_dst);
} else {
	show_dst = true;
	document.querySelector("#checkbox_show_dst").checked = show_dst;
}

update_dst_country();
//console.log('after update_dst_country(): dst_dialect =', dst_dialect);


src_textarea_container = document.querySelector("#src_textarea_container");
src_textarea = document.querySelector("#src_textarea");
dst_textarea_container = document.querySelector("#dst_textarea_container");
dst_textarea = document.querySelector("#dst_textarea");
select_src_font = document.getElementById("select_src_font");
src_selected_font = select_src_font.value;
input_src_font_size = document.getElementById("input_src_font_size");
src_font_size = input_src_font_size.value;
input_src_font_color = document.getElementById("input_src_font_color");
src_font_color = input_src_font_color.value;
src_fonts = getAvailableFonts();
src_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    select_src_font.appendChild(option);
});
select_dst_font = document.getElementById("select_dst_font");
dst_selected_font = select_dst_font.value;
input_dst_font_size = document.getElementById("input_dst_font_size");
dst_font_size = input_dst_font_size.value;
input_dst_font_color = document.getElementById("input_dst_font_color");
dst_font_color = input_dst_font_color.value;
dst_fonts = getAvailableFonts();
dst_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
	select_dst_font.appendChild(option);
});

input_src_container_width_factor = document.getElementById("input_src_container_width_factor");
src_container_width_factor = input_src_container_width_factor.value;
input_src_container_height_factor = document.getElementById("input_src_container_height_factor");
src_container_height_factor = input_src_container_height_factor.value;
input_src_container_color = document.getElementById("input_src_container_color");
src_container_color = input_src_container_color.value;
input_src_container_opacity = document.getElementById("input_src_container_opacity");
src_container_opacity = input_src_container_opacity.value;

input_dst_container_width_factor = document.getElementById("input_dst_container_width_factor");
dst_container_width_factor = input_dst_container_width_factor.value;
input_dst_container_height_factor = document.getElementById("input_dst_container_height_factor");
dst_container_height_factor = input_dst_container_height_factor.value;
input_dst_container_color = document.getElementById("input_dst_container_color");
dst_container_color = input_dst_container_color.value;
input_dst_container_opacity = document.getElementById("input_dst_container_opacity");
dst_container_opacity = input_dst_container_opacity.value;

input_pause_threshold = document.getElementById("input_pause_threshold");
pause_threshold = input_pause_threshold.value;

// Load saved values from localStorage if available
if (localStorage.getItem("pause_threshold")) {
	pause_threshold = localStorage.getItem("pause_threshold");
	console.log('localStorage.getItem("pause_threshold") =', pause_threshold);
    input_pause_threshold.value = pause_threshold;
} else {
	input_pause_threshold.value = 2000;
	pause_threshold = 2000;
}

if (localStorage.getItem("src_selected_font_index")) {
	src_selected_font_index = localStorage.getItem("src_selected_font_index");
	console.log('localStorage.getItem("src_selected_font_index") =', src_selected_font_index);
	select_src_font.selectedIndex = src_selected_font_index;
	console.log('select_src_font.selectedIndex =', select_src_font.selectedIndex);
} else {
	src_selected_font_index = 0;
	select_src_font.selectedIndex = src_selected_font_index;
}

if (localStorage.getItem("src_selected_font")) {
    src_selected_font = localStorage.getItem("src_selected_font");
	console.log('localStorage.getItem("src_selected_font") =', src_selected_font);
	select_src_font.value = src_selected_font;
} else {
	src_selected_font = "Arial";
	select_src_font.value = src_selected_font;
}

if (localStorage.getItem("src_font_size")) {
    src_font_size = localStorage.getItem("src_font_size");
	console.log('localStorage.getItem("src_font_size") =', src_font_size);
	input_src_font_size.value = src_font_size;
} else {
	src_font_size = 18;
	input_src_font_size.value = src_font_size;
}

if (localStorage.getItem("src_font_color")) {
	src_font_color = localStorage.getItem("src_font_color");
	console.log('localStorage.getItem("src_font_color") =', src_font_color);
	input_src_font_color.value = src_font_color;
} else {
	src_font_color = "#ffff00";
	input_src_font_size.value = src_font_color;
}

if (localStorage.getItem("src_container_width_factor")) {
	src_container_width_factor = localStorage.getItem("src_container_width_factor");
	console.log('localStorage.getItem("src_container_width_factor") =', src_container_width_factor);
	input_src_container_width_factor.value = src_container_width_factor;
} else {
	src_container_width_factor = 0.8;
	input_src_container_width_factor.value = src_container_width_factor;
}

if (localStorage.getItem("src_container_height_factor")) {
	src_container_height_factor = localStorage.getItem("src_container_height_factor");
	console.log('localStorage.getItem("src_container_height_factor") =', src_container_height_factor);
	input_src_container_height_factor.value = src_container_height_factor;
} else {
	src_container_height_factor = 0.15;
	input_src_container_height_factor.value = src_container_height_factor;
}

if (localStorage.getItem("src_container_color")) {
	src_container_color = localStorage.getItem("src_container_color");
	console.log('localStorage.getItem("src_container_color") =', src_container_color);
	input_src_container_color.value = src_container_color;
} else {
	src_container_color = "#000000";
	input_src_container_color.value = src_container_color;
}

if (localStorage.getItem("src_container_opacity")) {
	src_container_opacity = localStorage.getItem("src_container_opacity");
	console.log('localStorage.getItem("src_container_opacity") =', src_container_opacity);
	input_src_container_opacity.value = src_container_opacity;
} else {
	src_container_opacity = "0.3";
	input_src_container_opacity.value = src_container_opacity;
}


if (localStorage.getItem("dst_selected_font_index")) {
	dst_selected_font_index = localStorage.getItem("dst_selected_font_index");
	console.log('localStorage.getItem("dst_selected_font_index") =', dst_selected_font_index);
	select_dst_font.selectedIndex = dst_selected_font_index;
	console.log('select_dst_font.selectedIndex =', select_dst_font.selectedIndex);
} else {
	dst_selected_font_index = 0;
	select_dst_font.selectedIndex = dst_selected_font_index;
}

if (localStorage.getItem("dst_selected_font")) {
    dst_selected_font = localStorage.getItem("dst_selected_font");
	console.log('localStorage.getItem("dst_selected_font") =', dst_selected_font);
	select_dst_font.value = dst_selected_font;
} else {
	dst_selected_font = "Arial";
	select_dst_font.value = dst_selected_font;
}

if (localStorage.getItem("dst_font_size")) {
    dst_font_size = localStorage.getItem("dst_font_size");
	console.log('localStorage.getItem("dst_font_size") =', dst_font_size);
	input_dst_font_size.value = dst_font_size;
} else {
	dst_font_size = 18;
	input_dst_font_size.value = dst_font_size;
}

if (localStorage.getItem("dst_font_color")) {
	dst_font_color = localStorage.getItem("dst_font_color");
	console.log('localStorage.getItem("dst_font_color") =', dst_font_color);
	input_dst_font_color.value = dst_font_color;
} else {
	dst_font_color = "#ffff00";
	input_dst_font_size.value = dst_font_color;
}

if (localStorage.getItem("dst_container_width_factor")) {
	dst_container_width_factor = localStorage.getItem("dst_container_width_factor");
	console.log('localStorage.getItem("dst_container_width_factor") =', dst_container_width_factor);
	input_dst_container_width_factor.value = dst_container_width_factor;
} else {
	dst_container_width_factor = 0.8;
	input_dst_container_width_factor.value = dst_container_width_factor;
}

if (localStorage.getItem("dst_container_height_factor")) {
	dst_container_height_factor = localStorage.getItem("dst_container_height_factor");
	console.log('localStorage.getItem("dst_container_height_factor") =', dst_container_height_factor);
	input_dst_container_height_factor.value = dst_container_height_factor;
} else {
	dst_container_height_factor = 0.15;
	input_dst_container_height_factor.value = dst_container_height_factor;
}

if (localStorage.getItem("dst_container_color")) {
	dst_container_color = localStorage.getItem("dst_container_color");
	console.log('localStorage.getItem("dst_container_color") =', dst_container_color);
	input_dst_container_color.value = dst_container_color;
} else {
	dst_container_color = "#000000";
	input_dst_container_color.value = dst_container_color;
}

if (localStorage.getItem("dst_container_opacity")) {
	dst_container_opacity = localStorage.getItem("dst_container_opacity");
	console.log('localStorage.getItem("dst_container_opacity") =', dst_container_opacity);
	input_dst_container_opacity.value = dst_container_opacity;
} else {
	dst_container_opacity = "0.3";
	input_dst_container_opacity.value = dst_container_opacity;
}


// Add event listeners for changes in font select and font size input
select_src_font.addEventListener("change", updateSubtitleText);
input_src_font_size.addEventListener("input", updateSubtitleText);
input_src_font_size.addEventListener("change", updateSubtitleText);
input_src_font_color.addEventListener("input", updateSubtitleText);
input_src_font_color.addEventListener("change", updateSubtitleText);
input_src_container_width_factor.addEventListener("input", updateSubtitleText);
input_src_container_width_factor.addEventListener("change", updateSubtitleText);
input_src_container_height_factor.addEventListener("input", updateSubtitleText);
input_src_container_height_factor.addEventListener("change", updateSubtitleText);
input_src_container_color.addEventListener("input", updateSubtitleText);
input_src_container_color.addEventListener("change", updateSubtitleText);
input_src_container_opacity.addEventListener("input", updateSubtitleText);
input_src_container_opacity.addEventListener("change", updateSubtitleText);

select_dst_font.addEventListener("change", updateSubtitleText);
input_dst_font_size.addEventListener("input", updateSubtitleText);
input_dst_font_size.addEventListener("change", updateSubtitleText);
input_dst_font_color.addEventListener("input", updateSubtitleText);
input_dst_font_color.addEventListener("change", updateSubtitleText);
input_dst_container_width_factor.addEventListener("input", updateSubtitleText);
input_dst_container_width_factor.addEventListener("change", updateSubtitleText);
input_dst_container_height_factor.addEventListener("input", updateSubtitleText);
input_dst_container_height_factor.addEventListener("change", updateSubtitleText);
input_dst_container_color.addEventListener("input", updateSubtitleText);
input_dst_container_color.addEventListener("change", updateSubtitleText);
input_dst_container_opacity.addEventListener("input", updateSubtitleText);
input_dst_container_opacity.addEventListener("change", updateSubtitleText);


function getAvailableFonts() {
    var fontList = [];
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    // Set some text to measure the width of
    var text = "abcdefghijklmnopqrstuvwxyz0123456789";

    // Measure the width of the text for each font
    var defaultWidth = ctx.measureText(text).width;

    // List of commonly available src_fonts in most browsers
    var fontFamilies = [
      "Arial", "Arial Black", "Calibri", "Cambria", "Candara", "Comic Sans MS",
      "Consolas", "Courier New", "Georgia", "Impact", "Lucida Console", "Lucida Sans Unicode",
      "Microsoft Sans Serif", "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"
    ];

    // Check if each font is available
    fontFamilies.forEach(function(font) {
      ctx.font = "40px " + font + ", sans-serif";
      var width = ctx.measureText(text).width;
      if (width !== defaultWidth) {
        fontList.push(font);
      }
    });

    return fontList;
}


function updateSubtitleText() {
	src_selected_font_index = select_src_font.selectedIndex;
	console.log('src_selected_font_index =', src_selected_font_index);

    src_selected_font = select_src_font.value;
	console.log('src_selected_font =', src_selected_font);

    src_font_size = input_src_font_size.value;
	console.log('src_font_size =', src_font_size);

	src_font_color = input_src_font_color.value;
	console.log('src_font_color =', src_font_color);

	src_container_width_factor = input_src_container_width_factor.value;
	console.log('src_container_width_factor =', src_container_width_factor);

	src_container_height_factor = input_src_container_height_factor.value;
	console.log('src_container_height_factor =', src_container_height_factor);

	src_container_color = input_src_container_color.value;
	console.log('src_container_color =', src_container_color);

	src_container_opacity = input_src_container_opacity.value;
	console.log('src_container_opacity =', src_container_opacity);

    localStorage.setItem("src_selected_font_index", src_selected_font_index);
	localStorage.setItem("src_selected_font", src_selected_font);
    localStorage.setItem("src_font_size", src_font_size);
    localStorage.setItem("src_font_color", src_font_color);
    localStorage.setItem("src_container_width_factor", src_container_width_factor);
	localStorage.setItem("src_container_height_factor", src_container_height_factor);
	localStorage.setItem("src_container_color", src_container_color);
	localStorage.setItem("src_container_opacity", src_container_opacity);


	dst_selected_font_index = select_dst_font.selectedIndex;
	console.log('dst_selected_font_index =', dst_selected_font_index);

    dst_selected_font = select_dst_font.value;
	console.log('dst_selected_font =', dst_selected_font);

    dst_font_size = input_dst_font_size.value;
	console.log('dst_font_size =', dst_font_size);

	dst_font_color = input_dst_font_color.value;
	console.log('dst_font_color =', dst_font_color);

	dst_container_width_factor = input_dst_container_width_factor.value;
	console.log('dst_container_width_factor =', dst_container_width_factor);

	dst_container_height_factor = input_dst_container_height_factor.value;
	console.log('dst_container_height_factor =', dst_container_height_factor);

	dst_container_color = input_dst_container_color.value;
	console.log('dst_container_color =', dst_container_color);

	dst_container_opacity = input_dst_container_opacity.value;
	console.log('dst_container_opacity =', dst_container_opacity);

    localStorage.setItem("dst_selected_font_index", dst_selected_font_index);
	localStorage.setItem("dst_selected_font", dst_selected_font);
    localStorage.setItem("dst_font_size", dst_font_size);
    localStorage.setItem("dst_font_color", dst_font_color);
    localStorage.setItem("dst_container_width_factor", dst_container_width_factor);
	localStorage.setItem("dst_container_height_factor", dst_container_height_factor);
	localStorage.setItem("dst_container_color", dst_container_color);
	localStorage.setItem("dst_container_opacity", dst_container_opacity);

	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	src_container_width_factor = input_src_container_width_factor.value;
	src_container_height_factor = input_src_container_height_factor.value;
	dst_container_width_factor = input_dst_container_width_factor.value;
	dst_container_height_factor = input_dst_container_height_factor.value;

	video_info = getVideoPlayerInfo();
	if (video_info) {
		console.log("Video player found");
		console.log("video_info.id = ", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		//src_width = src_container_width_factor*window.innerWidth;
		src_width = src_container_width_factor*video_info.width;
		//console.log('src_width =', src_width);

		//src_height = src_container_height_factor*window.innerHeight;
		src_height = src_container_height_factor*video_info.height;
		//console.log('src_height =', src_width);

		//src_top = 0.25*window.innerHeight;
		src_top = video_info.top + 0.02*video_info.height;
		//console.log('src_top =', src_top);

		//src_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//src_left = 0.5*(window.innerWidth-src_width);
		src_left = video_info.left + 0.5*(video_info.width-src_width);
		//console.log('src_left =', src_left);

		//dst_width = dst_container_width_factor*window.innerWidth;
		dst_width = dst_container_width_factor*video_info.width;
		//console.log('dst_width =', dst_width);
		
		//dst_height = dst_container_height_factor*window.innerHeight;
		dst_height = dst_container_height_factor*video_info.height;
		//console.log('dst_height =', dst_height);

		//dst_top = 0.75*window.innerHeight;
		dst_top = video_info.top + 0.6*video_info.height;
		//console.log('dst_top =', dst_top);

		//dst_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//dst_left = 0.5*(window.innerWidth-dst_width);
		dst_left = video_info.left + 0.5*(video_info.width-dst_width);
		//console.log('dst_left =', dst_left);

	} else {
		console.log("No video player found on this page");

		src_width = src_container_width_factor*window.innerWidth;
		//console.log('src_width =', src_width);

		src_height = src_container_height_factor*window.innerHeight;
		//console.log('src_height =', src_width);

		src_top = 0.25*window.innerHeight;
		//console.log('src_top =', src_top);

		src_left = 0.5*(window.innerWidth-src_width);
		//console.log('src_left =', src_left);

		dst_width = dst_container_width_factor*window.innerWidth;
		//console.log('dst_width =', dst_width);
		
		dst_height = dst_container_height_factor*window.innerHeight;
		//console.log('dst_height =', dst_height);

		dst_top = 0.75*window.innerHeight;
		//console.log('dst_top =', dst_top);

		dst_left = 0.5*(window.innerWidth-dst_width);
		//console.log('dst_left =', dst_left);
	}

	if (document.querySelector("#src_textarea_container") && document.querySelector("#src_textarea")) {
		document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea").style.fontSize = String(src_font_size) + "px";
		document.querySelector("#src_textarea").style.color = src_font_color;
		//document.querySelector("#src_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
		document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(input_src_container_color.value, input_src_container_opacity.value);

		//document.querySelector("#src_textarea_container").style.width = String(src_container_width_factor*window.innerWidth) + "px";
		document.querySelector("#src_textarea_container").style.width = String(src_width) + "px";
		console.log('width =', document.querySelector("#src_textarea_container").style.width);

		//document.querySelector("#src_textarea_container").style.height = String(src_container_height_factor*window.innerHeight) + "px";
		document.querySelector("#src_textarea_container").style.height = String(src_height) + "px";
		console.log('height =', document.querySelector("#src_textarea_container").style.height);

		//document.querySelector("#src_textarea_container").style.left = String(0.5*(window.innerWidth-src_container_width_factor*window.innerWidth)) + "px";
		document.querySelector("#src_textarea_container").style.left = String(src_left) + "px";
		console.log('left =', document.querySelector("#src_textarea_container").style.left);
	}

	if (document.querySelector("#dst_textarea_container") && document.querySelector("#dst_textarea")) {
		document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
		document.querySelector("#dst_textarea").style.fontSize = String(dst_font_size) + "px";
		document.querySelector("#dst_textarea").style.color = dst_font_color;
		//document.querySelector("#dst_textarea").style.backgroundColor = 'rgba(0,0,0,0.3)';
		document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value);

		//document.querySelector("#dst_textarea_container").style.width = String(src_container_width_factor*window.innerWidth) + "px";
		document.querySelector("#dst_textarea_container").style.width = String(dst_width) + "px";
		console.log('width =', document.querySelector("#dst_textarea_container").style.width);

		//document.querySelector("#dst_textarea_container").style.height = String(src_container_height_factor*window.innerHeight) + "px";
		document.querySelector("#dst_textarea_container").style.height = String(dst_height) + "px";
		console.log('height =', document.querySelector("#dst_textarea_container").style.height);

		//document.querySelector("#dst_textarea_container").style.left = String(0.5*(window.innerWidth-src_container_width_factor*window.innerWidth)) + "px";
		document.querySelector("#dst_textarea_container").style.left = String(dst_left) + "px";
		console.log('left =', document.querySelector("#dst_textarea_container").style.left);
	}

}



document.querySelector("#embed_button").addEventListener('click', function(){
	embed();
});



document.querySelector("#select_src_language").addEventListener('change', function(){
	update_src_country()
	console.log('document.querySelector("#select_src_language") on change: src =', src);
	//console.log('document.querySelector("#select_src_language") on change: src_language_index =', src_language_index);
	localStorage.setItem("src_language_index", src_language_index);
});

document.querySelector("#select_src_dialect").addEventListener('change', function(){
	src_dialect = document.querySelector("#select_src_dialect").value;
	//console.log('document.querySelector("#select_src_dialect") on change: document.querySelector("#select_src_dialect").value =', document.querySelector("#select_src_dialect").value);
	console.log('document.querySelector("#select_src_dialect") on change: src_dialect =', src_dialect);
	localStorage.setItem("src_dialect", src_dialect);
	localStorage.setItem("src_dialect_index", src_dialect_index);
});

document.querySelector("#select_dst_language").addEventListener('change', function(){
	update_dst_country();
	console.log('document.querySelector("#select_dst_language") on change: dst =', dst);
	//console.log('document.querySelector("#select_dst_language") on change:dst_language_index =', dst_language_index);
	localStorage.setItem("dst_language_index", dst_language_index);
});

document.querySelector("#select_dst_dialect").addEventListener('change', function(){
	console.log('document.querySelector("#select_dst_dialect") on change: dst =', dst);
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	console.log('document.querySelector("#select_dst_dialect") on change: document.querySelector("#select_dst_dialect").value =', document.querySelector("#select_dst_dialect").value);
	console.log('document.querySelector("#select_dst_dialect") on change: dst_dialect =', dst_dialect);
	localStorage.setItem("dst_dialect", dst_dialect);
	localStorage.setItem("dst_dialect_index", dst_dialect_index);
});

document.querySelector("#checkbox_show_src").addEventListener('change', function(){
	show_src = document.querySelector("#checkbox_show_src").checked;
	console.log('document.querySelector("#checkbox_show_src") on change: show_src =', show_src);
	if (!show_src) {
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
	}
	localStorage.setItem("show_src", show_src);
});

document.querySelector("#checkbox_show_dst").addEventListener('change', function(){
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	console.log('document.querySelector("#checkbox_show_dst") on change: show_dst =', show_dst);
	if (!show_dst) {
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
	}
	localStorage.setItem("show_dst", show_dst);
});

document.querySelector("#input_pause_threshold").addEventListener('change', function(){
	pause_threshold = document.querySelector("#input_pause_threshold").value;
	console.log('document.querySelector("#input_pause_threshold") on change: pause_threshold =', pause_threshold);
	localStorage.setItem("pause_threshold", pause_threshold);
});

document.querySelector("#start_button").addEventListener('click', function(){
	session_start_time = formatTimestamp(new Date());
	console.log('session_start_time =', session_start_time);
	startButton(event);
});



document.addEventListener('fullscreenchange', function(event) {

	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	input_src_container_width_factor = document.getElementById("input_src_container_width_factor");
	src_container_width_factor = input_src_container_width_factor.value;
	input_src_container_height_factor = document.getElementById("input_src_container_height_factor");
	src_container_height_factor = input_src_container_height_factor.value;

	input_dst_container_width_factor = document.getElementById("input_dst_container_width_factor");
	dst_container_width_factor = input_dst_container_width_factor.value;
	input_dst_container_height_factor = document.getElementById("input_dst_container_height_factor");
	dst_container_height_factor = input_dst_container_height_factor.value;

	video_info = getVideoPlayerInfo();
	if (video_info) {
		console.log('fullscreenchange');
		console.log("Video player found");
		console.log("video_info.id = ", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		//src_width = src_container_width_factor*window.innerWidth;
		src_width = src_container_width_factor*video_info.width;
		//console.log('src_width =', src_width);

		//src_height = src_container_height_factor*window.innerHeight;
		src_height = src_container_height_factor*video_info.height;
		//console.log('src_height =', src_width);

		//src_top = 0.25*window.innerHeight;
		src_top = video_info.top + 0.02*video_info.height;
		//console.log('src_top =', src_top);

		//src_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//src_left = 0.5*(window.innerWidth-src_width);
		src_left = video_info.left + 0.5*(video_info.width-src_width);
		//console.log('src_left =', src_left);

		//dst_width = dst_container_width_factor*window.innerWidth;
		dst_width = dst_container_width_factor*video_info.width;
		//console.log('dst_width =', dst_width);
		
		//dst_height = dst_container_height_factor*window.innerHeight;
		dst_height = dst_container_height_factor*video_info.height;
		//console.log('dst_height =', dst_height);

		//dst_top = 0.75*window.innerHeight;
		dst_top = video_info.top + 0.6*video_info.height;
		//console.log('dst_top =', dst_top);

		//dst_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//dst_left = 0.5*(window.innerWidth-dst_width);
		dst_left = video_info.left + 0.5*(video_info.width-dst_width);
		//console.log('dst_left =', dst_left);

	} else {
		console.log("No video player found on this page.");

		src_width = src_container_width_factor*window.innerWidth;
		//console.log('src_width =', src_width);

		src_height = src_container_height_factor*window.innerHeight;
		//console.log('src_height =', src_width);

		src_top = 0.25*window.innerHeight;
		//console.log('src_top =', src_top);

		src_left = 0.5*(window.innerWidth-src_width);
		//console.log('src_left =', src_left);

		dst_width = dst_container_width_factor*window.innerWidth;
		//console.log('dst_width =', dst_width);
		
		dst_height = dst_container_height_factor*window.innerHeight;
		//console.log('dst_height =', dst_height);

		dst_top = 0.75*window.innerHeight;
		//console.log('dst_top =', dst_top);

		dst_left = 0.5*(window.innerWidth-dst_width);
		//console.log('dst_left =', dst_left);
	}


	if (document.querySelector("#src_textarea_container")) {
		document.querySelector("#src_textarea_container").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea_container").style.width = String(src_width)+'px';
		document.querySelector("#src_textarea_container").style.height = String(src_height)+'px';
		document.querySelector("#src_textarea_container").style.top = String(src_top)+'px';
		document.querySelector("#src_textarea_container").style.left = String(src_left)+'px';

		var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
			.width(src_width)
			.height(src_height)
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
				'fontFamily': src_selected_font + ', sans-serif',
				'fontSize': src_font_size,
				'color': src_font_color,
				'backgroundColor': hexToRgba(input_src_container_color.value, input_src_container_opacity.value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:src_top, left:src_left})

		document.querySelector("#src_textarea").style.width = String(src_width)+'px';
		document.querySelector("#src_textarea").style.height = String(src_height)+'px';
		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		//document.querySelector("#src_textarea").style.color = 'yellow';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';

		document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea").style.color = src_font_color;
		document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(input_src_container_color.value, input_src_container_opacity.value);
		//src_h0 = $('#src_textarea').height();
		//document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h0)+'px';
		document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';
		if (document.querySelector("#src_textarea").offsetParent) {
			document.querySelector("#src_textarea").offsetParent.onresize = (function(){
			//	src_h = $('#src_textarea').height();
			//	document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h)+'px';
				document.querySelector("#dst_textarea").style.position='absolute';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;

/*
				console.log('src_width = ', document.querySelector("#src_textarea").getBoundingClientRect().width);
				console.log('video_info.width = ', video_info.width);
				src_container_width_factor = document.querySelector("#src_textarea").getBoundingClientRect().width/video_info.width;
				console.log('src_container_width_factor = ', src_container_width_factor);
				input_src_container_width_factor.value = src_container_width_factor;
				localStorage.setItem("src_container_width_factor", src_container_width_factor);

				console.log('src_height = ', document.querySelector("#src_textarea").getBoundingClientRect().height);
				console.log('video_info.height = ', video_info.height);
				src_container_height_factor = document.querySelector("#src_textarea").getBoundingClientRect().height/video_info.height;
				console.log('src_container_height_factor = ', src_container_height_factor);
				input_src_container_height_factor.value = src_container_height_factor;
				localStorage.setItem("src_container_height_factor", src_container_height_factor);
*/
			});
		}
	}


	if (document.querySelector("#dst_textarea_container")) {
		document.querySelector("#dst_textarea_container").style.fontFamily = dst_selected_font + ", sans-serif";
		document.querySelector("#dst_textarea_container").style.width = String(dst_width)+'px';
		document.querySelector("#dst_textarea_container").style.height = String(dst_height)+'px';
		document.querySelector("#dst_textarea_container").style.top = String(dst_top)+'px';
		document.querySelector("#dst_textarea_container").style.left = String(dst_left)+'px';

		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
			.width(dst_width)
			.height(dst_height)
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
				'fontFamily': dst_selected_font + ', sans-serif',
				'fontSize': dst_font_size,
				'color': dst_font_color,
				'backgroundColor': hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:dst_top, left:dst_left})

		document.querySelector("#dst_textarea").style.width = String(dst_width)+'px';
		document.querySelector("#dst_textarea").style.height = String(dst_height)+'px';
		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		//document.querySelector("#dst_textarea").style.color = 'yellow';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';

		document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
		document.querySelector("#dst_textarea").style.color = dst_font_color;
		document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value);
		//dst_h0 = $('#dst_textarea').height();
		//document.querySelector("#dst_textarea").style.fontSize=String(0.35*src_h0)+'px';
		document.querySelector("#dst_textarea").style.fontSize=String(src_font_size)+'px';
		if (document.querySelector("#dst_textarea").offsetParent) {
			document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
			//	dst_h = $('#dst_textarea').height();
			//	document.querySelector("#dst_textarea").style.fontSize=String(0.35*dst_h)+'px';
				document.querySelector("#dst_textarea").style.position='absolute';
				document.querySelector("#dst_textarea").style.width = '100%';
				document.querySelector("#dst_textarea").style.height = '100%';
				document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;

/*
				console.log('dst_width = ', document.querySelector("#dst_textarea").getBoundingClientRect().width);
				console.log('video_info.width = ', video_info.width);
				dst_container_width_factor = document.querySelector("#dst_textarea").getBoundingClientRect().width/video_info.width;
				console.log('dst_container_width_factor = ', dst_container_width_factor);
				input_dst_container_width_factor.value = dst_container_width_factor;
				localStorage.setItem("dst_container_width_factor", dst_container_width_factor);

				console.log('dst_height = ', document.querySelector("#dst_textarea").getBoundingClientRect().height);
				console.log('video_info.height = ', video_info.height);
				dst_container_height_factor = document.querySelector("#dst_textarea").getBoundingClientRect().height/video_info.height;
				console.log('dst_container_height_factor = ', dst_container_height_factor);
				input_dst_container_height_factor.value = dst_container_height_factor;
				localStorage.setItem("dst_container_height_factor", dst_container_height_factor);
*/
			});
		}
	}
});



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

	if (src_dialect == "yue-Hant-HK") {
		src = "zh-TW";
	}
	if (src_dialect == "cmn-Hans-CN") {
		src = "zh-CN";
	}
	if (src_dialect == "cmn-Hans-HK") {
		src = "zh-CN";
	}
	if (src_dialect == "cmn-Hant-TW") {
		src = "zh-TW";
	}

	src_language_index = document.querySelector("#select_src_language").selectedIndex;
	//localStorage.setItem("src_language_index", src_language_index);
	if (src_language[src_language_index].length>2) {
		for (var j=0;j<document.querySelector("#select_src_dialect").length;j++) {
			if (document.querySelector("#select_src_dialect")[j].value===src_dialect) {
				src_dialect_index = j;
				document.querySelector("#select_src_dialect").selectedIndex = src_dialect_index;
				//localStorage.setItem("src_dialect_index", src_dialect_index);
				break;
			}
		}
	}
	if (src_language[src_language_index].length>2) {
		src_dialect = document.querySelector("#select_src_dialect").value;
	} else {
		src_dialect = src_language[document.querySelector("#select_src_language").selectedIndex][1][0];
	};
	console.log('update_src_country(): src_dialect =', src_dialect);
}


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

	if (dst_dialect == "yue-Hant-HK") {
		dst = "zh-TW";
	}
	if (dst_dialect == "cmn-Hans-CN") {
		dst = "zh-CN";
	}
	if (dst_dialect == "cmn-Hans-HK") {
		dst = "zh-CN";
	}
	if (dst_dialect == "cmn-Hant-TW") {
		dst = "zh-TW";
	}

	dst_language_index = document.querySelector("#select_dst_language").selectedIndex;
	//localStorage.setItem("dst_language_index", dst_language_index);
	if (dst_language[dst_language_index].length>2) {
		for (var j=0;j<document.querySelector("#select_dst_dialect").length;j++) {
			if (document.querySelector("#select_dst_dialect")[j].value===dst_dialect) {
				dst_dialect_index = j;
				document.querySelector("#select_dst_dialect").selectedIndex = dst_dialect_index;
				//localStorage.setItem("dst_dialect_index", dst_dialect_index);
				break;
			}
		}
	}
	if (dst_language[dst_language_index].length>2) {
		dst_dialect = document.querySelector("#select_dst_dialect").value;
	} else {
		dst_dialect = dst_language[document.querySelector("#select_dst_language").selectedIndex][1][0];
	};
	console.log('update_dst_country(): dst_dialect =', dst_dialect);
}


function parseURL(url) {
  var isRelative = /^(ftp|file|gopher|https?|wss?)(:|$)/.test(url),
      urlRegex, urlMatch, authorityRegex, authorityMatch;

  var ALPHA = 'a-zA-Z';
  var DIGIT = '0-9';
  var SUB_DELIMITERS = '\!\$&\'\(\)\*\+\,;\=\\[\\]';
  var UNRESERVED = ALPHA + DIGIT + '\-\._~';
  var SCHEME = '(([' + ALPHA + ']+[' + ALPHA + DIGIT + '\+\-\.' + ']*):)';
  var PATH = '([' + SUB_DELIMITERS + UNRESERVED + '@%\:\/ ' + ']*)';
  var QUERY = '(\\?([' + SUB_DELIMITERS + UNRESERVED + '@%\:\/\? ' + ']*))?';
  var FRAGMENT = '(#([' + SUB_DELIMITERS + UNRESERVED + '@%\:\/\? ' + ']*))?';

  if (isRelative) {
    urlRegex = new RegExp('^' + SCHEME + '(\/\/([^/?#]*))?' + PATH + QUERY + FRAGMENT + '$');
    authorityRegex = new RegExp('^((([' + SUB_DELIMITERS + UNRESERVED + '%' + ']+)?(:([' +
      SUB_DELIMITERS + UNRESERVED + '%\:' + ']*))?)@)?' + '([' + SUB_DELIMITERS +
      UNRESERVED + '%' + ']*)?(:([' + DIGIT + ']+))?$');
  } else {
    urlRegex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;
    authorityRegex = /^((([^:/?#@]+)?(:([^/?#@]*))?)@)?([^/?#:]*)?(:([0-9]+))?$/;
  }

  urlMatch = url.match(urlRegex);
  if (!urlMatch) {
    return null;
  }

  authorityMatch = urlMatch[4] && urlMatch[4].match(authorityRegex);
  if (!authorityMatch) {
    return null;
  }

  return {
    scheme: urlMatch[2] || '',
    path: urlMatch[5] || '',
    search: urlMatch[7] || '',
    fragment: urlMatch[9] || '',
    query: parseQuery(urlMatch[7]),
    username: authorityMatch[3] || '',
    password: authorityMatch[5] || '',
    hostname: authorityMatch[6] || '',
    port: authorityMatch[8] || '',
    host: authorityMatch[6] + (authorityMatch[8] ? ':' + authorityMatch[8] : ''),
    schemeData: url.slice(urlMatch[2].length + 1)
  };
}


function parseQuery(url) {
  var parts, subpart, name, value, index,
      obj = {};

  if (!url) {
    return obj;
  }

  if (url[0] === '?') {
    url = url.substring(1);
  }

  parts = url.split('&');

  for (var i = 0, il = parts.length; i < il; i++) {
    subpart = parts[i];
    index = subpart.indexOf('=');
    if (index === -1) {
      obj[decodeURIComponent(subpart)] = '';
      continue;
    }
    name = subpart.substring(0, index);
    if (name) {
      value = subpart.substring(index + 1);
      obj[decodeURIComponent(name)] = value || '';
    }
  }
  return obj;
}


function getVideoPlayerID(url) {
  var urlObj = URL_String.parseURL(url);
  if (urlObj) {
    return urlObj.hostname === 'youtu.be' ? urlObj.path.slice(1) : urlObj.query.v;
  }
  return null;
}


function insert_videojs_script() {
	//video_script$=$('<link rel="stylesheet" href="https://unpkg.com/video.js/dist/video-js.css" > <script src="https://unpkg.com/video.js/dist/video.js"></script> <script src="https://unpkg.com/@videojs/http-streaming@2.14.2/dist/videojs-http-streaming.min.js"></script>')
	video_script$=$('<link rel="stylesheet" href="https://unpkg.com/video.js/dist/video-js.css" > <script src="https://unpkg.com/video.js/dist/video.js"></script> <script src="https://unpkg.com/@videojs/http-streaming@2.14.2/dist/videojs-http-streaming.js"></script>')
	console.log('appending video_script to html body');
	video_script$.appendTo('body');
}


function embed(){
	var url = url_box.value;
	var original_url = url_box.value;
	if ((url.includes('youtu.be'))||(url.includes('youtube'))) {
		var ytID=getVideoPlayerID(url);
		var src="https://www.youtube.com/embed/"+ytID;
		url = src;
		document.querySelector("#yt_iframe").style.display = "block";
		yt_iframe.src = url;
		url_box.value=original_url;
	}
	if (url.includes("mp4")) {
		insert_videojs_script();
		document.querySelector("#my_video").style.display = "block";
		document.querySelector("#video_source").src = url;
		document.querySelector("#video_source").type = "video/mp4";
	}
	if (url.includes("m3u8")) {
		insert_videojs_script();
		document.querySelector("#my_video").style.display = "block";
		document.querySelector("#video_source").src = url;
		document.querySelector("#video_source").type = "application/x-mpegURL";
	}

}


if (document.querySelector("#yt_iframe")) {
	//document.querySelector("#yt_iframe").style.width = String(window.innerWidth) + 'px';
	//document.querySelector("#yt_iframe").style.height = String(window.innerHeight) + 'px';
	document.querySelector("#yt_iframe").style.width = '100%';
	document.querySelector("#yt_iframe").style.height = '100%';

	window.onresize = (function(){
		document.querySelector("#yt_iframe").style.position='absolute';
		//document.querySelector("#yt_iframe").style.width = String(window.innerWidth) + 'px';
		//document.querySelector("#yt_iframe").style.height = String(window.innerHeight) + 'px';
		document.querySelector("#yt_iframe").style.width = '100%';
		document.querySelector("#yt_iframe").style.height = '100%';
	});
}

//console.log(document.querySelector("#my_video"));
if (document.querySelector("#my_video")) {
	//document.querySelector("#my_video").style.width = String(window.innerWidth) + 'px';
	//document.querySelector("#my_video").style.height = String(window.innerHeight) + 'px';
	document.querySelector("#my_video").style.width = '100%';
	document.querySelector("#my_video").style.height = '100%';

	window.onresize = (function(){
		document.querySelector("#my_video").style.position='absolute';
		//document.querySelector("#my_video").style.width = String(window.innerWidth) + 'px';
		//document.querySelector("#my_video").style.height = String(window.innerHeight) + 'px';
		document.querySelector("#my_video").style.width = '100%';
		document.querySelector("#my_video").style.height = '100%';
	});
}


const URL_String = {
	parseURL: parseURL,
	parseQuery: parseQuery
};


recognizing = false;
document.querySelector("#checkbox_show_src").checked = true;
document.querySelector("#checkbox_show_dst").checked = true;
show_src = document.querySelector("#checkbox_show_src").checked;
show_dst = document.querySelector("#checkbox_show_dst").checked;


function create_modal_text_area() {
	console.log("Create modal text area");

	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	input_src_container_width_factor = document.getElementById("input_src_container_width_factor");
	src_container_width_factor = input_src_container_width_factor.value;
	input_src_container_height_factor = document.getElementById("input_src_container_height_factor");
	src_container_height_factor = input_src_container_height_factor.value;

	input_dst_container_width_factor = document.getElementById("input_dst_container_width_factor");
	dst_container_width_factor = input_dst_container_width_factor.value;
	input_dst_container_height_factor = document.getElementById("input_dst_container_height_factor");
	dst_container_height_factor = input_dst_container_height_factor.value;

	video_info = getVideoPlayerInfo();
	if (video_info) {
		console.log("Video player found");
		console.log("Id:", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		//src_width = src_container_width_factor*window.innerWidth;
		src_width = src_container_width_factor*video_info.width;
		//console.log('src_width =', src_width);

		//src_height = src_container_height_factor*window.innerHeight;
		src_height = src_container_height_factor*video_info.height;
		//console.log('src_height =', src_width);

		//src_top = 0.25*window.innerHeight;
		src_top = video_info.top + 0.02*video_info.height;
		//console.log('src_top =', src_top);

		//src_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//src_left = 0.5*(window.innerWidth-src_width);
		src_left = video_info.left + 0.5*(video_info.width-src_width);
		//console.log('src_left =', src_left);

		//dst_width = dst_container_width_factor*window.innerWidth;
		dst_width = dst_container_width_factor*video_info.width;
		//console.log('dst_width =', dst_width);
		
		//dst_height = dst_container_height_factor*window.innerHeight;
		dst_height = dst_container_height_factor*video_info.height;
		//console.log('dst_height =', dst_height);

		//dst_top = 0.75*window.innerHeight;
		dst_top = video_info.top + 0.6*video_info.height;
		//console.log('dst_top =', dst_top);

		//dst_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//dst_left = 0.5*(window.innerWidth-dst_width);
		dst_left = video_info.left + 0.5*(video_info.width-dst_width);
		//console.log('dst_left =', dst_left);

	} else {
		console.log("No video player found on this page.");

		src_width = src_container_width_factor*window.innerWidth;
		//console.log('src_width =', src_width);

		src_height = src_container_height_factor*window.innerHeight;
		//console.log('src_height =', src_width);

		src_top = 0.25*window.innerHeight;
		//console.log('src_top =', src_top);

		src_left = 0.5*(window.innerWidth-src_width);
		//console.log('src_left =', src_left);

		dst_width = dst_container_width_factor*window.innerWidth;
		//console.log('dst_width =', dst_width);
		
		dst_height = dst_container_height_factor*window.innerHeight;
		//console.log('dst_height =', dst_height);

		dst_top = 0.75*window.innerHeight;
		//console.log('dst_top =', dst_top);

		dst_left = 0.5*(window.innerWidth-dst_width);
		//console.log('dst_left =', dst_left);
	}

	var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
		.width(src_width)
		.height(src_height)
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
			'fontFamily': src_selected_font + ', sans-serif',
			'fontSize': src_font_size,
			'color': src_font_color,
			'backgroundColor': hexToRgba(input_src_container_color.value, input_src_container_opacity.value),
			'border': 'none',
			'display': 'block',
			'overflow': 'hidden',
			'z-index': '2147483647'
		})
		//.offset({top:0.25*window.innerHeight, left:0.5*(window.innerWidth-src_container_width_factor*window.innerWidth)})
		//.offset({top: document.querySelector("#yt_iframe").style.top + 0.15*document.querySelector("#yt_iframe").style.height, left:document.querySelector("#yt_iframe").style.left + 0.5*(document.querySelector("#yt_iframe").style.width-0.5*document.querySelector("#yt_iframe").style.width)})
		//.offset({top: document.querySelector("#yt_iframe").style.top + 0.15*document.querySelector("#yt_iframe").style.height, left:0.5*(window.innerWidth-0.5*window.innerWidth)})
		.offset({top:src_top, left:src_left})

	if (!document.querySelector("#src_textarea_container")) {
		console.log('appending src_textarea_container to html body');
		src_textarea_container$.appendTo('body');
	} else {
		console.log('src_textarea_container has already exist');
	}

	document.querySelector("#src_textarea").style.width = '100%';
	document.querySelector("#src_textarea").style.height = '100%';
	document.querySelector("#src_textarea").style.border = 'none';
	document.querySelector("#src_textarea").style.display = 'inline-block';
	document.querySelector("#src_textarea").style.overflow = 'hidden';
	document.querySelector("#src_textarea").style.allow="fullscreen";

	document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
	document.querySelector("#src_textarea").style.color = src_font_color;
	document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(input_src_container_color.value, input_src_container_opacity.value);
	//src_h0 = $('#src_textarea').height();
	//document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h0)+'px';
	document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';
	document.querySelector("#src_textarea").offsetParent.onresize = (function(){
		//src_h = $('#src_textarea').height();
		//document.querySelector("#src_textarea").style.fontSize=String(0.28*src_h)+'px';
		document.querySelector("#src_textarea").style.position='absolute';
		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';

		console.log('src_width = ', document.querySelector("#src_textarea").getBoundingClientRect().width);
		console.log('video_info.width = ', video_info.width);
		src_container_width_factor = document.querySelector("#src_textarea").getBoundingClientRect().width/video_info.width;
		console.log('src_container_width_factor = ', src_container_width_factor);
		input_src_container_width_factor.value = src_container_width_factor;
		localStorage.setItem("src_container_width_factor", src_container_width_factor);

		console.log('src_height = ', document.querySelector("#src_textarea").getBoundingClientRect().height);
		console.log('video_info.height = ', video_info.height);
		src_container_height_factor = document.querySelector("#src_textarea").getBoundingClientRect().height/video_info.height;
		console.log('src_container_height_factor = ', src_container_height_factor);
		input_src_container_height_factor.value = src_container_height_factor;
		localStorage.setItem("src_container_height_factor", src_container_height_factor);

	});


	var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
		.width(dst_width)
		.height(dst_height)
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
			'fontFamily': dst_selected_font + ', sans-serif',
			'fontSize': dst_font_size,
			'color': dst_font_color,
			'backgroundColor': hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value),
			'border': 'none',
			'display': 'block',
			'overflow': 'hidden',
			'z-index': '2147483647'
		})
		.offset({top:dst_top, left:dst_left})

	if (!document.querySelector("#dst_textarea_container")) {
		console.log('appending dst_textarea_container to html body');
		dst_textarea_container$.appendTo('body');
	} else {
		console.log('src_textarea_container has already exist');
	}

	document.querySelector("#dst_textarea").style.width = '100%';
	document.querySelector("#dst_textarea").style.height = '100%';
	document.querySelector("#dst_textarea").style.border = 'none';
	document.querySelector("#dst_textarea").style.display = 'inline-block';
	document.querySelector("#dst_textarea").style.overflow = 'hidden';
	document.querySelector("#dst_textarea").style.allow="fullscreen";

	document.querySelector("#src_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
	document.querySelector("#dst_textarea").style.color = dst_font_color;
	document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value);
	document.querySelector("#dst_textarea").style.fontSize=String(dst_font_size)+'px';
	//dst_h0 = $('#dst_textarea').height();
	document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
		//dst_h = $('#dst_textarea').height();
		//document.querySelector("#dst_textarea").style.fontSize=String(0.28*dst_h)+'px';
		document.querySelector("#dst_textarea").style.position='absolute';
		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';

		console.log('dst_width = ', document.querySelector("#dst_textarea").getBoundingClientRect().width);
		console.log('video_info.width = ', video_info.width);
		dst_container_width_factor = document.querySelector("#dst_textarea").getBoundingClientRect().width/video_info.width;
		console.log('dst_container_width_factor = ', dst_container_width_factor);
		input_dst_container_width_factor.value = dst_container_width_factor;
		localStorage.setItem("dst_container_width_factor", dst_container_width_factor);

		console.log('dst_height = ', document.querySelector("#dst_textarea").getBoundingClientRect().height);
		console.log('video_info.height = ', video_info.height);
		dst_container_height_factor = document.querySelector("#dst_textarea").getBoundingClientRect().height/video_info.height;
		console.log('dst_container_height_factor = ', dst_container_height_factor);
		input_dst_container_height_factor.value = dst_container_height_factor;
		localStorage.setItem("dst_container_height_factor", input_dst_container_height_factor);

	});

	document.documentElement.scrollTop = video_info.top; // For modern browsers
	document.body.scrollTop = video_info.top; // For older browsers

}

function hide_src_textarea() {
	if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
	if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").style.display = 'none';
}

function show_src_textarea() {
	if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'block';
	if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").style.display = 'inline-block';
}

function hide_dst_textarea() {
	if (document.querySelector("#dst_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
	if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'none';
}

function show_dst_textarea() {
	if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
	if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';
}


window.addEventListener('resize', function(event){

	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	input_src_container_width_factor = document.getElementById("input_src_container_width_factor");
	src_container_width_factor = input_src_container_width_factor.value;
	input_src_container_height_factor = document.getElementById("input_src_container_height_factor");
	src_container_height_factor = input_src_container_height_factor.value;

	video_info = getVideoPlayerInfo();
	if (video_info) {
		console.log('Window is resized');
		console.log("Video player found");
		console.log("Id:", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		//src_width = src_container_width_factor*window.innerWidth;
		src_width = src_container_width_factor*video_info.width;
		//console.log('src_width =', src_width);

		//src_height = src_container_height_factor*window.innerHeight;
		src_height = src_container_height_factor*video_info.height;
		//console.log('src_height =', src_width);

		//src_top = 0.25*window.innerHeight;
		src_top = video_info.top + 0.02*video_info.height;
		//console.log('src_top =', src_top);

		//src_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//src_left = 0.5*(window.innerWidth-src_width);
		src_left = video_info.left + 0.5*(video_info.width-src_width);
		//console.log('src_left =', src_left);

		//dst_width = dst_container_width_factor*window.innerWidth;
		dst_width = dst_container_width_factor*video_info.width;
		//console.log('dst_width =', dst_width);
		
		//dst_height = dst_container_height_factor*window.innerHeight;
		dst_height = dst_container_height_factor*video_info.height;
		//console.log('dst_height =', dst_height);

		//dst_top = 0.75*window.innerHeight;
		dst_top = video_info.top + 0.6*video_info.height;
		//console.log('dst_top =', dst_top);

		//dst_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		//dst_left = 0.5*(window.innerWidth-dst_width);
		dst_left = video_info.left + 0.5*(video_info.width-dst_width);
		//console.log('dst_left =', dst_left);

	} else {
		console.log("No video player found on this page.");

		src_width = src_container_width_factor*window.innerWidth;
		//console.log('src_width =', src_width);

		src_height = src_container_height_factor*window.innerHeight;
		//console.log('src_height =', src_width);

		src_top = 0.25*window.innerHeight;
		//console.log('src_top =', src_top);

		//src_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		src_left = 0.5*(window.innerWidth-src_width);
		//console.log('src_left =', src_left);

		dst_width = dst_container_width_factor*window.innerWidth;
		//console.log('dst_width =', dst_width);
		
		dst_height = dst_container_height_factor*window.innerHeight;
		//console.log('dst_height =', dst_height);

		dst_top = 0.75*window.innerHeight;
		//console.log('dst_top =', dst_top);

		//dst_left = 0.2*(window.innerWidth-0.5*window.innerWidth);
		dst_left = 0.5*(window.innerWidth-dst_width);
		//console.log('dst_left =', dst_left);
	}


	if (document.querySelector("#src_textarea_container")) {
		document.querySelector("#src_textarea_container").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea_container").style.width = String(src_width)+'px';
		document.querySelector("#src_textarea_container").style.height = String(src_height)+'px';
		document.querySelector("#src_textarea_container").style.top = String(src_top)+'px';
		document.querySelector("#src_textarea_container").style.left = String(src_left)+'px';

		var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
			.width(src_width)
			.height(src_height)
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
				'fontFamily': src_selected_font + ', sans-serif',
				'fontSize': src_font_size,
				'color': src_font_color,
				'backgroundColor': hexToRgba(input_src_container_color.value, input_src_container_opacity.value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:src_top, left:src_left})

		document.querySelector("#src_textarea").style.width = String(src_width)+'px';
		document.querySelector("#src_textarea").style.height = String(src_height)+'px';
		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		//document.querySelector("#src_textarea").style.color = 'yellow';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';

		document.querySelector("#src_textarea").style.fontFamily = src_selected_font + ", sans-serif";
		document.querySelector("#src_textarea").style.color = src_font_color;
		document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(input_src_container_color.value, input_src_container_opacity.value);
		//src_h0 = $('#src_textarea').height();
		//document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h0)+'px';
		document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';
		//if (document.querySelector("#src_textarea").offsetParent) {
			//document.querySelector("#src_textarea").offsetParent.onresize = (function(){
			//	src_h = $('#src_textarea').height();
			//	document.querySelector("#src_textarea").style.fontSize=String(0.35*src_h)+'px';
			//	document.querySelector("#src_textarea").scrollTop=document.querySelector("#src_textarea").scrollHeight;
			//});
		//}
	}

	if (document.querySelector("#dst_textarea_container")) {
		document.querySelector("#dst_textarea_container").style.fontFamily = dst_selected_font + ", sans-serif";
		document.querySelector("#dst_textarea_container").style.width = String(dst_width)+'px';
		document.querySelector("#dst_textarea_container").style.height = String(dst_height)+'px';
		document.querySelector("#dst_textarea_container").style.top = String(dst_top)+'px';
		document.querySelector("#dst_textarea_container").style.left = String(dst_left)+'px';

		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
			.width(dst_width)
			.height(dst_height)
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
				'fontFamily': dst_selected_font + ', sans-serif',
				'font-size': dst_font_size,
				'color': dst_font_color,
				'backgroundColor': hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:dst_top, left:dst_left})

		document.querySelector("#dst_textarea").style.width = String(dst_width)+'px';
		document.querySelector("#dst_textarea").style.height = String(dst_height)+'px';
		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		//document.querySelector("#dst_textarea").style.color = 'yellow';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';

		document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
		document.querySelector("#dst_textarea").style.color = dst_font_color;
		document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(input_dst_container_color.value, input_dst_container_opacity.value);
		//dst_h0 = $('#dst_textarea').height();
		//document.querySelector("#dst_textarea").style.fontSize=String(0.35*src_h0)+'px';
		document.querySelector("#dst_textarea").style.fontSize=String(dst_font_size)+'px';
		//if (document.querySelector("#dst_textarea").offsetParent) {
			//document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
			//	dst_h = $('#dst_textarea').height();
			//	document.querySelector("#dst_textarea").style.fontSize=String(0.35*dst_h)+'px';
			//	document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
			//});
		//}
	}
});


if (document.querySelector("#dst_textarea")) {
	document.addEventListener('DOMContentLoaded', (event) => {
		document.querySelector("#dst_textarea").addEventListener('input', () => {
			const value = document.querySelector("#dst_textarea").value;
			if (value.includes('%20')) {
				console.log('dst_textarea contains %20');
				value = value.replace('\\%20/g', ' ');
				document.querySelector("#dst_textarea").value = formattedText(value);
			}
			if (value.includes('%3E')) {
				console.log('dst_textarea contains %3E');
				value = value.replace('\\%3E/g', '>');
				document.querySelector("#dst_textarea").value = formattedText(value);
			}
			value = value.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
		});
	});
};



console.log('Initializing recognition: recognizing =', recognizing);
var final_transcript = '';
var interim_transcript = '';
if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
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
		startTimestamp = formatTimestamp(new Date());
		resetPauseTimeout();
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

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


	recognition.onerror = function(event) {
		resetPauseTimeout();
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

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

		session_end_time = formatTimestamp(new Date());
		console.log('session_end_time =', session_end_time);

		if (!recognizing) {
			document.querySelector("#start_img").src = 'images/mic.gif';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onend: stopping because recognizing =', recognizing);

			var t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
			if (t) {
				// Split text into an array of lines
				var lines = t.trim().split('\n');
				// Use a Set to filter out duplicate lines
				var uniqueLines = [...new Set(lines)];
				//console.log('uniqueLines = ', uniqueLines);

				// Join the unique lines back into a single string
				var uniqueText;
				var newUniqueLines = [];
				var timestamps = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;

				if (uniqueLines.length===1 && uniqueLines[0] != '' && uniqueLines[0] != 'undefined') {
					//console.log('uniqueLines.length===1');
					const timestamps = uniqueLines[0].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);
					if (!timestamps) {
						var lastUniqueLines = `${session_start_time} ${timestamp_separator} ${session_end_time} : ${uniqueLines[0]}`;
						console.log('lastUniqueLines = ', lastUniqueLines);
						uniqueLines[0] = lastUniqueLines;
						uniqueText = newUniqueLines.join('\n');
						uniqueText = uniqueText + '\n';
					}
				}
				else if (uniqueLines.length>1 && uniqueLines[uniqueLines.length-1] != '' && !timestamps.test(uniqueLines[uniqueLines.length-1])) {
					//console.log('uniqueLines.length>1');
					var lastUniqueLines = `${startTimestamp} ${timestamp_separator} ${session_end_time} : ${uniqueLines[uniqueLines.length-1]}`;
					console.log('lastUniqueLines = ', lastUniqueLines);
					uniqueLines[uniqueLines.length-1] = lastUniqueLines;
					for (var i=0; i<uniqueLines.length; i++) {
						newUniqueLines.push(uniqueLines[i]);
					}
					console.log('newUniqueLines = ', newUniqueLines);
					uniqueText = newUniqueLines.join('\n');
					uniqueText = uniqueText + '\n';
				}
				else if (uniqueLines.length>1 && uniqueLines[uniqueLines.length-1] != '' && timestamps.test(uniqueLines[uniqueLines.length-1])) {
					//console.log('uniqueLines.length>1 && timestamps.test(uniqueLines[uniqueLines.length-1]');
					uniqueText = uniqueLines.join('\n');
					uniqueText = uniqueText + '\n';
				}

				if (uniqueText) saveTranscript(uniqueText);

				formatted_all_final_transcripts = '';
				all_final_transcripts = [];

				if (uniqueText) var tt=gtranslate(uniqueText,src,dst).then((result => {
					//console.log('1769:result = ', result);
					result = result.replace();
					result = result.replace(/(\d+),(\d+)/g, '$1.$2');
					result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
					result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
					result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
					result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');
					result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
					result = capitalizeSentences(result);
					result = formatText(result);
					result = result.replace(/\n\s*$/, '');
					timestamped_translated_final_and_interim_transcript = result + "\n";
					//console.log('818:timestamped_translated_final_and_interim_transcript = ', timestamped_translated_final_and_interim_transcript);
					if (timestamped_translated_final_and_interim_transcript) saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
					timestamped_translated_final_and_interim_transcript = '';
					lines = '';
					uniqueLines = [];
					uniqueText = '';
					t = '';
				}));
			}

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
		resetPauseTimeout();
		show_src = document.querySelector("#checkbox_show_src").checked;
		show_dst = document.querySelector("#checkbox_show_dst").checked;
        update_src_country();
        update_dst_country();

        var interim_transcript = '';

		if (!recognizing) {
			final_transcript='';
			interim_transcript='';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onresult: stopping because recognizing =', recognizing);
			return;

		} else {
			recognition.lang=src_dialect;
			var interim_transcript = '';

			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					//final_transcript += event.results[i][0].transcript;
					//final_transcript = final_transcript + '.\n'
					//final_transcript = capitalize(final_transcript);
					//final_transcript = remove_linebreak(final_transcript);
					interim_transcript = '';
					interim_started = false;
					endTimestamp = formatTimestamp(new Date());
					final_transcript += `${startTimestamp} ${timestamp_separator} ${endTimestamp} : ${capitalize(event.results[i][0].transcript)}`;
					final_transcript = final_transcript + '.\n'
					all_final_transcripts.push(`${final_transcript}`);
					//console.log('864:all_final_transcripts = ', all_final_transcripts);

					formatted_all_final_transcripts = all_final_transcripts.join("");
					console.log('formatted_all_final_transcripts = ', formatted_all_final_transcripts);

				} else {
					if (!interim_started) {
						startTimestamp = formatTimestamp(new Date());
						interim_started = true; // Set the flag to true
					}
					interim_transcript += event.results[i][0].transcript;
					interim_transcript = remove_linebreak(interim_transcript);
					interim_transcript = capitalize(interim_transcript);
					//console.log('interim_transcript = ', interim_transcript);
				}
			}

			timestamped_final_and_interim_transcript = final_transcript + interim_transcript;
			if (containsColon(timestamped_final_and_interim_transcript)) {
				timestamped_final_and_interim_transcript = capitalizeSentences(timestamped_final_and_interim_transcript);
				//console.log('capitalizeSentences(timestamped_final_and_interim_transcript) = ', timestamped_final_and_interim_transcript);
			}

			formatted_all_final_transcripts = all_final_transcripts.join("");
			//console.log('formatted_all_final_transcripts = ', formatted_all_final_transcripts);


			//console.log('show_src =', show_src);
			if (show_src) {
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'block';
				//if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").innerHTML = final_transcript + interim_transcript;
				//if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = timestamped_final_and_interim_transcript;

				var t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
				//console.log('t = ', t);
				if (t) {
					// Split text into an array of lines
					var lines = t.trim().split('\n');
					// Use a Set to filter out duplicate lines
					var uniqueLines = [...new Set(lines)];
					// Join the unique lines back into a single string
					var uniqueText = uniqueLines.join('\n');
					//console.log('document.querySelector("#src_textarea").value = ', uniqueText);
					uniqueText = uniqueText.replace('undefined', '');
				}

				if (uniqueText && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = uniqueText;
				if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;

			} else {
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			}

			//timestamped_final_and_interim_transcript = document.querySelector("#src_textarea").value;
			//timestamped_final_and_interim_transcript = timestamped_transcript+interim_transcript;

			//console.log('show_dst =', show_dst);
			if (show_dst) {
				console.log('dst =', dst);
				//var  t = final_transcript + interim_transcript;
				//var t = timestamped_final_and_interim_transcript;
				var t = uniqueText;
				if ((Date.now() - translate_time > 1000) && recognizing) {
					if (t) var tt=gtranslate(t,src,dst).then((result => {
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
						result = result.replace(/(\d+),(\d+)/g, '$1.$2');
						result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
						result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
						result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
						result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
						result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');
						result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
						result = capitalizeSentences(result);
						result = formatText(result);
						result = result.replace(/\n\s*$/, '');
						if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value=result;
						if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").scrollTop=document.querySelector("#dst_textarea").scrollHeight;
					}));
					translate_time = Date.now();
				};
			} else {
				if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			}
			timestamped_translated_final_and_interim_transcript = document.querySelector("#dst_textarea").value;
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
    //return s.replace(first_char, function(m) { return m.toUpperCase(); });

    // Check if the sentence is not empty
    if (s && s.length > 0) {
        // Capitalize the first character and concatenate it with the rest of the sentence
        return (s.trimLeft()).charAt(0).toUpperCase() + (s.trimLeft()).slice(1);
    } else {
        // If the sentence is empty, return it as is
        return s;
    }
}


function startButton(event) {

	document.documentElement.scrollTop = 0; // For modern browsers
	document.body.scrollTop = 0; // For older browsers

	input_src_container_width_factor = document.getElementById("input_src_container_width_factor");
	src_container_width_factor = input_src_container_width_factor.value;
	input_src_container_height_factor = document.getElementById("input_src_container_height_factor");
	src_container_height_factor = input_src_container_height_factor.value;

	input_dst_container_width_factor = document.getElementById("input_dst_container_width_factor");
	dst_container_width_factor = input_dst_container_width_factor.value;
	input_dst_container_height_factor = document.getElementById("input_dst_container_height_factor");
	dst_container_height_factor = input_dst_container_height_factor.value;

	video_info = getVideoPlayerInfo();
	if (video_info) {
		console.log("Video player found");
		console.log("video_info.id = ", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		//src_width = src_container_width_factor*window.innerWidth;
		src_width = src_container_width_factor*video_info.width;
		//console.log('src_width =', src_width);

		//src_height = src_container_height_factor*window.innerHeight;
		src_height = src_container_height_factor*video_info.height;
		//console.log('src_height =', src_width);

		//src_top = 0.25*window.innerHeight;
		src_top = video_info.top + 0.02*video_info.height;
		//console.log('src_top =', src_top);

		//src_left = 0.5*(window.innerWidth-src_width);
		src_left = video_info.left + 0.5*(video_info.width-src_width);
		//console.log('src_left =', src_left);

		//dst_width = dst_container_width_factor*window.innerWidth;
		dst_width = dst_container_width_factor*video_info.width;
		//console.log('dst_width =', dst_width);
		
		//dst_height = dst_container_height_factor*window.innerHeight;
		dst_height = dst_container_height_factor*video_info.height;
		//console.log('dst_height =', dst_height);

		//dst_top = 0.75*window.innerHeight;
		dst_top = video_info.top + 0.6*video_info.height;
		//console.log('dst_top =', dst_top);

		//dst_left = 0.5*(window.innerWidth-dst_width);
		dst_left = video_info.left + 0.5*(video_info.width-dst_width);
		//console.log('dst_left =', dst_left);

	} else {
		console.log("No video player found on this page.");

		src_width = src_container_width_factor*window.innerWidth;
		//console.log('src_width =', src_width);

		src_height = src_container_height_factor*window.innerHeight;
		//console.log('src_height =', src_width);

		src_top = 0.25*window.innerHeight;
		//console.log('src_top =', src_top);

		src_left = 0.5*(window.innerWidth-src_width);
		//console.log('src_left =', src_left);

		dst_width = dst_container_width_factor*window.innerWidth;
		//console.log('dst_width =', dst_width);
		
		dst_height = dst_container_height_factor*window.innerHeight;
		//console.log('dst_height =', dst_height);

		dst_top = 0.75*window.innerHeight;
		//console.log('dst_top =', dst_top);

		dst_left = 0.5*(window.innerWidth-dst_width);
		//console.log('dst_left =', dst_left);
	}


	show_src = document.querySelector("#checkbox_show_src").checked;
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	src_dialect = document.querySelector("#select_src_dialect").value;
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	console.log('src_dialect =', src_dialect);
	console.log('dst_dialect =', dst_dialect);

	recognizing=!recognizing;
	console.log('startButton clicked recognizing =', recognizing);

	if (!recognizing) {
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
		if (document.querySelector("#ajax_dst_textarea_container")) document.querySelector("#ajax_dst_textarea_container").parentElement.removeChild(document.querySelector("#ajax_dst_textarea_container"));
		recognition.stop();
		document.querySelector("#start_img").src = 'images/mic.gif';
		return;

	} else {
		//document.querySelector("#src_textarea").value='';
		//document.querySelector("#dst_textarea").value='';
		create_modal_text_area();
		final_transcript='';
		interim_transcript='';
		recognition.lang = src_dialect;
		start_timestamp = event.timeStamp;
		translate_time = event.timeStamp;
		recognition.start();
		document.querySelector("#start_img").src = 'images/mic-animate.gif';
	}
}

/*
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
					var r=((((response[i][0]).replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
					r=(((r.replace('}','')).replace(')','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
					tt += r;
				}
				if (tt.includes('}'||')'||'%20'||'%3E')) {
					tt=(((tt.replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
				}
				resolve(tt);
			}
		}
		xmlHttp.open('GET', url+params, true);
		xmlHttp.send(null);
		xmlHttp.onreadystatechange();
	});
	return await tt;
};
*/

var translate = async (t, src, dst) => {
	return new Promise((resolve, reject) => {
		const url = 'https://clients5.google.com/translate_a/single?dj=1&dt=t&dt=sp&dt=ld&dt=bd&client=dict-chrome-ex&sl=' 
					+ src + '&tl=' + dst + '&q=' + encodeURIComponent(t);
		var xmlHttp = new XMLHttpRequest();

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState === 4) {
				if (xmlHttp.status === 200) {
					try {
						let response = JSON.parse(xmlHttp.responseText);
						let translatedText = response.sentences.map(sentence => sentence.trans).join('');
						resolve(translatedText);
					} catch (e) {
						reject('Error parsing response: ' + e.message);
					}
				} else {
					reject('Request failed with status: ' + xmlHttp.status);
				}
			}
		};
		xmlHttp.open('GET', url, true);
		xmlHttp.send();
	});
};


/*
var gtranslate = async (t,src,dst) => {
	var tt = new Promise(function(resolve) {
		var i=0, len=0, r='', tt='';
		const url = 'https://translate.googleapis.com/translate_a/'
		var params = 'single?client=gtx&sl='+src+'&tl='+dst+'&dt=t&q='+t;
		var xmlHttp = new XMLHttpRequest();
		var response;
		xmlHttp.onreadystatechange = function(event) {
			if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
				response = JSON.parse(xmlHttp.responseText)[0];
				for (var i = 0, len = response.length; i < len; i++) {
					var r=((((response[i][0]).replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
					r=(((r.replace('}','')).replace(')','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
					tt += r;
				}
				if (tt.includes('}'||')'||'%20'||'%3E')) {
					tt=(((tt.replace('}/g','')).replace(')/g','')).replace('\\%20/g', ' ')).replace('\\%3E/g', '>');
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
*/

var gtranslate = async (t, src, dst) => {
	return new Promise((resolve, reject) => {
		const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + src + '&tl=' + dst + '&dt=t&q=' + encodeURIComponent(t);
		var xmlHttp = new XMLHttpRequest();

		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState === 4) {
				if (xmlHttp.status === 200) {
					try {
						let response = JSON.parse(xmlHttp.responseText)[0];
						let translatedText = response.map(segment => segment[0]).join('');
						resolve(translatedText);
					} catch (e) {
						reject('Error parsing response: ' + e.message);
					}
				} else {
					reject('Request failed with status: ' + xmlHttp.status);
				}
			}
		};
		xmlHttp.open('GET', url, true);
		xmlHttp.send();
	});
};


function getPosition(target) {
	var target_body = target.parents('body');
	if ($('body').get(0) === target_body.get(0)) {
		return {left: target.position().left, top: target.position().top};
	}

	// find the corresponding iframe container
	var iframe = $('iframe').filter(function() {
		var iframe_body = $(this).contents().find('body');
		return target_body.get(0) === iframe_body.get(0);
	});

	// need to adjust the iframe target position by current document scrolling
	var left = $(iframe).offset().left + target.offset().left - $(document).scrollLeft();
	var top = $(iframe).offset().top + target.offset().top - $(document).scrollTop();

	return {left: left, top: top};
}


function saveTranscript(timestamped_final_and_interim_transcript) {
  // Create a Blob with the transcript content
  const blob = new Blob([timestamped_final_and_interim_transcript], { type: 'text/plain' });
  //const blob = new Blob([timestamped_interim_transcript], { type: 'text/plain' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transcript.txt';

  // Programmatically click the anchor element to trigger download
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}


function saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript) {
	console.log('Saving translated transcriptions');

	// Create a Blob with the transcript content
	const blob = new Blob([timestamped_translated_final_and_interim_transcript], { type: 'text/plain' });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create an anchor element
	const a = document.createElement('a');
	a.href = url;
	a.download = 'translated_transcript.txt';

	// Programmatically click the anchor element to trigger download
	a.click();

	// Cleanup
	URL.revokeObjectURL(url);
}


function formatTimestamp(startTimestamp) {
  // Convert startTimestamp to string
  const timestampString = startTimestamp.toISOString();

  // Extract date and time parts
  const datePart = timestampString.slice(0, 10);
  const timePart = timestampString.slice(11, 23);

  // Concatenate date and time parts with a space in between
  return `${datePart} ${timePart}`;
}


function containsColon(sentence) {
    // Check if the sentence includes the colon character
    return sentence.includes(':');
}


function containsSpaceCharacter(sentence) {
    // Check if the sentence includes the colon character
    return sentence.includes('\%20');
}


function getVideoPlayerInfo() {
	var elements = document.querySelectorAll('video, iframe');
	//console.log('elements = ',  elements);
	for (var i = 0; i < elements.length; i++) {
		var rect = elements[i].getBoundingClientRect();
		//console.log('rect', rect);
		if (rect.width > 0) {
			var videoPlayerID = elements[i].id;
			//console.log('videoPlayerID = ',  videoPlayerID);
			return {
				id: elements[i].id,
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height
			};
		}
	}
	//console.log('No video player found');
	return null;
}


function capitalizeSentences(transcription) {
	//console.log('transcription = ', transcription);

    // Split the transcription into individual lines
    const lines = transcription.split('\n');
    
    // Iterate over each line
    for (let i = 0; i < lines.length; i++) {
        // Split each line by colon to separate startTimestamp and sentence
        const parts = lines[i].split(' : ');
		//console.log('parts[0] = ', parts[0]);
		//console.log('parts[1] = ', parts[1]);

        // If the line is in the correct format (startTimestamp : sentence)
        if (parts.length === 2) {
            // Capitalize the first character of the sentence
            const capitalizedSentence = (parts[1].trimLeft()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);

            // Replace the original sentence with the capitalized one
            lines[i] = parts[0] + ' : ' + capitalizedSentence;
			//console.log('i = ', i );
			//console.log('lines[i] = ', lines[i] );
        }
    }
    
    // Join the lines back into a single string and return
	//console.log('lines.join("\n") = ', lines.join('\n'));
    return lines.join('\n');
}



function formatText(text) {
    // Replace URL-encoded spaces with regular spaces
    text = text.replace(/%20/g, ' ');

    // Match timestamps in the text
    const timestamps = text.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);

    if (timestamps) {
        // Split the text based on timestamps
        const lines = text.split(/(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/);

        let formattedText = "";
        for (let line of lines) {
            // Replace the separator format in the timestamps
            line = line.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) *--> *(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/, '$1 --> $2');
            
            // Add the formatted line to the result
            formattedText += line.trim() + "\n";
        }
        
        return formattedText.trim(); // Trim any leading/trailing whitespace from the final result
    } else {
        return text;
    }
}



function readTextFile(filename, callback) {
    // Create a new XMLHttpRequest object
    var xhr = new XMLHttpRequest();
    // Configure it to fetch the file
    xhr.open("GET", filename, true);
    // Set the response type to text
    xhr.responseType = "text";

    // When the request is loaded
    xhr.onload = function() {
        // Check if the request was successful
        if (xhr.status === 200) {
            // Invoke the callback with the file contents
            callback(xhr.response);
        } else {
            // If there was an error, log it
            console.error("Failed to load file: " + filename);
        }
    };

    // When an error occurs during the request
    xhr.onerror = function() {
        // Log the error
        console.error("Failed to load file: " + filename);
    };

    // Send the request
    xhr.send();
}


function resetPauseTimeout() {
	//all_final_transcripts += timestamped_final_and_interim_transcript;
	clearTimeout(pause_timeout);
	pause_timeout = setTimeout(function() {
		console.log("No speech detected for " + pause_threshold / 1000 + " seconds, stopping recognition");
		recognition.stop();
	}, pause_threshold);
}

function hexToRgba(hex, opacity) {
	let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
