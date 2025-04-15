<?php

/**
 * REST API for managing agents, rooms and chats in LiveSmart AI Video
 *
 * @author  LiveSmart <contact@livesmart.video>
 *
 * @since 1.0
 *
 */
session_start();
include_once 'connect.php';
require_once '../vendor/autoload.php';
use \GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use OpenAI\Exceptions\ErrorException;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    http_response_code(405);
}

function checkHeaders()
{
    global $apiSecret, $apiHashMethod;
    $pathInfo = pathinfo($_SERVER['HTTP_REFERER']);
    if (isset($pathInfo) && $pathInfo['basename'] && strpos($pathInfo['basename'], 'integration.php') !== false) {
        return true;
    }
    if ($apiSecret && $apiHashMethod && (!isset($_SESSION["username"]) || !$_SESSION["username"])) {
        if (isset(getallheaders()['Authorization'])) {
            $hmac = hash_hmac($apiHashMethod, json_encode($_POST, JSON_UNESCAPED_UNICODE), $apiSecret);
            if ($hmac === getallheaders()['Authorization']) {
                return true;
            }
        }
        http_response_code(401);
        exit;
    }
    return true;
}

function guid()
{
    return bin2hex(openssl_random_pseudo_bytes(20));
}

function secondsToTime($inputSeconds)
{
    $secondsInAMinute = 60;
    $secondsInAnHour = 60 * $secondsInAMinute;
    $secondsInADay = 24 * $secondsInAnHour;

    // Extract days
    $days = floor($inputSeconds / $secondsInADay);

    // Extract hours
    $hourSeconds = $inputSeconds % $secondsInADay;
    $hours = floor($hourSeconds / $secondsInAnHour);

    // Extract minutes
    $minuteSeconds = $hourSeconds % $secondsInAnHour;
    $minutes = floor($minuteSeconds / $secondsInAMinute);

    // Extract the remaining seconds
    $remainingSeconds = $minuteSeconds % $secondsInAMinute;
    $seconds = ceil($remainingSeconds);

    // Format and return
    $timeParts = [];
    $sections = [
        'day' => (int) $days,
        'hour' => (int) $hours,
        'minute' => (int) $minutes,
        'second' => (int) $seconds,
    ];

    foreach ($sections as $name => $value) {
        if ($value > 0) {
            $nm = $name . ($value == 1 ? '' : 's');
            $timeParts[] = $value . ' <span data-localize="' . $nm . '"></span> ';
        }
    }

    return implode(', ', $timeParts);
}

/**
 * Returns all information about agent by tenant
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param type $tenant
 * @return boolean
 */
function getAgent($tenant)
{

    global $dbPrefix, $pdo;

    try {
        $array = [$tenant];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "agents WHERE `tenant`= ?");
        $stmt->execute($array);
        $user = $stmt->fetch();

        if ($user) {
            return json_encode($user);
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Reset agent password
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param type $email
 * @param type $username
 * @return agent object
 */
function recoverPassword($email, $username)
{

    global $dbPrefix, $pdo, $fromEmail;
    try {
        $array = [$email, $username];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "agents WHERE `email`= ? and `username` = ?");
        $stmt->execute($array);
        $user = $stmt->fetch();

        if ($user) {
            $to = $user['email'];
            $authToken = guid();
            $expired = date("Y-m-d H:i:s", strtotime("+30 minutes"));

            $compare = "https://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
            $explodeUrl = explode('/server', $compare);
            $serverURL = $explodeUrl[0];
            $array = [$expired, $authToken, $email, $username];
            $sql = 'UPDATE ' . $dbPrefix . 'agents SET date_expired=?, recovery_token=? WHERE email = ? and username = ?';
            $pdo->prepare($sql)->execute($array);

            $subject = 'Password Recovery from LiveSmart';
            $recoveryUrl = $serverURL . '/dash/rec.php?code=' . $authToken;
            $message = 'Hello<br/><br/>In order to change your password, please follow this <a href="' . $recoveryUrl . '">link</a> or copy and paste it into your browser address bar: <br/> ' . $recoveryUrl . '<br/><br/>Sincerely, <br/>LiveSmart Team.';

            $header = "From: LiveSmart Team <" . $fromEmail . "> \r\n";
            $header .= "Reply-To: " . $fromEmail . " \r\n";
            $header .= "MIME-Version: 1.0\r\n";
            $header .= "Content-type: text/html\r\n";
            $retval = mail($to, $subject, $message, $header);

            if ($retval == true) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Change agent password
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $token
 * @param String $password
 * @return agent object
 */
function resetPassword($token, $password)
{

    global $dbPrefix, $pdo;

    try {
        $array = [$token];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "agents WHERE `recovery_token`= ?");
        $stmt->execute($array);
        $user = $stmt->fetch();

        if ($user) {

            $array = [password_hash($password, PASSWORD_DEFAULT), $token];

            $sql = 'UPDATE ' . $dbPrefix . 'agents SET password=? WHERE recovery_token=? ';
            $pdo->prepare($sql)->execute($array);
            return true;
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns all rooms by agent_id
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $agentId
 * @return boolean|type
 */
function getRooms($draw = null, $agentId = false, $start = 0, $offset = 10, $order = false, $search = false)
{

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $additional = '';
        $array = [];
        if ($agentId && $agentId != 'false') {
            $additional = ' WHERE agent_id = ? ';
            $array = [$agentId];
        }

        if ($search && $search['value']) {
            if (!$additional) {
                $additional = ' WHERE';
            }
            $additional .= ' agent like "%' . $search['value'] . '%" OR agenturl like "%' . $search['value'] . '%" OR roomId  like "%' . $search['value'] . '%" OR shortagenturl  like "%' . $search['value'] . '%" OR video_ai_avatar like "%' . $search['value'] . '%"';
        }
        $start = $start ?? 0;
        $offset = $offset ?? 10;
        $orderBy = array('room_id', 'agent', 'roomId', 'agenturl', 'is_active');
        $orderBySql = '';
        if (isset($order[0]['column'])) {
            $orderBySql = ' order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' ';
        }

        $total = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'rooms' . $additional);
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'rooms ' . $additional . $orderBySql . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $rows = array();
        while ($r = $stmt->fetch()) {
            $rows[] = $r;
        }
        $data['data'] = $rows;
        return json_encode($data);
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns room information by room_id
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $roomId
 * @return boolean|type
 */
function getRoomById($roomId) {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [$roomId];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "rooms WHERE `room_id`= ?");
        $stmt->execute($array);
        $room = $stmt->fetch();
        if ($room) {
            return json_encode($room);
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Deletes a room by room_id and agent_id
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $roomId
 * @param String $agentId
 * @return boolean
 */
function deleteRoom($roomId, $agentId = false)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $additional = '';
        $array = [$roomId];
        if ($agentId && $agentId != 'false') {
            $additional = ' AND agent_id = ?';
            $array = [$roomId, $agentId];
        }
        $sql = 'DELETE FROM ' . $dbPrefix . 'rooms WHERE room_id = ?' . $additional;
        $pdo->prepare($sql)->execute($array);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns all agents
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @return boolean|type
 */
function getAgents($draw = null, $start = 0, $offset = 10, $order = false, $search = false)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {

        $array = [];
        $additional = '';
        if ($_SESSION['tenant'] != 'lsv_mastertenant') {
            $additional = ' WHERE tenant = "' . $_SESSION['tenant'] . '"';
        }
        if ($search && $search['value']) {
            if (!$additional) {
                $additional = ' WHERE';
            }
            $additional .= ' first_name like "%' . $search['value'] . '%" OR last_name like "%' . $search['value'] . '%" OR username like "%' . $search['value'] . '%" OR tenant like "%' . $search['value'] . '%" OR email like "%' . $search['value'] . '%"';
        }
        $start = $start ?? 0;
        $offset = $offset ?? 10;
        $orderBy = array('username', 'first_name', 'tenant', 'email');
        $orderBySql = '';
        if (isset($order[0]['column'])) {
            $orderBySql = ' order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' ';
        }

        $total = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents' . $additional);
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents' . $additional . $orderBySql . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $rows = array();
        while ($r = $stmt->fetch()) {
            $rows[] = $r;
        }
        $data['data'] = $rows;
        return json_encode($data);
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Deletes an agent
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $agentId
 * @return boolean
 */
function deleteAgent($agentId)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {

        $sql = 'DELETE FROM ' . $dbPrefix . 'agents WHERE agent_id = ?';
        $pdo->prepare($sql)->execute([$agentId]);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Updates an agent
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $agentId
 * @param String $firstName
 * @param String $lastName
 * @param String $email
 * @param String $tenant
 * @param String $pass
 * @param Bool $is_master
 * @param type $usernamehidden
 * @param String $openai_key
 * @param String $openai_model
 * @param String $heygen_key
 * @param String $elevenlabs_key
 * @param Boolean $payment_enabled
 * @return boolean
 */
function editAgent($agentId, $firstName, $lastName, $email, $tenant = null, $pass = null, $usernamehidden = null, $is_master = 0, $openai_key = '', $openai_model = '', $heygen_key = '', $elevenlabs_key = '', $payment_enabled = 0)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents WHERE email = ? and agent_id <> ?');
        $stmt->execute([$email, $agentId]);
        $userName = $stmt->fetch();
        if ($userName) {
            return false;
        }
        $payment_enabled = isset($payment_enabled) ? $payment_enabled : $_SESSION["agent"]['payment_enabled'];
        $array = [$firstName, $lastName, $email, $tenant, $is_master, $openai_key, $openai_model, $heygen_key, $elevenlabs_key, $payment_enabled, $agentId];
        $additional = '';
        if ($pass) {
            $additional = ', password = ?';
            $hash = ($pass) ? password_hash($pass, PASSWORD_DEFAULT) : '';
            $array = [$firstName, $lastName, $email, $tenant, $is_master, $openai_key, $openai_model, $heygen_key, $elevenlabs_key, $payment_enabled, $hash, $agentId];
        }

        $sql = 'UPDATE ' . $dbPrefix . 'agents SET first_name=?, last_name=?, email=?, tenant=?, is_master=?, openai_key = ?, openai_model = ?, heygen_key = ?, elevenlabs_key=?, payment_enabled = ? ' . $additional . ' WHERE agent_id = ?';
        if ($_SESSION["username"] == $usernamehidden) {
            $_SESSION["agent"] = array('agent_id' => $agentId, 'first_name' => $firstName, 'last_name' => $lastName, 'tenant' => $tenant, 'email' => $email);
        }

        $pdo->prepare($sql)->execute($array);

        $sql = 'UPDATE ' . $dbPrefix . 'agents SET payment_enabled=? WHERE tenant=? ';
        $pdo->prepare($sql)->execute([$payment_enabled, $tenant]);
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

/**
 * Adds an agent.
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $user
 * @param String $pass
 * @param String $firstName
 * @param String $lastName
 * @param String $email
 * @param String $tenant
 * @param Bool $is_master
 * @param String $openai_key
 * @param String $openai_model
 * @param String $heygen_key
 * @param String $elevenlabs_key
 * @param Boolean $payment_enabled
 * @return boolean
 */
function addAgent($user, $pass, $firstName, $lastName, $email, $tenant, $payment_enabled, $is_master = 1, $openai_key = '', $openai_model = '', $heygen_key = '', $elevenlabs_key = '')
{
    global $dbPrefix, $pdo;
    try {
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents WHERE username = ? or email = ?');
        $stmt->execute([$user, $email]);
        $userName = $stmt->fetch();
        if ($userName || $tenant === 'admin') {
            return false;
        }
        $payment_enabled = (isset($payment_enabled)) ? $payment_enabled : (int) $_SESSION['agent']['payment_enabled'];
        $sql = 'INSERT INTO ' . $dbPrefix . 'agents (username, password, first_name, last_name, email, tenant, is_master, openai_key, openai_model, heygen_key, elevenlabs_key, payment_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $pdo->prepare($sql)->execute([$user, password_hash($pass, PASSWORD_DEFAULT), $firstName, $lastName, $email, $tenant, $is_master, $openai_key, $openai_model, $heygen_key, $elevenlabs_key, $payment_enabled]);
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

/**
 * Returns agent info by agent_id.
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param Int $id
 * @return boolean|type
 */
function getAdmin($id)
{

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [$id];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "agents WHERE `agent_id`= ?");
        $stmt->execute($array);
        $user = $stmt->fetch();

        if ($user) {
            return json_encode($user);
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}


/**
 * Login method for an agent.
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $username
 * @param String $pass
 * @return boolean
 */
function loginAgent($username, $pass) {
    global $dbPrefix, $pdo, $fromEmail;
    try {
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        if (password_verify($pass, $user['password'])) {
            $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'payment_options WHERE payment_option_id=?');
            $stmt->execute([1]);
            $payment_option = $stmt->fetch();
            $paid_enabled = ($payment_option['is_enabled'] && $user['payment_enabled']);
            if ($payment_option['is_enabled']) {
                $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions WHERE tenant=? AND (payment_status="approved" OR payment_status="succeeded") order by subscription_id desc limit 1');
                $stmt->execute([$user['tenant']]);
                $subscription = $stmt->fetch();
                if ($subscription['subscr_interval'] === 'N') {
                    $paid = ($subscription['subscr_interval_count'] > 0) ? $subscription['subscr_interval_count'] : false;
                } else {
                    $paid = (strtotime($subscription['valid_to']) >= strtotime(date('Y-m-d H:i:s')) && $subscription) ? $subscription['valid_to'] : false;
                }

                $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions WHERE valid_to>"'.date('Y-m-d H:i:s').'" AND (payment_status="approved" OR payment_status="succeeded") AND email_sent=0 ORDER BY subscription_id DESC');
                $stmt->execute();
                while ($r = $stmt->fetch()) {
                    $days = (int)$payment_option['email_day_notify'];
                    if ($payment_option['email_notification'] && (strtotime($r['valid_to']) <= (strtotime(date('Y-m-d H:i:s')) + 86400*$days))) {
                        $subject = $payment_option['email_subject'];
                        $message =  $payment_option['email_body'];
                        $message = str_replace('{{name}}', $r['payer_name'], $message);
                        $message = str_replace('{{date}}', $r['valid_to'], $message);
                        $header = "From: " . $payment_option['email_from'] . " <" . $fromEmail . "> \r\n";
                        $header .= "Reply-To: " . $fromEmail . " \r\n";
                        $header .= "MIME-Version: 1.0\r\n";
                        $header .= "Content-type: text/html\r\n";
                        $retval = mail($r['payer_email'], $subject, nl2br($message), $header);
                        $sql = 'UPDATE ' . $dbPrefix . 'subscriptions SET `email_sent`=1 WHERE subscription_id = ?';
                        $pdo->prepare($sql)->execute([$r['subscription_id']]);
                    }
                }
            }
            $_SESSION["tenant"] = ($user['is_master'] && $user['tenant'] == 'admin') ? 'lsv_mastertenant' : $user['tenant'];
            $_SESSION["tenant_admin"] = ($user['is_master']) ? true : false;
            $_SESSION["username"] = $user['username'];
            $_SESSION["agent"] = array('agent_id' => $user['agent_id'], 'first_name' => $user['first_name'], 'last_name' => $user['last_name'], 'tenant' => $user['tenant'], 'email' => $user['email'], 'license' => $payment_option['license'], 'payment_enabled' => $paid_enabled, 'subscription' => @$paid, 'subscr_interval' => @$subscription['subscr_interval'], 'heygen_key' => @$user['heygen_key'], 'openai_key' => @$user['openai_key'], 'openai_model' => @$user['openai_model'], 'elevenlabs_key' => @$user['elevenlabs_key']);
            return true;
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Return chat messages by roomId and participants.
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param type $roomId
 * @param type $sessionId
 * @param type $agentId
 * @return boolean
 */
function getChat($roomId, $sessionId, $agentId = null)
{
    global $dbPrefix, $pdo;

    try {

        $additional = '';
        $array = [$roomId, "%$sessionId%"];
        if ($agentId && $agentId != 'false') {
            $additional = ' AND agent_id = ?';
            $array = [$roomId, $agentId, "%$sessionId%"];
        }
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "chats WHERE (`room_id`= ? or `room_id` = 'dashboard') $additional and from like ? order by date_created asc");
        $stmt->execute($array);
        $rows = array();
        while ($r = $stmt->fetch()) {
            $r['date_created'] = strtotime($r['date_created']);
            $rows[] = $r;
        }
        return json_encode($rows);
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns all the chats for agent_id
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $agentId
 * @return type
 */
function getChats($draw, $agentId = false, $start = 0, $offset = 10, $order = false, $search = false)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $additional = '';
        $array = [];

        if ($agentId && $agentId != 'false') {
            $additional = ' WHERE agent_id = ? ';
            $array = [$agentId];
        }

        if ($search && $search['value']) {
            if (!$additional) {
                $additional = ' WHERE';
            }
            $additional .= ' `agent` like "%' . $search['value'] . '%" OR `message` like "%' . $search['value'] . '%" OR `date_created` like "%' . $search['value'] . '%" OR `from` like "%' . $search['value'] . '%" OR `to` like "%' . $search['value'] . '%"  OR `room_id` like "%' . $search['value'] . '%"';
        }
        $orderBy = array('date_created', 'room_id');
        $total = $pdo->prepare('SELECT max(room_id) as room_id, max(date_created) as date_created, max(agent) as agent FROM ' . $dbPrefix . 'chats ' . $additional . ' group by room_id');
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT max(room_id) as room_id, max(date_created) as date_created, max(agent) as agent FROM ' . $dbPrefix . 'chats ' . $additional . ' group by room_id order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();
        $rows = array();

        while ($r = $stmt->fetch()) {
            $r['agent'] = '';
            $array2 = ['chatgpt', $r['room_id']];
            $stmt2 = $pdo->prepare('SELECT max(`from`) as `from`, max(date_created) as date_created, max(room_id) as room_id FROM ' . $dbPrefix . 'chats where `to` = ? and room_id = ? group by `from` order by date_created desc');
            $stmt2->execute($array2);
            $rows2 = '<table>';
            while ($r2 = $stmt2->fetch()) {
                if (!$r['agent']) {
                    $r['agent'] = $r2['from'];
                }
                $array3 = [$r2['room_id'], $r2['from'], $r2['from']];
                $stmt3 = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'chats where room_id=? and (`from`=? or `to`=?) order by date_created asc');
                $stmt3->execute($array3);
                $rows2 .= '<tr style="background-color:#484d75"><td colspan="2" style="text-align: center; color: white;">' . $r2['from'] . ' <i class="fas fa-trash float-right pointer" onclick="deleteItem(\'' . $r2['from'] . '|'. $r2['room_id'] . '\', \'chat\');"></i></td></tr>';
                while ($r3 = $stmt3->fetch()) {
                    $timezone = isset($_GLOBALS['timezone']) ? $_GLOBALS['timezone'] : 'UTC';
                    date_default_timezone_set($timezone);
                    $datetime = DateTime::createFromFormat('Y-m-d H:i:s', $r3['date_created'], new DateTimeZone('UTC'));
                    $datetime->setTimezone(new DateTimeZone(date_default_timezone_get()));
                    $date = $datetime->format('Y-m-d H:i:s');

                    $color = ($r3['to'] !== 'chatgpt' && $r3['to'] !== 'all') ? 'style="background-color:#f1f2f4"' : '';
                    $rows2 .= '<tr '.$color.'><td><small>' . $date . '</small></td><td>' . $r3['from'] . ': ' . $r3['message'] . '</td></tr>';
                }
            }
            $rows2 .= '</table>';
            $r['messages'] = '<div class="modal fade" id="ex' . $r['room_id'] . '" tabindex="-1" role="dialog" aria-labelledby="ex' . $r['room_id'] . '" aria-hidden="true"><div class="modal-dialog modal-lgr" role="document"><button type="button" data-toggle="modal" class="closeDocumentModal" data-target="#ex' . $r['room_id'] . '" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" class="fa fa-times"></span></button><div class="modal-content">' . $rows2 . '</div>     </div> </div><a href="" class="fas fa-fw fa-list" data-toggle="modal" data-target="#ex' . $r['room_id'] . '"></a>';
            $rows[] = $r;
        }
        $data['data'] = $rows;
        return json_encode($data);
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

/**
 * Returns all the chats for agent_id
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $from
 * @param String $room
 * @return boolean
 */
function deleteChatItem($from, $room)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $additional = '';
        $array = [$from, $from, $room];
        $sql = 'DELETE FROM ' . $dbPrefix . 'chats WHERE (`from` = ? or `to` = ?) and room_id = ?;';
        $pdo->prepare($sql)->execute($array);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Adds a chat message.
 * 
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $roomId
 * @param String $message
 * @param String $agent
 * @param String $from
 * @param String $to
 * @param String $agentId
 * @param String $system
 * @param String $avatar
 * @param String $datetime
 * @return string|int
 */
function insertChat($roomId, $message, $agent, $from, $to, $agentId = null, $system = null, $avatar = null, $datetime = null)
{
    global $dbPrefix, $pdo;

    try {
        $sql = "INSERT INTO " . $dbPrefix . "chats (`room_id`, `message`, `agent`, `agent_id`, `from`, `date_created`, `to`, `system`, `avatar`) "
            . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([$roomId, $message, $agent, $agentId, $from, date("Y-m-d H:i:s", time()), $to, $system, $avatar]);
        return 200;
    } catch (Exception $e) {
        return 500;
    }
}

function getVideoAi($room)
{
    global $dbPrefix, $pdo;
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'rooms INNER JOIN ' . $dbPrefix . 'agents on ' . $dbPrefix . 'agents.tenant = ' . $dbPrefix . 'rooms.agent_id WHERE ' . $dbPrefix . 'rooms.roomid=?');
    $stmt->execute([$room]);
    $room = $stmt->fetch();
    if ($room) {
        return json_encode($room);
    } else {
        return false;
    }
}

/**
 * Update video AI room
 *
 * @global type $dbPrefix
 * @global db $pdo
 * @param Strings for avatar
 * @param File $video_back_image
 * @return boolean|type
 */
function setVideoAi($roomId, $video_ai_avatar, $video_ai_name, $video_ai_background, $video_ai_quality, $datetime, $duration, $exit_meeting, $inactivity_timeout, $video_ai_voice, $video_ai_system, $video_ai_tools, $language, $ai_greeting_text, $is_context, $is_subtitle, $is_recording, $is_audio, $video_ai_assistant, $video_ai_gender, $api_key, $second_api_key, $video_ai_layout, $video_ai_suggestions, $video_back_image, $is_offset, $room_id = null)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [$roomId];
        $sql = 'SELECT * FROM ' . $dbPrefix . 'rooms WHERE roomid = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($array);
        $room = $stmt->fetch();
        if ($room && !$room_id) {
            return false;
        }
        $image_name_sql = $video_ai_background;
        if ($video_back_image) {
            $image_file = $video_back_image;
            if (isset($image_file["tmp_name"])) {
                if (filesize($image_file["tmp_name"]) <= 0) {
                    return false;
                }
                $image_type = exif_imagetype($image_file["tmp_name"]);
                if (!$image_type) {
                    return false;
                }

                $image_extension = image_type_to_extension($image_type, true);
                $image_name = '../img/backgrounds/' .$roomId . $image_extension;
                $image_name_sql = 'img/backgrounds/' .$roomId . $image_extension;
                move_uploaded_file(
                    $image_file['tmp_name'],
                    $image_name
                );
            }
        }
        if ($api_key) {
            $functionNameTool = explode('|', $video_ai_tools)[0];
            $functionNameTool = explode('~', $functionNameTool)[0];

            $content = file_get_contents('apikeys.php');
            $content = str_replace($functionNameTool . 'API = \'\';', $functionNameTool . 'API = \'' . $api_key . '\';', $content);
            file_put_contents('apikeys.php', $content);
            if ($second_api_key && $functionNameTool === 'getCurrentWeather') {
                $content = file_get_contents('apikeys.php');
                $content = str_replace('getBackgroundAPI = \'\';', 'getBackgroundAPI = \'' . $second_api_key . '\';', $content);
                file_put_contents('apikeys.php', $content);
            }
        }

        try {
            $is_context = ($is_context == 'true') ? 1 : 0;
            $is_subtitle = ($is_subtitle == 'true') ? 1 : 0;
            $is_recording = ($is_recording == 'true') ? 1 : 0;
            $is_audio = ($is_audio == 'true') ? 1 : 0;

            if ($room_id) {
                $sql = 'UPDATE ' . $dbPrefix . 'rooms SET roomId = ?, agent_id = ?, video_ai_avatar = ?, video_ai_name = ?, video_ai_background = ?, video_ai_voice = ?, video_ai_quality = ?, datetime = ?, duration = ?, exit_meeting = ?, inactivity_timeout = ?, video_ai_system = ?, video_ai_tools = ?, language = ?, ai_greeting_text = ?, is_context = ?, is_subtitle = ?, is_recording = ?, is_audio=?, video_ai_assistant = ?, video_ai_gender = ?, video_ai_layout = ?, video_ai_suggestions = ?, agent = ?, is_offset = ? WHERE room_id = ?';
                $pdo->prepare($sql)->execute([$roomId, $_SESSION["agent"]['tenant'], $video_ai_avatar, $video_ai_name, $image_name_sql, $video_ai_voice, $video_ai_quality, $datetime, $duration, $exit_meeting, $inactivity_timeout, $video_ai_system, $video_ai_tools, $language, $ai_greeting_text, $is_context, $is_subtitle, $is_recording, $is_audio, $video_ai_assistant, $video_ai_gender, $video_ai_layout, $video_ai_suggestions, $_SESSION["agent"]['first_name'] . ' ' . $_SESSION["agent"]['last_name'], (int) $is_offset, $room_id]);
            } else {
                $sql = "INSERT INTO " . $dbPrefix . "rooms (roomId, agent_id, video_ai_avatar, video_ai_name, video_ai_background, video_ai_voice, video_ai_quality, datetime, duration, exit_meeting, inactivity_timeout, video_ai_system, video_ai_tools, language, ai_greeting_text, is_context, is_subtitle, is_recording, is_audio, video_ai_assistant, video_ai_gender, video_ai_layout, video_ai_suggestions, agent, is_offset) "
                    . "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $pdo->prepare($sql)->execute([$roomId, $_SESSION["agent"]['tenant'], $video_ai_avatar, $video_ai_name, $image_name_sql, $video_ai_voice, $video_ai_quality, $datetime, $duration, $exit_meeting, $inactivity_timeout, $video_ai_system, $video_ai_tools, $language, $ai_greeting_text, $is_context, $is_subtitle, $is_recording, $is_audio, $video_ai_assistant, $video_ai_gender, $video_ai_layout, $video_ai_suggestions, $_SESSION["agent"]['first_name'] . ' ' . $_SESSION["agent"]['last_name'], (int) $is_offset]);
            }
            return 200;
        } catch (Exception $e) {
            return $e->getMessage();
        }

        return true;
    } catch (Exception $e) {
        return false;
    }
}


/**
 * Returns all the logs for agent_id
 *
 * @global type $dbPrefix
 * @global db $pdo
 * @param String $agentId
 * @return String
 */
function getLogs($draw, $agentId = false, $start = 0, $offset = 10, $order = false, $search = false)
{
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $additional = '';
        $array = [];
        if ($agentId && $agentId != 'false') {
            $additional = ' WHERE agent_id = ? ';
            $array = [$agentId];
        }

        if ($search['value']) {
            if (!$additional) {
                $additional = ' WHERE';
            }
            $additional .= ' message like "%' . $search['value'] . '%" OR room_id like "%' . $search['value'] . '%" OR attendee like "%' . $search['value'] . '%" OR agent like "%' . $search['value'] . '%"';
        }
        $orderBy = array('date_created', 'room_id');
        $total = $pdo->prepare('SELECT max(room_id) as room_id, max(date_created) as date_created, max(agent) as agent FROM ' . $dbPrefix . 'logs ' . $additional . ' group by room_id');
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT max(room_id) as room_id, max(date_created) as date_created, max(agent) as agent FROM ' . $dbPrefix . 'logs ' . $additional . ' group by room_id order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();
        $rows = array();
        while ($r = $stmt->fetch()) {



            $array2 = [$r['room_id']];
            $stmt2 = $pdo->prepare('SELECT max(`agent`) as `agent`, max(date_created) as date_created, max(room_id) as room_id FROM ' . $dbPrefix . 'logs where room_id = ? group by `agent` order by date_created desc');
            $stmt2->execute($array2);

            $rows2 = '<table width="100%">';
            $startDate = $total = 0;
            $r['agent'] = '';
            while ($r2 = $stmt2->fetch()) {
                if (!$r['agent']) {
                    $r['agent'] = $r2['agent'];
                }
                $array3 = [$r2['room_id'], $r2['agent']];
                $stmt3 = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'logs where room_id=? and `agent`=? order by date_created asc');
                $stmt3->execute($array3);
                $num = 0;
                $rows2 .= '<tr style="background-color:#484d75"><td colspan="2" style="text-align: center; color: white;">' . $r2['agent'] . '</td></tr>';
                while ($r3 = $stmt3->fetch()) {
                    $num = $r3['log_id'];
                    $color = ($num % 2 == 0) ? 'style="background-color:#f1f2f4"' : '';
                    if ($r3['message'] == 'start') {
                        $total++;
                        $startDate = $r3['date_created'];
                    }
                    if ($r3['message'] == 'start' || $r3['message'] == 'join') {
                        $vis = ($r3['message'] == 'start') ? $r3['agent'] : $r3['attendee'];
                        $rows2 .= '<tr ' . $color . '><td width="25%"><small>' . $r3['date_created'] . '</small></td><td width="75%"><small>' . $vis . ' ' . $r3['message'] . '<br/>' . $r3['ua'] . '</small></td></tr>';
                    } else if ($r3['message'] == 'start new session' ) {
                        $rows2 .= '<tr ' . $color . '><td width="25%"><small>' . $r3['date_created'] . '</small></td><td width="75%"><small>' . $r3['message'] . ' with ' . $r3['attendee']  . '</small></td></tr>';
                    } else {

                        $rows2 .= '<tr ' . $color . '><td width="25%"><small>' . $r3['date_created'] . '</small></td><td width="75%"><small>' . $r3['message'] . '</small></td></tr>';
                    }
                    if ($r3['message'] == 'end') {
                        $endDate = $r3['date_created'];
                        $rows2 .= '<tr ' . $color . '><td><small><b data-localize="duration"></b></small></td><td><small><b>' . secondsToTime(strtotime($endDate) - strtotime($startDate)) . '</b></small></td></tr>';
                        break;
                    }
                }
            }
            $rows2 .= '</table>';
            $r['messages'] = '<div class="modal fade" id="ex' . $r['room_id'] . '" tabindex="-1" role="dialog" aria-labelledby="ex' . $r['room_id'] . '" aria-hidden="true"><div class="modal-dialog modal-lgr" role="document"><button type="button" data-toggle="modal" class="closeDocumentModal" data-target="#ex' . $r['room_id'] . '" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" class="fa fa-times"></span></button><div class="modal-content">' . $rows2 . '</div>     </div> </div><a href="" class="fas fa-fw fa-list" data-toggle="modal" data-target="#ex' . $r['room_id'] . '"></a>';
            $rows[] = $r;
        }

        $data['data'] = $rows;
        return json_encode($data);
    } catch (Exception $e) {
        return $e->getMessage();
    }
}


/**
 * Adds a log.
 *
 * @global type $dbPrefix
 * @global db $pdo
 * @param String $roomId
 * @param String $message
 * @param String $agent
 * @param String $agentId
 * @param String $datetime
 * @param String $session
 * @param String $constraint
 * @param String $ua
 * @param String $attendee
 * @return string|int
 */
function insertLog($roomId, $message, $agent, $agentId = null, $datetime = null, $ua = null, $attendee = null)
{
    global $dbPrefix, $pdo;
    try {
        $sql = "INSERT INTO " . $dbPrefix . "logs (`room_id`, `message`, `agent`, `agent_id`, `date_created`, `ua`, `attendee`) "
            . "VALUES (?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([$roomId, $message, $agent, $agentId, date("Y-m-d H:i:s", time()), $ua, $attendee]);
        return 200;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}


function getPk()
{
    global $setVal;
    if (isset($setVal)) {
        return $setVal;
    } else {
        return '';
    }
}

function listAvatars()
{
    global $apiKeyHeygen, $videoUrlAvatar;
    $hg = @$_SESSION['agent']['heygen_key'];
    $heygenKey = ($hg) ? $hg : $apiKeyHeygen;
    $clientVideo = new Client();

    $response = $clientVideo->request('GET', $videoUrlAvatar . 'v1/avatar.list', [
        'headers' => [
            'accept' => 'application/json',
            'x-api-key' => $heygenKey,
        ],
    ]);
    return $response->getBody();
}

function listInsteractive()
{
    global $apiKeyHeygen, $videoUrlAvatar;

    $clientVideo = new Client();

    $response = $clientVideo->request('GET', $videoUrlAvatar . 'v1/streaming/avatar.list', [
        'headers' => [
            'accept' => 'application/json',
            'x-api-key' => $apiKeyHeygen,
        ],
    ]);
    return $response->getBody();
}

function listVoices()
{
    global $apiKeyHeygen, $videoUrlAvatar;
    $hg = @$_SESSION['agent']['heygen_key'];
    $heygenKey = ($hg) ? $hg : $apiKeyHeygen;
    $clientVideo = new Client();

    $response = $clientVideo->request('GET', $videoUrlAvatar . 'v2/voices', [
        'headers' => [
            'accept' => 'application/json',
            'x-api-key' => $heygenKey,
        ],
    ]);
    return $response->getBody();
}

function listElevenVoices()
{
    global $apiKeyElevenLabs, $audioUrlAvatar;
    $elevenLabsKey = @$_SESSION['agent']['elevenlabs_key'];
    $elevenLabs = ($elevenLabsKey) ? $elevenLabsKey : $apiKeyElevenLabs;
    $clientAudio = new Client();

    $response = $clientAudio->request('GET', $audioUrlAvatar . 'v1/voices?show_legacy=true', [
        'headers' => [
            'accept' => 'application/json',
            'xi-api-key' => $elevenLabs,
            'content-type' => 'application/json'
        ],
    ]);
    return $response->getBody();
}

function getVoice($text, $voice_id, $session, $elabs = '')
{
    global $apiKeyElevenLabs, $audioUrlAvatar, $elevenLabsModel;
    $elabKey = ($elabs) ? base64_decode($elabs) : $apiKeyElevenLabs;
    $data['data'] = [];
    if (!$elabKey) {
        return json_encode($data);
    }

    $clientAudio = new Client();
    try {
        $response = $clientAudio->request('POST', $audioUrlAvatar . 'v1/text-to-speech/'.$voice_id.'/stream', [
            'body' => '{"model_id": "' . $elevenLabsModel . '", "text": "' . $text . '"}',
            'headers' => [
                'accept' => 'application/json',
                'xi-api-key' => $elabKey,
                'content-type' => 'application/json'
            ],
        ]);
        if (!file_exists('audiofiles')) {
            mkdir('audiofiles', 0777, true);
        }
        if (file_exists('audiofiles/' . $session . '.mp3')) {
            unlink('audiofiles/' . $session . '.mp3');
        }
        file_put_contents('audiofiles/' . $session . '.mp3', $response->getBody());
        $data['data']['duration_ms'] = '1000';
        return json_encode($data);
    } catch (ClientException $e) {
        $response = $e->getResponse();
        $responseBodyAsString = $response->getBody()->getContents();
        return $responseBodyAsString;
    }
}

function deleteVoice($session)
{
    if (file_exists('audiofiles/' . $session . '.mp3')) {
        unlink('audiofiles/' . $session . '.mp3');
    }
}

function listAssistants()
{
    global $apiKeyChatGpt;
    $openAiKey = @$_SESSION['agent']['openai_key'];
    $openAi = ($openAiKey) ? $openAiKey : $apiKeyChatGpt;
    $client = OpenAI::client($openAi);
    $response = $client->assistants()->list([
        'limit' => 10,
    ]);
    if (isset($response->data)) {
        return json_encode($response->data);
    }
    return '';
}

function setLanguage($lang)
{
    $_SESSION["lang"] = $lang;
}


/**
 * Updates a locale file.
 * 
 * @param string $postData
 * @param type $file
 * @return boolean
 */
function updateLocale($postData, $file)
{
    checkHeaders();
    try {

        $jsonString = file_get_contents('../locales/' . $file . '.json');
        $data = json_decode($jsonString, true);
        $postData = json_decode($postData, true);
        foreach ($postData as $key => $value) {
            $val = explode('.', $key);
            if (isset($val[1]) && $value == 'true') {
                $data[$val[0]][$val[1]] = true;
            } else if (isset($val[1]) && $value == 'false') {
                $data[$val[0]][$val[1]] = false;
            } else if (isset($val[1]) && $value) {
                $data[$val[0]][$val[1]] = $value;
            } else if (isset($val[1])) {
                unset($data[$val[0]][$val[1]]);
            } else {
                $data[$key] = $value;
            }
        }
        $newJsonString = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        file_put_contents('../locales/' . $file . '.json', $newJsonString);


        $currentVersion = file_get_contents('../pages/version.txt');
        $curNumber = explode('.', $currentVersion);
        if (count($curNumber) == 3) {
            $currentVersion = $currentVersion . '.1';
        } else {
            $currentVersion = $curNumber[0] . '.' . $curNumber[1] . '.' . $curNumber[2] . '.' . ((int) $curNumber[3] + 1);
        }
        file_put_contents('../pages/version.txt', $currentVersion);


        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Updates settings file
 * 
 * @param type $postData
 * @param type $file
 * @return boolean
 */
function updateSettings($open_ai, $old_open_ai, $open_model, $old_open_model, $heygen_key, $old_heygen_key, $elevenlabs_key, $old_elevenlabs_key)
{
    checkHeaders();
    try {
        $content = file_get_contents('connect.php');
        if (!$old_open_ai) {
            $content = str_replace('$apiKeyChatGpt = \'\';', '$apiKeyChatGpt = \'' . $open_ai . '\';', $content);
        } else {
            $content = str_replace($old_open_ai, $open_ai, $content);
        }
        if (!$old_heygen_key) {
            $content = str_replace('$apiKeyHeygenStream = \'\';', '$apiKeyHeygenStream = \'' . $heygen_key . '\';', $content);
        } else {
            $content = str_replace($old_heygen_key, $heygen_key, $content);
        }
        if (!$old_elevenlabs_key) {
            $content = str_replace('$apiKeyElevenLabs = \'\';', '$apiKeyElevenLabs = \'' . $elevenlabs_key . '\';', $content);
        } else {
            $content = str_replace($old_elevenlabs_key, $elevenlabs_key, $content);
        }
        if (!$old_open_model) {
            $content = str_replace('$chatGptModel = \'\';', '$chatGptModel = \'' . $open_model . '\';', $content);
        } else {
            $content = str_replace($old_open_model, $open_model, $content);
        }
        file_put_contents('connect.php', $content);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

include_once 'toolCalls.php';
include_once 'toolCallsCustom.php';
// include_once 'toolSchema.php';

function breakText($text, $minLength = 990, $needle = '.')
{
    require_once 'markdown.php';
    $Parsedown = new Parsedown();
    $markText = $Parsedown->text($text);
    if (strlen($text) < $minLength) {
        return array($markText);
    }
    $delimiter = preg_quote($needle);
    $match = preg_match_all("/(.*){3}?$delimiter\s/", $text, $matches);

    if ($match == 0) {
        return array($markText);
    }

    $sentences = current($matches);
    $paras = array();
    $tmp = '';

    foreach ($sentences as $sentence) {
        $tmp .= $sentence;
        if (strlen($tmp) > $minLength) {
            $tmp = $Parsedown->text($tmp);
            $paras[] = $tmp;
            $tmp = '';
        }
    }

    if ($tmp != '') {
        $paras[] = $tmp;
    }
    return $paras;
}

function deleteBetween($beginning, $end, $string) {
    $beginningPos = strpos($string, $beginning);
    $endPos = strpos($string, $end);
    if ($beginningPos === false || $endPos === false) {
      return $string;
    }
    $textToDelete = substr($string, $beginningPos, ($endPos + strlen($end)) - $beginningPos);
    return deleteBetween($beginning, $end, str_replace($textToDelete, '', $string));
}

function checkProfanity($client, $msg) {
    try {
        $response = $client->moderations()->create([
            'model' => 'text-moderation-latest',
            'input' => $msg,
        ]);
        $resultProfanity = false;
        $response->id;
        $response->model;
        foreach ($response->results as $result) {
            $resultProfanity = $result->flagged;
            foreach ($result->categories as $category) {
                $category->category->value;
                $category->violated;
                $category->score;
            }
        }
    } catch (OpenAI\Exceptions\ErrorException $e) {
        $resultProfanity = false;
    }
    return $resultProfanity;
}

/**
 * Send request to OpenAI. It may include also $system and $tools file. For more information check server/toolCalls.php and server/toolSchema.php files
 *
 * @param string $msg
 * @param array $context
 * @param string $system
 * @param string $tools
 * @param boolean $isContext
 * @param string $oa
 * @param string $oamodel
 * @return boolean
 */

function sendOpenAi($msg, $context, $system = '', $tools = null, $isContext = true, $oa = null, $oamodel = null)
{
    global $apiKeyChatGpt, $chatGptModel, $maxTokens;
    $oaKey = ($oa) ? base64_decode($oa) : $apiKeyChatGpt;
    $oaModel = ($oamodel) ? $oamodel : $chatGptModel;

    $client = OpenAI::client($oaKey);

    $resultProfanity = checkProfanity($client, $msg);
	$system .= ' Current date is ' . date('Y-m-d');

    if ($resultProfanity) {
        $resp = ['status' => 200, 'exit' => true];
        return json_encode($resp);
    }
    if ($isContext) {
        $arr = [
            'model' => $oaModel,
            'max_tokens' => $maxTokens,
            'messages' => [
                ...$context,
                ['role' => 'user', 'content' => $msg],
                ['role' => 'system', 'content' => $system]
            ]
        ];
    } else {
        $arr = [
            'model' => $oaModel,
            'max_tokens' => $maxTokens,
            'messages' => [
                ['role' => 'user', 'content' => $msg],
                ['role' => 'system', 'content' => $system]
            ]
        ];
    }
    if ($tools) {
        $array = explode('|', $tools);
        $name = $array[0];
        $description = $array[1];
        $params = $array[2];

        $toolsNames = explode('~', $name);
        $toolsDesciption = explode('~', $description);
        $toolsParams = explode('~', $params);

        $arr['tools'] = [];
        for ($i = 0; $i < count($toolsNames); $i++) {
            if ($toolsNames[$i]) {
                $parameters = explode(',', $toolsParams[$i]);
                $par = [];
                foreach ($parameters as $parameter) {
                    $par[$parameter] = [
                        'type' => 'string'
                    ];
                }

                $param = [
                    'type' => 'object',
                    'properties' => $par,
                    'required' => [$parameters[0]],
                ];

                $arrv = [
                    'type' => 'function',
                    'function' => [
                        'name' => $toolsNames[$i],
                        'description' => $toolsDesciption[$i],
                        'parameters' => $param,
                    ],
                ];
                array_push($arr['tools'], $arrv);
            }
        }
    }
    try {
        $data = $client->chat()->create($arr);
    } catch (OpenAI\Exceptions\ErrorException $e) {
        $resp = ['status' => 500, 'text' => $e->getErrorMessage(), 'context' => $context];
        return json_encode($resp);
    }
    $background = '';
    $url = '';
    $embedUrl = '';
    foreach ($data->choices as $result) {
        // $result->index;
        // $result->message->role;
        // $result->message->content;
        if ($result->message->content) {
            $chatText = $result->message->content;
        }
        $result->finishReason;

        if (isset($result->message->toolCalls) && count($result->message->toolCalls) > 0) {
            $toolCall = $result->message->toolCalls[0];
            $result->message->toolCalls[0]->id;
            $result->message->toolCalls[0]->type;
            $result->message->toolCalls[0]->function->name;
            $result->message->toolCalls[0]->function->arguments;
            if ($toolCall->function->name) {
                $functionName = $toolCall->function->name;
                $resp = $functionName($toolCall->function->arguments);
                $chatText = ($resp['text']) ? $resp['text'] : '';
                $pos = strpos($chatText, '|');
                if ($pos === false) {
                    $arr = [
                        'model' => $oaModel,
                        'messages' => [
                            ['role' => 'system', 'content' => $system],
                            ...$context,
                            ['role' => 'user', 'content' => $msg],
                            ['role' => 'function', 'name' => $functionName, 'content' => $chatText]
                        ]
                    ];
                    $data = $client->chat()->create($arr);
                    if ($data->choices && $data->choices[0]->message->content) {
                        $chatText = $data->choices[0]->message->content;
                    }
                }
                if (isset($resp['background'])) {
                    $background = $resp['background'];
                }
                if (isset($resp['url'])) {
                    $url = $resp['url'];
                }
                if (isset($resp['embedUrl'])) {
                    $embedUrl = $resp['embedUrl'];
                }
            }
        }
    }

    if ($chatText) {
        $chatArr = explode('|', $chatText);
        if ($isContext) {
            array_push($context, (object)[
                'role' => 'system',
                'content' => $chatArr[0]
            ]);
            array_push($context, (object)[
                'role' => 'assistant',
                'content' => $chatArr[0]
            ]);
        }
        $output = breakText($chatArr[0], 750);
        $chatText = implode('~', $output);
        if (isset($chatArr[1])) {
            $chatText .= '|' . $chatArr[1];
        }
        $resp = ['status' => 200, 'text' => $chatText, 'context' => $context, 'background' => $background, 'url' => $url, 'embedUrl' => $embedUrl];
    } else {
        $resp = ['status' => 400, 'text' => null, 'context' => $context];
    }
    return json_encode($resp);
}

/**
 * Send request to OpenAI using assistant.
 *
 * @param string $msg
 * @param string $assistantId
 * @return boolean
 */
function sendAssistant($msg, $assistantId, $oa = null)
{
    global $apiKeyChatGpt;
    $oaKey = ($oa) ? base64_decode($oa) : $apiKeyChatGpt;
    $client = OpenAI::client($oaKey);

    $resultProfanity = checkProfanity($client, $msg);
    if ($resultProfanity) {
        $resp = ['status' => 200, 'exit' => true];
        return json_encode($resp);
    }

    $threadRun = $client->threads()->createAndRun(
        [
            // 'assistant_id' => $responseAssitant->id,
            'assistant_id' => $assistantId,
            'thread' => [
                'messages' =>
                    [
                        [
                            'role' => 'user',
                            'content' => $msg,
                        ],
                    ],
            ],
        ],
    );

    while(in_array($threadRun->status, ['queued', 'in_progress'])) {
        $threadRun = $client->threads()->runs()->retrieve(
            threadId: $threadRun->threadId,
            runId: $threadRun->id
        );
    }

    if ($threadRun->status !== 'completed') {
        //
    }

    $messageList = $client->threads()->messages()->list(
        threadId: $threadRun->threadId,
    );
    if (isset($messageList->data)) {
        $chatText = $messageList->data[0]->content[0]->text->value;
        $client->threads()->delete($threadRun->threadId);
        $chatText = deleteBetween('【', '】', $chatText);
        $output = breakText($chatText, 750);
        $chatText = implode('~', $output);
        $resp = ['status' => 200, 'text' => $chatText];
    } else {
        $resp = ['status' => 400, 'text' => null];
    }
    return json_encode($resp);
}

function createToken($hg = null)
{
    global $apiKeyHeygen, $apiKeyHeygenStream, $videoUrlAvatar;
    $heygen = (isset($apiKeyHeygenStream) && $apiKeyHeygenStream) ? $apiKeyHeygenStream : $apiKeyHeygen;
    $heygenKey = ($hg) ? base64_decode($hg) : $heygen;
    $client = new Client();
    try {
        $response = $client->request('POST', $videoUrlAvatar . '/v1/streaming.create_token', [
            'headers' => [
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'X-Api-Key' => $heygenKey,
            ],
        ]);
        return $response->getBody();
    } catch (ClientException $e) {
        $response = $e->getResponse();
        $responseBodyAsString = $response->getBody()->getContents();
        return $responseBodyAsString;
    }
}

/**
 * Returns payment options
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @return boolean|type
 */
function getPaymentOptions() {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "payment_options");
        $stmt->execute();
        $data = $stmt->fetch();
        if ($data) {
            return json_encode($data);
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Updates payment option
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $paypal_client_id
 * @param String $paypal_secret_id
 * @param String $stripe_client_id
 * @param String $stripe_secret_id
 * @param String $email_day_notify
 * @param Bool $is_enabled
 * @param String $email_notification
 * @param String $email_subject
 * @param String $email_body
 * @param String $email_from
 * @param Bool $is_test_mode
 * @param Bool $paypal_enabled
 * @param Bool $stripe_enabled
 * @param Bool $authorizenet_enabled
 * @param String $authorizenet_api_login_id
 * @param String $authorizenet_transaction_key
 * @param String $authorizenet_public_client_key
 * @param Integer $email_day_notify
 * @return boolean
 */
function updatePaymentOptions($paypal_client_id, $paypal_secret_id, $stripe_client_id, $stripe_secret_id, $is_enabled, $email_notification, $email_subject, $email_body, $email_from, $is_test_mode, $paypal_enabled, $stripe_enabled, $authorizenet_enabled, $authorizenet_api_login_id, $authorizenet_transaction_key, $authorizenet_public_client_key, $email_day_notify) {
    global $dbPrefix, $pdo;
    checkHeaders();
    $is_enabled = ($is_enabled == 'true') ? 1 : 0;
    $email_notification = ($email_notification == 'true') ? 1 : 0;
    $is_test_mode = ($is_test_mode == 'true') ? 1 : 0;
    $paypal_enabled = ($paypal_enabled == 'true') ? 1 : 0;
    $stripe_enabled = ($stripe_enabled == 'true') ? 1 : 0;
    $authorizenet_enabled = ($authorizenet_enabled == 'true') ? 1 : 0;
    $array = [$paypal_client_id, $paypal_secret_id, $stripe_client_id, $stripe_secret_id, $is_enabled, $email_notification, $email_subject, $email_body, $email_from, $is_test_mode, $paypal_enabled, $stripe_enabled, $authorizenet_enabled, $authorizenet_api_login_id, $authorizenet_transaction_key, $authorizenet_public_client_key, $email_day_notify, 1];
    try {
        $sql = 'UPDATE ' . $dbPrefix . 'payment_options SET paypal_client_id=?, paypal_secret_id=?, stripe_client_id=?, stripe_secret_id=?, is_enabled=?, email_notification=?, email_subject=?, email_body=?, email_from=?, is_test_mode=?, paypal_enabled=?, stripe_enabled=?, authorizenet_enabled=?, authorizenet_api_login_id=?, authorizenet_transaction_key=?, authorizenet_public_client_key=?, email_day_notify=? WHERE payment_option_id=?';
        $pdo->prepare($sql)->execute($array);
        $_SESSION['agent']['payment_enabled'] = $is_enabled;

        $sql = 'UPDATE ' . $dbPrefix . 'agents SET payment_enabled=? ';
        $pdo->prepare($sql)->execute([$is_enabled]);

        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

/**
 * Returns all plans.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @return boolean
 */
function getPlans($draw, $start = 0, $offset = 10, $order = false, $search = false) {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [];
        $additional = '';
        if ($search && $search['value']) {
            $additional = 'WHERE name like "%' . $search['value'] . '%" OR price like "%' . $search['value'] . '%"';
        }
        $start = $start ?? 0;
        $offset = $offset ?? 10;
        $orderBy = array('name', 'price');
        $orderBySql = '';
        if (isset($order[0]['column'])) {
            $orderBySql = ' order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' ';
        }

        $total = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'plans' . $additional);
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'plans' . $additional . $orderBySql . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $rows = array();
        while ($r = $stmt->fetch()) {
            $rows[] = $r;
        }
        $data['data'] = $rows;
        return json_encode($data);

    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns plan info by plan_id
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $id
 * @return boolean|type
 */
function getPlan($id) {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [$id];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "plans WHERE `plan_id`= ?");
        $stmt->execute($array);
        $user = $stmt->fetch();

        if ($user) {
            return json_encode($user);
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}


/**
 * Updates plan by plan_id
 *
 * @global type $dbPrefix
 * @global user $pdo
 * @param String $planId
 * @param String $name
 * @param String $price
 * @param String $currency
 * @param String $interval
 * @param String $interval_count
 * @param String $description
 * @return boolean
 */
function editPlan($planId, $name, $price, $currency, $interval, $interval_count, $description) {
    global $dbPrefix, $pdo;
    checkHeaders();
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'plans WHERE name = ? and plan_id <> ?');
    $stmt->execute([$name, $planId]);
    $planName = $stmt->fetch();
    if ($planName) {
        return false;
    }

    $array = [$name, $price, $currency, $interval, $interval_count, $description, $planId];
    try {
        $sql = 'UPDATE ' . $dbPrefix . 'plans SET `name`=?, `price`=?, `currency`=?, `interval`=?, `interval_count`=?, `description`=? WHERE plan_id = ?';
        $pdo->prepare($sql)->execute($array);
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}


/**
 * Adds a plan.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $name
 * @param String $price
 * @param String $currency
 * @param String $interval
 * @param String $interval_count
 * @param String $description
 * @return boolean
 */
function addPlan($name, $price, $currency, $interval, $interval_count, $description) {
    global $dbPrefix, $pdo;
    checkHeaders();
    try {

        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'plans WHERE name = ?');
        $stmt->execute([$name]);
        $plan = $stmt->fetch();
        if ($plan) {
            return false;
        }

        $sql = 'INSERT INTO ' . $dbPrefix . 'plans (`name`, `price`, `currency`, `interval`, `interval_count`, `description`) VALUES (?, ?, ?, ?, ?, ?)';
        $pdo->prepare($sql)->execute([$name, $price, $currency, $interval, $interval_count, $description]);
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

/**
 * Returns all subscriptions.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @return boolean
 */
function getSubscriptions($draw, $start = 0, $offset = 10, $order = false, $search = false) {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [];
        $additional = 'WHERE subscription_id IN (SELECT MAX(subscription_id) from ' . $dbPrefix . 'subscriptions group by tenant)';
        if ($search && $search['value']) {
            $additional = 'WHERE subscription_id IN (SELECT MAX(subscription_id) from ' . $dbPrefix . 'subscriptions group by tenant) AND payer_name like "%' . $search['value'] . '%" OR payer_email like "%' . $search['value'] . '%"';
        }
        $start = $start ?? 0;
        $offset = $offset ?? 10;
        $orderBy = array('subscription_id', 'valid_to');
        $orderBySql = ' order by subscription_id desc;';
        if (isset($order[0]['column'])) {
            $orderBySql = ' order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' ';
        }

        $total = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions ' . $additional);
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions ' . $additional . $orderBySql . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $rows = array();
        while ($r = $stmt->fetch()) {
            $rows[] = $r;
        }
        $data['data'] = $rows;
        return json_encode($data);

    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns plan info by plan_id
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $id
 * @return boolean|type
 */
function getSubscription($id) {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [$id];
        $stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "subscriptions LEFT JOIN " . $dbPrefix . "agents ON " . $dbPrefix . "agents.agent_id = " . $dbPrefix . "subscriptions.agent_id LEFT JOIN " . $dbPrefix . "plans ON " . $dbPrefix . "plans.plan_id = " . $dbPrefix . "subscriptions.plan_id WHERE `subscription_id`= ?");
        $stmt->execute($array);
        $user = $stmt->fetch();

        if ($user) {
            return json_encode($user);
        } else {
            return false;
        }
    } catch (Exception $e) {
        return false;
    }
}


/**
 * Updates plan by plan_id
 *
 * @global type $dbPrefix
 * @global user $pdo
 * @param String $subscriptionId
 * @param String $valid_from
 * @param String $valid_to
 * @return boolean
 */
function editSubscription($subscriptionId, $valid_from, $valid_to) {
    global $dbPrefix, $pdo;
    checkHeaders();

    $array = [$valid_from, $valid_to, $subscriptionId];
    try {
        $sql = 'UPDATE ' . $dbPrefix . 'subscriptions SET `valid_from`=?, `valid_to`=? WHERE subscription_id = ?';
        $pdo->prepare($sql)->execute($array);
        return true;
    } catch (Exception $e) {
        return $e->getMessage();
    }
}

/**
 * Deletes a plan
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $planId
 * @return boolean
 */
function deletePlan($planId) {
    global $dbPrefix, $pdo;
    checkHeaders();
    try {

        $sql = 'DELETE FROM ' . $dbPrefix . 'plans WHERE plan_id = ?';
        $pdo->prepare($sql)->execute([$planId]);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Deletes a plan
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param String $subscriptionId
 * @return boolean
 */
function deleteSubscription($subscriptionId) {
    global $dbPrefix, $pdo;
    checkHeaders();
    try {

        $sql = 'DELETE FROM ' . $dbPrefix . 'subscriptions WHERE subscription_id = ?';
        $pdo->prepare($sql)->execute([$subscriptionId]);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

function checkPayment($agentId) {
    global $dbPrefix, $pdo;
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents WHERE tenant=? and is_master=? and payment_enabled=?');
    $stmt->execute([$agentId, 1, 1]);
    $user = $stmt->fetch();
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'payment_options WHERE payment_option_id=?');
    $stmt->execute([1]);
    $payment_option = $stmt->fetch();
    if ($payment_option['is_enabled'] && $user) {
        $paid = 'false';
        if ($user) {
            $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions WHERE tenant=? AND (payment_status="approved" OR payment_status="succeeded") order by subscription_id desc limit 1');
            $stmt->execute([$user['tenant']]);
            $subscription = $stmt->fetch();
            if ($subscription) {
                if ($subscription['subscr_interval'] === 'N') {
                    $paid = $subscription['subscr_interval_count'];
                } else {
                    $paid = (strtotime($subscription['valid_to']) >= strtotime(date('Y-m-d H:i:s'))) ? 'true' : 'false';
                }
            } else {
                $paid = 'false';
            }
        } else {
            $paid = 'false';
        }
        return $paid;
    } else {
        return 'true';
    }
}

function updatePayment($subscr_interval_count, $agentId) {
    global $dbPrefix, $pdo;
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'agents WHERE tenant=? and is_master=? and payment_enabled=?');
    $stmt->execute([$agentId, 1, 1]);
    $user = $stmt->fetch();
    $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'payment_options WHERE payment_option_id=?');
    $stmt->execute([1]);
    $payment_option = $stmt->fetch();
    if ($payment_option['is_enabled'] && $user) {
        $paid = false;
        if ($user) {
            $array = [$subscr_interval_count, $agentId];
            $sql = 'UPDATE ' . $dbPrefix . 'subscriptions SET subscr_interval_count=? WHERE tenant = ?';
            $pdo->prepare($sql)->execute($array);
        } else {
            $paid = false;
        }
        return $paid;
    } else {
        return 'true';
    }
}


/**
 * Returns all subscriptions.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @return boolean
 */
function getHistory($draw, $tenant = '', $start = 0, $offset = 10, $order = false, $search = false) {

    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        $array = [];
        if (!isset($_SESSION["agent"]['tenant'])) {
            return false;
        }
        if ($_SESSION['tenant'] == 'lsv_mastertenant' && $tenant) {
            $additional = ' WHERE tenant = "'. $tenant . '"';
        } else {
            $additional = ' WHERE tenant = "' . $_SESSION["agent"]['tenant'] . '"';
        }
        if ($search && $search['value']) {
            $additional .= ' AND payer_name LIKE "%' . $search['value'] . '%" OR payer_email LIKE "%' . $search['value'] . '%"';
        }
        $start = $start ?? 0;
        $offset = $offset ?? 10;
        $orderBy = array('subscription_id', 'valid_to');
        $orderBySql = '';
        if (isset($order[0]['column'])) {
            $orderBySql = ' order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' ';
        }
        $total = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions ' . $additional);
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'subscriptions LEFT JOIN ' . $dbPrefix . 'plans ON ' . $dbPrefix . 'plans.plan_id = ' . $dbPrefix . 'subscriptions.plan_id  ' . $additional . $orderBySql . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $rows = array();
        while ($r = $stmt->fetch()) {
            $rows[] = $r;
        }
        $data['data'] = $rows;
        return json_encode($data);

    } catch (Exception $e) {
        return false;
    }
}

/**
 * Method to add a recording after video session ends.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param type $roomId
 * @param type $file
 * @param type $agentId
 * @return int
 */
function insertRecording($roomId, $file, $agentId) {
    global $dbPrefix, $pdo;
    try {

        $sql = "INSERT INTO " . $dbPrefix . "recordings (`room_id`, `filename`, `agent_id`, `date_created`) "
                . "VALUES (?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([$roomId, $file, $agentId, date("Y-m-d H:i:s")]);
        return 200;
    } catch (Exception $e) {
        return 'Error ' . $e->getMessage();
    }
}


/**
 * Method to delete a recording from the database and delete the file.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @param type $recordingId
 * @return boolean
 */
function deleteRecording($recordingId) {
    global $dbPrefix, $pdo;
    checkHeaders();
    try {

        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'recordings WHERE recording_id = ?');
        $stmt->execute([$recordingId]);
        $rec = $stmt->fetch();

        if ($rec) {
            @unlink('../server/recordings/' . $rec['filename']);
        }

        $array = [$recordingId];
        $sql = 'DELETE FROM ' . $dbPrefix . 'recordings WHERE recording_id = ?';
        $pdo->prepare($sql)->execute($array);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Returns all recordings.
 *
 * @global type $dbPrefix
 * @global type $pdo
 * @return type
 */
function getRecordings($draw, $start = 0, $offset = 10, $order = false, $search = false) {
    global $dbPrefix, $pdo;
    checkHeaders();
    try {
        if ($_SESSION["tenant"] == 'lsv_mastertenant') {
            $additional = '';
        } else {
            $additional = ' WHERE agent_id="' . $_SESSION["tenant"] . '"';
        }
        $array = [];
        if ($search && $search['value']) {
            if (!$additional) {
                $additional = ' WHERE';
            }
            $additional .= ' filename like "%' . $search['value'] . '%" OR room_id like "%' . $search['value'] . '%" OR agent_id like "%' . $search['value'] . '%" OR date_created like "%' . $search['value'] . '%" ';
        }
        $start = $start ?? 0;
        $offset = $offset ?? 10;
        $orderBy = array('filename', 'room_id', 'agent_id', 'date_created');
        $orderBySql = '';
        if (isset($order[0]['column'])) {
            $orderBySql = ' order by ' . $orderBy[$order[0]['column']] . ' ' . $order[0]['dir'] . ' ';
        }

        $total = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'recordings' . $additional);
        $total->execute($array);
        $stmt = $pdo->prepare('SELECT * FROM ' . $dbPrefix . 'recordings' . $additional . $orderBySql . ' LIMIT ' . $start . ',' . $offset);
        $stmt->execute($array);
        if ($draw) {
            $data['draw'] = $draw;
        }
        $data['recordsTotal'] = $total->rowCount();
        $data['recordsFiltered'] = $total->rowCount();

        $rows = array();
        while ($r = $stmt->fetch()) {
            if ($r['filename']) {
                $rows[] = $r;
            }
        }
        $data['data'] = $rows;
        return json_encode($data);

    } catch (Exception $e) {
        return $e->getMessage();
    }
}

function postInput($data) {
    if (!isset($data)) {
        return '';
    }
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function postInputData($data, $propery) {
    if (!property_exists($data, $propery)) {
        return '';
    }
    return $data->$propery;
}

function checkPost($value) {
    return (isset($_POST[$value])) ? $_POST[$value] : null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    if (isset($data) && $data->type) {
        if ($data->type == 'getpk') {
            echo getPk();
        }
        if ($data->type == 'addchat') {
            echo insertChat($data->roomId, postInput($data->message), postInputData($data, 'agentName'), $data->from, $data->to, postInputData($data, 'agentId'), postInputData($data, 'system'), postInputData($data, 'avatar'), $data->datetime);
        }
        if ($data->type == 'getvideoai') {
            echo getVideoAi($data->roomid);
        }
        if ($data->type == 'addlog') {
            echo insertLog($data->roomId, $data->message, $data->agent, postInputData($data, 'agentId'), $data->datetime, $data->ua, $data->attendee);
        }
        if ($data->type == 'sendopenai') {
            echo sendOpenAi(postInput($data->message), $data->context, $data->system, $data->tools, $data->is_context, postInputData($data, 'oa'), postInputData($data, 'oamodel'));
        }
        if ($data->type == 'sendassistant') {
            echo sendAssistant(postInput($data->message), $data->assistantId, postInputData($data, 'oa'));
        }
        if ($data->type == 'createtoken') {
            echo createToken(postInputData($data, 'hg'));
        }
        if ($data->type == 'getvoice') {
            echo getVoice($data->text, $data->voice, $data->session_id, postInputData($data, 'elabs'));
        }
        if ($data->type == 'deletevoice') {
            echo deleteVoice($data->session_id);
        }
        if ($data->type == 'checkpayment') {
            echo checkPayment($data->agentId);
        }
        if ($data->type == 'updatepayment') {
            echo updatePayment($data->subscr_interval_count, $data->agentId);
        }
        if ($data->type == 'listvoices') {
            echo listVoices();
        }
        if ($data->type == 'setlanguage') {
            echo setLanguage($data->lang);
        }
        if ($data->type == 'addrecording') {
            echo insertRecording($data->roomId, $data->filename, $data->agentId);
        }
    } else {
        if (isset($_POST['type']) && $_POST['type'] == 'getrooms') {
            echo getRooms(checkPost('draw'), checkPost('agentId'), checkPost('start'), checkPost('length'), checkPost('order'), checkPost('search'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'deleteroom') {
            echo deleteRoom(checkPost('roomId'), checkPost('agentId'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getroombyid') {
            echo getRoomById($_POST['room_id']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getagents') {
            echo getAgents(checkPost('draw'), checkPost('start'), checkPost('length'), checkPost('order'), checkPost('search'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'deleteagent') {
            echo deleteAgent($_POST['agentId']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'editagent') {
            echo editAgent(checkPost('agentId'), postInput($_POST['firstName']), postInput($_POST['lastName']), postInput($_POST['email']), postInput($_POST['tenant']), postInput($_POST['password']), $_POST['usernamehidden'], $_POST['is_master'], postInput($_POST['openai_key']), postInput($_POST['openai_model']), postInput($_POST['heygen_key']), postInput($_POST['elevenlabs_key']), checkPost('payment_enabled'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'loginagent') {
            echo loginAgent(postInput($_POST['username']), postInput($_POST['password']));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'addagent') {
            echo addAgent(postInput($_POST['username']), postInput($_POST['password']), postInput($_POST['firstName']), postInput($_POST['lastName']), postInput($_POST['email']), postInput($_POST['tenant']), checkPost('payment_enabled'), (int) checkPost('is_master'), checkPost('openai_key'), checkPost('openai_model'), checkPost('heygen_key'), checkPost('elevenlabs_key'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getagent') {
            echo getAgent(checkPost('tenant'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getadmin') {
            echo getAdmin($_POST['id']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'recoverpassword') {
            echo recoverPassword(postInput($_POST['email']), postInput($_POST['username']));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'resetpassword') {
            echo resetPassword($_POST['token'], postInput($_POST['password']));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getchats') {
            echo getChats(checkPost('draw'), checkPost('agentId'), checkPost('start'), checkPost('length'), checkPost('order'), checkPost('search'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getlogs') {
            echo getLogs(checkPost('draw'), checkPost('agentId'), checkPost('start'), checkPost('length'), checkPost('order'), checkPost('search'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'setvideoai') {
            $video_back_image = (isset($_FILES['video-element-back-img'])) ? $_FILES['video-element-back-img'] : '';
            echo setVideoAi(checkPost('roomId'), checkPost('video_ai_avatar'), postInput(checkPost('video_ai_name')), checkPost('video_ai_background'), checkPost('video_ai_quality'), postInput(checkPost('datetime')), postInput(checkPost('duration')), postInput(checkPost('exit_meeting')), postInput(checkPost('inactivity_timeout')), checkPost('video_ai_voice'), checkPost('video_ai_system'), checkPost('video_ai_tools'), checkPost('language'), checkPost('ai_greeting_text'), checkPost('is_context'), checkPost('is_subtitle'), checkPost('is_recording'), checkPost('is_audio'), postInput(checkPost('video_ai_assistant')), postInput(checkPost('video_ai_gender')), postInput(checkPost('api_key')), postInput(checkPost('second_api_key')), checkPost('video_ai_layout'), postInput(checkPost('video_ai_suggestions')), $video_back_image, checkPost('is_offset'), checkPost('room_id'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'updatelocale') {
            echo updateLocale($_POST['data'], $_POST['fileName']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'listavatars') {
            echo listAvatars();
        }
        if (isset($_POST['type']) && $_POST['type'] == 'listinteractive') {
            echo listInsteractive();
        }
        if (isset($_POST['type']) && $_POST['type'] == 'listvoices') {
            echo listVoices();
        }
        if (isset($_POST['type']) && $_POST['type'] == 'listelevenvoices') {
            echo listElevenVoices();
        }
        if (isset($_POST['type']) && $_POST['type'] == 'listassistants') {
            echo listAssistants();
        }
        if (isset($_POST['type']) && $_POST['type'] == 'updatesetting') {
            echo updateSettings(postInput(checkPost('openai_key')), checkPost('old_openai_key'), postInput(checkPost('openai_model')), checkPost('old_openai_model'), postInput(checkPost('heygen_key')), checkPost('old_heygen_key'), postInput(checkPost('elevenlabs_key')), checkPost('old_elevenlabs_key'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'deletechatitem') {
            echo deleteChatItem(checkPost('from'), checkPost('room'));
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getpaymentoptions') {
            echo getPaymentOptions();
        }
        if (isset($_POST['type']) && $_POST['type'] == 'updatepaymentoption') {
            echo updatePaymentOptions($_POST['paypal_client_id'], $_POST['paypal_secret_id'], $_POST['stripe_client_id'], $_POST['stripe_secret_id'], @$_POST['is_enabled'], @$_POST['email_notification'], @$_POST['email_subject'], @$_POST['email_body'], @$_POST['email_from'], @$_POST['is_test_mode'], $_POST['paypal_enabled'], $_POST['stripe_enabled'], $_POST['authorizenet_enabled'], $_POST['authorizenet_api_login_id'], $_POST['authorizenet_transaction_key'], $_POST['authorizenet_public_client_key'], $_POST['email_day_notify']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getplans') {
            echo getPlans(@$_POST['draw'], @$_POST['start'], @$_POST['length'], @$_POST['order'], @$_POST['search']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getplan') {
            echo getPlan($_POST['id']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'editplan') {
            echo editPlan($_POST['planId'], $_POST['name'], $_POST['price'], $_POST['currency'], @$_POST['interval'], @$_POST['interval_count'], @$_POST['description']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'addplan') {
            echo addPlan($_POST['name'], $_POST['price'], $_POST['currency'], @$_POST['interval'], @$_POST['interval_count'], @$_POST['description']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getsubscriptions') {
            echo getSubscriptions(@$_POST['draw'], @$_POST['start'], @$_POST['length'], @$_POST['order'], @$_POST['search']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getsubscription') {
            echo getSubscription($_POST['id']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'editsubscription') {
            echo editSubscription($_POST['subscriptionId'], $_POST['valid_from'], $_POST['valid_to']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'deleteplan') {
            echo deletePlan($_POST['planId']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'deletesubscription') {
            echo deleteSubscription($_POST['subscriptionId']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'gethistory') {
            echo getHistory(@$_POST['draw'], @$_POST['tenant'], @$_POST['start'], @$_POST['length'], @$_POST['order'], @$_POST['search']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'getrecordings') {
            echo getRecordings(@$_POST['draw'], @$_POST['start'], @$_POST['length'], @$_POST['order'], @$_POST['search']);
        }
        if (isset($_POST['type']) && $_POST['type'] == 'deleterecording') {
            echo deleteRecording($_POST['recordingId']);
        }
    }
}
