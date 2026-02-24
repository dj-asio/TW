// ==UserScript==
// @name         Precision Timing Toolkit (Single File)
// @namespace    https://github.com/yourname/precision-timer
// @version      1.0
// @description  High precision manual timing assistant (no automation)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    ////////////////////////////////////////////////////////////////
    // CLOCK
    ////////////////////////////////////////////////////////////////

    const now = () => performance.now();

    function average(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    ////////////////////////////////////////////////////////////////
    // PING MODULE
    ////////////////////////////////////////////////////////////////

    async function measurePing(url = location.origin, attempts = 5) {
        const samples = [];

        for (let i = 0; i < attempts; i++) {
            const start = now();
            await fetch(url, { method: "HEAD", cache: "no-store" });
            const end = now();
            samples.push(end - start);
        }

        const avg = average(samples);

        return {
            samples,
            roundTrip: avg,
            oneWay: avg / 2
        };
    }

    ////////////////////////////////////////////////////////////////
    // REACTION MODULE
    ////////////////////////////////////////////////////////////////

    async function runReactionTest(samples = 5) {
        const results = [];

        for (let i = 0; i < samples; i++) {
            status("Wait for signal...");

            const delay = Math.random() * 2000 + 1500;
            const target = now() + delay;

            await new Promise(resolve => {
                setTimeout(() => {
                    status("CLICK!");
                }, delay);

                function handler() {
                    const diff = now() - target;
                    document.removeEventListener("click", handler);
                    results.push(diff);
                    resolve();
                }

                document.addEventListener("click", handler);
            });

            await new Promise(r => setTimeout(r, 800));
        }

        return {
            samples: results,
            average: average(results)
        };
    }

    ////////////////////////////////////////////////////////////////
    // COMPENSATION MODULE
    ////////////////////////////////////////////////////////////////

    function calculateCompensation({
                                       oneWayPing = 0,
                                       reaction = 0,
                                       browserDelay = 5,
                                       serverOffset = 0
                                   }) {
        return oneWayPing + reaction + browserDelay + serverOffset;
    }

    ////////////////////////////////////////////////////////////////
    // COUNTDOWN MODULE
    ////////////////////////////////////////////////////////////////

    function precisionCountdown(durationMs, compensationMs = 0) {
        const startTime = now();
        const target = startTime + durationMs - compensationMs;

        function tick() {
            const diff = target - now();

            if (diff <= 0) {
                status("CLICK NOW");
                return;
            }

            requestAnimationFrame(tick);
        }

        tick();
    }

    ////////////////////////////////////////////////////////////////
    // UI MODULE
    ////////////////////////////////////////////////////////////////

    function createPanel() {
        const panel = document.createElement("div");

        panel.style.position = "fixed";
        panel.style.bottom = "20px";
        panel.style.right = "20px";
        panel.style.background = "rgba(0,0,0,0.92)";
        panel.style.color = "#00ff99";
        panel.style.padding = "15px";
        panel.style.fontSize = "12px";
        panel.style.zIndex = "999999";
        panel.style.borderRadius = "8px";
        panel.style.fontFamily = "monospace";
        panel.style.minWidth = "260px";

        panel.innerHTML = `
            <div><b>Precision Timing Toolkit</b></div>
            <hr/>

            <button id="pt-ping">Measure Ping</button>
            <button id="pt-react">Reaction Test</button>

            <hr/>

            Duration (ms):
            <input id="pt-duration" value="5000" size="6"/><br/>

            One-way Ping:
            <input id="pt-pingval" value="0" size="6"/><br/>

            Reaction:
            <input id="pt-reactval" value="0" size="6"/><br/>

            Browser Delay:
            <input id="pt-browser" value="5" size="6"/><br/>

            <button id="pt-calc">Calculate Compensation</button><br/>
            Compensation:
            <input id="pt-comp" value="0" size="6"/><br/>

            <button id="pt-start">Start Countdown</button>

            <hr/>
            <div id="pt-status">Ready</div>
        `;

        document.body.appendChild(panel);
    }

    ////////////////////////////////////////////////////////////////
    // STATUS HELPER
    ////////////////////////////////////////////////////////////////

    function status(msg) {
        document.getElementById("pt-status").innerText = msg;
    }

    ////////////////////////////////////////////////////////////////
    // INIT
    ////////////////////////////////////////////////////////////////

    function init() {
        createPanel();

        document.getElementById("pt-ping").onclick = async () => {
            status("Measuring ping...");
            const result = await measurePing();
            document.getElementById("pt-pingval").value =
                result.oneWay.toFixed(2);
            status(`One-way ping: ${result.oneWay.toFixed(2)} ms`);
        };

        document.getElementById("pt-react").onclick = async () => {
            const result = await runReactionTest(5);
            document.getElementById("pt-reactval").value =
                result.average.toFixed(2);
            status(`Avg reaction: ${result.average.toFixed(2)} ms`);
        };

        document.getElementById("pt-calc").onclick = () => {
            const comp = calculateCompensation({
                oneWayPing: parseFloat(document.getElementById("pt-pingval").value),
                reaction: parseFloat(document.getElementById("pt-reactval").value),
                browserDelay: parseFloat(document.getElementById("pt-browser").value)
            });

            document.getElementById("pt-comp").value = comp.toFixed(2);
            status(`Compensation: ${comp.toFixed(2)} ms`);
        };

        document.getElementById("pt-start").onclick = () => {
            const duration = parseFloat(document.getElementById("pt-duration").value);
            const comp = parseFloat(document.getElementById("pt-comp").value);

            status("Counting...");
            precisionCountdown(duration, comp);
        };
    }

    init();

})();