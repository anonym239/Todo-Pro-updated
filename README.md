<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Todo Pro</title>
    <link rel="icon" href="unnamed.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#ff00ff">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Todo Pro">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        :root {
            --bg: #050505; --card: #121212; --text: #ffffff;
            --accent-plus: #ff00ff; --accent-check: #00ff88;
            --border: 1px solid #333; --input-bg: #1a1a1a;
        }
        [data-theme="light"] {
            --bg: #ffffff; --card: #ffffff; --text: #000000;
            --accent-plus: #007bff; --accent-check: #28a745;
            --border: 2px solid #000; --input-bg: #f0f0f0;
        }
        body {
            background-color: var(--bg); color: var(--text);
            font-family: 'Inter', sans-serif; margin: 0;
            display: flex; flex-direction: column; align-items: center;
            transition: all 0.3s ease; padding-bottom: 50px; overflow-x: hidden;
        }
        .header { width: 100%; max-width: 450px; display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; box-sizing: border-box; }
        .nav-buttons { display: flex; gap: 8px; }
        .icon-btn { background: var(--card); border: var(--border); color: var(--text); padding: 10px 12px; border-radius: 50px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; }

        /* MODALS */
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); backdrop-filter: blur(15px); z-index: 9999; display: none; align-items: center; justify-content: center; }
        .modal-content { background: #111; border: 2px solid var(--accent-plus); width: 88%; max-width: 380px; padding: 25px; border-radius: 30px; position: relative; color: #fff; max-height: 85vh; overflow-y: auto; }
        .close-btn { position: absolute; top: 10px; right: 20px; cursor: pointer; font-size: 32px; font-weight: 900; color: var(--accent-plus); }
        
        .guide-step { margin-bottom: 12px; display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 15px; background: rgba(255,255,255,0.03); border: 1px solid transparent; }
        .guide-icon { font-size: 24px; min-width: 35px; text-align: center; }
        .guide-text b { color: var(--accent-check); display: block; font-size: 14px; }
        .guide-text p { margin: 0; font-size: 11px; color: #ccc; }

        /* TOGGLE SWITCHES */
        .setting-row { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 5px; }
        .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--accent-plus); }
        input:checked + .slider:before { transform: translateX(22px); }

        /* PUSH STATUS BADGE */
        #pushStatus {
            display: inline-block;
            font-size: 10px;
            padding: 2px 8px;
            border-radius: 20px;
            margin-left: 8px;
            font-weight: bold;
        }
        #pushStatus.active { background: #00ff88; color: #000; }
        #pushStatus.inactive { background: #ff4444; color: #fff; }

        /* MAIN UI */
        .container { width: 95%; max-width: 450px; margin-top: 10px; }
        .input-card { background: var(--card); border: var(--border); border-radius: 15px; padding: 8px; display: flex; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        input#taskInput { flex: 1; background: var(--input-bg); border: none; border-radius: 10px; padding: 12px; color: var(--text); font-size: 16px; outline: none; }
        .add-btn { background: var(--accent-plus); color: white; border: none; border-radius: 10px; padding: 0 20px; font-weight: 900; font-size: 24px; cursor: pointer; }

        .list-container { width: 95%; max-width: 450px; margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .task-item { background: var(--card); border: var(--border); border-radius: 18px; padding: 15px; display: flex; justify-content: space-between; align-items: center; position: relative; }
        .priority-high { border-left: 5px solid #ff4444 !important; order: -1; }
        .task-text { flex: 1; outline: none; font-size: 16px; word-break: break-word; }
        .right-zone { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
        .task-date { font-size: 9px; opacity: 0.4; font-family: monospace; }
        
        input[type="checkbox"] { appearance: none; width: 30px; height: 30px; border: var(--border); border-radius: 8px; background: var(--input-bg); cursor: pointer; }
        input[type="checkbox"]:checked { background: var(--accent-check); border-color: var(--accent-check); }

        .empty-msg { display: none; text-align: center; margin-top: 30px; font-size: 18px; font-weight: 900; color: var(--accent-check); }
        .task-exit { animation: swipe 0.4s forwards; }
        @keyframes swipe { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(120%); opacity: 0; } }

        /* Notification Test Button */
        .test-push-btn {
            background: var(--accent-plus);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 10px 16px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 15px;
            width: 100%;
        }
        .test-push-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    </style>
</head>
<body data-theme="dark">

    <div id="guideModal" class="modal">
        <div class="modal-content">
            <span class="close-btn" onclick="closeModal('guideModal')">&times;</span>
            <h2 style="color: var(--accent-plus); text-align: center;">ANLEITUNG</h2>
            <div class="guide-step">
               <div class="guide-icon">🚨</div>
                <div class="guide-text"><b>Wichtige Todos</b><p>Ein <b>!</b> am Textanfang pinnt die Aufgabe ganz nach oben.</p></div>
            </div>
            <div class="guide-step">
                <div class="guide-icon">✏️</div>
                <div class="guide-text"><b>Text ändern</b><p>Klicke direkt in den Text einer Aufgabe, um ihn zu korrigieren.</p></div>
            </div>
            <div class="guide-step">
                <div class="guide-icon">🌓</div>
                <div class="guide-text"><b>Tag & Nacht</b><p>Der Button oben rechts wechselt zwischen hellem und dunklem Design.</p></div>
            </div>
            <div class="guide-step">
                <div class="guide-icon">💾</div>
                <div class="guide-text"><b>Autosave</b><p>Deine Liste wird automatisch im Browser deines Geräts gespeichert.</p></div>
            </div>
            <div class="guide-step">
                <div class="guide-icon">✅</div>
                <div class="guide-text"><b>Abschließen</b><p>Klicke die Checkbox, um eine Aufgabe zu löschen und Konfetti zu sehen.</p></div>
            </div>
            <div class="guide-step">
                <div class="guide-icon">🏆</div>
                <div class="guide-text"><b>Full Clear</b><p>Erledige alles für Schmeicheleien und Regenbogen-Regen.</p></div>
            </div>
            <div class="guide-step">
                <div class="guide-icon">🔔</div>
                <div class="guide-text"><b>Benachrichtigungen</b><p>Aktiviere Push unten — funktioniert auch bei YouTube & geschlossener App!</p></div>
            </div>
            
            <div style="border-top:1px dotted #444; margin:15px 0; padding-top:10px;"></div>
            
            <div class="setting-row">
                <span style="font-size:14px">Schmeicheleien</span>
                <label class="switch"><input type="checkbox" id="compTog" checked onchange="saveSets()"><span class="slider"></span></label>
            </div>
            <div class="setting-row">
                <span style="font-size:14px">Konfetti</span>
                <label class="switch"><input type="checkbox" id="confTog" checked onchange="saveSets()"><span class="slider"></span></label>
            </div>
            <div class="setting-row">
                <span style="font-size:14px">🔔 Push-Benachrichtigungen <span id="pushStatus" class="inactive">AUS</span></span>
                <label class="switch"><input type="checkbox" id="pushTog" onchange="togglePush()"><span class="slider"></span></label>
            </div>

            <button class="test-push-btn" id="testPushBtn" onclick="sendTestPush()" disabled>
                🔔 Test-Benachrichtigung senden
            </button>
            <p style="font-size:10px; color:#888; text-align:center; margin-top:8px;">
                Sendet eine Benachrichtigung — auch wenn App geschlossen ist.
            </p>
        </div>
    </div>

    <div class="header">
        <h1 style="font-size: 20px; font-weight: 900; letter-spacing: -1px;">TODO PRO</h1>
        <div class="nav-buttons">
            <button class="icon-btn" onclick="openModal('guideModal')">📖</button>
            <button class="icon-btn" onclick="toggleTheme()">🌓</button>
        </div>
    </div>

    <div class="container">
        <div class="input-card">
            <input type="text" id="taskInput" placeholder="Was steht an?" autocomplete="off">
            <button class="add-btn" onclick="addTask()">+</button>
        </div>
    </div>

    <div id="emptyMsg" class="empty-msg"></div>
    <div class="list-container" id="taskList"></div>

    <script>
        const compliments = [ 
            "Uh, schon fertig? Du bist ja wahnsinnig schnell!",
            "Die Aufgaben waren ja easy für meinen König! 👑",
            "Respekt, Boss! Alles erledigt.",
            "Eindrucksvoll! Deine Disziplin ist heute unschlagbar.",
            "Königliche Leistung! Dein Reich ist stolz auf dich. 🏰"
        ];

        let hasHadTasks = false;

        function init() {
            loadTasks();
            loadSets();
            if(!localStorage.getItem('guide_v9_done')) openModal('guideModal');
        }

        function addTask() {
            const input = document.getElementById('taskInput');
            const text = input.value.trim();
            if (!text) return;
            createTask(text);
            input.value = '';
            hasHadTasks = true;
            saveTasks();
        }

        function createTask(txt, date, isHigh) {
            const list = document.getElementById('taskList');
            const item = document.createElement('div');
            item.className = 'task-item' + (isHigh || txt.startsWith('!') ? ' priority-high' : '');
            const displayTxt = txt.startsWith('!') ? txt.slice(1).trim() : txt;
            const now = date || new Date().toLocaleString('de-DE', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
            item.innerHTML = `
                <div class="right-zone">
                    <input type="checkbox" onchange="completeTask(this)">
                    <span class="task-date">${now}</span>
                </div>
                <span class="task-text" contenteditable="true" onblur="saveTasks()">${displayTxt}</span>
            `;
            list.prepend(item);
            updateEmptyMsg();
        }

        function completeTask(cb) {
            const item = cb.closest('.task-item');
            item.classList.add('task-exit');
            setTimeout(() => {
                item.remove();
                saveTasks();
                updateEmptyMsg();
                const remaining = document.querySelectorAll('.task-item').length;
                if (remaining === 0 && hasHadTasks) {
                    const sets = JSON.parse(localStorage.getItem('king_v9_sets') || '{"c":true,"f":true}');
                    if (sets.f) massiveConfetti();
                    if (sets.c) {
                        const m = document.getElementById('emptyMsg');
                        m.innerText = compliments[Math.floor(Math.random() * compliments.length)];
                        m.style.display = 'block';
                    }
                }
            }, 400);
        }

        function updateEmptyMsg() {
            const items = document.querySelectorAll('.task-item');
            const m = document.getElementById('emptyMsg');
            if (items.length === 0 && !hasHadTasks) {
                m.innerText = '🎯 Keine Aufgaben – genieße den Moment!';
                m.style.display = 'block';
            } else if (items.length > 0) {
                m.style.display = 'none';
            }
        }

        function massiveConfetti() {
            const duration = 3 * 1000;
            const end = Date.now() + duration;
            (function frame() {
                confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#ff00ff', '#00ff88', '#ffcc00'] });
                confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#ff00ff', '#00ff88', '#ffcc00'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        }

        function toggleTheme() {
            document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('king_v9_theme', document.body.dataset.theme);
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { 
            document.getElementById(id).style.display = 'none'; 
            if(id === 'guideModal') localStorage.setItem('guide_v9_done', 'true');
        }

        function saveTasks() {
            const t = Array.from(document.querySelectorAll('.task-item')).map(i => ({
                txt: i.querySelector('.task-text').innerText,
                date: i.querySelector('.task-date').innerText,
                high: i.classList.contains('priority-high')
            }));
            localStorage.setItem('king_v9_tasks', JSON.stringify(t));
        }

        function loadTasks() {
            const saved = JSON.parse(localStorage.getItem('king_v9_tasks') || '[]');
            if(saved.length > 0) hasHadTasks = true;
            saved.reverse().forEach(t => createTask(t.txt, t.date, t.high));
        }

        function saveSets() {
            localStorage.setItem('king_v9_sets', JSON.stringify({
                c: document.getElementById('compTog').checked,
                f: document.getElementById('confTog').checked
            }));
        }

        function loadSets() {
            const s = JSON.parse(localStorage.getItem('king_v9_sets') || '{"c":true,"f":true}');
            document.getElementById('compTog').checked = s.c;
            document.getElementById('confTog').checked = s.f;
            if(localStorage.getItem('king_v9_theme')) document.body.dataset.theme = localStorage.getItem('king_v9_theme');
        }

        init();
        document.getElementById('taskInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') addTask(); });
    </script>

    <!-- ============================================================ -->
    <!-- PUSH NOTIFICATION LOGIC                                       -->
    <!-- Hintergrundbenachrichtigungen — auch bei YouTube & geschl. App -->
    <!-- ============================================================ -->
    <script>
        // WICHTIG: Dein VAPID Public Key
        const publicVapidKey = 'BDdauilZe3q3Ax6dmKmhIIesR-v6v_aYr4zcAeLs41C2tATRWDGiKMSZ20Tu8WyCY-vX7KoxM9Qy_zH-9tw4j2o';

        // Service Worker registrieren
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(reg => {
                    console.log('✅ Service Worker aktiv:', reg.scope);
                    checkSubscription();
                })
                .catch(err => console.error('❌ SW Fehler:', err));
        }

        async function checkSubscription() {
            try {
                const reg = await navigator.serviceWorker.ready;
                const subscription = await reg.pushManager.getSubscription();
                const toggle = document.getElementById('pushTog');
                const status = document.getElementById('pushStatus');
                const testBtn = document.getElementById('testPushBtn');

                if (subscription) {
                    toggle.checked = true;
                    status.textContent = 'AN';
                    status.className = 'active';
                    testBtn.disabled = false;
                } else {
                    toggle.checked = false;
                    status.textContent = 'AUS';
                    status.className = 'inactive';
                    testBtn.disabled = true;
                }
            } catch (e) {
                console.warn('checkSubscription Fehler:', e);
            }
        }

        async function togglePush() {
            const toggle = document.getElementById('pushTog');
            if (toggle.checked) {
                await subscribeUser();
            } else {
                await unsubscribeUser();
            }
        }

        async function subscribeUser() {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                alert('Dein Browser unterstützt keine Push-Benachrichtigungen.');
                document.getElementById('pushTog').checked = false;
                return;
            }

            // Berechtigung anfragen
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Benachrichtigungen wurden abgelehnt. Bitte in den App-Einstellungen aktivieren.');
                document.getElementById('pushTog').checked = false;
                return;
            }

            try {
                const reg = await navigator.serviceWorker.ready;
                const subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });

                // Abo ans Backend senden
                const res = await fetch('/.netlify/functions/save-subscription', {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (res.ok) {
                    document.getElementById('pushStatus').textContent = 'AN';
                    document.getElementById('pushStatus').className = 'active';
                    document.getElementById('testPushBtn').disabled = false;
                    console.log('✅ Push-Abo gespeichert!');
                } else {
                    throw new Error('Server Fehler: ' + res.status);
                }
            } catch (error) {
                console.error('❌ Abo fehlgeschlagen:', error);
                document.getElementById('pushTog').checked = false;
                document.getElementById('pushStatus').textContent = 'AUS';
                document.getElementById('pushStatus').className = 'inactive';
                alert('Fehler beim Aktivieren: ' + error.message);
            }
        }

        async function unsubscribeUser() {
            try {
                const reg = await navigator.serviceWorker.ready;
                const subscription = await reg.pushManager.getSubscription();
                if (subscription) {
                    await fetch('/.netlify/functions/save-subscription', {
                        method: 'DELETE',
                        body: JSON.stringify({ endpoint: subscription.endpoint }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    await subscription.unsubscribe();
                }
                document.getElementById('pushStatus').textContent = 'AUS';
                document.getElementById('pushStatus').className = 'inactive';
                document.getElementById('testPushBtn').disabled = true;
            } catch (e) {
                console.warn('Unsubscribe Fehler:', e);
            }
        }

        // Test-Push senden
        async function sendTestPush() {
            const btn = document.getElementById('testPushBtn');
            btn.disabled = true;
            btn.textContent = '⏳ Sende...';
            try {
                const res = await fetch('/.netlify/functions/send-push?title=Todo+Pro&message=Hallo!+Push+funktioniert+%F0%9F%8E%89');
                if (res.ok) {
                    btn.textContent = '✅ Gesendet!';
                } else {
                    btn.textContent = '❌ Fehler';
                }
            } catch (e) {
                btn.textContent = '❌ Fehler';
            }
            setTimeout(() => {
                btn.textContent = '🔔 Test-Benachrichtigung senden';
                btn.disabled = false;
            }, 3000);
        }

        // VAPID Key Konvertierung
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
            return outputArray;
        }
    </script>
</body>
</html>
