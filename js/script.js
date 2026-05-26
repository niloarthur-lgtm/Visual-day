document.addEventListener("DOMContentLoaded", () => {

    const iconPaths = {
        delete: "img/icons/delete.svg", 
        settings: "img/icons/settings.svg",
        close: "img/icons/close.svg",
        darkMode: "img/icons/dark_mode.svg",
        lightMode: "img/icons/light_mode.svg",
        edit: "img/icons/edit.svg",
        add: "img/icons/add.svg",
        home: "img/icons/home.svg",
        checkBox: "img/icons/check_box.svg"
    };

    const translations = {
        pt: {
            appTitle: "Dia Visual", editTitle: "Editar Atividades", settingsTitle: "Configurações",
            appearance: "Aparência", languageSection: "Idioma / Language", darkMode: "Modo Escuro",
            lightMode: "Modo Claro", addTask: "+ Adicionar Classe", total: "Total",
            automatic: "Automático", errorOver: "Passou de 24h", staticTaskName: "Outros",
            sleepTaskName: "Dormir", todoTitle: "To-Dos", navInicio: "Início", navTodos: "To-Dos",
            limitMsg: "Limite de 24h atingido!", defaultClassName: "Nova Classe"
        },
        en: {
            appTitle: "Visual Day", editTitle: "Edit Activities", settingsTitle: "Settings",
            appearance: "Appearance", languageSection: "Language", darkMode: "Dark Mode",
            lightMode: "Light Mode", addTask: "+ Add Class", total: "Total",
            automatic: "Automatic", errorOver: "Over 24h", staticTaskName: "Others",
            sleepTaskName: "Sleep", todoTitle: "To-Dos", navInicio: "Home", navTodos: "To-Dos",
            limitMsg: "24h Limit reached!", defaultClassName: "New Class"
        },
        es: {
            appTitle: "Día Visual", editTitle: "Edit Actividades", settingsTitle: "Configuraciones",
            appearance: "Apariencia", languageSection: "Idioma", darkMode: "Modo Oscuro",
            lightMode: "Modo Claro", addTask: "+ Añadir Clase", total: "Total",
            automatic: "Automático", errorOver: "Pasó de 24h", staticTaskName: "Otros",
            sleepTaskName: "Dormir", todoTitle: "To-Dos", navInicio: "Inicio", navTodos: "To-Dos",
            limitMsg: "¡Límite de 24h alcanzado!", defaultClassName: "Nueva Clase"
        },
        zh: {
            appTitle: "视觉的一天", editTitle: "编辑任务", settingsTitle: "设置",
            appearance: "外貌", languageSection: "语言", darkMode: "深色模式",
            lightMode: "浅色模式", addTask: "+ 添加类别", total: "总计",
            automatic: "自动", errorOver: "超过 24h", staticTaskName: "其他",
            sleepTaskName: "睡眠", todoTitle: "待办", navInicio: "首页", navTodos: "待办",
            limitMsg: "已达到 24 小时限制！", defaultClassName: "新类别"
        },
        ja: {
            appTitle: "ビジュアルデイ", editTitle: "アクティビティ編集", settingsTitle: "設定",
            appearance: "外観", languageSection: "言語", darkMode: "ダークモード",
            lightMode: "ライトモード", addTask: "+ クラスを追加", total: "合計",
            automatic: "自動", errorOver: "24時間を超えています", staticTaskName: "その他",
            sleepTaskName: "睡眠", todoTitle: "To-Do", navInicio: "ホーム", navTodos: "To-Do",
            limitMsg: "24時間制限に達しました！", defaultClassName: "新規クラス"
        },
        ko: {
            appTitle: "비주얼 데이", editTitle: "활동 편집", settingsTitle: "설정",
            appearance: "화면 설정", languageSection: "언어", darkMode: "다크 모드",
            lightMode: "라이트 모드", addTask: "+ 클래스 추가", total: "총합",
            automatic: "자동", errorOver: "24시간 초과", staticTaskName: "기타",
            sleepTaskName: "수면", todoTitle: "할 일", navInicio: "홈", navTodos: "할 일",
            limitMsg: "24시간 제한에 도달했습니다!", defaultClassName: "새 클래스"
        }
    };

    const DEFAULT_CONFIG = [
        { id: 2, color: '#36A2EB', defaultName: 'Trabalho', minutes: 360, isStatic: false },
        { id: 3, color: '#FFCE56', defaultName: 'Estudo', minutes: 120, isStatic: false },
        { id: 4, color: '#4BC0C0', defaultName: 'Lazer', minutes: 180, isStatic: false },
        { id: 5, color: '#9966FF', defaultName: 'Exercícios', minutes: 60, isStatic: false },
        { id: 1, color: '#1a365d', defaultName: 'Dormir', minutes: 480, isStatic: false, isSleep: true },
        { id: 6, color: '#bdc3c7', defaultName: 'Outros', minutes: 240, isStatic: true }
    ];

    let config = JSON.parse(localStorage.getItem('app_tasks_data')) || DEFAULT_CONFIG;
    let todoItems = JSON.parse(localStorage.getItem('app_todo_items')) || [];
    let currentLang = localStorage.getItem('app_lang') || 'pt';
    let isDarkMode = localStorage.getItem('app_theme') === 'dark';
    let activeEditRowId = null; 
    let holdInterval = null;

    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    const appHeader = document.getElementById('appHeader');
    const mainHoursCounter = document.getElementById('mainHoursCounter');
    const mainErrorMsg = document.getElementById('mainErrorMsg');
    const sheetErrorMsg = document.getElementById('sheetErrorMsg');
    
    const modalEdit = document.getElementById('modalEdit');
    const sheetContent = document.getElementById('sheetContent');
    const dragArea = document.getElementById('dragArea');
    const btnOpenEdit = document.getElementById('btnOpenEdit');
    const legendPanel = document.getElementById('legendPanel');
    const inputsPanel = document.getElementById('inputsPanel');

    const modalSettings = document.getElementById('modalSettings');
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnToggleTheme = document.getElementById('btnToggleTheme');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    const appLanguageSelect = document.getElementById('appLanguageSelect');

    const pageInicio = document.getElementById('pageInicio');
    const pageTodos = document.getElementById('pageTodos');
    const navBtnInicio = document.getElementById('navBtnInicio');
    const navBtnTodos = document.getElementById('navBtnTodos');
    const txtTodoTitle = document.getElementById('txtTodoTitle');
    const btnAddTodoItem = document.getElementById('btnAddTodoItem');
    const todoListPanel = document.getElementById('todoListPanel');
    const lblNavInicio = document.getElementById('lblNavInicio');
    const lblNavTodos = document.getElementById('lblNavTodos');

    function saveToLocalStorage() {
        localStorage.setItem('app_tasks_data', JSON.stringify(config));
        localStorage.setItem('app_todo_items', JSON.stringify(todoItems));
        localStorage.setItem('app_lang', currentLang);
        localStorage.setItem('app_theme', isDarkMode ? 'dark' : 'light');
    }

    function formatTime(minutes) {
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h}h ${m.toString().padStart(2, '0')}m`;
    }

    navBtnInicio.addEventListener('click', () => {
        navBtnTodos.classList.remove('active');
        navBtnInicio.classList.add('active');
        pageTodos.classList.remove('active');
        pageInicio.classList.add('active');
        appHeader.style.display = "flex"; 
        animacaoGrafico();
    });

    navBtnTodos.addEventListener('click', () => {
        navBtnInicio.classList.remove('active');
        navBtnTodos.classList.add('active');
        pageInicio.classList.remove('active');
        pageTodos.classList.add('active');
        appHeader.style.display = "none"; 
    });

    btnAddTodoItem.addEventListener('click', () => {
        const newItem = { id: Date.now(), text: "", completed: false, classId: "" };
        todoItems.push(newItem);
        saveToLocalStorage();
        renderizarToDos();
    });

    function renderizarToDos() {
        todoListPanel.innerHTML = '';
        todoItems.forEach(item => {
            const div = document.createElement('div');
            div.className = `todo-item ${item.completed ? 'completed' : ''}`;
            
            let optionsHtml = `<option value="">--</option>`;
            config.forEach(task => {
                if(!task.isStatic && !task.isSleep) {
                    const selected = item.classId == task.id ? 'selected' : '';
                    optionsHtml += `<option value="${task.id}" ${selected}>${task.defaultName}</option>`;
                }
            });

            div.innerHTML = `
                <input type="checkbox" ${item.completed ? 'checked' : ''} id="check-${item.id}">
                <input type="text" value="${item.text}" placeholder="..." id="text-${item.id}">
                <select class="todo-class-select" id="select-${item.id}">${optionsHtml}</select>
                <button class="btn-delete-todo" id="del-${item.id}" type="button">
                    <img src="${iconPaths.delete}" alt="Deletar" class="app-icon icon-delete-fix">
                </button>
            `;
            todoListPanel.appendChild(div);

            document.getElementById(`check-${item.id}`).addEventListener('change', (e) => {
                item.completed = e.target.checked;
                if (item.completed) div.classList.add('completed');
                else div.classList.remove('completed');
                saveToLocalStorage();
            });

            document.getElementById(`text-${item.id}`).addEventListener('input', (e) => {
                item.text = e.target.value;
                saveToLocalStorage();
            });

            document.getElementById(`select-${item.id}`).addEventListener('change', (e) => {
                item.classId = e.target.value;
                saveToLocalStorage();
            });

            document.getElementById(`del-${item.id}`).addEventListener('click', () => {
                todoItems = todoItems.filter(t => t.id !== item.id);
                saveToLocalStorage();
                renderizarToDos();
            });
        });
    }

    function applyLanguage() {
        const t = translations[currentLang];
        document.getElementById('txtAppTitle').textContent = t.appTitle;
        document.getElementById('txtEditTitle').textContent = t.editTitle;
        document.getElementById('txtSettingsTitle').textContent = t.settingsTitle;
        document.getElementById('txtSectionAppearance').textContent = t.appearance;
        document.getElementById('txtSectionLanguage').textContent = t.languageSection;
        document.getElementById('btnAddTaskHours').textContent = t.addTask;
        
        txtTodoTitle.textContent = t.todoTitle;
        lblNavInicio.textContent = t.navInicio;
        lblNavTodos.textContent = t.navTodos;

        const staticTask = config.find(item => item.isStatic);
        if (staticTask) staticTask.defaultName = t.staticTaskName;

        const sleepTask = config.find(item => item.isSleep);
        if (sleepTask) sleepTask.defaultName = t.sleepTaskName;
        
        appLanguageSelect.value = currentLang;

        updateThemeUI();
        renderizarLinhasEditor();
        gerarLegendas();
        renderizarToDos();
        drawChartStatic();
    }

    function updateThemeUI() {
        const t = translations[currentLang];
        if (!themeIcon) return;

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeIcon.src = iconPaths.lightMode;
            themeLabel.textContent = t.lightMode;
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.src = iconPaths.darkMode;
            themeLabel.textContent = t.darkMode;
        }
    }

    btnToggleTheme.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        updateThemeUI();
        saveToLocalStorage();
        drawChartStatic();
    });

    appLanguageSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        saveToLocalStorage();
        applyLanguage();
    });

    function renderizarLinhasEditor() {
        const t = translations[currentLang];
        inputsPanel.innerHTML = '';

        const dinamicos = config.filter(task => !task.isStatic && !task.isSleep);
        const fixos = config.filter(task => task.isStatic || task.isSleep);

        dinamicos.forEach(task => {
            const row = document.createElement('div');
            row.className = 'task-row';
            row.id = `row-${task.id}`;
            row.style.borderLeftColor = task.color;
            
            const pct = (task.minutes / 1440) * 100;
            const isActive = activeEditRowId === task.id;

            row.innerHTML = `
                <div class="main-row-control">
                    <input type="text" id="name-${task.id}" value="${task.defaultName}">
                    <div class="range-container">
                        <input type="range" class="read-only-range" value="${task.minutes}" min="0" max="1440" style="background: linear-gradient(to right, ${task.color} 0%, ${task.color} ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%);">
                        <span class="hour-display" id="display-${task.id}">${formatTime(task.minutes)}</span>
                    </div>
                    <button class="btn-edit-action ${isActive ? 'active-btn' : ''}" data-id="${task.id}" type="button">
                        <img src="${iconPaths.edit}" alt="Editar" class="app-icon src-white">
                    </button>
                </div>
                <div class="sub-edit-panel" style="display: ${isActive ? 'flex' : 'none'};">
                    <button class="btn-delete-task" data-id="${task.id}" title="Excluir" type="button">
                        <img src="${iconPaths.delete}" alt="Excluir" class="app-icon icon-delete-fix">
                    </button>
                    <div class="stepper-controls">
                        <button class="btn-step minus" data-id="${task.id}">-</button>
                        <button class="btn-step plus" data-id="${task.id}">+</button>
                    </div>
                </div>
            `;
            inputsPanel.appendChild(row);
            vincularEventosLinha(task.id);
        });

        if(fixos.length > 0) {
            const subDivFixos = document.createElement('div');
            subDivFixos.className = 'static-panel-footer-inline';

            fixos.forEach(task => {
                const row = document.createElement('div');
                row.className = 'task-row static-row-style';
                row.id = `row-${task.id}`;
                row.style.borderLeftColor = task.color;
                const pct = (task.minutes / 1440) * 100;

                if (task.isStatic) {
                    row.innerHTML = `
                        <div class="main-row-control">
                            <input type="text" id="name-${task.id}" value="${task.defaultName}" style="color: #fff;" readonly>
                            <div class="range-container">
                                <input type="range" class="read-only-range" value="${task.minutes}" min="0" max="1440" style="background: linear-gradient(to right, ${task.color} 0%, ${task.color} ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%);">
                                <span class="hour-display" id="display-${task.id}">${formatTime(task.minutes)}</span>
                            </div>
                            <div style="width:36px; height:36px; flex-shrink:0;"></div>
                        </div>
                    `;
                } else if (task.isSleep) {
                    const isActive = activeEditRowId === task.id;
                    row.innerHTML = `
                        <div class="main-row-control">
                            <input type="text" id="name-${task.id}" value="${task.defaultName}" style="color: #fff;" readonly>
                            <div class="range-container">
                                <input type="range" class="read-only-range" value="${task.minutes}" min="0" max="1440" style="background: linear-gradient(to right, ${task.color} 0%, ${task.color} ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%);">
                                <span class="hour-display" id="display-${task.id}">${formatTime(task.minutes)}</span>
                            </div>
                            <button class="btn-edit-action ${isActive ? 'active-btn' : ''}" data-id="${task.id}" type="button">
                                <img src="${iconPaths.edit}" alt="Editar" class="app-icon src-white">
                            </button>
                        </div>
                        <div class="sub-edit-panel" style="display: ${isActive ? 'flex' : 'none'};">
                            <div style="width:36px; height:36px; flex-shrink:0;"></div>
                            <div class="stepper-controls">
                                <button class="btn-step minus" data-id="${task.id}">-</button>
                                <button class="btn-step plus" data-id="${task.id}">+</button>
                            </div>
                        </div>
                    `;
                }
                subDivFixos.appendChild(row);
            });
            inputsPanel.appendChild(subDivFixos);
            
            fixos.forEach(task => {
                if(!task.isStatic) vincularEventosLinha(task.id);
            });
        }
    }

    function dispararAvisoTemporario() {
        const t = translations[currentLang];
        sheetErrorMsg.textContent = t.limitMsg;
        sheetErrorMsg.classList.add('flash-warn');
        setTimeout(() => {
            sheetErrorMsg.textContent = "";
            sheetErrorMsg.classList.remove('flash-warn');
        }, 3000);
    }

    function alterarMinutosComValidacao(task, quantidade) {
        if (quantidade > 0) {
            let totalSemOutros = 0;
            config.forEach(t => { if (!t.isStatic) totalSemOutros += t.minutes; });
            if (totalSemOutros >= 1440) {
                dispararAvisoTemporario();
                return false;
            }
            task.minutes = Math.min(1440, task.minutes + aggregateCalculatedStep(quantidade));
        } else {
            task.minutes = Math.max(0, task.minutes + quantidade);
        }
        return true;
    }

    function aggregateCalculatedStep(val) {
        return val; 
    }

    function vincularEventosLinha(id) {
        const task = config.find(t => t.id === id);
        if (!task) return;

        const nameInput = document.getElementById(`name-${id}`);
        if (nameInput && !task.isStatic && !task.isSleep) {
            nameInput.addEventListener('input', (e) => {
                task.defaultName = e.target.value;
                saveToLocalStorage();
                gerarLegendas();
                drawChartStatic();
            });
        }

        const editBtn = document.querySelector(`#row-${id} .btn-edit-action`);
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                activeEditRowId = activeEditRowId === id ? null : id;
                renderizarLinhasEditor();
            });
        }

        const btnPlus = document.querySelector(`#row-${id} .btn-step.plus`);
        const btnMinus = document.querySelector(`#row-${id} .btn-step.minus`);

        if (btnPlus && btnMinus) {
            const gerenciarPasso = (quantidade) => {
                const alterou = alterarMinutosComValidacao(task, quantidade);
                if (alterou) {
                    recalcularOutros();
                    saveToLocalStorage();
                    drawChartStatic();
                    gerarLegendas();
                    
                    const display = document.getElementById(`display-${id}`);
                    if (display) display.textContent = formatTime(task.minutes);
                    
                    const range = document.querySelector(`#row-${id} .read-only-range`);
                    if (range) {
                        range.value = task.minutes;
                        const pct = (task.minutes / 1440) * 100;
                        range.style.background = `linear-gradient(to right, ${task.color} 0%, ${task.color} ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`;
                    }
                }
            };

            const configurarHold = (btn, quant) => {
                btn.addEventListener('mousedown', () => {
                    gerenciarPasso(quant);
                    holdInterval = setInterval(() => gerenciarPasso(quant), 120);
                });
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    gerenciarPasso(quant);
                    holdInterval = setInterval(() => gerenciarPasso(quant), 120);
                });
            };

            configurarHold(btnPlus, 5);
            configurarHold(btnMinus, -5);
        }

        const deleteBtn = document.querySelector(`#row-${id} .btn-delete-task`);
        if (deleteBtn && !task.isSleep) {
            deleteBtn.addEventListener('click', () => {
                config = config.filter(t => t.id !== id);
                if(activeEditRowId === id) activeEditRowId = null;
                recalcularOutros();
                saveToLocalStorage();
                renderizarLinhasEditor();
                drawChartStatic();
                gerarLegendas();
            });
        }
    }

    window.addEventListener('mouseup', () => { clearInterval(holdInterval); });
    window.addEventListener('touchend', () => { clearInterval(holdInterval); });

    function recalcularOutros() {
        const outrosTask = config.find(t => t.isStatic);
        if (!outrosTask) return;

        let somaOutros = 0;
        config.forEach(t => { if (!t.isStatic) somaOutros += t.minutes; });

        let sobra = 1440 - somaOutros;
        outrosTask.minutes = sobra > 0 ? sobra : 0;

        const displayOutros = document.getElementById(`display-${outrosTask.id}`);
        if (displayOutros) displayOutros.textContent = formatTime(outrosTask.minutes);
        
        const rangeOutros = document.querySelector(`#row-${outrosTask.id} .read-only-range`);
        if (rangeOutros) {
            rangeOutros.value = outrosTask.minutes;
            const pct = (outrosTask.minutes / 1440) * 100;
            rangeOutros.style.background = `linear-gradient(to right, ${outrosTask.color} 0%, ${outrosTask.color} ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`;
        }
    }

    function gerarLegendas() {
        legendPanel.innerHTML = '';
        config.forEach(task => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <div class="legend-color-dot" style="background-color: ${task.color}"></div>
                <span class="legend-text">${task.defaultName}</span>
                <span class="legend-hours">${formatTime(task.minutes)}</span>
            `;
            legendPanel.appendChild(item);
        });
    }

    document.getElementById('btnAddTaskHours').addEventListener('click', () => {
        let totalSemOutros = 0;
        config.forEach(t => { if (!t.isStatic) totalSemOutros += t.minutes; });
        if (totalSemOutros >= 1440) {
            dispararAvisoTemporario();
            return;
        }

        const t = translations[currentLang];
        const novoId = Date.now();
        const corAleatoria = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        const outrosIndex = config.findIndex(t => t.isStatic);
        const novaTarefa = { id: novoId, color: corAleatoria, defaultName: t.defaultClassName, minutes: 0, isStatic: false };
        
        if (outrosIndex !== -1) config.splice(outrosIndex, 0, novaTarefa);
        else config.push(novaTarefa);

        recalcularOutros();
        saveToLocalStorage();
        renderizarLinhasEditor();
        drawChartStatic();
        gerarLegendas();

        inputsPanel.scrollTo({ top: inputsPanel.scrollHeight, behavior: 'smooth' });
    });

    btnOpenEdit.addEventListener('click', () => {
        modalEdit.classList.add('active');
        document.body.classList.add('modal-open'); // Bloqueia scroll do body
        sheetContent.style.transform = "translateY(0)";
        document.getElementById('mainContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function fecharModalEditor() {
        sheetContent.style.transform = "translateY(100%)";
        document.body.classList.remove('modal-open'); // Devolve o scroll ao body
        setTimeout(() => modalEdit.classList.remove('active'), 250);
    }

    modalEdit.addEventListener('click', (e) => {
        if (e.target === modalEdit) {
            fecharModalEditor();
        }
    });

    btnOpenSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        modalSettings.classList.add('active');
    });

    btnCloseSettings.addEventListener('click', () => {
        modalSettings.classList.remove('active');
    });

    modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) modalSettings.classList.remove('active');
    });

    let startY = 0, currentY = 0, isDragging = false;
    dragArea.addEventListener('mousedown', iniciarArrasto);
    window.addEventListener('mousemove', movendoArrasto, { passive: false });
    window.addEventListener('mouseup', finalizarArrasto);
    dragArea.addEventListener('touchstart', iniciarArrasto, { passive: true });
    window.addEventListener('touchmove', movendoArrasto, { passive: false });
    window.addEventListener('touchend', finalizarArrasto);

    function iniciarArrasto(e) {
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        currentY = startY;
        isDragging = true;
        sheetContent.style.transition = "none";
    }
    
    function movendoArrasto(e) {
        if (!isDragging) return;
        currentY = e.touches ? e.touches[0].clientY : e.clientY;
        let deltaY = currentY - startY;
        if (deltaY > 0) {
            e.preventDefault();
            sheetContent.style.transform = `translateY(${deltaY}px)`;
        } else {
            sheetContent.style.transform = `translateY(0px)`;
        }
    }
    
    function finalizarArrasto() {
        if (!isDragging) return;
        isDragging = false;
        sheetContent.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
        let deltaY = currentY - startY;
        if (deltaY > 100) {
            fecharModalEditor();
        } else {
            sheetContent.style.transform = "translateY(0)";
        }
        startY = 0; currentY = 0;
    }

    function drawChartStatic() { renderGraficoEstrutura(1.0); }

    function renderGraficoEstrutura(progresso) {
        if (!pageInicio.classList.contains('active')) return;

        const t = translations[currentLang];
        const center = canvas.width / 2;
        const radius = center - 10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let totalMinutes = 0;
        config.forEach(item => totalMinutes += item.minutes);
        
        if (mainHoursCounter) mainHoursCounter.textContent = `${t.total}: ${formatTime(totalMinutes)} / 24h`;
        
        if (totalMinutes > 1440.01) {
            if (mainErrorMsg) mainErrorMsg.textContent = t.errorOver;
        } else {
            if (mainErrorMsg) mainErrorMsg.textContent = "";
        }
        
        const baseMinutos = totalMinutes > 1440 ? totalMinutes : 1440;
        let startAngle = -Math.PI / 2; 
        
        config.forEach(task => {
            if (task.minutes === 0) return;
            
            const sliceAngle = ((task.minutes * progresso) / baseMinutos) * (2 * Math.PI);
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = task.color;
            ctx.fill();
            
            startAngle = endAngle;
        });
        
        if (totalMinutes < 1440) {
            const remainingAngle = (((1440 - totalMinutes) + (totalMinutes * (1 - progresso))) / 1440) * (2 * Math.PI);
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, startAngle + remainingAngle);
            ctx.closePath();
            ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#444' : '#eaeded';
            ctx.fill();
        }
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function animacaoGrafico() {
        const duracao = 1000;
        const startTime = performance.now();

        function frame(currentTime) {
            let tempoDecorrido = (currentTime - startTime) / duracao;
            if (tempoDecorrido > 1) tempoDecorrido = 1;
            const progresso = easeOutCubic(tempoDecorrido);
            renderGraficoEstrutura(progresso);
            if (tempoDecorrido < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    applyLanguage();
    animacaoGrafico();
});
