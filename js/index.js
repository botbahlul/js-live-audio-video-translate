var recognition, recognizing;
var src, src_language, src_language_index, src_dialect, src_dialect_index, show_src;
var dst, dst_language, dst_language_index, dst_dialect, dst_dialect_index, show_dst;
var show_timestamp_src, show_timestamp_dst;
var src_fonts, dst_fonts;

var src_selected_font_index, src_selected_font, src_font_size, src_font_color;
var src_container_width_factor, src_container_height_factor;
var src_container_top_factor, src_container_left_factor, centerize_src;
var src_container_color, src_container_opacity;

var dst_selected_font_index, dst_selected_font, dst_font_size, dst_font_color;
var dst_container_width_factor, dst_container_height_factor;
var dst_container_top_factor, dst_container_left_factor, centerize_dst;
var dst_container_color, dst_container_opacity;

var video_info, src_width, src_height, src_top, src_left, dst_width, dst_height, dst_top, dst_left;
var startTimestamp, endTimestamp, timestamped_final_and_interim_transcript, timestamped_translated_final_and_interim_transcript;
var timestamp_separator = "-->";
var session_start_time, session_end_time;
var interim_started = false;
var pause_timeout, pause_threshold;
var all_final_transcripts = [], formatted_all_final_transcripts;
var all_translated_transcripts = [], formatted_all_translated_transcripts;
var displayed_transcript, displayed_translation;
var transcript_is_final = false;
var version = "0.2.6"


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
	console.log('localStorage.getItem("src_language_index") = ', src_language_index);
} else {
	src_language_index = 26;
	document.querySelector("#select_src_language").selectedIndex = src_language_index;
}

if (localStorage.getItem("src_dialect")) {
	src_dialect = localStorage.getItem("src_dialect");
	console.log('localStorage.getItem("src_dialect") = ', src_dialect);
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
	console.log('localStorage.getItem("show_src") = ', show_src);
} else {
	show_src = true;
	document.querySelector("#checkbox_show_src").checked = show_src;
}

if (localStorage.getItem("show_timestamp_src")) {
	show_timestamp_src = localStorage.getItem("show_timestamp_src");
	document.querySelector("#checkbox_show_timestamp_src").checked = show_timestamp_src;
	console.log('localStorage.getItem("show_timestamp_src") = ', show_timestamp_src);
} else {
	show_timestamp_src = true;
	document.querySelector("#checkbox_show_timestamp_src").checked = show_timestamp_src;
}

update_src_country();
//console.log('after update_src_country(): src_dialect = ', src_dialect);


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
	console.log('localStorage.getItem("dst_language_index") = ', dst_language_index);
} else {
	dst_language_index = 15;
	document.querySelector("#select_dst_language").selectedIndex = dst_language_index;
}

if (localStorage.getItem("dst_dialect")) {
	dst_dialect = localStorage.getItem("dst_dialect");
	console.log('localStorage.getItem("dst_dialect") = ', dst_dialect);
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
	console.log('localStorage.getItem("show_dst") = ', show_dst);
} else {
	show_dst = true;
	document.querySelector("#checkbox_show_dst").checked = show_dst;
}

if (localStorage.getItem("show_timestamp_dst")) {
	show_timestamp_dst = localStorage.getItem("show_timestamp_dst");
	document.querySelector("#checkbox_show_timestamp_dst").checked = show_timestamp_dst;
	console.log('localStorage.getItem("show_timestamp_dst") = ', show_timestamp_dst);
} else {
	show_timestamp_dst = true;
	document.querySelector("#checkbox_show_timestamp_dst").checked = show_timestamp_dst;
}

update_dst_country();
//console.log('after update_dst_country(): dst_dialect = ', dst_dialect);


recognizing = false;

show_src = document.querySelector("#checkbox_show_src").checked;
show_dst = document.querySelector("#checkbox_show_dst").checked;

show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;

src_selected_font = document.querySelector("#select_src_font").value;
src_font_size = document.querySelector("#input_src_font_size").value;
src_font_color = document.querySelector("#input_src_font_color").value;
src_fonts = getAvailableFonts();
src_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
    document.querySelector("#select_src_font").appendChild(option);
});

dst_selected_font = document.querySelector("#select_dst_font").value;
dst_font_size = document.querySelector("#input_dst_font_size").value;
dst_font_color = document.querySelector("#input_dst_font_color").value;
dst_fonts = getAvailableFonts();
dst_fonts.forEach(function(font) {
	var option = document.createElement("option");
    option.textContent = font;
	document.querySelector("#select_dst_font").appendChild(option);
});

src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;
src_container_top_factor = document.querySelector("#input_src_container_top_factor").value;
src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
centerize_src = document.querySelector("#checkbox_centerize_src").checked;
src_container_color = document.querySelector("#input_src_container_color").value;
src_container_opacity = document.querySelector("#input_src_container_opacity").value;

dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;
dst_container_top_factor = document.querySelector("#input_dst_container_top_factor").value;
dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
centerize_dst = document.querySelector("#checkbox_centerize_dst").checked;
dst_container_color = document.querySelector("#input_dst_container_color").value;
dst_container_opacity = document.querySelector("#input_dst_container_opacity").value;

pause_threshold = document.querySelector("#input_pause_threshold").value;



// Load saved values from localStorage if they were there
if (localStorage.getItem("src_selected_font_index")) {
	src_selected_font_index = localStorage.getItem("src_selected_font_index");
	console.log('localStorage.getItem("src_selected_font_index") = ', src_selected_font_index);
	document.querySelector("#select_src_font").selectedIndex = src_selected_font_index;
	console.log('select_src_font.selectedIndex = ', select_src_font.selectedIndex);
} else {
	src_selected_font_index = 0;
	document.querySelector("#select_src_font").selectedIndex = src_selected_font_index;
}

if (localStorage.getItem("src_selected_font")) {
    src_selected_font = localStorage.getItem("src_selected_font");
	console.log('localStorage.getItem("src_selected_font") = ', src_selected_font);
	document.querySelector("#select_src_font").value = src_selected_font;
} else {
	src_selected_font = "Arial";
	document.querySelector("#select_src_font").value = src_selected_font;
}

if (localStorage.getItem("src_font_size")) {
    src_font_size = localStorage.getItem("src_font_size");
	console.log('localStorage.getItem("src_font_size") = ', src_font_size);
	document.querySelector("#input_src_font_size").value = src_font_size;
} else {
	src_font_size = 18;
	document.querySelector("#input_src_font_size").value = src_font_size;
}

if (localStorage.getItem("src_font_color")) {
	src_font_color = localStorage.getItem("src_font_color");
	console.log('localStorage.getItem("src_font_color") = ', src_font_color);
	document.querySelector("#input_src_font_color").value = src_font_color;
} else {
	src_font_color = "#ffff00";
	document.querySelector("#input_src_font_size").value = src_font_color;
}

if (localStorage.getItem("src_container_width_factor")) {
	src_container_width_factor = localStorage.getItem("src_container_width_factor");
	console.log('localStorage.getItem("src_container_width_factor") = ', src_container_width_factor);
	document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
} else {
	src_container_width_factor = 0.8;
	document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
}

if (localStorage.getItem("src_container_height_factor")) {
	src_container_height_factor = localStorage.getItem("src_container_height_factor");
	console.log('localStorage.getItem("src_container_height_factor") = ', src_container_height_factor);
	document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
} else {
	src_container_height_factor = 0.15;
	document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
}

if (localStorage.getItem("src_container_top_factor")) {
	src_container_top_factor = localStorage.getItem("src_container_top_factor");
	console.log('localStorage.getItem("src_container_top_factor") = ', src_container_top_factor);
	document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
} else {
	src_container_top_factor = 0.02;
	document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
}

if (localStorage.getItem("centerize_src")) {
	centerize_src = localStorage.getItem("centerize_src");
	document.querySelector("#checkbox_centerize_src").checked = centerize_src;
	console.log('localStorage.getItem("centerize_src") = ', centerize_src);
} else {
	centerize_src = true;
	document.querySelector("#checkbox_centerize_src").checked = centerize_src;
}

if (localStorage.getItem("src_container_left_factor")) {
	src_container_left_factor = localStorage.getItem("src_container_left_factor");
	console.log('localStorage.getItem("src_container_left_factor") = ', src_container_left_factor);
	document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
} else {
	src_container_left_factor = 0.1;
	document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
}

if (localStorage.getItem("src_container_color")) {
	src_container_color = localStorage.getItem("src_container_color");
	console.log('localStorage.getItem("src_container_color") = ', src_container_color);
	document.querySelector("#input_src_container_color").value = src_container_color;
} else {
	src_container_color = "#000000";
	document.querySelector("#input_src_container_color").value = src_container_color;
}

if (localStorage.getItem("src_container_opacity")) {
	src_container_opacity = localStorage.getItem("src_container_opacity");
	console.log('localStorage.getItem("src_container_opacity") = ', src_container_opacity);
	document.querySelector("#input_src_container_opacity").value = src_container_opacity;
} else {
	src_container_opacity = "0.3";
	document.querySelector("#input_src_container_opacity").value = src_container_opacity;
}


if (localStorage.getItem("dst_selected_font_index")) {
	dst_selected_font_index = localStorage.getItem("dst_selected_font_index");
	console.log('localStorage.getItem("dst_selected_font_index") = ', dst_selected_font_index);
	document.querySelector("#select_dst_font").selectedIndex = dst_selected_font_index;
	console.log('select_dst_font.selectedIndex = ', document.querySelector("#select_dst_font").selectedIndex);
} else {
	dst_selected_font_index = 0;
	document.querySelector("#select_dst_font").selectedIndex = dst_selected_font_index;
}

if (localStorage.getItem("dst_selected_font")) {
    dst_selected_font = localStorage.getItem("dst_selected_font");
	console.log('localStorage.getItem("dst_selected_font") = ', dst_selected_font);
	document.querySelector("#select_dst_font").value = dst_selected_font;
} else {
	dst_selected_font = "Arial";
	document.querySelector("#select_dst_font").value = dst_selected_font;
}

if (localStorage.getItem("dst_font_size")) {
    dst_font_size = localStorage.getItem("dst_font_size");
	console.log('localStorage.getItem("dst_font_size") = ', dst_font_size);
	document.querySelector("#input_dst_font_size").value = dst_font_size;
} else {
	dst_font_size = 18;
	document.querySelector("#input_dst_font_size").value = dst_font_size;
}

if (localStorage.getItem("dst_font_color")) {
	dst_font_color = localStorage.getItem("dst_font_color");
	console.log('localStorage.getItem("dst_font_color") = ', dst_font_color);
	document.querySelector("#input_dst_font_color").value = dst_font_color;
} else {
	dst_font_color = "#ffff00";
	document.querySelector("#input_dst_font_size").value = dst_font_color;
}

if (localStorage.getItem("dst_container_width_factor")) {
	dst_container_width_factor = localStorage.getItem("dst_container_width_factor");
	console.log('localStorage.getItem("dst_container_width_factor") = ', dst_container_width_factor);
	document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
} else {
	dst_container_width_factor = 0.8;
	document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
}

if (localStorage.getItem("dst_container_height_factor")) {
	dst_container_height_factor = localStorage.getItem("dst_container_height_factor");
	console.log('localStorage.getItem("dst_container_height_factor") = ', dst_container_height_factor);
	document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
} else {
	dst_container_height_factor = 0.15;
	document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
}

if (localStorage.getItem("dst_container_top_factor")) {
	dst_container_top_factor = localStorage.getItem("dst_container_top_factor");
	console.log('localStorage.getItem("dst_container_top_factor") = ', dst_container_top_factor);
	document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
} else {
	dst_container_top_factor = 0.65;
	document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
}

if (localStorage.getItem("centerize_dst")) {
	centerize_dst = localStorage.getItem("centerize_dst");
	document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
	console.log('localStorage.getItem("centerize_dst") = ', centerize_dst);
} else {
	centerize_dst = true;
	document.querySelector("#checkbox_centerize_dst").checked = centerize_dst;
}

if (localStorage.getItem("dst_container_left_factor")) {
	dst_container_left_factor = localStorage.getItem("dst_container_left_factor");
	console.log('localStorage.getItem("dst_container_left_factor") = ', dst_container_left_factor);
	document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
} else {
	dst_container_left_factor = 0.1;
	document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
}

if (localStorage.getItem("dst_container_color")) {
	dst_container_color = localStorage.getItem("dst_container_color");
	console.log('localStorage.getItem("dst_container_color") = ', dst_container_color);
	document.querySelector("#input_dst_container_color").value = dst_container_color;
} else {
	dst_container_color = "#000000";
	document.querySelector("#input_dst_container_color").value = dst_container_color;
}

if (localStorage.getItem("dst_container_opacity")) {
	dst_container_opacity = localStorage.getItem("dst_container_opacity");
	console.log('localStorage.getItem("dst_container_opacity") = ', dst_container_opacity);
	document.querySelector("#input_dst_container_opacity").value = dst_container_opacity;
} else {
	dst_container_opacity = "0.3";
	document.querySelector("#input_dst_container_opacity").value = dst_container_opacity;
}

if (localStorage.getItem("pause_threshold")) {
	pause_threshold = localStorage.getItem("pause_threshold");
	console.log('localStorage.getItem("pause_threshold") = ', pause_threshold);
    document.querySelector("#input_pause_threshold").value = pause_threshold;
} else {
	document.querySelector("#input_pause_threshold").value = 5000;
	pause_threshold = 5000;
}


// Add event listeners for changes in languages and translation select input
document.querySelector("#select_src_language").addEventListener('change', function(){
	update_src_country()
	console.log('document.querySelector("#select_src_language") on change: src = ', src);
	//console.log('document.querySelector("#select_src_language") on change: src_language_index = ', src_language_index);
	localStorage.setItem("src_language_index", src_language_index);
});

document.querySelector("#select_src_dialect").addEventListener('change', function(){
	src_dialect = document.querySelector("#select_src_dialect").value;
	//console.log('document.querySelector("#select_src_dialect") on change: document.querySelector("#select_src_dialect").value = ', document.querySelector("#select_src_dialect").value);
	console.log('document.querySelector("#select_src_dialect") on change: src_dialect = ', src_dialect);
	localStorage.setItem("src_dialect", src_dialect);
	localStorage.setItem("src_dialect_index", src_dialect_index);
});

document.querySelector("#select_dst_language").addEventListener('change', function(){
	update_dst_country();
	console.log('document.querySelector("#select_dst_language") on change: dst = ', dst);
	//console.log('document.querySelector("#select_dst_language") on change:dst_language_index = ', dst_language_index);
	localStorage.setItem("dst_language_index", dst_language_index);
});

document.querySelector("#select_dst_dialect").addEventListener('change', function(){
	console.log('document.querySelector("#select_dst_dialect") on change: dst = ', dst);
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	console.log('document.querySelector("#select_dst_dialect") on change: document.querySelector("#select_dst_dialect").value = ', document.querySelector("#select_dst_dialect").value);
	console.log('document.querySelector("#select_dst_dialect") on change: dst_dialect = ', dst_dialect);
	localStorage.setItem("dst_dialect", dst_dialect);
	localStorage.setItem("dst_dialect_index", dst_dialect_index);
});

document.querySelector("#checkbox_show_src").addEventListener('change', function(){
	show_src = document.querySelector("#checkbox_show_src").checked;
	console.log('document.querySelector("#checkbox_show_src") on change: show_src = ', show_src);
	if (!show_src) {
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
	}
	localStorage.setItem("show_src", show_src);
});

document.querySelector("#checkbox_show_dst").addEventListener('change', function(){
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	console.log('document.querySelector("#checkbox_show_dst") on change: show_dst = ', show_dst);
	if (!show_dst) {
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
	}
	localStorage.setItem("show_dst", show_dst);
});

document.querySelector("#checkbox_show_timestamp_src").addEventListener('change', function(){
	show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
	console.log('document.querySelector("#checkbox_show_timestamp_src") on change: show_timestamp_src = ', show_timestamp_src);
	if (!show_timestamp_src) {
		if (document.querySelector("#src_textarea_container")) {
			var src_text = document.querySelector("#src_textarea").value;
			if (src_text) {
				document.querySelector("#src_textarea").value = removeTimestamps(src_text);
			}
		}
	}
	localStorage.setItem("show_timestamp_src", show_timestamp_src);
});

document.querySelector("#checkbox_show_timestamp_dst").addEventListener('change', function(){
	show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
	console.log('document.querySelector("#checkbox_show_timestamp_dst") on change: show_timestamp_dst = ', show_timestamp_dst);
	if (!show_timestamp_dst) {
		if (document.querySelector("#dst_textarea_container")) {
			var dst_text = document.querySelector("#dst_textarea").value;
			if (dst_text) {
				document.querySelector("#dst_textarea").value = removeTimestamps(dst_text);
			}
		}
	}
	localStorage.setItem("show_timestamp_dst", show_timestamp_dst);
});


// Add event listeners for changes in font select and font size input
document.querySelector("#select_src_font").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_font_size").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_font_size").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_font_color").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_font_color").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_container_width_factor").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_container_width_factor").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_container_height_factor").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_container_height_factor").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_container_top_factor").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_container_top_factor").addEventListener("change", updateSubtitleText);
document.querySelector("#checkbox_centerize_src").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_container_left_factor").addEventListener('input', function(){
	document.querySelector("#checkbox_centerize_src").checked = false;
	updateSubtitleText();
});
document.querySelector("#input_src_container_left_factor").addEventListener('change', function(){
	document.querySelector("#checkbox_centerize_src").checked = false;
	updateSubtitleText();
});
document.querySelector("#input_src_container_color").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_container_color").addEventListener("change", updateSubtitleText);
document.querySelector("#input_src_container_opacity").addEventListener("input", updateSubtitleText);
document.querySelector("#input_src_container_opacity").addEventListener("change", updateSubtitleText);


document.querySelector("#select_dst_font").addEventListener("change", updateSubtitleText);
document.querySelector("#input_dst_font_size").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_font_size").addEventListener("change", updateSubtitleText);
document.querySelector("#input_dst_font_color").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_font_color").addEventListener("change", updateSubtitleText);
document.querySelector("#input_dst_container_width_factor").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_container_width_factor").addEventListener("change", updateSubtitleText);
document.querySelector("#input_dst_container_height_factor").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_container_height_factor").addEventListener("change", updateSubtitleText);
document.querySelector("#input_dst_container_top_factor").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_container_top_factor").addEventListener("change", updateSubtitleText);
document.querySelector("#checkbox_centerize_dst").addEventListener('change', updateSubtitleText);
document.querySelector("#input_dst_container_left_factor").addEventListener('input', function(){
	document.querySelector("#checkbox_centerize_dst").checked = false;
	updateSubtitleText();
});
document.querySelector("#input_dst_container_left_factor").addEventListener('change', function(){
	document.querySelector("#checkbox_centerize_dst").checked = false;
	updateSubtitleText();
});
document.querySelector("#input_dst_container_color").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_container_color").addEventListener("change", updateSubtitleText);
document.querySelector("#input_dst_container_opacity").addEventListener("input", updateSubtitleText);
document.querySelector("#input_dst_container_opacity").addEventListener("change", updateSubtitleText);

// Add event listeners for changes in pause threshold input
document.querySelector("#input_pause_threshold").addEventListener('change', function(){
	pause_threshold = document.querySelector("#input_pause_threshold").value;
	console.log('document.querySelector("#input_pause_threshold") on change: pause_threshold = ', pause_threshold);
	localStorage.setItem("pause_threshold", pause_threshold);
});


window.addEventListener('resize', function(event) {
	regenerate_textarea();
});


document.addEventListener('fullscreenchange', function(event) {
	regenerate_textarea();
});


// Maintain video size when window resized or entering fullscreen mode
if (document.querySelector("#my_yt_iframe")) {
	document.querySelector("#my_yt_iframe").style.width = '100%';
	document.querySelector("#my_yt_iframe").style.height = '100%';

	window.onresize = (function(){
		if (document.querySelector("#my_yt_iframe")) {
			document.querySelector("#my_yt_iframe").style.position = 'absolute';
			document.querySelector("#my_yt_iframe").style.width = '100%';
			document.querySelector("#my_yt_iframe").style.height = '100%';
		}
	});
}

if (document.querySelector("#my_video")) {
	document.querySelector("#my_video").style.width = '100%';
	document.querySelector("#my_video").style.height = '100%';

	window.onresize = (function(){
		if (document.querySelector("#my_video")) {
			document.querySelector("#my_video").style.position = 'absolute';
			document.querySelector("#my_video").style.width = '100%';
			document.querySelector("#my_video").style.height = '100%';
		}
	});
}

if (document.querySelector("#videojs-flvjs-player")) {
	document.querySelector("#videojs-flvjs-player").style.width = '100%';
	document.querySelector("#videojs-flvjs-player").style.height = '100%';

	window.onresize = (function(){
		if (document.querySelector("#videojs-flvjs-player")) {
			document.querySelector("#videojs-flvjs-player").style.position = 'absolute';
			document.querySelector("#videojs-flvjs-player").style.width = '100%';
			document.querySelector("#videojs-flvjs-player").style.height = '100%';
		}
	});
}



if (document.querySelector("#dst_textarea")) {
	document.addEventListener('DOMContentLoaded', (event) => {
		// Intercept for unwanted characters from gtranslate function return values
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


document.querySelector("#embed_button").addEventListener('click', function(){
	embed();
});

document.querySelector("#start_button").addEventListener('click', function(){
	session_start_time = formatTimestampToISOLocalString(new Date());
	//console.log('session_start_time = ', session_start_time);
	startButton(event);
});



// RECOGNITION CORE
console.log('Initializing recognition: recognizing = ', recognizing);
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
	console.log('Initializing recognition: src_dialect = ', src_dialect);
	console.log('Initializing recognition: recognition.lang = ', recognition.lang);

	recognition.onstart = function() {
		final_transcript = '';
		interim_transcript = '';
		startTimestamp = formatTimestampToISOLocalString(new Date());
		resetPauseTimeout();
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

		if (!recognizing) {
			recognizing = false;
			document.querySelector("#start_img").src = 'images/mic.gif';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onstart: stopping because recognizing = ', recognizing);
			return;
		} else {
			console.log('recognition.onstart: recognizing = ', recognizing);
			recognition.lang = src_dialect;
			document.querySelector("#start_img").src = 'images/mic-animate.gif';
		}
	};


	recognition.onerror = function(event) {
		resetPauseTimeout();
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';

		if (event.error === 'no-speech') {
            document.querySelector("#start_img").src = 'images/mic.gif';
			console.log('recognition.no-speech: recognizing = ', recognizing);
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
		}
		if (event.error === 'audio-capture') {
            document.querySelector("#start_img").src = 'images/mic.gif';
			alert('No microphone was found, ensure that a microphone is installed and that microphone settings are configured correctly');
			console.log('recognition.audio-capture: recognizing = ', recognizing);
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
		}
		if (event.error === 'not-allowed') {
			if (Date.now() - start_timestamp < 100) {
				alert('Permission to use microphone is blocked, go to chrome://settings/contentExceptions#media-stream to change it');
			} else {
				alert('Permission to use microphone was denied');
			}
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.not-allowed: recognizing = ', recognizing);
		}
	};

	recognition.onend = function() {
		//final_transcript='';
		//interim_transcript='';
		session_end_time = formatTimestampToISOLocalString(new Date());
		//console.log('session_end_time = ', session_end_time);

		if (!recognizing) {
			final_transcript = '';
			interim_transcript = '';

			document.querySelector("#start_img").src = 'images/mic.gif';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onend: stopping because recognizing = ', recognizing);

			var t = formatted_all_final_transcripts + timestamped_final_and_interim_transcript;
			if (t) {
				t = formatTranscript(t);
				//console.log('t =', t);
				// Split text into an array of lines
				var lines = t.trim().split('\n');
				// Use a Set to filter out duplicate lines
				var unique_lines = [...new Set(lines)];
				unique_lines = removeDuplicates(unique_lines);
				//console.log('unique_lines =', unique_lines);

				// Join the unique lines back into a single string
				var unique_text;
				var newunique_lines = [];
				var timestamps = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/;

				if (unique_lines.length === 1 && unique_lines[0] != '' && unique_lines[0] != 'undefined') {
					const timestamps = unique_lines[0].match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} *--> *\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g);
					if (!timestamps) {
						var lastunique_lines = `${session_start_time} ${timestamp_separator} ${session_end_time} : ${unique_lines[0]}`;
						//console.log('lastunique_lines =', lastunique_lines);
						unique_lines[0] = lastunique_lines;
						unique_text = newunique_lines.join('\n');
						unique_text = unique_text + '\n';
					}
				}
				else if (unique_lines.length>1 && unique_lines[unique_lines.length-1] != '' && !timestamps.test(unique_lines[unique_lines.length-1])) {
					var lastunique_lines = `${startTimestamp} ${timestamp_separator} ${session_end_time} : ${unique_lines[unique_lines.length-1]}`;
					//console.log('lastunique_lines =', lastunique_lines);
					unique_lines[unique_lines.length-1] = lastunique_lines;
					for (var i = 0; i < unique_lines.length; i++) {
						newunique_lines.push(unique_lines[i]);
					}
					//console.log('newunique_lines =', newunique_lines);
					unique_text = newunique_lines.join('\n');
					unique_text = unique_text + '\n';
				}
				else if (unique_lines.length>1 && unique_lines[unique_lines.length-1] != '' && timestamps.test(unique_lines[unique_lines.length-1])) {
					unique_text = unique_lines.join('\n');
					unique_text = unique_text + '\n';
				}

				// SAVING TRANSCRIPTIONS
				if (unique_text) {
					unique_text = unique_text.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
					unique_text = removeEmptySentences(unique_text);
					unique_text = removePeriodOnlySentences(unique_text);
					//console.log('unique_text =', unique_text);

					if (show_timestamp_src) {
						saveTranscript(unique_text);
					} else {
						saveTranscript(removeTimestamps(unique_text));
					}
				}


				// SAVING TRANSLATIONS
				if (unique_text) var tt = gtranslate(unique_text, src, dst).then((result => {
					result = result.replace(/(\d+),(\d+)/g, '$1.$2');

					result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
					result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');

					result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
					result = result.replace(/(\d{2})-\s?(\d{2})-\s?(\d{4})/g, '$1-$2-$3');

					result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
					result = result.replace(/(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{5})/g, '$1-$2-$3');

					result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');

					result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
					result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{2}-\d{2}-\d{5} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);

					result = result.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
					result = result.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

					result = result.replace('.,', '.');
					result = result.replace(',.', ',');
					result = result.replace('. .', '.');

					result = convertDatesToISOFormat(result);
					result = formatTranscript(result);

					result = result.replace(/\n\s*$/, '');

					timestamped_translated_final_and_interim_transcript = result + "\n";
					//console.log('timestamped_translated_final_and_interim_transcript =', timestamped_translated_final_and_interim_transcript);

					if (timestamped_translated_final_and_interim_transcript) {
						timestamped_translated_final_and_interim_transcript = timestamped_translated_final_and_interim_transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
						timestamped_translated_final_and_interim_transcript = timestamped_translated_final_and_interim_transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
						timestamped_translated_final_and_interim_transcript = removeEmptySentences(timestamped_translated_final_and_interim_transcript);
						timestamped_translated_final_and_interim_transcript = removePeriodOnlySentences(timestamped_translated_final_and_interim_transcript);

						if (show_timestamp_dst) {
							saveTranslatedTranscript(timestamped_translated_final_and_interim_transcript);
						} else {
							saveTranslatedTranscript(removeTimestamps(timestamped_translated_final_and_interim_transcript));
						}
					}

					formatted_all_translated_transcripts = '';
					all_translated_transcripts = [];
					timestamped_translated_final_and_interim_transcript = '';
					lines = '';
					unique_lines = [];
					unique_text = '';
					t = '';
				}));
			}
			return;

		} else {
			console.log('recognition.onend: keep recognizing because recognizing = ', recognizing);
			recognition.start();
			start_timestamp = Date.now();
			translate_time =  Date.now();
		}
	};

	recognition.onresult = function(event) {
		//console.log('recognition.onresult: recognizing = ', recognizing);
		//console.log('document.querySelector("#src_textarea_container").style.display = ', document.querySelector("#src_textarea_container").style.display);
		resetPauseTimeout();

		show_src = document.querySelector("#checkbox_show_src").checked;
		show_dst = document.querySelector("#checkbox_show_dst").checked;
		show_timestamp_src = document.querySelector("#checkbox_show_timestamp_src").checked;
		show_timestamp_dst = document.querySelector("#checkbox_show_timestamp_dst").checked;
        update_src_country();
        update_dst_country();

        //var interim_transcript = '';

		if (!recognizing) {
			final_transcript = '';
			interim_transcript = '';
			if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'none';
			console.log('recognition.onresult: stopping because recognizing = ', recognizing);
			return;

		} else {
			recognition.lang = src_dialect;
			var interim_transcript = '';

			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					transcript_is_final = true;
					interim_transcript = '';
					interim_started = false;
					endTimestamp = formatTimestampToISOLocalString(new Date());
					final_transcript += `${startTimestamp} ${timestamp_separator} ${endTimestamp} : ${capitalize(event.results[i][0].transcript)}`;
					final_transcript = final_transcript + '.\n'
					all_final_transcripts.push(`${final_transcript}`);

					//formatted_all_final_transcripts = all_final_transcripts.join("");
					//console.log('formatted_all_final_transcripts = ', formatted_all_final_transcripts);

				} else {
					transcript_is_final = false;
					if (!interim_started) {
						startTimestamp = formatTimestampToISOLocalString(new Date());
						interim_started = true; // Set the flag to true
					}
					interim_transcript += event.results[i][0].transcript;
					interim_transcript = remove_linebreak(interim_transcript);
					interim_transcript = capitalize(interim_transcript);
				}
			}

			timestamped_final_and_interim_transcript = final_transcript + '\n' + interim_transcript;

			if (containsColon(timestamped_final_and_interim_transcript)) {
				timestamped_final_and_interim_transcript = formatTranscript(timestamped_final_and_interim_transcript);
				timestamped_final_and_interim_transcript = removeEmptyLines(timestamped_final_and_interim_transcript);
				//console.log('formatTranscript(timestamped_final_and_interim_transcript) =', timestamped_final_and_interim_transcript);
			}

			if (all_final_transcripts.length > 0) {
				all_final_transcripts = removeDuplicates(all_final_transcripts);
				formatted_all_final_transcripts = all_final_transcripts.join("\n");
				//console.log('formatted_all_final_transcripts =', formatted_all_final_transcripts);
			}

			if (formatted_all_final_transcripts) {
				displayed_transcript = formatted_all_final_transcripts + '\n' + interim_transcript;
				//console.log('formatted_all_final_transcripts: displayed_transcript =', displayed_transcript);
			} else {
				displayed_transcript = timestamped_final_and_interim_transcript;
				//console.log('!formatted_all_final_transcripts: displayed_transcript =', displayed_transcript);
			}
			displayed_transcript = formatTranscript(displayed_transcript);

			//console.log('displayed_transcript =', displayed_transcript);
			if (displayed_transcript) {
				// Split text into an array of lines
				var lines = displayed_transcript.trim().split('\n');
				// Use a Set to filter out duplicate lines
				var unique_lines = [...new Set(lines)];
				// Join the unique lines back into a single string
				var unique_text = unique_lines.join('\n');
				//console.log('unique_text =', unique_text);
			}

			if (unique_text && getFirstWord(unique_text).includes('undefined')) unique_text = unique_text.replace('undefined', '');
			if (unique_text) unique_text = removeEmptyLines(unique_text);

			if (show_src) {
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'block';
				if (show_timestamp_src) {
					if (unique_text && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = unique_text;
				} else {
					if (unique_text && document.querySelector("#src_textarea")) document.querySelector("#src_textarea").value = removeTimestamps(unique_text);
				}
				if (document.querySelector("#src_textarea")) document.querySelector("#src_textarea").scrollTop = document.querySelector("#src_textarea").scrollHeight;
			} else {
				if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").style.display = 'none';
			}

			if (show_dst) {
				//var  t = unique_text; // CAN'T BE USED BECAUSE GOOGLE TRANSLATE SERVER WILL RESPOND WITH 403 AFTER SOME REQUESTS
				var t = timestamped_final_and_interim_transcript;
				if ((Date.now() - translate_time > 1000) && recognizing) {
					if (t) var tt = gtranslate(t, src, dst).then((result => {
						if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").style.display = 'block';
						if (document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").style.display = 'inline-block';

						result = result.replace(/(\d+),(\d+)/g, '$1.$2');

						result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');
						result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}): (\d{2}\.\d+)/g, '$1:$2');

						result = result.replace(/(\d{4})-\s?(\d{2})-\s?(\d{2})/g, '$1-$2-$3');
						result = result.replace(/(\d{2})-\s?(\d{2})-\s?(\d{4})/g, '$1-$2-$3');

						result = result.replace(/(\d{4})\s*-\s*(\d{2})\s*-\s*(\d{2})/g, '$1-$2-$3');
						result = result.replace(/(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{4})/g, '$1-$2-$3');

						result = result.replace(/(\d{2})\s*:\s*(\d{2})\s*:\s*(\d{2}\.\d{3})/g, '$1:$2:$3');

						result = result.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);
						result = result.replace(/(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3})[^0-9]+(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3})/g, `$1 ${timestamp_separator} $2`);

						result = result.replace(/(\d{2}:\d{2}:\d{2}\.\d{3}): /g, '$1 : ');

						result = result.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
						result = result.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

						result = result.replace(/ (\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/g, /(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/);
						result = result.replace(/ (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/g, /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/);

						result = result.replace('.,', '.');
						result = result.replace(',.', ',');
						result = result.replace('. .', '.');

						result = convertDatesToISOFormat(result);
						result = formatTranscript(result);

						result = result.replace(/\n\s*$/, '');

						result = removeEmptyLines(result);

						var timestamps = result.match(/(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /);

						//console.log('transcript_is_final =', transcript_is_final);
						if (transcript_is_final) {
							//console.log('transcript_is_final');
							all_translated_transcripts.push(`${result}`);
							all_translated_transcripts = removeDuplicates(all_translated_transcripts);
							//console.log('all_translated_transcripts =', all_translated_transcripts);
							formatted_all_translated_transcripts = all_translated_transcripts.join("");
							//console.log('formatted_all_translated_transcripts =', formatted_all_translated_transcripts);
						}

						//console.log('formatted_all_translated_transcripts =', formatted_all_translated_transcripts);
						var translated_unique_text;
						if (all_translated_transcripts.length > 0) {
							all_translated_transcripts = removeDuplicates(all_translated_transcripts);
							translated_unique_text = all_translated_transcripts.join('\n');
							//console.log('translated_unique_text =', translated_unique_text);
						}

						displayed_translation = translated_unique_text + '\n' + result;
						displayed_translation = formatTranscript(displayed_translation);

						if (getFirstWord(displayed_translation).includes('undefined')) displayed_translation = displayed_translation.replace('undefined', '');

						var displayed_translation_lines = displayed_translation.trim().split('\n');
						var displayed_translation_unique_lines = [...new Set(displayed_translation_lines)];
						displayed_translation_unique_lines = removeDuplicates(displayed_translation_unique_lines);
						displayed_translation= displayed_translation_unique_lines.join('\n');

						if (show_timestamp_dst) {
							//console.log('displayed_translation =', displayed_translation);
							if (displayed_translation && document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = displayed_translation;
						} else {
							//console.log('removeTimestamps(displayed_translation) =', removeTimestamps(displayed_translation));
							if (displayed_translation && document.querySelector("#dst_textarea")) document.querySelector("#dst_textarea").value = removeTimestamps(displayed_translation);
						}

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
		console.log('starting recognition: recognizing = ', recognizing);
		recognition.start();
		start_timestamp = Date.now();
		translate_time =  Date.now();
	}

}



//FUNCTIONS
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
	src_selected_font_index = document.querySelector("#select_src_font").selectedIndex;
	console.log('src_selected_font_index = ', src_selected_font_index);

    src_selected_font = document.querySelector("#select_src_font").value;
	console.log('src_selected_font = ', src_selected_font);

    src_font_size = document.querySelector("#input_src_font_size").value;
	console.log('src_font_size = ', src_font_size);

	src_font_color = document.querySelector("#input_src_font_color").value;
	console.log('src_font_color = ', src_font_color);

	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	console.log('src_container_width_factor = ', src_container_width_factor);

	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;
	console.log('src_container_height_factor = ', src_container_height_factor);

	src_container_top_factor = document.querySelector("#input_src_container_top_factor").value;
	console.log('src_container_top_factor = ', src_container_top_factor);

	centerize_src = document.querySelector("#checkbox_centerize_src").checked;
	console.log('centerize_src = ', centerize_src);

	var textarea_rect = get_textarea_rect();
	var video_info = getVideoPlayerInfo();
	if (textarea_rect && video_info) {
		if (document.querySelector("#checkbox_centerize_src").checked) {
			src_left = textarea_rect.src_left;
			console.log('textarea_rect.src_left = ', textarea_rect.src_left);
			src_container_left_factor = (src_left - video_info.left)/video_info.width;
 			console.log('src_container_left_factor = ', src_container_left_factor);
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
		} else {
			src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
			console.log('src_container_left_factor = ', src_container_left_factor);
		}
	} else if (textarea_rect && !video_info) {
		if (document.querySelector("#checkbox_centerize_src").checked) {
			src_container_left_factor = (window.innerWidth - 2*textarea_rect.src_left)/window.innerWidth
			console.log('src_container_left_factor = ', src_container_left_factor);
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
		} else {
			src_container_left_factor = document.querySelector("#input_src_container_left_factor").value;
			console.log('src_container_left_factor = ', src_container_left_factor);
		}
	}

	src_container_color = document.querySelector("#input_src_container_color").value;
	console.log('src_container_color = ', src_container_color);

	src_container_opacity = document.querySelector("#input_src_container_opacity").value;
	console.log('src_container_opacity = ', src_container_opacity);

    localStorage.setItem("src_selected_font_index", src_selected_font_index);
	localStorage.setItem("src_selected_font", src_selected_font);
    localStorage.setItem("src_font_size", src_font_size);
    localStorage.setItem("src_font_color", src_font_color);
    localStorage.setItem("src_container_width_factor", src_container_width_factor);
	localStorage.setItem("src_container_height_factor", src_container_height_factor);
	localStorage.setItem("src_container_top_factor", src_container_top_factor);
	localStorage.setItem("src_container_left_factor", src_container_left_factor);
	localStorage.setItem("centerize_src", centerize_src);
	localStorage.setItem("src_container_color", src_container_color);
	localStorage.setItem("src_container_opacity", src_container_opacity);

	dst_selected_font_index = document.querySelector("#select_dst_font").selectedIndex;
	console.log('dst_selected_font_index = ', dst_selected_font_index);

    dst_selected_font = document.querySelector("#select_dst_font").value;
	console.log('dst_selected_font = ', dst_selected_font);

    dst_font_size = document.querySelector("#input_dst_font_size").value;
	console.log('dst_font_size = ', dst_font_size);

	dst_font_color = document.querySelector("#input_dst_font_color").value;
	console.log('dst_font_color = ', dst_font_color);

	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	console.log('dst_container_width_factor = ', dst_container_width_factor);

	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;
	console.log('dst_container_height_factor = ', dst_container_height_factor);

	dst_container_top_factor = document.querySelector("#input_dst_container_top_factor").value;
	console.log('dst_container_top_factor = ', dst_container_top_factor);

	centerize_dst = document.querySelector("#checkbox_centerize_dst").checked;
	console.log('centerize_dst = ', centerize_dst);

	var textarea_rect = get_textarea_rect();
	var video_info = getVideoPlayerInfo();
	if (textarea_rect && video_info) {
		if (document.querySelector("#checkbox_centerize_dst").checked) {
			dst_left = textarea_rect.dst_left;
			console.log('textarea_rect.dst_left = ', textarea_rect.dst_left);
			dst_container_left_factor = (dst_left - video_info.left)/video_info.width;
			console.log('dst_container_left_factor = ', dst_container_left_factor);
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
		} else {
			dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
			console.log('dst_container_left_factor = ', dst_container_left_factor);
		}
	} else if (textarea_rect && !video_info) {
		if (document.querySelector("#checkbox_centerize_dst").checked) {
			dst_container_left_factor = (window.innerWidth - 2*textarea_rect.dst_left)/window.innerWidth
			console.log('dst_container_left_factor = ', dst_container_left_factor);
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
		} else {
			dst_container_left_factor = document.querySelector("#input_dst_container_left_factor").value;
			console.log('dst_container_left_factor = ', dst_container_left_factor);
		}
	}

	dst_container_color = document.querySelector("#input_dst_container_color").value;
	console.log('dst_container_color = ', dst_container_color);

	dst_container_opacity = document.querySelector("#input_dst_container_opacity").value;
	console.log('dst_container_opacity = ', dst_container_opacity);

    localStorage.setItem("dst_selected_font_index", dst_selected_font_index);
	localStorage.setItem("dst_selected_font", dst_selected_font);
    localStorage.setItem("dst_font_size", dst_font_size);
    localStorage.setItem("dst_font_color", dst_font_color);
    localStorage.setItem("dst_container_width_factor", dst_container_width_factor);
	localStorage.setItem("dst_container_height_factor", dst_container_height_factor);
	localStorage.setItem("dst_container_top_factor", dst_container_top_factor);
	localStorage.setItem("dst_container_left_factor", dst_container_left_factor);
	localStorage.setItem("centerize_dst", centerize_dst);
	localStorage.setItem("dst_container_color", dst_container_color);
	localStorage.setItem("dst_container_opacity", dst_container_opacity);

	regenerate_textarea();
}


function update_src_country() {
    for (var i = document.querySelector("#select_src_dialect").options.length - 1; i >= 0; i--) {
        document.querySelector("#select_src_dialect").remove(i);
    }
	//console.log('update_src_country(): document.querySelector("#select_src_language").selectedIndex = ', document.querySelector("#select_src_language").selectedIndex);
    var list = src_language[document.querySelector("#select_src_language").selectedIndex];
	//console.log('src_language[document.querySelector("#select_src_language").selectedIndex]) = ', src_language[document.querySelector("#select_src_language").selectedIndex]);
    for (var i = 1; i < list.length; i++) {
        document.querySelector("#select_src_dialect").options.add(new Option(list[i][1], list[i][0]));
    }
    document.querySelector("#select_src_dialect").style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    src = document.querySelector("#select_src_dialect").value.split('-')[0];

	if (src_dialect === "yue-Hant-HK") {
		src = "zh-TW";
	}
	if (src_dialect === "cmn-Hans-CN") {
		src = "zh-CN";
	}
	if (src_dialect === "cmn-Hans-HK") {
		src = "zh-CN";
	}
	if (src_dialect === "cmn-Hant-TW") {
		src = "zh-TW";
	}

	src_language_index = document.querySelector("#select_src_language").selectedIndex;
	//localStorage.setItem("src_language_index", src_language_index);
	if (src_language[src_language_index].length>2) {
		for (var j = 0; j < document.querySelector("#select_src_dialect").length; j++) {
			if (document.querySelector("#select_src_dialect")[j].value === src_dialect) {
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
	//console.log('update_src_country(): src_dialect = ', src_dialect);
}


function update_dst_country() {
    for (var j = document.querySelector("#select_dst_dialect").options.length - 1; j >= 0; j--) {
        document.querySelector("#select_dst_dialect").remove(j);
    }
	//console.log('update_dst_country(): document.querySelector("#select_dst_language").selectedIndex = ', document.querySelector("#select_dst_language").selectedIndex);
    var list = dst_language[document.querySelector("#select_dst_language").selectedIndex];
	//console.log('dst_language[document.querySelector("#select_dst_language").selectedIndex]) = ', dst_language[document.querySelector("#select_dst_language").selectedIndex]);
    for (var j = 1; j < list.length; j++) {
        document.querySelector("#select_dst_dialect").options.add(new Option(list[j][1], list[j][0]));
    }
    document.querySelector("#select_dst_dialect").style.visibility = list[1].length === 1 ? 'hidden' : 'visible';
    dst = document.querySelector("#select_dst_dialect").value.split('-')[0];

	if (dst_dialect === "yue-Hant-HK") {
		dst = "zh-TW";
	}
	if (dst_dialect === "cmn-Hans-CN") {
		dst = "zh-CN";
	}
	if (dst_dialect === "cmn-Hans-HK") {
		dst = "zh-CN";
	}
	if (dst_dialect === "cmn-Hant-TW") {
		dst = "zh-TW";
	}

	dst_language_index = document.querySelector("#select_dst_language").selectedIndex;
	//localStorage.setItem("dst_language_index", dst_language_index);
	if (dst_language[dst_language_index].length>2) {
		for (var j = 0; j<document.querySelector("#select_dst_dialect").length; j++) {
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
	//console.log('update_dst_country(): dst_dialect = ', dst_dialect);
}

const URL_String = {
	parseURL: parseURL,
	parseQuery: parseQuery
};

function parseURL(url) {
	var isRelative = /^(ftp|file|gopher|https?|wss?)(:|$)/.test(url), urlRegex, urlMatch, authorityRegex, authorityMatch;
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
	var parts, subpart, name, value, index, obj = {};

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


function getYoutubePlayerID(url) {
	var urlObj = URL_String.parseURL(url);
	if (urlObj) {
		return urlObj.hostname === 'youtu.be' ? urlObj.path.slice(1) : urlObj.query.v;
	}
	return null;
}


function preload(elem, time){
	elem.setAttribute('preload', 'auto');
	elem.addEventListener('canplaythrough', setCurrentTime);
	function setCurrentTime(){
		elem.currentTime  = time;
		elem.setAttribute('preload','none');
		elem.removeEventListener('canplaythrough', setCurrentTime);
	}
}

function insert_videojs_script() {
	//video_script$=$('<link rel="stylesheet" href="https://unpkg.com/video.js/dist/video-js.css" > <script src="https://unpkg.com/video.js/dist/video.js"></script> <script src="https://unpkg.com/@videojs/http-streaming@2.14.2/dist/videojs-http-streaming.min.js"></script>');
	video_script$=$('<link rel="stylesheet" href="https://unpkg.com/video.js/dist/video-js.css" > <script src="https://unpkg.com/video.js/dist/video.js"></script> <script src="https://unpkg.com/@videojs/http-streaming@2.14.2/dist/videojs-http-streaming.js"></script>');
	//video_script$=$('<link href="https://cdn.jsdelivr.net/npm/mediaelement@latest/build/mediaelementplayer.min.css" rel="stylesheet"> <script src="https://cdn.jsdelivr.net/npm/mediaelement@latest/build/mediaelement-and-player.min.js"></script>');
	//video_script$=$('<link href="https://vjs.zencdn.net/8.12.0/video-js.min.css" rel="stylesheet"> <script src="https://vjs.zencdn.net/8.12.0/video.min.js"></script>');
	console.log('appending video_script to html body');
	video_script$.appendTo('body');
}

function insert_flvjs_script() {
	video_script$=$('<link href="https://vjs.zencdn.net/7.15.4/video-js.css" rel="stylesheet"> <script src="https://vjs.zencdn.net/7.15.4/video.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/flv.js/1.5.0/flv.min.js"></script> <script src="https://cdnjs.cloudflare.com/ajax/libs/videojs-flvjs/1.4.1/videojs-flvjs.min.js"></script>');
	console.log('appending flvjs_script to html head');
	video_script$.appendTo('head');
}

function loadScript(src, callback) {
	var script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function() {
		console.error('Failed to load script: ' + src);
	};
	document.head.appendChild(script);
}

function embed(){
	var url = url_box.value;
	var original_url = url_box.value;
	var isSeeking = false;

	if ((url.includes('youtu.be'))||(url.includes('youtube'))) {
		//if (!document.querySelector(".iframe_header_unit")) create_iframe_video_player();
		if (document.querySelector(".video_header_unit")) document.body.removeChild(document.querySelector(".video_header_unit"));
		if (document.querySelector(".detail__media-video")) document.body.removeChild(document.querySelector(".detail__media-video"));
		var ytID=getYoutubePlayerID(url);
		var src="https://www.youtube.com/embed/"+ytID;
		url = src;
		console.log(document.querySelector("#my_yt_iframe"));
		document.querySelector("#my_yt_iframe").style.display = "block";
		document.querySelector("#my_yt_iframe").src = url;
		url_box.value=original_url;
	}
	if (url.includes(".mp4")) {
		//if (!document.querySelector(".video_header_unit")) create_hls_video_player();
		if (document.querySelector(".iframe_header_unit")) document.body.removeChild(document.querySelector(".iframe_header_unit"));
		if (document.querySelector(".detail__media-video")) document.body.removeChild(document.querySelector(".detail__media-video"));
		if (document.querySelector(".flv_video_header_unit")) document.body.removeChild(document.querySelector(".flv_video_header_unit"));
		//insert_videojs_script();
		console.log(document.querySelector("#my_video"));
		document.querySelector("#my_video").style.display = "block";
		document.querySelector("#video_source").src = url;
		document.querySelector("#video_source").type = "video/mp4";
        document.querySelector("#my_video").load();
		document.querySelector("#my_video").play();
		//console.log('document.querySelector("#my_video").duration = ', document.querySelector("#my_video").duration);
	}

	if (url.includes(".flv")) {
		//if (!document.querySelector(".video_header_unit")) create_hls_video_player();
		if (document.querySelector(".iframe_header_unit")) document.body.removeChild(document.querySelector(".iframe_header_unit"));
		if (document.querySelector(".detail__media-video")) document.body.removeChild(document.querySelector(".detail__media-video"));
		if (document.querySelector(".video_header_unit")) document.body.removeChild(document.querySelector(".video_header_unit"));
		console.log(document.querySelector("#videojs-flvjs-player"));
		document.querySelector("#videojs-flvjs-player").style.display = "block";

		loadScript('https://cdn.jsdelivr.net/npm/flv.js@latest', function() {
			if (flvjs.isSupported()) {
				var flvPlayer = flvjs.createPlayer({
					type: 'flv',
					url: url
				});
				flvPlayer.attachMediaElement(document.querySelector("#videojs-flvjs-player"));
				flvPlayer.load();
				flvPlayer.play();
			}
		});
	}

	if (url.includes(".m3u8")) {
		//if (!document.querySelector(".video_header_unit")) create_hls_video_player();
		if (document.querySelector(".iframe_header_unit")) document.body.removeChild(document.querySelector(".iframe_header_unit"));
		if (document.querySelector(".detail__media-video")) document.body.removeChild(document.querySelector(".detail__media-video"));
		insert_videojs_script();
		console.log(document.querySelector("#my_video"));
		document.querySelector("#my_video").style.display = "block";
		document.querySelector("#video_source").src = url;
		document.querySelector("#video_source").type = "application/x-mpegURL";
	}

	if (url.includes("www.cnnindonesia.com")) {
		//if (!document.querySelector(".detail__media-video")) create_cnn_video_player();
		if (document.querySelector(".iframe_header_unit")) document.body.removeChild(document.querySelector(".iframe_header_unit"));
		if (document.querySelector(".video_header_unit")) document.body.removeChild(document.querySelector(".video_header_unit"));
		console.log(document.querySelector("#cnnlive"));
		document.querySelector(".detail__media-video").style.display = "block";
		document.querySelector("#cnnlive").style.display = "block";
		document.querySelector("#cnnlive").src = url;
	}

	var video_info = getVideoPlayerInfo();
	if (video_info) document.documentElement.scrollTop = video_info.top; // For modern browsers
	if (video_info) document.body.scrollTop = video_info.top; // For older browsers
}


function create_modal_text_area() {
	console.log("Create modal text area");

	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;

	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;

	var textarea_rect = get_textarea_rect();
	video_info = getVideoPlayerInfo();


	var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
		.width(textarea_rect.src_width)
		.height(textarea_rect.src_height)
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
			'fontFamily': document.querySelector("#select_src_font").value + ', sans-serif',
			'fontSize': document.querySelector("#input_src_font_size").value,
			'color': document.querySelector("#input_src_font_color").value,
			'backgroundColor': hexToRgba(document.querySelector("#input_src_container_color").value, document.querySelector("#input_src_container_opacity").value),
			'border': 'none',
			'display': 'block',
			'overflow': 'hidden',
			'z-index': '2147483647'
		})
		.offset({top:textarea_rect.src_top, left:textarea_rect.src_left})

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
	document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(document.querySelector("#input_src_container_color").value, document.querySelector("#input_src_container_opacity").value);
	document.querySelector("#src_textarea").style.fontSize=String(src_font_size)+'px';

	document.querySelector("#src_textarea").offsetParent.onresize = (function(){
		if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#src_textarea_container")).width)) {
			document.querySelector("#checkbox_centerize_src").checked = false;
		}

		document.querySelector("#src_textarea").style.position = 'absolute';
		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';

		video_info = getVideoPlayerInfo();
		if (video_info) {
			src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/video_info.width;
			//console.log('src_container_width_factor = ', src_container_width_factor);
			document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
			localStorage.setItem("src_container_width_factor", src_container_width_factor);

			src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/video_info.height;
			//console.log('src_container_height_factor = ', src_container_height_factor);
			document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
			localStorage.setItem("src_container_height_factor", src_container_height_factor);
		} else {
			src_container_width_factor = getRect(document.querySelector("#src_textarea")).width/window.innerWidth;
			//console.log('src_container_width_factor = ', src_container_width_factor);
			document.querySelector("#input_src_container_width_factor").value = src_container_width_factor;
			localStorage.setItem("src_container_width_factor", src_container_width_factor);

			src_container_height_factor = getRect(document.querySelector("#src_textarea")).height/window.innerHeight;
			//console.log('src_container_height_factor = ', src_container_height_factor);
			document.querySelector("#input_src_container_height_factor").value = src_container_height_factor;
			localStorage.setItem("src_container_height_factor", src_container_height_factor);
		}
	});

	document.querySelector("#src_textarea").offsetParent.ondrag = (function(){
		if (getRect(document.querySelector("#src_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#src_textarea_container")).width)) {
			document.querySelector("#checkbox_centerize_src").checked = false;
		}

		document.querySelector("#src_textarea").style.position = 'absolute';

		video_info = getVideoPlayerInfo();
		if (video_info) {
			src_container_top_factor = (getRect(document.querySelector("#src_textarea_container")).top - video_info.top)/video_info.height;
			if (src_container_top_factor <= 0) {
				src_container_top_factor = 0;
			}
			document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
			//console.log('src_container_top_factor = ', src_container_top_factor);
			localStorage.setItem("src_container_top_factor", src_container_top_factor);

			src_container_left_factor = (getRect(document.querySelector("#src_textarea_container")).left - video_info.left)/video_info.width;
			if (src_container_left_factor <= 0) {
				src_container_left_factor = 0;
			}
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
			//console.log('src_container_left_factor = ', src_container_left_factor);
			localStorage.setItem("src_container_left_factor", src_container_left_factor);
		} else {
			src_container_top_factor = getRect(document.querySelector("#src_textarea_container")).top/window.innerHeight;
			if (src_container_top_factor <= 0) {
				src_container_top_factor = 0;
			}
			document.querySelector("#input_src_container_top_factor").value = src_container_top_factor;
			//console.log('src_container_top_factor = ', src_container_top_factor);
			localStorage.setItem("src_container_top_factor", src_container_top_factor);

			src_container_left_factor = getRect(document.querySelector("#src_textarea_container")).left/window.innerWidth;
			if (src_container_left_factor <= 0) {
				src_container_left_factor = 0;
			}
			document.querySelector("#input_src_container_left_factor").value = src_container_left_factor;
			//console.log('src_container_left_factor = ', src_container_left_factor);
			localStorage.setItem("src_container_left_factor", src_container_left_factor);
		}
	});

	var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
		.width(textarea_rect.dst_width)
		.height(textarea_rect.dst_height)
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
			'fontFamily': document.querySelector("#select_dst_font").value + ', sans-serif',
			'fontSize': document.querySelector("#input_dst_font_size").value,
			'color': document.querySelector("#input_dst_font_color").value,
			'backgroundColor': hexToRgba(document.querySelector("#input_dst_container_color").value, document.querySelector("#input_dst_container_opacity").value),
			'border': 'none',
			'display': 'block',
			'overflow': 'hidden',
			'z-index': '2147483647'
		})
		.offset({top:textarea_rect.dst_top, left:textarea_rect.dst_left})

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

	document.querySelector("#dst_textarea").style.fontFamily = dst_selected_font + ", sans-serif";
	document.querySelector("#dst_textarea").style.color = dst_font_color;
	document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(document.querySelector("#input_dst_container_color").value, document.querySelector("#input_dst_container_opacity").value);
	document.querySelector("#dst_textarea").style.fontSize=String(dst_font_size)+'px';

	document.querySelector("#dst_textarea").offsetParent.onresize = (function(){
		document.querySelector("#dst_textarea").style.position = 'absolute';
		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';

		if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#dst_textarea_container")).width)) {
			document.querySelector("#checkbox_centerize_dst").checked = false;
		}

		video_info = getVideoPlayerInfo();
		if (video_info) {
			dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/video_info.width;
			//console.log('dst_container_width_factor = ', dst_container_width_factor);
			document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
			localStorage.setItem("dst_container_width_factor", dst_container_width_factor);

			dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/video_info.height;
			//console.log('dst_container_height_factor = ', dst_container_height_factor);
			document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
			localStorage.setItem("dst_container_height_factor", dst_container_height_factor);
		} else {
			dst_container_width_factor = getRect(document.querySelector("#dst_textarea")).width/window.innerWidth;
			//console.log('dst_container_width_factor = ', dst_container_width_factor);
			document.querySelector("#input_dst_container_width_factor").value = dst_container_width_factor;
			localStorage.setItem("dst_container_width_factor", dst_container_width_factor);

			dst_container_height_factor = getRect(document.querySelector("#dst_textarea")).height/window.innerHeight;
			//console.log('dst_container_height_factor = ', dst_container_height_factor);
			document.querySelector("#input_dst_container_height_factor").value = dst_container_height_factor;
			localStorage.setItem("dst_container_height_factor", dst_container_height_factor);
		}
	});

	document.querySelector("#dst_textarea").offsetParent.ondrag = (function(){
		document.querySelector("#dst_textarea").style.position = 'absolute';

		if (getRect(document.querySelector("#dst_textarea_container")).left != video_info.left + 0.5*(video_info.width-getRect(document.querySelector("#dst_textarea_container")).width)) {
			document.querySelector("#checkbox_centerize_dst").checked = false;
		}

		video_info = getVideoPlayerInfo();
		if (video_info) {
			dst_container_top_factor = (getRect(document.querySelector("#dst_textarea_container")).top - video_info.top)/video_info.height;
			if (dst_container_top_factor <= 0) {
				dst_container_top_factor = 0;
			}
			document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
			//console.log('dst_container_top_factor = ', dst_container_top_factor);
			localStorage.setItem("dst_container_top_factor", dst_container_top_factor);

			dst_container_left_factor = (getRect(document.querySelector("#dst_textarea_container")).left - video_info.left)/video_info.width;
			if (dst_container_left_factor <= 0) {
				dst_container_left_factor = 0;
			}
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
			//console.log('dst_container_left_factor = ', dst_container_left_factor);
			localStorage.setItem("dst_container_left_factor", dst_container_left_factor);
		} else {
			dst_container_top_factor = getRect(document.querySelector("#dst_textarea_container")).top/window.innerHeight;
			if (dst_container_top_factor <= 0) {
				dst_container_top_factor = 0;
			}
			document.querySelector("#input_dst_container_top_factor").value = dst_container_top_factor;
			//console.log('dst_container_top_factor = ', dst_container_top_factor);
			localStorage.setItem("dst_container_top_factor", dst_container_top_factor);

			dst_container_left_factor = getRect(document.querySelector("#dst_textarea_container")).left/window.innerWidth;
			if (dst_container_left_factor <= 0) {
				dst_container_left_factor = 0;
			}
			document.querySelector("#input_dst_container_left_factor").value = dst_container_left_factor;
			//console.log('dst_container_left_factor = ', dst_container_left_factor);
			localStorage.setItem("dst_container_left_factor", dst_container_left_factor);
		}
	});
}


function startButton(event) {
	src_container_width_factor = document.querySelector("#input_src_container_width_factor").value;
	src_container_height_factor = document.querySelector("#input_src_container_height_factor").value;

	dst_container_width_factor = document.querySelector("#input_dst_container_width_factor").value;
	dst_container_height_factor = document.querySelector("#input_dst_container_height_factor").value;

	video_info = getVideoPlayerInfo();
	if (video_info) {
		//console.log("Video player found");
		//console.log("video_info.id = ", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		src_width = src_container_width_factor*video_info.width;
		//console.log('src_width = ', src_width);

		src_height = src_container_height_factor*video_info.height;
		//console.log('src_height = ', src_width);

		src_top = video_info.top + 0.02*video_info.height;
		//console.log('src_top = ', src_top);

		src_left = video_info.left + 0.5*(video_info.width-src_width);
		//console.log('src_left = ', src_left);

		dst_width = dst_container_width_factor*video_info.width;
		//console.log('dst_width = ', dst_width);
		
		dst_height = dst_container_height_factor*video_info.height;
		//console.log('dst_height = ', dst_height);

		dst_top = video_info.top + 0.6*video_info.height;
		//console.log('dst_top = ', dst_top);

		dst_left = video_info.left + 0.5*(video_info.width-dst_width);
		//console.log('dst_left = ', dst_left);

	} else {
		console.log("No video player found on this page.");

		src_width = src_container_width_factor*window.innerWidth;
		//console.log('src_width = ', src_width);

		src_height = src_container_height_factor*window.innerHeight;
		//console.log('src_height = ', src_width);

		src_top = 0.25*window.innerHeight;
		//console.log('src_top = ', src_top);

		src_left = 0.5*(window.innerWidth-src_width);
		//console.log('src_left = ', src_left);

		dst_width = dst_container_width_factor*window.innerWidth;
		//console.log('dst_width = ', dst_width);
		
		dst_height = dst_container_height_factor*window.innerHeight;
		//console.log('dst_height = ', dst_height);

		dst_top = 0.75*window.innerHeight;
		//console.log('dst_top = ', dst_top);

		dst_left = 0.5*(window.innerWidth-dst_width);
		//console.log('dst_left = ', dst_left);
	}

	show_src = document.querySelector("#checkbox_show_src").checked;
	show_dst = document.querySelector("#checkbox_show_dst").checked;
	src_dialect = document.querySelector("#select_src_dialect").value;
	dst_dialect = document.querySelector("#select_dst_dialect").value;
	//console.log('src_dialect = ', src_dialect);
	//console.log('dst_dialect = ', dst_dialect);

	recognizing=!recognizing;
	console.log('startButton clicked recognizing = ', recognizing);

	if (!recognizing) {
		if (document.querySelector("#src_textarea_container")) document.querySelector("#src_textarea_container").parentElement.removeChild(document.querySelector("#src_textarea_container"));
		if (document.querySelector("#dst_textarea_container")) document.querySelector("#dst_textarea_container").parentElement.removeChild(document.querySelector("#dst_textarea_container"));
		if (document.querySelector("#ajax_dst_textarea_container")) document.querySelector("#ajax_dst_textarea_container").parentElement.removeChild(document.querySelector("#ajax_dst_textarea_container"));
		recognition.stop();
		document.querySelector("#start_img").src = 'images/mic.gif';
		return;

	} else {
		create_modal_text_area();
		final_transcript = '';
		interim_transcript = '';
		all_final_transcripts = []
		formatted_all_final_transcripts = '';
		all_translated_transcripts = []
		formatted_all_translated_transcripts = '';
		transcript_is_final = false;
		displayed_translation = '';
		recognition.lang = src_dialect;
		start_timestamp = event.timeStamp;
		translate_time = event.timeStamp;
		recognition.start();
		document.querySelector("#start_img").src = 'images/mic-animate.gif';
	}

	if (video_info) document.documentElement.scrollTop = video_info.top; // For modern browsers
	if (video_info) document.body.scrollTop = video_info.top; // For older browsers

}


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


function remove_linebreak(s) {
	var two_line = /\n\n/g;
	var one_line = /\n/g;
	return s.replace(two_line, '').replace(one_line, '');
}


function capitalize(s) {
	var first_char = /\S/;
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


function containsColon(sentence) {
	const colon = sentence.match(/\s*: /);
	// Check if the sentence includes the colon character
	return sentence.includes(colon);
}


function formatTimestampToISOLocalString(timestamp_value) {
	// Function to convert a single timestamp from GMT to local time
	function convertTimestamp(timestamp) {
		// Create a Date object from the GMT timestamp
		let date = new Date(timestamp + ' GMT');
		// Return the local time in the same format as the original
		return date.getFullYear() + '-' +
			String(date.getMonth() + 1).padStart(2, '0') + '-' +
			String(date.getDate()).padStart(2, '0') + ' ' +
			String(date.getHours()).padStart(2, '0') + ':' +
			String(date.getMinutes()).padStart(2, '0') + ':' +
			String(date.getSeconds()).padStart(2, '0') + '.' +
			String(date.getMilliseconds()).padStart(3, '0');
	}

	// Convert timestamp_value to string
	const timestamp_string = timestamp_value.toISOString();

	// Extract date and time parts
	const date_part = timestamp_string.slice(0, 10);
	const time_part = timestamp_string.slice(11, 23);
	const timestamp_ISO_String = `${date_part} ${time_part}`;

	// Regular expression to match the timestamps in the string
	const time_regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g;
	const local_timestamp_string = timestamp_ISO_String.replace(time_regex, match => convertTimestamp(match));

	// Concatenate date and time parts with a space in between
	return local_timestamp_string.trim();
}


function getFirstWord(sentence) {
    // Trim the sentence to remove any leading or trailing whitespace
    let trimmedSentence = sentence.trim();

    // Split the sentence into an array of words
    let words = trimmedSentence.split(/\s+/);

    // Return the first word
    return words[0];
}


function removeTimestamps(transcript) {
    var timestampPattern = /(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /;
    var lines = transcript.split('\n');
    var cleanedLines = lines.map(line => line.replace(timestampPattern, ''));
    return cleanedLines.join('\n');
}


function formatTranscript(transcript) {
	// Replace URL-encoded spaces with regular spaces
	transcript = transcript.replace(/%20/g, ' ');
	transcript = transcript.trim();
	transcript = transcript.replace(/(\d{2}:\d{2}:\d{2}\.\d{3}): /g, '$1 : ');
	transcript = transcript.replace(/(?<!^)(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');
	transcript = transcript.replace(/(?<!^)(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : )/gm, '\n$1');

	// Match timestamps in the transcript
	const timestamps = transcript.match(/(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3} *--> *(\d{2,4})-(\d{2})-(\d{2,4}) \d{2}:\d{2}:\d{2}\.\d{3}\s*: /);

	if (timestamps) {
		// Split the transcript based on timestamps
		const lines = transcript.split(timestamps);

		let formattedTranscript = "";
		for (let line of lines) {
			line = line.trim();
			// Replace the separator format in the timestamps
			line = line.replace(timestamps, '$1 --> $2');

			const colon = line.match(/\s*: /);
			const parts = line.split(colon);
			if (parts.length === 2) {
				const capitalizedSentence = (parts[1].trimLeft()).charAt(0).toUpperCase() + (parts[1].trimLeft()).slice(1);
				line = parts[0] + colon + capitalizedSentence;
			}

			// Add the formatted line to the result
			if (line !== '') formattedTranscript += line.trim() + "\n";
		}
        
		const regex = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} --> \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} : [^]+?)(?=\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} -->|\s*$)/g;
		const matches = formattedTranscript.match(regex);
		if (regex && formattedTranscript) formattedTranscript = matches.join('');

		return formattedTranscript.trim(); // Trim any leading/trailing whitespace from the final result

	} else {
		return transcript.trim();
	}
}


function removeDuplicateLines(transcript) {
	const lines = transcript.split('\n'); // Split the input into individual lines
	const seen = {}; // Object to track unique lines
	const result = [];

	lines.forEach(line => {
		const parts = line.split(' : '); // Split line into timestamp and sentence
		if (parts.length === 2) {
			const timestamp = parts[0].trim(); // Extract and trim the timestamp
			const sentence = parts[1].trim(); // Extract and trim the sentence
			const key = `${timestamp} : ${sentence}`; // Create a unique key

			if (!seen[key]) { // Check if the key is already seen
				seen[key] = true; // Mark the key as seen
				result.push(line); // Add the unique line to the result
			}
		}
	});

	return result.join('\n'); // Join the unique lines back into a single string
}


function removeEmptyLines(transcript) {
    // Split the transcript into individual lines
    const lines = transcript.split('\n');
    // Filter out empty lines and join the remaining lines back into a single string
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    return nonEmptyLines.join('\n');
}


function removeEmptySentences(transcript) {
    const lines = transcript.split('\n'); // Split the input into individual lines
    const result = lines.filter(line => {
        //const parts = line.split(' : '); // Split line into timestamp and sentence
        //return parts.length === 2 && parts[1].trim() !== ''; // Keep lines with non-empty sentences
		const parts = line.split(' : ');
		if (parts.length === 2) {
			const sentence = parts[1].trim().replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
			//console.log(`Sentence: "${sentence}" Length: ${sentence.length}`);
			return sentence !== '';
		}
		return true;
    });
    return result.join('\n'); // Join the remaining lines back into a single string
}


function removePeriodOnlySentences(transcript) {
	// Split the transcript into individual lines
	const lines = transcript.split('\n');
    
	// Filter out lines where the sentence part contains only a period character
	const result = lines.filter(line => {
		const parts = line.split(' : ');
		if (parts.length === 2) {
			const sentence = parts[1].trim().replace(/[\u200B-\u200D\uFEFF]/g, ''); // Remove zero-width characters
			//console.log(`Sentence: "${sentence}" Length: ${sentence.length}`);
			return sentence !== '.';
		}
		return true;
	});
	return result.join('\n'); // Join the remaining lines back into a single string
}


function removeDuplicates(transcript_array) {
	// Create a Set to store unique entries
	let unique_transcript_array = new Set();

	// Iterate through each transcript
	transcript_array.forEach(transcript => {
		// Split the transcript by newline to get individual lines
		let lines = transcript.split('\n');

		// Add each line to the Set (Sets automatically handle duplicates)
		lines.forEach(line => {
			if (line !== '') {
				unique_transcript_array.add(line.trim());
			}
		});
	});

	// Convert the Set back to an array and return it
	return Array.from(unique_transcript_array);
}


function convertTimestampsToLocal(transcript) {
    // Function to convert a single timestamp from GMT to local time
    function convertTimestamp(timestamp) {
        // Create a Date object from the GMT timestamp
        let date = new Date(timestamp + ' GMT');
        // Return the local time in the same format as the original
        return date.getFullYear() + '-' +
               String(date.getMonth() + 1).padStart(2, '0') + '-' +
               String(date.getDate()).padStart(2, '0') + ' ' +
               String(date.getHours()).padStart(2, '0') + ':' +
               String(date.getMinutes()).padStart(2, '0') + ':' +
               String(date.getSeconds()).padStart(2, '0') + '.' +
               String(date.getMilliseconds()).padStart(3, '0');
    }

    // Regular expression to match the timestamps in the transcript
    const timestampRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/g;

    // Replace each timestamp in the transcript with its local time equivalent
    const modifiedTranscript = transcript.replace(timestampRegex, match => convertTimestamp(match));

    return modifiedTranscript;
}


function convertDatesToISOFormat(transcript) {
    // Function to convert a single date from "dd-mm-yyyy" to "yyyy-mm-dd" format
    function convertDate(date) {
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
    }

    // Regular expression to match the dates in the transcript
    const dateRegex = /\b(\d{2})-(\d{2})-(\d{4})\b/g;

    // Replace each date in the transcript with its ISO format equivalent
    const modifiedTranscript = transcript.replace(dateRegex, match => convertDate(match));

    return modifiedTranscript;
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


function regenerate_textarea() {
	var textarea_rect = get_textarea_rect();

	if (document.querySelector("#src_textarea_container")) {
		document.querySelector("#src_textarea_container").style.fontFamily = document.querySelector("#select_src_font").value + ", sans-serif";
		document.querySelector("#src_textarea_container").style.width = String(textarea_rect.src_width)+'px';
		document.querySelector("#src_textarea_container").style.height = String(textarea_rect.src_height)+'px';
		document.querySelector("#src_textarea_container").style.top = String(textarea_rect.src_top)+'px';
		document.querySelector("#src_textarea_container").style.left = String(textarea_rect.src_left)+'px';

		var src_textarea_container$=$('<div id="src_textarea_container"><textarea id="src_textarea"></textarea></div>')
			.width(textarea_rect.src_width)
			.height(textarea_rect.src_height)
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
				'fontFamily': document.querySelector("#select_src_font").value + ', sans-serif',
				'fontSize': document.querySelector("#input_src_font_size").value,
				'color': document.querySelector("#input_src_font_color").value,
				'backgroundColor': hexToRgba(document.querySelector("#input_src_container_color").value, document.querySelector("#input_src_container_opacity").value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:textarea_rect.src_top, left:textarea_rect.src_left})

		document.querySelector("#src_textarea").style.width = String(textarea_rect.src_width)+'px';
		document.querySelector("#src_textarea").style.height = String(textarea_rect.src_height)+'px';
		document.querySelector("#src_textarea").style.width = '100%';
		document.querySelector("#src_textarea").style.height = '100%';
		document.querySelector("#src_textarea").style.border = 'none';
		document.querySelector("#src_textarea").style.display = 'inline-block';
		document.querySelector("#src_textarea").style.overflow = 'hidden';

		document.querySelector("#src_textarea").style.fontFamily = document.querySelector("#select_src_font").value + ", sans-serif";
		document.querySelector("#src_textarea").style.fontSize=String(document.querySelector("#input_src_font_size").value)+'px';
		document.querySelector("#src_textarea").style.color = document.querySelector("#input_src_font_color").value;
		document.querySelector("#src_textarea").style.backgroundColor = hexToRgba(document.querySelector("#input_src_container_color").value, document.querySelector("#input_src_container_opacity").value);

	} else {
		console.log('src_textarea_container has already exist');
	}


	if (document.querySelector("#dst_textarea_container")) {
		document.querySelector("#dst_textarea_container").style.fontFamily = document.querySelector("#select_dst_font").value + ", sans-serif";
		document.querySelector("#dst_textarea_container").style.width = String(textarea_rect.dst_width)+'px';
		document.querySelector("#dst_textarea_container").style.height = String(textarea_rect.dst_height)+'px';
		document.querySelector("#dst_textarea_container").style.top = String(textarea_rect.dst_top)+'px';
		document.querySelector("#dst_textarea_container").style.left = String(textarea_rect.dst_left)+'px';

		var dst_textarea_container$=$('<div id="dst_textarea_container"><textarea id="dst_textarea"></textarea></div>')
			.width(textarea_rect.dst_width)
			.height(textarea_rect.dst_height)
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
				'fontFamily': document.querySelector("#select_dst_font").value + ', sans-serif',
				'fontSize': document.querySelector("#input_dst_font_size").value,
				'color': document.querySelector("#input_dst_font_color").value,
				'backgroundColor': hexToRgba(document.querySelector("#input_dst_container_color").value, document.querySelector("#input_dst_container_opacity").value),
				'border': 'none',
				'display': 'block',
				'overflow': 'hidden',
				'z-index': '2147483647'
			})
			.offset({top:textarea_rect.dst_top, left:textarea_rect.dst_left})

		document.querySelector("#dst_textarea").style.width = String(textarea_rect.dst_width)+'px';
		document.querySelector("#dst_textarea").style.height = String(textarea_rect.dst_height)+'px';
		document.querySelector("#dst_textarea").style.width = '100%';
		document.querySelector("#dst_textarea").style.height = '100%';
		document.querySelector("#dst_textarea").style.border = 'none';
		document.querySelector("#dst_textarea").style.display = 'inline-block';
		document.querySelector("#dst_textarea").style.overflow = 'hidden';

		document.querySelector("#dst_textarea").style.fontFamily = document.querySelector("#select_dst_font").value + ", sans-serif";
		document.querySelector("#dst_textarea").style.fontSize=String(document.querySelector("#input_dst_font_size").value)+'px';
		document.querySelector("#dst_textarea").style.color = document.querySelector("#input_dst_font_color").value;
		document.querySelector("#dst_textarea").style.backgroundColor = hexToRgba(document.querySelector("#input_dst_container_color").value, document.querySelector("#input_dst_container_opacity").value);

	} else {
		console.log('dst_textarea_container has already exist');
	}
}


function getRect(element) {
	const rect = element.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    return {
		width: rect.width,
		height: rect.height,
		top: rect.top + scrollTop,
		left: rect.left + scrollLeft
	};
}


function get_textarea_rect() {
	var video_info = getVideoPlayerInfo();
	if (video_info) {
		//console.log("Video player found");
		//console.log("video_info.id = ", video_info.id);
		//console.log("Top:", video_info.top);
		//console.log("Left:", video_info.left);
		//console.log("Width:", video_info.width);
		//console.log("Height:", video_info.height);

		src_width = document.querySelector("#input_src_container_width_factor").value*getRect(video_info.element).width;
		//console.log('src_width = ', src_width);

		src_height = document.querySelector("#input_src_container_height_factor").value*getRect(video_info.element).height;
		//console.log('src_height = ', src_width);

		src_top = getRect(video_info.element).top + document.querySelector("#input_src_container_top_factor").value*getRect(video_info.element).height;
		//console.log('src_top = ', src_top);

		if (document.querySelector("#checkbox_centerize_src").checked) {
			src_left = getRect(video_info.element).left + 0.5*(getRect(video_info.element).width-src_width);
			//console.log('src_left = ', src_left);
		} else {
			src_left = getRect(video_info.element).left + document.querySelector("#input_src_container_left_factor").value*getRect(video_info.element).width;
			//console.log('src_left = ', src_left);
		}

		dst_width = document.querySelector("#input_dst_container_width_factor").value*getRect(video_info.element).width;
		//console.log('dst_width = ', dst_width);

		dst_height = document.querySelector("#input_dst_container_height_factor").value*getRect(video_info.element).height;
		//console.log('dst_height = ', dst_width);

		dst_top = getRect(video_info.element).top + document.querySelector("#input_dst_container_top_factor").value*getRect(video_info.element).height;
		//console.log('dst_top = ', dst_top);

		if (document.querySelector("#checkbox_centerize_dst").checked) {
			dst_left = getRect(video_info.element).left + 0.5*(getRect(video_info.element).width-dst_width);
			//console.log('dst_left = ', dst_left);
		} else {
			dst_left = getRect(video_info.element).left + document.querySelector("#input_dst_container_left_factor").value*getRect(video_info.element).width;
			//console.log('dst_left = ', dst_left);
		}

	} else {
		console.log("No video player found on this page");

		src_width = document.querySelector("#input_src_container_width_factor").value*window.innerWidth;
		//console.log('src_width = ', src_width);

		src_height = document.querySelector("#input_src_container_height_factor").value*window.innerHeight;
		//console.log('src_height = ', src_width);

		src_top = document.querySelector("#input_src_container_top_factor").value*window.innerHeight;
		//console.log('src_top = ', src_top);

		if (document.querySelector("#checkbox_centerize_src").checked) {
			src_left = 0.5*(window.innerWidth-src_width);
			//console.log('src_left = ', src_left);
		} else {
			src_left = document.querySelector("#input_src_container_left_factor").value*window.innerWidth;
			//console.log('src_left = ', src_left);
		}


		dst_width = document.querySelector("#input_dst_container_width_factor").value*window.innerWidth;
		//console.log('dst_width = ', dst_width);

		dst_height = document.querySelector("#input_dst_container_height_factor").value*window.innerHeight;
		//console.log('dst_height = ', dst_height);

		dst_top = document.querySelector("#input_dst_container_top_factor").value*window.innerHeight;
		//console.log('dst_top = ', dst_top);

		if (document.querySelector("#checkbox_centerize_dst").checked) {
			dst_left = 0.5*(window.innerWidth-dst_width);
			//console.log('dst_left = ', dst_left);
		} else {
			dst_left = document.querySelector("#input_dst_container_left_factor").value*window.innerWidth;
			//console.log('dst_left = ', dst_left);
		}
	}

	return {
		src_width: src_width,
		src_height: src_height,
		src_top: src_top,
		src_left: src_left,
		dst_width: dst_width,
		dst_height: dst_height,
		dst_top: dst_top,
		dst_left: dst_left
	}
}


function getVideoPlayerInfo() {
	var elements = document.querySelectorAll('video, iframe');
	//console.log('elements = ',  elements);
	var largestVideoElement = null;
	var largestSize = 0;

	for (var i = 0; i<elements.length; i++) {
		var rect = getRect(elements[i]);
		//console.log('rect', rect);
		if (rect.width > 0) {
			var size = rect.width * rect.height;
			if (size > largestSize) {
				largestSize = size;
				largestVideoElement = elements[i];
			}
			var videoPlayerID = elements[i].id;
			var style = window.getComputedStyle(elements[i]);
			//console.log('videoPlayerID = ',  videoPlayerID);
			var position = style.position !== 'static' ? style.position : 'relative';
			var zIndex = style.zIndex !== 'auto' && style.zIndex !== '0' ? parseInt(style.zIndex) : 1;

			return {
				element: elements[i],
				id: elements[i].id,
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
				position: position,
				zIndex: zIndex,
			};
		}
	}
	//console.log('No video player found');
	return null;
}


function create_iframe_video_player() {
	var div_iframe_header_unit, div_iframe_container, div_yt_iframe, tag_iframe;

	div_iframe_header_unit = document.createElement('div');
	document.body.appendChild(div_iframe_header_unit);
	div_iframe_header_unit.class = 'iframe_header_unit';
	div_iframe_header_unit.style.width = '100%';
	div_iframe_header_unit.style.height = '100%';
	div_iframe_header_unit.style.left = 0;
	div_iframe_header_unit.style.top = 0;
	div_iframe_header_unit.style.textAlign = 'center';
	div_iframe_header_unit.style.border = 0;

	div_iframe_container = document.createElement('div');
	div_iframe_header_unit.appendChild(div_iframe_container);
	div_iframe_container.class = 'iframe_container';
	div_iframe_container.style.width = '100%';
	div_iframe_container.style.height = '100%';
	div_iframe_container.style.top = 0;
	div_iframe_container.style.left = 0;
	div_iframe_container.style.textAlign = 'center';
	div_iframe_container.border = 0;

	div_yt_iframe = document.createElement('div');
	div_iframe_container.appendChild(div_yt_iframe);
	div_yt_iframe.class = 'iframe_container';
	div_yt_iframe.style.width = '100%';
	div_yt_iframe.style.height = '100%';
	div_yt_iframe.style.top = 0;
	div_yt_iframe.style.left = 0;
	div_yt_iframe.style.textAlign = 'center';
	div_yt_iframe.border = 0;

	tag_iframe = document.createElement('iframe');
	div_yt_iframe.appendChild(tag_iframe);
	tag_iframe.id = "my_yt_iframe";
	tag_iframe.style.width = '960px';
	tag_iframe.style.height = '540px';
	tag_iframe.style.frameBorder = 0;
	tag_iframe.style.position = 'absolute';
	tag_iframe.style.zIndex = 1;
	tag_iframe.style.display = 'none';
	tag_iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope;'
	tag_iframe.allowFullscreen = 'true';

	console.log(div_iframe_header_unit);
}


function create_hls_video_player() {
	var div_video_header_unit, div_video_container, div_video, tag_video, tag_source;

	div_video_header_unit = document.createElement('div');
	document.body.appendChild(div_video_header_unit);
	div_video_header_unit.class = 'video_header_unit';
	div_video_header_unit.style.width = '100%';
	div_video_header_unit.style.height = '100%';
	div_video_header_unit.style.left = 0;
	div_video_header_unit.style.top = 0;
	div_video_header_unit.style.textAlign = 'center';
	div_video_header_unit.style.border = 0;

	div_video_container = document.createElement('div');
	div_video_header_unit.appendChild(div_video_container);
	div_video_container.class = 'video_container';
	div_video_container.style.width = '100%';
	div_video_container.style.height = '100%';
	div_video_container.style.top = 0;
	div_video_container.style.left = 0;
	div_video_container.style.textAlign = 'center';
	div_video_container.border = 0;

	div_video = document.createElement('div');
	div_video_container.appendChild(div_video);
	div_video.class = 'video';
	div_video.style.width = '100%';
	div_video.style.height = '100%';
	div_video.style.top = 0;
	div_video.style.left = 0;
	div_video.style.textAlign = 'center';
	div_video.border = 0;

	tag_video = document.createElement('video');
	div_video.appendChild(tag_video);
	tag_video.class = 'video-js vjs-default-skin';
	tag_video.id = 'my_video';
	tag_video.style.width = '960px';
	tag_video.style.height = '540px';
	tag_video.style.frameBorder = 0;
	tag_video.style.position = 'absolute';
	tag_video.style.zIndex = 1;
	tag_video.style.display = 'none';
	tag_video.allow = 'accelerometer; autoplay; encrypted-media; gyroscope;'
	tag_video.allowFullscreen = 'true';
	tag_video.controls;
	tag_video.preload = 'auto';
	tag_video.dataSetup = '{}';

	tag_source = document.createElement('source');
	tag_video.appendChild(tag_source);
	tag_source.id = 'video_source';

	console.log(div_video_header_unit);
}

function create_cnn_video_player() {
	var div_detail__media_video, div_ratiobox, tag_iframe;

	div_detail__media_video = document.createElement('div');
	document.body.appendChild(div_detail__media_video);
	div_detail__media_video.class = 'div_detail__media-video';
	div_detail__media_video.style.width = '100%';
	div_detail__media_video.style.height = '100%';
	div_detail__media_video.style.display = 'block';
	div_detail__media_video.style.textAlign = 'center';
	div_detail__media_video.style.border = 0;
	div_detail__media_video.style.position = 'relative';
	div_detail__media_video.style.overflow = 'hidden';

	div_ratiobox = document.createElement('div');
	div_detail__media_video.appendChild(div_ratiobox);
	div_ratiobox.class = 'ratiobox';
	div_ratiobox.style.width = '100%';
	div_ratiobox.style.height = '100%';
	div_ratiobox.style.top = 0;
	div_ratiobox.style.left = 0;
	div_ratiobox.style.textAlign = 'center';
	div_ratiobox.style.margin = '0 auto';
	div_ratiobox.style.border = 0;
	div_ratiobox.style.overflow = 'hidden';
	div_ratiobox.style.position = 'relative';
	div_ratiobox.style.paddingBottom = '56.25%'; /* 16:9 ratio */

	tag_iframe = document.createElement('iframe');
	div_ratiobox.appendChild(tag_iframe);
	tag_iframe.id = "cnnlive";
	tag_iframe.style.width = '960px';
	tag_iframe.style.height = '540px';
	tag_iframe.style.frameBorder = 0;
	tag_iframe.style.position = 'absolute';
	tag_iframe.style.display = 'none';
	tag_iframe.allowFullscreen = 'true';

	console.log(div_detail__media_video);
}
