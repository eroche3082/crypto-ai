<?php
include_once 'header.php';
?>
<h1 class="h3 mb-2 text-gray-800" data-localize="activation"></h1>



<div class="card shadow mb-4">
    <div class="card-body">

        <!-- Nested Row within Card Body -->
        <div class="row">
            <div class="col-lg-6">
                <div class="p-3">
                    <div id="error" class="d-none alert alert-danger"></div>
                    <div id="codeInfo" class="d-none alert alert-success"></div>
                    <div class="alert alert-warning" data-localize="fillin_purchase_code"></div>
                    <form class="user" method="post">
                        <div class="form-group">
                            <input type="text" class="form-control" id="code" aria-describedby="code" placeholder="Purchase Code">
                        </div>

                        <a href="javascript:void(0);" id="loginbutton" class="btn btn-primary btn-user btn-block">
                            Check
                        </a>
                        <hr>
                    </form>
                </div>
            </div>
        </div>

    </div>

</div>



<?php
include_once 'footer.php';
?>


<script src="js/validate.js"></script>
</body>

</html>