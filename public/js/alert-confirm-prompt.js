
function Alert (content, callback) {
  var $AlertModal = $("#AlertModal.modal");
  function AlertKey(e) {
    var k = e.which;
    if (k == 111 || k == 79) { //o or O press
      $AlertModal.find("#AlertModalOk").click();
    }
    return false;
  }
  $(document).on("keypress", AlertKey);
  $AlertModal.find("#AlertModalBody").html(content);
  $AlertModal.on("hidden.bs.modal", function () {
	$(document).off("keypress", AlertKey);
    $AlertModal.off("hidden.bs.modal");
    if (callback) callback();
  });
  $AlertModal.modal();
}

var ConfirmState = null;

function Confirm (content, success, fail) {
  var $ConfirmModel = $("#ConfirmModal.modal");
  function ConfirmKey(e) {
    var k = e.which;
    if (k == 121 || k == 89) { //y or Y press
      $ConfirmModel.find("#ConfirmModalYes").click();
    } else if (k == 110 || k == 78) { //n or N press
      $ConfirmModel.find("#ConfirmModalNo").click();
    }
    return false;
  }
  $(document).on("keypress", ConfirmKey);
  ConfirmState = null;
  $ConfirmModel.find("#ConfirmModalBody").html(content);
  $ConfirmModel.on("hidden.bs.modal", function () {
	$(document).off("keypress", ConfirmKey);
    $ConfirmModel.off("hidden.bs.modal");
    if (ConfirmState && success) success();
    else if (fail) fail();
  });
  $ConfirmModel.modal();
}

$(function () {
  $("body").append(
    "<div class='modal fade' id='AlertModal' tabindex='-1' role='dialog' aria-labelledby='AlertModalLabel' aria-hidden='true' data-backdrop='static' data-keyboard='false'>" +
      "<div class='modal-dialog'>" +
        "<div class='modal-content'>" +
          "<div class='modal-header'>" +
            "<h4 id='AlertModalLabel' class='modal-title'>Alert</h4>" +
          "</div>" +
          "<div id='AlertModalBody' class='modal-body'>" +
          "</div>" +
          "<div class='modal-footer'>" +
            "<button type='button' id='AlertModalOk' class='btn btn-default' data-dismiss='modal'>" +
              "<span class ='glyphicon glyphicon-ok'></span> <u>O</u>k" +
            "</button>" +
          "</div>" +
        "</div><!-- /.modal-content -->" +
      "</div><!-- /.modal-dialog -->" +
    "</div><!-- /.modal -->"
  );
  
  
  $("body").append(
    "<div class='modal fade' id='ConfirmModal' tabindex='-1' role='dialog' aria-labelledby='ConfirmModalLabel' aria-hidden='true' data-backdrop='static' data-keyboard='false'>" +
      "<div class='modal-dialog'>" +
        "<div class='modal-content'>" +
          "<div class='modal-header'>" +
            "<h4 id='ConfirmModalLabel' class='modal-title'>Confirm</h4>" +
          "</div>" +
          "<div id='ConfirmModalBody' class='modal-body'>" +
          "</div>" +
          "<div class='modal-footer'>" +
            "<button type='button' id='ConfirmModalYes' class='btn btn-default' onclick='ConfirmState=true;' data-dismiss='modal'>" +
              "<span class='glyphicon glyphicon-ok'></span> <u>Y</u>es" +
            "</button>" +
            "<button type='button' id='ConfirmModalNo' class='btn btn-default' onclick='ConfirmState=false;' data-dismiss='modal'>" +
              "<span class='glyphicon glyphicon-remove'></span> <u>N</u>o" +
            "</button>" +
          "</div>" +
        "</div><!-- /.modal-content -->" +
      "</div><!-- /.modal-dialog -->" +
    "</div><!-- /.modal -->"
  );
});
