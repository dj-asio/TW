/*
 * Script Name: Single Village Planner
 * Version: v2.3.3
 * Last Updated: 2025-08-15
 * Author: RedAlert
 * Mod: Asio - Corrected: only unit_speed affects travel time
 */

var scriptData = {
    name: 'Single Village Planner',
    version: 'v2.3.3',
    author: 'RedAlert',
    authorUrl: 'https://twscripts.dev/',
    helpLink: 'https://forum.tribalwars.net/index.php?threads/single-village-planner.286667/',
};

// Constants
var LS_PREFIX = 'raSingleVillagePlanner';
var TIME_INTERVAL = 60 * 60 * 1000 * 24 * 365;
var GROUP_ID = localStorage.getItem(`${LS_PREFIX}_chosen_group`) ?? 0;
var LAST_UPDATED_TIME = localStorage.getItem(`${LS_PREFIX}_last_updated`) ?? 0;

// Globals
var unitInfo = null;
var troopCounts = [];
var currentDestinationVillage = '';
var currentLandingTime = null;
var unitSpeedModifier = 1.0;  // Only unit_speed matters for travel time

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

function tt(string) {
    var gameLocale = game_data.locale;
    if (translations[gameLocale] !== undefined && translations[gameLocale][string]) {
        return translations[gameLocale][string];
    }
    return translations['en_DK'][string] || string;
}

function formatAsNumber(number) {
    return parseInt(number).toLocaleString('de');
}

// Helper: Get server time
function getServerTime() {
    const serverTime = jQuery('#serverTime').text();
    const serverDate = jQuery('#serverDate').text();
    const [day, month, year] = serverDate.split('/');
    const serverTimeFormatted = year + '-' + month + '-' + day + ' ' + serverTime;
    return new Date(serverTimeFormatted);
}

// Helper: Format date
function formatDateTime(date) {
    if (!date || isNaN(date.getTime())) return '';
    let d = new Date(date);
    let day = d.getDate().toString().padStart(2, '0');
    let month = (d.getMonth() + 1).toString().padStart(2, '0');
    let year = d.getFullYear();
    let hours = d.getHours().toString().padStart(2, '0');
    let minutes = d.getMinutes().toString().padStart(2, '0');
    let seconds = d.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Helper: Get landing time date object
function getLandingTime(landingTime) {
    const [landingDay, landingHour] = landingTime.split(' ');
    const [day, month, year] = landingDay.split('/');
    const landingTimeFormatted = year + '-' + month + '-' + day + ' ' + landingHour;
    return new Date(landingTimeFormatted);
}

// CORRECTED: Calculate distance between 2 villages - EXACT
function calculateDistance(villageA, villageB) {
    if (!villageA || !villageB) return 0;

    // Parse coordinates as integers
    const [x1, y1] = villageA.split('|').map(Number);
    const [x2, y2] = villageB.split('|').map(Number);

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return 0;

    // Calculate exact distance - NO ROUNDING
    const deltaX = x1 - x2;
    const deltaY = y1 - y2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Tribal Wars uses the EXACT distance for travel time calculation
    // Do NOT round here - rounding should only happen for display
    return distance;
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
                console.debug(`Found destination: ${destinationVillage}`);
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

// ============ API FUNCTIONS ============

// Fetch world configuration from API (only unit_speed matters)
async function fetchWorldConfigFromAPI() {
    console.debug('Fetching world configuration from API...');

    return new Promise((resolve, reject) => {
        jQuery.ajax({
            url: '/interface.php?func=get_config',
            method: 'GET',
            dataType: 'xml',
            success: function(xml) {
                const $xml = jQuery(xml);
                // NOTE: <speed> is for BUILDINGS, not used for troop travel
                // Only <unit_speed> matters for troop movement
                const unitSpeed = parseFloat($xml.find('unit_speed').text());

                if (!isNaN(unitSpeed)) unitSpeedModifier = unitSpeed;

                console.debug(`API Config: Unit Speed=${unitSpeedModifier}x (affects travel time)`);
                console.debug(`  unit_speed=1 = normal, 0.5 = half speed (double time), 2 = double speed (half time)`);

                // Cache the config
                localStorage.setItem(`${LS_PREFIX}_unit_speed_modifier`, unitSpeedModifier);
                localStorage.setItem(`${LS_PREFIX}_config_timestamp`, Date.now());

                resolve({ unitSpeedModifier });
            },
            error: function(xhr, status, error) {
                console.error('Failed to fetch world config from API:', error);
                const cachedUnitSpeed = localStorage.getItem(`${LS_PREFIX}_unit_speed_modifier`);

                if (cachedUnitSpeed) {
                    unitSpeedModifier = parseFloat(cachedUnitSpeed);
                    console.debug(`Using cached config: Unit Speed=${unitSpeedModifier}x`);
                    resolve({ unitSpeedModifier });
                } else {
                    unitSpeedModifier = 1.0;
                    console.warn('Using default: Unit Speed=1x');
                    resolve({ unitSpeedModifier });
                }
            }
        });
    });
}

// Fetch unit info from API
function fetchUnitInfoFromAPI() {
    return new Promise((resolve, reject) => {
        const cached = localStorage.getItem(`${LS_PREFIX}_unit_info`);
        const cachedTime = localStorage.getItem(`${LS_PREFIX}_last_updated`);

        if (cached && cachedTime && (Date.now() - parseInt(cachedTime) < TIME_INTERVAL)) {
            unitInfo = JSON.parse(cached);
            console.debug('Unit info loaded from cache');
            resolve();
            return;
        }

        jQuery.ajax({
            url: '/interface.php?func=get_unit_info',
            method: 'GET',
            success: function(response) {
                unitInfo = xml2json(jQuery(response));
                localStorage.setItem(`${LS_PREFIX}_unit_info`, JSON.stringify(unitInfo));
                localStorage.setItem(`${LS_PREFIX}_last_updated`, Date.now());
                console.debug('Unit info fetched from API');

                // Log unit speeds for debugging
                if (unitInfo && unitInfo.config) {
                    console.debug('=== Unit Speeds (minutes per field at unit_speed=1) ===');
                    for (const [unit, data] of Object.entries(unitInfo.config)) {
                        console.debug(`  ${unit}: ${data.speed} min/field`);
                    }
                }
                resolve();
            },
            error: function(error) {
                console.error('Failed to fetch unit info:', error);
                reject(error);
            }
        });
    });
}

// XML to JSON converter
function xml2json($xml) {
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
}

// ============ TIME CALCULATION FUNCTIONS - CORRECTED ============

// Calculate EXACT travel time in milliseconds - NO ROUNDING ANYWHERE
function getExactTravelTimeMs(unitType, exactDistance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        return null;
    }

    const baseSpeedMinutes = parseFloat(unitInfo.config[unitType].speed);

    // Use EXACT distance, NO ROUNDING
    const travelTimeMinutes = (exactDistance * baseSpeedMinutes) / unitSpeedModifier;
    const travelTimeMs = travelTimeMinutes * 60 * 1000;

    return travelTimeMs;
}

// Calculate EXACT send time
function getExactSendTime(unitType, distance, landingTime) {
    const travelMs = getExactTravelTimeMs(unitType, distance);
    if (travelMs === null) return null;

    // Subtract travel time from landing time
    const sendTime = new Date(landingTime.getTime() - travelMs);

    console.debug(`  Landing: ${landingTime.getTime()} ms (${formatDateTime(landingTime)})`);
    console.debug(`  Travel:  ${travelMs} ms`);
    console.debug(`  Send:    ${sendTime.getTime()} ms (${formatDateTime(sendTime)})`);

    return sendTime;
}

// Format travel time for display - ROUNDS for display ONLY
function formatTravelTime(unitType, distance) {
    const travelMs = getExactTravelTimeMs(unitType, distance);
    if (travelMs === null) return '';

    // Round to nearest second for display
    const totalSeconds = Math.round(travelMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    result += `${seconds}s`;
    return result.trim();
}

// ============ DATA FETCHING FUNCTIONS ============

// Fetch player villages by group
async function fetchAllPlayerVillagesByGroup(groupId) {
    try {
        const url = game_data.link_base_pure + 'groups&ajax=load_villages_from_group';
        const response = await jQuery.post({
            url: url,
            data: { group_id: groupId },
        });

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
    } catch (error) {
        console.error('Error fetching villages:', error);
        UI.ErrorMessage(tt('Villages list could not be fetched!'));
        return [];
    }
}

// Fetch village groups
async function fetchVillageGroups() {
    try {
        return await jQuery.get(game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu');
    } catch (error) {
        UI.ErrorMessage(tt('Error fetching village groups!'));
        console.error('Error fetching groups:', error);
        return { result: {} };
    }
}

// Fetch troop counts
async function fetchTroopsForCurrentGroup() {
    const groupId = localStorage.getItem(`${LS_PREFIX}_chosen_group`) || 0;
    try {
        const response = await jQuery.get(game_data.link_base_pure + `overview_villages&mode=combined&group=${groupId}&`);
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
                    if (villageId) {
                        rowTroops = {
                            ...rowTroops,
                            villageId: parseInt(villageId),
                            [unitType]: parseInt(jQuery(this).find(`td:eq(${index})`).text()) || 0,
                        };
                    }
                }
            });
            if (rowTroops.villageId) homeTroops.push(rowTroops);
        });

        return homeTroops;
    } catch (error) {
        console.error('Error fetching troops:', error);
        return [];
    }
}

// Get continent by coordinates
function getContinentByCoord(coord) {
    if (!coord) return '';
    const coordParts = coord.split('|');
    return coordParts[1].charAt(0) + coordParts[0].charAt(0);
}

// ============ UI RENDERING FUNCTIONS ============

// Render villages table
function renderVillagesTable(villages) {
    if (!villages || villages.length === 0) {
        return `<p><b>${tt('Villages list could not be fetched!')}</b></p>`;
    }

    let villagesTable = `
    <table id="raAttackPlannerTable" class="ra-table" width="100%">
        <thead>
            <tr>
                <th class="ra-text-left" width="25%">${tt('Village')} (${villages.length})</th>
                <th width="15%">${tt('Send Time')}</th>
                <th width="5%">${tt('Prio.')}</th>
                <th><img src="/graphic/unit/unit_spear.webp" data-set-unit="spear"></th>
                <th><img src="/graphic/unit/unit_sword.webp" data-set-unit="sword"></th>
                <th><img src="/graphic/unit/unit_axe.webp" data-set-unit="axe"></th>
                <th class="archer-world"><img src="/graphic/unit/unit_archer.webp" data-set-unit="archer"></th>
                <th><img src="/graphic/unit/unit_spy.webp" data-set-unit="spy"></th>
                <th><img src="/graphic/unit/unit_light.webp" data-set-unit="light"></th>
                <th class="archer-world"><img src="/graphic/unit/unit_marcher.webp" data-set-unit="marcher"></th>
                <th><img src="/graphic/unit/unit_heavy.webp" data-set-unit="heavy"></th>
                <th><img src="/graphic/unit/unit_ram.webp" data-set-unit="ram"></th>
                <th><img src="/graphic/unit/unit_catapult.webp" data-set-unit="catapult"></th>
                <th class="paladin-world"><img src="/graphic/unit/unit_knight.webp" data-set-unit="knight"></th>
                <th><img src="/graphic/unit/unit_snob.webp" data-set-unit="snob"></th>
            </tr>
        </thead>
        <tbody>
    `;

    const villageCombinations = [];
    villages.forEach((village) => {
        const troops = troopCounts.find(t => t.villageId === village.id) || {};
        villageCombinations.push({
            ...village,
            spear: troops.spear || 0,
            sword: troops.sword || 0,
            axe: troops.axe || 0,
            archer: troops.archer || 0,
            spy: troops.spy || 0,
            light: troops.light || 0,
            marcher: troops.marcher || 0,
            heavy: troops.heavy || 0,
            ram: troops.ram || 0,
            catapult: troops.catapult || 0,
            knight: troops.knight || 0,
            snob: troops.snob || 0,
        });
    });

    villageCombinations.forEach((village) => {
        const continent = getContinentByCoord(village.coords);
        const link = game_data.link_base_pure + `info_village&id=${village.id}`;

        villagesTable += `
            <tr>
                <td class="ra-text-left">
                    <a href="${link}" target="_blank" rel="noopener noreferrer">
                        ${village.name} (${village.coords}) K${continent}
                    </a>
                </td>
                <td data-original-distance="${village.distance.toFixed(2)}" data-exact-distance="${village.exactDistance}">
                    ${village.distance.toFixed(2)}
                </td>
                <td><span class="icon header favorite_add"></span></td>
                <td><img data-unit-type="spear" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_spear.webp"><span>${formatAsNumber(village.spear)}</span></td>
                <td><img data-unit-type="sword" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_sword.webp"><span>${formatAsNumber(village.sword)}</span></td>
                <td><img data-unit-type="axe" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_axe.webp"><span>${formatAsNumber(village.axe)}</span></td>
                <td class="archer-world"><img data-unit-type="archer" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_archer.webp"><span>${formatAsNumber(village.archer)}</span></td>
                <td><img data-unit-type="spy" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_spy.webp"><span>${formatAsNumber(village.spy)}</span></td>
                <td><img data-unit-type="light" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_light.webp"><span>${formatAsNumber(village.light)}</span></td>
                <td class="archer-world"><img data-unit-type="marcher" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_marcher.webp"><span>${formatAsNumber(village.marcher)}</span></td>
                <td><img data-unit-type="heavy" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_heavy.webp"><span>${formatAsNumber(village.heavy)}</span></td>
                <td><img data-unit-type="ram" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_ram.webp"><span>${formatAsNumber(village.ram)}</span></td>
                <td><img data-unit-type="catapult" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_catapult.webp"><span>${formatAsNumber(village.catapult)}</span></td>
                <td class="paladin-world"><img data-unit-type="knight" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_knight.webp"><span>${formatAsNumber(village.knight)}</span></td>
                <td><img data-unit-type="snob" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_snob.webp"><span>${formatAsNumber(village.snob)}</span></td>
            </tr>
        `;
    });

    villagesTable += `</tbody></table>`;
    return villagesTable;
}

// Render groups filter
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

// ============ UI UPDATE FUNCTIONS ============

// Update send time display - USE EXACT DISTANCE
function updateSendTimeForVillage(villageRow, unitType, exactDistance) {
    const distanceCell = villageRow.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        const originalDistance = distanceCell.attr('data-original-distance');
        distanceCell.html(originalDistance || exactDistance.toFixed(2));
        return;
    }

    // Use the EXACT distance, not the rounded one
    const travelTimeMs = getExactTravelTimeMs(unitType, exactDistance);
    const sendTime = new Date(currentLandingTime.getTime() - travelTimeMs);
    const serverTime = getServerTime();

    // Calculate travel time for tooltip (rounded for display only)
    const travelSeconds = Math.round(travelTimeMs / 1000);
    const travelHours = Math.floor(travelSeconds / 3600);
    const travelMinutes = Math.floor((travelSeconds % 3600) / 60);
    const travelSecs = travelSeconds % 60;
    const travelFormatted = `${travelHours > 0 ? travelHours + 'h ' : ''}${travelMinutes > 0 || travelHours > 0 ? travelMinutes + 'm ' : ''}${travelSecs}s`.trim();

    if (sendTime && sendTime >= serverTime) {
        const formattedSendTime = formatDateTime(sendTime);
        distanceCell.html(`<span style="color: green; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelFormatted}">🕒 ${formattedSendTime}</span>`);
    } else if (sendTime && sendTime < serverTime) {
        distanceCell.html(`<span style="color: red; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelFormatted}">⚠️ ${tt('Send Time')} passed</span>`);
    } else {
        distanceCell.html(exactDistance.toFixed(2));
    }
}

// Update all send times
function updateAllSendTimes() {
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
        // Get the EXACT distance from the data attribute
        const exactDistance = parseFloat(row.data('exact-distance'));

        if (selectedUnitImg.length && !isNaN(exactDistance)) {
            const unitType = selectedUnitImg.attr('data-unit-type');
            updateSendTimeForVillage(row, unitType, exactDistance);
        }
    });
}


// ============ EVENT HANDLERS ============

// Unit selection handler
function attachUnitSelectionHandler() {
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
                updateSendTimeForVillage(row, unitType, distance);
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

// Priority selection handler
function attachPriorityHandler() {
    jQuery('#raAttackPlannerTable tbody td .icon').on('click', function() {
        const isUnitSelectedForVillage = jQuery(this).closest('tr').find('.ra-selected-unit').length > 0;
        if (isUnitSelectedForVillage) {
            jQuery(this).toggleClass('ra-priority-village');
        } else {
            UI.ErrorMessage(tt('This village has no unit selected!'));
        }
    });
}

// Landing time change handler
function attachLandingTimeHandler() {
    jQuery('#raLandingTime').on('change keyup', function() {
        const landingTimeVal = jQuery(this).val().trim();
        if (landingTimeVal) {
            currentLandingTime = getLandingTime(landingTimeVal);
            updateAllSendTimes();
        }
    });
}

// Calculate launch times handler (EXPORT)
function attachCalculateHandler() {
    jQuery('#calculateLaunchTimes').on('click', function(e) {
        e.preventDefault();

        const landingTimeString = jQuery('#raLandingTime').val().trim();
        let destinationVillage = getDestinationVillage();

        let villagesUnitsToSend = [];

        jQuery('#raAttackPlannerTable .ra-selected-unit').each(function() {
            const id = parseInt(jQuery(this).attr('data-village-id'));
            const unit = jQuery(this).attr('data-unit-type');
            const coords = jQuery(this).attr('data-village-coords');
            const isPrioVillage = jQuery(this).closest('tr').find('td .ra-priority-village').length > 0;
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
            const plans = [];

            villagesUnitsToSend.forEach((item) => {
                const sendTime = getExactSendTime(item.unit, item.distance, landingTime);
                if (sendTime && sendTime >= getServerTime()) {
                    plans.push({
                        unit: item.unit,
                        coords: item.coords,
                        highPrio: item.highPrio,
                        villageId: item.id,
                        launchTimeFormatted: formatDateTime(sendTime),
                    });
                }
            });

            plans.sort((a, b) => new Date(a.launchTimeFormatted) - new Date(b.launchTimeFormatted));

            if (plans.length > 0) {
                const [toX, toY] = destinationVillage.split('|');
                const rallyPointData = game_data.market !== 'uk' ? `&x=${toX}&y=${toY}` : '';
                const sitterData = game_data.player.sitter > 0 ? `t=${game_data.player.id}` : '';

                let bbCode = `[size=12][b]${tt('Plan for:')}[/b] ${destinationVillage}\n[b]${tt('Landing Time:')}[/b] ${landingTimeString}[/size]\n\n`;
                bbCode += `[table][**]${tt('Unit')}[||]${tt('From')}[||]${tt('Priority')}[||]${tt('Launch Time')}[||]${tt('Command')}[/**]\n`;

                let plainCode = `[size=12][b]${tt('Plan for:')}[/b] ${destinationVillage}\n[b]${tt('Landing Time:')}[/b] ${landingTimeString}[/size]\n\n`;

                plans.forEach((plan) => {
                    const priority = plan.highPrio ? tt('Early send') : '';
                    const commandUrl = `/game.php?${sitterData}&village=${plan.villageId}&screen=place${rallyPointData}`;

                    bbCode += `[*][unit]${plan.unit}[/unit][|] ${plan.coords} [|][b][color=#ff0000]${priority}[/color][/b][|]${plan.launchTimeFormatted}[|][url=${window.location.origin}${commandUrl}]${tt('Send')}[/url][|]\n`;
                    plainCode += `[unit]${plan.unit}[/unit] ${plan.coords} [b][color=#ff0000]${priority}[/color][/b] ${plan.launchTimeFormatted} [url=${window.location.origin}${commandUrl}]${tt('Send')}[/url]\n`;
                });

                bbCode += `[/table]`;
                jQuery('#raVillagePlanner').show();
                jQuery('#raExportPlanBBCode').val(bbCode);
                jQuery('#raExportPlanCode').val(plainCode);
            } else {
                UI.ErrorMessage(tt('No possible combinations found!'));
                jQuery('#raVillagePlanner').hide();
            }
        } else {
            UI.ErrorMessage(tt('Missing user input!'));
        }
    });
}

// Reset handlers
function attachResetHandlers() {
    jQuery('#resetAll').on('click', function(e) {
        e.preventDefault();
        location.reload();
    });

    jQuery('#resetGroupBtn').on('click', function(e) {
        e.preventDefault();
        localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
        UI.SuccessMessage(tt('Chosen group was reset!'));
        location.reload();
    });
}

// Group filter handler
function attachGroupFilterHandler() {
    jQuery('#raGroupsFilter').on('change', function(e) {
        e.preventDefault();
        localStorage.setItem(`${LS_PREFIX}_chosen_group`, jQuery(this).val());
        location.reload();
    });
}

// Set all units handler
function attachSetAllUnitsHandler() {
    jQuery('#raAttackPlannerTable thead tr th img').on('click', function() {
        const chosenUnit = jQuery(this).attr('data-set-unit');
        if (chosenUnit) {
            jQuery('#raAttackPlannerTable tbody tr').each(function() {
                jQuery(this).find(`img[data-unit-type="${chosenUnit}"]`).trigger('click');
            });
        }
    });
}

// Fill landing time from command handler
function attachCommandClickHandler() {
    jQuery('#commands_outgoings table tbody tr.command-row, #commands_incomings table tbody tr.command-row').on('click', function() {
        const commandLandingTime = parseInt(jQuery(this).find('td:eq(2) span').attr('data-endtime')) * 1000;
        const landingTimeDateTime = new Date(commandLandingTime);
        const serverDateTime = getServerTime();
        const localDateTime = new Date();
        const diffTime = Math.abs(localDateTime - serverDateTime);
        const newLandingTime = Math.ceil(Math.abs(landingTimeDateTime - diffTime));
        const formattedNewLandingTime = formatDateTime(new Date(newLandingTime));

        jQuery('#raLandingTime').val(formattedNewLandingTime);
        currentLandingTime = getLandingTime(formattedNewLandingTime);
        updateAllSendTimes();
        UI.SuccessMessage(tt('Landing time was updated!'));
    });
}

// ============ INITIALIZATION ============

async function init() {
    console.debug('=== Single Village Planner v2.3.3 ===');
    console.debug('NOTE: Only unit_speed from API affects travel time (building speed is ignored)');

    // Show loading message
    const loadingHtml = `
        <div id="raSingleVillagePlanner" style="margin:10px; padding:10px; border:1px solid #603000; background:#f4e4bc; text-align:center;">
            <h2>${tt('Single Village Planner')}</h2>
            <p>Loading world configuration and unit data...</p>
        </div>
    `;
    jQuery('#contentContainer').prepend(loadingHtml);

    // Step 1: Fetch world config from API
    await fetchWorldConfigFromAPI();

    // Step 2: Fetch unit info from API
    await fetchUnitInfoFromAPI();

    // Step 3: Fetch villages and groups
    const groups = await fetchVillageGroups();
    troopCounts = await fetchTroopsForCurrentGroup();
    let villages = await fetchAllPlayerVillagesByGroup(GROUP_ID);

    currentDestinationVillage = getDestinationVillage();

    villages = villages.map((item) => {
        const exactDistance = calculateDistance(item.coords, currentDestinationVillage);
        return {
            ...item,
            exactDistance: exactDistance,           // Store exact for calculations
            distance: parseFloat(exactDistance.toFixed(2)),  // Rounded for display
        };
    });

    villages = villages.sort((a, b) => a.distance - b.distance);

    const villagesTable = renderVillagesTable(villages);
    const groupsFilter = renderGroupsFilter(groups);

    const defaultTime = formatDateTime(new Date(Date.now() + 86400000));
    currentLandingTime = getLandingTime(defaultTime);

    const fullHtml = `
        <div id="raSingleVillagePlanner" style="margin:10px; padding:10px; border:1px solid #603000; background:#f4e4bc;">
            <h2>${tt('Single Village Planner')}</h2>
            <div class="ra-mb15">
                <div style="display: grid; grid-template-columns: 1fr 150px; gap: 20px; margin-bottom:15px;">
                    <div>
                        <label for="raLandingTime">${tt('Landing Time')} (dd/mm/yyyy HH:mm:ss)</label>
                        <input id="raLandingTime" type="text" value="${defaultTime}" style="width:100%; padding:5px;">
                        <small style="display:block; margin-top:5px;">${tt('Click on a unit to see send time')}</small>
                    </div>
                    <div>
                        <label>${tt('Group')}</label>
                        ${groupsFilter}
                    </div>
                </div>
                ${villagesTable}
                <div style="margin-top:15px;">
                    <a href="javascript:void(0);" id="calculateLaunchTimes" class="btn" style="margin-right:10px;">${tt('Calculate Launch Times')}</a>
                    <a href="javascript:void(0);" id="resetAll" class="btn" style="margin-right:10px;">${tt('Reset')}</a>
                    <a href="javascript:void(0);" id="resetGroupBtn" class="btn">${tt('Reset Chosen Group')}</a>
                </div>
                <div id="raVillagePlanner" style="display:none; margin-top:15px;">
                    <div style="margin-bottom:10px;">
                        <label for="raExportPlanBBCode">${tt('Export Plan as BB Code')}</label>
                        <textarea id="raExportPlanBBCode" rows="5" style="width:100%; resize:none;" readonly></textarea>
                    </div>
                    <div>
                        <label for="raExportPlanCode">${tt('Export Plan without tables')}</label>
                        <textarea id="raExportPlanCode" rows="5" style="width:100%; resize:none;" readonly></textarea>
                    </div>
                </div>
            </div>
            <br>
            <small>
                <strong>${tt(scriptData.name)} ${scriptData.version}</strong> -
                <a href="${scriptData.authorUrl}" target="_blank">${scriptData.author}</a> -
                <a href="${scriptData.helpLink}" target="_blank">${tt('Help')}</a>
            </small>
        </div>
        <style>
            .ra-table td img { cursor: pointer; border: 2px solid transparent; padding: 2px; }
            .ra-table td img.ra-selected-unit { border: 2px solid #ff0000; }
            .ra-table td .icon { cursor: pointer; filter: grayscale(100%); }
            .ra-table td .icon.ra-priority-village { filter: none; }
            .ra-table tbody tr.ra-selected-village td { background-color: #ffe563; }
            .ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }
            .ra-table td a { word-break: break-all; }
            .ra-text-left { text-align: left !important; }
        </style>
    `;

    // Replace loading message with actual content
    jQuery('#raSingleVillagePlanner').replaceWith(fullHtml);

    // Handle archer and paladin worlds
    if (!game_data.units.includes('archer')) {
        jQuery('.archer-world').hide();
    }
    if (!game_data.units.includes('knight')) {
        jQuery('.paladin-world').hide();
    }

    // Attach all event handlers
    attachUnitSelectionHandler();
    attachPriorityHandler();
    attachLandingTimeHandler();
    attachCalculateHandler();
    attachResetHandlers();
    attachGroupFilterHandler();
    attachSetAllUnitsHandler();
    attachCommandClickHandler();

    // Scroll to planner
    jQuery('html,body').animate({ scrollTop: jQuery('#raSingleVillagePlanner').offset().top - 8 }, 'slow');

    console.debug('=== Initialization Complete ===');
    console.debug(`Unit Speed Modifier: ${unitSpeedModifier}x`);
}

// Start script
(async function() {
    const gameScreen = new URLSearchParams(window.location.search).get('screen');
    if (gameScreen === 'info_village') {
        await init();
    } else {
        UI.ErrorMessage(tt('This script can only be run on a single village screen!'));
    }
})();