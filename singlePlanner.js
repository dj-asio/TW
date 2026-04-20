/*
 * Script Name: Single Village Planner
 * Version: v2.1.3
 * Last Updated: 2025-08-15
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: t14559753
 * Approved Date: 2021-02-11
 * Mod: JawJaw
 * Update: Added dynamic travel time display based on selected unit
 */

/* Copyright (c) RedAlert
By uploading a user-generated mod (script) for use with Tribal Wars, you grant InnoGames a perpetual, irrevocable, worldwide, royalty-free, non-exclusive license to use, reproduce, distribute, publicly display, modify, and create derivative works of the mod. This license permits InnoGames to incorporate the mod into any aspect of the game and its related services, including promotional and commercial endeavors, without any requirement for compensation or attribution to you. InnoGames is entitled but not obligated to name you when exercising its rights. You represent and warrant that you have the legal right to grant this license and that the mod does not infringe upon any third-party rights. You are - with the exception of claims of infringement by third parties – not liable for any usage of the mod by InnoGames. German law applies.
*/

var scriptData = {
    name: 'Single Village Planner',
    version: 'v2.1.3',
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
    // ... (keep other translations from previous version)
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

    setTimeout(function () {
        const today = new Date().toLocaleString('en-GB').replace(',', '');
        if (!jQuery('#raLandingTime').val()) {
            jQuery('#raLandingTime').val(today);
            currentLandingTime = getLandingTime(today);
        }

        if (!game_data.units.includes('archer')) {
            jQuery('.archer-world').hide();
        }
        if (!game_data.units.includes('knight')) {
            jQuery('.paladin-world').hide();
        }

        // Update all travel times initially
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
        }
    }

    return destinationVillage;
}

// NEW: Calculate travel time for a unit
function calculateTravelTime(unitType, distance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        return null;
    }

    const msPerSec = 1000;
    const secsPerMin = 60;
    const msPerMin = msPerSec * secsPerMin;

    const unitSpeed = unitInfo.config[unitType].speed;
    const travelTimeMinutes = distance * unitSpeed;
    const travelTimeMs = travelTimeMinutes * msPerMin;

    return {
        minutes: travelTimeMinutes,
        milliseconds: travelTimeMs,
        formatted: formatTravelTime(travelTimeMinutes)
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

// NEW: Calculate send time based on landing time and travel time
function calculateSendTime(landingTime, travelTimeMs) {
    if (!landingTime) return null;
    const sendTime = new Date(landingTime.getTime() - travelTimeMs);
    return sendTime;
}

// NEW: Update the distance column to show travel time or send time for selected unit
function updateTravelTimeForVillage(villageRow, unitType, distance, villageCoords) {
    const distanceCell = villageRow.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        // Show distance if no unit selected or no landing time
        distanceCell.html(distance.toFixed(2));
        distanceCell.attr('data-original-distance', distance.toFixed(2));
        distanceCell.attr('data-showing', 'distance');
        return;
    }

    const travelTime = calculateTravelTime(unitType, distance);
    if (!travelTime) {
        distanceCell.html(distance.toFixed(2));
        return;
    }

    const sendTime = calculateSendTime(currentLandingTime, travelTime.milliseconds);
    if (sendTime && sendTime >= getServerTime()) {
        const formattedSendTime = formatDateTime(sendTime);
        distanceCell.html(`<span style="color: green; font-weight: bold;" title="${tt('Travel Time')}: ${travelTime.formatted}">🕒 ${formattedSendTime}</span>`);
        distanceCell.attr('data-showing', 'sendtime');
        distanceCell.attr('data-send-time', sendTime.getTime());
        distanceCell.attr('data-travel-time', travelTime.formatted);
    } else if (sendTime && sendTime < getServerTime()) {
        distanceCell.html(`<span style="color: red; font-weight: bold;" title="${tt('Travel Time')}: ${travelTime.formatted}">⚠️ ${tt('Send Time')} passed</span>`);
        distanceCell.attr('data-showing', 'warning');
    } else {
        distanceCell.html(distance.toFixed(2));
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
        const distance = parseFloat(row.find('td:eq(1)').attr('data-original-distance') || row.find('td:eq(1)').text());
        const villageCoords = row.find('img.ra-selected-unit').first().attr('data-village-coords');

        if (selectedUnitImg.length && !isNaN(distance)) {
            const unitType = selectedUnitImg.attr('data-unit-type');
            updateTravelTimeForVillage(row, unitType, distance, villageCoords);
        } else {
            // Show distance if no unit selected
            const distanceCell = row.find('td:eq(1)');
            if (distanceCell.attr('data-original-distance')) {
                distanceCell.html(parseFloat(distanceCell.attr('data-original-distance')).toFixed(2));
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

        if (!wasSelected) {
            // Deselect all other units in this row
            row.find('img').not(this).removeClass('ra-selected-unit');
            jQuery(this).addClass('ra-selected-unit');

            // Update travel time for this row
            const unitType = jQuery(this).attr('data-unit-type');
            const distance = parseFloat(row.find('td:eq(1)').attr('data-original-distance') || row.find('td:eq(1)').text());
            const villageCoords = jQuery(this).attr('data-village-coords');

            if (!isNaN(distance) && currentLandingTime) {
                updateTravelTimeForVillage(row, unitType, distance, villageCoords);
            }
        } else {
            jQuery(this).removeClass('ra-selected-unit');
            // Reset to show distance
            const distanceCell = row.find('td:eq(1)');
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
    jQuery('#raLandingTime').on('change', function() {
        const landingTimeVal = jQuery(this).val().trim();
        if (landingTimeVal !== '') {
            currentLandingTime = getLandingTime(landingTimeVal);
            updateAllTravelTimes();
        }
    });
}

// Modified: Prepare UI with updated column header
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

// Modified: Render villages table with data-original-distance attribute
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

// Keep all other helper functions from the previous version...
// (calculateDistance, getServerTime, formatDateTime, getLandingTime, etc. remain the same)

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

// Helper: Get launch time of command
function getLaunchTime(unit, landingTime, distance) {
    const msPerSec = 1000;
    const secsPerMin = 60;
    const msPerMin = msPerSec * secsPerMin;
    const unitSpeed = unitInfo.config[unit].speed;
    const unitTime = distance * unitSpeed * msPerMin;
    const launchTime = new Date();
    launchTime.setTime(Math.round((landingTime - unitTime) / msPerSec) * msPerSec);
    return launchTime.getTime();
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

// Keep all other original functions (fetchUnitInfo, fetchTroopsForCurrentGroup, fetchVillageGroups, fetchAllPlayerVillagesByGroup, etc.)
// ... (include them from the previous version)

// Initialize Script
(async function () {
    const gameScreen = getParameterByName('screen');
    if (gameScreen === 'info_village') {
        initAttackPlanner(GROUP_ID);
    } else {
        UI.ErrorMessage(tt('This script can only be run on a single village screen!'));
    }
})();