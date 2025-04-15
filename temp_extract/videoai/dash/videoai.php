<?php
include_once 'header.php';
?>
<h1 class="h3 mb-2 text-gray-800" data-localize="meeting_videoai"></h1>
<div id="error" class="d-none alert alert-danger"></div>
<div id="success" class="d-none alert alert-success"></div>
<?php if ($masterTenant || $adminTenant) {
?>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="videoaiavatar-tab" data-toggle="tab" data-target="#videoaiavatar" type="button" role="tab" aria-controls="home" aria-selected="true" data-localize="avatars_ai"></button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="audioaiavatar-tab" data-toggle="tab" data-target="#audioaiavatar" type="button" role="tab" aria-controls="home" aria-selected="true" data-localize="avatars_ai_audio"></button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="room-tab" data-toggle="tab" data-target="#room_settings" type="button" role="tab" aria-controls="home" aria-selected="true" data-localize="room_settings"></button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="advanced-tab" data-toggle="tab" data-target="#advanced" type="button" role="tab" aria-controls="profile" aria-selected="false" data-localize="advanced_tools"></button>
        </li>
    </ul>
    <div class="tab-content mt-3" id="tabcontent">
        <div class="tab-pane fade show active" id="videoaiavatar" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
                <div class="col-lg-6">
                    <div class="p-1">
                        <h4 data-localize="avatars_ai"></h4>
                        <p data-localize="avatars_ai_info"></p>
                        <fieldset>
                            <h5 data-localize="avatars_ai_free"></h5>
                            <div class="form-group" id="avatar_container_interactive"></div>
                        </fieldset>
                        <hr>
                        <h6 data-localize="voices_ai"></h6>
                        <p data-localize="voices_ai_info"></p>
                        <fieldset>
                            <select class="form-control" name="video_ai_voice" id="video_ai_voice"></select>
                        </fieldset>
                        <hr>
                        <div class="form-group">
                            <p data-localize="language"></p>
                            <select class="form-control" name="language" id="language">
                                <option value="">-</option>
                                <option value="af">Afrikaans (af)</option>
                                <option value="sq">Albanian (sq)</option>
                                <option value="am">Amharic (am)</option>
                                <option value="ar">Arabic (ar)</option>
                                <option value="hy">Armenian (hy)</option>
                                <option value="az">Azerbaijani (az)</option>
                                <option value="eu">Basque (eu)</option>
                                <option value="be">Belarusian (be)</option>
                                <option value="bn">Bengali (bn)</option>
                                <option value="bs">Bosnian (bs)</option>
                                <option value="bg">Bulgarian (bg)</option>
                                <option value="ca">Catalan (ca)</option>
                                <option value="ceb">Cebuano (ceb)</option>
                                <option value="ny">Chichewa (ny)</option>
                                <option value="zh">Chinese (Simplified) (zh)</option>
                                <option value="zh-TW">Chinese (Traditional) (zh-TW)</option>
                                <option value="co">Corsican (co)</option>
                                <option value="hr">Croatian (hr)</option>
                                <option value="cs">Czech (cs)</option>
                                <option value="da">Danish (da)</option>
                                <option value="nl">Dutch (nl)</option>
                                <option value="en">English (en)</option>
                                <option value="eo">Esperanto (eo)</option>
                                <option value="et">Estonian (et)</option>
                                <option value="tl">Filipino (tl)</option>
                                <option value="fi">Finnish (fi)</option>
                                <option value="fr">French (fr)</option>
                                <option value="fy">Frisian (fy)</option>
                                <option value="gl">Galician (gl)</option>
                                <option value="ka">Georgian (ka)</option>
                                <option value="de">German (de)</option>
                                <option value="el">Greek (el)</option>
                                <option value="gu">Gujarati (gu)</option>
                                <option value="ht">Haitian Creole (ht)</option>
                                <option value="ha">Hausa (ha)</option>
                                <option value="haw">Hawaiian (haw)</option>
                                <option value="iw">Hebrew (iw)</option>
                                <option value="hi">Hindi (hi)</option>
                                <option value="hmn">Hmong (hmn)</option>
                                <option value="hu">Hungarian (hu)</option>
                                <option value="is">Icelandic (is)</option>
                                <option value="ig">Igbo (ig)</option>
                                <option value="id">Indonesian (id)</option>
                                <option value="ga">Irish (ga)</option>
                                <option value="it">Italian (it)</option>
                                <option value="ja">Japanese (ja)</option>
                                <option value="jw">Javanese (jw)</option>
                                <option value="kn">Kannada (kn)</option>
                                <option value="kk">Kazakh (kk)</option>
                                <option value="km">Khmer (km)</option>
                                <option value="ko">Korean (ko)</option>
                                <option value="ku">Kurdish (Kurmanji) (ku)</option>
                                <option value="ky">Kyrgyz (ky)</option>
                                <option value="lo">Lao (lo)</option>
                                <option value="la">Latin (la)</option>
                                <option value="lv">Latvian (lv)</option>
                                <option value="lt">Lithuanian (lt)</option>
                                <option value="lb">Luxembourgish (lb)</option>
                                <option value="mk">Macedonian (mk)</option>
                                <option value="mg">Malagasy (mg)</option>
                                <option value="ms">Malay (ms)</option>
                                <option value="ml">Malayalam (ml)</option>
                                <option value="mt">Maltese (mt)</option>
                                <option value="mi">Maori (mi)</option>
                                <option value="mr">Marathi (mr)</option>
                                <option value="mn">Mongolian (mn)</option>
                                <option value="my">Myanmar (Burmese) (my)</option>
                                <option value="ne">Nepali (ne)</option>
                                <option value="no">Norwegian (no)</option>
                                <option value="ps">Pashto (ps)</option>
                                <option value="fa">Persian (fa)</option>
                                <option value="pl">Polish (pl)</option>
                                <option value="pt">Portuguese (pt)</option>
                                <option value="pa">Punjabi (pa)</option>
                                <option value="ro">Romanian (ro)</option>
                                <option value="ru">Russian (ru)</option>
                                <option value="sm">Samoan (sm)</option>
                                <option value="gd">Scots Gaelic (gd)</option>
                                <option value="sr">Serbian (sr)</option>
                                <option value="st">Sesotho (st)</option>
                                <option value="sn">Shona (sn)</option>
                                <option value="sd">Sindhi (sd)</option>
                                <option value="si">Sinhala (si)</option>
                                <option value="sk">Slovak (sk)</option>
                                <option value="sl">Slovenian (sl)</option>
                                <option value="so">Somali (so)</option>
                                <option value="es">Spanish (es)</option>
                                <option value="su">Sundanese (su)</option>
                                <option value="sw">Swahili (sw)</option>
                                <option value="sv">Swedish (sv)</option>
                                <option value="tg">Tajik (tg)</option>
                                <option value="ta">Tamil (ta)</option>
                                <option value="te">Telugu (te)</option>
                                <option value="th">Thai (th)</option>
                                <option value="tr">Turkish (tr)</option>
                                <option value="uk">Ukrainian (uk)</option>
                                <option value="ur">Urdu (ur)</option>
                                <option value="uz">Uzbek (uz)</option>
                                <option value="vi">Vietnamese (vi)</option>
                                <option value="cy">Welsh (cy)</option>
                                <option value="xh">Xhosa (xh)</option>
                                <option value="yi">Yiddish (yi)</option>
                                <option value="yo">Yoruba (yo)</option>
                                <option value="zu">Zulu (zu)</option>
                            </select>
                        </div>
                        <hr>
                        <h6 data-localize="video_background"></h6>
                        <fieldset>
                            <div class="form-group">
                                <label for="video-element-back-img" data-localize="or_choose_image">></label>
                                <input type="file" accept=".jpg, .jpeg, .png, .gif" class="form-control" name="video-element-back-img" id="video-element-back-img" value="" />
                            </div>
                            <span data-localize="orchoose_images"></span>
                            <div class="form-group" id="video-element-back-images"></div>
                            <div class="form-group">
                                <img id="video-element-back-preview" src="" width="200" />
                            </div>
                        </fieldset>
                        <hr>
                        <fieldset>
                            <div class="form-group">
                                <p data-localize="quality_ai"></p>
                                <select class="form-control" name="quality" id="quality">
                                    <option value="low">low</option>
                                    <option value="medium" selected>medium</option>
                                    <option value="high">high</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <p data-localize="custom_avatar_id"></p>
                                <input type="text" autocomplete="off" class="form-control" id="custom_avatar_id" name="room" aria-describedby="room">
                            </div>
                            <div class="form-group">
                                <p data-localize="custom_avatar_name"></p>
                                <input type="text" autocomplete="off" class="form-control" id="custom_avatar_name" name="room" aria-describedby="room">
                            </div>
                            <div class="form-group">
                                <p data-localize="custom_voice_id"></p>
                                <input type="text" autocomplete="off" class="form-control" id="custom_voice_id" name="room" aria-describedby="room">
                            </div>
                        </fieldset>
                        <input type="hidden" class="form-control" value="" id="video-element-back-hidden">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="p-1">
                        <img src="" width="100%" id="imagePreview" class="d-none"></img>
                        <video src="" controls="yes" width="100%" id="videoPreview" class="d-none"></video>
                    </div>
                </div>
            </div>

        </div>
        <div class="tab-pane fade" id="audioaiavatar" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
                <div class="col-lg-6">
                    <div class="p-1">
                        <h4 data-localize="avatars_ai_audio"></h4>
                        <p data-localize="avatars_ai_audio_info"></p>
                        <hr>
                        <div class="form-group">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="is_audio">
                                <label class="custom-control-label" for="is_audio" data-localize="is_audio"></label>
                            </div>
                        </div>
                        <hr>
                        <div class="form-group">
                            <p data-localize="language"></p>
                            <select class="form-control" name="language_audio" id="language_audio">
                                <option value="">-</option>
                                <option value="af">Afrikaans (af)</option>
                                <option value="sq">Albanian (sq)</option>
                                <option value="am">Amharic (am)</option>
                                <option value="ar">Arabic (ar)</option>
                                <option value="hy">Armenian (hy)</option>
                                <option value="az">Azerbaijani (az)</option>
                                <option value="eu">Basque (eu)</option>
                                <option value="be">Belarusian (be)</option>
                                <option value="bn">Bengali (bn)</option>
                                <option value="bs">Bosnian (bs)</option>
                                <option value="bg">Bulgarian (bg)</option>
                                <option value="ca">Catalan (ca)</option>
                                <option value="ceb">Cebuano (ceb)</option>
                                <option value="ny">Chichewa (ny)</option>
                                <option value="zh">Chinese (Simplified) (zh)</option>
                                <option value="zh-TW">Chinese (Traditional) (zh-TW)</option>
                                <option value="co">Corsican (co)</option>
                                <option value="hr">Croatian (hr)</option>
                                <option value="cs">Czech (cs)</option>
                                <option value="da">Danish (da)</option>
                                <option value="nl">Dutch (nl)</option>
                                <option value="en">English (en)</option>
                                <option value="eo">Esperanto (eo)</option>
                                <option value="et">Estonian (et)</option>
                                <option value="tl">Filipino (tl)</option>
                                <option value="fi">Finnish (fi)</option>
                                <option value="fr">French (fr)</option>
                                <option value="fy">Frisian (fy)</option>
                                <option value="gl">Galician (gl)</option>
                                <option value="ka">Georgian (ka)</option>
                                <option value="de">German (de)</option>
                                <option value="el">Greek (el)</option>
                                <option value="gu">Gujarati (gu)</option>
                                <option value="ht">Haitian Creole (ht)</option>
                                <option value="ha">Hausa (ha)</option>
                                <option value="haw">Hawaiian (haw)</option>
                                <option value="iw">Hebrew (iw)</option>
                                <option value="hi">Hindi (hi)</option>
                                <option value="hmn">Hmong (hmn)</option>
                                <option value="hu">Hungarian (hu)</option>
                                <option value="is">Icelandic (is)</option>
                                <option value="ig">Igbo (ig)</option>
                                <option value="id">Indonesian (id)</option>
                                <option value="ga">Irish (ga)</option>
                                <option value="it">Italian (it)</option>
                                <option value="ja">Japanese (ja)</option>
                                <option value="jw">Javanese (jw)</option>
                                <option value="kn">Kannada (kn)</option>
                                <option value="kk">Kazakh (kk)</option>
                                <option value="km">Khmer (km)</option>
                                <option value="ko">Korean (ko)</option>
                                <option value="ku">Kurdish (Kurmanji) (ku)</option>
                                <option value="ky">Kyrgyz (ky)</option>
                                <option value="lo">Lao (lo)</option>
                                <option value="la">Latin (la)</option>
                                <option value="lv">Latvian (lv)</option>
                                <option value="lt">Lithuanian (lt)</option>
                                <option value="lb">Luxembourgish (lb)</option>
                                <option value="mk">Macedonian (mk)</option>
                                <option value="mg">Malagasy (mg)</option>
                                <option value="ms">Malay (ms)</option>
                                <option value="ml">Malayalam (ml)</option>
                                <option value="mt">Maltese (mt)</option>
                                <option value="mi">Maori (mi)</option>
                                <option value="mr">Marathi (mr)</option>
                                <option value="mn">Mongolian (mn)</option>
                                <option value="my">Myanmar (Burmese) (my)</option>
                                <option value="ne">Nepali (ne)</option>
                                <option value="no">Norwegian (no)</option>
                                <option value="ps">Pashto (ps)</option>
                                <option value="fa">Persian (fa)</option>
                                <option value="pl">Polish (pl)</option>
                                <option value="pt">Portuguese (pt)</option>
                                <option value="pa">Punjabi (pa)</option>
                                <option value="ro">Romanian (ro)</option>
                                <option value="ru">Russian (ru)</option>
                                <option value="sm">Samoan (sm)</option>
                                <option value="gd">Scots Gaelic (gd)</option>
                                <option value="sr">Serbian (sr)</option>
                                <option value="st">Sesotho (st)</option>
                                <option value="sn">Shona (sn)</option>
                                <option value="sd">Sindhi (sd)</option>
                                <option value="si">Sinhala (si)</option>
                                <option value="sk">Slovak (sk)</option>
                                <option value="sl">Slovenian (sl)</option>
                                <option value="so">Somali (so)</option>
                                <option value="es">Spanish (es)</option>
                                <option value="su">Sundanese (su)</option>
                                <option value="sw">Swahili (sw)</option>
                                <option value="sv">Swedish (sv)</option>
                                <option value="tg">Tajik (tg)</option>
                                <option value="ta">Tamil (ta)</option>
                                <option value="te">Telugu (te)</option>
                                <option value="th">Thai (th)</option>
                                <option value="tr">Turkish (tr)</option>
                                <option value="uk">Ukrainian (uk)</option>
                                <option value="ur">Urdu (ur)</option>
                                <option value="uz">Uzbek (uz)</option>
                                <option value="vi">Vietnamese (vi)</option>
                                <option value="cy">Welsh (cy)</option>
                                <option value="xh">Xhosa (xh)</option>
                                <option value="yi">Yiddish (yi)</option>
                                <option value="yo">Yoruba (yo)</option>
                                <option value="zu">Zulu (zu)</option>
                            </select>
                        </div>
                        <hr>
                        <h6 data-localize="voices_ai"></h6>
                        <p data-localize="voices_ai_info"></p>
                        <fieldset>
                            <select class="form-control" name="video_ai_aidio_voice" id="video_ai_aidio_voice"></select>
                        </fieldset>
                    </div>
                </div>
            </div>

        </div>
        <div class="tab-pane fade" id="room_settings" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
                <div class="col-lg-6">
                    <div class="p-1">
                    <h4 data-localize="room_settings"></h4>
                        <div class="form-group">
                            <p data-localize="room_ai"></p>
                            <input type="text" autocomplete="off" onkeydown="return /[a-zA-Z0-9_]/i.test(event.key)" class="form-control" id="room" name="room" aria-describedby="room">
                        </div>
                        <h5 data-localize="chat_settings"></h5>
                        <div class="form-group">
                            <p data-localize="avatar_system"></p>
                            <textarea class="form-control" rows="4" id="system" name="system">You are a streaming avatar from LiveSmart Server Video, an industry-leading product that specializes in video communications. Audience will try to have a conversation with you, please try to answer the questions or respond to their comments naturally, and concisely. Please try your best to respond with short answers, and only answer the last question.</textarea>
                        </div>
                        <div class="form-group">
                            <p data-localize="ai_greeting_text"></p>
                            <textarea class="form-control" rows="4" id="ai_greeting_text" name="ai_greeting_text"></textarea>
                        </div>
                        <div class="form-group">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" checked id="is_context">
                                <label class="custom-control-label" for="is_context" data-localize="is_context"></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" checked id="is_subtitle">
                                <label class="custom-control-label" for="is_subtitle" data-localize="is_subtitle"></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="is_recording">
                                <label class="custom-control-label" for="is_recording" data-localize="is_recording"></label>
                            </div>
                        </div>
                        <hr>
                        <div class="form-group">
                            <div class="custom-control">
                                <label for="videoScreen_exitMeetingDrop" data-localize="config_exitMeeting"></label>
                                <select class="form-control" name="videoScreen_exitMeetingDrop" id="videoScreen_exitMeetingDrop">
                                    <option value="1">Go to home page</option>
                                    <option value="2">Show entry form</option>
                                    <option value="3">Go to specific URL</option>
                                </select>
                                <input type="text" class="form-control" id="videoScreen_exitMeeting" aria-describedby="videoScreen_exitMeeting">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <div class="tab-pane fade" id="advanced" role="tabpanel" aria-labelledby="advanced-tab">
            <div class="row">
                <div class="col-lg-6">
                    <div class="p-1">
                        <h4 data-localize="advanced_tools"></h4>
                        <h6 data-localize="advanced_tools_info"></h6>
                        <p data-localize="predefined_ai_tools"></p>
                        <fieldset>
                            <select class="form-control" name="video_ai_tools" id="video_ai_tools">
                                <option> - </option>
                                <option value="getCurrentWeather">Weather By Location</option>
                                <option value="getPrice">Price of stock options</option>
                                <option value="getCurrency">Convert currency to USD</option>
                                <option value="getHotels">Find best hotels in a city</option>
                                <option value="getNews">Get latest news by keyword</option>
                                <option value="getAvailableTimeslots">Set a booking demo</option>
                                <option value="getYoutube">Search and play YouTube videos</option>
                                <option value="getNewsFeed">Add news feed RSS site</option>
                            </select>
                            <div id="video_ai_tools_api_div" class="form-group mt-2 d-none">
                                <p id="video_ai_tools_api_div_info"></p>
                                <input type="text" autocomplete="off" class="form-control" name="video_ai_tools_api" id="video_ai_tools_api" aria-describedby="room">
                            </div>
                            <div id="video_ai_tools_second_api_div" class="form-group mt-2 d-none">
                                <p id="video_ai_tools_second_api_div_info"></p>
                                <input type="text" autocomplete="off" class="form-control" name="video_ai_tools_second_api" id="video_ai_tools_second_api" aria-describedby="room">
                            </div>
                        </fieldset>
                        <div class="wrapper">
                            <fieldset class="element">
                                <hr>
                                <div class="form-group">
                                    <p data-localize="tools_name"></p>
                                    <input type="text" autocomplete="off" class="form-control" name="tools_name[]" aria-describedby="room">
                                </div>
                                <div class="form-group">
                                    <p data-localize="tools_description"></p>
                                    <input type="text" autocomplete="off" class="form-control" name="tools_description[]" aria-describedby="room">
                                </div>
                                <div class="form-group">
                                    <p data-localize="tools_parameters"></p>
                                    <input type="text" autocomplete="off" class="form-control" name="tools_parameters[]" aria-describedby="room">
                                </div>
                            </fieldset>
                            <div class="results"></div>
                            <div class="text-right">
                                <i class="fas fa-plus fa-2x text-300 clone pointer"></i> <i class="fas fa-minus fa-2x text-300 remove pointer"></i>
                            </div>
                            <hr>
                            <div class="form-group">
                                <p data-localize="video_ai_suggestions"></p>
                                <input type="text" autocomplete="off" class="form-control" id="video_ai_suggestions" name="video_ai_suggestions" aria-describedby="video_ai_suggestions">
                            </div>
                            <div class="form-group">
                                <p data-localize="ai_layout"></p>
                                <select class="form-control" name="video_ai_layout" id="video_ai_layout">
                                    <option value="0">Default</option>
                                    <option value="1">Content oriented</option>
                                </select>
                            </div>
                            <hr>
                            <div class="form-group">
                                <h6 data-localize="ai_datetime"></h6>
                                <p data-localize="date_time"></p>
                                <input type="text" class="form-control" id="datetime" aria-describedby="datetime">
                            </div>
                            <div class="form-group">
                                <p data-localize="duration"></p>
                                <select class="form-control" name="duration" id="duration"><option value="">-</option><option value="15">15</option><option value="30">30</option><option value="45">45</option></select>
                                <span data-localize="or"></span>
                                <br/>
                                <input type="text" class="form-control w-25" id="durationtext" aria-describedby="shortagent">
                            </div>
                            <div class="form-group">
                                <p data-localize="inactivity_timeout"></p>
                                <input type="text" class="form-control w-25" id="inactivity_timeout" aria-describedby="inactivity_timeout">
                            </div>
                        </div>
                        <hr>
                        <h6 data-localize="assitants"></h6>
                        <p data-localize="assitants_info"></p>
                        <fieldset>
                            <select class="form-control" name="video_ai_assistant" id="video_ai_assistant"></select>
                        </fieldset>
                    </div>
                </div>
            </div>

        </div>
        <hr>
        <a href="javascript:void(0);" id="saveAvatars" class="btn btn-primary" data-localize="save">
        </a>
        <a href="javascript:void(0);" id="runAvatars" class="btn btn-secondary" data-localize="start_session">
        </a>
    </div>



<?php } else {
    header("Location: dash.php");
    die();
} ?>
<?php
include_once 'footer.php';
