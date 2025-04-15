<?php

/*
  Plugin Name: LiveSmart AI Video
  Plugin URI: https://livesmart.video
  Description: LiveSmart Widget HTML and JavaScript. It can be addded in a page using the tag [livesmart_ai_widget room="NAME_OF_THE_ROOM"];
  Version: 2.1
  Author: LiveSmart
  Author URI: https://livesmart.video
 */

add_action('admin_menu', 'livesmart_ai_plugin_settings');


function livesmart_ai_insert_user($username, $password, $email, $firstName, $lastName, $lsRepUrl) {
    $posts = http_build_query(array('type' => 'addagent', 'username' => $username, 'password' => $password, 'firstName' => $firstName, 'lastName' => $lastName, 'email' => $email, 'tenant' => $username));
    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $lsRepUrl . 'server/script.php',
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => $posts,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYHOST=> false,
        CURLOPT_TIMEOUT => 10
    ));
    $response = @curl_exec($ch);
    if (curl_errno($ch) > 0) {
        curl_close($ch);
        return false;
    } else {

        $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($responseCode !== 200) {
            curl_close($ch);
            return false;
        }
        curl_close($ch);
    }
}

function livesmart_ai_check_user($username, $password, $email, $firstName, $lastName, $lsRepUrl) {
    $posts = http_build_query(array('type' => 'loginagent', 'username' => $username, 'password' => $password));
    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $lsRepUrl . 'server/script.php',
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => $posts,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYHOST=> false,
        CURLOPT_TIMEOUT => 10
    ));

    $response = curl_exec($ch);
    curl_close($ch);
    if (!$response) {
        livesmart_ai_insert_user($username, $password, $email, $firstName, $lastName, $lsRepUrl);
    }
}

function livesmart_ai_delete_user($username, $lsRepUrl) {
    $posts = http_build_query(array('type' => 'deleteagentbyusername', 'username' => $username));
    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $lsRepUrl . 'server/script.php',
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => $posts,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYHOST=> false,
        CURLOPT_TIMEOUT => 10
    ));

    curl_exec($ch);
    curl_close($ch);
    $posts = http_build_query(array('type' => 'deleteroombyagent', 'agentId' => $username));
    $ch = curl_init();
    curl_setopt_array($ch, array(
        CURLOPT_URL => $lsRepUrl . 'server/script.php',
        CURLOPT_POST => 1,
        CURLOPT_POSTFIELDS => $posts,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYHOST=> false,
        CURLOPT_TIMEOUT => 10
    ));

    curl_exec($ch);
    curl_close($ch);
}


function livesmart_ai_login( $user_login, $user ) {
    if ($user_login !== 'admin') {
        livesmart_ai_check_user($user_login, '123456', $user->data->user_email, $user->data->display_name, '', get_option('livesmart_ai_server_url'));
    }
}

add_action('wp_login', 'livesmart_ai_login', 10, 2);

function html_livesmart_ai_code($room) {
    $livesmart_server_url = (get_option('livesmart_ai_server_url') != '') ? get_option('livesmart_ai_server_url') : '';
    echo '<iframe id="lsv_iframe" src="'.$livesmart_server_url.$room.'" allow="camera; microphone; fullscreen; display-capture; accelerometer; autoplay; encrypted-media; picture-in-picture" style="background-color:#ffffff; padding: 0; margin:0; border:0;" width="100%" height="600"></iframe>';
}


function ls_ai_shortcode($atts = [], $content = null, $tag = '') {
    $room = isset($atts['room']) ? $atts['room'] : '';
    ob_start();
    html_livesmart_ai_code($room);

    return ob_get_clean();
}

add_shortcode('livesmart_ai_widget', 'ls_ai_shortcode');

add_action('livesmart_ai_widget', 'html_livesmart_ai_code');


function livesmart_ai_plugin_settings() {
    add_menu_page('LiveSmart AI Settings', 'LiveSmart AI Settings', 'administrator', 'fwds_settings_ai', 'livesmart_ai_display_settings');
    add_submenu_page('fwds_settings_ai', 'LiveSmart AI Dashboard', 'LiveSmart AI Dashboard',  'publish_pages', 'fwds_visitors_ai', 'livesmart_ai_display_dash');
}

function livesmart_ai_display_dash() {
    $current_user = wp_get_current_user();
    $livesmart_ai_server_url = (get_option('livesmart_ai_server_url') != '') ? get_option('livesmart_ai_server_url') : '';
    if ($livesmart_ai_server_url) {
        echo '<iframe src="'.$livesmart_ai_server_url.'dash/rooms.php?wplogin='.$current_user->user_login.'&url='.base64_encode($livesmart_ai_server_url).'" style="background-color:#ffffff; padding: 0; margin:0" width="100%" height="605" ></iframe>';
    } else {
        echo 'Please define server URL from the settings page';
    }
}


function livesmart_ai_display_settings() {

    $livesmart_ai_server_url = (get_option('livesmart_ai_server_url') != '') ? get_option('livesmart_ai_server_url') : '';
    $html = '<div class="wrap">
            <form method="post" name="options" action="options.php">

            <h2>Select Your Settings</h2>' . wp_nonce_field('update-options') . '
            <table width="300" cellpadding="2" class="form-table">
                <tr>
                    <td align="left" scope="row">
                    <label>Server URL</label>
                    </td>
                    <td><input type="text" style="width: 400px;" name="livesmart_ai_server_url"
                    value="' . $livesmart_ai_server_url . '" /></td>
                </tr>

            </table>
            <p class="submit">
                <input type="hidden" name="action" value="update" />
                <input type="hidden" name="page_options" value="livesmart_ai_server_url" />
                <input type="submit" name="Submit" value="Update" />
            </p>
            </form>
        </div>';
    echo $html;
}

?>