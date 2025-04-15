(function ($) {
    "use strict";

    $('#error').addClass('d-none');
    $('#saveAgent').click(function (event) {
        var regex = /^[\w.]+$/i
        var isValid = regex.test($('#tenant').val());
        if (!isValid) {
            $('#error').removeClass('d-none');
            $('#error').html('<span data-localize="error_tenant_save"></span>');
            var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
            $('[data-localize]').localize('dashboard', opts);
            return false;
        }
        if ($Id) {
            var dataObj = { 'type': 'editagent', 'agentId': $Id, 'firstName': $('#first_name').val(), 'lastName': $('#last_name').val(), 'tenant': $('#tenant').val(), 'email': $('#email').val(), 'password': $('#password').val(), 'usernamehidden': $('#usernamehidden').val(), 'is_master': $('#is_master').val(), 'openai_key': $('#openai_key').val(), 'openai_model': $('#openai_model').val(), 'heygen_key': $('#heygen_key').val(), 'elevenlabs_key': $('#elevenlabs_key').val() };
        } else {
            dataObj = { 'type': 'addagent', 'username': $('#username').val(), 'firstName': $('#first_name').val(), 'lastName': $('#last_name').val(), 'tenant': $('#tenant').val(), 'email': $('#email').val(), 'password': $('#password').val(), 'is_master': $('#is_master').val(), 'openai_key': $('#openai_key').val(), 'openai_model': $('#openai_model').val(), 'heygen_key': $('#heygen_key').val(), 'elevenlabs_key': $('#elevenlabs_key').val() };
        }
        if ($('#is_master').val()) {
            dataObj.is_master = ($('#is_master').prop('checked') ? 1 : 0);
        }
        if ($('#payment_enabled').val()) {
            dataObj.payment_enabled = ($('#payment_enabled').prop('checked') ? 1 : 0);
        }
        var formData = new FormData();
        for (var key in dataObj) {
            formData.append(key, dataObj[key]);
        }
        $.ajax({
            type: 'POST',
            processData: false,
            contentType: false,
            url: '../server/script.php',
            data: formData
        })
            .done(function (data) {
                if (data) {
                    location.href = 'agents.php';
                } else {
                    $('#error').removeClass('d-none');
                    $('#error').html('<span data-localize="error_agent_save"></span>');
                    var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                    $('[data-localize]').localize('dashboard', opts);
                }
            })
            .fail(function (e) {
                console.log(e);
            });
    });

    if ($base === 'agent.php') {
        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getadmin', 'id': $Id }
        })
            .done(function (data) {
                if (data) {
                    data = JSON.parse(data);
                    $('#agentTitle').html(data.first_name + ' ' + data.last_name);
                    $('#usernamehidden').val(data.username);
                    $('#username').val(data.username);
                    if (data.password) {
                        $('#leftblank').html(' <span data-localize="left_blank_changed"></span>');
                    }
                    //$('#password').val(data.password);
                    $('#first_name').val(data.first_name);
                    $('#last_name').val(data.last_name);
                    $('#tenant').val(data.tenant);
                    $('#email').val(data.email);
                    $('#openai_key').val(data.openai_key);
                    $('#openai_model').val(data.openai_model);
                    $('#heygen_key').val(data.heygen_key);
                    $('#elevenlabs_key').val(data.elevenlabs_key);
                    $('#payment_enabled').prop('checked', data.payment_enabled);
                    $('#deleteAvatar').addClass('d-none');
                    $('#is_master').prop('checked', data.is_master);
                    var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                    $('[data-localize]').localize('dashboard', opts);
                }
            })
            .fail(function (e) {
                console.log(e);
            });
    }

    $('#saveLocale').on('click', function (event) {
        var data = $fileData.split('|');
        var $data = {};
        data.forEach(function (val) {
            $data[val] = $('#' + val).val();
        });
        var dataObj = { 'type': 'updatelocale', 'fileName': $fileLocale, 'data': JSON.stringify($data) };
        $.ajax({
            type: 'POST',
            cache: false,
            dataType: 'json',
            url: '../server/script.php',
            data: dataObj
        })
            .done(function (data) {
                if (data) {
                    location.href = 'locale.php?file=' + $fileLocale;
                } else {
                    $('#error').removeClass('d-none');
                    $('#error').html('<span data-localize="error_locale_save"></span>');
                    var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                    $('[data-localize]').localize('dashboard', opts);
                }
            })
            .fail(function (e) {
                console.log(e);
            });
    });
    $('#saveSetting').on('click', function (event) {
        var dataObj = { 'type': 'updatesetting', 'openai_key': $('#openai_key').val(), 'old_openai_key': $('#old_openai_key').val(), 'openai_model': $('#openai_model').val(), 'old_openai_model': $('#old_openai_model').val(), 'heygen_key': $('#heygen_key').val(), 'old_heygen_key': $('#old_heygen_key').val(), 'elevenlabs_key': $('#elevenlabs_key').val(), 'old_elevenlabs_key': $('#old_elevenlabs_key').val() };
        $.ajax({
            type: 'POST',
            cache: false,
            dataType: 'json',
            url: '../server/script.php',
            data: dataObj
        })
            .done(function (data) {
                $('#success').removeClass('d-none');
                $('#success').html('<span data-localize="settings_updated"></span>');
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            })
            .fail(function (e) {
                console.log(e);
            });
    });

    if ($base === 'videoai.php') {
        let videoAiAvatar, videoAiVoice, videoAiAssistant, voices, videoAvatarGender;
        if ($Id) {
            $.ajax({
                type: 'POST',
                url: '../server/script.php',
                data: { 'type': 'getroombyid', 'room_id': $Id }
            })
                .done(function (data) {
                    if (data) {
                        data = JSON.parse(data);
                        $('#room').val(data.roomId);
                        if (data.video_ai_avatar) {
                            videoAiAvatar = data.video_ai_avatar;
                            $('#' + videoAiAvatar).prop('checked', true);
                            $('#custom_avatar_id').val(data.video_ai_avatar);
                        }
                        if (data.video_ai_voice) {
                            videoAiVoice = data.video_ai_voice;
                            $('#video_ai_voice').val(videoAiVoice);
                            $('#custom_voice_id').val(videoAiVoice);
                        }
                        if (data.video_ai_name) {
                            $('#custom_avatar_name').val(data.video_ai_name);
                        }
                        if (data.video_ai_assistant) {
                            videoAiAssistant = data.video_ai_assistant;
                            $('#video_ai_assistant').val(videoAiAssistant);
                        }
                        let tools = data.video_ai_tools;
                        if (tools) {
                            let arr = tools.split('|');
                            if (arr[0]) {
                                let names = arr[0].split('~');
                                names.forEach((namevalue, index) => {
                                    if (namevalue) {
                                        if (index > 0) {
                                            $('.clone').trigger('click');
                                        }
                                        let inputs = $("input[name='tools_name[]']");
                                        $(inputs[index]).val(namevalue);
                                    }
                                });
                            }
                            if (arr[1]) {
                                let descriptions = arr[1].split('~');
                                descriptions.forEach((namevalue, index) => {
                                    if (namevalue) {
                                        let inputs = $("input[name='tools_description[]']");
                                        $(inputs[index]).val(namevalue);
                                    }
                                });
                            }
                            if (arr[2]) {
                                let params = arr[2].split('~');
                                params.forEach((namevalue, index) => {
                                    if (namevalue) {
                                        let inputs = $("input[name='tools_parameters[]']");
                                        $(inputs[index]).val(namevalue);
                                    }
                                });
                            }
                        }
                        $('#ai_greeting_text').val(data.ai_greeting_text);
                        $('#system').val(data.video_ai_system);
                        $('#language').val(data.language);
                        $('#quality').val(data.video_ai_quality);
                        $('#datetime').val(data.datetime);
                        if (data.duration != 15 && data.duration != 30 && data.duration != 45) {
                            $('#durationtext').val(data.duration);
                        } else {
                            $('#duration').val(data.duration);
                        }
                        var exitMeeting = data.exit_meeting;
                        if (!exitMeeting) {
                            $('#videoScreen_exitMeetingDrop').val(1);
                            $('#videoScreen_exitMeeting').hide();
                        } else if (exitMeeting == 2) {
                            $('#videoScreen_exitMeetingDrop').val(2);
                            $('#videoScreen_exitMeeting').hide();
                        } else {
                            $('#videoScreen_exitMeetingDrop').val(3);
                            $('#videoScreen_exitMeeting').show();
                            $('#videoScreen_exitMeeting').val(exitMeeting);
                        }
                        $('#inactivity_timeout').val(data.inactivity_timeout);
                        $('#video_ai_suggestions').val(data.video_ai_suggestions);
                        $('#video_ai_layout').val(data.video_ai_layout);
                        $('#is_context').prop('checked', data.is_context);
                        $('#is_subtitle').prop('checked', data.is_subtitle);
                        $('#is_recording').prop('checked', data.is_recording);
                        if (data.video_ai_background) {
                            $('#video-element-back-preview').attr('src', '../' + data.video_ai_background);
                        }
                        $('#video-element-back-hidden').val(data.video_ai_background);
                        $('#video_ai_assistant').val(data.video_ai_assistant);
                        if (data.is_audio) {
                            $('#is_audio').prop('checked', data.is_audio);
                            $('#language_audio').val(data.language);
                            setLanguage();
                        }
                    }
                })
                .fail(function (e) {
                    console.log(e);
                });
        }

        //const interactiveAvatars = ['Monica_inSleeveless _20220819', 'Kristin_public_2_20240108', 'Angela-inblackskirt-20220820', 'Kayla-incasualsuit-20220818', 'Anna_public_3_20240108', 'Anna_public_20240108', 'Briana_public_3_20240110', 'Justin_public_3_20240308', 'Lily_public_pro1_20230614', 'Wade_public_2_20240228', 'Tyler-incasualsuit-20220721', 'Tyler-inshirt-20220721', 'Tyler-insuit-20220721', 'Eric_public_pro2_20230608', 'Susan_public_2_20240328'];

        function getAvatars(data) {
            const interactive = data;
            let homeImages = document.getElementById('avatar_container_interactive');
            interactive.data.forEach((avatar) => {
                setAvatars(avatar, homeImages, avatar);
            });
            $('input[type=radio]').on('click', function (event) {
                $('#custom_voice_id').val('');
                $('#custom_avatar_name').val('');
                $('#custom_avatar_id').val('');
                $('#video_ai_voice').val('');
                let videoAvatarArray = $('input[name="avatar_name"]:checked').val().split('|');
                videoAvatarGender = (videoAvatarArray[3]) ? videoAvatarArray[3] : '';
                videoAiVoice = (videoAvatarArray[2]) ? videoAvatarArray[2] : '1bd001e7e50f421d891986aad5158bc8';
                let select = document.getElementById('video_ai_voice');
                $('#video_ai_voice').empty();
                select.options[select.options.length] = new Option('-', '');
                voices.forEach((voice) => {
                    let name = ' ' + voice.name;
                    if (voice.gender == 'unknown') {
                        name = '';
                    }
                    if (voice.support_interactive_avatar === true && voice.gender.toLowerCase() === videoAvatarGender.toLowerCase()) {
                        let option = new Option(voice.language + ',' + name + ' (' + voice.gender + ')', voice.voice_id);
                        select.options[select.options.length] = option
                        if (videoAiVoice && videoAiVoice === voice.voice_id) {
                            option.selected = true;
                        }
                    }
                });
                $('#system').val(videoAvatarArray[6]);
            });
            $('#video_ai_voice').change(function (e) {
                $('#custom_voice_id').val('');
                $('#custom_avatar_id').val('');
            });
        }

        function setAvatars(avatarUi, homeImages, avatar) {
            let div = document.createElement('div');
            div.style.float = 'left';
            div.style.padding = '5px';
            div.style.width = '140px';
            div.style.height = '200px';
            let img = document.createElement('img');
            let hr = document.createElement('hr');
            hr.setAttribute('style', 'margin-bottom: 0.2rem !important; margin-top: 0.2rem !important;');
            const label = document.createElement('label');
            const radioInput = document.createElement('input');
            if (avatarUi.pose_name === 'Monica in Sleeveless') {
                avatarUi.id = 'default';
            }
            radioInput.type = 'radio';
            radioInput.style.marginRight = '2px';
            radioInput.name = 'avatar_name';
            let isBack = (avatar.is_interactive) ? 1 : 0;
            let isOffset = (avatar.is_offset) ? 1 : 0;
            let voice = avatarUi.voice_id
            radioInput.value = avatarUi.id + '|' + avatar.name + '|' + voice + '|' + avatar.gender + '|' + isBack + '|' + isOffset + '|' + avatar.attitude;
            radioInput.id = avatarUi.id;
            if (videoAiAvatar) {
                $('#' + videoAiAvatar).prop('checked', true);
            }
            let textContent = document.createTextNode(avatarUi.pose_name);
            label.appendChild(radioInput);
            label.appendChild(textContent);
            label.style.fontSize = '12px';
            img.setAttribute('src', avatarUi.thumbnail);
            img.setAttribute('width', '100%');
            img.setAttribute('height', '75%');
            img.setAttribute('alt', avatarUi.pose_name);
            img.setAttribute('style', 'cursor:pointer; padding: 2px; object-fit:contain;');
            img.addEventListener('click', function () {
                if (avatarUi.video_url) {
                    $('#videoPreview').removeClass('d-none');
                    $('#imagePreview').addClass('d-none');
                    videoPreview.src = avatarUi.video_url;
                } else {
                    $('#videoPreview').addClass('d-none');
                    $('#imagePreview').removeClass('d-none');
                    imagePreview.src = avatarUi.thumbnail;
                }
            });
            div.append(img);
            div.append(hr);
            div.append(label);
            homeImages.append(div);
        }
        fetch('./avatar_list.json')
                .then((response) => response.json())
                .then((data) => {
                // const freeAvatars = ['Kristin in Black Suit', 'Angela in Black Dress', 'Kayla in Casual Suit', 'Anna in Brown T-shirt', 'Anna in White T-shirt', 'Briana in Brown suit', 'Justin in White Shirt', 'Leah in Black Suit', 'Wade in Black Jacket', 'Tyler in Casual Suit', 'Tyler in Shirt', 'Tyler in Suit', 'Edward in Blue Shirt', 'Susan in Black Shirt', 'Monica in Sleeveless'];
                getAvatars(data);
            });

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '../server/script.php',
            data: { 'type': 'listvoices' }
        })
            .done(function (data) {
                let select = document.getElementById('video_ai_voice');
                select.options[select.options.length] = new Option('-', '');
                voices = data.data.voices;
                voices.sort((a, b) => (a.language > b.language ? 1 : -1));
                voices.forEach((voice) => {
                    let name = ' ' + voice.name;
                    if (voice.gender == 'unknown') {
                        name = '';
                    }
                    if (voice.support_interactive_avatar === true) {
                        let option = new Option(voice.language + ',' + name + ' (' + voice.gender + ')', voice.voice_id);
                        select.options[select.options.length] = option
                        if (videoAiVoice && videoAiVoice === voice.voice_id) {
                            option.selected = true;
                        }
                    }
                });
            })
            .fail(function () {
                console.log(false);
            });

        function voiceSynt() {
            function setSpeech() {
                return new Promise(
                    function (resolve, reject) {
                        let synth = window.speechSynthesis;
                        let id;
                        id = setInterval(() => {
                            if (synth.getVoices().length !== 0) {
                                resolve(synth.getVoices());
                                clearInterval(id);
                            }
                        }, 10);
                    }
                )
            }
            let s = setSpeech();
            s.then((voices) => {
                let voiceSelect = document.querySelector("#video_ai_aidio_voice");
                voiceSelect.options[voiceSelect.options.length] = new Option('-', '');
                let jData = voices;
                jData.sort((a, b) => (a.lang > b.lang ? 1 : -1));
                jData.forEach((voice) => {
                    let option = new Option(`${voice.lang} (${voice.name})`, voice.lang);
                    voiceSelect.options[voiceSelect.options.length] = option
                    if (videoAiVoice && videoAiVoice === voice.lang) {
                        option.selected = true;
                    }
                });
            });
        }

        function setLanguage() {
            $('#video_ai_aidio_voice').empty();
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: '../server/script.php',
                data: { 'type': 'listelevenvoices' }
            })
                .done(function (data) {
                    let select = document.getElementById('video_ai_aidio_voice');
                    select.options[select.options.length] = new Option('-', '');
                    if (data && data.voices) {
                        let jData = data.voices;
                        jData.sort((a, b) => (a.name > b.name ? 1 : -1));
                        jData.forEach((voice) => {
                            let name = voice.name;
                            let option = new Option(name, voice.voice_id);
                            option.title = ' (' + voice.gender + ') ' + voice.description;
                            select.options[select.options.length] = option
                            if (videoAiVoice && videoAiVoice === voice.voice_id) {
                                option.selected = true;
                            }
                        });
                    } else {
                        voiceSynt();
                    }
                })
            .catch((err) => {
                voiceSynt();
            });
        }

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '../server/script.php',
            data: { 'type': 'listassistants' }
        })
            .done(function (data) {
                let select = document.getElementById('video_ai_assistant');
                select.options[select.options.length] = new Option('-', '');
                let jData = data;
                jData.sort((a, b) => (a.name > b.name ? 1 : -1));
                jData.forEach((assistant) => {
                    let name = (assistant.name) ? assistant.name : assistant.id;
                    let option = new Option(name, assistant.id);
                    select.options[select.options.length] = option;
                    if (videoAiAssistant && videoAiAssistant === assistant.id) {
                        option.selected = true;
                    }
                });
            })
            .fail(function () {
                console.log(false);
            });

        var saveOrRun = function (run) {
            $('#error').addClass('d-none');
            $('#success').addClass('d-none');
            const file = $('#video-element-back-img')[0].files[0];
            var fileType = '';
            if (file) {
                fileType = file['type'];
                fileType = fileType.replace('image/', '');
            }
            const roomid = ($('#room').val()) ? $('#room').val() : Math.random().toString(36).slice(2).substring(0, 10);
            const quality = $('#quality').val();
            const datetime = $('#datetime').val();
            const duration = ($('#durationtext').val()) ? $('#durationtext').val() : $('#duration').val();
            const inactivity_timeout = ($('#inactivity_timeout').val()) ? $('#inactivity_timeout').val() : 0;
            const video_ai_suggestions = $('#video_ai_suggestions').val();
            const video_ai_layout = $('#video_ai_layout').val();
            const system = $('#system').val();
            let tools_name = document.getElementsByName('tools_name[]');
            let tools_description = document.getElementsByName('tools_description[]');
            let tools_parameters = document.getElementsByName('tools_parameters[]');
            let names = '';
            tools_name.forEach(function (elem) {
                if ($(elem).val()) {
                    names += $(elem).val() + '~';
                }
            });
            let description = '';
            tools_description.forEach(function (elem) {
                if ($(elem).val()) {
                    description += $(elem).val() + '~';
                }
            });
            let parameters = '';
            tools_parameters.forEach(function (elem) {
                if ($(elem).val()) {
                    parameters += $(elem).val() + '~';
                }
            });
            const api_key = $('#video_ai_tools_api').val();
            const second_api_key = $('#video_ai_tools_second_api').val();
            const tools = (names && description && parameters) ? names + '|' + description + '|' + parameters : '';
            let language = ($('#language').val()) ? $('#language').val() : 'en';
            const ai_greeting_text = $('#ai_greeting_text').val();
            var back_video = (file) ? 'img/backgrounds/' + roomid + '.' + fileType : ($('#video-element-back-hidden').val()) ? $('#video-element-back-hidden').val() : 'img/virtual/1.jpg';
            var is_offset = 0;
            var video_file = (file) ? $('#video-element-back-img')[0].files[0] : '';
            let videoAvatar = 'ef08039a41354ed5a20565db899373f3';
            let videoAvatarName = 'Sofia';
            let videoAvatarVoice = '1bd001e7e50f421d891986aad5158bc8';
            videoAvatarGender = 'female';
            let videoAssistant = '';
            if ($('#video_ai_assistant').val()) {
                videoAssistant = $('#video_ai_assistant').val()
            }

            if ($('input[name="avatar_name"]:checked').val()) {
                let videoAvatarArray = $('input[name="avatar_name"]:checked').val().split('|');
                videoAvatar = videoAvatarArray[0];
                videoAvatarName = videoAvatarArray[1];
                videoAvatarVoice = (videoAvatarArray[2]) ? videoAvatarArray[2] : '1bd001e7e50f421d891986aad5158bc8';
                videoAvatarGender = (videoAvatarArray[3]) ? videoAvatarArray[3] : '';
                if (videoAvatarArray[4] && videoAvatarArray[4] === '1') {
                    back_video = '';
                }
                if (videoAvatarArray[5] && videoAvatarArray[5] === '1') {
                    is_offset = 1;
                }
            } else {
                back_video = '';
            }
            if ($('#video_ai_voice').val()) {
                videoAvatarVoice = $('#video_ai_voice').val()
            }
            if ($('#is_audio').prop('checked')) {
                back_video = '';
                videoAvatar = '';
                language = ($('#language_audio').val()) ? $('#language_audio').val() : 'en';
                videoAvatarVoice = $('#video_ai_aidio_voice').val();
                videoAvatarName = $('#video_ai_aidio_voice option:selected').text();
            }
            if ($('#custom_avatar_id').val()) {
                videoAvatar = $('#custom_avatar_id').val();
            }
            if ($('#custom_avatar_name').val()) {
                videoAvatarName = $('#custom_avatar_name').val();
            }
            if ($('#custom_avatar_id').val()) {
                videoAvatarVoice = $('#custom_voice_id').val();
            }
            if ($('#videoScreen_exitMeetingDrop').val() == 1) {
                var exitMeeting = '';
            } else if ($('#videoScreen_exitMeetingDrop').val() == 2) {
                exitMeeting = 2;
            } else if ($('#videoScreen_exitMeetingDrop').val() == 3) {
                exitMeeting = $('#videoScreen_exitMeeting').val()
            }
            if ($Id) {
                var dataObj = { 'type': 'setvideoai', 'roomId': roomid, 'video_ai_avatar': videoAvatar, 'video_ai_name': videoAvatarName, 'video_ai_background': back_video, 'video_ai_quality': quality, 'datetime': datetime, 'duration': duration, 'exit_meeting': exitMeeting, 'inactivity_timeout': inactivity_timeout, 'video_ai_voice': videoAvatarVoice, 'video-element-back-img': video_file, 'video_ai_system': system, 'video_ai_tools': tools, 'language': language, 'ai_greeting_text': ai_greeting_text, 'is_context': $('#is_context').prop('checked'), 'is_subtitle': $('#is_subtitle').prop('checked'), 'is_recording': $('#is_recording').prop('checked'), 'is_audio': $('#is_audio').prop('checked'), 'video_ai_assistant': videoAssistant, 'video_ai_gender': videoAvatarGender, 'api_key': api_key, 'second_api_key': second_api_key, 'video_ai_layout': video_ai_layout, 'video_ai_suggestions': video_ai_suggestions, 'is_offset': is_offset, 'room_id': $Id };
            } else {
                dataObj = { 'type': 'setvideoai', 'roomId': roomid, 'video_ai_avatar': videoAvatar, 'video_ai_name': videoAvatarName, 'video_ai_background': back_video, 'video_ai_quality': quality, 'datetime': datetime, 'duration': duration, 'exit_meeting': exitMeeting, 'inactivity_timeout': inactivity_timeout, 'video_ai_voice': videoAvatarVoice, 'video-element-back-img': video_file, 'video_ai_system': system, 'video_ai_tools': tools, 'language': language, 'ai_greeting_text': ai_greeting_text, 'is_context': $('#is_context').prop('checked'), 'is_subtitle': $('#is_subtitle').prop('checked'), 'is_recording': $('#is_recording').prop('checked'), 'is_audio': $('#is_audio').prop('checked'), 'video_ai_assistant': videoAssistant, 'video_ai_gender': videoAvatarGender, 'api_key': api_key, 'second_api_key': second_api_key, 'video_ai_layout': video_ai_layout, 'video_ai_suggestions': video_ai_suggestions, 'is_offset': is_offset };
            }

            var formData = new FormData();
            for (var key in dataObj) {
                formData.append(key, dataObj[key]);
            }
            $.ajax({
                type: 'POST',
                processData: false,
                contentType: false,
                url: '../server/script.php',
                data: formData
            })
                .done(function (data) {
                    if (data) {
                        if (run === true) {
                            window.open($actual_link + roomid);
                        }
                        if ($Id) {
                            location.href = 'rooms.php';
                        } else {
                            $('#success').removeClass('d-none');
                            $('#success').html('<span data-localize="ai_room_created"></span><br><a href="' + $actual_link + roomid + '" target="_blank">' + $actual_link + roomid + '</a>');
                            var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                            $('[data-localize]').localize('dashboard', opts);
                            $(window).scrollTop(0);
                        }
                    } else {
                        $('#error').removeClass('d-none');
                        $('#error').html('<span data-localize="error_avatar_save"></span>');
                        var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                        $('[data-localize]').localize('dashboard', opts);
                    }
                })
                .fail(function (e) {
                    console.log(e);
                });
        }

        $('#saveAvatars').on('click', function (event) {
            saveOrRun(false);
        });
        $('#runAvatars').on('click', function (event) {
            saveOrRun(true);
        });

        const previewPhoto = (elem, input) => {
            const file = input.files;
            if (file) {
                const fileReader = new FileReader();
                var preview = elem;
                fileReader.onload = event => {
                    preview.setAttribute('src', event.target.result);
                }
                fileReader.readAsDataURL(file[0]);
            }
        }
        const input = document.getElementById('video-element-back-img');
        input.addEventListener('change', function () {
            previewPhoto(document.getElementById('video-element-back-preview'), input);
        });

        setLanguage();
        const folder = 'img/virtual/';

        function handleBacks(id, elem) {
            document.getElementById(elem + '-preview').setAttribute('src', '../' + folder + id);
            $('#' + elem + '-hidden').val(folder + id);
        }
        const backImages = document.getElementById('video-element-back-images');
        for (let i = 1; i <= 20; i++) {
            let img = document.createElement('img');
            img.setAttribute('src', '../' + folder + i + '.jpg');
            img.setAttribute('id', i + '.jpg');
            img.setAttribute('width', '80');
            img.setAttribute('style', 'cursor:pointer; padding: 2px;');
            backImages.append(img);
            img.addEventListener('click', function () {
                handleBacks(img.id, 'video-element-back');
            });
        }

        const predefined_ai_tools = {
            'getCurrentWeather': { 'tools_description': 'Get the current weather in a given location for specific date, today or tomorrow', 'tools_parameters': 'location,date,unit', 'need_api': true, 'api_info': 'Get API key from <a href="https://weather.visualcrossing.com" target="_blank">https://weather.visualcrossing.com</a>', 'avatar_system': 'Only call a tool when you are 100% sure you need to call it and have the required parameters to call it. Pass the parameters as you get them. If you are asked about today tomorrow or day of the week, call the tool with parameter as today tomorrow or day of the week. If asked for the background image, answer that this is an automatically generated background. Dates to be only for 2024.', 'second_need_api': 'Get API key for background images from <a href="https://api.unsplash.com/" target="_blank">https://api.unsplash.com/</a>' },
            'getPrice': { 'tools_description': 'Get the current price for a stock', 'tools_parameters': 'symbol', 'need_api': false, 'second_need_api': false },
            'getCurrency': { 'tools_description': 'Listen to currency and conversion', 'tools_parameters': 'currency,quantity', 'need_api': true, 'api_info': 'Get API key from <a href="https://v6.exchangerate-api.com" target="_blank">https://v6.exchangerate-api.com</a>' },
            'getHotels': { 'tools_description': 'Get hotels in city location', 'tools_parameters': 'city', 'need_api': true, 'api_info': 'Get API key from <a href="https://engine.hotellook.com" target="_blank">https://engine.hotellook.com</a>', 'second_need_api': 'Get API key for background images from <a href="https://api.unsplash.com/" target="_blank">https://api.unsplash.com/</a>' },
            'getNews': { 'tools_description': 'Get latest news by keywords', 'tools_parameters': 'keywords', 'need_api': true, 'api_info': 'Get API key from <a href="eventregistry.org" target="_blank">https://eventregistry.org</a>', 'second_name': 'getNewsDetailed', 'second_description': 'Get news by title and keywords', 'second_parameters': 'news,keywords' },
            'getAvailableTimeslots': { 'tools_description': 'Get available timeslots and free hours', 'tools_parameters': 'date', 'need_api': false, 'avatar_system': 'Only call a tool when you are 100% sure you need to call it and have the required parameters to call it. Pass the parameters as you get them. If you are asked about today tomorrow or day of the week, call the tool with parameter as today tomorrow or day of the week. Remember the date name or email and use them when asked to book a timeslot. Keep context of timeslot, date, name and email. Dates to be only for 2024', 'second_name': 'bookTimeslot', 'second_description': 'Book a timeslot availability with email and name', 'second_parameters': 'timeslot,date,email,name', 'greeting': 'Hello {{name}}, I am your booking assistant. Please open the chat and follow the instructions to check out booking demo.|Booking demo is divided into two parts. First you ask for availability, for example "Please give me available timeslots for tomorrow". You can use tomorrow, day of the week, or a date. After Angela tells you availability, you can book a timeslot using your email, name and timeslot in one sentence. For example "Please book the slot 10 am for John Smith with john@smith.com".' },
            'getYoutube': { 'tools_description': 'Get youtube videos by keywords', 'tools_parameters': 'keywords', 'need_api': true, 'api_info': 'Get from <a href="https://console.cloud.google.com/" target="_blank">https://console.cloud.google.com/</a> API token that is enabled for YouTube data', 'second_name': 'getYoutubeDetailed', 'second_description': 'Open YouTube video by ID', 'second_parameters': 'id' },
            'getNewsFeed': { 'tools_description': 'Get latest news', 'tools_parameters': 'news', 'need_api': true, 'api_info': 'Provide news feed URL', 'second_name': 'getNewsFeedDetailed', 'second_description': 'Get detailed news from RSS', 'second_parameters': 'news' }
        };

        $('#video_ai_tools').change(function (e) {
            $.each(predefined_ai_tools, function (i, val) {
                if (i === $('#video_ai_tools').val()) {
                    const avatar_system = $('#system').val();
                    $('input[name="tools_name[]"]').eq(0).val(i);
                    $('input[name="tools_description[]"]').eq(0).val(val.tools_description);
                    $('input[name="tools_parameters[]"]').eq(0).val(val.tools_parameters);
                    if (val.need_api) {
                        $('#video_ai_tools_api_div').removeClass('d-none');
                        $('#video_ai_tools_api_div_info').html(val.api_info);
                    } else {
                        $('#video_ai_tools_api_div').addClass('d-none');
                        $('#video_ai_tools_api_div_info').html('');
                    }
                    if (val.second_need_api) {
                        $('#video_ai_tools_second_api_div').removeClass('d-none');
                        $('#video_ai_tools_second_api_div_info').html(val.second_need_api);
                    } else {
                        $('#video_ai_tools_second_api_div').addClass('d-none');
                        $('#video_ai_tools_second_api_div_info').html('');
                    }
                    if (val.avatar_system) {
                        $('#system').val(val.avatar_system);
                    } else {
                        $('#system').val(avatar_system);
                    }
                    if (val.second_name && val.second_description && val.second_parameters) {
                        $('.clone').trigger('click');
                        $('input[name="tools_name[]"]').eq(1).val(val.second_name);
                        $('input[name="tools_description[]"]').eq(1).val(val.second_description);
                        $('input[name="tools_parameters[]"]').eq(1).val(val.second_parameters);
                    } else {
                        $('.remove').trigger('click');
                    }
                    if (val.greeting) {
                        $('#ai_greeting_text').val(val.greeting);
                    } else {
                        $('#ai_greeting_text').val('');
                    }
                }
                // $('#payment_method').val()
                // $data[val] = $('#' + val).val();
            });
        });

        var d = new Date();
        $('#datetime').datetimepicker({
            format: 'MM/DD/YYYY HH:mm',
            minDate: new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0),
            icons: {
                time: 'fa fa-clock',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-check',
                clear: 'fa fa-trash',
                close: 'fa fa-times'
            }
        });
        $('#videoScreen_exitMeeting').hide();
        $('#videoScreen_exitMeetingDrop').on('change', function () {
            if (this.value == 3) {
                $('#videoScreen_exitMeeting').show();
            } else {
                $('#videoScreen_exitMeeting').hide();
            }
        });
    }

    if ($base === 'agents.php') {
        $(document).on('click', '.deleteAgentRow', function (e) {
            var $btn = $(this);
            var $tr = $btn.closest('tr');
            var dataTableRow = dataTable.row($tr[0]);
            var rowData = dataTableRow.data();
            deleteItem(rowData.agent_id, 'agent', e);
        });

        var dataTable = $('#agents_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'asc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": { 'type': 'getagents' }
            },
            "columns": [
                {
                    "data": "username",
                    "name": "username",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "first_name",
                    "name": "first_name",
                    render: function (data, type, row) {
                        return row.first_name + ' ' + row.last_name;
                    }
                },
                {
                    "data": "tenant",
                    "data": "tenant",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "email",
                    "name": "email",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "agent_id",
                    "orderable": false,
                    render: function (data, type, row) {
                        if (row.is_master == 1) {
                            var link = '<a href="agent.php?id=' + row.agent_id + '" data-localize="edit"></a>';
                            if ($master_tenant && row.username !== 'admin') {
                                var link = '<a href="agent.php?id=' + row.agent_id + '" data-localize="edit"></a> | <a href="#" class="deleteAgentRow" data-localize="delete"></a>';
                            } else {
                                link = '<a href="agent.php?id=' + row.agent_id + '" data-localize="edit"></a>';
                            }
                        } else {
                            link = '<a href="agent.php?id=' + row.agent_id + '" data-localize="edit"></a> | <a href="#" class="deleteAgentRow" data-localize="delete"></a>';
                        }
                        return link;
                    }
                }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }

    if ($base === 'chats.php') {
        $('#chats_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'desc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": { 'type': 'getchats', 'agentId': agentId }
            },
            "columns": [
                {
                    "data": "date_created",
                    render: function (data, type, row) {
                        var datea = getCurrentDateFormatted(row.date_created + ' UTC');
                        return datea;
                    }
                },
                { "data": "room_id" },
                { "data": "messages", "orderable": false },
                { "data": "agent", "orderable": false }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }

    if ($base === 'rooms.php') {
        $(document).on('click', '.deleteClassRow', function (e) {
            var $btn = $(this);
            var $tr = $btn.closest('tr');
            var dataTableRow = dataTable.row($tr[0]);
            var rowData = dataTableRow.data();
            deleteItem(rowData.room_id, 'room', e);
        });

        var dataTable = $('#rooms_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'desc']],
            "processing": true,
            "serverSide": true,
            "createdRow": function (row, data, index) {
                $('td', row).eq(0).attr('id', 'roomid_' + data.roomId);

            },
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": { 'type': 'getrooms', 'agentId': agentId }
            },
            "columns": [
                {
                    "data": "roomId",
                    "name": "roomId",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "agent",
                    "name": "agent",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "roomId",
                    "name": "roomId",
                    render: function (data, type, row) {
                        let link = '<a target="_blank" title="Conference agent URL" href="' + $actual_link + row.roomId + '" data-localize="start"></a> | <a title="Conference agent URL" href="#" onclick="copyUrl(\'' + $actual_link + row.roomId + '\', \'infoModalLabelAgent\');" data-localize="copy"></a>';
                        return link;
                    }
                },
                {
                    "data": "room_id",
                    "orderable": false,
                    render: function (data, type) {
                        let link = '';
                        if ($admin_tenant || $master_tenant) {
                            link = '<a href="videoai.php?id=' + data + '" data-localize="edit"></a> | <a href="#" class="deleteClassRow" data-localize="delete"></a>';
                        }
                        return link;
                    }
                }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }

    if ($base === 'videologs.php') {
        $('#logs_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'desc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": { 'type': 'getlogs', 'agentId': agentId }
            },
            "columns": [
                { "data": "date_created" },
                { "data": "room_id" },
                { "data": "messages", "orderable": false },
                { "data": "agent", "orderable": false }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }

    if ($base === 'dash.php') {
        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getrooms', 'agentId': agentId }
        })
            .done(function (data) {
                if (data) {
                    var result = JSON.parse(data);
                    $('#roomsCount').html(result.recordsTotal);
                }
            })
            .fail(function () {
                console.log(false);
            });
        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getagents', 'agentId': agentId }
        })
            .done(function (data) {
                if (data) {
                    var result = JSON.parse(data);
                    $('#agentsCount').html(result.recordsTotal);
                }
            })
            .fail(function () {
                console.log(false);
            });
        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getusers', 'agentId': agentId }
        })
            .done(function (data) {
                if (data) {
                    var result = JSON.parse(data);
                    $('#usersCount').html(result.recordsTotal);
                }
            })
            .fail(function () {
                console.log(false);
            });
        $.ajaxSetup({ cache: false });
        $.getJSON('https://www.new-dev.com/versionai/version.json', function (data) {
            if (data) {
                var currentVersion = $currentVersion;
                var newNumber = data.version.split('.');
                var curNumber = currentVersion.split('.');
                var isNew = false;
                if (parseInt(curNumber[0]) < parseInt(newNumber[0])) {
                    isNew = true;
                }
                if (parseInt(curNumber[0]) == parseInt(newNumber[0]) && parseInt(curNumber[1]) < parseInt(newNumber[1])) {
                    isNew = true;
                }
                if (parseInt(curNumber[0]) == parseInt(newNumber[0]) && parseInt(curNumber[1]) == parseInt(newNumber[1]) && parseInt(curNumber[2]) < parseInt(newNumber[2])) {
                    isNew = true;
                }

                if (isNew) {
                    if ($master_tenant) {
                        $('#remoteVersion').html('<span data-localize="new_lsv_version"></span>' + data.version + '<br/><br/><span data-localize="new_lsv_features"></span><br/>' + data.text + '<br/><br/><span data-localize="update_location"></span>');
                    } else {
                        $('#remoteVersion').html('<span data-localize="new_lsv_version"></span>' + data.version + '<br/><br/><span data-localize="new_lsv_features"></span><br/>' + data.text);
                    }
                } else {
                    $('#remoteVersion').html('<span data-localize="version_uptodate"></span>');
                }

            } else {
                $('#remoteVersion').html('<span data-localize="cannot_connect"></span>');
            }
            var opts = {
                language: 'en', pathPrefix: 'locales', loadBase: true, callback: function (data, defaultCallback) {
                    document.title = data.title;
                    defaultCallback(data);
                }
            };
            $('[data-localize]').localize('dashboard', opts);
        });
    }

    if ($base === 'paymentoptions.php') {
        $('#error').hide();
        $(".answer").hide();
        $('#email_notification').click(function () {
            if ($(this).is(":checked")) {
                $('#email_templates').show();
            } else {
                $('#email_templates').hide();
            }
        });
        $('#saveOptions').click(function (event) {
            var dataObj = {
                'type': 'updatepaymentoption',
                'is_enabled': $('#is_enabled').prop('checked'),
                'paypal_client_id': $('#paypal_client_id').val(),
                'paypal_secret_id': $('#paypal_secret_id').val(),
                'stripe_client_id': $('#stripe_client_id').val(),
                'stripe_secret_id': $('#stripe_secret_id').val(),
                'authorizenet_api_login_id': $('#authorizenet_api_login_id').val(),
                'authorizenet_transaction_key': $('#authorizenet_transaction_key').val(),
                'authorizenet_public_client_key': $('#authorizenet_public_client_key').val(),
                'email_notification': $('#email_notification').prop('checked'),
                'is_test_mode': $('#is_test_mode').prop('checked'),
                'authorizenet_enabled': $('#authorizenet_enabled').prop('checked'),
                'paypal_enabled': $('#paypal_enabled').prop('checked'),
                'stripe_enabled': $('#stripe_enabled').prop('checked'),
                'email_subject': $('#email_subject').val(),
                'email_body': $('#email_body').val(),
                'email_from': $('#email_from').val(),
                'email_day_notify': $('#email_day_notify').val()
            };
            $.ajax({
                type: 'POST',
                cache: false,
                dataType: 'json',
                url: '../server/script.php',
                data: dataObj
            })
                .done(function (data) {
                    if (data) {
                        location.href = 'paymentoptions.php';
                    } else {
                        $('#error').show();
                        $('#error').html('<span data-localize="error_config_save"></span>');
                        var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                        $('[data-localize]').localize('dashboard', opts);
                    }
                })
                .fail(function (e) {
                    console.log(e);
                });
        });

        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getpaymentoptions' }
        })
            .done(function (data) {
                if (data) {
                    data = JSON.parse(data);
                    $('#paypal_client_id').val(data.paypal_client_id);
                    $('#paypal_secret_id').val(data.paypal_secret_id);
                    $('#stripe_client_id').val(data.stripe_client_id);
                    $('#stripe_secret_id').val(data.stripe_secret_id);
                    $('#authorizenet_api_login_id').val(data.authorizenet_api_login_id);
                    $('#authorizenet_transaction_key').val(data.authorizenet_transaction_key);
                    $('#authorizenet_public_client_key').val(data.authorizenet_public_client_key);
                    $('#email_subject').val(data.email_subject);
                    $('#email_body').val(data.email_body);
                    $('#email_from').val(data.email_from);
                    $('#email_day_notify').val(data.email_day_notify);
                    $('#is_enabled').prop('checked', (data.is_enabled == '1'));
                    $('#email_notification').prop('checked', (data.email_notification == '1'));
                    $('#is_test_mode').prop('checked', (data.is_test_mode == '1'));
                    $('#authorizenet_enabled').prop('checked', (data.authorizenet_enabled == '1'));
                    $('#paypal_enabled').prop('checked', (data.paypal_enabled == '1'));
                    $('#stripe_enabled').prop('checked', (data.stripe_enabled == '1'));
                    if (data.email_notification == '1') {
                        $('#email_templates').show();
                    } else {
                        $('#email_templates').hide();
                    }
                }
            })
            .fail(function (e) {
                console.log(e);
            });
    }

    if ($base === 'plans.php') {
        $(document).on('click', '.deletePlanRow', function (e) {
            var $btn = $(this);
            var $tr = $btn.closest('tr');
            var dataTableRow = dataTable.row($tr[0]);
            var rowData = dataTableRow.data();
            deleteItem(rowData.plan_id, 'plan', e);
        });

        var dataTable = $('#plans_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'asc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": { 'type': 'getplans' }
            },
            "columns": [

                {
                    "data": "name",
                    "name": "name",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "price",
                    "name": "price",
                    render: function (data, type, row) {
                        var link = row.price + ' ' + row.currency;
                        return link;
                    }
                },
                {
                    "data": "interval",
                    "name": "interval",
                    // render: function (data, type) {
                    //     return data;
                    // }
                    render: function (data, type, row) {
                        var link = row.interval_count + ' <span data-localize="' + row.interval + '"></span>';
                        return link;
                    }
                },
                {
                    "data": "plan_id",
                    "orderable": false,
                    render: function (data, type) {
                        var link = '<a href="plan.php?id=' + data + '" data-localize="edit"></a> | <a href="#" class="deletePlanRow" data-localize="delete"></a>';
                        return link;
                    }
                }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }
    if ($base === 'plan.php') {
        $('#error').hide();
        $('#savePlan').click(function (event) {
            if ($Id) {
                var dataObj = { 'type': 'editplan', 'planId': $Id, 'name': $('#name').val(), 'price': $('#price').val(), 'currency': $('#currency').val(), 'interval': $('#interval').val(), 'interval_count': $('#interval_count').val(), 'description': $('#description').val() };
            } else {
                dataObj = { 'type': 'addplan', 'name': $('#name').val(), 'price': $('#price').val(), 'currency': $('#currency').val(), 'interval': $('#interval').val(), 'interval_count': $('#interval_count').val(), 'description': $('#description').val() };
            }
            $.ajax({
                type: 'POST',
                url: '../server/script.php',
                data: dataObj
            })
                .done(function (data) {
                    if (data) {
                        location.href = 'plans.php';
                    } else {
                        $('#error').show();
                        $('#error').html('<span data-localize="error_plan_save"></span>');
                        var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                        $('[data-localize]').localize('dashboard', opts);
                    }
                })
                .fail(function (e) {
                    console.log(e);
                });
        });
        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getplan', 'id': $Id }
        })
            .done(function (data) {
                if (data) {
                    data = JSON.parse(data);
                    $('#name').val(data.name);
                    $('#price').val(data.price);
                    $('#currency').val(data.currency);
                    $('#interval').val(data.interval);
                    $('#interval_count').val(data.interval_count);
                    $('#description').val(data.description);
                    var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                    $('[data-localize]').localize('dashboard', opts);
                }
            })
            .fail(function (e) {
                console.log(e);
            });
    }
    if ($base === 'subscriptions.php') {
        $(document).on('click', '.deleteSubscriptionRow', function (e) {
            var $btn = $(this);
            var $tr = $btn.closest('tr');
            var dataTableRow = dataTable.row($tr[0]);
            var rowData = dataTableRow.data();
            deleteItem(rowData.subscription_id, 'subscription', e);
        });

        var dataTable = $('#subscriptions_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'desc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": { 'type': 'getsubscriptions' }
            },
            "columns": [

                {
                    "data": "payer_name",
                    "name": "payer_name",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "payer_email",
                    "name": "payer_email",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "valid_from",
                    "name": "valid_from",
                    // render: function (data, type) {
                    //     return data;
                    // }
                    render: function (data, type, row) {
                        var link = getCurrentDateFormatted(row.valid_from, 'mediumDate') + ' - ' + getCurrentDateFormatted(row.valid_to, 'mediumDate');
                        return link;
                    }
                },
                {
                    "data": "status",
                    "name": "status",
                    // render: function (data, type) {
                    //     return data;
                    // }
                    render: function (data, type, row) {
                        var link = row.payment_status;
                        if ((new Date(row.valid_to).getTime() < new Date().getTime() && row.subscr_interval !== 'N') || (row.subscr_interval === 'N' && row.subscr_interval_count === 0)) {
                            var bar = '<i class="fas fa-fw fa-minus" style="color:red;"></i> ';
                            link = '<span data-localize="expired"></span>'
                        } else {
                            bar = '<i class="fas fa-fw fa-check" style="color:green;"></i> ';
                        }
                        return bar + link;
                    }
                },
                {
                    "data": "tenant",
                    "name": "tenant",
                    render: function (data, type, row) {
                        if ($master_tenant) {
                            return '<a href="history.php?tenant=' + row.tenant + '">' + row.tenant + '</a>';
                        } else {
                            return row.tenant;
                        }
                    }
                },
                {
                    "data": "subscription_id",
                    "orderable": false,
                    render: function (data, type) {
                        var link = '<a href="subscription.php?id=' + data + '" data-localize="edit"></a> | <a href="#" class="deleteSubscriptionRow" data-localize="delete"></a>';
                        return link;
                    }
                }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }
    if ($base === 'subscription.php') {
        $('#error').hide();
        $('#saveSubscription').click(function (event) {
            if ($Id) {
                var valid_from = ($('#valid_from').val()) ? new Date($('#valid_from').val()).toISOString().slice(0, 19).replace('T', ' ') : '';
                var valid_to = ($('#valid_to').val()) ? new Date($('#valid_to').val()).toISOString().slice(0, 19).replace('T', ' ') : '';
                var dataObj = { 'type': 'editsubscription', 'subscriptionId': $Id, 'valid_from': valid_from, 'valid_to': valid_to };
            }
            $.ajax({
                type: 'POST',
                url: '../server/script.php',
                data: dataObj
            })
                .done(function (data) {
                    if (data) {
                        location.href = 'subscriptions.php';
                    } else {
                        $('#error').show();
                        $('#error').html('<span data-localize="error_plan_save"></span>');
                        var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                        $('[data-localize]').localize('dashboard', opts);
                    }
                })
                .fail(function (e) {
                    console.log(e);
                });
        });
        $.ajax({
            type: 'POST',
            url: '../server/script.php',
            data: { 'type': 'getsubscription', 'id': $Id }
        })
            .done(function (data) {
                if (data) {
                    data = JSON.parse(data);
                    const options = {
                        year: "numeric",
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    };
                    $('#agent_name').html(data.first_name + ' ' + data.last_name);
                    $('#plan_name').html(data.name);
                    $('#payment_method').html(data.payment_method);
                    $('#payment_id').html(data.payment_id);
                    $('#txn_id').html(data.txn_id);
                    $('#paid_amount').html(data.amount + ' ' + data.currency);
                    $('#payment_status').html(data.payment_status);
                    $('#ipn_track_id').html(data.ipn_track_id);
                    $('#payer_name').html(data.payer_name);
                    $('#payer_email').html(data.payer_email);
                    let valid_from_dt = new Date(data.valid_from);
                    var formatted_valid_from = new Intl.DateTimeFormat("en-US", options).format(valid_from_dt);
                    $('#valid_from').val(formatted_valid_from);
                    let valid_to_dt = new Date(data.valid_to);
                    var formatted_valid_to = new Intl.DateTimeFormat("en-US", options).format(valid_to_dt);
                    $('#valid_to').val(formatted_valid_to);
                    $('#subscr_interval').html(data.subscr_interval);
                    $('#subscr_interval_count').html(data.subscr_interval_count);
                    var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                    $('[data-localize]').localize('dashboard', opts);
                }
            })
            .fail(function (e) {
                console.log(e);
            });

        $('#valid_from').datetimepicker({
            format: 'MM/DD/YYYY, HH:mm',
            icons: {
                time: 'fa fa-clock',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-check',
                clear: 'fa fa-trash',
                close: 'fa fa-times'
            }
        });

        $('#valid_to').datetimepicker({
            format: 'MM/DD/YYYY HH:mm',
            icons: {
                time: 'fa fa-clock',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-check',
                clear: 'fa fa-trash',
                close: 'fa fa-times'
            }
        });
    }
    if ($base === 'subscribe.php') {
        $('#stripe_payment').hide();
        $('#authorizenet_payment').hide();
        $('#manual').hide();
        $('input:radio').click(function () {
            $('#price').val($(this).attr('data-price'));
            $('#currency').val($(this).attr('data-currency'));
            $('#item_name').val($(this).attr('data-item_name'));
        });
        $('#payment_method').change(function () {
            if ($('#payment_method').val() === 'stripe') {
                $('#stripe_payment').show();
                $('#authorizenet_payment').hide();
                $('#manual').hide();
            } else if ($('#payment_method').val() === 'authorizenet') {
                $('#stripe_payment').hide();
                $('#authorizenet_payment').show();
                $('#manual').hide();
            } else if ($('#payment_method').val() === 'manual') {
                $('#manual').show();
                $('#stripe_payment').hide();
                $('#authorizenet_payment').hide();
            } else {
                $('#stripe_payment').hide();
                $('#authorizenet_payment').hide();
                $('#manual').hide();
            }
        });
        $('#submitButton').click(function (e) {
            $('#error').addClass('d-none');
            e.preventDefault();
            var allok = $('#item_name').val() && $('#price').val() && $('#currency').val;
            if (allok) {
                $('#payment-form').submit();
            } else {
                $('#error').removeClass('d-none');
                $('#error').html('<span data-localize="error_payment_noplan"></span>');
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }
    if ($base === 'history.php') {
        var data = { 'type': 'gethistory' };
        if ($master_tenant && $gettenant) {
            data.tenant = $gettenant;
        }

        var dataTable = $('#history_table').DataTable({
            "pagingType": "numbers",
            "order": [[0, 'desc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": data
            },
            "columns": [

                {
                    "data": "payment_id",
                    "name": "payment_id",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "payer_name",
                    "name": "payer_name",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "payer_email",
                    "name": "payer_email",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "valid_from",
                    "name": "valid_from",
                    // render: function (data, type) {
                    //     return data;
                    // }
                    render: function (data, type, row) {
                        var link = getCurrentDateFormatted(row.valid_from, 'longDate') + ' - ' + getCurrentDateFormatted(row.valid_to, 'longDate');
                        return link;
                    }
                },
                {
                    "data": "payment_status",
                    "name": "payment_status",
                    render: function (data, type, row) {
                        var link = row.payment_status;
                        if ((new Date(row.valid_to).getTime() < new Date().getTime() && row.subscr_interval !== 'N') || (row.subscr_interval === 'N' && row.subscr_interval_count === 0)) {
                            var bar = '<i class="fas fa-fw fa-minus" style="color:red;"></i> ';
                            link = '<span data-localize="expired"></span>'
                        } else {
                            bar = '<i class="fas fa-fw fa-check" style="color:green;"></i> ';
                        }
                        return bar + link;
                    }
                },
                {
                    "data": "name",
                    "name": "name",
                    // render: function (data, type) {
                    //     return data;
                    // }
                    render: function (data, type, row) {
                        if ($master_tenant) {
                            var link = '<a href="plan.php?id=' + row.plan_id + '">' + row.name + '</a>';
                        } else {
                            link = row.name;
                        }
                        return link;
                    }
                }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = { language: 'en', pathPrefix: 'locales', loadBase: true };
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }

    if ($base === 'recordings.php') {
        $(document).on('click', '.deleteRecordingRow', function (e) {
            var $btn = $(this);
            var $tr = $btn.closest('tr');
            var dataTableRow = dataTable.row($tr[0]);
            var rowData = dataTableRow.data();
            deleteItem(rowData.recording_id, 'recording', e);
        });

        var dataTable = $('#recordings_table').DataTable({
            "pagingType": "numbers",
            "order": [[3, 'desc']],
            "processing": true,
            "serverSide": true,
            "ajax": {
                "url": "../server/script.php",
                "type": "POST",
                "data": {'type': 'getrecordings'}
            },
            "columns": [

                {
                    "data": "filename",
                    "name": "filename",
                    render: function (data, type) {
                        return '<a href="../server/recordings/' + data + '" target="_blank">' + data + '</a>';
                    }
                },
                {
                    "data": "room_id",
                    "name": "room_id",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "agent_id",
                    "name": "agent_id",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "date_created",
                    "name": "date_created",
                    render: function (data, type) {
                        return data;
                    }
                },
                {
                    "data": "recording_id",
                    "orderable": false,
                    render: function (data, type, row) {
                        var link = '<a href="../server/recordings/' + row.filename + '" target="_blank" data-localize="view"></a> | <a href="#" class="deleteRecordingRow" data-localize="delete"></a>';
                        return link;
                    }
                }
            ],
            "language": {
                "url": "locales/table.json"
            },
            "drawCallback": function (settings) {
                var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                $('[data-localize]').localize('dashboard', opts);
            }
        });
    }
})(jQuery);
