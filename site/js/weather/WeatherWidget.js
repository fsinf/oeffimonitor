var WeatherWidget = (function () {

	return WeatherWidget;

	function WeatherWidget(div) {
		var currentIcon = document.getElementById('currentIcon');
		var currentTemperature = document.getElementById('currentTemperature');
		var forecastIcons = div.getElementsByClassName('forecastIcon');
		var forecastTimes = div.getElementsByClassName('forecastTime');
		var forecastTemperatures = div.getElementsByClassName('forecastTemperature');
		var lastUpdate = document.getElementById('lastWeatherUpdate');
		this.setCurrentTemperature = setCurrentTemperature;
		this.setCurrentIcon = setCurrentIcon;
		this.setForecasts = setForecasts;

		/**
		* setForecasts - updates the weather forecast information in the svg
		* expects an array of objects formed like this:
		* [{ iconId: this.icons.snow, time: '06:00', temperature: 20.15 },...]
		*
		* @param  {type} forecasts description
		* @return {type}           description
		*/
		function setForecasts(forecasts) {
			refreshLastUpdate();
			forecasts.forEach(function processForecast(forecast, index){
				if (forecastIcons[index] && forecastTimes[index] && forecastTemperatures[index]) {
					setIcon(forecastIcons[index],forecast.iconId);
					setText(forecastTimes[index],forecast.time);
					setText(forecastTemperatures[index],forecast.temperature.toFixed(0)+ '°C');
				}
			}, this);
		}

		/**
		* setIcon - sets current weather icon
		*
		* @param  {String} iconId id of the icon from the svg file (xlink:href syntax)
		*/
		function setCurrentIcon(iconId) {
			refreshLastUpdate();
			setIcon(currentIcon,iconId);
		}

		/**
		* setCurrentTemperature - updates the current temperature in the graphic
		*
		* @param  {Number} temperature temperature in degrees Celsius
		*/
		function setCurrentTemperature(temperature) {
			refreshLastUpdate();
			setText(currentTemperature, temperature.toFixed(0)+"°C");
		}

		/**
		* setText - private function to create/replace Text Nodes
		*
		* @param  {Node} node DOM node to set text of
		* @param  {string} text text content to set
		*/
		function setText(node, text) {
			node.innerText = text;
		}

		function setIcon(node, iconId) {
			svg = node.getElementsByClassName('weatherIcon')[0];
			if (svg !== null) {
				svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/img/weather.svg#wi-'+iconId);
			}
		}

		function refreshLastUpdate() {
			lastUpdate.innerText = 'Last Update ' + formatTime(new Date());
		}

		function formatTime(date) {
			var hours = "0" + date.getHours();
			var minutes = "0" + date.getMinutes();
			var seconds = "0" + date.getSeconds();

			var formattedTime = hours.substr(-2) + ':' + minutes.substr(-2)+':'+seconds.substr(-2);
			return formattedTime;
		}

	}

})()
