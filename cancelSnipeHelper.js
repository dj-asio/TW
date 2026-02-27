// ==UserScript==
// @name         Cancel Snipe Helper (Greek Fixed - Works on ALL commands)
// @namespace    http://tampermonkey.net/
// @version      1.0.7
// @description  Calculate cancel snipe time for Tribal Wars - Works on Support AND Attack commands (Greek fix)
// @author       RedAlert (Greek fix by dj-asio)
// @match        https://fyletikesmaxes.gr/game.php*
// @match        https://*.fyletikesmaxes.gr/game.php*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 Cancel Snipe Helper starting...');

    // User Input
    if (typeof DEBUG !== 'boolean') var DEBUG = true; // Turn on debug temporarily

    // Wait for page to fully load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('📋 Checking if on command page...');

        // Check if on correct screen
        const urlParams = new URLSearchParams(window.location.search);
        const screen = urlParams.get('screen');

        if (screen !== 'info_command') {
            alert('❌ This script only works on command pages!\nΠήγαινε σε μια εντολή (support ή attack)');
            return;
        }

        // Try to read command data
        try {
            const commandData = readCommandData();
            if (!commandData) {
                alert('❌ Could not read command data!\nΔεν μπόρεσα να διαβάσω τα στοιχεία της εντολής');
                return;
            }

            console.log('✅ Command data loaded:', commandData);
            showPopup(commandData);

        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error: ' + error.message);
        }
    }

    function readCommandData() {
        // Find the command info table
        const tables = document.getElementsByClassName('vis');
        if (!tables || tables.length === 0) {
            console.log('No vis table found');
            return null;
        }

        const table = tables[0];
        let duration = null;
        let arrival = null;

        // Try different possible row positions
        for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i];
            const cells = row.cells;

            if (cells.length < 2) continue;

            const label = cells[0].textContent.trim().toLowerCase();
            const value = cells[1].textContent.trim();

            console.log(`Row ${i}: "${label}" -> "${value}"`);

            if (label.includes('διάρκεια') || label.includes('duration')) {
                duration = value;
                console.log('✅ Found duration:', duration);
            }
            if (label.includes('άφιξη') || label.includes('arrival')) {
                arrival = value;
                console.log('✅ Found arrival:', arrival);
            }
        }

        if (!duration || !arrival) {
            console.log('❌ Could not find duration or arrival');
            return null;
        }

        return { duration, arrival };
    }

    function parseGreekDateTime(dateTimeStr) {
        console.log('Parsing date:', dateTimeStr);

        // Remove HTML tags if any
        dateTimeStr = dateTimeStr.replace(/<[^>]*>/g, '').trim();

        // Get current server date
        const serverDateEl = document.getElementById('serverDate');
        const serverTimeEl = document.getElementById('serverTime');

        if (!serverDateEl || !serverTimeEl) {
            console.log('❌ Could not find server time elements');
            return null;
        }

        const serverDate = serverDateEl.textContent.trim();
        const [day, month, year] = serverDate.split('/');

        console.log('Server date:', serverDate, 'Day:', day, 'Month:', month, 'Year:', year);

        let fullDateStr = '';
        let timePart = '';

        // Extract time part (HH:MM:SS or HH:MM:SS:mmm) and FIX leading zeros
        const timeMatch = dateTimeStr.match(/(\d{1,2}):(\d{2}):(\d{2})(?::(\d{3}))?/);
        if (timeMatch) {
            let hours = timeMatch[1].padStart(2, '0');
            let minutes = timeMatch[2];
            let seconds = timeMatch[3];
            let milliseconds = timeMatch[4] ? timeMatch[4] : '000';

            timePart = `${hours}:${minutes}:${seconds}.${milliseconds}`;
        } else {
            // Try simpler format
            const simpleMatch = dateTimeStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
            if (simpleMatch) {
                let hours = simpleMatch[1].padStart(2, '0');
                let minutes = simpleMatch[2];
                let seconds = simpleMatch[3];
                timePart = `${hours}:${minutes}:${seconds}.000`;
            } else {
                timePart = '00:00:00.000';
            }
        }

        console.log('Fixed time part:', timePart);

        // Check if it contains Greek words or month names
        if (dateTimeStr.includes('Φεβ') || dateTimeStr.includes('Feb')) {
            // Handle format like "Φεβ 27, 2026 15:46:40:071"
            const monthMap = {
                'Ιαν': '01', 'Φεβ': '02', 'Μαρ': '03', 'Απρ': '04', 'Μαϊ': '05', 'Ιουν': '06',
                'Ιουλ': '07', 'Αυγ': '08', 'Σεπ': '09', 'Οκτ': '10', 'Νοε': '11', 'Δεκ': '12',
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };

            const monthMatch = dateTimeStr.match(/(\w{3})/);
            if (monthMatch) {
                const monthName = monthMatch[1];
                const monthNum = monthMap[monthName] || month;

                const dayMatch = dateTimeStr.match(/(\d{1,2})/);
                const dayNum = dayMatch ? dayMatch[1].padStart(2, '0') : day;

                const yearMatch = dateTimeStr.match(/\d{4}/);
                const yearNum = yearMatch ? yearMatch[0] : year;

                fullDateStr = `${yearNum}-${monthNum}-${dayNum}T${timePart}`;
            }
        }
        else if (dateTimeStr.includes('σήμερα') || dateTimeStr.toLowerCase().includes('today')) {
            fullDateStr = `${year}-${month}-${day}T${timePart}`;
        }
        else if (dateTimeStr.includes('αύριο') || dateTimeStr.toLowerCase().includes('tomorrow')) {
            const tomorrow = new Date(year, month-1, parseInt(day) + 1);
            const tomorrowYear = tomorrow.getFullYear();
            const tomorrowMonth = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
            const tomorrowDay = tomorrow.getDate().toString().padStart(2, '0');

            fullDateStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}T${timePart}`;
        }
        else {
            // Try to parse as is - check for date part
            const dateMatch = dateTimeStr.match(/(\d{1,2})[\/\.](\d{1,2})(?:[\/\.](\d{2,4}))?/);

            if (dateMatch) {
                let inputDay = dateMatch[1].padStart(2, '0');
                let inputMonth = dateMatch[2].padStart(2, '0');
                let inputYear = dateMatch[3] || year;

                if (inputYear.length === 2) {
                    inputYear = '20' + inputYear;
                }

                fullDateStr = `${inputYear}-${inputMonth}-${inputDay}T${timePart}`;
            } else {
                fullDateStr = `${year}-${month}-${day}T${timePart}`;
            }
        }

        console.log('Final date string for parsing:', fullDateStr);

        // Parse to Date object
        const date = new Date(fullDateStr);

        if (isNaN(date.getTime())) {
            console.log('❌ Failed to parse date:', fullDateStr);
            return null;
        }

        console.log('✅ Successfully parsed date:', date.toString());
        return date;
    }

    function parseDuration(durationStr) {
        console.log('Parsing duration:', durationStr);

        // Remove HTML and trim
        durationStr = durationStr.replace(/<[^>]*>/g, '').trim();

        // Match time format HH:MM:SS
        const timeMatch = durationStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
        if (!timeMatch) {
            console.log('❌ Could not parse duration');
            return null;
        }

        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        console.log('Duration in seconds:', totalSeconds);

        return totalSeconds;
    }

    function showPopup(commandData) {
        console.log('Showing popup with data:', commandData);

        // Parse arrival time from command
        const arrivalDate = parseGreekDateTime(commandData.arrival);
        if (!arrivalDate) {
            alert('❌ Could not parse arrival time');
            return;
        }

        // Parse duration
        const durationSeconds = parseDuration(commandData.duration);
        if (!durationSeconds) {
            alert('❌ Could not parse duration');
            return;
        }

        // Calculate departure time (when the support LEFT the village)
        const departureTime = new Date(arrivalDate.getTime() - (durationSeconds * 1000));

        // Get current server time
        const serverDateEl = document.getElementById('serverDate');
        const serverTimeEl = document.getElementById('serverTime');
        const [day, month, year] = serverDateEl.textContent.trim().split('/');
        const timeMatch = serverTimeEl.textContent.match(/(\d{2}):(\d{2}):(\d{2})/);

        const currentServerTime = new Date(year, month-1, day,
            parseInt(timeMatch[1]), parseInt(timeMatch[2]), parseInt(timeMatch[3]));

        console.log('Current server time:', currentServerTime.toString());
        console.log('Departure time (support left):', departureTime.toString());
        console.log('Support arrival time:', arrivalDate.toString());

        // Create popup
        const popup = document.createElement('div');
        popup.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        width: 400px;
        background: #f4e4bc;
        border: 2px solid #7d510f;
        border-radius: 10px;
        padding: 15px;
        z-index: 99999;
        font-family: Arial, sans-serif;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;

        popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #7d510f; padding-bottom: 10px;">
            <h3 style="margin: 0; color: #603000;">🎯 Cancel Snipe Helper</h3>
            <button id="closePopup" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #603000;">✖</button>
        </div>

        <div style="margin-bottom: 10px; padding: 8px; background: #e8d8b0; border-radius: 4px;">
            <p style="margin: 2px 0;"><strong>Ώρα αναχώρησης υποστήριξης:</strong> ${departureTime.toLocaleString('el-GR')}</p>
            <p style="margin: 2px 0;"><strong>Ώρα άφιξης υποστήριξης:</strong> ${arrivalDate.toLocaleString('el-GR')}</p>
            <p style="margin: 2px 0;"><strong>Τρέχουσα ώρα server:</strong> ${currentServerTime.toLocaleString('el-GR')}</p>
        </div>

        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Ώρα άφιξης ευγενή:</label>
            <input type="text" id="nobleTime" style="width: 100%; padding: 8px; border: 1px solid #7d510f; border-radius: 4px;" 
                placeholder="π.χ. σήμερα στις 16:00:00 ή 16:00:00">
        </div>

        <div style="margin-bottom: 15px; text-align: center;">
            <button id="calculateBtn" style="background: #c1a264; color: white; border: 1px solid #7d510f; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: bold;">Υπολογισμός</button>
        </div>

        <div id="resultArea" style="display: none; border-top: 1px solid #7d510f; padding-top: 15px;">
            <p><strong>Ώρα ακύρωσης:</strong> <span id="cancelTime" style="color: #3236a8; font-weight: bold;"></span></p>
            <p><strong>Ακύρωση σε:</strong> <span id="cancelIn" style="color: #ff0000; font-weight: bold;"></span></p>
            <p><strong>Ακύρωση σε ms:</strong> <span id="cancelInMs" style="color: #666; font-size: 11px;"></span></p>
        </div>

        <div style="margin-top: 15px; font-size: 11px; text-align: center; color: #666;">
            v1.0.7 - Δουλεύει σε Support και Attack commands
        </div>
    `;

        document.body.appendChild(popup);

        // Close button
        document.getElementById('closePopup').onclick = function() {
            popup.remove();
        };

        // Calculate button
        document.getElementById('calculateBtn').onclick = function() {
            const nobleTimeStr = document.getElementById('nobleTime').value.trim();
            if (!nobleTimeStr) {
                alert('Παρακαλώ βάλε ώρα άφιξης του ευγενή');
                return;
            }

            const nobleDate = parseGreekDateTime(nobleTimeStr);
            if (!nobleDate) {
                alert('Δεν μπόρεσα να διαβάσω την ώρα. Χρησιμοποίησε μορφή όπως: σήμερα στις 16:00:00');
                return;
            }

            console.log('Noble arrival:', nobleDate.toString());

            // ΣΩΣΤΗ φόρμουλα: (noble arrival + support departure) / 2
            const cancelTime = new Date((nobleDate.getTime() + departureTime.getTime()) / 2);
            console.log('Cancel time:', cancelTime.toString());

            // Compare with current server time
            const serverDateEl = document.getElementById('serverDate');
            const serverTimeEl = document.getElementById('serverTime');
            const [sDay, sMonth, sYear] = serverDateEl.textContent.trim().split('/');
            const sTimeMatch = serverTimeEl.textContent.match(/(\d{2}):(\d{2}):(\d{2})/);

            const now = new Date(sYear, sMonth-1, sDay,
                parseInt(sTimeMatch[1]), parseInt(sTimeMatch[2]), parseInt(sTimeMatch[3]));

            const msUntilCancel = cancelTime.getTime() - now.getTime();

            document.getElementById('resultArea').style.display = 'block';
            document.getElementById('cancelTime').textContent = cancelTime.toLocaleString('el-GR');
            document.getElementById('cancelInMs').textContent = msUntilCancel + ' ms';

            if (msUntilCancel < 0) {
                document.getElementById('cancelIn').textContent = '⏰ Η ώρα πέρασε!';
                return;
            }

            const secondsUntilCancel = Math.floor(msUntilCancel / 1000);
            const hours = Math.floor(secondsUntilCancel / 3600);
            const minutes = Math.floor((secondsUntilCancel % 3600) / 60);
            const seconds = secondsUntilCancel % 60;

            document.getElementById('cancelIn').textContent =
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Start countdown
            const timer = setInterval(function() {
                const serverDateEl2 = document.getElementById('serverDate');
                const serverTimeEl2 = document.getElementById('serverTime');
                const [sDay2, sMonth2, sYear2] = serverDateEl2.textContent.trim().split('/');
                const sTimeMatch2 = serverTimeEl2.textContent.match(/(\d{2}):(\d{2}):(\d{2})/);

                const now2 = new Date(sYear2, sMonth2-1, sDay2,
                    parseInt(sTimeMatch2[1]), parseInt(sTimeMatch2[2]), parseInt(sTimeMatch2[3]));

                const remaining = cancelTime.getTime() - now2.getTime();

                if (remaining <= 0) {
                    clearInterval(timer);
                    document.getElementById('cancelIn').textContent = '00:00:00';
                    return;
                }

                const secs = Math.floor(remaining / 1000);
                const h = Math.floor(secs / 3600);
                const m = Math.floor((secs % 3600) / 60);
                const s = secs % 60;

                document.getElementById('cancelIn').textContent =
                    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                document.getElementById('cancelInMs').textContent = remaining + ' ms';
            }, 100);
        };

        // Make draggable
        let isDragging = false;
        let offsetX, offsetY;

        popup.querySelector('h3').parentElement.onmousedown = function(e) {
            isDragging = true;
            offsetX = e.clientX - popup.offsetLeft;
            offsetY = e.clientY - popup.offsetTop;
        };

        document.onmousemove = function(e) {
            if (isDragging) {
                popup.style.left = (e.clientX - offsetX) + 'px';
                popup.style.top = (e.clientY - offsetY) + 'px';
                popup.style.right = 'auto';
            }
        };

        document.onmouseup = function() {
            isDragging = false;
        };
    }

})();