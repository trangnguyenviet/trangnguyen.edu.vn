function ShowHideTab(controlID) {
	if (controlID == 'contenttab1') {
		$("#contenttab1").show();
		$("#headtab1").removeClass().addClass("tabs-selected-tab");
		$("#contenttab2").hide();
		$("#headtab2").removeClass();
	}
	if (controlID == 'contenttab2') {
		$("#contenttab1").hide();
		$("#headtab2").removeClass().addClass("tabs-selected-tab");

		$("#contenttab2").show();
		$("#headtab1").removeClass();
	}
}