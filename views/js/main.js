function checkURL() {
  let url = $("#original_url").val();
  if (!url) {
    $('#submit_btn').prop('disabled', true);
    $('#alert-span').css("color", "transparent");
    $('#delete_btn').css("border-color", "#000");
    $('#original_url').css("border-color", "#000");
  } else if (validateUrl(url)) {
    $('#submit_btn').prop('disabled', false);
    $('#alert-span').html('URL validated ✔️');
    $('#alert-span').css("color", "#00cc00");
    $('#delete_btn').css("border-color", "#00cc00");
    $('#original_url').css("border-color", "#00cc00");
  } else {
    $('#submit_btn').prop('disabled', true);
    $('#alert-span').html('URL not validated ❌');
    $('#alert-span').css("color", "#e60000");
    $('#delete_btn').css("border-color", "#e60000");
    $('#original_url').css("border-color", "#e60000");
  }
}

function copyText(element) {
  $(`.inpt-group-input-${element}`).select();
  document.execCommand("copy");
}

function changeURLfunc() {
  let url = $('#change_url_inpt').val();
  if (!url) {
    $('.change-url').addClass('disabled');
    $('#change_url_form').attr('href', '');
    $('#change_url_inpt').css('border-color', '#000');
  } else if (validateUrl(url)) {
    $('.change-url').removeClass('disabled');
    $('#change_url_form').attr('href', `${window.location.origin}/change/${$('.inpt-group-input-2').val()}?url=${url}`);
    $('#change_url_inpt').css('border-color', '#00cc00');
  } else {
    $('.change-url').addClass('disabled');
    $('#change_url_form').attr('href', '');
    $('#change_url_inpt').css('border-color', '#e60000');
  }
}

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

function show_info(unique_id) {
  $.ajax({
    type: 'GET',
    url: '/ip/' + unique_id,
    success : (response) => {
      $('#info_modal_body').html(`
      <table id="table_info" class="table table-sm table-responsive-sm">
        <tbody>
          <tr>
            <td>Capture ID</td>
            <td>${response.unique_id}</td>
          <tr>
          <tr>
            <td>IP address</td>
            <td>${response.ip_address}</td>
          </tr>
          <tr>
            <td>Time/Date</td>
            <td>${response.time_captured}</td>
          </tr>
          <tr>
            <td>Country</td>
            <td>${response.country}</td>
          </tr>
          <tr>
            <td>City</td>
            <td>${response.city}</td>
          </tr>
          <tr>
            <td>Time Zone</td>
            <td>${response.timezone}</td>
          </tr>
          <tr>
            <td>Browser</td>
            <td>${response.browser}</td>
          </tr>
          <tr>
            <td>OS</td>
            <td>${response.os}</td>
          </tr>
          <tr>
            <td>Platform</td>
            <td>${response.platform}</td>
          </tr>
          <tr>
            <td>Coordinates</td>
            <td>${response.coordinates}<br><a style="float: left" id="map_link" href="https://www.google.com/maps/search/?api=1&query=${response.coordinates}" target="_blank">Open In Google Maps 🗺️</a></td>
          </tr>
          <tr>
            <td>ISP</td>
            <td>${response.isp}</td>
          </tr>
          <tr>
            <td>AS</td>
            <td>${response.asp}</td>
          </tr>
          <tr>
            <td>User Agent</td>
            <td>${response.user_agent}</td>
          </tr>
        </tbody>
      </table>
      `);
      $('#info_modal').modal('show');
    }
  });
}

function setDarkMode() {
  $('body').addClass('dark-mode');
  $('td, #original_url, .inpt-group-span, .inpt-group-input, #delete_btn').addClass('dark-input');
  $('th, td').css('border-color', '#fff');
  $('table, .table, td').css('color', '#fff');
  $('#darkmode_btn').html('☀️');
}

function setLightMode() {
  $('body').removeClass('dark-mode');
  $('td, #original_url, .inpt-group-span, .inpt-group-input, #delete_btn').removeClass('dark-input');
  $('th, td').css('border-color', '#000');
  $('table, .table, td').css('color', '#000');
  $('#darkmode_btn').html('🌑');
}

function setCookie(name,value,days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/;";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

$(document).ready(() => {
  let dark_cookie = getCookie('darkmode');

  if (dark_cookie == 'true') {
    setDarkMode();
  }

  if (dark_cookie == 'false') {
    setLightMode();
  }

  if (!dark_cookie) {
    setLightMode();
  }

  $('#darkmode_btn').click(() => {
    dark_cookie = getCookie('darkmode');
    if (dark_cookie == 'true') {
      setCookie('darkmode', 'false', 1);
      setLightMode();
    }

    if (dark_cookie == 'false') {
      setCookie('darkmode', 'true', 1);
      setDarkMode();
    }

    if (!dark_cookie) {
      setCookie('darkmode', 'true', 1);
      setDarkMode();
    }
  });

  $('#delete_btn').click(() => {
    $("#original_url").val("");
    checkURL();
  });

  $('#submit_btn').click(() => {
    let url = $("#original_url").val();
    if (validateUrl(url)) {
      $.ajax({
        type: 'POST',
        url: '/create?url=' + url,
        success : (response) => {
          console.log(response);
          $('#tracker_modal_body').html(`
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text inpt-group-span">Link ID</span>
              </div>
              <input type="text" class="form-control inpt-group-input inpt-group-input-1" value="${response.id}" readonly>
              <button class="btn btn-info inpt-group-btn" onclick="copyText(1)" >Copy 📋</button>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text inpt-group-span">Tracker ID</span>
              </div>
              <input type="text" class="form-control inpt-group-input inpt-group-input-2" value="${response.admin_id}" readonly>
              <button class="btn btn-info inpt-group-btn" onclick="copyText(2)" >Copy 📋</button>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text inpt-group-span">Original URL</span>
              </div>
              <input type="text" class="form-control inpt-group-input inpt-group-input-3" value="${response.original_url}" readonly>
              <button class="btn btn-info inpt-group-btn" onclick="copyText(3)" >Copy 📋</button>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text inpt-group-span">Short URL</span>
              </div>
              <input type="text" class="form-control inpt-group-input inpt-group-input-4" value="${response.short_url}" readonly>
              <button class="btn btn-info inpt-group-btn" onclick="copyText(4)" >Copy 📋</button>
            </div>
            <div class="input-group mt-1">
              <div class="input-group-prepend">
                <span class="input-group-text inpt-group-span">Tracker URL</span>
              </div>
              <input type="text" class="form-control inpt-group-input inpt-group-input-5" value="${response.tracking_url}" readonly>
              <button class="btn btn-info inpt-group-btn" onclick="copyText(5)" >Copy 📋</button>
            </div>
            <div class="alert alert-info round mt-3 mb-0" role="alert">Make sure to save your Tracker URL</div>
          `);
          $('#popup_btn').attr('href', response.tracking_url);
          $('#tracker_modal').modal('show');
        }
      });
    }
  });

});
