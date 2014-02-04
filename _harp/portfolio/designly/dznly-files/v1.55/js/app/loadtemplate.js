define([
	'underscore',
	// 'app/config',
	'app/jst/jst-tmp'
	],
function(_, templates) {
	var loadTemplate = function(name, opts) {
		opts = opts ? opts : {};
		_.extend(opts, window.config);
		return templates[name](opts);
	}

	return loadTemplate;
}
);