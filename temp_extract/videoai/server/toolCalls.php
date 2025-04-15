<?php
require_once '../vendor/autoload.php';
require_once './apikeys.php';
use \GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

function convertFarrCelsius($value) {
    return round(( (int) $value  - 32) / 1.8, 1);
}

/**
 * Sample method for returning current weather of specific location. Get API key from https://weather.visualcrossing.com and replace in getCurrentWeatherAPI in server/apikeys.php
 * For background image changes, register with https://api.unsplash.com/, get their API key and replace with getBackgroundAPI in server/apikeys.php
 * In Video AI section in the dashboard in the advanced section, for the getCurrentWeather sample function to work, fill in in "Name of the function" getCurrentWeather, 
 * "Description" - "Get the current weather in a given location for specific date, today or tomorrow" and parameters - location,date,unit.
 * Additionaly a request is sent to get the background of a location to https://api.unsplash.com/
 * The ChatGPT detects a location and passes it to this method defined in the schema. Ask for example: "Weather in New York"
 */

function getCurrentWeather($arguments)
{
    global $getCurrentWeatherAPI, $getBackgroundAPI;
    $arguments = json_decode($arguments);
    $dateFor = '';
    if (isset($arguments->date)) {
        $d = strtotime($arguments->date);
        $date = date('Y-m-d', $d);
        $dateFor = date('d M', $d);
    } else {
        $date = date("Y-m-d");
    }

    $api_url = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/' . $arguments->location . '/' . $date . '/' . $date . '?key=' . $getCurrentWeatherAPI;
    $json_data = file_get_contents($api_url);
    $response_data = json_decode($json_data);
    $temp = '';
    $tempmax = '';
    $tempmin = '';
    if (!isset($arguments->date) || $arguments->date === 'today') {
        $condition = $response_data->currentConditions->conditions;
        $temp = $response_data->currentConditions->temp;
    } else {
        $condition = $response_data->days[0]->conditions;
        $tempmax = $response_data->days[0]->tempmax;
        $tempmin = $response_data->days[0]->tempmin;
    }

    if (isset($arguments->unit) && $arguments->unit === 'fahrenheit') {
        $temp = $temp . ' degrees in Fahrenheit';
        $tempmax = convertFarrCelsius($tempmax) . ' degrees in Fahrenheit';
        $tempForecast = 'minimum temperature of ' . $tempmin . ' and maximum temperature of ' . $tempmax . ' degrees in Fahrenheit';
    } else {
        $temp = convertFarrCelsius($temp) . ' degrees in Celsius';
        $tempForecast = 'minimum temperature of ' . convertFarrCelsius($tempmin) . ' and maximum temperature of ' . convertFarrCelsius($tempmax) . ' degrees in Celsius';
    }

    $api_url = 'https://api.unsplash.com/search/photos?client_id=' . $getBackgroundAPI . '&order_by=relevant&query=' . $arguments->location . '&orientation=landscape&per_page=1';

    $client = new Client();
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data, true);
    $backgroundImage = ($response_data && $response_data['results']) ? $response_data['results'][0]['urls']['regular'] : '';
    if (!isset($arguments->date) || $arguments->date === 'today') {
        $text = 'Current weather condition for ' . $arguments->location . ' is ' . strtolower($condition) . ' with temperature of ' . $temp;
    } else {
        $text = 'Weather forecast for ' . $arguments->location . ' for ' . $arguments->date . ' (' . $dateFor . ') is ' . strtolower($condition) . ' with ' . $tempForecast;
    }
    return ['text' => $text, 'background' => $backgroundImage];
}

/**
 * Sample method for price of stocks from finance yahoo
 * In Video AI section in the dashboard in the advanced section, fill in getPrice in "Name of the function"
 * "Description" - "Get the current price for a stock" and parameters - symbol
 * The ChatGPT detects if you are asking for a price and returns it, i.e. "What is the price of crude oil"
 */

function getPrice($arguments)
{
    $arguments = json_decode($arguments);
    $url = 'https://query1.finance.yahoo.com/v8/finance/chart/' . $arguments->symbol . '?region=US&lang=en-US&includePrePost=false&interval=1h&useYfid=true&range=1d';
    // $stock_data = json_decode(file_get_contents($url), true);
    $client = new Client();
    $response = $client->request('GET', $url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $stock_data = json_decode($data, true);


    if (isset($stock_data)) {
        if (isset($stock_data['chart']['result'][0]['meta']['regularMarketPrice'])) {
            return ['text' => 'Current price of ' . $arguments->symbol . ' is ' . $stock_data['chart']['result'][0]['meta']['regularMarketPrice'] . ' USD.'];
        } else {
            return ['text' => 'Sorry, cannot provide price for ' . $arguments->symbol];
        }
    } else {
        return ['text' => 'Symbol is not recognised, please provide more specific info.'];
    }
}

/**
 * Sample method for converting currency to USD. You need to get API key from https://exchangerate-api.com and put it with getCurrencyAPI in server/apikeys.php
 * In Video AI section in the dashboard in the advanced section, fill in "getCurrency" in "Name of the function"
 * "Description" - "Listen to currency and conversion" and parameters - currency,quantity
 * The ChatGPT detects if you are asking for a currency conversion and returns it, i.e. "Convert me 100 euros please"
 */

function getCurrency($arguments)
{
    global $getCurrencyAPI;
    $arguments = json_decode($arguments);
    $url = 'https://v6.exchangerate-api.com/v6/' . $getCurrencyAPI . '/latest/USD';
    $response_json = file_get_contents($url);
    $quantity = isset($arguments->quantity) ? $arguments->quantity : 1;
    $currency = $arguments->currency;
    if (false !== $response_json) {
        $response = json_decode($response_json);
        if ('success' === $response->result) {
            $price = round(($quantity / $response->conversion_rates->$currency), 2);
            return ['text' => 'Currency conversion of ' . $quantity . ' ' . $currency . ' is ' . $price . ' USD'];
        } else {
            return ['text' => 'Sorry, cannot provide conversion for ' . $currency];
        }
    }
}

/**
 * Sample for getting hotel information from TravelPayouts hotel data API. Create an account from https://engine.hotellook.com, get your API token and set it in getHotelsAPI in server/apikeys.php
 * For background image changes, register with https://api.unsplash.com/, get their API key and set it getBackgroundAPI in server/apikeys.php
 * In Video AI section in the dashboard in the advanced section, fill in "getHotel" in "Name of the function"
 * "Description" - "Get hotels in city location" and parameters - city
 * The ChatGPT detects keywords hotels and location of a city calls the TravelPayouts API and responds
 */

function getHotels($arguments)
{
    global $getHotelsAPI, $getBackgroundAPI;
    $arguments = json_decode($arguments);
    $client = new Client();
    $api_url = 'https://engine.hotellook.com/api/v2/lookup.json?query=' . $arguments->city . '&lang=en&lookFor=hotel&limit=5&token=' . $getHotelsAPI;
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data);
    if ($response_data) {
        $data = $response_data->results;
        $answer = 'Hotels near ' . $arguments->city . ' are ';
        foreach ($data->hotels as $key => $value) {
            $end = ($key == count($data->hotels) - 1) ? '' : ', ';
            $answer .= $value->label . $end;
        }
    } else {
        $answer = 'Sorry, I cannot find hotels near this location.';
    }
    $api_url = 'https://api.unsplash.com/search/photos?client_id=' . $getBackgroundAPI . '&order_by=relevant&query=' . $arguments->city . '&orientation=landscape&per_page=1';
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data, true);
    $backgroundImage = ($response_data) ? $response_data['results'][0]['urls']['regular'] : '';

    return ['text' => $answer, 'background' => $backgroundImage];
}

/**
 * Sample for getting news based on keywords from https://eventregistry.org data API. Create an account from https://eventregistry.org, get your API token and add it in server/apikeys in getNewsAPI
 * In Video AI section in the dashboard in the advanced section, fill in "getNews" in "Name of the function"
 * "Description" - "Get latest news by keywords" and parameters - keywords
 * The ChatGPT detects the request and based on the keywords calls NewsApi API and responds
 */
function getNews($arguments)
{
    global $getNewsAPI;
    $arguments = json_decode($arguments);
    $api_url = 'https://eventregistry.org/api/v1/article/getArticles?action=getArticles&keyword=' . $arguments->keywords . '&dateStart=' . date("Y-m-d") . '&lang=eng&articlesCount=10&articlesSortBy=date&resultType=articles&&apiKey=' . $getNewsAPI;

    $client = new Client();
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data);
    $answer = '';
    if ($response_data && $response_data->articles) {
        $answer = 'Please choose from the chat a news topic|';
        foreach ($response_data->articles->results as $key => $value) {
            $answer .= '<a href="#" onclick="sendVideoAi(\'Get detailed news title ' . $value->title . ' and keywords ' . $arguments->keywords . ' \')">' . $value->title .'</a><hr>';
            if ($key === 0) {
                $backgroundImage = $value->image;
            }
        }
    }

    return ['text' => $answer, 'background' => $backgroundImage];
}

/**
 * Sample for getting news body on keywords from https://eventregistry.org data API. Create an account from https://eventregistry.org, get your API token and put it in getNewsAPI in server/apikeys.php
 * In Video AI section in the dashboard in the advanced section, fill in "getNewsDetailed" in "Name of the function",
 * "Description" - "Get news by title and keywords" and parameters - news, keywords
 * The ChatGPT detects the request and based on the keywords calls NewsApi API and responds.
 */
function getNewsDetailed($arguments)
{
    global $getNewsAPI;
    $arguments = json_decode($arguments);
    $api_url = 'https://eventregistry.org/api/v1/article/getArticles?action=getArticles&keyword=' . $arguments->keywords . '&dateStart=' . date("Y-m-d") . '&lang=eng&articlesCount=10&articlesSortBy=date&resultType=articles&&apiKey=' . $getNewsAPI;
    $client = new Client();
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data);
    $answer = '';
    if ($response_data && $response_data->articles) {
        foreach ($response_data->articles->results as $key => $value) {
            $title = substr($arguments->news, 0, 30);
            $title = substr($title, 0, strrpos($title, ' '));
            if (str_contains($value->title, $title)) {
                $answer = (string) $value->body;
                break;
            }
        }
    }

    return ['text' => $answer];
}

/**
 * Sample for opening an URL of a company.
 * For background image changes, register with https://api.unsplash.com/, get their API key and replace with BACK_API_KEY
 * In Video AI section in the dashboard in the advanced section, fill in "getUrl" in "Name of the function",
 * "Description" - "Open an URL of a company by keyword" and parameters - keyword
 */

function getUrl($arguments)
{
    $arguments = json_decode($arguments);
    $client = new Client();
    $api_url = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=' . $arguments->keyword;
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $domain = '';
    $response_data = json_decode($data);
    if ($response_data) {
        $data = $response_data[0]->domain;
        $answer = 'I found this website ' . $data;
        $domain = 'https://' . $data;
    } else {
        $answer = 'Sorry, I cannot find URL or company based on ' . $arguments->keyword;
    }
    $api_url = 'https://api.unsplash.com/search/photos?client_id=TedTBuztd0S2KgA8btLxj3AA21wqsvGIAlRszyMNJNk&order_by=relevant&query=' . $arguments->keyword . '&orientation=landscape&per_page=1';
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data, true);
    $backgroundImage = ($response_data && $response_data['results']) ? $response_data['results'][0]['urls']['regular'] : '';
    return ['text' => $answer, 'background' => $backgroundImage, 'url' => $domain];
}

/**
 * Sample function for getting available timeslots for a booking. For example a healthcare organization or a hotel availability
 * In Video AI section in the dashboard in the advanced section, fill in "getAvailableTimeslots" in "Name of the function",
 * "Description" - "Get available timeslots and free hours" and parameters - date
 */

function getAvailableTimeslots($arguments)
{
    require_once 'connect.php';
    global $dbPrefix, $pdo;
    $arguments = json_decode($arguments);
    if (isset($arguments->date)) {
        $dateList = $arguments->date;
        $date = date('Y-m-d', strtotime($arguments->date));
        $dateFor = date('d M', strtotime($arguments->date));
        if ($date < date('Y-m-d', strtotime('+1 day'))) {
            $dateForError = date('d M', strtotime('+1 day'));
            $answer = 'You cannot book before ' . $dateForError;
            return ['text' => $answer];
        }
    } else {
        $dateList = 'tomorrow';
        $date = date('Y-m-d', strtotime('+1 day'));
        $dateFor = date('d M', strtotime('+1 day'));
    }

    $arrTimeslots = ['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm'];
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'bookings WHERE date_booking = ?');
    $stmt->execute([$date]);
    $slots = [];
    while ($r = $stmt->fetch()) {
        array_push($slots, $r['timeslot']);
    }
    $result = array_diff($arrTimeslots, $slots);
    if (count($result) > 0) {
        $answer = 'Available timeslots for '. $dateList .', ' . $dateFor . ',  are ' . implode(',', $result) . '. Do you want me to book a timeslot?';
    } else {
        $answer = 'There are not available timeslots for ' . $arguments->date;
    }

    return ['text' => $answer];
}


/**
 * Sample function for booking a timeslot
 * In Video AI section in the dashboard in the advanced section, fill in "bookTimeslot" in "Name of the function",
 * "Description" - "Book a timeslot availability with email and name" and parameters - timeslot,date,email,name
 */

function bookTimeslot($arguments)
{
    require_once 'connect.php';
    global $dbPrefix, $pdo, $fromEmail;
    $arguments = json_decode($arguments);
    if (isset($arguments->date)) {
        $date = date('Y-m-d', strtotime($arguments->date));
        $dateFor = date('d M', strtotime($arguments->date));
    } else {
        $date = date('Y-m-d', strtotime('+1 day'));
        $dateFor = date('d M', strtotime('+1 day'));
    }
    $arrTimeslots = ['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm'];
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'bookings WHERE date_booking = ? and timeslot = ?');
    $stmt->execute([$date, $arguments->timeslot]);
    $booking = $stmt->fetch();
    if ($booking) {
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'bookings WHERE date_booking = ?');
        $stmt->execute([$date]);
        $slots = [];
        while ($r = $stmt->fetch()) {
            array_push($slots, $r['timeslot']);
        }
        $result = array_diff($arrTimeslots, $slots);
        $answer = 'I am sorry, but there are no available timeslots, please choose another. Availabilities are ' . implode(', ', $result);
        // return false;
    } else {

        if (!isset($arguments->name) || !isset($arguments->email)) {
            $answer = 'Please provide email and name for the booking.';
        } else {
            $sql = 'INSERT INTO ' . $dbPrefix . 'bookings (name, email, timeslot, date_booking) VALUES (?, ?, ?, ?)';
            $pdo->prepare($sql)->execute([$arguments->name, $arguments->email, $arguments->timeslot, $date]);
            $answer = 'Thank you ' . $arguments->name . '. I have booked ' . $arguments->timeslot . ' for '. $dateFor . '. You will receive a confimation email shortly.';
            $subject = 'Confrimation for a booking';
            $message = 'Hello, ' . $arguments->name . '<br/><br/>This is a confirmation email that you have booked for '. $dateFor . ' at ' . $arguments->timeslot . '.<br/><br/>Sincerely, <br/>Angela from LiveSmart Team.';
            $header = "From: LiveSmart Team <" . $fromEmail . "> \r\n";
            $header .= "Reply-To: " . $fromEmail . " \r\n";
            $header .= "MIME-Version: 1.0\r\n";
            $header .= "Content-type: text/html\r\n";
            $retval = mail($arguments->email, $subject, $message, $header);
        }
    }

    return ['text' => $answer];
}


/**
 * Sample for getting news based on keywords from a free RSS data deed. Get your desired news feed URL and replace with it NEWS_FEED_URL
 * In Video AI section in the dashboard in the advanced section, fill in "getNewsFeed" in "Name of the function",
 * "Description" - "Get latest news" and parameters - news
 * The ChatGPT detects the request and returns last 10 news feed.
 */
function getNewsFeed($arguments)
{
    global $getNewsFeedAPI;
    $arguments = json_decode($arguments);
    $url = $getNewsFeedAPI;
    $rss_feed = simplexml_load_file($url);
    // $answer = 'Please open the chat and click on a news feed|';
    $answer = 'Моля, отворете чат прозореца и изберете новина|';
    if (!empty($rss_feed)) {
        $i = 0;
        foreach ($rss_feed->channel->item as $feed_item) {
            if ($i >= 10)
                break;
            $title = substr($feed_item->title, 0, 100);
            $title = substr($title, 0, strrpos($title, ' '));
            $answer .= '<a href="#" onclick="sendVideoAi(\'Get detailed news from RSS ' . $title . '\')">' . $feed_item->title .'</a><hr>';
        }
    }
    return ['text' => $answer];
}

/**
 * Sample for getting news based on keywords from a free RSS data deed
 * In Video AI section in the dashboard in the advanced section, fill in "getNewsFeedDetailed" in "Name of the function",
 * "Description" - "Get detailed news from RSS" and parameters - news
 * The ChatGPT detects the request and returns a detailed description.
 */
function getNewsFeedDetailed($arguments)
{
    global $getNewsFeedAPI;
    $arguments = json_decode($arguments);
    $url = $getNewsFeedAPI;
    $rss = simplexml_load_file($url, null, LIBXML_NOCDATA);
    $answer = '';
    $backgroundImage = '';
    foreach($rss->channel->item as $item) {
        $title = (string) $item->title;
        if (str_contains($title, $arguments->news)) {
            $answer = (string) $item->description;
            $backgroundImage = (string) $item->enclosure->attributes()->url;
            break;
        }
    }
    return ['text' => $answer, 'background' => $backgroundImage];
}

/**
 * Listing YouTube videos. Get from https://console.cloud.google.com/ API token that is enabled for YouTube data and add it in server/apikeys in getYoutubeAPI
 * In Video AI section in the dashboard in the advanced section, fill in "getYoutube" in "Name of the function"
 * "Description" - "Get youtube videos by keywords" and parameters - keywords
 * The ChatGPT detects the request and based on the keywords calls NewsApi API and responds
 */
function getYoutube($arguments)
{
    global $getYoutubeAPI;
    $arguments = json_decode($arguments);
    $api_url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=' . $arguments->keywords . '&type=video&key=' . $getYoutubeAPI;

    $client = new Client();
    $response = $client->request('GET', $api_url, [
        'headers' => [
            'accept' => 'application/json',
            'content-type' => 'application/json'
        ],
    ]);
    $data = $response->getBody();
    $response_data = json_decode($data);
    $answer = '';
    if ($response_data && $response_data->items) {
        $answer = 'Choose a video from the chat|';
        foreach ($response_data->items as $key => $value) {
            $answer .= '<div style="height: 15vh;"><img src="' . $value->snippet->thumbnails->default->url .'" style="float:left; padding:5px;"><a href="#" onclick="sendVideoAi(\'Open YouTube video with ID ' . $value->id->videoId . ' \')">' . $value->snippet->title .'</a></div><hr>';
        }
    }

    return ['text' => $answer];
}

/**
 * Sample for getting video from youtube by video ID
 * In Video AI section in the dashboard in the advanced section, fill in "getYoutubeDetailed" in "Name of the function",
 * "Description" - "Get youtube video by ID" and parameters - id
 * The ChatGPT detects the request and based on the keywords calls NewsApi API and responds.
 */
function getYoutubeDetailed($arguments)
{
    $arguments = json_decode($arguments);
    $answer = 'Click on the video to start playing';
    return ['text' => $answer, 'embedUrl' => 'https://www.youtube.com/embed/' . $arguments->id];
}
