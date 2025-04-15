jQuery(document).ready(function ($) {
    "use strict";
    $('#loginbutton').on('click', function (event) {
        event.preventDefault();
        $("#error").addClass('d-none');
        if (!$("#username").val() || !$("#password").val()) {
            $("#error").removeClass('d-none');
            $("#error").html("Please fill in username and password");
            return false;
        }
        $.ajax({
            url: "../server/script.php",
            type: "POST",
            data: {type: 'loginagent', username: $("#username").val(), password: $("#password").val()},
            success: function (data) {
                if (data) {
                    window.location.href = "dash.php"
                } else {
                    $("#error").removeClass('d-none');
                    $("#error").html("Invalid Credentials");
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });

    $('#recoverbutton').on('click', function (event) {
        event.preventDefault();
        $("#error").addClass('d-none');
        $("#message").addClass('d-none');
        if (!$('#email').val() || !$('#username').val()) {
            $("#message").addClass('d-none');
            $("#error").removeClass('d-none');
            $("#error").html("Email and username are mandatory fields");
            return false;
        }
        var dataObj = {'type': 'recoverpassword', 'email': $('#email').val(), 'username': $('#username').val()};
        $.ajax({
            url: "../server/script.php",
            type: "POST",
            data: dataObj,
            success: function (data) {
                if (data) {
                    $("#message").removeClass('d-none');
                    $("#error").addClass('d-none');
                    $("#message").html("We have sent instructions to your email how to reset your account");
                } else {
                    $("#message").addClass('d-none');
                    $("#error").removeClass('d-none');
                    $("#error").html("Invalid Data");
                }
            },
            error: function (e) {
                $("#message").addClass('d-none');
                $("#error").removeClass('d-none');
                $("#error").html("Invalid Data");                    }
        });
    });

    $('#changebutton').on('click', function (event) {
        event.preventDefault();
        $("#error").addClass('d-none');
        $("#message").addClass('d-none');
        if (!$('#password').val() || !$('#password_again').val()) {
            $("#message").addClass('d-none');
            $("#error").removeClass('d-none');
            $("#error").html("Passwords are mandatory fields");
            return false;
        }
        if ($('#password').val() !== $('#password_again').val()) {
            $("#message").addClass('d-none');
            $("#error").removeClass('d-none');
            $("#error").html("Passwords do not match");
            return false;
        }
        var dataObj = {'type': 'resetpassword', 'token': $('#token').val(), 'password': $('#password').val()};
        $.ajax({
            url: "../server/script.php",
            type: "POST",
            data: dataObj,
            success: function (data) {
                if (data) {
                    $("#message").removeClass('d-none');
                    $("#error").addClass('d-none');
                    $("#message").html("Your password was successfully changed. Please go to <a href='loginform.php'>login page</a> to authorize.");
                } else {
                    $("#message").addClass('d-none');
                    $("#error").removeClass('d-none');
                    $("#error").html("Invalid Data");
                }
            },
            error: function (e) {
                $("#message").addClass('d-none');
                $("#error").removeClass('d-none');
                $("#error").html("Invalid Data");
            }
        });
    });

    $('#regbutton').on('click', function (event) {
        event.preventDefault();
        $("#error").addClass('d-none');
        if (!$("#username").val() || !$("#password").val() || !$('#email').val() || !$('#tenant').val()) {
            $("#error").removeClass('d-none');
            $("#error").html("Username, password, email and teannt are mandatory fields");
            return false;
        }


        var regex = /^[\w.]+$/i
        var isValid = regex.test($('#tenant').val());
        if (!isValid) {
            $("#error").removeClass('d-none');
            $("#error").html("Only alphabets, numbers and underscore symbols allowed");
            return false;
        }
        var dataObj = {'type': 'addagent', 'username': $('#username').val(), 'firstName': $('#first_name').val(), 'lastName': $('#last_name').val(), 'tenant': $('#tenant').val(), 'email': $('#email').val(), 'password': $('#password').val(), 'is_master': 1};
        $.ajax({
            url: "../server/script.php",
            type: "POST",
            data: dataObj,
            success: function (data) {
                if (data) {
                    window.location.href = "loginform.php"
                } else {
                    $("#error").removeClass('d-none');
                    $("#error").html("Invalid Data");
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    });
});