// UltraSniper.js - Fyletikes Maxes Ultra-Precision Sniper
// Version: 4.0 (Hybrid Timing Engine)
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

    console.log('🎯 UltraSniper v4.0 (Hybrid Engine) loading...');

    // ==================== ADVANCED TIMING ENGINE ====================
    class TimingEngine {
        constructor() {
            this.strategies = {
                hybrid: '🔄 Hybrid (Recommended)',
                spinlock: '💫 Spin Lock (Most Precise)',
                raf: '🎯 requestAnimationFrame',
                worker: '⚡ Web Worker'
            };
            this.currentStrategy = 'hybrid';
            this.latencySamples = [];
            this.avgLatency = 15;
            this.p10 = 0;
            this.p50 = 0;
            this.p90 = 0;
            this.calibrated = false;
        }

        // Deep calibration with statistical analysis
        deepCalibrate(progressCallback) {
            this.latencySamples = [];
            let samples = 0;
            const totalSamples = 50;

            return new Promise((resolve) => {
                const takeSample = () => {
                    const start = performance.now();

                    // Different workloads to measure variance
                    for (let workload of [1000, 10000, 50000]) {
                        for (let i = 0; i < workload; i++) {
                            Math.sin(i) * Math.cos(i);
                        }
                    }

                    const end = performance.now();
                    this.latencySamples.push(end - start);
                    samples++;

                    if (progressCallback) {
                        progressCallback(Math.floor((samples / totalSamples) * 100));
                    }

                    if (samples < totalSamples) {
                        setTimeout(takeSample, 50);
                    } else {
                        // Statistical analysis
                        this.avgLatency = this.latencySamples.reduce((a, b) => a + b, 0) / this.latencySamples.length;

                        // Percentile calculations
                        const sorted = [...this.latencySamples].sort((a, b) => a - b);
                        this.p10 = sorted[Math.floor(sorted.length * 0.1)];
                        this.p50 = sorted[Math.floor(sorted.length * 0.5)];
                        this.p90 = sorted[Math.floor(sorted.length * 0.9)];

                        this.calibrated = true;
                        resolve({
                            avg: this.avgLatency,
                            p10: this.p10,
                            p50: this.p50,
                            p90: this.p90
                        });
                    }
                };

                takeSample();
            });
        }

        // Quick calibration
        quickCalibrate(progressCallback) {
            this.latencySamples = [];
            let samples = 0;
            const totalSamples = 20;

            return new Promise((resolve) => {
                const takeSample = () => {
                    const start = performance.now();
                    for (let i = 0; i < 50000; i++) {
                        Math.sqrt(i);
                    }
                    const end = performance.now();

                    this.latencySamples.push(end - start);
                    samples++;

                    if (progressCallback) {
                        progressCallback(Math.floor((samples / totalSamples) * 100));
                    }

                    if (samples < totalSamples) {
                        setTimeout(takeSample, 30);
                    } else {
                        this.avgLatency = this.latencySamples.reduce((a, b) => a + b, 0) / this.latencySamples.length;
                        this.calibrated = true;
                        resolve({ avg: this.avgLatency });
                    }
                };

                takeSample();
            });
        }

        // Hybrid timing execution
        async executeAt(targetTime, strategy = 'hybrid') {
            const targetTimestamp = targetTime.getTime();

            return new Promise((resolve) => {
                switch(strategy) {
                    case 'spinlock':
                        this.spinLockExecution(targetTimestamp, resolve);
                        break;
                    case 'raf':
                        this.rafExecution(targetTimestamp, resolve);
                        break;
                    case 'worker':
                        this.workerExecution(targetTimestamp, resolve);
                        break;
                    case 'hybrid':
                    default:
                        this.hybridExecution(targetTimestamp, resolve);
                        break;
                }
            });
        }

        // Hybrid: setTimeout + spinlock for best balance
        hybridExecution(targetTimestamp, resolve) {
            const timeToTarget = targetTimestamp - Date.now();

            if (timeToTarget > 50) {
                // Use setTimeout for coarse waiting
                setTimeout(() => {
                    this.hybridExecution(targetTimestamp, resolve);
                }, Math.max(0, timeToTarget - 50));
                return;
            }

            // Spin lock for final 50ms for precision
            while (Date.now() < targetTimestamp) {
                // Busy wait
            }

            resolve();
        }

        // Spin lock: Most precise but CPU intensive
        spinLockExecution(targetTimestamp, resolve) {
            const spinStart = targetTimestamp - 5;

            while (Date.now() < spinStart) {
                // Small delay to save CPU
                setTimeout(() => {}, 0);
            }

            while (Date.now() < targetTimestamp) {
                // Pure spin for final precision
            }

            resolve();
        }

        // requestAnimationFrame: Browser optimized
        rafExecution(targetTimestamp, resolve) {
            const checkTime = () => {
                if (Date.now() >= targetTimestamp - 2) {
                    resolve();
                } else {
                    requestAnimationFrame(checkTime);
                }
            };
            requestAnimationFrame(checkTime);
        }

        // Web Worker: Separate thread timing
        workerExecution(targetTimestamp, resolve) {
            const workerCode = `
                self.onmessage = function(e) {
                    const targetTime = e.data;
                    while(Date.now() < targetTime) {}
                    self.postMessage('fire');
                }
            `;

            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));

            worker.onmessage = () => {
                worker.terminate();
                resolve();
            };

            worker.postMessage(targetTimestamp);
        }

        // Calculate optimal compensation based on calibration
        getCompensation() {
            if (!this.calibrated) return 15;

            // Use P50 (median) as base, adjust by strategy
            switch(this.currentStrategy) {
                case 'spinlock':
                    return this.p50 * 0.5; // Less compensation needed
                case 'hybrid':
                    return this.p50 * 0.7; // Medium compensation
                case 'raf':
                case 'worker':
                default:
                    return this.p50 * 0.9; // More compensation needed
            }
        }
    }

    // ==================== UI AND MAIN APPLICATION ====================

    // Initialize timing engine
    const engine = new TimingEngine();

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
        width: 380px;
        box-shadow: 0 0 30px rgba(0,255,0,0.3);
        backdrop-filter: blur(5px);
    `;

    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
            <h3 style="margin:0; color: #00ff00; font-size: 18px;">
                ⚡ UltraSniper v4.0
            </h3>
            <span style="color: #666; font-size: 11px;">Hybrid Engine</span>
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

        <div style="margin-bottom: 15px;">
            <div style="color: #aaa; margin-bottom: 5px; font-size: 12px;">⚙️ TIMING STRATEGY:</div>
            <select id="strategy-select" style="width:100%; padding:10px; background:#333; color:white; border:1px solid #00ff00; border-radius:6px;">
                <option value="hybrid" selected>🔄 Hybrid (Balanced - Recommended)</option>
                <option value="spinlock">💫 Spin Lock (Most Precise - High CPU)</option>
                <option value="raf">🎯 requestAnimationFrame (Low CPU)</option>
                <option value="worker">⚡ Web Worker (Background)</option>
            </select>
        </div>

        <div style="background: #222; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <div style="flex:2;">
                    <div style="color: #aaa; font-size: 11px; margin-bottom: 3px;">⏰ TIME (HH:MM:SS)</div>
                    <input type="text" id="target-time" placeholder="00:00:00" value=""
                           style="width:100%; padding:8px; background:#333; color:#fff; border:1px solid #00ff00; border-radius:4px; font-family: monospace;">
                </div>
                <div style="flex:1;">
                    <div style="color: #aaa; font-size: 11px; margin-bottom: 3px;">⚡ MS</div>
                    <input type="number" id="target-ms" value="" placeholder="0" min="0" max="999" 
                           style="width:100%; padding:8px; background:#333; color:#00ff00; border:1px solid #00ff00; border-radius:4px; font-family: monospace; font-weight: bold;">
                </div>
            </div>
            <div style="color: #ffd700; font-size: 11px; text-align: center; padding: 5px; background: #333; border-radius: 4px;">
                ⚡ Enter your target time and milliseconds
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button id="quick-cal-btn" style="flex:1; background:#2196F3; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold;">
                ⚡ QUICK CAL
            </button>
            <button id="deep-cal-btn" style="flex:1; background:#9C27B0; color:white; border:none; padding:12px; border-radius:6px; cursor:pointer; font-weight:bold;">
                🔬 DEEP CAL (30s)
            </button>
        </div>

        <div id="calibration-stats" style="background: #222; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 12px; line-height: 1.6;">
            <div style="color: #aaa; margin-bottom: 5px;">📊 CALIBRATION STATS:</div>
            <div style="color: #ffd700;">Not calibrated yet</div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button id="arm-btn" style="flex:2; background:#f44336; color:white; border:none; padding:15px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:18px;">
                🎯 ARM SNIPER
            </button>
            <button id="test-btn" style="flex:1; background:#FF9800; color:white; border:none; padding:15px; border-radius:6px; cursor:pointer; font-weight:bold;">
                🔧 TEST
            </button>
        </div>

        <div id="status" style="background: #111; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
            <div style="color: #aaa; font-size: 11px;">STATUS</div>
            <div style="color: #00ff00; font-size: 13px; font-family: monospace;">✓ Ready</div>
        </div>

        <div id="countdown-container" style="background: #000; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 10px;">
            <div style="color: #666; font-size: 11px;">COUNTDOWN</div>
            <div id="countdown" style="color: #00ff00; font-size: 42px; font-family: monospace; font-weight: bold;">
                00:00.000
            </div>
        </div>

        <div id="accuracy-history" style="background: #111; padding: 10px; border-radius: 6px; margin-bottom: 10px; max-height: 60px; overflow-y: auto; font-size: 11px;">
            <div style="color: #aaa;">📊 ACCURACY HISTORY:</div>
            <div id="history-list" style="color: #ffd700;"></div>
        </div>

        <div style="display: flex; gap: 10px;">
            <button id="close-btn" style="flex:1; background:#666; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer;">
                ✖ CLOSE
            </button>
            <button id="reset-btn" style="flex:1; background:#333; color:#aaa; border:none; padding:8px; border-radius:4px; cursor:pointer;">
                ↻ RESET
            </button>
        </div>

        <div style="margin-top: 10px; font-size: 10px; color: #444; text-align: center;">
            ⚡ Enter your own time and MS values | Drag title to move
        </div>
    `;

    document.body.appendChild(panel);

    // ==================== APPLICATION STATE ====================
    let snipeTime = null;
    let countdownInterval = null;
    let attackType = 'support';
    let accuracyHistory = [];
    let armed = false;

    // ==================== EVENT HANDLERS ====================

    // Attack type toggle
    document.querySelectorAll('input[name="attackType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            attackType = e.target.value;
            document.getElementById('support-label').style.background = attackType === 'support' ? '#4CAF50' : '#333';
            document.getElementById('noble-label').style.background = attackType === 'noble' ? '#4CAF50' : '#333';
        });
    });

    // Strategy selector
    document.getElementById('strategy-select').addEventListener('change', (e) => {
        engine.currentStrategy = e.target.value;
        updateStatus(`Strategy: ${engine.strategies[engine.currentStrategy]}`);
    });

    // Quick calibration
    document.getElementById('quick-cal-btn').addEventListener('click', async () => {
        const statusDiv = document.getElementById('status').querySelector('div:last-child');
        const calStats = document.getElementById('calibration-stats').querySelector('div:last-child');

        statusDiv.innerHTML = '⚡ Quick calibrating...';
        statusDiv.style.color = '#FFA500';

        await engine.quickCalibrate((progress) => {
            statusDiv.innerHTML = `⚡ Calibrating: ${progress}%`;
        });

        const comp = engine.getCompensation();
        calStats.innerHTML = `⚡ Quick Cal: ${engine.avgLatency.toFixed(2)}ms avg<br>🔄 Compensation: ${comp.toFixed(2)}ms`;

        statusDiv.innerHTML = '✓ Calibrated';
        statusDiv.style.color = '#00ff00';
    });

    // Deep calibration
    document.getElementById('deep-cal-btn').addEventListener('click', async () => {
        const statusDiv = document.getElementById('status').querySelector('div:last-child');
        const calStats = document.getElementById('calibration-stats').querySelector('div:last-child');

        statusDiv.innerHTML = '🔬 Deep calibrating (30s)...';
        statusDiv.style.color = '#FFA500';

        const stats = await engine.deepCalibrate((progress) => {
            statusDiv.innerHTML = `🔬 Deep Cal: ${progress}%`;
        });

        const comp = engine.getCompensation();
        calStats.innerHTML = `📊 STATISTICAL ANALYSIS:<br>` +
            `Avg: ${stats.avg.toFixed(2)}ms | P50: ${stats.p50.toFixed(2)}ms<br>` +
            `P10: ${stats.p10.toFixed(2)}ms | P90: ${stats.p90.toFixed(2)}ms<br>` +
            `🔄 Recommended comp: ${comp.toFixed(2)}ms`;

        statusDiv.innerHTML = '✓ Deep calibrated';
        statusDiv.style.color = '#00ff00';
    });

    // Arm sniper
    document.getElementById('arm-btn').addEventListener('click', () => {
        const timeStr = document.getElementById('target-time').value;
        const targetMs = parseInt(document.getElementById('target-ms').value);

        if (!timeStr || timeStr === '' || isNaN(targetMs) || targetMs === '') {
            alert('❌ Please enter target time and milliseconds!\n\nExample:\nTime: 14:30:15\nMS: 259');
            return;
        }

        // Validate time format
        const timeParts = timeStr.split(':');
        if (timeParts.length !== 3) {
            alert('❌ Invalid time format! Use HH:MM:SS\nExample: 14:30:15');
            return;
        }

        const [hours, minutes, seconds] = timeParts.map(Number);

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
            hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            alert('❌ Invalid time values! Hours: 0-23, Minutes: 0-59, Seconds: 0-59');
            return;
        }

        if (targetMs < 0 || targetMs > 999) {
            alert('❌ Milliseconds must be between 0 and 999');
            return;
        }

        const now = new Date();

        // Get compensation based on calibration and strategy
        const compensation = engine.getCompensation();

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

        armed = true;
        updateStatus(`🎯 ARMED for ${timeStr}.${targetMs} (${compensation.toFixed(1)}ms comp)`, '#ff4444');

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
            document.getElementById('countdown').textContent =
                `${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
        }, 1);
    });

    // Execute snipe with selected strategy
    async function executeSnipe() {
        const executionStart = Date.now();

        // Use timing engine for precision
        await engine.executeAt(snipeTime, engine.currentStrategy);

        const executionTime = new Date();
        const actualMs = executionTime.getMilliseconds();
        const targetMs = parseInt(document.getElementById('target-ms').value);
        const deviation = actualMs - targetMs;

        document.getElementById('countdown').textContent = '💥 FIRED!';

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

        // Record accuracy
        accuracyHistory.push({
            target: targetMs,
            actual: actualMs,
            deviation: deviation,
            strategy: engine.currentStrategy
        });

        // Update history display
        const historyList = document.getElementById('history-list');
        const lastFive = accuracyHistory.slice(-5);
        historyList.innerHTML = lastFive.map(h =>
            `${h.deviation > 0 ? '🔴' : '🟢'} ${Math.abs(h.deviation)}ms (${h.strategy})`
        ).join(' | ');

        if (button) {
            button.click();
            button.style.border = attackType === 'support' ? '3px solid lime' : '3px solid gold';
            button.style.boxShadow = attackType === 'support' ? '0 0 20px lime' : '0 0 20px gold';

            setTimeout(() => {
                button.style.border = '';
                button.style.boxShadow = '';
            }, 1000);

            const message = `${attackType === 'support' ? '🛡️' : '👑'} SNIPE SUCCESS!\n` +
                `Target: ${targetMs}ms | Actual: ${actualMs}ms\n` +
                `Deviation: ${deviation > 0 ? '+' : ''}${deviation}ms\n` +
                `Strategy: ${engine.strategies[engine.currentStrategy]}\n` +
                `${Math.abs(deviation) <= 2 ? '🎯 PERFECT!' : '📊 Try different strategy or recalibrate'}`;

            alert(message);
        } else {
            alert(`❌ ${attackType === 'support' ? 'Support' : 'Noble'} button not found!\nMake sure you're on the attack page.`);
        }

        updateStatus(`💥 Fired! Deviation: ${deviation > 0 ? '+' : ''}${deviation}ms`);
        armed = false;
    }

    // Test button
    document.getElementById('test-btn').addEventListener('click', async () => {
        if (armed) {
            alert('❌ Disarm current snipe first');
            return;
        }

        const targetMs = parseInt(document.getElementById('target-ms').value);
        if (isNaN(targetMs)) {
            alert('❌ Enter milliseconds first');
            return;
        }

        const testTime = new Date(Date.now() + 2000); // 2 seconds from now

        updateStatus('🧪 Testing...', '#FF9800');

        const testStart = Date.now();
        await engine.executeAt(testTime, engine.currentStrategy);
        const actualDeviation = (Date.now() - testTime) + targetMs;

        alert(`🧪 TEST RESULTS:\n` +
            `Target: ${targetMs}ms\n` +
            `Deviation: ${actualDeviation > 0 ? '+' : ''}${actualDeviation.toFixed(2)}ms\n` +
            `Strategy: ${engine.strategies[engine.currentStrategy]}\n\n` +
            `${Math.abs(actualDeviation) <= 5 ? '✅ Good for real snipes!' : '⚠️ Calibrate for better accuracy'}`);

        updateStatus('✓ Ready');
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (countdownInterval) clearInterval(countdownInterval);
        armed = false;
        accuracyHistory = [];
        document.getElementById('history-list').innerHTML = '';
        document.getElementById('countdown').textContent = '00:00.000';
        document.getElementById('calibration-stats').querySelector('div:last-child').innerHTML = 'Not calibrated';
        document.getElementById('target-time').value = '';
        document.getElementById('target-ms').value = '';
        engine.calibrated = false;
        updateStatus('✓ Reset complete');
    });

    // Close button
    document.getElementById('close-btn').addEventListener('click', () => {
        if (countdownInterval) clearInterval(countdownInterval);
        panel.remove();
        window.ultraSniperActive = false;
    });

    // Helper function
    function updateStatus(message, color = '#00ff00') {
        const statusDiv = document.getElementById('status').querySelector('div:last-child');
        statusDiv.innerHTML = message;
        statusDiv.style.color = color;
    }

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

    console.log('✅ UltraSniper v4.0 (Hybrid Engine) ready!');
    console.log('📝 Enter your own target time and milliseconds');
})();