#!/bin/sh

echo '<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet href="../css/weather.css" type="text/css"?>
<svg version="1.1" id="weatherIcons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 30 30" style="enable-background:new 0 0 30 30;" xml:space="preserve">
<defs>' > site/themes/porz/img/weather.svg

for file in `ls -1 site/icons/wi-*.svg | egrep -v "wi-(moon|wind|time|direction)-"`; do
	iconName=`basename "$file" | sed 's/\.svg$//'`
	cat $file | grep -iv "version" | grep -v "svg" | grep -v "viewBox" | grep -v "^$" | sed 's/path d/path id="'$iconName'" d/' >> site/themes/porz/img/weather.svg
done

echo '</defs>
<use id="weatherIcon" />
</svg>' >> site/themes/porz/img/weather.svg
