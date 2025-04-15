<?php
function getInput($value) {
    $data = (isset($_GET[$value])) ? $_GET[$value] : null;
    if (!isset($data)) {
        return '';
    }
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>

    <!-- Title and Icon -->

    <title>LiveSmart AI Video</title>
    <!-- Favicons -->
    <link rel="apple-touch-icon" href="img/logo.png">
    <link rel="icon" href="favicon.ico">

    <!-- Meta Information -->

    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description"
        content="LiveSmart AI Video is a standalone web application to combine the amazing capabilities of OpenAI ChatGPT with a video avatar by your choice. Talk to the avatar or interact with the integrated chat.">
    <meta name="keywords"
        content="Video AI Avatars, ChatGPT, OpenAI, Multi Language, Voice Recognition">


    <!-- https://ogp.me -->

    <meta property="og:type" content="app-webrtc" />
    <meta property="og:site_name" content="LiveSmart AI Video" />
    <meta property="og:title" content="LiveSmart AI Video" />
    <meta property="og:description"
        content="LiveSmart AI Video is a standalone web application focused on integrating video avatars with GPT systems and voice recognition." />
    <meta property="og:image" content="https://livesmart.video/images/logo.png" />

    <!-- StyleSheet -->
    <link rel="stylesheet" href="css/conference.css" />
    <link rel="stylesheet" href="css/custom.css" />

    <link href="css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous" />
    <link rel="stylesheet" href="css/notyf.min.css">

    <script src="js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/livekit-client/dist/livekit-client.umd.min.js"></script>

</head>

<body onbeforeunload="return wantExit();">
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="initialScreen">
        <p>
            <span id="loading"></span> <span class="loader__dot">.</span><span class="loader__dot">.</span><span
                class="loader__dot">.</span>
            <br />
            <span id="pleaseWait"></span>
        </p>
    </div>
    <section id="simpleRoom">
        <main class="d-flex align-items-center min-vh-100 min-vw-100 py-3 py-md-0 gray-background">
            <div class="container d-flex align-items-center w-100">
                <div class="row d-flex justify-content-center w-100">
                    <div class="col-md-12 text-center">
                        <div class="card-body w-100">
                            <form id="simpleForm" class="needs-validation" novalidate>
                                <div class="input-group mb-0">
                                    <input type="text" class="form-control simple-fields" id="nameSimple" required>
                                    <div class="invalid-feedback" id="invalidSimpleName"></div>
                                </div>
                                <div class="form-group text-center">
                                    <input name="joinMeetingSimple" id="joinMeetingSimple"
                                        class="btn btn-block login-btn mb-4" type="submit">
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </section>
    <div id="contentMediaContainer" class="d-none">
        <iframe src="" id="embedUrl" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true" frameborder="0"></iframe>
    </div>
    <div id="videoMediaContainer">
        <div class="videoContainerElement">
            <video id="mediaElement" autoplay playsinline data-room-id="<?php echo getInput('short');?>"></video>
            <div id="div_avatar_name" class="userMenuBar">
                <span id="videoAiName" class="username"></span>
            </div>
            <canvas id="canvasElement"></canvas>
        </div>
    </div>
    <div id="languageMenuBar" class="videoMenuBar d-none">
        <select class="form-control form-select left" id="listvoices"></select>
    </div>
    <div id="actionButtons">
        <button id="chatButton"><i class="fas fa-comments"></i></button>
        <button id="chatSpeechStartButton" class="d-none"><i class="fa-solid fa-microphone-lines"></i></button>
        <button id="languageButton"><i class="fa-solid fa-language"></i></button>
        <button id="recordingButton" class="d-none"><i class="fa fa-circle"></i></button>
        <button id="stopRecordingButton" class="d-none"><i class="fa fa-circle"></i></button>
        <button id="exitButton"><i class="fa fa-sign-out"></i></button>
        <button id="stopButton" class="d-none"><i class="fa fa-stop red"></i></button>
    </div>

    <section class="d-none container" id="chatRoom">
        <div class="row clearfix">
            <div class="col-lg-12">
                <div class="card chat-app">
                    <div class="chat" id="chatContent">
                    <div class="chat-header clearfix">
                            <div class="row">
                                <div class="col-12">
                                    <a href="javascript:void(0);" id="attendeeAvatar"></a>
                                    <div class="chat-about" id="attendeeName"></div>
                                    <a href="javascript:void(0);" id="chatCloseButton"
                                        class="btn btn-outline-danger btn-sm position-absolute">
                                        <i class="fa-solid fa-rectangle-xmark"></i></a>
                                </div>
                            </div>
                        </div>
                        <div class="chat-history" id="chatHistory">
                            <ul class="m-b-0" id="chatBoard">
                            </ul>
                        </div>
                        <div id="suggestionContainer" class="suggestionContainer d-none">
                        </div>
                        <div class="chat-message clearfix">
                            <div class="input-group mb-0">
                                <span class="input-group-text"><i class="fa fa-send" id="chatSendButton"></i></span>
                                <input type="text" class="form-control" id="chatMessage">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <div class="modal" id="actionModal" tabindex="-1" role="dialog" aria-labelledby="actionModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header border-0">
                    <h5 class="modal-title" id="actionModalTitle"></h5>
                </div>
                <div class="modal-body" id="actionModalBody"></div>
                <div class="modal-footer border-0">
                    <button class="btn btn-primary" type="button" id="actionModalOkButton"></button>
                    <button class="btn btn-secondary" type="button" id="actionModalDismissButton"></button>
                </div>
            </div>
        </div>
    </div>
    <span id="translateMessage" class="translateMessage d-none"></span>

    <script src="js/notyf.min.js"></script>
    <script defer src="js/loader.js"></script>
</body>

</html>
