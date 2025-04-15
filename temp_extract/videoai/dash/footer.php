<script>
<?php if ($adminTenant) { ?>
        var agentId = false;
        $master_tenant = 1;
<?php } else { ?>
        var agentId = '<?php echo $tenant; ?>';
        $master_tenant = false;
<?php } ?>
<?php if ($masterTenant) { ?>
        $admin_tenant = 1;
<?php } else { ?>
        $admin_tenant = false;
<?php } ?>
    $tenant = '<?php echo $tenant; ?>';
    $gettenant = '<?php echo $gettenant; ?>';
</script>



</div>
<!-- /.container-fluid -->

</div>
<!-- End of Main Content -->
<?php
if ($isInclude) {
    ?>
    <!-- Footer -->
    <footer class="sticky-footer bg-white">
        <div class="container my-auto">
            <div class="copyright text-center my-auto">
                <span>Copyright &copy; LiveSmart AI Video <?php echo date('Y'); ?></span>
            </div>
        </div>
    </footer>
    <!-- End of Footer -->
    <?php
}
?>
</div>
<!-- End of Content Wrapper -->

</div>
<!-- End of Page Wrapper -->

<!-- Scroll to Top Button-->
<a class="scroll-to-top rounded" href="#page-top">
    <i class="fas fa-angle-up"></i>
</a>

<!-- Logout Modal-->
<div class="modal fade" id="infoModal" tabindex="-1" role="dialog" aria-labelledby="infoModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="infoModalLabelAgent" data-localize="avatar_url"></h5>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-dismiss="modal" data-localize="ok"></button>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel" data-localize="ready_leave"></h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body" data-localize="select_logout"></div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-dismiss="modal" data-localize="cancel"></button>
                <a class="btn btn-primary" href="logout.php" data-localize="logout"></a>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap core JavaScript-->
<script src="vendor/jquery/jquery.min.js"></script>
<script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

<!-- Core plugin JavaScript-->
<script src="vendor/jquery-easing/jquery.easing.min.js"></script>

<!-- Custom scripts for all pages-->
<script src="js/sb-admin-2.min.js"></script>
<script>
    $base = '<?php echo $basename;?>';
    $actual_link = '<?php echo $actual_link;?>';
</script>



<?php if ($basename == 'agent.php') { ?>
    <script>
    <?php
    if (isset($_GET['id'])) {
        ?>
            $Id = <?php echo $_GET['id'];?>;
            $('#usernameDiv').hide();
        <?php
    } else {
        ?>
            $Id = null;
            $('#usernameDiv').show();
        <?php
    }
    ?>
    </script>

    <?php
}
if ($basename == 'videoai.php') { ?>
    <script>
    <?php
    if (isset($_GET['id'])) {
        ?>
            $Id = <?php echo $_GET['id'];?>;
        <?php
    } else {
        ?>
            $Id = null;
        <?php
    }
    ?>
    </script>

    <?php
}
if ($basename == 'plan.php' || $basename == 'subscription.php') { ?>
    <script>
    <?php
    if (isset($_GET['id'])) {
        ?>
            $Id = <?php echo $_GET['id'];?>;
        <?php
    } else {
        ?>
            $Id = null;
        <?php
    }
    ?>
    </script>

    <?php
}
if ($basename == 'dash.php') {
?>
    <script>
        var $currentVersion = '<?php echo $currentVersion;?>';
    </script>
<?php
}
if ($basename == 'locale.php') {
?>
    <script>

        <?php
        $jsonString = file_get_contents('../locales/en_US.json');
        $jsonStringToCompare = file_get_contents('../locales/' . $fileLocale . '.json');

        $data = json_decode($jsonString, true);
        $dataToCompare = json_decode($jsonStringToCompare, true);
        $fileContent = '';
        $fileData = '';
        foreach ($data as $key => $value) {
            $fileContent .= '<div class="form-group"><label for="roomName"><p>' . $key . ':</p></label><input type="text" class="form-control" id="' . $key . '" aria-describedby="' . $key . '" value="' . htmlentities(addslashes($dataToCompare[$key])) . '"></div>';
            $fileData .= $key . "|";
        };
        $fileData = substr($fileData, 0, -1);
        ?>
        $fileLocale = '<?php echo $fileLocale;?>';

        jQuery(document).ready(function ($) {
            $('#error').hide();
            $('#localeStrings').html('<?php echo $fileContent; ?>');
            $fileData = '<?php echo $fileData;?>';
        });
    </script>

<?php
}
?>
<script src="js/jquery.localize.js" type="text/javascript" charset="utf-8"></script>
<script src="js/common.js"></script>
<script src="js/moment.min.js"></script>
<script src="js/bootstrap-datetimepicker.js"></script>
<script src="vendor/datatables/jquery.dataTables.min.js"></script>
<script src="vendor/datatables/dataTables.bootstrap4.min.js"></script>
<script src="js/footer.js"></script>

</body>

</html>