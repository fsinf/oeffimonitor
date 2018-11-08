//var api_url = 'server/index.php';
//var api_url = 'test/response.json'; // local copy for testing
var api_url = '/api';

var walkTimes = {
// walkTime = walking distance in seconds
// unreachTime = threshold to hide unreachable connections
	"Friedensbrücke": {"walkTime": 600, "unreachTime": 540},
	"Bauernfeldplatz": {"walkTime": 60, "unreachTime": 30},
	"Franz-Josefs-Bahnhof": {"walkTime": 360, "unreachTime": 300}
};
