document.addEventListener("DOMContentLoaded", () => {

    // MAPA LOCAL DE ÍCONES (Pasta img/icons/)
    const iconPaths = {
        delete: "./img/icons/delete.svg", 
        settings: "./img/icons/settings.svg",
        close: "./img/icons/close.svg",
        darkMode: "./img/icons/dark_mode.svg",
        lightMode: "./img/icons/light_mode.svg",
        edit: "./img/icons/edit.svg",
        add: "./img/icons/add.svg",
        home: "./img/icons/home.svg",
        checkBox: "./img/icons/check_box.svg"
    };

    // DICIONÁRIO DE TRADUÇÃO
    const translations = {
        pt: {
            appTitle: "Dia Visual", editTitle: "Editar Atividades", settingsTitle: "Configurações",
            appearance: "Aparência", languageSection: "Idioma / Language", darkMode: "Modo Escuro",
            lightMode: "Modo Claro", addTask: "+ Adicionar Tarefa", total: "Total",
            automatic: "Automático", errorOver: "Passou de 24h", staticTaskName: "Outros",
            sleepTaskName: "Dormir", todoTitle: "Tarefas", navInicio: "Início", navTodos: "To-Dos"
        },
        en: {
            appTitle: "Visual Day", editTitle: "Edit Activities", settingsTitle: "Settings",
            appearance: "Appearance", languageSection: "Language / Language", darkMode: "Dark Mode",
            lightMode: "Light Mode", addTask: "+ Add Task", total: "Total",
            automatic: "Automatic", errorOver: "Over 24h", staticTaskName: "Others",
            sleepTaskName: "Sleep", todoTitle: "Tasks", navInicio: "Home", navTodos: "To-Dos"
        },
        es: {
            appTitle: "Día Visual", editTitle: "Editar Actividades", settingsTitle: "Configuraciones",
            appearance: "Apariencia", languageSection: "Idioma / Language", darkMode: "Modo Oscuro",
            lightMode: "Modo Claro", addTask: "+ Añadir Tarea", total: "Total",
            automatic: "Automático", errorOver: "Pasó de 24h", staticTaskName: "Otros",
            sleepTaskName: "Dormir", todoTitle: "Tareas", navInicio: "Inicio", navTodos: "To-Dos"
        },
        zh: {
            appTitle: "视觉的一天", editTitle: "编辑任务", settingsTitle: "设置",
            appearance: "外貌", languageSection: "语言 / Language", darkMode: "深色模式",
            lightMode: "浅色模式", addTask: "+ 添加任务", total: "总计",
            automatic: "自动", errorOver: "超过 24h", staticTaskName: "其他",
            sleepTaskName: "睡眠", todoTitle: "任务", navInicio: "首页", navTodos: "待办"
        },
        ja: {
            appTitle: "ビジュアルデイ", editTitle: "アクティビティ編集", settingsTitle: "設定",
            appearance: "外観", languageSection: "言語 / Language", darkMode: "ダークモード",
            lightMode: "ライトモード", addTask: "+ タスクを追加", total: "合計",
            automatic: "自動", errorOver: "24時間を超えています", staticTaskName: "その他",
            sleepTaskName: "睡眠", todoTitle: "タスク", navInicio: "ホーム", navTodos: "To-Do"
        },
        ko: {
            appTitle: "비주얼 데이", editTitle: "활동 편집", settingsTitle: "설정",
            appearance: "화면 설정", languageSection: "언어 / Language", darkMode: "다크 모드",
            lightMode: "라이트 모드", addTask: "+ 작업 추가", total: "총합",
            automatic: "자동", errorOver: "24시간 초과", staticTaskName: "기타",
            sleepTaskName: "수면", todoTitle: "작업", navInicio: "홈", navTodos: "할 일"
        }
    };

    const DEFAULT_CONFIG = [
        { id: 2, color: '#36A2EB', defaultName: 'Trabalho', hours: 6, isStatic: false },
        { id: 3, color: '#FFCE56', defaultName: 'Estudo', hours: 2, isStatic: false },
        { id: 4, color: '#4BC0C0', defaultName: 'Lazer', hours: 3, isStatic: false },
        { id: 5, color: '#9966FF', defaultName: 'Exercícios', hours: 1, isStatic: false },
        { id: 1, color: '#1a365d', defaultName: 'Dormir', hours: 8, isStatic: false, isSleep: true },
        { id: 6, color: '#bdc3c7', defaultName: 'Outros', hours: 4, isStatic: true }
    ];

    if (localStorage.getItem('app_tasks_data')) {
        const checkData = JSON.parse(localStorage.getItem('app_tasks_data'));
        const sleepItem = checkData.find(t => t.isSleep);
        if (!sleepItem || sleepItem.color !== '#1a365d') {
            localStorage.removeItem('app_tasks_data');
        }
    }

    let config = JSON.parse(localStorage.getItem('app_tasks_data')) || DEFAULT_CONFIG;
    let todoItems = JSON.parse(localStorage.getItem('app_todo_items')) || [];
    let currentLang = localStorage.getItem('app_lang') || 'pt';
    let isDarkMode = localStorage.getItem('app_theme') === 'dark';

    // Elementos DOM
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

    // CONTROLE DE NAVEGAÇÃO
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

    // SISTEMA TO-DO LIST
    btnAddTodoItem.addEventListener('click', () => {
        const newItem = { id: Date.now(), text: "", completed: false };
        todoItems.push(newItem);
        saveToLocalStorage();
        renderizarToDos();
    });

    function renderizarToDos() {
        todoListPanel.innerHTML = '';
        todoItems.forEach(item => {
            const div = document.createElement('div');
            div.className = `todo-item ${item.completed ? 'completed' : ''}`;
            div.innerHTML = `
                <input type="checkbox" ${item.completed ? 'checked' : ''} id="check-${item.id}">
                <input type="text" value="${item.text}" placeholder="..." id="text-${item.id}">
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

            document.getElementById(`del-${item.id}`).addEventListener('click', () => {
                todoItems = todoItems.filter(t => t.id !== item.id);
                saveToLocalStorage();
                renderizarToDos();
            });
        });
    }

    // TRADUÇÕES E IDIOMAS
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
            themeIcon.src = iconPaths.lightMode; // Troca a imagem para o Sol
            themeLabel.textContent = t.lightMode;
        } else {
            document.body.classList.remove('dark-mode');
            themeIcon.src = iconPaths.darkMode;  // Troca a imagem para a Lua
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
        config.forEach(task => {
            const row = document.createElement('div');
            row.className = 'task-row';
            row.id = `row-${task.id}`;
            row.style.borderLeftColor = task.color;

            if (task.isStatic) {
                row.innerHTML = `
                    <input type="text" id="name-${task.id}" value="${task.defaultName}" style="color: ${task.color};" readonly>
                    <div class="range-container" style="justify-content: flex-end;">
                        <span style="font-size:0.8rem; opacity:0.5; font-style:italic; margin-right:10px;">${t.automatic}</span>
                        <span class="hour-display" id="display-${task.id}">${task.hours.toFixed(1)}h</span>
                    </div>
                    <div style="width:32px; height:32px;"></div>
                `;
            } else if (task.isSleep) {
                row.innerHTML = `
                    <input type="text" id="name-${task.id}" value="${task.defaultName}" style="color: ${task.color};" readonly>
                    <div class="range-container">
                        <input type="range" id="hours-${task.id}" value="${task.hours}" min="0" max="24" step="0.5">
                        <span class="hour-display" id="display-${task.id}">${task.hours.toFixed(1)}h</span>
                    </div>
                    <div style="width:32px; height:32px;"></div>
                `;
            } else {
                row.innerHTML = `
                    <input type="text" id="name-${task.id}" value="${task.defaultName}" style="color: ${task.color};">
                    <div class="range-container">
                        <input type="range" id="hours-${task.id}" value="${task.hours}" min="0" max="24" step="0.5">
                        <span class="hour-display" id="display-${task.id}">${task.hours.toFixed(1)}h</span>
                    </div>
                    <button class="btn-delete-task" data-id="${task.id}" title="Excluir" type="button">
                        <img src="${iconPaths.delete}" alt="Excluir" class="app-icon icon-delete-fix">
                    </button>
                `;
            }
            inputsPanel.appendChild(row);
            vincularEventosLinha(task.id);
        });
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

        if (!task.isStatic) {
            const rangeInput = document.getElementById(`hours-${id}`);
            const displaySpan = document.getElementById(`display-${id}`);

            if (rangeInput && displaySpan) {
                rangeInput.addEventListener('input', (e) => {
                    task.hours = parseFloat(e.target.value);
                    displaySpan.textContent = `${task.hours.toFixed(1)}h`;
                    recalcularOutros();
                    saveToLocalStorage();
                    drawChartStatic();
                    gerarLegendas();
                });
            }

            const deleteBtn = document.querySelector(`#row-${id} .btn-delete-task`);
            if (deleteBtn && !task.isSleep) {
                deleteBtn.addEventListener('click', () => {
                    config = config.filter(t => t.id !== id);
                    recalcularOutros();
                    saveToLocalStorage();
                    renderizarLinhasEditor();
                    drawChartStatic();
                    gerarLegendas();
                });
            }
        }
    }

    function recalcularOutros() {
        const outrosTask = config.find(t => t.isStatic);
        if (!outrosTask) return;

        let somaOutros = 0;
        config.forEach(t => {
            if (!t.isStatic) somaOutros += t.hours;
        });

        let sobra = 24 - somaOutros;
        outrosTask.hours = sobra > 0 ? sobra : 0;

        const displayOutros = document.getElementById(`display-${outrosTask.id}`);
        if (displayOutros) displayOutros.textContent = `${outrosTask.hours.toFixed(1)}h`;
    }

    function gerarLegendas() {
        legendPanel.innerHTML = '';
        config.forEach(task => {
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <div class="legend-color-dot" style="background-color: ${task.color}"></div>
                <span class="legend-text">${task.defaultName}</span>
                <span class="legend-hours">${task.hours.toFixed(1)}h</span>
            `;
            legendPanel.appendChild(item);
        });
    }

    document.getElementById('btnAddTaskHours').addEventListener('click', () => {
        const novoId = Date.now();
        const corAleatoria = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        
        const outrosIndex = config.findIndex(t => t.isStatic);
        const novaTarefa = { id: novoId, color: corAleatoria, defaultName: '?', hours: 0, isStatic: false };
        
        if (outrosIndex !== -1) {
            config.splice(outrosIndex, 0, novaTarefa);
        } else {
            config.push(novaTarefa);
        }

        recalcularOutros();
        saveToLocalStorage();
        renderizarLinhasEditor();
        drawChartStatic();
        gerarLegendas();

        inputsPanel.scrollTo({ top: inputsPanel.scrollHeight, behavior: 'smooth' });
    });

    // Abrir modal de Edição
    btnOpenEdit.addEventListener('click', () => {
        modalEdit.classList.add('active');
        sheetContent.style.transform = "translateY(0)";
        document.getElementById('mainContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Fechar modal de Edição clicando fora da folha
    modalEdit.addEventListener('click', (e) => {
        if (e.target === modalEdit) {
            sheetContent.style.transform = "translateY(100%)";
            setTimeout(() => modalEdit.classList.remove('active'), 250);
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

    // Arrasto do Bottom Sheet
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
            sheetContent.style.transform = "translateY(100%)";
            setTimeout(() => modalEdit.classList.remove('active'), 250);
        } else {
            sheetContent.style.transform = "translateY(0)";
        }
        startY = 0; currentY = 0;
    }

    // ESTRUTURA BASE DO GRÁFICO
    function drawChartStatic() {
        renderGraficoEstrutura(1.0);
    }

    function renderGraficoEstrutura(progresso) {
        if (!pageInicio.classList.contains('active')) return;

        const t = translations[currentLang];
        const center = canvas.width / 2;
        const radius = center - 10;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let totalHours = 0;
        config.forEach(item => totalHours += item.hours);
        
        if (mainHoursCounter) mainHoursCounter.textContent = `${t.total}: ${totalHours.toFixed(1)} / 24h`;
        
        if (totalHours > 24.01) {
            if (mainErrorMsg) mainErrorMsg.textContent = t.errorOver;
            if (sheetErrorMsg) sheetErrorMsg.textContent = t.errorOver;
        } else {
            if (mainErrorMsg) mainErrorMsg.textContent = "";
            if (sheetErrorMsg) sheetErrorMsg.textContent = "";
        }
        
        const baseHoras = totalHours > 24 ? totalHours : 24;
        let startAngle = -Math.PI / 2; 
        
        config.forEach(task => {
            if (task.hours === 0) return;
            
            const sliceAngle = ((task.hours * progresso) / baseHoras) * (2 * Math.PI);
            const endAngle = startAngle + sliceAngle;
            
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = task.color;
            ctx.fill();
            
            const middleAngle = startAngle + sliceAngle / 2;
            const textX = center + (radius * 0.84) * Math.cos(middleAngle);
            const textY = center + (radius * 0.84) * Math.sin(middleAngle);
            
            if (task.hours > 1.0 && progresso > 0.8) {
                ctx.save();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${task.hours.toFixed(1)}h`, textX, textY);
                ctx.restore();
            }
            startAngle = endAngle;
        });
        
        if (totalHours < 24) {
            const remainingAngle = (((24 - totalHours) + (totalHours * (1 - progresso))) / 24) * (2 * Math.PI);
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

            if (tempoDecorrido < 1) {
                requestAnimationFrame(frame);
            }
        }
        requestAnimationFrame(frame);
    }

    applyLanguage();
    animacaoGrafico();
});
