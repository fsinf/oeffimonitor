var weatherUpdateFunction;
(function () {
	var weather;
	var mapping = new WeatherConditionMapping();
	var forecast;
	document.addEventListener("DOMContentLoaded", onReady);

	function onReady(){
		console.log("onReady");
		forecast = document.getElementById('forecast');
		//forecast.addEventListener("load", function(event){
		console.log("Load event");
		weather = new WeatherWidget(document.getElementById('forecast'));
		updateDisplay();
		weatherUpdateFunction = function() {
			updateDisplay();
		}
		//});
	}

	function updateDisplay() {
		getWeatherData(onWeatherDataReceived);
		function onWeatherDataReceived(weatherData){
			weather.setCurrentIcon(mapping.getIcon(weatherData.current.weather[0].id, weatherData.current.weather[0].icon));
			weather.setCurrentTemperature(weatherData.current.main.temp);
			var forecasts = weatherData.forecast.list;
			var relevantForecasts = forecasts.slice(0,Math.min(6,forecasts.length));
			var processedForecasts = relevantForecasts.map(function (forecast){
				return {
					iconId: mapping.getIcon(forecast.weather[0].id, forecast.weather[0].icon),
					time: formatTime(forecast.dt * 1000), // format is seconds since unix epoch, convert to msecs
					temperature: forecast.main.temp
				};
			});
			weather.setForecasts(processedForecasts);
		}
	}

	function getWeatherData(callback){
		var weatherData = {
			current:null,
			forecast:null,
			checkAllLoaded: function checkAllLoaded() {
				if (!this.current || !this.forecast) return;
				setErrorIconVisible(false);
				callback(this);
			}
		};

		getHTTP('/weather',onCurrentWeatherLoaded,onError);
		getHTTP('/forecast',onForecastLoaded,onError);

		function onError() { setErrorIconVisible(true); }
		function onCurrentWeatherLoaded() { weatherData.current = this.response; weatherData.checkAllLoaded(); }
		function onForecastLoaded() { weatherData.forecast = this.response; weatherData.checkAllLoaded(); }
	}

	function formatTime(timestamp) {
		var date = new Date(timestamp);
		var hours = "0" + date.getHours();
		var minutes = "0" + date.getMinutes();

		var formattedTime = hours.substr(-2) + ':' + minutes.substr(-2);
		return formattedTime;
	}

	function getHTTP(url,completeCallback,errorCallback) {
		var request = new XMLHttpRequest();
		request.addEventListener("load",statusInterceptor);
		request.addEventListener("error",errorCallback);
		request.responseType = 'json';
		request.open('GET',url);
		request.send();

		function statusInterceptor() {
			if (this.status != 200) {
				errorCallback.apply(this);
			} else {
				completeCallback.apply(this);
			}
		}
	}

	function setErrorIconVisible(visible) {
		var errorSpan = document.getElementById('weatherError');
		if (visible) {
			errorSpan.style.display = 'inline'
			// forecast.style.display = 'none'; REMOVED - bug at least in Chrome will force a reload of the SVG, retriggering the load event
		} else {
			errorSpan.style.display = 'none';
			// forecast.style.display = 'inline'; REMOVED - bug at least in Chrome will force a reload of the SVG, retriggering the load event
		}

	}

	// Mappings of weather conditions to icons as defined by openweathermap
	// #see http://openweathermap.org/weather-conditions
	//
	function WeatherConditionMapping() {
		/* Group 2xx Thunderstorm */
		/* Group 3xx Drizzle */
		/* Group 5xx Rain */
		/* Group 6xx Snow */
		/* Group 7xx Atmosphere */
		/* Group 800 clear */
		/* Group 80x Clouds */
		/* Group 90x Extreme */

		this['200'] = 'thunderstorm';
		this['201'] = 'thunderstorm';
		this['202'] = 'thunderstorm';
		this['210'] = 'lightning';
		this['211'] = 'lightning';
		this['212'] = 'lightning';
		this['221'] = 'lightning';
		this['230'] = 'thunderstorm';
		this['231'] = 'thunderstorm';
		this['232'] = 'thunderstorm';
		this['300'] = 'sprinkle';
		this['301'] = 'sprinkle';
		this['302'] = 'rain';
		this['310'] = 'rain-mix';
		this['311'] = 'rain';
		this['312'] = 'rain';
		this['313'] = 'showers';
		this['314'] = 'rain';
		this['321'] = 'sprinkle';
		this['500'] = 'sprinkle';
		this['501'] = 'rain';
		this['502'] = 'rain';
		this['503'] = 'rain';
		this['504'] = 'rain';
		this['511'] = 'rain-mix';
		this['520'] = 'showers';
		this['521'] = 'showers';
		this['522'] = 'showers';
		this['531'] = 'storm-showers';
		this['600'] = 'snow';
		this['601'] = 'snow';
		this['602'] = 'sleet';
		this['611'] = 'rain-mix';
		this['612'] = 'rain-mix';
		this['615'] = 'rain-mix';
		this['616'] = 'rain-mix';
		this['620'] = 'rain-mix';
		this['621'] = 'snow';
		this['622'] = 'snow';
		this['701'] = 'showers';
		this['711'] = 'smoke';
		this['721'] = 'day-haze';
		this['731'] = 'dust';
		this['741'] = 'fog';
		this['761'] = 'dust';
		this['762'] = 'dust';
		this['771'] = 'cloudy-gusts';
		this['781'] = 'tornado';
		this['800'] = 'day-sunny';
		this['801'] = 'cloudy-gusts';
		this['802'] = 'cloudy-gusts';
		this['803'] = 'cloudy-gusts';
		this['804'] = 'cloudy';
		this['900'] = 'tornado';
		this['901'] = 'storm-showers';
		this['902'] = 'hurricane';
		this['903'] = 'snowflake-cold';
		this['904'] = 'hot';
		this['905'] = 'windy';
		this['906'] = 'hail';
		this['957'] = 'strong-wind';
		this['day-200'] = 'day-thunderstorm';
		this['day-201'] = 'day-thunderstorm';
		this['day-202'] = 'day-thunderstorm';
		this['day-210'] = 'day-lightning';
		this['day-211'] = 'day-lightning';
		this['day-212'] = 'day-lightning';
		this['day-221'] = 'day-lightning';
		this['day-230'] = 'day-thunderstorm';
		this['day-231'] = 'day-thunderstorm';
		this['day-232'] = 'day-thunderstorm';
		this['day-300'] = 'day-sprinkle';
		this['day-301'] = 'day-sprinkle';
		this['day-302'] = 'day-rain';
		this['day-310'] = 'day-rain';
		this['day-311'] = 'day-rain';
		this['day-312'] = 'day-rain';
		this['day-313'] = 'day-rain';
		this['day-314'] = 'day-rain';
		this['day-321'] = 'day-sprinkle';
		this['day-500'] = 'day-sprinkle';
		this['day-501'] = 'day-rain';
		this['day-502'] = 'day-rain';
		this['day-503'] = 'day-rain';
		this['day-504'] = 'day-rain';
		this['day-511'] = 'day-rain-mix';
		this['day-520'] = 'day-showers';
		this['day-521'] = 'day-showers';
		this['day-522'] = 'day-showers';
		this['day-531'] = 'day-storm-showers';
		this['day-600'] = 'day-snow';
		this['day-601'] = 'day-sleet';
		this['day-602'] = 'day-snow';
		this['day-611'] = 'day-rain-mix';
		this['day-612'] = 'day-rain-mix';
		this['day-615'] = 'day-rain-mix';
		this['day-616'] = 'day-rain-mix';
		this['day-620'] = 'day-rain-mix';
		this['day-621'] = 'day-snow';
		this['day-622'] = 'day-snow';
		this['day-701'] = 'day-showers';
		this['day-711'] = 'smoke';
		this['day-721'] = 'day-haze';
		this['day-731'] = 'dust';
		this['day-741'] = 'day-fog';
		this['day-761'] = 'dust';
		this['day-762'] = 'dust';
		this['day-781'] = 'tornado';
		this['day-800'] = 'day-sunny';
		this['day-801'] = 'day-cloudy-gusts';
		this['day-802'] = 'day-cloudy-gusts';
		this['day-803'] = 'day-cloudy-gusts';
		this['day-804'] = 'day-sunny-overcast';
		this['day-900'] = 'tornado';
		this['day-902'] = 'hurricane';
		this['day-903'] = 'snowflake-cold';
		this['day-904'] = 'hot';
		this['day-906'] = 'day-hail';
		this['day-957'] = 'strong-wind';
		this['night-200'] = 'night-alt-thunderstorm';
		this['night-201'] = 'night-alt-thunderstorm';
		this['night-202'] = 'night-alt-thunderstorm';
		this['night-210'] = 'night-alt-lightning';
		this['night-211'] = 'night-alt-lightning';
		this['night-212'] = 'night-alt-lightning';
		this['night-221'] = 'night-alt-lightning';
		this['night-230'] = 'night-alt-thunderstorm';
		this['night-231'] = 'night-alt-thunderstorm';
		this['night-232'] = 'night-alt-thunderstorm';
		this['night-300'] = 'night-alt-sprinkle';
		this['night-301'] = 'night-alt-sprinkle';
		this['night-302'] = 'night-alt-rain';
		this['night-310'] = 'night-alt-rain';
		this['night-311'] = 'night-alt-rain';
		this['night-312'] = 'night-alt-rain';
		this['night-313'] = 'night-alt-rain';
		this['night-314'] = 'night-alt-rain';
		this['night-321'] = 'night-alt-sprinkle';
		this['night-500'] = 'night-alt-sprinkle';
		this['night-501'] = 'night-alt-rain';
		this['night-502'] = 'night-alt-rain';
		this['night-503'] = 'night-alt-rain';
		this['night-504'] = 'night-alt-rain';
		this['night-511'] = 'night-alt-rain-mix';
		this['night-520'] = 'night-alt-showers';
		this['night-521'] = 'night-alt-showers';
		this['night-522'] = 'night-alt-showers';
		this['night-531'] = 'night-alt-storm-showers';
		this['night-600'] = 'night-alt-snow';
		this['night-601'] = 'night-alt-sleet';
		this['night-602'] = 'night-alt-snow';
		this['night-611'] = 'night-alt-rain-mix';
		this['night-612'] = 'night-alt-rain-mix';
		this['night-615'] = 'night-alt-rain-mix';
		this['night-616'] = 'night-alt-rain-mix';
		this['night-620'] = 'night-alt-rain-mix';
		this['night-621'] = 'night-alt-snow';
		this['night-622'] = 'night-alt-snow';
		this['night-701'] = 'night-alt-showers';
		this['night-711'] = 'smoke';
		this['night-721'] = 'day-haze';
		this['night-731'] = 'dust';
		this['night-741'] = 'night-fog';
		this['night-761'] = 'dust';
		this['night-762'] = 'dust';
		this['night-781'] = 'tornado';
		this['night-800'] = 'night-clear';
		this['night-801'] = 'night-alt-cloudy-gusts';
		this['night-802'] = 'night-alt-cloudy-gusts';
		this['night-803'] = 'night-alt-cloudy-gusts';
		this['night-804'] = 'night-alt-cloudy';
		this['night-900'] = 'tornado';
		this['night-902'] = 'hurricane';
		this['night-903'] = 'snowflake-cold';
		this['night-904'] = 'hot';
		this['night-906'] = 'night-alt-hail';
		this['night-957'] = 'strong-wind';


		this.getIcon = function getIcon(code, icon) {
			var prefixCode;
			if (icon.slice(-1) == 'n') {
				prefixCode = "night-" + code;
			} else {
				prefixCode = "day-" + code;
			}
			if (this[prefixCode] !== undefined && (typeof this[prefixCode] === 'string')) {
				return this[prefixCode];
			} else if (this[code] !== undefined && (typeof this[code] === 'string' )) {
				return this[code];
			}
				return 'mix'; // fallback for unknown code
			}
	}


})()
