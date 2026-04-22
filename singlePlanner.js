/*
 * Script Name: Single Village Planner
 * Version: v3.0.0
 * Last Updated: 2026-04-22
 * Author: RedAlert
 * Mod: Asio - Uses AJAX to get travel times directly from game (100% accurate)
 */

var scriptData = {
    name: 'Single Village Planner',
    version: 'v3.0.0',
    author: 'RedAlert',
    authorUrl: 'https://twscripts.dev/',
    helpLink: 'https://forum.tribalwars.net/index.php?threads/single-village-planner.286667/',
};

// Constants
var LS_PREFIX = 'raSingleVillagePlanner';
var GROUP_ID = localStorage.getItem(`${LS_PREFIX}_chosen_group`) ?? 0;

// Globals
var troopCounts = [];
var currentDestinationVillage = '';
var currentLandingTime = null;
var travelTimeCache = new Map(); // Cache for travel times

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
        'Calculating travel times...': 'Calculating travel times...',
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
        'Calculating travel times...': 'Υπολογισμός χρόνων ταξιδιού...',
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

// ============ SERVER TIME FUNCTIONS ============

function getServerDateTime() {
    const serverTime = $('#serverTime').text();
    const serverDate = $('#serverDate').text();
    const [day, month, year] = serverDate.split('/');
    const [hour, minute, second] = serverTime.split(':');
    return new Date(year, month - 1, day, hour, minute, second);
}

function getServerTimeMs() {
    return getServerDateTime().getTime();
}

// ============ AJAX TRAVEL TIME (LIKE PROVEN SCRIPT) ============

async function getTravelTimeFromGame(villageId, targetCoords, unitType) {
    const cacheKey = `${villageId}_${targetCoords}_${unitType}`;

    // Check cache first
    if (travelTimeCache.has(cacheKey)) {
        console.debug(`Cache hit for ${cacheKey}: ${travelTimeCache.get(cacheKey)} ms`);
        return travelTimeCache.get(cacheKey);
    }

    return new Promise((resolve) => {
        const [toX, toY] = targetCoords.split('|');
        const url = `/game.php?village=${villageId}&screen=place&mode=command&x=${toX}&y=${toY}&type=${unitType}`;

        console.debug(`Fetching travel time from: ${url}`);

        jQuery.get(url)
            .done(function(html) {
                const $html = jQuery(html);
                const duration = $html.find('#date_arrival span').data('duration');

                if (duration !== undefined && duration !== null) {
                    const travelMs = duration * 1000;
                    travelTimeCache.set(cacheKey, travelMs);
                    console.debug(`Travel time for ${unitType} from village ${villageId}: ${travelMs} ms (${duration} seconds)`);
                    resolve(travelMs);
                } else {
                    console.error(`Could not find duration for ${cacheKey}`);
                    resolve(null);
                }
            })
            .fail(function(error) {
                console.error(`Failed to fetch rally point for ${cacheKey}:`, error);
                resolve(null);
            });
    });
}

// ============ HELPER FUNCTIONS ============

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
    const landingTimeFormatted = year + '-' + month + '-' + day + 'T' + landingHour;
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
                <td data-village-id="${village.id}" data-village-coords="${village.coords}">
                    ${tt('Click on a unit')}
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

    villagesTable += `</tbody></tr>`;
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

// Update send time display for a village (using AJAX)
async function updateSendTimeForVillage(villageRow, unitType, villageId, villageCoords) {
    const distanceCell = villageRow.find('td:eq(1)');

    if (!unitType || !currentLandingTime) {
        distanceCell.html(tt('Click on a unit'));
        return;
    }

    // Show loading indicator
    distanceCell.html(`<span style="color: #ff9933;">${tt('Calculating travel times...')}</span>`);

    const travelMs = await getTravelTimeFromGame(villageId, currentDestinationVillage, unitType);

    if (travelMs === null) {
        distanceCell.html(`<span style="color: red;">Error getting travel time</span>`);
        return;
    }

    const sendTime = new Date(currentLandingTime.getTime() - travelMs);
    const serverTime = getServerDateTime();
    const travelSeconds = Math.round(travelMs / 1000);
    const hours = Math.floor(travelSeconds / 3600);
    const minutes = Math.floor((travelSeconds % 3600) / 60);
    const seconds = travelSeconds % 60;
    const travelFormatted = `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 || hours > 0 ? minutes + 'm ' : ''}${seconds}s`.trim();

    if (sendTime >= serverTime) {
        const formattedSendTime = formatDateTime(sendTime);
        distanceCell.html(`<span style="color: green; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelFormatted}">🕒 ${formattedSendTime}</span>`);
    } else {
        distanceCell.html(`<span style="color: red; font-weight: bold; cursor: help;" title="${tt('Travel Time')}: ${travelFormatted}">⚠️ ${tt('Send Time')} passed</span>`);
    }
}

// ============ EVENT HANDLERS ============

// Unit selection handler (with AJAX)
function attachUnitSelectionHandler() {
    jQuery('.ra-table td img').on('click', async function() {
        const row = jQuery(this).closest('tr');
        const wasSelected = jQuery(this).hasClass('ra-selected-unit');
        const villageId = parseInt(jQuery(this).attr('data-village-id'));
        const villageCoords = jQuery(this).attr('data-village-coords');

        if (!wasSelected) {
            // Deselect all other units in this row
            row.find('img').not(this).removeClass('ra-selected-unit');
            jQuery(this).addClass('ra-selected-unit');

            const unitType = jQuery(this).attr('data-unit-type');

            if (currentLandingTime) {
                await updateSendTimeForVillage(row, unitType, villageId, villageCoords);
            }
        } else {
            jQuery(this).removeClass('ra-selected-unit');
            row.find('td:eq(1)').html(tt('Click on a unit'));
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
    jQuery('#raLandingTime').on('change keyup', async function() {
        const landingTimeVal = jQuery(this).val().trim();
        if (landingTimeVal) {
            currentLandingTime = getLandingTime(landingTimeVal);

            // Update all selected units
            jQuery('#raAttackPlannerTable tbody tr').each(async function() {
                const row = jQuery(this);
                const selectedUnit = row.find('img.ra-selected-unit').first();
                if (selectedUnit.length) {
                    const villageId = parseInt(selectedUnit.attr('data-village-id'));
                    const villageCoords = selectedUnit.attr('data-village-coords');
                    const unitType = selectedUnit.attr('data-unit-type');
                    await updateSendTimeForVillage(row, unitType, villageId, villageCoords);
                }
            });
        }
    });
}

// Calculate launch times handler (EXPORT)
function attachCalculateHandler() {
    jQuery('#calculateLaunchTimes').on('click', async function(e) {
        e.preventDefault();

        const landingTimeString = jQuery('#raLandingTime').val().trim();
        const destinationVillage = getDestinationVillage();

        if (!landingTimeString) {
            UI.ErrorMessage(tt('Missing user input!'));
            return;
        }

        const selectedUnits = [];
        jQuery('#raAttackPlannerTable .ra-selected-unit').each(function() {
            selectedUnits.push({
                id: parseInt(jQuery(this).attr('data-village-id')),
                unit: jQuery(this).attr('data-unit-type'),
                coords: jQuery(this).attr('data-village-coords'),
                highPrio: jQuery(this).closest('tr').find('td .ra-priority-village').length > 0,
            });
        });

        if (selectedUnits.length === 0) {
            UI.ErrorMessage(tt('Missing user input!'));
            return;
        }

        UI.SuccessMessage(tt('Launch times are being calculated ...'));
        const landingTime = getLandingTime(landingTimeString);
        const plans = [];

        // Show progress
        let completed = 0;
        const total = selectedUnits.length;

        for (const item of selectedUnits) {
            const travelMs = await getTravelTimeFromGame(item.id, destinationVillage, item.unit);

            if (travelMs !== null) {
                const sendTime = new Date(landingTime.getTime() - travelMs);
                if (sendTime >= getServerDateTime()) {
                    plans.push({
                        unit: item.unit,
                        coords: item.coords,
                        highPrio: item.highPrio,
                        villageId: item.id,
                        launchTimeFormatted: formatDateTime(sendTime),
                    });
                }
            }

            completed++;
            if (completed % 5 === 0 || completed === total) {
                UI.SuccessMessage(`Calculating launch times... ${completed}/${total}`);
            }
        }

        plans.sort((a, b) => {
            const timeA = new Date(a.launchTimeFormatted.split(' ').reverse().join(' '));
            const timeB = new Date(b.launchTimeFormatted.split(' ').reverse().join(' '));
            return timeA - timeB;
        });

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
            UI.SuccessMessage(`Done! ${plans.length} commands calculated.`);
        } else {
            UI.ErrorMessage(tt('No possible combinations found!'));
            jQuery('#raVillagePlanner').hide();
        }
    });
}

// Reset handlers

// Store current group ID globally
let currentGroupId = GROUP_ID;

// Modified filter function
function filterVillagesByChosenGroup() {
    jQuery('#raGroupsFilter').off('change').on('change', function(e) {
        const newGroupId = jQuery(this).val();
        if (newGroupId !== currentGroupId) {
            currentGroupId = newGroupId;
            localStorage.setItem(`${LS_PREFIX}_chosen_group`, newGroupId);
            // Reload the page to ensure clean state
            window.location.reload();
        }
    });
}

// Modified reset group function
function resetGroup() {
    jQuery('#resetGroupBtn').off('click').on('click', function(e) {
        e.preventDefault();
        localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
        currentGroupId = 0;
        UI.SuccessMessage(tt('Chosen group was reset!'));
        window.location.reload();
    });
}


function attachResetHandlers() {
    jQuery('#resetAll').on('click', function(e) {
        e.preventDefault();
        travelTimeCache.clear();
        location.reload();
    });

    jQuery('#resetGroupBtn').on('click', function(e) {
        e.preventDefault();
        localStorage.removeItem(`${LS_PREFIX}_chosen_group`);
        travelTimeCache.clear();
        UI.SuccessMessage(tt('Chosen group was reset!'));
        location.reload();
    });
}

// Group filter handler
function attachGroupFilterHandler() {
    jQuery('#raGroupsFilter').on('change', function(e) {
        e.preventDefault();
        const newGroupId = jQuery(this).val();
        localStorage.setItem(`${LS_PREFIX}_chosen_group`, newGroupId);
        travelTimeCache.clear();
        location.reload();
    });
}

// Set all units handler
function attachSetAllUnitsHandler() {
    jQuery('#raAttackPlannerTable thead tr th img').on('click', async function() {
        const chosenUnit = jQuery(this).attr('data-set-unit');
        if (chosenUnit) {
            for (const row of jQuery('#raAttackPlannerTable tbody tr')) {
                const $row = jQuery(row);
                const $img = $row.find(`img[data-unit-type="${chosenUnit}"]`);
                if ($img.length) {
                    $img.trigger('click');
                    // Small delay to avoid overwhelming the server
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
    });
}

// Fill landing time from command handler
function attachCommandClickHandler() {
    jQuery('#commands_outgoings table tbody tr.command-row, #commands_incomings table tbody tr.command-row').on('click', function() {
        const commandLandingTime = parseInt(jQuery(this).find('td:eq(2) span').attr('data-endtime')) * 1000;
        const landingTimeDateTime = new Date(commandLandingTime);
        const formattedNewLandingTime = formatDateTime(landingTimeDateTime);

        jQuery('#raLandingTime').val(formattedNewLandingTime);
        currentLandingTime = getLandingTime(formattedNewLandingTime);

        // Trigger update
        jQuery('#raLandingTime').trigger('keyup');
        UI.SuccessMessage(tt('Landing time was updated!'));
    });
}

// ============ INITIALIZATION ============

async function init() {
    console.debug('=== Single Village Planner v3.0.0 (AJAX Mode) ===');

    // Show loading message
    const loadingHtml = `
        <div id="raSingleVillagePlanner" style="margin:10px; padding:10px; border:1px solid #603000; background:#f4e4bc; text-align:center;">
            <h2>${tt('Single Village Planner')}</h2>
            <p>Loading villages and troops...</p>
        </div>
    `;
    jQuery('#contentContainer').prepend(loadingHtml);

    // Fetch villages and groups
    const groups = await fetchVillageGroups();
    troopCounts = await fetchTroopsForCurrentGroup();
    let villages = await fetchAllPlayerVillagesByGroup(GROUP_ID);

    currentDestinationVillage = getDestinationVillage();

    villages = villages.sort((a, b) => a.id - b.id);

    const villagesTable = renderVillagesTable(villages);
    const groupsFilter = renderGroupsFilter(groups);

    const defaultTime = formatDateTime(new Date(Date.now() + 86400000));
    currentLandingTime = getLandingTime(defaultTime);

    const fullHtml = `
        <div id="raSingleVillagePlanner" style="margin:10px; padding:10px; border:1px solid #603000; background:#f4e4bc;">
            <h2>${tt('Single Village Planner')} (AJAX Mode - 100% Accurate)</h2>
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
    console.debug(`Total villages: ${villages.length}`);
    console.debug(`Destination: ${currentDestinationVillage}`);
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