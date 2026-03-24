var debugData = "";
// Catching error purpose, this var will count every page loaded to prevent loading loop

// EDIT 20210516 - Change input type of #txtNbAttacks (text => number) by Daydream

var incrementalSwitchPage = 0;
var cookieName = "fakeypress";
var version = "1.99";
var updateversion = 1.7;
// Language support
var currentLanguage = "en"; // Default language: en, el
var translations = {
    "en": {
        "welcome": "Welcome to Fakeypress by Crimsoni",
        "keyboard_settings": "Keyboard Settings",
        "buttons": "Buttons:",
        "ignore": "Skip",
        "settings": "Settings",
        "hide": "Hide",
        "show": "Show",
        "load_pages": "Load pages",
        "from": "From",
        "to": "to",
        "hide_label": "Hide",
        "ongoing_attacks": "Ongoing attacks (specify from) ",
        "attacks": "Attacks",
        "spied": "Spied",
        "total_victory": "Total Victory",
        "losses": "Losses",
        "defeated_damaged": "Defeated, but damaged",
        "defeated_spied": "Defeated, but spied",
        "defeated": "Defeated",
        "reset": "Reset",
        "apply": "Apply",
        "save": "Save",
        "reset_done": "Reset done",
        "settings_saved": "Settings saved",
        "error_load": "An error occurred, the page will reload.",
        "error_cookie": "Try changing the cookieName variable name. If the problem persists, go to the forum.",
        "update_data_lost": "Due to an update, data has been lost. Please reassign keys.",
        "key_edit_mode": "Click on a button then a keyboard key to modify"
    },
    "el": {
        "welcome": "Καλωσήρθατε στο Fakeypress από Crimsoni",
        "keyboard_settings": "Ρυθμίσεις Πληκτρολογίου",
        "buttons": "Κουμπιά:",
        "ignore": "Παράβλεψη",
        "settings": "Ρυθμίσεις",
        "hide": "Απόκρυψη",
        "show": "Εμφάνιση",
        "load_pages": "Φόρτωση σελίδων",
        "from": "Από",
        "to": "έως",
        "hide_label": "Απόκρυψη",
        "ongoing_attacks": "Ενεργές επιθέσεις (καθορίστε από) ",
        "attacks": "Επιθέσεις",
        "spied": "Κατασκοπεύτηκε",
        "total_victory": "Ολική Νίκη",
        "losses": "Απώλειες",
        "defeated_damaged": "Ηττήθηκε, αλλά κτίρια κατεστραμμένα",
        "defeated_spied": "Ηττήθηκε, αλλά κατασκοπεύτηκε",
        "defeated": "Ηττήθηκε",
        "reset": "Επαναφορά",
        "apply": "Εφαρμογή",
        "save": "Αποθήκευση",
        "reset_done": "Η επαναφορά ολοκληρώθηκε",
        "settings_saved": "Οι ρυθμίσεις αποθηκεύτηκαν",
        "error_load": "Προέκυψε σφάλμα, η σελίδα θα φορτωθεί ξανά.",
        "error_cookie": "Δοκιμάστε να αλλάξετε το όνομα της μεταβλητής cookieName. Αν το πρόβλημα συνεχιστεί, επισκεφτείτε το φόρουμ.",
        "update_data_lost": "Λόγω ενημέρωσης, τα δεδομένα χάθηκαν. Παρακαλώ ορίστε ξανά τα πλήκτρα.",
        "key_edit_mode": "Κάντε κλικ σε ένα κουμπί και μετά σε ένα πλήκτρο για τροποποίηση"
    }
};

function t(key) {
    return translations[currentLanguage][key] || translations["en"][key] || key;
}

// Language selector function
function setLanguage(lang) {
    if (lang === "en" || lang === "el") {
        currentLanguage = lang;
        // Update cookie to save language preference
        setCookie(cookieName + "_lang", lang, 180);
        // Refresh UI to apply new language
        if ($('#divFAPress').length > 0) {
            refresh();
        }
    }
}

// Load saved language from cookie
function loadSavedLanguage() {
    var savedLang = $.cookie(cookieName + "_lang");
    if (savedLang && (savedLang === "en" || savedLang === "el")) {
        currentLanguage = savedLang;
    }
}

var keycodes = {
    "a": 65,
    "b": 66,
    "c": 67,
    "skip": 74,
    "right": 39,
    "left": 37,
    "master": 90
};
var keyedits = {
    "a": false,
    "b": false,
    "c": false,
    "skip": false,
    "left": false,
    "right": false
};
var key;
var keydown = false;
var cansend = true;
var sitter = "";
if (window.game_data && window.game_data.player && window.game_data.player.sitter != "0") {
    sitter = "t=" + window.game_data.player.id + "&";
}
var link = ["https://" + window.location.host + "/game.php?" + sitter + "village=", "&screen=am_farm"];
var pos = {
    s: {
        order: 0,
        dir: 1,
        loadp: 2,
        fp: 3,
        lp: 4,
        remaxes: 5,
        remyellow: 6,
        remred: 7,
        remblue: 8,
        remgreen: 9,
        remredy: 10,
        remredb: 11,
        remattsince: 12,
        MaxNbAttacks: 13
    }
};
var faTable, userkeys, userset, totalrows, countedrows = 0;
var pagesLoad = 0;
// pagesLoaded will be used to detect if a page is loaded or not and prevent error in InnoGames code
var pagesLoaded = true,
    pageLoading = false,
    start = false;

/****************************1st called function****************************/
function run() {
    // Check if game_data exists
    if (typeof window.game_data === 'undefined') {
        console.log("Waiting for game_data...");
        setTimeout(run, 500);
        return;
    }

    if (!(window.game_data.screen === 'am_farm')) {
        getFA();
    } else {
        if (checkCookie()) {
            if ($.cookie(cookieName).indexOf('{') == -1) {
                alert(t("error_cookie"));
                var dodokeys = $.cookie(cookieName).split(',');
                resetCookie();
                userkeys[0] = dodokeys[0];
                userkeys[1] = dodokeys[1];
                userkeys[2] = dodokeys[2];
                userkeys[3] = dodokeys[3];
                userkeys[4] = dodokeys[5];
                userkeys[5] = dodokeys[4];
                keycodes.a = parseInt(userkeys[0]);
                keycodes.b = parseInt(userkeys[1]);
                keycodes.c = parseInt(userkeys[2]);
                keycodes.skip = parseInt(userkeys[3]);
                keycodes.left = parseInt(userkeys[5]);
                keycodes.right = parseInt(userkeys[4]);
                setCookie(cookieName, 180);
            } else if (parseFloat($.cookie(cookieName).split("{")[1].split("}")[0]) <= updateversion) {
                UI.ErrorMessage(t("update_data_lost"), 5000);
                resetCookie();
            } else {
                userkeys = $.cookie(cookieName).split("[")[1].split("]")[0].split(",");
                userset = $.cookie(cookieName).split("[")[2].split("]")[0].split(",");
                keycodes.a = parseInt(userkeys[0]);
                keycodes.b = parseInt(userkeys[1]);
                keycodes.c = parseInt(userkeys[2]);
                keycodes.skip = parseInt(userkeys[3]);
                keycodes.left = parseInt(userkeys[5]);
                keycodes.right = parseInt(userkeys[4]);
            }
        } else {
            UI.SuccessMessage(t("welcome"), 1000);
            resetCookie();
        }
        // Load saved language preference
        loadSavedLanguage();
        faTable = $('#plunder_list');
        if (userset[pos.s.loadp] === "1") {
            removeFirstPage();
            showPages();
        } else {
            initStuff();
        }
    }
}

/****************************Script initialisation****************************/
function initStuff() {
    $(document).off();
    removeBadStuff();
    addRowRemover();
    makeItPretty();
    addPressKey();
    addTable();
    doSettings();
    if (typeof Accountmanager !== 'undefined' && Accountmanager.initTooltips) {
        Accountmanager.initTooltips();
    }
}

/****************************Remover of undesired orders - FIXED LOOP BRACES ****************************/
function removeBadStuff() {
    // FIXED: Added braces around the for loop body
    for (var i = 1; i < $(faTable).find("tr").length; i++) {
        var row = $(faTable).find("tr").eq(i);
        if (userset[pos.s.remyellow] == 1 && $(row).html().indexOf('yellow.png') != -1) {
            $(row).remove();
            i--;
        } else if (userset[pos.s.remredy] == 1 && $(row).html().indexOf('red_yellow.png') != -1) {
            $(row).remove();
            i--;
        } else if (userset[pos.s.remredb] == 1 && $(row).html().indexOf('red_blue.png') != -1) {
            $(row).remove();
            i--;
        } else if (userset[pos.s.remred] == 1 && $(row).html().indexOf('red.png') != -1) {
            $(row).remove();
            i--;
        } else if (userset[pos.s.remgreen] == 1 && $(row).html().indexOf('green.png') != -1) {
            $(row).remove();
            i--;
        } else if (userset[pos.s.remblue] == 1 && $(row).html().indexOf('blue.png') != -1) {
            $(row).remove();
            i--;
        }
    }
}

/****************************Display number of attacks****************************/
function addRowRemover() {
    $('#plunder_list tr:gt(0)').each(function(i) {
        $(this).children("td").each(function(j) {
            switch (j) {
                case 3:
                    var attackImg = $(this).find('img');
                    var numAttacks = 0;
                    if (typeof $(attackImg).prop('tooltipText') != 'undefined') {
                        numAttacks = $(attackImg).prop('tooltipText').replace(/\D/g, '');
                    } else if (typeof attackImg.attr('title') != 'undefined') {
                        numAttacks = attackImg.attr('title').replace(/\D/g, '');
                    }

                    if (numAttacks > 0) {
                        if ($(this).children("span").length === 0) {
                            attackImg.after("<span style='font-weight:bold;'> (" + numAttacks + ")</span>");
                        }
                        if (Number(numAttacks) > Number(userset[pos.s.MaxNbAttacks]) && userset[pos.s.remaxes] == 1) {
                            $(this).closest("tr").remove();
                        }
                    }
                    break;
                case 8:
                    setOnclick($(this));
                    break;
                case 9:
                    setOnclick($(this));
                    break;
                case 10:
                    setOnclick($(this));
                    break;
            }
        });
    });
}

/****************************Change row CSS****************************/
function makeItPretty() {
    $('h3').eq(0).text("Farm Assistant*");
    $('.row_a').css("background-color", "rgb(216, 255, 216)");
    $('#plunder_list').find('tr:gt(0)').each(function(index) {
        $(this).removeClass('row_a');
        $(this).removeClass('row_b');
        if (index % 2 == 0) {
            $(this).addClass('row_a');
        } else {
            $(this).addClass('row_b');
        }
    });
    hideStuffs();
}

function hideStuffs() {
    $('#contentContainer').find('div[class="vis"]').eq(0).children().eq(0).append($(
        "<div class='vis' style='float:right;text-align:center;line-height:100%;width:12px;height:12px;margin:0px 0px 0px 0px;position:relative;background-color:tan;opacity:.7'><a href='#' num='0' onclick='uglyHider($(this));return false;'>+</a></div>"
    ));
    $('#contentContainer').find('div[class="vis"]').eq(0).children().eq(1).hide();
    $('#am_widget_Farm').find('h4').eq(0).append($(
        "<div class='vis' style='float:right;text-align:center;line-height:100%;width:12px;height:12px;margin:0px 0px 0px 0px;position:relative;background-color:tan;opacity:.7'><a href='#' num='1' onclick='uglyHider($(this));return false;'>+</a></div>"
    ));
    $('#plunder_list_filters').hide();
}

function uglyHider(linker) {
    var basd;
    if ($('#divFAPress').length > 0) {
        basd = 1;
    } else {
        basd = 0;
    }
    if ($(linker).text() === "+") {
        $(linker).text("-");
    } else {
        $(linker).text("+");
    }
    if (parseInt($(linker).attr('num')) == 0) {
        $('#contentContainer').find('div[class="vis"]').eq(basd).children().eq(1).toggle();
    } else if (parseInt($(linker).attr('num')) == 1) {
        $('#plunder_list_filters').toggle();
    }
}

/****************************Key events binding****************************/
function addPressKey() {
    window.onkeypress = function(e) {
        checkKeys();
    };
    window.onkeydown = function(e) {
        key = e.keyCode ? e.keyCode : e.which;
        keydown = true;
        if (key == keycodes.left) {
            if (pagesLoaded)
                getNewVillage("p");
        } else if (key == keycodes.right) {
            if (pagesLoaded)
                getNewVillage("n");
        }
    };
    window.onkeyup = function(e) {
        checkKeys();
        keydown = false;
    };

    function checkKeys() {
        if (keyedits.a) {
            keycodes.a = key;
            refresh();
        } else if (keyedits.b) {
            keycodes.b = key;
            refresh();
        } else if (keyedits.c) {
            keycodes.c = key;
            refresh();
        } else if (keyedits.skip) {
            keycodes.skip = key;
            refresh();
        } else if (keyedits.left) {
            keycodes.left = key;
            refresh();
        } else if (keyedits.right) {
            keycodes.right = key;
            refresh();
        } else if (key == keycodes.skip) {
            $(faTable).find("tr").eq(1).remove();
        } else if (cansend) {
            if (key == keycodes.c) {
                click('c');
                doTime(201);
            } else if (key == keycodes.a) {
                click('a');
                doTime(201);
            } else if (key == keycodes.b) {
                click('b');
                doTime(201);
            }
        }
    }
}

function click(letter) {
    for (h = 1; h < $(faTable).find("tr").length; h++) {
        var row = $(faTable).find("tr").eq(h);
        var button = $('a[class*="farm_icon_' + letter + '"]', row).eq(0);
        if ($(button).html() != null) {
            if ($(button).attr('class').indexOf('farm_icon_disabled') == -1) {
                $(button).click();
                return;
            }
        }
    }
}

/****************************Build Script Menu****************************/
function addTable() {
    if ($('#divFAPress')) {
        $('#divFAPress').remove();
        $('#divFAPressSettings').remove();
    }
    $("#contentContainer h3").eq(0).after($(
        "<div id='divFAPress' class='vis' style='font-size:12px;width:40%'><table id='faKeyPress' class='vis' style='width:100%' cellspacing='0'><thead><tr><th colspan='10' style='font-size:16px;text-align:center'>FA Keypress v" +
        version +
        " by<br> Crimsoni & Sytten</th></tr></thead>" +
        "<tbody>" +
        "<tr id='buttonRow'>" +
        "<th colspan='1' valign='middle'>" + t("buttons") + " <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/questionmark.png' title='" + t("key_edit_mode") + "' width='13' height='13' alt='' class='tooltip' />" +
        "<td colspan='1' align='center'>" +
        "<a href='#' onclick='return setEditMode(0)' id='buttona' class='tooltip farm_icon farm_icon_a' title='Bouton A'>" +
        "<td colspan='1' align='center'>" +
        "<a href='#' onclick='return setEditMode(1)' id='buttonb' class='tooltip farm_icon farm_icon_b' title='Bouton B'>" +
        "<td colspan='1' align='center'>" +
        "<a href='#' onclick='return setEditMode(2)' id='buttonc' class='tooltip farm_icon farm_icon_c'  title='Bouton C'>"+
        "<td colspan='1' align='center'>" +
        "<input class='btn tooltip' type='button' value='" + t("ignore") + "' onclick='return setEditMode(3)' style='margin:0px 0px 0px 0px' title='" + t("ignore") + "'/>" +
        "<td colspan='1' align='center'>" +
        "<a href='#' onclick='return setEditMode(4)' id='buttonleft' class='tooltip ' title='<-'><-</a>" +
        "<td colspan='1' align='center'>" +
        "<a href='#' onclick='return setEditMode(5)' id='buttonright' class='tooltip ' title='->'>-></a>" +
        "</tr>" +
        "<tr id='keysRow'>"+
        "<th colspan='1'>Touche:<td align='center'>" +
        String.fromCharCode(keycodes.a) + "<td align='center'>" + String.fromCharCode(keycodes.b) + "<td align='center'>" + String.fromCharCode(
            keycodes.c) + "<td align='center'>" + String.fromCharCode(keycodes.skip) +
        "<td align='center'>"+ String.fromCharCode(keycodes.left)+ "<td align='center'>"+ String.fromCharCode(keycodes.right) +"</tr>" +
        "</tbody></table></div>"));

    // Language selector dropdown
    var langSelectorHtml = "<div style='float:right; margin-right:10px;'>" +
        "<select id='languageSelector' onchange='setLanguage(this.value)'>" +
        "<option value='en'" + (currentLanguage === 'en' ? ' selected' : '') + ">English</option>" +
        "<option value='el'" + (currentLanguage === 'el' ? ' selected' : '') + ">Ελληνικά</option>" +
        "</select></div>";

    $('#divFAPress').prepend(langSelectorHtml);

    $('#divFAPress').append($(
        "<table id='faKeySettings' class='vis' style='width:100%' cellspacing='0'><thead><tr><th colspan='3'><em>" + t("settings") + "</em> - <a href'#' id='showSettings' onclick='return doSettings()'>" + t("hide") + "</a></th></tr></thead><tbody id='bodySettings'><tr><td colspan='1' align='center'><input type='checkbox' id='chbLoadPages' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.loadp + ")'> <b>" + t("load_pages") + "</b><td colspan='4'>" + t("from") + " <input type='text' id='txtFirstPage' size='2' maxlength='2' value='" + userset[pos.s.fp] +
        "' onchange='onlyNum(this);' disabled> " + t("to") + "  <input type='text' id='txtLastPage' size='2' maxlength='2' value='" + userset[pos.s.lp] +
        "' onchange='onlyNum(this);' disabled></tr><tr><td align='center'><b>" + t("hide_label") + "</b></td><td><input type='checkbox' id='chbRemAxes' onclick='return chkBoxClick($(this).is(\":checked\"), " + pos.s
            .remaxes +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/attacks.png' title='" + t("ongoing_attacks") + "' alt='' class='tooltip' /> " + t("ongoing_attacks") + " <input type='number' id='txtNbAttacks' size='2' maxlength='2' value='" + userset[pos.s.MaxNbAttacks] + "' onchange='onlyNum(this)' disabled><input type='checkbox' id='chbRemBlue' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.remblue +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/blue.png' title='" + t("spied") + "' alt='' class='tooltip' /> " + t("spied") + " <br><input type='checkbox' id='chbRemGreen' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.remgreen +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/green.png' title='" + t("total_victory") + "' alt='' class='tooltip' /> " + t("total_victory") + " <br><input type='checkbox' id='chbRemYellow' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.remyellow +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/yellow.png' title='" + t("losses") + "' alt='' class='tooltip' /> " + t("losses") + " <br><input type='checkbox' id='chbRemRedYellow' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.remredy +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/red_yellow.png' title='" + t("defeated_damaged") + "' alt='' class='tooltip' /> " + t("defeated_damaged") + "<br><input type='checkbox' id='chbRemRedBlue' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.remredb +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/red_blue.png' title='" + t("defeated_spied") + "' alt='' class='tooltip' /> " + t("defeated_spied") + "<br><input type='checkbox' id='chbRemRed' onclick='return chkBoxClick($(this).is(\":checked\"), " +
        pos.s.remred +
        ")'> <img src='https://media.innogamescdn.com/com_DS_FR/Scripts/Pillage/red.png' title='" + t("defeated") + "' alt='' class='tooltip' /> " + t("defeated") + "</td></tr><tr><td align='right' colspan='2'><input type='button' class='btn' id='btnSettingsReset' value='" + t("reset") + "' onclick='resetCookie(); UI.SuccessMessage(\"" + t("reset_done") + "\",1000); run(); return false;'><input type='button' class='btn' id='btnSettingsApply' value='" + t("apply") + "' onclick='saveSettings(); run(); return false'><input type='button' class='btn' id='btnSettingsSave' value='" + t("save") + "' onclick='saveSettings(); return false;'></td></tr></tbody></table>"
    ));

    if (userset[pos.s.remred] === "1") {
        $('#chbRemRed').prop("checked", true);
    }
    if (userset[pos.s.remredy] === "1") {
        $('#chbRemRedYellow').prop("checked", true);
    }
    if (userset[pos.s.remredb] === "1") {
        $('#chbRemRedBlue').prop("checked", true);
    }
    if (userset[pos.s.remgreen] === "1") {
        $('#chbRemGreen').prop("checked", true);
    }
    if (userset[pos.s.remblue] === "1") {
        $('#chbRemBlue').prop("checked", true);
    }
    if (userset[pos.s.remaxes] === "1") {
        $('#chbRemAxes').prop("checked", true);
        $('#txtNbAttacks').prop("disabled", false);
    }
    if (userset[pos.s.remyellow] === "1") {
        $('#chbRemYellow').prop("checked", true);
    }
    if (userset[pos.s.loadp] === "1") {
        $('#chbLoadPages').prop("checked", true);
        $('#txtFirstPage').prop("disabled", false);
        $('#txtLastPage').prop("disabled", false);
    }
}

/****************************Hide/Show Script Settings****************************/
function doSettings() {
    if ($('#showSettings').html().indexOf(t("hide")) != -1) {
        $('#bodySettings').hide();
        $('#showSettings').html(t("show"));
    } else {
        $('#bodySettings').show();
        $('#showSettings').html(t("hide"));
    }
}

/****************************Settings Related functions****************************/
function chkBoxClick(yolo, index) {
    if (yolo) {
        userset[index] = "1";
        if (index === pos.s.loadp) {
            $('#txtFirstPage').prop("disabled", false);
            $('#txtLastPage').prop("disabled", false);
        } else if (index === pos.s.remaxes) {
            $('#txtNbAttacks').prop("disabled", false);
        }
    } else {
        userset[index] = "0";
        if (index === pos.s.loadp) {
            $('#txtFirstPage').prop("disabled", true);
            $('#txtLastPage').prop("disabled", true);
        } else if (index === pos.s.remaxes) {
            $('#txtNbAttacks').prop("disabled", true);
        }
    }
    setCookie(cookieName, "{" + version + "}[" + userkeys.toString() + "][" + userset.toString() + "]", 180);
}

function saveSettings() {
    userset[pos.s.fp] = $('#txtFirstPage').val();
    userset[pos.s.lp] = $('#txtLastPage').val();
    userset[pos.s.MaxNbAttacks] = $('#txtNbAttacks').val();
    setCookie(cookieName, "{" + version + "}[" + userkeys.toString() + "][" + userset.toString() + "]", 180);
    UI.SuccessMessage(t("settings_saved"), 1000);
}

function setEditMode(let) {
    keyedits.a = false;
    keyedits.b = false;
    keyedits.c = false;
    keyedits.skip = false;
    keyedits.left = false;
    keyedits.right = false;
    if (let == 0) {
        keyedits.a = true;
    } else if (let == 1) {
        keyedits.b = true;
    } else if (let == 2) {
        keyedits.c = true;
    } else if (let == 3) {
        keyedits.skip = true;
    } else if (let == 4) {
        keyedits.left = true;
    } else if (let == 5) {
        keyedits.right = true;
    }
    return true;
}

/****************************Cookies Handling****************************/
function checkCookie() {
    if (!($.cookie(cookieName))) {
        return false;
    } else {
        return true;
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

function resetCookie() {
    $.cookie(cookieName, null);
    userkeys = [65, 66, 67, 74, 39, 37, 90];
    userset = ["distance", "asc", "0", "1", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0"];
    setCookie(cookieName, "{" + version + "}[" + userkeys.toString() + "][" + userset.toString() + "]", 180);
}

/****************************Update Function****************************/
function refresh() {
    userkeys = [keycodes.a, keycodes.b, keycodes.c, keycodes.skip, keycodes.right, keycodes.left, keycodes.master];
    setCookie(cookieName, "{" + version + "}[" + userkeys.toString() + "][" + userset.toString() + "]", 180);
    setEditMode(10);
    $('#divFAPress').remove();
    addTable();
    doSettings();
}

/****************************Unit Sender****************************/
function setOnclick(button) {
    var clickFunction = button.find('a').attr('onclick');
    if (typeof clickFunction != 'undefined') {
        var parameters = clickFunction.slice(clickFunction.indexOf("(") + 1, clickFunction.indexOf(")"));
        var eachParameter = parameters.split(",");
        if (clickFunction.indexOf("FromReport") == -1) {
            button.find('a').attr('onclick', 'return customSendUnits(' + parameters + ', $(this))');
        } else {
            button.find('a').attr('onclick', 'return customSendUnitsFromReport(' + parameters + '))');
        }
    }
}

function customSendUnits(link, target_village, template_id, button) {
    var lastbutton = button;
    var row = button.closest("tr");
    button.closest("tr").remove();
    link = $(link);
    if (link.hasClass('farm_icon_disabled')) return false;
    var data = {
        target: target_village,
        template_id: template_id,
        source: game_data.village.id
    };
    $.post(Accountmanager.send_units_link, data, function(data) {
        if (data.error) {
            UI.ErrorMessage(data.error);
            $(faTable).find("tr").eq(h).before(row);
        } else {
            $('.farm_village_' + target_village).addClass('farm_icon_disabled');
            if (typeof $(button).prop('tooltipText') != 'undefined') {
                var buttext = $(button).prop('tooltipText');
            }
            var yolo = $('<div></div>').append($(buttext));
            var bolo = $(yolo).find('img[src*="res.png"]').eq(0).attr('src');
            var sep1 = buttext.split("<br />");
            sep1.splice(sep1.length - 2, 1);
            UI.SuccessMessage(sep1.join(" "), 1000);
            button.closest("tr").remove();
            Accountmanager.farm.updateOwnUnitsAvailable(data.current_units);
        }
    }, 'json');
    return false
}

function customSendUnitsFromReport(link, target_village, report_id, button) {
    var lastbutton = button;
    var row = button.closest("tr");
    button.closest("tr").remove();
    link = $(link);
    if (link.hasClass('farm_icon_disabled'))
        return false;
    var data = {
        report_id: report_id
    };
    $.post(Accountmanager.send_units_link_from_report, data, function(data) {
        if (data.error) {
            UI.ErrorMessage(data.error);
            $(faTable).find("tr").eq(h).before(row);
        } else {
            if (typeof data.success === 'string') {
                if (typeof $(button).prop('tooltipText') != 'undefined') {
                    var buttext = $(button).prop('tooltipText');
                }
                var yolo = $('<div></div>').append($(buttext));
                var bolo = $(yolo).find('img[src*="res.png"]').eq(0).attr('src');
                var sep1 = buttext.split("<br />");
                sep1.splice(sep1.length - 2, 1);
                UI.SuccessMessage(sep1.join(" "), 1000);
                $('.farm_village_' + target_village).addClass('farm_icon_disabled');
                Accountmanager.farm.updateOwnUnitsAvailable(data.current_units);
            };
        }
    }, 'json');
    return false
}

/****************************Pages display****************************/
function removeFirstPage() {
    $('#am_widget_Farm').hide();
    $('#plunder_list tr:gt(0)').remove();
    $('#plunder_list_nav').hide();
}

function showPages() {
    addLoader();
    var pages = $.trim($('#plunder_list_nav').find('table').eq(0).find('a:last').html().replace(/\D+/g, ''));
    if (parseInt(pages) > parseInt(userset[pos.s.lp])) {
        pages = parseInt(userset[pos.s.lp]);
    } else {
        pages = parseInt(pages);
    }
    getPage(pages);
}

function addLoader() {
    $("#contentContainer h3").eq(0).after("<div id='yoloLoader'><img src='graphic/throbber.gif' height='24' width='24'></img> <span id='yoloLoadText'> 0%</span></div>");
}

function getPage(pages) {
    var i = parseInt(userset[pos.s.fp]) - 1 + pagesLoad;
    $.get(link[0] + window.game_data.village.id + "&order=" + userset[pos.s.order] + "&dir" + userset[pos.s.dir] + "&Farm_page=" + i + "&screen=am_farm", function(data) {
        var v = $(data);
        var subFaTable = $('#plunder_list', v);
        var rows = $(subFaTable).find('tr');
        if (totalrows == null) {
            totalrows = (userset[pos.s.lp] - userset[pos.s.fp] + 1) * rows.length;
        }
        for (var b = 1; b < rows.length; b++) {
            $(faTable).find('tr:last').after($(rows[b]));
            countedrows++;
            $('#yoloLoadText').html(Math.round(countedrows / totalrows * 100) + "%");
        }
        pagesLoad++;
        if (pagesLoad == pages) {
            pagesLoad = 0;
            countedrows = 0;
            totalrows = null;
            $('#yoloLoader').remove();
            $('#am_widget_Farm').show();
            initStuff();
        } else {
            getPage(pages);
        }
    });
}

/****************************Helper Functions****************************/
function doTime(millsec) {
    cansend = false;
    setTimeout(function() {
        cansend = true;
    }, millsec);
}

function checkPage() {
    if (!(window.game_data.screen === 'am_farm')) {
        getFA();
    }
}

function getNewVillage(way) {
    try {
        currentIncrement = incrementalSwitchPage;
        pagesLoaded = false;
        Timing.pause();
        fadeThanksToCheese();
        openLoader();
        var vlink = link[0] + way + window.game_data.village.id + link[1];

        $.ajax({
            type: "GET",
            url: vlink,
            error: function(xhr, statusText) {
                alert("Error: " + statusText);
                $('#fader').remove();
                $('#loaders').remove();
            },
            success: function(data) {
                debugData = data.split("TribalWars.updateGameData(")[1].split("});")[0] + "}";
                debugData = JSON.parse(debugData);
                debugData.village.bonus = null;
                TribalWars.updateGameData(debugData);
                var v = $(data);
                var title = data.split('<title>')[1].split('</title>')[0];

                var viviId = debugData.village.id;
                game_data.village.id = viviId;

                $('#header_info').html($('#header_info', v).html());
                $('#topContainer').html($('#topContainer', v).html());
                $('#contentContainer').html($('#contentContainer', v).html());
                $('#quickbar_inner').html($('#quickbar_inner', v).html());
                $('head').find('title').html(title);
                $('#fader').remove();
                $('#loaders').remove();
                pagesLoaded = true;
                Timing.resetTickHandlers();
                Timing.pause();
                incrementalSwitchPage++;
                run();
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function getFA() {
    pagesLoaded = false;
    fadeThanksToCheese();
    openLoader();
    var vlink = link[0] + window.game_data.village.id + link[1];
    $.getScript("https://dsfr.innogamescdn.com/assets/" + window.location.host.substring(0,4) + "/b557b6ba364cab734dc830da16cb24de/js/game/Accountmanager.js_", function() {
        $.ajax({
            type: "GET",
            url: vlink,
            error: function(xhr, statusText) {
                alert("Error: " + statusText);
                $('#fader').remove();
                $('#loaders').remove();
            },
            success: function(data) {
                debugData = data.split("TribalWars.updateGameData(")[1].split("});")[0] + "}";
                debugData = JSON.parse(debugData);
                TribalWars.updateGameData(debugData);
                var v = $(data);
                var title = data.split('<title>')[1].split('</title>')[0];
                $('#header_info').html($('#header_info', v).html());
                $('#topContainer').html($('#topContainer', v).html());
                $('#contentContainer').html($('#contentContainer', v).html());
                $('head').find('title').html(title);
                $('#fader').remove();
                $('#loaders').remove();
                pagesLoaded = true;
                incrementalSwitchPage++;
                run();
            }
        });
    });
}

function fadeThanksToCheese() {
    var fader = document.createElement('div');
    fader.id = 'fader';
    fader.style.position = 'fixed';
    fader.style.height = '100%';
    fader.style.width = '100%';
    fader.style.backgroundColor = 'black';
    fader.style.top = '0px';
    fader.style.left = '0px';
    fader.style.opacity = '0.6';
    fader.style.zIndex = '12000';
    document.body.appendChild(fader);
}

function openLoader() {
    var currentIncremental = incrementalSwitchPage;
    var widget = document.createElement('div');
    widget.id = 'loaders';
    widget.style.position = 'fixed';
    widget.style.width = '24px';
    widget.style.height = '24px';
    widget.style.top = '50%';
    widget.style.left = '50%';
    $(widget).css("margin-left", "-12px");
    $(widget).css("margin-top", "-12px");
    widget.style.zIndex = 13000;
    $(widget).append($("<img src='graphic/throbber.gif' height='24' width='24'></img>"));
    $('#contentContainer').append($(widget));

    setTimeout(function() {
        if (incrementalSwitchPage <= currentIncremental) {
            UI.ErrorMessage(t("error_load"));
            var currentURL = document.URL.split("village=") + "village=" + game_data.village.id + "&screen=am_farm";
            window.location.href = currentURL;
            console.log("La page a mis trop de temps à se charger.");
        }
    }, 4000);
}

// Debug purpose, close all loading event
function closeLoader() {
    $('#fader').remove();
    $('#loaders').remove();
}

function onlyNum(obj) {
    obj.value = obj.value.replace(/\D/g, '');
    if (obj.value == '') {
        obj.value = 0;
    }
}

/****************************????????****************************/
function showKeys() {
    if ($('#showKeys').html().indexOf('>') == -1) {
        $('#showKeys').html('Keys >>>');
    } else {
        $('#showKeys').html('Keys <<<');
    }
}

// Start the script
run();