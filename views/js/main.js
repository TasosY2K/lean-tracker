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
          console.log(response);
          $('#modal-body').html(`
            <div class="alert alert-danger" role="alert">Make sure to save your tracker URL!</div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Link ID</span>
              </div>
              <input type="text" class="form-control" value="${response.id}">
              <div class="input-group-append">
                <button class="btn btn-info">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Tracker ID</span>
              </div>
              <input type="text" class="form-control" value="${response.admin_id}">
              <div class="input-group-append">
                <button class="btn btn-info">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Original URL</span>
              </div>
              <input type="text" class="form-control" value="${response.original_url}">
              <div class="input-group-append">
                <button class="btn btn-info">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Short URL</span>
              </div>
              <input type="text" class="form-control" value="${response.short_url}">
              <div class="input-group-append">
                <button class="btn btn-info">Copy</button>
              </div>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text">Tracker URL</span>
              </div>
              <input type="text" class="form-control" value="${response.monitoring_url}">
              <div class="input-group-append">
                <button class="btn btn-info">Copy</button>
              </div>
            </div>
          `);
          $('.modal').modal('show');
        }
      });
    }
  });

});
