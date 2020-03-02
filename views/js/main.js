$(document).ready(() => {

  function validateUrl(value) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
  }

  $('#submit_btn').click(() => {
    let url = $("#original_url").val();
    if (validateUrl(url)) {
      $.ajax({
        type: 'POST',
        url: '/create?url=' + url,
        success : (response) => {

          function copyKey(element) {
            $(`#${element}`).select();
            document.execCommand('copy');
          }

          $("#info-body").html(`
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">ID</span>
              </div>
              <input type="text" class="form-control text-dark" id="logger_id" value="${response.id}"readonly>
              <div class="input-group-append">
                <button type="button" class="btn btn-primary" onclick="copyKey('logger_id')">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Admin ID</span>
              </div>
              <input type="text" class="form-control text-dark" id="admin_id" value="${response.admin_id}"readonly>
              <div class="input-group-append">
                <button type="button" class="btn btn-primary" onclick="copyKey('admin_id')">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Original URL</span>
              </div>
              <input type="text" class="form-control text-dark" id="origin_url" value="${response.original_url}"readonly>
              <div class="input-group-append">
                <button type="button" class="btn btn-primary" onclick="copyKey('origin_url')">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Short URL</span>
              </div>
              <input type="text" class="form-control text-dark" id="short_url" value="${response.short_url}"readonly>
              <div class="input-group-append">
                <button type="button" class="btn btn-primary" onclick="copyKey('short_url')">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Monitoring URL</span>
              </div>
              <input type="text" class="form-control text-dark" id="monitoring_url" value="${response.monitoring_url}"readonly>
              <div class="input-group-append">
                <button type="button" class="btn btn-primary" onclick="copyKey('monitoring_url')">Copy</button>
              </div>
            </div>
          `);
        }
      });
      $('#info_popup').modal('show');
      console.log();
    }
  });
});
