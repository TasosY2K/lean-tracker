function fixTables() {
  let windowsize = $(window).width();
  if (windowsize > 500) {
    document.getElementById("main_table").className = "table table-responsive-sm";
  } else {
    document.getElementById("main_table").className = "table table-sm table-responsive-sm";
  }
}

$(document).ready(() => {

  fixTables();

  $(window).resize(() => {
    fixTables();
  });

});
