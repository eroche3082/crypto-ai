<?php
include_once 'header.php';
?>

<h1 class="h3 mb-2 text-gray-800" id="localeTitle"><span data-localize="locales"></span> - <?php
    $fileLocale = 'en_US';
    echo $fileLocale;
    ?></h1>
<div id="error" class="d-none alert alert-danger"></div>
<?php if ($masterTenant) { ?>

    <div class="row">
        <div class="col-sm-12">
            <div class="p-1">
                <h6 data-localize="locales_info"></h6>
                <br/>
                <form class="user">

                    <div id="localeStrings"></div>

                    <a href="javascript:void(0);" id="saveLocale" class="btn btn-primary btn-user btn-block" data-localize="save">

                    </a>
                    <hr>


                </form>

            </div>

        </div>
    </div>

<?php } ?>
<?php
include_once 'footer.php';
