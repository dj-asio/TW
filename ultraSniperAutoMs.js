// UltraSniper.js - Fyletikes Maxes Millisecond Sniper
// Version: 3.2
// Author: dj-asio
// Loader: javascript:$.getScript("https://cdn.jsdelivr.net/gh/dj-asio/TW@main/ultraSniper.js");

(function() {
    'use strict';

    // Prevent double loading
    if (window.ultraSniperActive) {
        alert('⚠️ UltraSniper is already running!\nClick close button or refresh page.');
        return;
    }
    window.ultraSniperActive = true;

    console.log('🎯 UltraSniper v3.2 loading...');

    // Create main panel
    const panel = document.createElement('div');
    panel.id = 'ultraSniper-panel';
    panel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1a1a, #000);
        color: white;
        padding: 20px;
        border-radius: 12px;
        z-index: 999999;
        border: 2px solid #00ff00;
        font-family: 'Segoe UI', Arial, sans-serif;
        width: 340px;
        box-shadow: 0 0 30px rgba(0,255,0,0.3);
        backdrop-filter: blur(5px);
    `;

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
            <h3 style="margin:0; color: #00ff00; font-size: 18px;">
                ⚡ UltraSniper v3.2
            </h3>
            <span style="color: #666; font-size: 11px;">dj-asio</span>
        </div>
        
        <div style="margin-bottom: 15px;">
            <div style="color: #aaa; margin-bottom: 5px; font-size: 12px;">🎯 ATTACK TYPE:</div>
            <div style="display: flex; gap: 10px;">
                <label id="support-label" style="flex:1; padding: 10px; background: #4CAF50; text-align: center; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    <input type="radio" name="attackType" value="support" checked style="display: none;"> 🛡️ SUPPORT
                </label>
                <label id="noble-label" style="flex:1; padding: 10px; background: #333; text-align: center; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    <input type="radio" name="attackType" value="noble" style="display: none;"> 👑 NOBLE
                </label>
            </div>
        </div>

        <div style="background: #222; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <div style="flex:2;">
                    <div style="color: #aaa; font-size: 11px; margin-bottom: 3px;">⏰ TIME (HH:MM:SS)</div>
                    <input type="text" id="target-time" placeholder="00:00:00" 
                           style="width:100%; padding:8px; background:#333; color:#fff; border:1px solid #00ff00; border-radius:4px; font-family: monospace;">
                </div>
                <div style="flex:1;">
                    <div style="color: #aaa; font-size: 11px; margin-bottom: 3px;">⚡ MS</div>
                    <input type="number" id="target-ms" value="000" min="0" max="999" 
                           style="width:100%; padding:8px; background:#333; color:#00ff00; border:1px solid #00ff00; border-radius:4px; font-family: monospace; font-weight: bold;">
                </div>
            </div>
            <div style="color: #ffd700; font-size: 11px; text-align: center; padding: 5px; background: #333; border-radius: 4px;">
                🎯 Target: <span id="target-display">259ms (between 258 and 260)</span>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button id="calibrate-btn" style="flex:1; background:#2196F3; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold;">
                🔧 CALIBRATE
            </button>
            <button id="arm-btn" style="flex:2; background:#f44336; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:16px;">
                🎯 ARM SNIPER
            </button>
        </div>

        <div id="calibration-result" style="background: #222; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 11px; color: #aaa; text-align: center;">
            ⚡ Not calibrated
        </div>

        <div id="status" style="background: #111; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
            <div style="color: #aaa; font-size: 11px; margin-bottom: 5px;">STATUS</div>
            <div style="color: #00ff00; font-size: 13px; font-family: monospace;">✓ Ready</div>
        </div>

        <div id="countdown" style="background: #000; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 10px;">
            <div style="color: #666; font-size: 11px; margin-bottom: 5px;">COUNTDOWN</div>
            <div style="color: #00ff00; font-size: 36px; font-family: monospace; font-weight: bold;">
                00:00.000
            </div>
        </div>

        <div style="display: flex; gap: 10px;">
            <button id="test-btn" style="flex:1; background:#FF9800; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">
                🔧 TEST
            </button>
            <button id="close-btn" style="flex:1; background:#666; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">
                ✖ CLOSE
            </button>
        </div>
    `;

    document.body.appendChild(panel);

    // State
    let snipeTime = null;
    let countdownInterval = null;
    let attackType = 'support';
    let calibrated = false;
    let avgLatency = 15;

    // Attack type toggle
    document.querySelectorAll('input[name="attackType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            attackType = e.target.value;
            document.getElementById('support-label').style.background = attackType === 'support' ? '#4CAF50' : '#333';
            document.getElementById('noble-label').style.background = attackType === 'noble' ? '#4CAF50' : '#333';
        });
    });

    // Calibration
    document.getElementById('calibrate-btn').addEventListener('click', () => {
        const statusDiv = document.getElementById('status').querySelector('div:last-child');
        statusDiv.innerHTML = '🔧 Calibrating...';
        statusDiv.style.color = '#FFA500';

        let samples = [];
        let count = 0;

        function takeSample() {
            const start = performance.now();
            for (let i = 0; i < 100000; i++) { Math.random(); }
            const end = performance.now();
            samples.push(end - start);
            count++;

            statusDiv.innerHTML = `🔧 Sample ${count}/15`;

            if (count < 15) {
                setTimeout(takeSample, 50);
            } else {
                avgLatency = samples.reduce((a, b) => a + b, 0) / samples.length;
                calibrated = true;
                document.getElementById('calibration-result').innerHTML =
                    `✅ System latency: ${avgLatency.toFixed(2)}ms | Compensation: ${(avgLatency * 0.7).toFixed(2)}ms`;
                statusDiv.innerHTML = '✓ Ready';
                statusDiv.style.color = '#00ff00';
            }
        }

        takeSample();
    });

    // Arm sniper
    document.getElementById('arm-btn').addEventListener('click', () => {
        const timeStr = document.getElementById('target-time').value;
        const targetMs = parseInt(document.getElementById('target-ms').value);

        if (!timeStr || isNaN(targetMs)) {
            alert('❌ Enter valid time and milliseconds');
            return;
        }

        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        const now = new Date();

        // Apply compensation
        let compensation = calibrated ? avgLatency * 0.7 : 15;

        snipeTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes,
            seconds,
            Math.max(0, targetMs - compensation)
        );

        if (snipeTime < now) {
            snipeTime.setDate(snipeTime.getDate() + 1);
        }

        document.getElementById('status').querySelector('div:last-child').innerHTML =
            `🎯 ARMED for ${timeStr}.${targetMs} (${compensation.toFixed(1)}ms comp)`;
        document.getElementById('status').querySelector('div:last-child').style.color = '#ff4444';

        if (countdownInterval) clearInterval(countdownInterval);

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
            document.getElementById('countdown').querySelector('div:last-child').textContent =
                `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
        }, 1); // Check every 1ms for precision
    });

    // Execute snipe
    function executeSnipe() {
        const executionTime = new Date();
        const actualMs = executionTime.getMilliseconds();
        const targetMs = parseInt(document.getElementById('target-ms').value);
        const deviation = actualMs - targetMs;

        document.getElementById('countdown').querySelector('div:last-child').innerHTML = '💥 FIRED!';

        // Find and click button
        let button = null;
        if (attackType === 'support') {
            button = document.querySelector(
                'input#troop_confirm_submit, ' +
                'input[value="Αποστολή αμυνών"], ' +
                '.btn-support'
            );
        } else {
            button = document.querySelector(
                'input[value="Επίθεση"], ' +
                'input[value*="Αριστοκράτης"], ' +
                'input[value*="επίθεση"]'
            );
        }

        if (button) {
            button.click();
            button.style.border = attackType === 'support' ? '3px solid lime' : '3px solid gold';
            button.style.boxShadow = attackType === 'support' ? '0 0 20px lime' : '0 0 20px gold';

            setTimeout(() => {
                button.style.border = '';
                button.style.boxShadow = '';
            }, 1000);

            alert(`${attackType === 'support' ? '🛡️' : '👑'} SNIPE SUCCESS!\n` +
                `Target: ${targetMs}ms | Actual: ${actualMs}ms | Diff: ${deviation}ms`);
        } else {
            alert(`❌ ${attackType === 'support' ? 'Support' : 'Noble'} button not found!\nMake sure you're on the attack page.`);
        }

        document.getElementById('status').querySelector('div:last-child').innerHTML =
            `💥 Fired! Diff: ${deviation > 0 ? '+' : ''}${deviation}ms`;
    }

    // Test button
    document.getElementById('test-btn').addEventListener('click', () => {
        const targetMs = parseInt(document.getElementById('target-ms').value);
        alert(`🧪 Test mode: Will attempt to hit ${targetMs}ms\nUse this to check accuracy before real snipes.`);
    });

    // Close button
    document.getElementById('close-btn').addEventListener('click', () => {
        if (countdownInterval) clearInterval(countdownInterval);
        panel.remove();
        window.ultraSniperActive = false;
    });

    // Make draggable
    let isDragging = false;
    let offsetX, offsetY;

    panel.querySelector('h3').addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        panel.style.cursor = 'grabbing';
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
        panel.style.cursor = 'default';
    });

    console.log('✅ UltraSniper v3.2 ready! Target 259ms between 258 and 260');
})();