// ========================================
// 个人工具箱 - 全部功能脚本（修复版）
// ========================================

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    initCalculator();
    initUnitConverter();
    initExchangeRate();
    initQRGenerator();
    initQRScanner();
    initTodoList();
    initNavigation();
    initNotification();
});

// ========== 底部导航切换 ==========
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.tool-panel');
    
    console.log('导航初始化，找到', navItems.length, '个导航项');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const toolName = item.dataset.tool;
            console.log('切换到:', toolName);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            panels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(toolName);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ========== 1. 计算器 ==========
function initCalculator() {
    let currentNumber = '0';
    let previousNumber = '';
    let operation = null;
    let shouldResetScreen = false;
    
    const historyEl = document.getElementById('calcHistory');
    const currentEl = document.getElementById('calcCurrent');
    
    if (!historyEl || !currentEl) {
        console.error('计算器元素未找到');
        return;
    }
    
    function updateDisplay() {
        currentEl.textContent = currentNumber;
    }
    
    function handleNumber(num) {
        console.log('点击数字:', num);
        if (shouldResetScreen) {
            currentNumber = '';
            shouldResetScreen = false;
        }
        if (num === '.' && currentNumber.includes('.')) return;
        if (currentNumber === '0' && num !== '.') {
            currentNumber = num;
        } else {
            currentNumber += num;
        }
        updateDisplay();
    }
    
    function handleOperator(op) {
        console.log('点击运算符:', op);
        if (operation !== null && !shouldResetScreen) {
            calculate();
        }
        previousNumber = currentNumber;
        operation = op;
        shouldResetScreen = true;
        historyEl.textContent = `${previousNumber} ${getOpSymbol(op)}`;
    }
    
    function getOpSymbol(op) {
        const symbols = { '+': '+', '-': '-', '*': '×', '/': '÷' };
        return symbols[op] || op;
    }
    
    function calculate() {
        let result;
        const prev = parseFloat(previousNumber);
        const curr = parseFloat(currentNumber);
        
        if (isNaN(prev) || isNaN(curr)) return;
        
        switch (operation) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/': 
                if (curr === 0) {
                    result = '错误';
                } else {
                    result = prev / curr;
                }
                break;
            default: return;
        }
        
        if (result === '错误') {
            currentNumber = '错误';
            historyEl.textContent = '';
        } else {
            currentNumber = Math.round(result * 1000000) / 1000000 + '';
            historyEl.textContent = `${previousNumber} ${getOpSymbol(operation)} ${curr} =`;
        }
        operation = null;
        shouldResetScreen = true;
        updateDisplay();
    }
    
    function handleFunction(action) {
        console.log('点击功能:', action);
        let num = parseFloat(currentNumber);
        switch (action) {
            case 'clear':
                currentNumber = '0';
                previousNumber = '';
                operation = null;
                historyEl.textContent = '';
                break;
            case 'clear-entry':
                currentNumber = '0';
                break;
            case 'sign':
                currentNumber = (parseFloat(currentNumber) * -1) + '';
                break;
            case 'percent':
                currentNumber = (parseFloat(currentNumber) / 100) + '';
                break;
            case 'back':
                if (currentNumber.length > 1 && currentNumber !== '错误') {
                    currentNumber = currentNumber.slice(0, -1);
                } else {
                    currentNumber = '0';
                }
                break;
            case 'sqrt':
                currentNumber = Math.sqrt(num) + '';
                shouldResetScreen = true;
                break;
            case 'square':
                currentNumber = (num * num) + '';
                shouldResetScreen = true;
                break;
            case 'reciprocal':
                currentNumber = (1 / num) + '';
                shouldResetScreen = true;
                break;
        }
        if (currentNumber === 'NaN' || currentNumber === 'Infinity') {
            currentNumber = '错误';
        }
        updateDisplay();
    }
    
    // 绑定按钮事件
    document.querySelectorAll('.calc-btn.num').forEach(btn => {
        btn.addEventListener('click', () => handleNumber(btn.dataset.num));
    });
    document.querySelectorAll('.calc-btn.op').forEach(btn => {
        if (btn.dataset.op) {
            btn.addEventListener('click', () => handleOperator(btn.dataset.op));
        }
        if (btn.dataset.action === 'equal') {
            btn.addEventListener('click', () => calculate());
        }
    });
    document.querySelectorAll('.calc-btn.func, .calc-btn.sci').forEach(btn => {
        if (btn.dataset.action) {
            btn.addEventListener('click', () => handleFunction(btn.dataset.action));
        }
    });
    
    console.log('计算器初始化完成');
}

// ========== 2. 单位换算 ==========
function initUnitConverter() {
    const categories = {
        length: { km: 1000, m: 1, cm: 0.01, mm: 0.001, mile: 1609.34, foot: 0.3048, inch: 0.0254 },
        weight: { kg: 1000, g: 1, mg: 0.001, lb: 453.592, oz: 28.3495, jin: 500, liang: 50 },
        temperature: { celsius: 'c', fahrenheit: 'f', kelvin: 'k' },
        area: { sqkm: 1e6, sqm: 1, sqcm: 0.0001, hectare: 10000, acre: 4046.86, sqft: 0.092903 },
        volume: { liter: 1000, ml: 1, cubicM: 1e6, gallon: 3785.41, quart: 946.353 }
    };
    
    const unitNames = {
        length: { km: '千米', m: '米', cm: '厘米', mm: '毫米', mile: '英里', foot: '英尺', inch: '英寸' },
        weight: { kg: '千克', g: '克', mg: '毫克', lb: '磅', oz: '盎司', jin: '斤', liang: '两' },
        area: { sqkm: '平方公里', sqm: '平方米', sqcm: '平方厘米', hectare: '公顷', acre: '英亩', sqft: '平方英尺' },
        volume: { liter: '升', ml: '毫升', cubicM: '立方米', gallon: '加仑', quart: '夸脱' }
    };
    
    let currentCategory = 'length';
    
    function updateUnits() {
        const units = Object.keys(categories[currentCategory]);
        const fromSelect = document.getElementById('fromUnit');
        const toSelect = document.getElementById('toUnit');
        
        if (!fromSelect || !toSelect) return;
        
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';
        
        units.forEach(unit => {
            const name = unitNames[currentCategory]?.[unit] || unit;
            fromSelect.add(new Option(name, unit));
            toSelect.add(new Option(name, unit));
        });
        
        fromSelect.value = 'm';
        toSelect.value = 'cm';
        updateLabels();
    }
    
    function updateLabels() {
        const fromUnit = document.getElementById('fromUnit')?.value;
        const toUnit = document.getElementById('toUnit')?.value;
        const fromLabel = document.getElementById('unitFromLabel');
        const toLabel = document.getElementById('unitToLabel');
        if (fromLabel && toLabel) {
            fromLabel.textContent = unitNames[currentCategory]?.[fromUnit] || fromUnit;
            toLabel.textContent = unitNames[currentCategory]?.[toUnit] || toUnit;
        }
    }
    
    function convert() {
        const fromValueInput = document.getElementById('fromValue');
        const toValueInput = document.getElementById('toValue');
        if (!fromValueInput || !toValueInput) return;
        
        let fromValue = parseFloat(fromValueInput.value);
        if (isNaN(fromValue)) fromValue = 0;
        
        let result;
        if (currentCategory === 'temperature') {
            const fromUnit = document.getElementById('fromUnit')?.value;
            const toUnit = document.getElementById('toUnit')?.value;
            let celsius;
            if (fromUnit === 'celsius') celsius = fromValue;
            else if (fromUnit === 'fahrenheit') celsius = (fromValue - 32) * 5/9;
            else celsius = fromValue - 273.15;
            if (toUnit === 'celsius') result = celsius;
            else if (toUnit === 'fahrenheit') result = celsius * 9/5 + 32;
            else result = celsius + 273.15;
        } else {
            const fromUnit = document.getElementById('fromUnit')?.value;
            const toUnit = document.getElementById('toUnit')?.value;
            if (fromUnit && toUnit && categories[currentCategory][fromUnit] && categories[currentCategory][toUnit]) {
                const baseValue = fromValue * categories[currentCategory][fromUnit];
                result = baseValue / categories[currentCategory][toUnit];
            } else {
                result = 0;
            }
        }
        toValueInput.value = result ? result.toFixed(6) : '0';
    }
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            updateUnits();
            convert();
        });
    });
    
    const fromUnit = document.getElementById('fromUnit');
    const toUnit = document.getElementById('toUnit');
    const fromValue = document.getElementById('fromValue');
    const swapBtn = document.getElementById('swapUnits');
    
    if (fromUnit) fromUnit.addEventListener('change', () => { updateLabels(); convert(); });
    if (toUnit) toUnit.addEventListener('change', () => { updateLabels(); convert(); });
    if (fromValue) fromValue.addEventListener('input', convert);
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const fromVal = document.getElementById('fromUnit')?.value;
            const toVal = document.getElementById('toUnit')?.value;
            if (fromVal && toVal) {
                document.getElementById('fromUnit').value = toVal;
                document.getElementById('toUnit').value = fromVal;
                updateLabels();
                convert();
            }
        });
    }
    
    document.querySelectorAll('.common-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fromValueInput = document.getElementById('fromValue');
            if (fromValueInput) {
                fromValueInput.value = btn.dataset.value;
                convert();
            }
        });
    });
    
    updateUnits();
    convert();
    console.log('单位换算初始化完成');
}

// ========== 3. 汇率换算 ==========
function initExchangeRate() {
    let rates = {};
    
    async function fetchRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/CNY');
            const data = await response.json();
            rates = data.rates;
            const rateTime = document.getElementById('rateTime');
            if (rateTime) rateTime.textContent = new Date().toLocaleTimeString();
            updateExchange();
            console.log('汇率获取成功');
            return true;
        } catch (error) {
            console.error('汇率获取失败', error);
            return false;
        }
    }
    
    function updateExchange() {
        const fromCurrency = document.getElementById('currencyFrom')?.value;
        const toCurrency = document.getElementById('currencyTo')?.value;
        const amount = parseFloat(document.getElementById('amountFrom')?.value) || 0;
        
        if (rates[fromCurrency] && rates[toCurrency]) {
            const rate = rates[toCurrency] / rates[fromCurrency];
            const rateValueEl = document.getElementById('exchangeRateValue');
            const convertedAmountEl = document.getElementById('convertedAmount');
            const toSymbolEl = document.getElementById('toCurrencySymbol');
            
            if (rateValueEl) rateValueEl.textContent = `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
            if (convertedAmountEl) convertedAmountEl.textContent = (amount * rate).toFixed(2);
            if (toSymbolEl) toSymbolEl.textContent = toCurrency;
        }
    }
    
    const currencyFrom = document.getElementById('currencyFrom');
    const currencyTo = document.getElementById('currencyTo');
    const amountFrom = document.getElementById('amountFrom');
    const swapCurrency = document.getElementById('swapCurrency');
    const refreshBtn = document.getElementById('refreshRate');
    
    if (currencyFrom) currencyFrom.addEventListener('change', updateExchange);
    if (currencyTo) currencyTo.addEventListener('change', updateExchange);
    if (amountFrom) amountFrom.addEventListener('input', updateExchange);
    if (swapCurrency) {
        swapCurrency.addEventListener('click', () => {
            const from = currencyFrom?.value;
            const to = currencyTo?.value;
            if (from && to && currencyFrom && currencyTo) {
                currencyFrom.value = to;
                currencyTo.value = from;
                updateExchange();
            }
        });
    }
    if (refreshBtn) refreshBtn.addEventListener('click', fetchRates);
    
    fetchRates();
    setInterval(fetchRates, 86400000);
}

// ========== 4. 二维码生成 ==========
function initQRGenerator() {
    function generateQR() {
        const textInput = document.getElementById('qrText');
        const text = textInput?.value;
        if (!text) return;
        
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;
        
        qrContainer.innerHTML = '';
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            console.log('二维码生成成功');
        } else {
            console.error('QRCode库未加载');
            qrContainer.innerHTML = '<p style="color:red">二维码库加载失败，请检查网络</p>';
        }
    }
    
    const generateBtn = document.getElementById('generateQR');
    const qrText = document.getElementById('qrText');
    const downloadBtn = document.getElementById('downloadQR');
    
    if (generateBtn) generateBtn.addEventListener('click', generateQR);
    if (qrText) qrText.addEventListener('keypress', (e) => { if (e.key === 'Enter') generateQR(); });
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const canvas = document.querySelector('#qrcode canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = canvas.toDataURL();
                link.click();
            } else {
                alert('请先生成二维码');
            }
        });
    }
    
    if (qrText && qrText.value) {
        generateQR();
    }
    console.log('二维码生成初始化完成');
}

// ========== 5. 二维码扫描 ==========
function initQRScanner() {
    let scannerActive = false;
    let html5QrCode = null;
    let scanHandled = false;  // 防止回调重复触发

    const startBtn = document.getElementById('startScan');
    const stopBtn = document.getElementById('stopScan');
    const scanFromFile = document.getElementById('scanFromFile');
    const copyBtn = document.getElementById('copyResultBtn');
    const scannerView = document.getElementById('qr-reader');
    const placeholder = document.getElementById('scannerPlaceholder');

    // ★ 统一处理扫描结果
    //    - 收款码（微信/支付宝 scheme）→ 显示按钮，让用户点击跳转
    //    - 普通 http/https 链接 → 自动跳转
    //    - 纯文本 → 仅展示
    function handleScanResult(decodedText) {
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const isAndroid = /android/i.test(navigator.userAgent);
        const isWxScheme = decodedText.startsWith('wxp://') || decodedText.startsWith('weixin://');
        const isAlipayScheme = decodedText.startsWith('alipays://');
        const isAlipayWeb = decodedText.includes('qr.alipay.com');
        const isHttp = decodedText.startsWith('http://') || decodedText.startsWith('https://');
        const isPayment = isWxScheme || isAlipayScheme || isAlipayWeb;

        // 显示结果文字
        const resultText = document.getElementById('scanResultText');
        const resultLink = document.getElementById('resultLink');
        const resultDiv = document.getElementById('scanResult');
        const openBtn = document.getElementById('openResultBtn');
        const resultTip = document.getElementById('resultTip');

        if (resultDiv) resultDiv.style.display = 'block';
        if (resultText) resultText.textContent = decodedText;

        // 重置按钮和提示
        if (openBtn) openBtn.style.display = 'none';
        if (resultTip) resultTip.style.display = 'none';

        // 显示可点击链接
        if (resultLink) {
            resultLink.href = decodedText;
            resultLink.textContent = decodedText.length > 50 ? decodedText.slice(0, 50) + '...' : decodedText;
            resultLink.style.display = 'inline-block';
        }

        if (isPayment) {
            // ========== 收款码：显示按钮，不自动跳转 ==========
            if (isWxScheme) {
                if (openBtn) {
                    openBtn.textContent = '💚 打开微信支付';
                    openBtn.style.display = 'inline-block';
                    openBtn.onclick = function() {
                        window.location.href = decodedText;
                    };
                }
                if (resultTip) {
                    if (isIOS) {
                        resultTip.textContent = '⚠️ 若按钮无效，请长按上方链接 →「在微信中打开」';
                    } else {
                        resultTip.textContent = '点击按钮将跳转到微信完成支付';
                    }
                    resultTip.style.display = 'block';
                }
            } else if (isAlipayScheme || isAlipayWeb) {
                if (openBtn) {
                    openBtn.textContent = '💙 打开支付宝';
                    openBtn.style.display = 'inline-block';
                    openBtn.onclick = function() {
                        window.location.href = decodedText;
                    };
                }
                if (resultTip) {
                    resultTip.textContent = '点击按钮将跳转到支付宝完成支付';
                    resultTip.style.display = 'block';
                }
            }
        } else if (isHttp) {
            // ========== 普通网址：自动跳转 ==========
            if (resultTip) {
                resultTip.textContent = '正在跳转...';
                resultTip.style.display = 'block';
            }
            // 延迟 300ms 让用户看到结果再跳
            setTimeout(function() {
                window.location.href = decodedText;
            }, 300);
        }
        // 纯文本：只展示结果（上面已经显示），不做任何跳转
    }

    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            if (scannerActive) return;
            scanHandled = false;  // 重置标志

            if (typeof Html5Qrcode === 'undefined') {
                alert('二维码扫描库未加载，请检查网络后刷新页面重试');
                console.error('Html5Qrcode 未定义');
                return;
            }

            const isAndroid = /android/i.test(navigator.userAgent);
            const isHTTP = location.protocol === 'http:' &&
                location.hostname !== 'localhost' &&
                location.hostname !== '127.0.0.1';

            // Android Chrome 强制要求 HTTPS 才能使用摄像头
            if (isAndroid && isHTTP) {
                alert('⚠️ Android 浏览器要求 HTTPS 才能使用摄像头。\n\n' +
                    '当前是 HTTP 连接，摄像头无法启动。\n\n' +
                    '💡 请使用"从相册选择"功能扫描二维码图片。');
                return;
            }

            // 预检查：是否有可用摄像头
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (!cameras || cameras.length === 0) {
                    alert('未检测到摄像头。\n\n💡 请使用"从相册选择"功能扫描二维码图片。');
                    return;
                }
            } catch (camErr) {
                console.error('获取摄像头失败:', camErr);
                if (isAndroid) {
                    alert('无法访问摄像头。\n\n' +
                        '可能原因：\n' +
                        '① 摄像头权限未授予 → 请到浏览器设置中允许\n' +
                        '② 使用 HTTP 协议 → 需要 HTTPS\n\n' +
                        '💡 请尝试使用"从相册选择"功能。');
                } else {
                    alert('无法访问摄像头，请在系统设置中允许浏览器使用摄像头。');
                }
                return;
            }

            try {
                html5QrCode = new Html5Qrcode("qr-reader");
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                  async (decodedText) => {
    // 防止回调重复触发
    if (scanHandled) return;
    scanHandled = true;

    console.log('扫描成功:', decodedText);

    // 停止扫描器
    if (html5QrCode) {
        try { await html5QrCode.stop(); } catch (e) {}
        html5QrCode = null;
    }
    scannerActive = false;
    if (placeholder) placeholder.style.display = 'flex';

    // 统一处理结果（收款码展示按钮，普通链接自动跳转）
    handleScanResult(decodedText);
},
                    (error) => { console.log('扫描中...'); }
                );
                scannerActive = true;
                if (placeholder) placeholder.style.display = 'none';
                console.log('扫描器启动成功');
            } catch (err) {
                console.error('启动扫描器失败:', err);
                alert('无法启动摄像头。\n\n' +
                    '💡 请尝试使用"从相册选择"功能：\n' +
                    '先将二维码截图保存，再从相册中选择图片扫描。');
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', async () => {
            if (html5QrCode) {
                await html5QrCode.stop();
                html5QrCode = null;
            }
            scannerActive = false;
            if (placeholder) placeholder.style.display = 'flex';
            console.log('扫描器已停止');
        });
    }
    
    if (scanFromFile) {
        scanFromFile.addEventListener('click', () => {
            if (typeof Html5Qrcode === 'undefined') {
                alert('二维码扫描库未加载');
                return;
            }
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const scanner = new Html5Qrcode("qr-reader");
                    const result = await scanner.scanFile(file, false);
                    console.log('文件扫描成功:', result);

                    // 统一处理结果
                    handleScanResult(result);
                } catch (err) {
                    console.error('文件扫描失败:', err);
                    alert('未能识别二维码');
                }
            };
            fileInput.click();
        });
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('scanResultText')?.textContent;
            if (text && text !== '暂无') {
                navigator.clipboard.writeText(text);
                alert('已复制: ' + text);
            } else {
                alert('没有可复制的内容');
            }
        });
    }
    
    console.log('二维码扫描初始化完成');
}

// ========== 6. 待办清单 ==========
function initTodoList() {
    let todos = [];
    
    try {
        const saved = localStorage.getItem('todos');
        todos = saved ? JSON.parse(saved) : [];
    } catch(e) { console.error(e); }
    
    let currentFilter = 'all';
    
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    function updateStats() {
        const totalEl = document.getElementById('totalCount');
        const completedEl = document.getElementById('completedCount');
        const uncompletedEl = document.getElementById('uncompletedCount');
        
        if (totalEl) totalEl.textContent = todos.length;
        if (completedEl) completedEl.textContent = todos.filter(t => t.completed).length;
        if (uncompletedEl) uncompletedEl.textContent = todos.filter(t => !t.completed).length;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function renderTodos() {
        let filteredTodos = todos;
        if (currentFilter === 'active') filteredTodos = todos.filter(t => !t.completed);
        if (currentFilter === 'completed') filteredTodos = todos.filter(t => t.completed);
        
        const container = document.getElementById('todoListContainer');
        if (!container) return;
        
        if (filteredTodos.length === 0) {
            container.innerHTML = '<li class="empty-tip">暂无任务，点击上方添加</li>';
            updateStats();
            return;
        }
        
        container.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                <button class="delete-todo" data-id="${todo.id}">🗑️</button>
            </li>
        `).join('');
        
        updateStats();
        
        document.querySelectorAll('.todo-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                const todo = todos.find(t => t.id === id);
                if (todo) todo.completed = e.target.checked;
                saveTodos();
                renderTodos();
            });
        });
        
        document.querySelectorAll('.delete-todo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                todos = todos.filter(t => t.id !== id);
                saveTodos();
                renderTodos();
            });
        });
    }
    
    function addTodo() {
        const input = document.getElementById('todoInput');
        const text = input?.value.trim();
        if (!text) return;
        
        const priority = document.getElementById('prioritySelect')?.value || 'medium';
        todos.push({
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority
        });
        saveTodos();
        renderTodos();
        if (input) input.value = '';
    }
    
    const addBtn = document.getElementById('addTodo');
    const todoInput = document.getElementById('todoInput');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    
    if (addBtn) addBtn.addEventListener('click', addTodo);
    if (todoInput) todoInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTodo(); });
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', () => {
            todos = todos.filter(t => !t.completed);
            saveTodos();
            renderTodos();
        });
    }
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
    
    renderTodos();
    console.log('待办清单初始化完成，共', todos.length, '条任务');
}

// ========== 消息推送授权 ==========
function initNotification() {
    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => {
            Notification.requestPermission();
            console.log('通知权限已请求');
        }, 5000);
    }
}
