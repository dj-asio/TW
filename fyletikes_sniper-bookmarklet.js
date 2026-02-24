javascript:(function() {
    // Fyletikes Maxes Universal Sniper - Bookmarklet Version
    // Save this as a bookmark by pasting the ENTIRE code as the URL

    const version = '2.0-bookmarklet';

    // Create and inject the sniper panel
    const panel = document.createElement('div');
    panel.id = 'universal-sniper-panel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 99999;
        border: 2px solid #ffd700;
        font-family: Arial, sans-serif;
        width: 320px;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    `;

    panel.innerHTML = `
        <h3 style="margin:0 0 15px 0; color: #ffd700; text-align: center; border-bottom: 1px solid #333; padding-bottom: 10px;">
            ⚡ Universal MS Sniper ${version}
        </h3>
        
        <div style="margin-bottom: 15px;">
            <div style="color: #aaa; margin-bottom: 5px;">🎯 Attack Type:</div>
            <div style="display: flex; gap: 10px;">
                <label id="support-label" style="flex:1; padding: 8px; background: #4CAF50; text-align: center; border-radius: 5px; cursor: pointer;">
                    <input type="radio" name="attackType" value="support" checked style="display: none;"> 🛡️ Support
                </label>
                <label id="noble-label" style="flex:1; padding: 8px; background: #333; text-align: center; border-radius: 5px; cursor: pointer;">
                    <input type="radio" name="attackType" value="noble" style="display: none;"> 👑 Noble
                </label>
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <div style="color: #aaa; margin-bottom: 5px;">⏰ Target Time (HH:MM:SS):</div>
            <input type="text" id="target-time" placeholder="14:30:15" 
                   style="width:100%; padding:8px; background:#333; color:white; border:1px solid #ffd700; border-radius:5px; box-sizing:border-box;">
        </div>

        <div style="margin-bottom: 15px;">
            <div style="color: #aaa; margin-bottom: 5px;">⚡ Target Milliseconds (0-999):</div>
            <input type="number" id="target-ms" value="259" min="0" max="999" 
                   style="width:100%; padding:8px; background:#333; color:white; border:1px solid #ffd700; border-radius:5px; box-sizing:border-box;">
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button id="calibrate-btn" style="flex:1; background:#4CAF50; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">
                🔧 Calibrate
            </button>
            <button id="snipe-btn" style="flex:1; background:#f44336; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;">
                🎯 Set Snipe
            </button>
        </div>

        <div style="background: #222; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <div style="color: #aaa; font-size: 12px;">Current target:</div>
            <div id="current-target" style="color: #ffd700; font-weight: bold; margin-top: 5px; padding: 5px; background: #333; border-radius: 3px; text-align: center;">
                🛡️ Support (Αποστολή αμυνών)
            </div>
        </div>

        <div id="sniper-status" style="font-size:12px; color: #aaa; text-align: center; padding: 5px;">
            Status: Ready
        </div>
        
        <div id="sniper-countdown" style="font-size:24px; font-weight:bold; color:#ffd700; text-align:center; margin-top:15px; padding:10px; background:#222; border-radius:5px;">
            00:00.000
        </div>
        
        <div style="text-align: right; margin-top: 10px;">
            <button id="close-panel" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 12px;">✖ Close</button>
        </div>
    `;

    document.body.appendChild(panel);

    // State variables
    let snipeTime = null;
    let targetMs = null;
    let latencySamples = [];
    let averageLatency = 0;
    let calibrationDone = false;
    let attackType = 'support';
    let countdownInterval = null;

    // Helper functions
    function updateStatus(message) {
        const statusEl = document.getElementById('sniper-status');
        if (statusEl) statusEl.innerHTML = `Status: ${message}`;
    }

    function updateTargetDisplay() {
        const display = document.getElementById('current-target');
        if (attackType === 'support') {
            display.innerHTML = '🛡️ Support (Αποστολή αμυνών)';
        } else {
            display.innerHTML = '👑 Noble (Αριστοκράτης / Επίθεση)';
        }
    }

    // Radio button handlers
    document.querySelectorAll('input[name="attackType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            attackType = e.target.value;
            updateTargetDisplay();

            document.getElementById('support-label').style.background =
                attackType === 'support' ? '#4CAF50' : '#333';
            document.getElementById('noble-label').style.background =
                attackType === 'noble' ? '#4CAF50' : '#333';
        });
    });

    // Calibration
    document.getElementById('calibrate-btn').addEventListener('click', () => {
        updateStatus('🔧 Calibrating...');
        latencySamples = [];

        let samples = 0;
        function calibrateStep() {
            const start = performance.now();
            for (let i = 0; i < 10000; i++) { let sum = i; }
            const end = performance.now();

            latencySamples.push(end - start);
            samples++;

            updateStatus(`🔧 Calibration: ${samples}/10`);

            if (samples < 10) {
                setTimeout(calibrateStep, 100);
            } else {
                averageLatency = latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length;
                calibrationDone = true;
                updateStatus(`✅ Calibrated! Avg latency: ${averageLatency.toFixed(2)}ms`);
            }
        }

        calibrateStep();
    });

    // Set snipe
    document.getElementById('snipe-btn').addEventListener('click', () => {
        const timeStr = document.getElementById('target-time').value;
        const targetMsVal = parseInt(document.getElementById('target-ms').value);

        if (!timeStr || isNaN(targetMsVal)) {
            alert('Please enter valid target time and milliseconds');
            return;
        }

        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        const now = new Date();

        snipeTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            seconds,
            targetMsVal
        );

        if (snipeTime < now) {
            snipeTime.setDate(snipeTime.getDate() + 1);
        }

        targetMs = targetMsVal;

        if (calibrationDone) {
            const compensation = averageLatency / 2;
            snipeTime = new Date(snipeTime.getTime() - compensation);
            updateStatus(`🎯 Target set with ${compensation.toFixed(2)}ms compensation`);
        } else {
            updateStatus('🎯 Target set (uncalibrated)');
        }

        // Clear existing countdown
        if (countdownInterval) clearInterval(countdownInterval);

        // Start countdown
        countdownInterval = setInterval(() => {
            const now = new Date();
            const diff = snipeTime - now;

            if (diff <= 0) {
                clearInterval(countdownInterval);
                executeSnipe();
                return;
            }

            const seconds = Math.floor(diff / 1000);
            const ms = diff % 1000;
            document.getElementById('sniper-countdown').textContent =
                `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
        }, 10);
    });

    // Execute snipe
    function executeSnipe() {
        const executionTime = new Date();
        const actualMs = executionTime.getMilliseconds();

        document.getElementById('sniper-countdown').textContent = '💥 SNIPE EXECUTED!';

        if (attackType === 'support') {
            // Click support button
            const supportBtn = document.querySelector(
                'input#troop_confirm_submit.troop_confirm_go.btn.btn-support[value="Αποστολή αμυνών"], ' +
                'input[value="Αποστολή αμυνών"]'
            );
            if (supportBtn) {
                supportBtn.click();
                supportBtn.style.border = '3px solid lime';
                alert('🛡️ SUPPORT SENT!');
            } else {
                alert('❌ Support button not found!');
            }
        } else {
            // Click noble button
            const nobleBtn = document.querySelector(
                'input[type="submit"][value="Επίθεση"], ' +
                'input[type="submit"][value*="Αριστοκράτης"]'
            );
            if (nobleBtn) {
                nobleBtn.click();
                nobleBtn.style.border = '3px solid #ffd700';
                alert('👑 NOBLE SENT!');
            } else {
                alert('❌ Noble button not found!');
            }
        }

        updateStatus(`Target: ${targetMs}ms | Actual: ${actualMs}ms | Diff: ${actualMs - targetMs}ms`);
    }

    // Close panel
    document.getElementById('close-panel').addEventListener('click', () => {
        panel.remove();
        if (countdownInterval) clearInterval(countdownInterval);
    });

    // Make panel draggable
    let isDragging = false;
    let offsetX, offsetY;

    panel.querySelector('h3').addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            panel.style.left = (e.clientX - offsetX) + 'px';
            panel.style.top = (e.clientY - offsetY) + 'px';
            panel.style.right = 'auto';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    console.log('🌍 Universal Sniper Bookmarklet loaded!');
})();