$('#loginbutton').on('click', function (event) {
    event.preventDefault();
    $("#error").addClass('d-none');
    $("#codeInfo").addClass('d-none');
    if (!$("#code").val()) {
        $("#error").removeClass('d-none');
        $('#error').html('<span data-localize="purchase_code_mandatory"></span>');
        var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
        $('[data-localize]').localize('dashboard', opts);
        return false;
    }
    $.ajax({
        url: "https://www.new-dev.com/versionai/activate1.php",
        type: "POST",
        dataType: 'json',
        data: {code: $("#code").val(), url: $actual_link},
        success: function (data) {
            $("#error").addClass('d-none');
            if (data) {
                $.ajax({
                    type: 'POST',
                    url: '../server/activate.php',
                    data: {'type': 'setpk', 'value': data.ct, 'license': data.licesne}
                })
                        .done(function () {
                            $("#codeInfo").removeClass('d-none');
                            $('#codeInfo').html('<span data-localize="product_activated"></span>');
                            var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                            $('[data-localize]').localize('dashboard', opts);
                            setTimeout(function () {
                                window.location = 'dash.php';
                            }, 3000);
                        })
                        .fail(function () {
                            $('#error').removeClass('d-none');
                            $('#error').html('<span data-localize="product_not_activated"></span>');
                            var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                            $('[data-localize]').localize('dashboard', opts);
                        });
            } else {
                $('#error').removeClass('d-none');
                $('#error').html('<span data-localize="invalid_purchase_code"></span>');
                var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                $('[data-localize]').localize('dashboard', opts);
            }
        },
        error: function (e) {
            $('#error').removeClass('d-none');
            $('#error').html('<span data-localize="invalid_purchase_code"></span>');
            var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
            $('[data-localize]').localize('dashboard', opts);
        }
    });
});

var resetForm = function () {
    $("#updateform").removeClass('d-none');
    $("#waiting").addClass('d-none');
    $("#error").addClass('d-none');
    $("#update_info").removeClass('d-none');
    $("#updateform").prop("disabled", false);
};

$('#update_button').on('click', function (event) {
    event.preventDefault();
    $("#error").addClass('d-none');
    $("#codeInfo").addClass('d-none');
    $("#update_info").addClass('d-none');
    $("#updateform").addClass('d-none');
    $("#waiting").removeClass('d-none');

    if (!$("#code").val()) {
        $("#error").removeClass('d-none');
        $('#error').html('<span data-localize="purchase_code_mandatory"></span>');
        resetForm();
        var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
        $('[data-localize]').localize('dashboard', opts);
        return false;
    }
    $.ajax({
        url: "https://www.new-dev.com/versionai/update.php",
        type: "POST",
        data: {code: $("#code").val(), url: $actual_link},
        success: function (data) {
            $("#error").addClass('d-none');
            if (data) {
                if (data == '200') {
                    resetForm();
                    $("#codeInfo").removeClass('d-none');
                    $('#codeInfo').html('<span data-localize="product_nothing_toupdate"></span>');
                    var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                    $('[data-localize]').localize('dashboard', opts);
                } else {
                    $.ajax({
                        type: 'POST',
                        url: '../server/activate.php',
                        data: {'type': 'update', 'value': data}
                    })
                            .done(function (val) {
                                if (val) {
                                    $("#codeInfo").removeClass('d-none');
                                    $('#codeInfo').html('<span data-localize="product_updated"></span><br/><br/>' + val + '<br/><span data-localize="product_updated_zip"></span>');
                                    resetForm();
                                    var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                                    $('[data-localize]').localize('dashboard', opts);
                                } else {
                                    $("#waiting").addClass('d-none');
                                    $('#error').removeClass('d-none');
                                    $('#error').html('<span data-localize="product_update_failed"></span>');
                                    var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                                    $('[data-localize]').localize('dashboard', opts);
                                }
                            })
                            .fail(function () {
                                resetForm();
                                $('#error').removeClass('d-none');
                                $('#error').html('<span data-localize="product_update_failed"></span>');
                                var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                                $('[data-localize]').localize('dashboard', opts);
                            });
                }
            } else {
                resetForm();
                $('#error').removeClass('d-none');
                $('#error').html('<span data-localize="invalid_purchase_code"></span>');
                var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
                $('[data-localize]').localize('dashboard', opts);
                $.ajax({
                    type: 'POST',
                    url: '../server/activate.php',
                    data: {'type': 'delete'}
                })
            }
        },
        error: function (e) {
            resetForm();
            $('#error').removeClass('d-none');
            $('#error').html('<span data-localize="invalid_purchase_code"></span>');
            var opts = {language: 'en', pathPrefix: 'locales', loadBase: true};
            $('[data-localize]').localize('dashboard', opts);
            $.ajax({
                type: 'POST',
                url: '../server/activate.php',
                data: {'type': 'delete'}
            })
        }
    });
});