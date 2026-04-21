/*
 * Script Name: Single Village Planner
 * Version: v2.1.4
 * Last Updated: 2025-08-15
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: t14559753
 * Approved Date: 2021-02-11
 * Mod: Asio
 * Update: Fixed travel time calculations for accuracy
 */

/* Copyright (c) RedAlert
By uploading a user-generated mod (script) for use with Tribal Wars, you grant InnoGames a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, reproduce, distribute, publicly display, modify, and create derivative works of the mod. This license permits InnoGames to incorporate the mod into any aspect of the game and its related services, including promotional and commercial endeavors, without any requirement for compensation or attribution to you. InnoGames is entitled but not obligated to name you when exercising its rights. You represent and warrant that you have the legal right to grant this license and that the mod does not infringe upon any third-party rights. You are - with the exception of claims of infringement by third parties – not liable for any usage of the mod by InnoGames. German law applies.
*/

var scriptData = {
    name: 'Single Village Planner',
    version: 'v2.1.4',
    author: 'RedAlert',
    authorUrl: 'https://twscripts.dev/',
    helpLink:
        'https://forum.tribalwars.net/index.php?threads/single-village-planner.286667/',
};

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Constants
var LS_PREFIX = 'raSingleVillagePlanner';
var TIME_INTERVAL = 60 * 60 * 1000 * 24 * 365;
var GROUP_ID = localStorage.getItem(`${LS_PREFIX}_chosen_group`) ?? 0;
var LAST_UPDATED_TIME = localStorage.getItem(`${LS_PREFIX}_last_updated`) ?? 0;

// Globals
var unitInfo,
    troopCounts = [],
    currentDestinationVillage = '',
    currentLandingTime = null;

// Translations
var translations = {
    en_DK: {
        'Single Village Planner': 'Single Village Planner',
        Help: 'Help',
        'This script can only be run on a single village screen!':
            'This script can only be run on a single village screen!',
        Village: 'Village',
        'Calculate Launch Times': 'Calculate Launch Times',
        Reset: 'Reset',
        'Launch times are being calculated ...':
            'Launch times are being calculated ...',
        'Missing user input!': 'Missing user input!',
        'Landing Time': 'Landing Time',
        'This village has no unit selected!':
            'This village has no unit selected!',
        'Prio.': 'Prio.',
        'No possible combinations found!': 'No possible combinations found!',
        'Export Plan as BB Code': 'Export Plan as BB Code',
        'Plan for:': 'Plan for:',
        'Landing Time:': 'Landing Time:',
        Unit: 'Unit',
        'Launch Time': 'Launch Time',
        Command: 'Command',
        Status: 'Status',
        Send: 'Send',
        From: 'From',
        Priority: 'Priority',
        'Early send': 'Early send',
        'Landing time was updated!': 'Landing time was updated!',
        'Error fetching village groups!': 'Error fetching village groups!',
        'Dist.': 'Dist.',
        'Travel Time': 'Travel Time',
        'Send Time': 'Send Time',
        'Villages list could not be fetched!':
            'Villages list could not be fetched!',
        Group: 'Group',
        'Export Plan without tables': 'Export Plan without tables',
        'Chosen group was reset!': 'Chosen group was reset!',
        'Reset Chosen Group': 'Reset Chosen Group',
        'Script configuration was reset!': 'Script configuration was reset!',
        'Click on a unit to see send time': 'Click on a unit to see send time',
    },
    el_GR: {
        'Single Village Planner': 'Ατομικό Πλάνο Χωριού',
        Help: 'Βοήθεια',
        'This script can only be run on a single village screen!':
            'Αυτό το Script τρέχει απο Πληροφορίες Χωριού!',
        Village: 'Χωριό',
        'Calculate Launch Times': 'Υπολογισμός Χρόνου Εκκίνησης',
        Reset: 'Επαναφορά',
        'Launch times are being calculated ...':
            'Οι χρόνοι εκκίνησης υπολογίζονται ...',
        'Missing user input!': 'Λείπουν τα δεδομένα!',
        'Landing Time': 'Χρόνος Ολοκλήρωσης',
        'This village has no unit selected!':
            'Το χωριό δεν έχει επιλεγμένες μονάδες!',
        'Prio.': 'Προτ.',
        'No possible combinations found!': 'Δεν βρέθηκαν δυνατές συνδυασμοί!',
        'Export Plan as BB Code': 'Εξαγωγή πλάνου σε BB Code',
        'Plan for:': 'Πλάνο για:',
        'Landing Time:': 'Χρόνος Ολοκλήρωσης:',
        Unit: 'Μονάδα',
        'Launch Time': 'Χρόνος Εκκίνησης',
        Command: 'Εντολή',
        Status: 'Κατάσταση',
        Send: 'Αποστολή',
        From: 'Από',
        Priority: 'Προτεραιότητα',
        'Early send': 'Πρώιμη αποστολή',
        'Landing time was updated!': 'Ο χρόνος ολοκλήρωσης ενημερώθηκε!',
        'Error fetching village groups!':
            'Σφάλμα κατά την ανάκτηση ομάδων χωριών!',
        'Dist.': 'Απόστ.',
        'Travel Time': 'Χρόνος Ταξιδιού',
        'Send Time': 'Χρόνος Αποστολής',
        'Villages list could not be fetched!':
            'Δεν μπορεί να ανακτηθεί η λίστα χωριών!',
        Group: 'Ομάδα',
        'Export Plan without tables': 'Εξαγωγή πλάνου χωρίς πίνακες',
        'Chosen group was reset!': 'Η επιλεγμένη ομάδα επαναφορά αποκαταστάθηκε!',
        'Reset Chosen Group': 'Επαναφορά επιλεγμένης ομάδας',
        'Script configuration was reset!': 'Η ρύθμιση του script επαναφορά αποκαταστάθηκε!',
        'Click on a unit to see send time': 'Κάντε κλικ σε μια μονάδα για να δείτε τον χρόνο αποστολής',
    },
    fr_FR: {
        'Single Village Planner': "Planificateur d'attaque village unique",
        Help: 'Aide',
        'This script can only be run on a single village screen!':
            "Ce script doit être lancé depuis la vu d'un village!",
        Village: 'Village',
        'Calculate Launch Times': "Calcul heure d'envoi",
        Reset: 'Réinitialiser',
        'Launch times are being calculated ...':
            "Heures d'envoi en cours de calcul ...",
        'Missing user input!': 'Aucun joueur renseigné!',
        'Landing Time': "Heure d'arrivé",
        'This village has no unit selected!':
            "Ce village n'a aucune unité sélectionnée!",
        'Prio.': 'Prio.',
        'No possible combinations found!': 'Aucune combinaison possible!',
        'Export Plan as BB Code': "Exporter le plan d'attaque en bb-code",
        'Plan for:': 'Plan pour:',
        'Landing Time:': "Heure d'arrivé:",
        Unit: 'Unité',
        'Launch Time': "Heure d'envoi",
        Command: 'Ordre',
        Status: 'Status',
        Send: 'Envoyer',
        From: 'Origine',
        Priority: 'Priorité',
        'Early send': 'Envoi tôt',
        'Landing time was updated!': "Heure d'arrivé mis à jour!",
        'Error fetching village groups!':
            'Erreur lors de la récupération des groupes de villages!',
        'Dist.': 'Dist.',
        'Travel Time': 'Temps de trajet',
        'Send Time': "Heure d'envoi",
        'Villages list could not be fetched!':
            'Impossible de récupérer la liste des villages!',
        Group: 'Groupe',
        'Export Plan without tables': 'Exporter le plan sans tableau',
        'Chosen group was reset!': 'Groupe sélectionné réinitialisé!',
        'Reset Chosen Group': 'Réinitialiser groupe(s) sélectionnée(s)',
        'Script configuration was reset!': 'Configuration réinitialisée!',
        'Click on a unit to see send time': 'Cliquez sur une unité pour voir son heure d\'envoi',
    },
};

// Init Debug
initDebug();

// Fetch unit config only when needed
if (LAST_UPDATED_TIME !== null) {
    if (Date.parse(new Date()) >= LAST_UPDATED_TIME + TIME_INTERVAL) {
        fetchUnitInfo();
    } else {
        unitInfo = JSON.parse(localStorage.getItem(`${LS_PREFIX}_unit_info`));
    }
} else {
    fetchUnitInfo();
}

// Initialize Attack Planner
async function initAttackPlanner(groupId) {
    // run on script load
    const groups = await fetchVillageGroups();
    troopCounts = await fetchTroopsForCurrentGroup(groupId);
    let villages = await fetchAllPlayerVillagesByGroup(groupId);

    // Get destination village coordinates
    currentDestinationVillage = getDestinationVillage();

    // Get current landing time if set
    const landingTimeInput = jQuery('#raLandingTime').val();
    if (landingTimeInput && landingTimeInput.trim() !== '') {
        currentLandingTime = getLandingTime(landingTimeInput.trim());
    }

    villages = villages.map((item) => {
        const distance = calculateDistance(item.coords, currentDestinationVillage);
        return {
            ...item,
            distance: parseFloat(distance.toFixed(2)),
        };
    });

    villages = villages.sort((a, b) => {
        return a.distance - b.distance;
    });

    const content = prepareContent(villages, groups);
    renderUI(content);

    // after script has been loaded events
    setTimeout(function () {
        // set a default landing time
        const today = new Date().toLocaleString('en-GB').replace(',', '');
        if (!jQuery('#raLandingTime').val()) {
            jQuery('#raLandingTime').val(today);
            currentLandingTime = getLandingTime(today);
        }

        // handle non-archer worlds
        if (!game_data.units.includes('archer')) {
            jQuery('.archer-world').hide();
        }

        // handle non-paladin worlds
        if (!game_data.units.includes('knight')) {
            jQuery('.paladin-world').hide();
        }

        // Update all travel times initially
        updateAllTravelTimes();
    }, 100);

    // scroll to element to focus user's attention
    jQuery('html,body').animate(
        { scrollTop: jQuery('#raSingleVillagePlanner').offset().top - 8 },
        'slow'
    );

    // action handlers
    choseUnit();
    changeVillagePriority();
    calculateLaunchTimes();
    resetAll();
    fillLandingTimeFromCommand();
    filterVillagesByChosenGroup();
    setAllUnits();
    resetGroup();
    updateTravelTimeOnLandingChange();
}

// Helper: Get destination village coordinates
function getDestinationVillage() {
    let destinationVillage = '';

    const selectors = [
        '#content_value table table tr:eq(3) td:eq(1)',
        '#content_value table table tr:nth-child(4) td:nth-child(2)',
        '#content_value .vis tbody tr:eq(3) td:eq(1)',
        '#content_value table table td:eq(2)',
        '#content_value td:contains("|")'
    ];

    for (const selector of selectors) {
        const element = jQuery(selector);
        if (element.length) {
            let text = element.text().trim();
            const match = text.match(/(\d+)\|(\d+)/);
            if (match) {
                destinationVillage = match[0];
                console.debug(`Found destination village with selector "${selector}": ${destinationVillage}`);
                break;
            }
        }
    }

    if (!destinationVillage) {
        const pageText = jQuery('#content_value').html();
        const coordMatch = pageText.match(/(\d+)\|(\d+)/);
        if (coordMatch) {
            destinationVillage = coordMatch[0];
            console.debug(`Extracted destination village from HTML: ${destinationVillage}`);
        }
    }

    return destinationVillage;
}

// FIXED: Calculate travel time for a unit
function calculateTravelTime(unitType, distance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        return null;
    }

    // Unit speed is in minutes per field
    const minutesPerField = parseFloat(unitInfo.config[unitType].speed);

    // Travel time in minutes
    const travelTimeMinutes = distance * minutesPerField;

    // Convert to milliseconds
    const travelTimeMs = Math.round(travelTimeMinutes * 60 * 1000);

    // Calculate hours, minutes, seconds for display
    const totalSeconds = Math.floor(travelTimeMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0) formatted += `${minutes}m `;
    formatted += `${seconds}s`;

    return {
        minutes: travelTimeMinutes,
        milliseconds: travelTimeMs,
        formatted: formatted.trim()
    };
}

// NEW: Format travel time as hours:minutes:seconds
function formatTravelTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes % 1) * 60);

    if (hours > 0) {
        return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
        return `${mins}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

// FIXED: Calculate send time based on landing time and travel time
function calculateSendTime(landingTime, travelTimeMs) {
    if (!landingTime) return null;
    const sendTime = new Date(landingTime.getTime() - travelTimeMs);
    return sendTime;
}

// FIXED: Update travel time display for a village
function updateTravelTimeForVillage(villageRow, unitType, distance) {
    const distanceCell = villageRow.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        const originalDistance = distanceCell.attr('data-original-distance');
        if (originalDistance) {
            distanceCell.html(parseFloat(originalDistance).toFixed(2));
        }
        distanceCell.attr('data-showing', 'distance');
        return;
    }

    const travelTime = calculateTravelTime(unitType, distance);
    if (!travelTime) {
        const originalDistance = distanceCell.attr('data-original-distance');
        if (originalDistance) {
            distanceCell.html(parseFloat(originalDistance).toFixed(2));
        }
        return;
    }

    const sendTime = calculateSendTime(currentLandingTime, travelTime.milliseconds);
    const serverTime = getServerTime();

    if (sendTime && sendTime >= serverTime) {
        const formattedSendTime = formatDateTime(sendTime);
        // Show the send time with the travel time as tooltip
        distanceCell.html(`<span style="color: green; font-weight: bold; cursor: help;" title="Travel time: ${travelTime.formatted}">🕒 ${formattedSendTime}</span>`);
        distanceCell.attr('data-showing', 'sendtime');
        distanceCell.attr('data-send-time', sendTime.getTime());
        distanceCell.attr('data-travel-time', travelTime.formatted);
    } else if (sendTime && sendTime < serverTime) {
        distanceCell.html(`<span style="color: red; font-weight: bold; cursor: help;" title="Travel time: ${travelTime.formatted}">⚠️ Send time passed</span>`);
        distanceCell.attr('data-showing', 'warning');
    } else {
        const originalDistance = distanceCell.attr('data-original-distance');
        if (originalDistance) {
            distanceCell.html(parseFloat(originalDistance).toFixed(2));
        }
        distanceCell.attr('data-showing', 'distance');
    }
}

// NEW: Update all travel times based on selected units
function updateAllTravelTimes() {
    if (!currentLandingTime) {
        const landingTimeVal = jQuery('#raLandingTime').val();
        if (landingTimeVal && landingTimeVal.trim() !== '') {
            currentLandingTime = getLandingTime(landingTimeVal.trim());
        } else {
            return;
        }
    }

    jQuery('#raAttackPlannerTable tbody tr').each(function() {
        const row = jQuery(this);
        const selectedUnitImg = row.find('img.ra-selected-unit').first();
        const distanceCell = row.find('td:eq(1)');
        let distance = parseFloat(distanceCell.attr('data-original-distance'));

        if (isNaN(distance)) {
            distance = parseFloat(distanceCell.text());
        }

        if (selectedUnitImg.length && !isNaN(distance)) {
            const unitType = selectedUnitImg.attr('data-unit-type');
            updateTravelTimeForVillage(row, unitType, distance);
        } else {
            // Show distance if no unit selected
            const originalDistance = distanceCell.attr('data-original-distance');
            if (originalDistance) {
                distanceCell.html(parseFloat(originalDistance).toFixed(2));
            }
            distanceCell.attr('data-showing', 'distance');
        }
    });
}

// Modified: Action Handler for unit selection with travel time update
function choseUnit() {
    jQuery('.ra-table td img').on('click', function() {
        const row = jQuery(this).closest('tr');
        const wasSelected = jQuery(this).hasClass('ra-selected-unit');
        const distanceCell = row.find('td:eq(1)');
        let distance = parseFloat(distanceCell.attr('data-original-distance'));

        if (isNaN(distance)) {
            distance = parseFloat(distanceCell.text());
        }

        if (!wasSelected) {
            // Deselect all other units in this row
            row.find('img').not(this).removeClass('ra-selected-unit');
            jQuery(this).addClass('ra-selected-unit');

            // Update travel time for this row
            const unitType = jQuery(this).attr('data-unit-type');

            if (!isNaN(distance) && currentLandingTime) {
                updateTravelTimeForVillage(row, unitType, distance);
            }
        } else {
            jQuery(this).removeClass('ra-selected-unit');
            // Reset to show distance
            const originalDistance = distanceCell.attr('data-original-distance');
            if (originalDistance) {
                distanceCell.html(parseFloat(originalDistance).toFixed(2));
            }
            distanceCell.attr('data-showing', 'distance');
        }

        // Update row selection state
        const isAnyUnitSelected = row.find('img.ra-selected-unit').length > 0;
        if (isAnyUnitSelected) {
            row.addClass('ra-selected-village');
        } else {
            row.find('td .icon').removeClass('ra-priority-village');
            row.removeClass('ra-selected-village');
        }
    });
}

// NEW: Update travel times when landing time changes
function updateTravelTimeOnLandingChange() {
    jQuery('#raLandingTime').on('change keyup', function() {
        const landingTimeVal = jQuery(this).val().trim();
        if (landingTimeVal !== '') {
            currentLandingTime = getLandingTime(landingTimeVal);
            updateAllTravelTimes();
        }
    });
}

// Helper: Prepare UI
function prepareContent(villages, groups) {
    const villagesTable = renderVillagesTable(villages);
    const groupsFilter = renderGroupsFilter(groups);

    return `
        <div class="ra-mb15">
            <div class="ra-grid">
                <div>
                    <label for="raLandingTime">
                        ${tt('Landing Time')} (dd/mm/yyyy HH:mm:ss)
                    </label>
                    <input id="raLandingTime" type="text" value="" />
                    <small style="display: block; margin-top: 5px;">${tt('Click on a unit to see send time')}</small>
                </div>
                <div>
                    <label>${tt('Group')}</label>
                    ${groupsFilter}
                </div>
            </div>
        </div>
        <div class="ra-mb15">
            ${villagesTable}
        </div>
        <div class="ra-mb15">
            <a href="javascript:void(0);" id="calculateLaunchTimes" class="btn btn-confirm-yes">
                ${tt('Calculate Launch Times')}
            </a>
            <a href="javascript:void(0);" id="resetAll" class="btn btn-confirm-no">
                ${tt('Reset')}
            </a>
            <a href="javascript:void(0);" id="resetGroupBtn" class="btn">
                ${tt('Reset Chosen Group')}
            </a>
        </div>
        <div style="display:none;" class="ra-mb-15" id="raVillagePlanner">
            <div class="ra-mb15">
                <label for="raExportPlanBBCode">${tt('Export Plan as BB Code')}</label>
                <textarea id="raExportPlanBBCode" readonly></textarea>
            </div>
            <div>
                <label for="raExportPlanCode">${tt('Export Plan without tables')}</label>
                <textarea id="raExportPlanCode" readonly></textarea>
            </div>
        </div>
    `;
}

// Render UI
function renderUI(body) {
    const content = `
        <div class="ra-single-village-planner" id="raSingleVillagePlanner">
            <h2>${tt(scriptData.name)}</h2>
            <div class="ra-single-village-planner-data">
                ${body}
            </div>
            <br>
            <small>
                <strong>
                    ${tt(scriptData.name)} ${scriptData.version}
                </strong> -
                <a href="${scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">
                    ${scriptData.author}
                </a> -
                <a href="${scriptData.helpLink}" target="_blank" rel="noreferrer noopener">
                    ${tt('Help')}
                </a>
            </small>
        </div>
        <style>
            .ra-single-village-planner { position: relative; display: block; width: auto; height: auto; clear: both; margin: 0 auto 15px; padding: 10px; border: 1px solid #603000; box-sizing: border-box; background: #f4e4bc; }
            .ra-single-village-planner * { box-sizing: border-box; }
            .ra-single-village-planner input[type="text"] { width: 100%; padding: 5px 10px; border: 1px solid #000; font-size: 16px; line-height: 1; }
            .ra-single-village-planner label { font-weight: 600 !important; margin-bottom: 5px; display: block; }
            .ra-single-village-planner select { width: 100%; padding: 5px 10px; border: 1px solid #000; font-size: 16px; line-height: 1; }
            .ra-single-village-planner textarea { width: 100%; height: 100px; resize: none; padding: 5px 10px; }
            .ra-single-village-planner .ra-grid { display: grid; grid-template-columns: 1fr 150px; grid-gap: 0 20px; }
            .ra-table { border-collapse: separate !important; border-spacing: 2px !important; }
            .ra-table tbody tr:hover td { background-color: #ffdd30 !important; }
            .ra-table tbody tr.ra-selected-village td { background-color: #ffe563 !important; }
            .ra-table th { font-size: 14px; }
            .ra-table th,
            .ra-table td { padding: 4px; text-align: center; }
            .ra-table td a { word-break: break-all; }
            .ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }
            .ra-table td img { padding: 2px; border: 2px solid transparent; cursor: pointer; }
            .ra-table td img.ra-selected-unit { border: 2px solid #ff0000; }
            .ra-table a:focus { color: blue; }
            .ra-table th .icon { transform: scale(1.05); margin: 0; }
            .ra-table th img { cursor: pointer; }
            .ra-table th.ra-unit-toggle:hover { background-color: rgba(97, 48, 0, 0.6) !important; background-image: none !important; cursor: pointer !important; }
            .ra-table td .icon { filter: grayscale(100%); transform: scale(1.05); margin: 0; cursor: pointer; }
            .ra-table td .icon.ra-priority-village { filter: none !important; }
            .ra-table td span { transform: translateY(-6px); position: relative; display: inline-block; }
            .ra-chosen-command td { background-color: #ffe563; }
            .ra-groups-filter { display: inline-block; margin: 0; padding: 0; text-align: center; }
            .ra-groups-filter li { display: inline-block; list-style-type: none; margin: 0 10px; }
            .ra-groups-filter li:first-child { margin-left: 0; }
            .ra-groups-filter li:last-child { margin-right: 0; }
            .ra-selected-group { color: #21881e; }
            .ra-single-village-planner .btn { padding: 3px 4px; }
            .ra-fw600 { font-weight: 600; }
            .ra-mb15 { margin-bottom: 15px; }
            .ra-dblock { display: block; }
            .ra-dflex { display: flex; }
            .ra-text-left { text-align: left !important; }
        </style>
    `;

    if (jQuery('.ra-single-village-planner').length < 1) {
        jQuery('#contentContainer').prepend(content);
    } else {
        jQuery('.ra-single-village-planner-data').html(body);
    }
}

// Action Handler: Change the village send priority
function changeVillagePriority() {
    jQuery('#raAttackPlannerTable tbody td .icon').on('click', function () {
        const isUnitSelectedForVillage = jQuery(this)
            .parent()
            .parent()
            .find('.ra-selected-unit')[0];
        if (isUnitSelectedForVillage) {
            jQuery(this).toggleClass('ra-priority-village');
        } else {
            UI.ErrorMessage(tt('This village has no unit selected!'));
        }
    });
}

// Action Handler: Grab the "chosen" villages and calculate their launch times based on the unit type
function calculateLaunchTimes() {
    jQuery('#calculateLaunchTimes').on('click', function (e) {
        e.preventDefault();

        const landingTimeString = jQuery('#raLandingTime').val().trim();

        // Get destination village coordinates again for the calculation
        let destinationVillage = getDestinationVillage();

        let villagesUnitsToSend = [];

        // collect user input
        jQuery('#raAttackPlannerTable .ra-selected-unit').each(function () {
            const id = parseInt(jQuery(this).attr('data-village-id'));
            const unit = jQuery(this).attr('data-unit-type');
            const coords = jQuery(this).attr('data-village-coords');
            const isPrioVillage = jQuery(this)
                .parent()
                .parent()
                .find('td .ra-priority-village')[0]
                ? true
                : false;

            const distance = calculateDistance(coords, destinationVillage);

            villagesUnitsToSend.push({
                id: id,
                unit: unit,
                coords: coords,
                highPrio: isPrioVillage,
                distance: distance,
            });
        });

        if (villagesUnitsToSend.length > 0 && landingTimeString !== '') {
            UI.SuccessMessage(tt('Launch times are being calculated ...'));
            const landingTime = getLandingTime(landingTimeString);
            const plans = getPlans(
                landingTime,
                destinationVillage,
                villagesUnitsToSend
            );

            if (plans.length > 0) {
                const planBBCode = getBBCodePlans(plans, destinationVillage);
                const plansCode = getCodePlans(plans, destinationVillage);
                jQuery('#raVillagePlanner').show();
                jQuery('#raExportPlanBBCode').val(planBBCode);
                jQuery('#raExportPlanCode').val(plansCode);
            } else {
                UI.ErrorMessage(tt('No possible combinations found!'));
                jQuery('#raVillagePlanner').hide();
                jQuery('#raExportPlanBBCode').val('');
                jQuery('#raExportPlanCode').val('');
            }
        } else {
            UI.ErrorMessage(tt('Missing user input!'));
        }
    });
}

// Action Handler: Reset all user input
function resetAll() {
    jQuery('#resetAll').on('click', function (e) {
        e.preventDefault();
        initAttackPlanner(GROUP_ID);
    });
}

// Action Handler: When a command is clicked fill landing time with the landing time of the command
function fillLandingTimeFromCommand() {
    jQuery(
        '#commands_outgoings table tbody tr.command-row, #commands_incomings table tbody tr.command-row'
    ).on('click', function () {
        jQuery('#commands_outgoings table tbody tr.command-row').removeClass(
            'ra-chosen-command'
        );
        jQuery(this).addClass('ra-chosen-command');

        const commandLandingTime =
            parseInt(jQuery(this).find('td:eq(2) span').attr('data-endtime')) *
            1000;

        const landingTimeDateTime = new Date(commandLandingTime);
        const serverDateTime = getServerTime();
        const localDateTime = new Date();

        const diffTime = Math.abs(localDateTime - serverDateTime);
        const newLandingTime = Math.ceil(
            Math.abs(landingTimeDateTime - diffTime)
        );
        const newLandingTimeObj = new Date(newLandingTime);
        const formattedNewLandingTime = formatDateTime(newLandingTimeObj);

        jQuery('#raLandingTime').val(formattedNewLandingTime);
        currentLandingTime = getLandingTime(formattedNewLandingTime);
        updateAllTravelTimes();
        UI.SuccessMessage(tt('Landing time was updated!'));
    });
}

// Action Handler: Filter villages shown by selected group
function filterVillagesByChosenGroup() {
    jQuery('#raGroupsFilter').on('change', function (e) {
        e.preventDefault();
        initAttackPlanner(e.target.value);
        localStorage.setItem(`${LS_PREFIX}_chosen_group`, e.target.value);
    });
}

// Action Handler: Reset chosen group
function resetGroup() {
    jQuery('#resetGroupBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
        UI.SuccessMessage(tt('Chosen group was reset!'));
        initAttackPlanner(0);
    });
}

// Action Handler: Set all villages to unit
function setAllUnits() {
    jQuery('#raAttackPlannerTable thead tr th.ra-unit-toggle').on(
        'click',
        function () {
            const chosenUnit = jQuery(this).find('img').attr('data-set-unit');
            jQuery('#raAttackPlannerTable tbody tr').each(function () {
                jQuery(this)
                    .find(`img[data-unit-type="${chosenUnit}"]`)
                    .trigger('click');
            });
        }
    );
}

// FIXED: Get plans for export
function getPlans(landingTime, destinationVillage, villagesUnitsToSend) {
    let plans = [];

    villagesUnitsToSend.forEach((item) => {
        const launchTime = getLaunchTime(item.unit, landingTime, item.distance);
        if (launchTime) {
            const plan = {
                destination: destinationVillage,
                landingTime: landingTime,
                distance: item.distance,
                unit: item.unit,
                highPrio: item.highPrio,
                villageId: item.id,
                launchTime: launchTime,
                coords: item.coords,
                launchTimeFormatted: formatDateTime(new Date(launchTime)),
            };
            plans.push(plan);
        }
    });

    // Sort by launch time (earliest first)
    plans.sort((a, b) => {
        return a.launchTime - b.launchTime;
    });

    console.debug('plans', plans);

    // Filter only valid launch times (not in the past)
    const serverTime = getServerTime();
    const filteredPlans = plans.filter((item) => {
        return item.launchTime >= serverTime.getTime();
    });

    console.debug('filteredPlans', filteredPlans);

    return filteredPlans;
}

// Add a debug function to verify unit speeds
function debugUnitSpeeds() {
    if (unitInfo && unitInfo.config) {
        console.debug('Unit speeds (minutes per field):');
        for (const [unit, data] of Object.entries(unitInfo.config)) {
            console.debug(`  ${unit}: ${data.speed} min/field`);
        }
    }
}

// Call debug after unit info loads
const originalFetchUnitInfo = fetchUnitInfo;
fetchUnitInfo = function() {
    originalFetchUnitInfo();
    setTimeout(debugUnitSpeeds, 1000);
};

// Export plan as BB Code
function getBBCodePlans(plans, destinationVillage) {
    const landingTime = jQuery('#raLandingTime').val().trim();

    let bbCode = `[size=12][b]${tt('Plan for:')}[/b] ${destinationVillage}\n[b]${tt('Landing Time:')}[/b] ${landingTime}[/size]\n\n`;
    bbCode += `[table][**]${tt('Unit')}[||]${tt('From')}[||]${tt('Priority')}[||]${tt('Launch Time')}[||]${tt('Command')}[||]${tt('Status')}[/**]\n`;

    plans.forEach((plan) => {
        const { unit, highPrio, coords, villageId, launchTimeFormatted } = plan;
        const [toX, toY] = destinationVillage.split('|');
        const priority = highPrio ? tt('Early send') : '';
        let rallyPointData = game_data.market !== 'uk' ? `&x=${toX}&y=${toY}` : '';
        let sitterData = game_data.player.sitter > 0 ? `t=${game_data.player.id}` : '';
        let commandUrl = `/game.php?${sitterData}&village=${villageId}&screen=place${rallyPointData}`;

        bbCode += `[*][unit]${unit}[/unit][|] ${coords} [|][b][color=#ff0000]${priority}[/color][/b][|]${launchTimeFormatted}[|][url=${window.location.origin}${commandUrl}]${tt('Send')}[/url][|]\n`;
    });

    bbCode += `[/table]`;
    return bbCode;
}

// Export plans without table
function getCodePlans(plans, destinationVillage) {
    const landingTime = jQuery('#raLandingTime').val().trim();

    let planCode = `[size=12][b]${tt('Plan for:')}[/b] ${destinationVillage}\n[b]${tt('Landing Time:')}[/b] ${landingTime}[/size]\n\n`;

    plans.forEach((plan) => {
        const { unit, highPrio, coords, villageId, launchTimeFormatted } = plan;
        const [toX, toY] = destinationVillage.split('|');
        const priority = highPrio ? tt('Early send') : '';
        let rallyPointData = game_data.market !== 'uk' ? `&x=${toX}&y=${toY}` : '';
        let sitterData = game_data.player.sitter > 0 ? `t=${game_data.player.id}` : '';
        let commandUrl = `/game.php?${sitterData}&village=${villageId}&screen=place${rallyPointData}`;

        planCode += `[unit]${unit}[/unit] ${coords} [b][color=#ff0000]${priority}[/color][/b]${launchTimeFormatted}[url=${window.location.origin}${commandUrl}]${tt('Send')}[/url]\n`;
    });

    return planCode;
}

// Helper: Calculate distance between 2 villages with validation
function calculateDistance(villageA, villageB) {
    if (!villageA || !villageB || typeof villageA !== 'string' || typeof villageB !== 'string') {
        console.error('Invalid coordinates:', { villageA, villageB });
        return 0;
    }

    const partsA = villageA.split('|');
    const partsB = villageB.split('|');

    if (partsA.length !== 2 || partsB.length !== 2) {
        console.error('Malformed coordinates:', { villageA, villageB, partsA, partsB });
        return 0;
    }

    const x1 = parseInt(partsA[0]);
    const y1 = parseInt(partsA[1]);
    const x2 = parseInt(partsB[0]);
    const y2 = parseInt(partsB[1]);

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        console.error('NaN coordinates after parsing:', { x1, y1, x2, y2 });
        return 0;
    }

    const deltaX = Math.abs(x1 - x2);
    const deltaY = Math.abs(y1 - y2);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    return distance;
}

// Helper: Get launch time of command
// FIXED: Get launch time of command (used in export)
function getLaunchTime(unit, landingTime, distance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unit]) {
        return null;
    }

    // Unit speed is in minutes per field
    const minutesPerField = parseFloat(unitInfo.config[unit].speed);

    // Travel time in minutes
    const travelTimeMinutes = distance * minutesPerField;

    // Convert to milliseconds
    const travelTimeMs = travelTimeMinutes * 60 * 1000;

    // Calculate send time
    const sendTime = new Date(landingTime.getTime() - travelTimeMs);

    // Round to nearest second to match Tribal Wars
    const roundedSendTime = Math.round(sendTime.getTime() / 1000) * 1000;

    return roundedSendTime;
}

// Helper: Get server time
function getServerTime() {
    const serverTime = jQuery('#serverTime').text();
    const serverDate = jQuery('#serverDate').text();
    const [day, month, year] = serverDate.split('/');
    const serverTimeFormatted = year + '-' + month + '-' + day + ' ' + serverTime;
    const serverTimeObject = new Date(serverTimeFormatted);
    return serverTimeObject;
}

// Helper: Format date
function formatDateTime(date) {
    let currentDateTime = new Date(date);
    var currentYear = currentDateTime.getFullYear();
    var currentMonth = currentDateTime.getMonth();
    var currentDate = currentDateTime.getDate();
    var currentHours = '' + currentDateTime.getHours();
    var currentMinutes = '' + currentDateTime.getMinutes();
    var currentSeconds = '' + currentDateTime.getSeconds();
    currentMonth = currentMonth + 1;
    currentMonth = '' + currentMonth;
    currentMonth = currentMonth.padStart(2, '0');
    currentHours = currentHours.padStart(2, '0');
    currentMinutes = currentMinutes.padStart(2, '0');
    currentSeconds = currentSeconds.padStart(2, '0');
    let formatted_date = currentDate + '/' + currentMonth + '/' + currentYear + ' ' + currentHours + ':' + currentMinutes + ':' + currentSeconds;
    return formatted_date;
}

// Helper: Get landing time date object
function getLandingTime(landingTime) {
    const [landingDay, landingHour] = landingTime.split(' ');
    const [day, month, year] = landingDay.split('/');
    const landingTimeFormatted = year + '-' + month + '-' + day + ' ' + landingHour;
    const landingTimeObject = new Date(landingTimeFormatted);
    return landingTimeObject;
}

// Helper: Render own villages table
function renderVillagesTable(villages) {
    if (villages.length) {
        let villagesTable = `
        <table id="raAttackPlannerTable" class="ra-table" width="100%">
            <thead>
                <tr>
                    <th class="ra-text-left" width="25%">
                        ${tt('Village')} (${villages.length})
                    </th>
                    <th class="5%">
                        ${tt('Send Time')} / ${tt('Dist.')}
                    </th>
                    <th width="5%">
                        ${tt('Prio.')}
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_spear.webp" data-set-unit="spear">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_sword.webp" data-set-unit="sword">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_axe.webp" data-set-unit="axe">
                    </th>
                    <th class="archer-world ra-unit-toggle">
                        <img src="/graphic/unit/unit_archer.webp" data-set-unit="archer">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_spy.webp" data-set-unit="spy">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_light.webp" data-set-unit="light">
                    </th>
                    <th class="archer-world ra-unit-toggle">
                        <img src="/graphic/unit/unit_marcher.webp" data-set-unit="marcher">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_heavy.webp" data-set-unit="heavy">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_ram.webp" data-set-unit="ram">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_catapult.webp" data-set-unit="catapult">
                    </th>
                    <th class="paladin-world ra-unit-toggle">
                        <img src="/graphic/unit/unit_knight.webp" data-set-unit="knight">
                    </th>
                    <th class="ra-unit-toggle">
                        <img src="/graphic/unit/unit_snob.webp" data-set-unit="snob">
                    </th>
                </tr>
            </thead>
            <tbody>
    `;

        const villageCombinations = [];
        villages.forEach((village) => {
            troopCounts.forEach((villageTroops) => {
                if (villageTroops.villageId === village.id) {
                    villageCombinations.push({
                        ...village,
                        ...villageTroops,
                    });
                }
            });
        });

        villageCombinations.forEach((village) => {
            const {
                name,
                coords,
                id,
                spear,
                sword,
                axe,
                archer,
                spy,
                light,
                marcher,
                heavy,
                ram,
                catapult,
                knight,
                snob,
                distance,
            } = village;

            const continent = getContinentByCoord(coords);
            const link = game_data.link_base_pure + `info_village&id=${id}`;

            villagesTable += `
                <tr>
                    <td class="ra-text-left" width="25%">
                        <a href="${link}" target="_blank" rel="noopener noreferrer">
                            ${name} (${coords}) K${continent}
                        </a>
                    </td>
                    <td width="5%" data-original-distance="${distance}">
                        ${!isNaN(distance) ? distance.toFixed(2) : '0'}
                    </td>
                    <td width="5%">
                        <span class="icon header favorite_add"></span>
                    </td>
                    <td>
                        <img data-unit-type="spear" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_spear.webp">
                        <span>${formatAsNumber(spear)}</span>
                    </td>
                    <td>
                        <img data-unit-type="sword" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_sword.webp">
                        <span>${formatAsNumber(sword)}</span>
                    </td>
                    <td>
                        <img data-unit-type="axe" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_axe.webp">
                        <span>${formatAsNumber(axe)}</span>
                    </td>
                    <td class="archer-world">
                        <img data-unit-type="archer" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_archer.webp">
                        <span>${formatAsNumber(archer)}</span>
                    </td>
                    <td>
                        <img data-unit-type="spy" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_spy.webp">
                        <span>${formatAsNumber(spy)}</span>
                    </td>
                    <td>
                        <img data-unit-type="light" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_light.webp">
                        <span>${formatAsNumber(light)}</span>
                    </td>
                    <td class="archer-world">
                        <img data-unit-type="marcher" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_marcher.webp">
                        <span>${formatAsNumber(marcher)}</span>
                    </td>
                    <td>
                        <img data-unit-type="heavy" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_heavy.webp">
                        <span>${formatAsNumber(heavy)}</span>
                    </td>
                    <td>
                        <img data-unit-type="ram" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_ram.webp">
                        <span>${formatAsNumber(ram)}</span>
                    </td>
                    <td>
                        <img data-unit-type="catapult" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_catapult.webp">
                        <span>${formatAsNumber(catapult)}</span>
                    </td>
                    <td class="paladin-world">
                        <img data-unit-type="knight" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_knight.webp">
                        <span>${formatAsNumber(knight)}</span>
                    </td>
                    <td>
                        <img data-unit-type="snob" data-village-id="${id}" data-village-coords="${coords}" src="/graphic/unit/unit_snob.webp">
                        <span>${formatAsNumber(snob)}</span>
                    </td>
                </tr>
        `;
        });

        villagesTable += `
            </tbody>
        </table>
    `;
        return villagesTable;
    } else {
        return `<p><b>${tt('Villages list could not be fetched!')}</b><br></p>`;
    }
}

// Helper: Render groups filter
function renderGroupsFilter(groups) {
    const groupId = localStorage.getItem(`${LS_PREFIX}_chosen_group`) || 0;
    let groupsFilter = `
        <select name="ra_groups_filter" id="raGroupsFilter">
    `;

    for (const [_, group] of Object.entries(groups.result)) {
        const { group_id, name } = group;
        const isSelected = parseInt(group_id) === parseInt(groupId) ? 'selected' : '';
        if (name !== undefined) {
            groupsFilter += `
                <option value="${group_id}" ${isSelected}>
                    ${name}
                </option>
            `;
        }
    }

    groupsFilter += `
        </select>
    `;
    return groupsFilter;
}

// Helper: Process coordinate and extract coordinate continent
function getContinentByCoord(coord) {
    if (!coord) return '';
    const coordParts = coord.split('|');
    return coordParts[1].charAt(0) + coordParts[0].charAt(0);
}

// Helper: Fetch player villages by group
async function fetchAllPlayerVillagesByGroup(groupId) {
    let villagesByGroup = [];

    try {
        const url = game_data.link_base_pure + 'groups&ajax=load_villages_from_group';
        villagesByGroup = await jQuery
            .post({
                url: url,
                data: { group_id: groupId },
            })
            .then((response) => {
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(response.html, 'text/html');
                const tableRows = jQuery(htmlDoc).find('#group_table > tbody > tr').not(':eq(0)');
                let villagesList = [];

                tableRows.each(function () {
                    const villageId = jQuery(this).find('td:eq(0) a').attr('data-village-id') ??
                        jQuery(this).find('td:eq(0) a').attr('href').match(/\d+/)[0];
                    const villageName = jQuery(this).find('td:eq(0)').text().trim();
                    const villageCoords = jQuery(this).find('td:eq(1)').text().trim();

                    villagesList.push({
                        id: parseInt(villageId),
                        name: villageName,
                        coords: villageCoords,
                    });
                });
                return villagesList;
            })
            .catch((error) => {
                UI.ErrorMessage(tt('Villages list could not be fetched!'));
                return [];
            });
    } catch (error) {
        console.error(`${scriptInfo()} Error:`, error);
        UI.ErrorMessage(tt('Villages list could not be fetched!'));
        return [];
    }
    return villagesByGroup;
}

// Helper: Fetch village groups
async function fetchVillageGroups() {
    const villageGroups = await jQuery
        .get(game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu')
        .then((response) => response)
        .catch((error) => {
            UI.ErrorMessage('Error fetching village groups!');
            console.error(`${scriptInfo()} Error:`, error);
        });
    return villageGroups;
}

// Helper: Fetch World Unit Info
function fetchUnitInfo() {
    jQuery
        .ajax({
            url: '/interface.php?func=get_unit_info',
        })
        .done(function (response) {
            unitInfo = xml2json($(response));
            localStorage.setItem(`${LS_PREFIX}_unit_info`, JSON.stringify(unitInfo));
            localStorage.setItem(`${LS_PREFIX}_last_updated`, Date.parse(new Date()));
        });
}

// Helper: Fetch home troop counts for current group
async function fetchTroopsForCurrentGroup() {
    const groupId = jQuery('.ra-group-filter.btn-confirm-yes').attr('data-group-id');
    const troopsForGroup = await jQuery
        .get(game_data.link_base_pure + `overview_villages&mode=combined&group=${groupId}&`)
        .then((response) => {
            const htmlDoc = jQuery.parseHTML(response);
            const combinedTableRows = jQuery(htmlDoc).find('#combined_table tr.nowrap');
            const combinedTableHead = jQuery(htmlDoc).find('#combined_table tr:eq(0) th');
            const homeTroops = [];
            const combinedTableHeader = [];

            jQuery(combinedTableHead).each(function () {
                const thImage = jQuery(this).find('img').attr('src');
                if (thImage) {
                    let thImageFilename = thImage.split('/').pop();
                    thImageFilename = thImageFilename.replace('.webp', '');
                    combinedTableHeader.push(thImageFilename);
                } else {
                    combinedTableHeader.push(null);
                }
            });

            combinedTableRows.each(function () {
                let rowTroops = {};
                combinedTableHeader.forEach((tableHeader, index) => {
                    if (tableHeader && tableHeader.includes('unit_')) {
                        const villageId = jQuery(this).find('td:eq(1) span.quickedit-vn').attr('data-id');
                        const unitType = tableHeader.replace('unit_', '');
                        rowTroops = {
                            ...rowTroops,
                            villageId: parseInt(villageId),
                            [unitType]: parseInt(jQuery(this).find(`td:eq(${index})`).text()),
                        };
                    }
                });
                homeTroops.push(rowTroops);
            });
            return homeTroops;
        })
        .catch((error) => {
            UI.ErrorMessage(tt('An error occured while fetching troop counts!'));
            console.error(`${scriptInfo()} Error:`, error);
        });
    return troopsForGroup;
}

// Helper: XML to JSON converter
var xml2json = function ($xml) {
    var data = {};
    $.each($xml.children(), function (i) {
        var $this = $(this);
        if ($this.children().length > 0) {
            data[$this.prop('tagName')] = xml2json($this);
        } else {
            data[$this.prop('tagName')] = $.trim($this.text());
        }
    });
    return data;
};

// Helper: Clear script configuration
function resetScriptConfig() {
    localStorage.removeItem(`${LS_PREFIX}_unit_info`);
    localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
    localStorage.removeItem(`${LS_PREFIX}_last_updated`);
    UI.SuccessMessage(tt('Script configuration was reset!'));
}

// Helper: Format as number
function formatAsNumber(number) {
    return parseInt(number).toLocaleString('de');
}

// Helper: Get parameter by name
function getParameterByName(name, url = window.location.href) {
    return new URL(url).searchParams.get(name);
}

// Helper: Generates script info
function scriptInfo() {
    return `[${scriptData.name} ${scriptData.version}]`;
}

// Helper: Prints universal debug information
function initDebug() {
    console.debug(`${scriptInfo()} It works 🚀!`);
    console.debug(`${scriptInfo()} HELP:`, scriptData.helpLink);
    if (DEBUG) {
        console.debug(`${scriptInfo()} Market:`, game_data.market);
        console.debug(`${scriptInfo()} World:`, game_data.world);
        console.debug(`${scriptInfo()} Screen:`, game_data.screen);
        console.debug(`${scriptInfo()} Game Version:`, game_data.majorVersion);
        console.debug(`${scriptInfo()} Game Build:`, game_data.version);
        console.debug(`${scriptInfo()} Locale:`, game_data.locale);
    }
}

// Helper: Text Translator
function tt(string) {
    var gameLocale = game_data.locale;
    if (translations[gameLocale] !== undefined) {
        return translations[gameLocale][string];
    } else {
        return translations['en_DK'][string];
    }
}

// Initialize Script
(async function () {
    const gameScreen = getParameterByName('screen');
    if (gameScreen === 'info_village') {
        initAttackPlanner(GROUP_ID);
    } else {
        UI.ErrorMessage(tt('This script can only be run on a single village screen!'));
    }
})();