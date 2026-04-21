/*
 * Script Name: Single Village Planner
 * Version: v2.2.0
 * Last Updated: 2025-08-15
 * Author: RedAlert
 * Mod: Asio - Auto-detect world settings for any world
 */

var scriptData = {
    name: 'Single Village Planner',
    version: 'v2.2.0',
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
var worldSpeed = 1.0;
var unitSpeedModifier = 1.0;

// Translations
var translations = {
    el_GR: {
        'Single Village Planner': 'Ατομικό Πλάνο Χωριού',
        'Help': 'Βοήθεια',
        'Village': 'Χωριό',
        'Calculate Launch Times': 'Υπολογισμός Χρόνου Εκκίνησης',
        'Reset': 'Επαναφορά',
        'Launch times are being calculated ...': 'Οι χρόνοι εκκίνησης υπολογίζονται ...',
        'Missing user input!': 'Λείπουν τα δεδομένα!',
        'Landing Time': 'Χρόνος Ολοκλήρωσης',
        'This village has no unit selected!': 'Το χωριό δεν έχει επιλεγμένες μονάδες!',
        'Prio.': 'Προτ.',
        'No possible combinations found!': 'Δεν βρέθηκαν δυνατές συνδυασμοί!',
        'Export Plan as BB Code': 'Εξαγωγή πλάνου σε BB Code',
        'Plan for:': 'Πλάνο για:',
        'Landing Time:': 'Χρόνος Ολοκλήρωσης:',
        'Unit': 'Μονάδα',
        'Launch Time': 'Χρόνος Εκκίνησης',
        'Command': 'Εντολή',
        'Status': 'Κατάσταση',
        'Send': 'Αποστολή',
        'From': 'Από',
        'Priority': 'Προτεραιότητα',
        'Early send': 'Πρώιμη αποστολή',
        'Landing time was updated!': 'Ο χρόνος ολοκλήρωσης ενημερώθηκε!',
        'Error fetching village groups!': 'Σφάλμα κατά την ανάκτηση ομάδων χωριών!',
        'Dist.': 'Απόστ.',
        'Send Time': 'Χρόνος Αποστολής',
        'Travel Time': 'Χρόνος Ταξιδιού',
        'Villages list could not be fetched!': 'Δεν μπορεί να ανακτηθεί η λίστα χωριών!',
        'Group': 'Ομάδα',
        'Export Plan without tables': 'Εξαγωγή πλάνου χωρίς πίνακες',
        'Chosen group was reset!': 'Η επιλεγμένη ομάδα επαναφέρθηκε!',
        'Reset Chosen Group': 'Επαναφορά επιλεγμένης ομάδας',
        'Script configuration was reset!': 'Η ρύθμιση του script επαναφέρθηκε!',
        'Click on a unit to see send time': 'Κάντε κλικ σε μια μονάδα για να δείτε τον χρόνο αποστολής',
    },
    en_DK: {
        'Single Village Planner': 'Single Village Planner',
        'Help': 'Help',
        'Village': 'Village',
        'Calculate Launch Times': 'Calculate Launch Times',
        'Reset': 'Reset',
        'Launch times are being calculated ...': 'Launch times are being calculated ...',
        'Missing user input!': 'Missing user input!',
        'Landing Time': 'Landing Time',
        'This village has no unit selected!': 'This village has no unit selected!',
        'Prio.': 'Prio.',
        'No possible combinations found!': 'No possible combinations found!',
        'Export Plan as BB Code': 'Export Plan as BB Code',
        'Plan for:': 'Plan for:',
        'Landing Time:': 'Landing Time:',
        'Unit': 'Unit',
        'Launch Time': 'Launch Time',
        'Command': 'Command',
        'Status': 'Status',
        'Send': 'Send',
        'From': 'From',
        'Priority': 'Priority',
        'Early send': 'Early send',
        'Landing time was updated!': 'Landing time was updated!',
        'Error fetching village groups!': 'Error fetching village groups!',
        'Dist.': 'Dist.',
        'Send Time': 'Send Time',
        'Travel Time': 'Travel Time',
        'Villages list could not be fetched!': 'Villages list could not be fetched!',
        'Group': 'Group',
        'Export Plan without tables': 'Export Plan without tables',
        'Chosen group was reset!': 'Chosen group was reset!',
        'Reset Chosen Group': 'Reset Chosen Group',
        'Script configuration was reset!': 'Script configuration was reset!',
        'Click on a unit to see send time': 'Click on a unit to see send time',
    }
};

function tt(string) {
    var gameLocale = game_data.locale || 'en_DK';
    if (translations[gameLocale] && translations[gameLocale][string]) {
        return translations[gameLocale][string];
    }
    return translations['en_DK'][string] || string;
}

// Helper: Get server time
function getServerTime() {
    const serverTime = jQuery('#serverTime').text();
    const serverDate = jQuery('#serverDate').text();
    if (!serverTime || !serverDate) return new Date();

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
    if (!landingTime) return null;
    const [landingDay, landingHour] = landingTime.split(' ');
    if (!landingDay || !landingHour) return null;
    const [day, month, year] = landingDay.split('/');
    return new Date(year, month - 1, day,
        landingHour.split(':')[0],
        landingHour.split(':')[1],
        landingHour.split(':')[2]);
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

// NEW: Fetch world configuration automatically
async function fetchWorldConfig() {
    console.debug('Fetching world configuration...');

    try {
        const response = await jQuery.ajax({
            url: '/interface.php?func=get_config',
            method: 'GET',
            dataType: 'xml'
        });

        // Parse XML response
        const $xml = jQuery(response);

        // Extract world speed and unit speed
        const speed = parseFloat($xml.find('speed').text());
        const unitSpeed = parseFloat($xml.find('unit_speed').text());

        if (!isNaN(speed)) worldSpeed = speed;
        if (!isNaN(unitSpeed)) unitSpeedModifier = unitSpeed;

        console.debug(`World Config Loaded: Speed=${worldSpeed}x, Unit Speed=${unitSpeedModifier}x`);
        console.debug(`Effective Multiplier: ${worldSpeed * unitSpeedModifier}x`);

        // Cache the config
        localStorage.setItem(`${LS_PREFIX}_world_speed`, worldSpeed);
        localStorage.setItem(`${LS_PREFIX}_unit_speed_modifier`, unitSpeedModifier);

        return { worldSpeed, unitSpeedModifier };

    } catch (error) {
        console.error('Failed to fetch world config:', error);

        // Try to get from game_data as fallback
        if (typeof game_data !== 'undefined') {
            worldSpeed = game_data.world_speed || 1.0;
            unitSpeedModifier = game_data.unit_speed || 1.0;
            console.debug(`Using fallback game_data: Speed=${worldSpeed}, Unit=${unitSpeedModifier}`);
        }

        return { worldSpeed, unitSpeedModifier };
    }
}

// Calculate travel time with auto-detected world settings
function calculateTravelTime(unitType, distance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        console.error(`No unit info for: ${unitType}`);
        return null;
    }

    // Base speed from API (minutes per field at speed 1)
    const baseSpeedMinutes = parseFloat(unitInfo.config[unitType].speed);

    // Apply world speed and unit speed modifiers
    // Formula: Travel Time = (Distance × Base Speed) / (World Speed × Unit Speed)
    const effectiveMultiplier = worldSpeed * unitSpeedModifier;
    const effectiveSpeedMinutes = baseSpeedMinutes / effectiveMultiplier;

    // Travel time in milliseconds - use Math.floor to match Tribal Wars
    const travelTimeMs = Math.floor(distance * effectiveSpeedMinutes * 60 * 1000);
    const travelTimeMinutes = travelTimeMs / (60 * 1000);

    // Format for display
    const totalSeconds = Math.floor(travelTimeMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formatted = '';
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0) formatted += `${minutes}m `;
    formatted += `${seconds}s`;

    console.debug(`[${unitType}] Dist:${distance} × Base:${baseSpeedMinutes}min / (World:${worldSpeed} × Unit:${unitSpeedModifier}) = ${effectiveSpeedMinutes.toFixed(2)}min/field → Travel:${formatted}`);

    return {
        minutes: travelTimeMinutes,
        milliseconds: travelTimeMs,
        formatted: formatted.trim(),
        effectiveSpeed: effectiveSpeedMinutes
    };
}

// Calculate send time
function calculateSendTime(landingTime, travelTimeMs) {
    if (!landingTime) return null;
    const sendTime = new Date(landingTime.getTime() - travelTimeMs);
    sendTime.setMilliseconds(0);
    return sendTime;
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

// Fetch Unit Info
function fetchUnitInfo() {
    return new Promise((resolve, reject) => {
        console.debug('Fetching unit info from API...');
        jQuery.ajax({
            url: '/interface.php?func=get_unit_info',
            method: 'GET',
            success: function(response) {
                unitInfo = xml2json(jQuery(response));
                localStorage.setItem(`${LS_PREFIX}_unit_info`, JSON.stringify(unitInfo));
                localStorage.setItem(`${LS_PREFIX}_last_updated`, Date.now());

                // Log all unit speeds for debugging
                console.debug('=== UNIT SPEEDS (Base - minutes per field) ===');
                if (unitInfo && unitInfo.config) {
                    for (const [unit, data] of Object.entries(unitInfo.config)) {
                        console.debug(`  ${unit}: ${data.speed} min/field`);
                    }
                }
                console.debug('===============================================');
                resolve(unitInfo);
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
    jQuery.each($xml.children(), function(i) {
        var $this = jQuery(this);
        if ($this.children().length > 0) {
            data[$this.prop('tagName')] = xml2json($this);
        } else {
            data[$this.prop('tagName')] = jQuery.trim($this.text());
        }
    });
    return data;
}

// Update travel time display for a village
function updateTravelTimeForVillage(villageRow, unitType, distance) {
    const distanceCell = villageRow.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        const originalDistance = distanceCell.attr('data-original-distance');
        distanceCell.html(originalDistance || distance.toFixed(2));
        return;
    }

    const travelTime = calculateTravelTime(unitType, distance);
    if (!travelTime) return;

    const sendTime = calculateSendTime(currentLandingTime, travelTime.milliseconds);
    const serverTime = getServerTime();

    if (sendTime && sendTime >= serverTime) {
        const formattedSendTime = formatDateTime(sendTime);
        distanceCell.html(`<span style="color: green; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelTime.formatted}">🕒 ${formattedSendTime}</span>`);
    } else if (sendTime && sendTime < serverTime) {
        distanceCell.html(`<span style="color: red; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelTime.formatted}">⚠️ Past</span>`);
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

        if (selectedUnitImg.length && !isNaN(distance)) {
            const unitType = selectedUnitImg.attr('data-unit-type');
            updateTravelTimeForVillage(row, unitType, distance);
        }
    });
}

// Unit selection handler
function choseUnit() {
    jQuery('.ra-table td img').on('click', function() {
        const row = jQuery(this).closest('tr');
        const wasSelected = jQuery(this).hasClass('ra-selected-unit');

        if (!wasSelected) {
            row.find('img').not(this).removeClass('ra-selected-unit');
            jQuery(this).addClass('ra-selected-unit');

            const unitType = jQuery(this).attr('data-unit-type');
            const distanceCell = row.find('td:eq(1)');
            const distance = parseFloat(distanceCell.attr('data-original-distance'));

            if (!isNaN(distance) && currentLandingTime) {
                updateTravelTimeForVillage(row, unitType, distance);
            }
        } else {
            jQuery(this).removeClass('ra-selected-unit');
            const distanceCell = row.find('td:eq(1)');
            const originalDistance = distanceCell.attr('data-original-distance');
            distanceCell.html(parseFloat(originalDistance).toFixed(2));
        }

        if (row.find('img.ra-selected-unit').length > 0) {
            row.addClass('ra-selected-village');
        } else {
            row.removeClass('ra-selected-village');
        }
    });
}

// Landing time change handler
function updateTravelTimeOnLandingChange() {
    jQuery('#raLandingTime').on('change keyup', function() {
        const landingTimeVal = jQuery(this).val().trim();
        if (landingTimeVal) {
            currentLandingTime = getLandingTime(landingTimeVal);
            console.debug(`Landing time changed to: ${formatDateTime(currentLandingTime)}`);
            updateAllTravelTimes();
        }
    });
}

// Render villages table
function renderVillagesTable(villages) {
    if (!villages || villages.length === 0) {
        return '<p>No villages found</p>';
    }

    let table = `
    <table id="raAttackPlannerTable" class="ra-table" width="100%">
        <thead>
            <tr>
                <th class="ra-text-left" width="25%">${tt('Village')} (${villages.length})</th>
                <th width="20%">${tt('Send Time')}</th>
                <th width="5%">${tt('Prio.')}</th>
                <th><img src="/graphic/unit/unit_spear.webp"></th>
                <th><img src="/graphic/unit/unit_sword.webp"></th>
                <th><img src="/graphic/unit/unit_axe.webp"></th>
                <th><img src="/graphic/unit/unit_light.webp"></th>
                <th><img src="/graphic/unit/unit_heavy.webp"></th>
                <th><img src="/graphic/unit/unit_ram.webp"></th>
                <th><img src="/graphic/unit/unit_catapult.webp"></th>
                <th><img src="/graphic/unit/unit_snob.webp"></th>
            </tr>
        </thead>
        <tbody>
    `;

    villages.forEach(village => {
        const distance = village.distance || 0;
        table += `
            <tr>
                <td class="ra-text-left">
                    <a href="${game_data.link_base_pure}info_village&id=${village.id}" target="_blank">
                        ${village.name} (${village.coords})
                    </a>
                </td>
                <td data-original-distance="${distance}">${distance.toFixed(2)}</td>
                <td><span class="icon header favorite_add"></span></td>
                <td><img data-unit-type="spear" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_spear.webp"></td>
                <td><img data-unit-type="sword" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_sword.webp"></td>
                <td><img data-unit-type="axe" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_axe.webp"></td>
                <td><img data-unit-type="light" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_light.webp"></td>
                <td><img data-unit-type="heavy" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_heavy.webp"></td>
                <td><img data-unit-type="ram" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_ram.webp"></td>
                <td><img data-unit-type="catapult" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_catapult.webp"></td>
                <td><img data-unit-type="snob" data-village-id="${village.id}" data-village-coords="${village.coords}" src="/graphic/unit/unit_snob.webp"></td>
            </tr>
        `;
    });

    table += `</tbody></table>`;
    return table;
}

// Fetch player villages
async function fetchAllPlayerVillagesByGroup(groupId) {
    try {
        const response = await jQuery.post({
            url: game_data.link_base_pure + 'groups&ajax=load_villages_from_group',
            data: { group_id: groupId }
        });

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(response.html, 'text/html');
        const tableRows = jQuery(htmlDoc).find('#group_table > tbody > tr').not(':eq(0)');

        let villages = [];
        tableRows.each(function() {
            const villageId = jQuery(this).find('td:eq(0) a').attr('data-village-id') ||
                jQuery(this).find('td:eq(0) a').attr('href').match(/\d+/)[0];
            const villageName = jQuery(this).find('td:eq(0)').text().trim();
            const villageCoords = jQuery(this).find('td:eq(1)').text().trim();

            villages.push({
                id: parseInt(villageId),
                name: villageName,
                coords: villageCoords
            });
        });

        return villages;
    } catch (error) {
        console.error('Error fetching villages:', error);
        return [];
    }
}

// Initialize script
async function initAttackPlanner(groupId) {
    console.debug('=== SINGLE VILLAGE PLANNER v2.2.0 INIT ===');

    // Step 1: Fetch world configuration first
    await fetchWorldConfig();

    // Step 2: Load unit info from cache or fetch
    const cachedUnitInfo = localStorage.getItem(`${LS_PREFIX}_unit_info`);
    const cachedTime = localStorage.getItem(`${LS_PREFIX}_last_updated`);

    if (cachedUnitInfo && cachedTime && (Date.now() - parseInt(cachedTime) < TIME_INTERVAL)) {
        unitInfo = JSON.parse(cachedUnitInfo);
        console.debug('Loaded unit info from cache');
    } else {
        await fetchUnitInfo();
    }

    // Step 3: Get villages and destination
    const villages = await fetchAllPlayerVillagesByGroup(groupId);
    currentDestinationVillage = getDestinationVillage();

    console.debug(`Destination: ${currentDestinationVillage}`);
    console.debug(`Found ${villages.length} villages`);

    // Calculate distances
    villages.forEach(v => {
        v.distance = calculateDistance(v.coords, currentDestinationVillage);
    });
    villages.sort((a, b) => a.distance - b.distance);

    // Set default landing time (tomorrow at 12:00)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    const defaultLanding = formatDateTime(tomorrow);
    currentLandingTime = tomorrow;

    // Render UI
    const content = `
        <div class="ra-mb15">
            <label>${tt('Landing Time')} (dd/mm/yyyy HH:mm:ss)</label>
            <input id="raLandingTime" type="text" value="${defaultLanding}" style="width:100%;">
            <small>${tt('Click on a unit to see send time')}</small>
        </div>
        ${renderVillagesTable(villages)}
        <div class="ra-mb15">
            <button id="calculateLaunchTimes" class="btn">${tt('Calculate Launch Times')}</button>
            <button id="resetAll" class="btn">Reset</button>
        </div>
        <div id="raVillagePlanner" style="display:none;">
            <textarea id="raExportPlanBBCode" rows="5" style="width:100%;"></textarea>
        </div>
    `;

    // Remove existing planner if present
    jQuery('#raSingleVillagePlanner').remove();

    // Add new planner
    jQuery('#contentContainer').prepend(`
        <div id="raSingleVillagePlanner" style="margin:10px; padding:10px; border:1px solid #ccc; background:#f9f9f9;">
            <h3>${tt('Single Village Planner')} v${scriptData.version}</h3>
            ${content}
        </div>
    `);

    // Attach handlers
    choseUnit();
    updateTravelTimeOnLandingChange();

    console.debug('=== INIT COMPLETE ===');
    console.debug(`World Settings: Speed=${worldSpeed}x, Unit Speed=${unitSpeedModifier}x`);
}

// Calculate launch times (placeholder for export function)
function calculateLaunchTimes() {
    jQuery('#calculateLaunchTimes').on('click', function(e) {
        e.preventDefault();
        UI.SuccessMessage('Calculating launch times...');
        // Add your existing export logic here
    });
}

// Reset all
function resetAll() {
    jQuery('#resetAll').on('click', function(e) {
        e.preventDefault();
        location.reload();
    });
}

// Start script
(function() {
    if (window.location.href.includes('screen=info_village')) {
        initAttackPlanner(GROUP_ID);
    } else {
        console.warn('This script only works on village info page');
        UI.ErrorMessage(tt('This script can only be run on a single village screen!'));
    }
})();