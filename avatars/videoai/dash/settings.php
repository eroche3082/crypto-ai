<?php
include_once 'header.php';
$heygen = (isset($apiKeyHeygenStream) && $apiKeyHeygenStream) ? $apiKeyHeygenStream : $apiKeyHeygen;
?>

<h1 class="h3 mb-2 text-gray-800" id="localeTitle"><span data-localize="configurations"></span></h1>
<div id="error" class="d-none alert alert-danger"></div>
<div id="success" class="d-none alert alert-success"></div>
<?php if ($masterTenant) { ?>

    <div class="row">
        <div class="col-lg-6">
            <div class="p-1">
                <br/>
                <form class="user">

                    <div class="form-group">
                        <label for="openai_key"><p data-localize="openai_key"></p></label>
                        <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="openai_key_info"></i>
                        <input type="text" class="form-control" id="openai_key" aria-describedby="openai_key" value="<?php echo $apiKeyChatGpt;?>">
                        <input type="hidden" class="form-control" id="old_openai_key" value="<?php echo $apiKeyChatGpt;?>">
                    </div>
                    <div class="form-group">
                        <label for="openai_model"><p data-localize="openai_model"></p></label>
                        <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="openai_model_info"></i>
                        <input type="text" class="form-control" id="openai_model" aria-describedby="openai_model" value="<?php echo $chatGptModel;?>">
                        <input type="hidden" class="form-control" id="old_openai_model" value="<?php echo $chatGptModel;?>">
                    </div>
                    <div class="form-group">
                        <label for="heygen_key"><p data-localize="heygen_key"></p></label>
                        <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="heygen_key_info"></i>
                        <input type="text" class="form-control" id="heygen_key" aria-describedby="heygen_key" value="<?php echo $heygen;?>">
                        <input type="hidden" class="form-control" id="old_heygen_key" value="<?php echo $heygen;?>">
                    </div>
                    <div class="form-group">
                        <label for="elevenlabs_key"><p data-localize="elevenlabs_key"></p></label>
                        <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="elevenlabs_key_info"></i>
                        <input type="text" class="form-control" id="elevenlabs_key" aria-describedby="elevenlabs_key" value="<?php echo $apiKeyElevenLabs;?>">
                        <input type="hidden" class="form-control" id="old_elevenlabs_key" value="<?php echo $apiKeyElevenLabs;?>">
                    </div>
                    <a href="javascript:void(0);" id="saveSetting" class="btn btn-primary btn-user btn-block" data-localize="save">

                    </a>
                    <hr>


                </form>

            </div>

        </div>
    </div>

<?php } ?>
<?php
include_once 'footer.php';
