/*
 * Script Name: Single Village Planner
 * Version: v2.2.4
 * Last Updated: 2026-04-22
 * Author: RedAlert
 * Mod: Asio - Final version with correct time calculations
 */

var scriptData = {
    name: 'Single Village Planner',
    version: 'v2.2.4',
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
    if (translations[gameLocale] !== undefined) {
        return translations[gameLocale][string];
    }
    return translations['en_DK'][string];
}

// Get world settings from game_data (NO API CALL NEEDED)
function getWorldSettings() {
    if (typeof game_data !== 'undefined') {
        worldSpeed = game_data.world_speed || 1.0;
        unitSpeedModifier = game_data.unit_speed || 1.0;
        console.debug(`World settings: Speed=${worldSpeed}x, Unit Speed=${unitSpeedModifier}x`);
    } else {
        console.warn('game_data not available, using defaults');
        worldSpeed = 1.0;
        unitSpeedModifier = 1.0;
    }
}

// Calculate exact travel time in milliseconds
function getTravelTimeMs(unitType, distance) {
    if (!unitInfo || !unitInfo.config || !unitInfo.config[unitType]) {
        return null;
    }

    const baseSpeedMinutes = parseFloat(unitInfo.config[unitType].speed);
    // Formula: travel time = distance × baseSpeed / (worldSpeed × unitSpeed)
    const travelTimeMinutes = (distance * baseSpeedMinutes) / (worldSpeed * unitSpeedModifier);
    return travelTimeMinutes * 60 * 1000;
}

// Calculate send time
function getSendTime(unitType, distance, landingTime) {
    const travelMs = getTravelTimeMs(unitType, distance);
    if (travelMs === null) return null;
    return new Date(landingTime.getTime() - travelMs);
}

// Format travel time for display
function formatTravelTime(unitType, distance) {
    const travelMs = getTravelTimeMs(unitType, distance);
    if (travelMs === null) return '';

    const totalSec = Math.round(travelMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (mins > 0 || hours > 0) result += `${mins}m `;
    result += `${secs}s`;
    return result.trim();
}

// Calculate distance between villages
function calculateDistance(from, to) {
    if (!from || !to) return 0;
    const [x1, y1] = from.split('|').map(Number);
    const [x2, y2] = to.split('|').map(Number);
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return 0;
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// Get server time
function getServerTime() {
    const timeStr = jQuery('#serverTime').text();
    const dateStr = jQuery('#serverDate').text();
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day} ${timeStr}`);
}

// Format date/time for display
function formatDateTime(date) {
    if (!date || isNaN(date.getTime())) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

// Parse landing time from input
function parseLandingTime(input) {
    const [datePart, timePart] = input.split(' ');
    const [day, month, year] = datePart.split('/');
    return new Date(`${year}-${month}-${day} ${timePart}`);
}

// Get destination village coordinates
function getDestinationVillage() {
    // Try multiple selectors to find coordinates
    const selectors = [
        '#content_value table table tr:eq(3) td:eq(1)',
        '#content_value table table tr:nth-child(4) td:nth-child(2)',
        '#content_value td:contains("|")'
    ];

    for (const selector of selectors) {
        const el = jQuery(selector);
        if (el.length) {
            const match = el.text().match(/(\d+)\|(\d+)/);
            if (match) return match[0];
        }
    }

    // Fallback: search entire page
    const match = jQuery('#content_value').html().match(/(\d+)\|(\d+)/);
    return match ? match[0] : '';
}

// Fetch unit info
function fetchUnitInfo() {
    return new Promise((resolve) => {
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
            success: function(response) {
                unitInfo = xml2json(jQuery(response));
                localStorage.setItem(`${LS_PREFIX}_unit_info`, JSON.stringify(unitInfo));
                localStorage.setItem(`${LS_PREFIX}_last_updated`, Date.now());
                console.debug('Unit info fetched from API');
                resolve();
            },
            error: function() {
                console.error('Failed to fetch unit info');
                resolve();
            }
        });
    });
}

// XML to JSON converter
function xml2json($xml) {
    const data = {};
    $xml.children().each(function() {
        const $this = jQuery(this);
        const tag = $this.prop('tagName');
        if ($this.children().length > 0) {
            data[tag] = xml2json($this);
        } else {
            data[tag] = $this.text().trim();
        }
    });
    return data;
}

// Fetch villages by group
async function fetchVillages(groupId) {
    try {
        const res = await jQuery.post({
            url: game_data.link_base_pure + 'groups&ajax=load_villages_from_group',
            data: { group_id: groupId }
        });
        const html = jQuery.parseHTML(res.html);
        const rows = jQuery(html).find('#group_table > tbody > tr').not(':eq(0)');
        const villages = [];
        rows.each(function() {
            const id = jQuery(this).find('td:eq(0) a').attr('data-village-id') ||
                jQuery(this).find('td:eq(0) a').attr('href').match(/\d+/)[0];
            villages.push({
                id: parseInt(id),
                name: jQuery(this).find('td:eq(0)').text().trim(),
                coords: jQuery(this).find('td:eq(1)').text().trim()
            });
        });
        return villages;
    } catch (e) {
        console.error('Error fetching villages:', e);
        return [];
    }
}

// Fetch troop counts
async function fetchTroops(groupId) {
    try {
        const res = await jQuery.get(game_data.link_base_pure + `overview_villages&mode=combined&group=${groupId}&`);
        const html = jQuery.parseHTML(res);
        const headers = [];
        jQuery(html).find('#combined_table tr:eq(0) th').each(function() {
            const img = jQuery(this).find('img').attr('src');
            if (img) {
                let name = img.split('/').pop().replace('.webp', '');
                if (name.startsWith('unit_')) name = name.replace('unit_', '');
                headers.push(name);
            } else {
                headers.push(null);
            }
        });

        const troops = [];
        jQuery(html).find('#combined_table tr.nowrap').each(function() {
            const row = {};
            headers.forEach((header, idx) => {
                if (header && header !== 'building' && header !== 'unit') {
                    const villageId = jQuery(this).find('td:eq(1) span.quickedit-vn').attr('data-id');
                    row.villageId = parseInt(villageId);
                    row[header] = parseInt(jQuery(this).find(`td:eq(${idx})`).text()) || 0;
                }
            });
            if (row.villageId) troops.push(row);
        });
        return troops;
    } catch (e) {
        console.error('Error fetching troops:', e);
        return [];
    }
}

// Fetch village groups
async function fetchGroups() {
    try {
        return await jQuery.get(game_data.link_base_pure + 'groups&mode=overview&ajax=load_group_menu');
    } catch (e) {
        console.error('Error fetching groups:', e);
        return { result: {} };
    }
}

// Update display for a village
function updateVillageDisplay(row, unitType, distance) {
    const cell = row.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        const orig = cell.attr('data-original-distance');
        cell.html(orig || distance.toFixed(2));
        return;
    }

    const sendTime = getSendTime(unitType, distance, currentLandingTime);
    const serverTime = getServerTime();
    const travelFormatted = formatTravelTime(unitType, distance);

    if (sendTime && sendTime >= serverTime) {
        cell.html(`<span style="color: green; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelFormatted}">🕒 ${formatDateTime(sendTime)}</span>`);
    } else if (sendTime && sendTime < serverTime) {
        cell.html(`<span style="color: red; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelFormatted}">⚠️ ${tt('Send Time')} Άκυρο Ψηλέ!</span>`);
    } else {
        cell.html(distance.toFixed(2));
    }
}

// Update all displays
function updateAllDisplays() {
    if (!currentLandingTime) {
        const val = jQuery('#raLandingTime').val();
        if (val) currentLandingTime = parseLandingTime(val);
        else return;
    }

    jQuery('#raAttackPlannerTable tbody tr').each(function() {
        const row = jQuery(this);
        const selected = row.find('img.ra-selected-unit').first();
        const cell = row.find('td:eq(1)');
        let dist = parseFloat(cell.attr('data-original-distance'));
        if (isNaN(dist)) dist = parseFloat(cell.text());

        if (selected.length && !isNaN(dist)) {
            updateVillageDisplay(row, selected.attr('data-unit-type'), dist);
        }
    });
}

// Initialize script
async function init() {
    console.debug('=== Single Village Planner v2.2.4 ===');

    getWorldSettings();
    await fetchUnitInfo();

    const groups = await fetchGroups();
    troopCounts = await fetchTroops(GROUP_ID);
    let villages = await fetchVillages(GROUP_ID);

    currentDestinationVillage = getDestinationVillage();
    villages = villages.map(v => ({
        ...v,
        distance: calculateDistance(v.coords, currentDestinationVillage)
    })).sort((a, b) => a.distance - b.distance);

    // Build table HTML
    let tableHtml = `
    <table id="raAttackPlannerTable" class="ra-table" width="100%">
        <thead><tr>
            <th class="ra-text-left" width="25%">${tt('Village')} (${villages.length})</th>
            <th width="20%">${tt('Send Time')}</th>
            <th width="5%">${tt('Prio.')}</th>
            <th><img src="/graphic/unit/unit_spear.webp" data-set-unit="spear"></th>
            <th><img src="/graphic/unit/unit_sword.webp" data-set-unit="sword"></th>
            <th><img src="/graphic/unit/unit_axe.webp" data-set-unit="axe"></th>
            <th><img src="/graphic/unit/unit_spy.webp" data-set-unit="spy"></th>
            <th><img src="/graphic/unit/unit_light.webp" data-set-unit="light"></th>
            <th><img src="/graphic/unit/unit_heavy.webp" data-set-unit="heavy"></th>
            <th><img src="/graphic/unit/unit_ram.webp" data-set-unit="ram"></th>
            <th><img src="/graphic/unit/unit_catapult.webp" data-set-unit="catapult"></th>
            <th><img src="/graphic/unit/unit_snob.webp" data-set-unit="snob"></th>
        </tr></thead>
        <tbody>
    `;

    // Match villages with troops
    const combined = [];
    villages.forEach(v => {
        const troops = troopCounts.find(t => t.villageId === v.id) || {};
        combined.push({ ...v, ...troops });
    });

    combined.forEach(v => {
        const continent = v.coords ? (v.coords.split('|')[1].charAt(0) + v.coords.split('|')[0].charAt(0)) : '';
        tableHtml += `
            <tr>
                <td class="ra-text-left"><a href="${game_data.link_base_pure}info_village&id=${v.id}" target="_blank">${v.name} (${v.coords}) K${continent}</a></td>
                <td data-original-distance="${v.distance.toFixed(2)}">${v.distance.toFixed(2)}</td>
                <td><span class="icon header favorite_add"></span></td>
                <td><img data-unit-type="spear" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_spear.webp"><span>${(v.spear || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="sword" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_sword.webp"><span>${(v.sword || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="axe" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_axe.webp"><span>${(v.axe || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="spy" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_spy.webp"><span>${(v.spy || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="light" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_light.webp"><span>${(v.light || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="heavy" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_heavy.webp"><span>${(v.heavy || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="ram" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_ram.webp"><span>${(v.ram || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="catapult" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_catapult.webp"><span>${(v.catapult || 0).toLocaleString('de')}</span></td>
                <td><img data-unit-type="snob" data-village-id="${v.id}" data-village-coords="${v.coords}" src="/graphic/unit/unit_snob.webp"><span>${(v.snob || 0).toLocaleString('de')}</span></td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;

    // Groups filter
    let groupsHtml = `<select id="raGroupsFilter">`;
    if (groups.result) {
        for (const [id, group] of Object.entries(groups.result)) {
            groupsHtml += `<option value="${group.group_id}" ${parseInt(group.group_id) === GROUP_ID ? 'selected' : ''}>${group.name}</option>`;
        }
    }
    groupsHtml += `</select>`;

    const defaultTime = formatDateTime(new Date(Date.now() + 86400000));

    const fullHtml = `
        <div id="raSingleVillagePlanner" style="margin:10px; padding:10px; border:1px solid #603000; background:#f4e4bc;">
            <h2>${tt('Single Village Planner')}</h2>
            <div class="ra-mb15">
                <div style="display: grid; grid-template-columns: 1fr 150px; gap: 20px;">
                    <div>
                        <label>${tt('Landing Time')} (dd/mm/yyyy HH:mm:ss)</label>
                        <input id="raLandingTime" type="text" value="${defaultTime}" style="width:100%;">
                        <small>${tt('Click on a unit to see send time')}</small>
                    </div>
                    <div>
                        <label>${tt('Group')}</label>
                        ${groupsHtml}
                    </div>
                </div>
            </div>
            ${tableHtml}
            <div class="ra-mb15" style="margin-top:15px;">
                <button id="calculateLaunchTimes" class="btn">${tt('Calculate Launch Times')}</button>
                <button id="resetAll" class="btn">Reset</button>
                <button id="resetGroupBtn" class="btn">${tt('Reset Chosen Group')}</button>
            </div>
            <div id="raVillagePlanner" style="display:none;">
                <textarea id="raExportPlanBBCode" rows="5" style="width:100%;"></textarea>
                <textarea id="raExportPlanCode" rows="5" style="width:100%;"></textarea>
            </div>
            <small>${tt(scriptData.name)} ${scriptData.version}</small>
        </div>
        <style>
            .ra-table td img { cursor: pointer; border: 2px solid transparent; }
            .ra-table td img.ra-selected-unit { border-color: red; }
            .ra-table td .icon { cursor: pointer; filter: grayscale(100%); }
            .ra-table td .icon.ra-priority-village { filter: none; }
        </style>
    `;

    jQuery('#contentContainer').prepend(fullHtml);

    // Set current landing time
    currentLandingTime = parseLandingTime(defaultTime);

    // Attach event handlers
    attachEvents();

    // Initial update
    setTimeout(updateAllDisplays, 100);

    jQuery('html,body').animate({ scrollTop: jQuery('#raSingleVillagePlanner').offset().top - 8 }, 'slow');
}

// Attach all event handlers
function attachEvents() {
    // Unit selection
    jQuery('.ra-table td img').on('click', function() {
        const row = jQuery(this).closest('tr');
        const wasSelected = jQuery(this).hasClass('ra-selected-unit');
        const cell = row.find('td:eq(1)');
        let dist = parseFloat(cell.attr('data-original-distance'));
        if (isNaN(dist)) dist = parseFloat(cell.text());

        if (!wasSelected) {
            row.find('img').not(this).removeClass('ra-selected-unit');
            jQuery(this).addClass('ra-selected-unit');
            if (!isNaN(dist) && currentLandingTime) {
                updateVillageDisplay(row, jQuery(this).attr('data-unit-type'), dist);
            }
        } else {
            jQuery(this).removeClass('ra-selected-unit');
            cell.html(dist.toFixed(2));
        }

        if (row.find('img.ra-selected-unit').length) {
            row.addClass('ra-selected-village');
        } else {
            row.removeClass('ra-selected-village');
            row.find('td .icon').removeClass('ra-priority-village');
        }
    });

    // Priority selection
    jQuery('.ra-table td .icon').on('click', function() {
        if (jQuery(this).closest('tr').find('.ra-selected-unit').length) {
            jQuery(this).toggleClass('ra-priority-village');
        } else {
            UI.ErrorMessage(tt('This village has no unit selected!'));
        }
    });

    // Landing time change
    jQuery('#raLandingTime').on('change keyup', function() {
        const val = jQuery(this).val();
        if (val) {
            currentLandingTime = parseLandingTime(val);
            updateAllDisplays();
        }
    });

    // Group change
    jQuery('#raGroupsFilter').on('change', function() {
        localStorage.setItem(`${LS_PREFIX}_chosen_group`, jQuery(this).val());
        location.reload();
    });

    // Reset group
    jQuery('#resetGroupBtn').on('click', function() {
        localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
        UI.SuccessMessage(tt('Chosen group was reset!'));
        location.reload();
    });

    // Reset all
    jQuery('#resetAll').on('click', function() {
        location.reload();
    });

    // Calculate launch times
    jQuery('#calculateLaunchTimes').on('click', function() {
        const landingTimeStr = jQuery('#raLandingTime').val();
        const dest = getDestinationVillage();
        const units = [];

        jQuery('#raAttackPlannerTable .ra-selected-unit').each(function() {
            units.push({
                id: parseInt(jQuery(this).attr('data-village-id')),
                unit: jQuery(this).attr('data-unit-type'),
                coords: jQuery(this).attr('data-village-coords'),
                highPrio: jQuery(this).closest('tr').find('td .ra-priority-village').length > 0,
                distance: calculateDistance(jQuery(this).attr('data-village-coords'), dest)
            });
        });

        if (!units.length || !landingTimeStr) {
            UI.ErrorMessage(tt('Missing user input!'));
            return;
        }

        UI.SuccessMessage(tt('Launch times are being calculated ...'));
        const landingTime = parseLandingTime(landingTimeStr);
        const plans = [];

        units.forEach(u => {
            const sendTime = getSendTime(u.unit, u.distance, landingTime);
            if (sendTime) {
                plans.push({
                    unit: u.unit,
                    coords: u.coords,
                    highPrio: u.highPrio,
                    villageId: u.id,
                    launchTimeFormatted: formatDateTime(sendTime)
                });
            }
        });

        plans.sort((a, b) => new Date(a.launchTimeFormatted) - new Date(b.launchTimeFormatted));

        if (plans.length) {
            let bbCode = `[size=12][b]${tt('Plan for:')}[/b] ${dest}\n[b]${tt('Landing Time:')}[/b] ${landingTimeStr}[/size]\n\n`;
            bbCode += `[table][**]${tt('Unit')}[||]${tt('From')}[||]${tt('Priority')}[||]${tt('Launch Time')}[||]${tt('Command')}[/**]\n`;

            let plainCode = `[size=12][b]${tt('Plan for:')}[/b] ${dest}\n[b]${tt('Landing Time:')}[/b] ${landingTimeStr}[/size]\n\n`;

            plans.forEach(p => {
                const [tx, ty] = dest.split('|');
                const priority = p.highPrio ? tt('Early send') : '';
                const rallyData = game_data.market !== 'uk' ? `&x=${tx}&y=${ty}` : '';
                const sitterData = game_data.player.sitter > 0 ? `t=${game_data.player.id}` : '';
                const url = `/game.php?${sitterData}&village=${p.villageId}&screen=place${rallyData}`;

                bbCode += `[*][unit]${p.unit}[/unit][|] ${p.coords} [|][b][color=#ff0000]${priority}[/color][/b][|]${p.launchTimeFormatted}[|][url=${window.location.origin}${url}]${tt('Send')}[/url][|]\n`;
                plainCode += `[unit]${p.unit}[/unit] ${p.coords} [b][color=#ff0000]${priority}[/color][/b] ${p.launchTimeFormatted} [url=${window.location.origin}${url}]${tt('Send')}[/url]\n`;
            });

            bbCode += `[/table]`;
            jQuery('#raVillagePlanner').show();
            jQuery('#raExportPlanBBCode').val(bbCode);
            jQuery('#raExportPlanCode').val(plainCode);
        } else {
            UI.ErrorMessage(tt('No possible combinations found!'));
        }
    });
}

// Start script
(async function() {
    if (window.location.href.includes('screen=info_village')) {
        await init();
    } else {
        UI.ErrorMessage(tt('This script can only be run on a single village screen!'));
    }
})();