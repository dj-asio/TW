/*
 * Script Name: Single Village Planner
 * Version: v2.2.2
 * Last Updated: 2026-04-21
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: t14559753
 * Approved Date: 2021-02-11
 * Mod: Asio
 * Update: Auto-detect world settings + FIXED time calculations (no rounding)
 */

/* Copyright (c) RedAlert */
var scriptData = {
    name: 'Single Village Planner',
    version: 'v2.2.2',
    author: 'RedAlert',
    authorUrl: 'https://twscripts.dev/',
    helpLink: 'https://forum.tribalwars.net/index.php?threads/single-village-planner.286667/',
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
    currentLandingTime = null,
    worldSpeed = 1.0,
    unitSpeedModifier = 1.0;

// Translations
var translations = {
    en_DK: {
        'Single Village Planner': 'Single Village Planner',
        Help: 'Help',
        'This script can only be run on a single village screen!': 'This script can only be run on a single village screen!',
        Village: 'Village',
        'Calculate Launch Times': 'Calculate Launch Times',
        Reset: 'Reset',
        'Launch times are being calculated ...': 'Launch times are being calculated ...',
        'Missing user input!': 'Missing user input!',
        'Landing Time': 'Landing Time',
        'This village has no unit selected!': 'This village has no unit selected!',
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
        'Send Time': 'Send Time',
        'Travel Time': 'Travel Time',
        'Villages list could not be fetched!': 'Villages list could not be fetched!',
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
        'This script can only be run on a single village screen!': 'Αυτό το Script τρέχει απο Πληροφορίες Χωριού!',
        Village: 'Χωριό',
        'Calculate Launch Times': 'Υπολογισμός Χρόνου Εκκίνησης',
        Reset: 'Επαναφορά',
        'Launch times are being calculated ...': 'Οι χρόνοι εκκίνησης υπολογίζονται ...',
        'Missing user input!': 'Λείπουν τα δεδομένα!',
        'Landing Time': 'Χρόνος Ολοκλήρωσης',
        'This village has no unit selected!': 'Το χωριό δεν έχει επιλεγμένες μονάδες!',
        'Prio.': 'Προτ.',
        'No possible combinations found!': 'Δεν βρέθηκαν δυνατοί συνδυασμοί!',
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
        'Error fetching village groups!': 'Σφάλμα κατά την ανάκτηση ομάδων χωριών!',
        'Dist.': 'Απόστ.',
        'Send Time': 'Χρόνος Αποστολής',
        'Travel Time': 'Χρόνος Ταξιδιού',
        'Villages list could not be fetched!': 'Δεν μπορεί να ανακτηθεί η λίστα χωριών!',
        Group: 'Ομάδα',
        'Export Plan without tables': 'Εξαγωγή πλάνου χωρίς πίνακες',
        'Chosen group was reset!': 'Η επιλεγμένη ομάδα επαναφέρθηκε!',
        'Reset Chosen Group': 'Επαναφορά επιλεγμένης ομάδας',
        'Script configuration was reset!': 'Η ρύθμιση του script επαναφέρθηκε!',
        'Click on a unit to see send time': 'Κάντε κλικ σε μια μονάδα για να δείτε τον χρόνο αποστολής',
    }
};

// Init Debug
function initDebug() {
    console.debug(`[${scriptData.name} ${scriptData.version}] It works 🚀!`);
    if (DEBUG) {
        console.debug('Market:', game_data.market);
        console.debug('World:', game_data.world);
        console.debug('Screen:', game_data.screen);
    }
}
initDebug();

// Fetch world configuration automatically
async function fetchWorldConfig() {
    console.debug('Fetching world configuration...');

    const cachedSpeed = localStorage.getItem(`${LS_PREFIX}_world_speed`);
    const cachedUnitSpeed = localStorage.getItem(`${LS_PREFIX}_unit_speed_modifier`);
    const cacheTime = localStorage.getItem(`${LS_PREFIX}_config_timestamp`);

    if (cachedSpeed && cachedUnitSpeed && cacheTime && (Date.now() - parseInt(cacheTime) < TIME_INTERVAL)) {
        worldSpeed = parseFloat(cachedSpeed);
        unitSpeedModifier = parseFloat(cachedUnitSpeed);
        console.debug(`Using cached world config: Speed=${worldSpeed}x, Unit Speed=${unitSpeedModifier}x`);
        return { worldSpeed, unitSpeedModifier };
    }

    try {
        const response = await jQuery.ajax({
            url: '/interface.php?func=get_config',
            method: 'GET',
            dataType: 'xml'
        });

        const $xml = jQuery(response);
        const speed = parseFloat($xml.find('speed').text());
        const unitSpeed = parseFloat($xml.find('unit_speed').text());

        if (!isNaN(speed)) worldSpeed = speed;
        if (!isNaN(unitSpeed)) unitSpeedModifier = unitSpeed;

        localStorage.setItem(`${LS_PREFIX}_world_speed`, worldSpeed);
        localStorage.setItem(`${LS_PREFIX}_unit_speed_modifier`, unitSpeedModifier);
        localStorage.setItem(`${LS_PREFIX}_config_timestamp`, Date.now());

        console.debug(`World Config: Speed=${worldSpeed}x, Unit Speed=${unitSpeedModifier}x`);

    } catch (error) {
        console.error('Failed to fetch world config:', error);
        if (typeof game_data !== 'undefined') {
            worldSpeed = game_data.world_speed || 1.0;
            unitSpeedModifier = game_data.unit_speed || 1.0;
        }
    }

    return { worldSpeed, unitSpeedModifier };
}

// Fetch unit info
async function loadUnitInfo() {
    if (LAST_UPDATED_TIME !== null) {
        if (Date.parse(new Date()) >= LAST_UPDATED_TIME + TIME_INTERVAL) {
            await fetchUnitInfo();
        } else {
            unitInfo = JSON.parse(localStorage.getItem(`${LS_PREFIX}_unit_info`));
            console.debug('Loaded unit info from cache');
        }
    } else {
        await fetchUnitInfo();
    }
}

// CORE: Calculate exact send time - NO ROUNDING
function calculateExactSendTime(unitType, distance, landingTime) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        return null;
    }

    const baseSpeedMinutes = parseFloat(unitInfo.config[unitType].speed);
    const speedMultiplier = worldSpeed * unitSpeedModifier;

    // Travel time in milliseconds - EXACT calculation, NO ROUNDING
    const travelTimeMinutes = (distance * baseSpeedMinutes) / speedMultiplier;
    const travelTimeMs = travelTimeMinutes * 60 * 1000;

    // Calculate send time - DO NOT round or truncate
    const sendTime = new Date(landingTime.getTime() - travelTimeMs);

    return sendTime;
}

// Get travel time formatted string
function getTravelTimeFormatted(unitType, distance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        return '';
    }

    const baseSpeedMinutes = parseFloat(unitInfo.config[unitType].speed);
    const speedMultiplier = worldSpeed * unitSpeedModifier;
    const travelTimeMinutes = (distance * baseSpeedMinutes) / speedMultiplier;

    const totalSeconds = Math.floor(travelTimeMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0) formatted += `${minutes}m `;
    formatted += `${seconds}s`;

    return formatted.trim();
}

// Helper: Calculate distance between 2 villages
function calculateDistance(villageA, villageB) {
    if (!villageA || !villageB) return 0;
    const partsA = villageA.split('|');
    const partsB = villageB.split('|');
    if (partsA.length !== 2 || partsB.length !== 2) return 0;

    const x1 = parseInt(partsA[0]);
    const y1 = parseInt(partsA[1]);
    const x2 = parseInt(partsB[0]);
    const y2 = parseInt(partsB[1]);
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return 0;

    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// Helper: Get server time
function getServerTime() {
    const serverTime = jQuery('#serverTime').text();
    const serverDate = jQuery('#serverDate').text();
    const [day, month, year] = serverDate.split('/');
    const serverTimeFormatted = year + '-' + month + '-' + day + ' ' + serverTime;
    return new Date(serverTimeFormatted);
}

// Helper: Format date - PRESERVES EXACT TIME
function formatDateTime(date) {
    if (!date || isNaN(date.getTime())) return '';

    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Helper: Get landing time date object
function getLandingTime(landingTime) {
    const [landingDay, landingHour] = landingTime.split(' ');
    const [day, month, year] = landingDay.split('/');
    const landingTimeFormatted = year + '-' + month + '-' + day + ' ' + landingHour;
    return new Date(landingTimeFormatted);
}

// Get destination village coordinates
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
                break;
            }
        }
    }

    if (!destinationVillage) {
        const pageText = jQuery('#content_value').html();
        const coordMatch = pageText.match(/(\d+)\|(\d+)/);
        if (coordMatch) {
            destinationVillage = coordMatch[0];
        }
    }

    return destinationVillage;
}

// Initialize Attack Planner
async function initAttackPlanner(groupId) {
    console.debug('=== Initializing Single Village Planner ===');

    await fetchWorldConfig();
    await loadUnitInfo();

    const groups = await fetchVillageGroups();
    troopCounts = await fetchTroopsForCurrentGroup(groupId);
    let villages = await fetchAllPlayerVillagesByGroup(groupId);

    currentDestinationVillage = getDestinationVillage();

    villages = villages.map((item) => {
        const distance = calculateDistance(item.coords, currentDestinationVillage);
        return {
            ...item,
            distance: parseFloat(distance.toFixed(2)),
        };
    });

    villages = villages.sort((a, b) => a.distance - b.distance);

    const content = prepareContent(villages, groups);
    renderUI(content);

    setTimeout(function () {
        const today = new Date().toLocaleString('en-GB').replace(',', '');
        jQuery('#raLandingTime').val(today);
        currentLandingTime = getLandingTime(today);

        if (!game_data.units.includes('archer')) {
            jQuery('.archer-world').hide();
        }
        if (!game_data.units.includes('knight')) {
            jQuery('.paladin-world').hide();
        }

        updateAllTravelTimes();
    }, 100);

    jQuery('html,body').animate(
        { scrollTop: jQuery('#raSingleVillagePlanner').offset().top - 8 },
        'slow'
    );

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

// Update travel time display for a village
function updateTravelTimeForVillage(villageRow, unitType, distance) {
    const distanceCell = villageRow.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        const originalDistance = distanceCell.attr('data-original-distance');
        distanceCell.html(originalDistance || distance.toFixed(2));
        return;
    }

    const sendTime = calculateExactSendTime(unitType, distance, currentLandingTime);
    const serverTime = getServerTime();
    const travelTimeFormatted = getTravelTimeFormatted(unitType, distance);

    if (sendTime && sendTime >= serverTime) {
        const formattedSendTime = formatDateTime(sendTime);
        distanceCell.html(`<span style="color: green; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelTimeFormatted}">🕒 ${formattedSendTime}</span>`);
    } else if (sendTime && sendTime < serverTime) {
        distanceCell.html(`<span style="color: red; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelTimeFormatted}">⚠️ ${tt('Send Time')} passed</span>`);
    } else {
        distanceCell.html(distance.toFixed(2));
    }
}

// Update all travel times
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
        }
    });
}

// Action Handler: Unit selection
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
            row.find('img').not(this).removeClass('ra-selected-unit');
            jQuery(this).addClass('ra-selected-unit');

            const unitType = jQuery(this).attr('data-unit-type');

            if (!isNaN(distance) && currentLandingTime) {
                updateTravelTimeForVillage(row, unitType, distance);
            }
        } else {
            jQuery(this).removeClass('ra-selected-unit');
            const originalDistance = distanceCell.attr('data-original-distance');
            distanceCell.html(parseFloat(originalDistance).toFixed(2));
        }

        const isAnyUnitSelected = row.find('img.ra-selected-unit').length > 0;
        if (isAnyUnitSelected) {
            row.addClass('ra-selected-village');
        } else {
            row.find('td .icon').removeClass('ra-priority-village');
            row.removeClass('ra-selected-village');
        }
    });
}

// Action Handler: Change village priority
function changeVillagePriority() {
    jQuery('#raAttackPlannerTable tbody td .icon').on('click', function () {
        const isUnitSelectedForVillage = jQuery(this).parent().parent().find('.ra-selected-unit')[0];
        if (isUnitSelectedForVillage) {
            jQuery(this).toggleClass('ra-priority-village');
        } else {
            UI.ErrorMessage(tt('This village has no unit selected!'));
        }
    });
}

// Update travel times when landing time changes
function updateTravelTimeOnLandingChange() {
    jQuery('#raLandingTime').on('change keyup', function() {
        const landingTimeVal = jQuery(this).val().trim();
        if (landingTimeVal) {
            currentLandingTime = getLandingTime(landingTimeVal);
            updateAllTravelTimes();
        }
    });
}

// Action Handler: Calculate launch times (EXPORT)
function calculateLaunchTimes() {
    jQuery('#calculateLaunchTimes').on('click', function (e) {
        e.preventDefault();

        const landingTimeString = jQuery('#raLandingTime').val().trim();
        let destinationVillage = getDestinationVillage();

        let villagesUnitsToSend = [];

        jQuery('#raAttackPlannerTable .ra-selected-unit').each(function () {
            const id = parseInt(jQuery(this).attr('data-village-id'));
            const unit = jQuery(this).attr('data-unit-type');
            const coords = jQuery(this).attr('data-village-coords');
            const isPrioVillage = jQuery(this).parent().parent().find('td .ra-priority-village')[0] ? true : false;
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
            const plans = getPlans(landingTime, destinationVillage, villagesUnitsToSend);

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

// Get plans for export - NO ROUNDING
function getPlans(landingTime, destinationVillage, villagesUnitsToSend) {
    let plans = [];

    villagesUnitsToSend.forEach((item) => {
        const sendTime = calculateExactSendTime(item.unit, item.distance, landingTime);
        if (sendTime) {
            const plan = {
                destination: destinationVillage,
                landingTime: landingTime,
                distance: item.distance,
                unit: item.unit,
                highPrio: item.highPrio,
                villageId: item.id,
                launchTime: sendTime.getTime(),
                coords: item.coords,
                launchTimeFormatted: formatDateTime(sendTime),
            };
            plans.push(plan);
        }
    });

    plans.sort((a, b) => a.launchTime - b.launchTime);

    const serverTime = getServerTime();
    const filteredPlans = plans.filter((item) => item.launchTime >= serverTime.getTime());

    return filteredPlans;
}

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

        planCode += `[unit]${unit}[/unit] ${coords} [b][color=#ff0000]${priority}[/color][/b] ${launchTimeFormatted} [url=${window.location.origin}${commandUrl}]${tt('Send')}[/url]\n`;
    });

    return planCode;
}

// Reset all
function resetAll() {
    jQuery('#resetAll').on('click', function (e) {
        e.preventDefault();
        initAttackPlanner(GROUP_ID);
    });
}

// Fill landing time from command
function fillLandingTimeFromCommand() {
    jQuery('#commands_outgoings table tbody tr.command-row, #commands_incomings table tbody tr.command-row').on('click', function () {
        jQuery('#commands_outgoings table tbody tr.command-row').removeClass('ra-chosen-command');
        jQuery(this).addClass('ra-chosen-command');

        const commandLandingTime = parseInt(jQuery(this).find('td:eq(2) span').attr('data-endtime')) * 1000;
        const landingTimeDateTime = new Date(commandLandingTime);
        const serverDateTime = getServerTime();
        const localDateTime = new Date();
        const diffTime = Math.abs(localDateTime - serverDateTime);
        const newLandingTime = Math.ceil(Math.abs(landingTimeDateTime - diffTime));
        const newLandingTimeObj = new Date(newLandingTime);
        const formattedNewLandingTime = formatDateTime(newLandingTimeObj);

        jQuery('#raLandingTime').val(formattedNewLandingTime);
        currentLandingTime = getLandingTime(formattedNewLandingTime);
        updateAllTravelTimes();
        UI.SuccessMessage(tt('Landing time was updated!'));
    });
}

// Filter villages by chosen group
function filterVillagesByChosenGroup() {
    jQuery('#raGroupsFilter').on('change', function (e) {
        e.preventDefault();
        initAttackPlanner(e.target.value);
        localStorage.setItem(`${LS_PREFIX}_chosen_group`, e.target.value);
    });
}

// Reset chosen group
function resetGroup() {
    jQuery('#resetGroupBtn').on('click', function (e) {
        e.preventDefault();
        localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
        UI.SuccessMessage(tt('Chosen group was reset!'));
        initAttackPlanner(0);
    });
}

// Set all villages to unit
function setAllUnits() {
    jQuery('#raAttackPlannerTable thead tr th.ra-unit-toggle').on('click', function () {
        const chosenUnit = jQuery(this).find('img').attr('data-set-unit');
        jQuery('#raAttackPlannerTable tbody tr').each(function () {
            jQuery(this).find(`img[data-unit-type="${chosenUnit}"]`).trigger('click');
        });
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
            .ra-table th, .ra-table td { padding: 4px; text-align: center; }
            .ra-table td a { word-break: break-all; }
            .ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }
            .ra-table td img { padding: 2px; border: 2px solid transparent; cursor: pointer; }
            .ra-table td img.ra-selected-unit { border: 2px solid #ff0000; }
            .ra-table td .icon.ra-priority-village { filter: none !important; }
            .ra-table td span { transform: translateY(-6px); position: relative; display: inline-block; }
            .ra-chosen-command td { background-color: #ffe563; }
            .ra-single-village-planner .btn { padding: 3px 4px; }
            .ra-fw600 { font-weight: 600; }
            .ra-mb15 { margin-bottom: 15px; }
            .ra-text-left { text-align: left !important; }
        </style>
    `;

    if (jQuery('.ra-single-village-planner').length < 1) {
        jQuery('#contentContainer').prepend(content);
    } else {
        jQuery('.ra-single-village-planner-data').html(body);
    }
}

// Render villages table
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
                        ${tt('Send Time')}
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
                name, coords, id, spear, sword, axe, archer, spy, light, marcher, heavy, ram, catapult, knight, snob, distance,
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
    let groupsFilter = `<select name="ra_groups_filter" id="raGroupsFilter">`;

    if (groups && groups.result) {
        for (const [_, group] of Object.entries(groups.result)) {
            const { group_id, name } = group;
            const isSelected = parseInt(group_id) === parseInt(groupId) ? 'selected' : '';
            if (name !== undefined) {
                groupsFilter += `<option value="${group_id}" ${isSelected}>${name}</option>`;
            }
        }
    }

    groupsFilter += `</select>`;
    return groupsFilter;
}

// Helper: Get continent by coordinates
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
        villagesByGroup = await jQuery.post({
            url: url,
            data: { group_id: groupId },
        }).then((response) => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(response.html, 'text/html');
            const tableRows = jQuery(htmlDoc).find('#group_table > tbody > tr').not(':eq(0)');
            let villagesList = [];
            tableRows.each(function () {
                const villageId = jQuery(this).find('td:eq(0) a').attr('data-village-id') ||
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
        }).catch((error) => {
            UI.ErrorMessage(tt('Villages list could not be fetched!'));
            return [];
        });
    } catch (error) {
        console.error(`Error:`, error);
        UI.ErrorMessage(tt('Villages list could not be fetched!'));
        return [];
    }
    return villagesByGroup;
}

// Helper: Fetch village groups
async function fetchVillageGroups() {
    const villageGroups = await jQuery.get(game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu')
        .then((response) => response)
        .catch((error) => {
            UI.ErrorMessage(tt('Error fetching village groups!'));
            console.error(`Error:`, error);
        });
    return villageGroups;
}

// Helper: Fetch World Unit Info
function fetchUnitInfo() {
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            url: '/interface.php?func=get_unit_info',
        }).done(function (response) {
            unitInfo = xml2json(jQuery(response));
            localStorage.setItem(`${LS_PREFIX}_unit_info`, JSON.stringify(unitInfo));
            localStorage.setItem(`${LS_PREFIX}_last_updated`, Date.parse(new Date()));
            console.debug('Unit info fetched and cached');
            resolve(unitInfo);
        }).fail(reject);
    });
}

// Helper: Fetch home troop counts for current group
async function fetchTroopsForCurrentGroup() {
    const groupId = localStorage.getItem(`${LS_PREFIX}_chosen_group`) || 0;
    const troopsForGroup = await jQuery.get(game_data.link_base_pure + `overview_villages&mode=combined&group=${groupId}&`)
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
        }).catch((error) => {
            UI.ErrorMessage(tt('An error occured while fetching troop counts!'));
            console.error(`Error:`, error);
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

// Helper: Format as number
function formatAsNumber(number) {
    return parseInt(number).toLocaleString('de');
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

// Helper: Get parameter by name
function getParameterByName(name, url = window.location.href) {
    return new URL(url).searchParams.get(name);
}

// Initialize Script
(async function () {
    const gameScreen = getParameterByName('screen');
    if (gameScreen === 'info_village') {
        await initAttackPlanner(GROUP_ID);
    } else {
        UI.ErrorMessage(tt('This script can only be run on a single village screen!'));
    }
})();