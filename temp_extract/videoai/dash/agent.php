<?php
include_once 'header.php';
?>
<h1 class="h3 mb-2 text-gray-800" id="agentTitle" data-localize="agent"></h1>
<div id="error" class="d-none alert alert-danger"></div>
<?php
$id = isset($_GET['id']) ? $_GET['id'] : null;
$array = [$id];
$stmt = $pdo->prepare("SELECT * FROM " . $dbPrefix . "agents WHERE `agent_id`= ?");
$stmt->execute($array);
$user = $stmt->fetch();
$userTenant = '';
if ($user) {
    $userTenant = $user['tenant'];
}

if ($adminTenant || !$id || ($id == $_SESSION["agent"]['agent_id']) || ($masterTenant && $userTenant === $tenant)) { ?>

    <div class="row">
        <div class="col-lg-5">
            <div class="p-1">

                <form class="user">

                    <div class="form-group">
                        <label for="first_name"><p data-localize="first_name"></p></label>
                        <input type="text" class="form-control" id="first_name" aria-describedby="first_name">
                    </div>
                    <div class="form-group">
                        <label for="last_name"><p data-localize="last_name"></p></label>
                        <input type="text" class="form-control" id="last_name" aria-describedby="last_name">
                    </div>
                    <?php if ($masterTenant || $adminTenant) { ?>
                        <div class="form-group">
                            <label for="email"><p data-localize="email"></p></label>
                            <input type="text" class="form-control" id="email" aria-describedby="email">
                        </div>
                        <div class="form-group">
                            <label for="tenant"><p data-localize="tenant"></p></label>
                            <input type="text" class="form-control" id="tenant" <?php echo ($_SESSION["tenant"] != 'lsv_mastertenant') ? 'disabled' : '';?> aria-describedby="tenant" value="<?php echo ($_SESSION["tenant"] != 'lsv_mastertenant') ? $_SESSION["tenant"] : '';?>">
                        </div>
                        <div class="form-group" id="usernameDiv">
                            <label for="first_name"><p data-localize="username"></p></label>
                            <input type="text" class="form-control" id="username" aria-describedby="username">
                        </div>
                        <?php if ($adminTenant) { ?>
                        <div class="form-group">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" checked id="payment_enabled" value="1">
                                <label class="custom-control-label" for="payment_enabled" data-localize="payment_enabled"></label>
                            </div>
                        </div>
                        <?php }  ?>
                    <?php } else { ?>
                        <input type="hidden" class="form-control" id="email">
                        <input type="hidden" class="form-control" id="tenant">
                        <input type="hidden" class="form-control" id="username">
                    <?php } ?>
                    <div class="form-group">
                        <label for="password"><p><span data-localize="password"></span> <span id="leftblank"></span></p></label>
                        <input type="password" class="form-control" id="password" autocomplete="new-password">
                    </div>
                    <?php if ($masterTenant || $adminTenant) { ?>
                        <div class="form-group">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" checked id="is_master" value="1">
                                <label class="custom-control-label" for="is_master" data-localize="is_master"></label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="openai_key"><p data-localize="openai_key"></p></label>
                            <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="openai_key_info"></i>
                            <input type="text" class="form-control" id="openai_key" aria-describedby="openai_key">
                        </div>
                        <div class="form-group">
                            <label for="openai_model"><p data-localize="openai_model"></p></label>
                            <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="openai_model_info"></i>
                            <input type="text" class="form-control" id="openai_model" aria-describedby="openai_model">
                        </div>
                        <div class="form-group">
                            <label for="heygen_key"><p data-localize="heygen_key"></p></label>
                            <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="heygen_key_info"></i>
                            <input type="text" class="form-control" id="heygen_key" aria-describedby="heygen_key">
                        </div>
                        <div class="form-group">
                            <label for="elevenlabs_key"><p data-localize="elevenlabs_key"></p></label>
                            <i class="fas fa-info-circle" data-bs-toggle="tooltip" id="elevenlabs_key_info"></i>
                            <input type="text" class="form-control" id="elevenlabs_key" aria-describedby="elevenlabs_key">
                        </div>
                    <?php } else { ?>
                        <input type="hidden" class="form-control" id="is_master" name="is_master" value="<?php echo ($adminTenant || $masterTenant) ? 1 : 0; ?>">
                    <?php } ?>
                    <a href="javascript:void(0);" id="saveAgent" class="btn btn-primary btn-user btn-block" data-localize="save">
                    </a>
                    <hr>

                </form>

            </div>
        </div>
    </div>
<?php } ?>
<?php
include_once 'footer.php';
