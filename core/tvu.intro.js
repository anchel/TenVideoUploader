;
(function(factory, $, win, doc) {

	var tvu = factory($, win, doc);

	win.tvu = tvu;

	if (typeof define === 'function' && (define.cmd || define.amd)) {
		define(tvu);
	}

}(function($, window, document, undefined) {
	var tvu = {
		debug: false
	};
// }));