var settings = require("../config/settings");

module.exports = function(app, route) {
	app.get(route, function indexPageController(req, res, next) {
		res.render('index', {
			title: settings.title,
			theme: settings.theme,
			weather_title: settings.weather_title,
			showWeather: settings.api_urls.weather && settings.api_urls.forecast
		});
	});

	// Return middleware
	return function(req, res, next) {
		next();
	};
}
