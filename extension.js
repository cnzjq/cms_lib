const vscode = require('vscode');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 输出通道
let outputChannel = null;
let currentProcess = null;

// 获取或创建输出通道
function getOutputChannel() {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Code Runner Native');
    }
    return outputChannel;
}

// 关闭输出通道（在插件停用时）
function disposeOutputChannel() {
    if (outputChannel) {
        outputChannel.dispose();
        outputChannel = null;
    }
}

// 语言配置映射表
const languageConfig = {
    'javascript': {
        name: 'JavaScript',
        extensions: ['.js', '.mjs', '.cjs'],
        executors: ['node'],
        executor: 'node',
        isCompiled: false
    },
    'typescript': {
        name: 'TypeScript',
        extensions: ['.ts'],
        executors: ['node', 'npx ts-node'],
        executor: 'node',
        isCompiled: false
    },
    'python': {
        name: 'Python',
        extensions: ['.py', '.pyw', '.pyi'],
        executors: ['python', 'python3', 'py'],
        executor: 'python',
        isCompiled: false
    },
    'php': {
        name: 'PHP',
        extensions: ['.php'],
        executors: ['php'],
        executor: 'php',
        isCompiled: false
    },
    'ruby': {
        name: 'Ruby',
        extensions: ['.rb', '.rbw'],
        executors: ['ruby'],
        executor: 'ruby',
        isCompiled: false
    },
    'go': {
        name: 'Go',
        extensions: ['.go'],
        executors: ['go run'],
        executor: 'go run',
        isCompiled: false
    },
    'rust': {
        name: 'Rust',
        extensions: ['.rs'],
        executors: ['rustc'],
        executor: 'rustc',
        isCompiled: true
    },
    'java': {
        name: 'Java',
        extensions: ['.java'],
        executors: ['javac', 'java'],
        executor: 'javac',
        isCompiled: true
    },
    'c': {
        name: 'C',
        extensions: ['.c', '.h'],
        executors: ['gcc', 'clang'],
        executor: 'gcc',
        isCompiled: true
    },
    'cpp': {
        name: 'C++',
        extensions: ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.hxx'],
        executors: ['g++', 'clang++'],
        executor: 'g++',
        isCompiled: true
    },
    'csharp': {
        name: 'C#',
        extensions: ['.cs'],
        executors: ['dotnet run', 'csc'],
        executor: 'dotnet run',
        isCompiled: true
    },
    'shellscript': {
        name: 'Shell Script',
        extensions: ['.sh', '.bash'],
        executors: ['bash', 'sh'],
        executor: 'bash',
        isCompiled: false
    },
    'powershell': {
        name: 'PowerShell',
        extensions: ['.ps1', '.psm1', '.psd1'],
        executors: ['powershell', 'pwsh'],
        executor: 'powershell',
        isCompiled: false
    },
    'lua': {
        name: 'Lua',
        extensions: ['.lua'],
        executors: ['lua', 'lua5.1', 'lua5.2', 'lua5.3', 'lua5.4'],
        executor: 'lua',
        isCompiled: false
    },
    'perl': {
        name: 'Perl',
        extensions: ['.pl', '.pm'],
        executors: ['perl'],
        executor: 'perl',
        isCompiled: false
    },
    'dart': {
        name: 'Dart',
        extensions: ['.dart'],
        executors: ['dart'],
        executor: 'dart',
        isCompiled: false
    },
    'kotlin': {
        name: 'Kotlin',
        extensions: ['.kt', '.kts'],
        executors: ['kotlinc', 'kotlin'],
        executor: 'kotlin',
        isCompiled: true
    },
    'scala': {
        name: 'Scala',
        extensions: ['.scala', '.sc'],
        executors: ['scala'],
        executor: 'scala',
        isCompiled: false
    },
    'swift': {
        name: 'Swift',
        extensions: ['.swift'],
        executors: ['swift'],
        executor: 'swift',
        isCompiled: true
    },
    'r': {
        name: 'R',
        extensions: ['.r', '.rmd'],
        executors: ['rscript', 'Rscript'],
        executor: 'Rscript',
        isCompiled: false
    },
    'julia': {
        name: 'Julia',
        extensions: ['.jl'],
        executors: ['julia'],
        executor: 'julia',
        isCompiled: false
    }
};

// 扩展名到语言的映射
function getLanguageByExtension(ext) {
    const lowerExt = ext.toLowerCase();
    for (const [lang, config] of Object.entries(languageConfig)) {
        if (config.extensions.includes(lowerExt)) {
            return { language: lang, config: config };
        }
    }
    return null;
}

// 获取文件的完整语言信息
function detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const langInfo = getLanguageByExtension(ext);
    if (langInfo) {
        return {
            ...langInfo.config,
            language: langInfo.language,
            filePath: filePath
        };
    }
    return null;
}

// 格式化时间
function formatTime(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 执行命令并返回Promise
function executeCommand(command, args, options) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, options);
        currentProcess = proc;
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        proc.on('error', (error) => {
            currentProcess = null;
            reject(error);
        });
        
        proc.on('close', (code) => {
            currentProcess = null;
            resolve({
                code: code,
                stdout: stdout,
                stderr: stderr
            });
        });
    });
}

// 停止当前运行的进程
function stopRunningCode() {
    if (currentProcess) {
        currentProcess.kill();
        const channel = getOutputChannel();
        channel.appendLine('\n[进程已终止]');
        vscode.window.showInformationMessage('代码执行已终止');
        currentProcess = null;
    } else {
        vscode.window.showInformationMessage('没有正在运行的代码');
    }
}

// 在终端中运行
async function runInTerminal(terminalName, commands) {
    let terminal = vscode.window.terminals.find(t => t.name === terminalName);
    if (!terminal) {
        terminal = vscode.window.createTerminal(terminalName);
    }
    terminal.show();
    
    for (const cmd of commands) {
        terminal.sendText(cmd);
    }
    return { code: 0, stdout: '', stderr: '' };
}

// 构建执行命令
function buildExecutionCommand(languageInfo, isTempFile = false) {
    const { filePath } = languageInfo;
    
    switch (languageInfo.language) {
        case 'javascript':
        case 'typescript':
            return { command: 'node', args: [filePath] };
        case 'python':
            return { command: 'python', args: [filePath] };
        case 'php':
            return { command: 'php', args: [filePath] };
        case 'ruby':
            return { command: 'ruby', args: [filePath] };
        case 'go':
            return { command: 'go', args: ['run', filePath] };
        case 'rust':
            if (isTempFile) {
                return { command: 'rustc', args: [filePath, '-o', filePath + '.exe'] };
            }
            return { command: 'rustc', args: [filePath, '-o', filePath.replace('.rs', '')] };
        case 'java':
            if (isTempFile) {
                return { command: 'javac', args: [filePath] };
            }
            return { command: 'javac', args: [filePath] };
        case 'c':
            if (isTempFile) {
                return { command: 'gcc', args: [filePath, '-o', filePath + '.exe'] };
            }
            return { command: 'gcc', args: [filePath, '-o', filePath.replace('.c', '')] };
        case 'cpp':
            if (isTempFile) {
                return { command: 'g++', args: [filePath, '-o', filePath + '.exe'] };
            }
            return { command: 'g++', args: [filePath, '-o', filePath.replace(path.extname(filePath), '')] };
        case 'shellscript':
            return { command: 'bash', args: [filePath] };
        case 'powershell':
            return { command: 'powershell', args: ['-ExecutionPolicy', 'Bypass', '-File', filePath] };
        case 'lua':
            return { command: 'lua', args: [filePath] };
        case 'perl':
            return { command: 'perl', args: [filePath] };
        case 'dart':
            return { command: 'dart', args: [filePath] };
        case 'kotlin':
            if (isTempFile) {
                return { command: 'kotlinc', args: [filePath, '-include-runtime', '-d', filePath + '.jar'] };
            }
            return { command: 'kotlinc', args: [filePath, '-include-runtime', '-d', filePath.replace('.kt', '.jar')] };
        case 'scala':
            return { command: 'scala', args: [filePath] };
        case 'swift':
            if (isTempFile) {
                return { command: 'swiftc', args: [filePath, '-o', filePath + '.exe'] };
            }
            return { command: 'swiftc', args: [filePath, '-o', filePath.replace('.swift', '')] };
        case 'r':
            return { command: 'Rscript', args: [filePath] };
        case 'julia':
            return { command: 'julia', args: [filePath] };
        default:
            return null;
    }
}

// 运行编译后的程序
function buildRunAfterCompileCommand(languageInfo) {
    const { filePath } = languageInfo;
    const dir = path.dirname(filePath);
    
    switch (languageInfo.language) {
        case 'rust': {
            const exeName = path.basename(filePath, '.rs');
            const exePath = path.join(dir, exeName);
            return { command: exePath, args: [] };
        }
        case 'java': {
            const className = path.basename(filePath, '.java');
            return { command: 'java', args: ['-cp', dir, className] };
        }
        case 'c': {
            const exeName = path.basename(filePath, '.c');
            const exePath = path.join(dir, exeName + (process.platform === 'win32' ? '.exe' : ''));
            return { command: exePath, args: [] };
        }
        case 'cpp': {
            const ext = path.extname(filePath);
            const exeName = path.basename(filePath, ext);
            const exePath = path.join(dir, exeName + (process.platform === 'win32' ? '.exe' : ''));
            return { command: exePath, args: [] };
        }
        case 'kotlin': {
            const jarPath = filePath.replace('.kt', '.jar');
            return { command: 'java', args: ['-jar', jarPath] };
        }
        case 'swift': {
            const exeName = path.basename(filePath, '.swift');
            const exePath = path.join(dir, exeName + (process.platform === 'win32' ? '.exe' : ''));
            return { command: exePath, args: [] };
        }
        default:
            return null;
    }
}

// 运行代码核心逻辑
async function runCode(code, languageInfo, isFile = true) {
    const channel = getOutputChannel();
    const config = vscode.workspace.getConfiguration('codeRunnerNative');
    const showExecutionTime = config.get('showExecutionTime', true);
    const clearPreviousOutput = config.get('clearPreviousOutput', true);
    const runInTerminalOption = config.get('runInTerminal', false);
    
    // 清除之前的输出
    if (clearPreviousOutput) {
        channel.clear();
    }
    
    // 显示开始信息
    const startTime = Date.now();
    channel.appendLine('='.repeat(60));
    channel.appendLine(`[开始执行] ${languageInfo.name} 代码`);
    if (isFile) {
        channel.appendLine(`[文件路径] ${languageInfo.filePath}`);
    }
    if (showExecutionTime) {
        channel.appendLine(`[开始时间] ${formatTime(new Date(startTime))}`);
    }
    channel.appendLine('='.repeat(60));
    channel.show(true);
    
    let tempFilePath = null;
    let result = null;
    
    try {
        // 如果不是文件路径，先写入临时文件
        if (!isFile && code) {
            const tempDir = os.tmpdir();
            const ext = languageInfo.extensions[0];
            const tempFileName = `coderunner_${Date.now()}${ext}`;
            tempFilePath = path.join(tempDir, tempFileName);
            fs.writeFileSync(tempFilePath, code, 'utf8');
            languageInfo = { ...languageInfo, filePath: tempFilePath };
        }
        
        const execInfo = buildExecutionCommand(languageInfo, !isFile);
        if (!execInfo) {
            throw new Error(`不支持的语言: ${languageInfo.name}`);
        }
        
        // 如果需要在终端运行
        if (runInTerminalOption) {
            const terminalName = 'Code Runner';
            if (languageInfo.isCompiled) {
                // 编译型语言在终端编译并运行
                const compileCmd = `${execInfo.command} ${execInfo.args.join(' ')}`;
                const runInfo = buildRunAfterCompileCommand(languageInfo);
                const runCmd = runInfo ? `${runInfo.command} ${runInfo.args.join(' ')}` : '';
                await runInTerminal(terminalName, [compileCmd, runCmd]);
            } else {
                // 解释型语言直接运行
                const cmd = `${execInfo.command} ${execInfo.args.join(' ')}`;
                await runInTerminal(terminalName, [cmd]);
            }
            channel.appendLine('[已在终端中启动]');
        } else {
            // 在输出通道运行
            channel.appendLine(`[执行命令] ${execInfo.command} ${execInfo.args.join(' ')}`);
            channel.appendLine('-'.repeat(60));
            
            // 执行编译
            if (languageInfo.isCompiled) {
                const compileResult = await executeCommand(
                    execInfo.command,
                    execInfo.args,
                    { cwd: path.dirname(languageInfo.filePath) }
                );
                
                if (compileResult.stderr) {
                    channel.appendLine('[编译警告/错误]');
                    channel.appendLine(compileResult.stderr);
                }
                
                if (compileResult.code !== 0) {
                    throw new Error(`编译失败 (退出码: ${compileResult.code})`);
                }
                
                channel.appendLine('[编译成功]');
                
                // 运行编译后的程序
                const runInfo = buildRunAfterCompileCommand(languageInfo);
                if (runInfo) {
                    channel.appendLine(`[运行命令] ${runInfo.command} ${runInfo.args.join(' ')}`);
                    channel.appendLine('-'.repeat(60));
                    
                    const runResult = await executeCommand(
                        runInfo.command,
                        runInfo.args,
                        { cwd: path.dirname(languageInfo.filePath) }
                    );
                    
                    result = runResult;
                }
            } else {
                // 解释型语言直接运行
                result = await executeCommand(
                    execInfo.command,
                    execInfo.args,
                    { cwd: path.dirname(languageInfo.filePath) }
                );
            }
            
            // 输出结果
            if (result) {
                if (result.stdout) {
                    channel.appendLine(result.stdout);
                }
                if (result.stderr) {
                    channel.appendLine('[标准错误]');
                    channel.appendLine(result.stderr);
                }
                
                if (result.code !== 0) {
                    channel.appendLine(`[退出码: ${result.code}]`);
                }
            }
        }
        
        // 显示执行时间
        const endTime = Date.now();
        const duration = endTime - startTime;
        channel.appendLine('-'.repeat(60));
        if (showExecutionTime) {
            channel.appendLine(`[结束时间] ${formatTime(new Date(endTime))}`);
            channel.appendLine(`[执行耗时] ${duration}ms`);
        }
        channel.appendLine('[执行完成]');
        channel.appendLine('='.repeat(60));
        
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        channel.appendLine('-'.repeat(60));
        channel.appendLine(`[错误] ${error.message}`);
        if (showExecutionTime) {
            channel.appendLine(`[结束时间] ${formatTime(new Date(endTime))}`);
            channel.appendLine(`[执行耗时] ${duration}ms`);
        }
        channel.appendLine('[执行失败]');
        channel.appendLine('='.repeat(60));
        
        vscode.window.showErrorMessage(`执行失败: ${error.message}`);
    } finally {
        // 清理临时文件
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                // 忽略清理错误
            }
        }
    }
}

// 激活插件
function activate(context) {
    console.log('Code Runner Native 插件已激活');
    
    // 注册：运行当前文件命令
    const runFileDisposable = vscode.commands.registerCommand('codeRunnerNative.runCurrentFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('请先打开一个文件');
            return;
        }
        
        const document = editor.document;
        const filePath = document.fileName;
        
        if (!fs.existsSync(filePath)) {
            vscode.window.showWarningMessage('请先保存文件');
            return;
        }
        
        const languageInfo = detectLanguage(filePath);
        if (!languageInfo) {
            vscode.window.showWarningMessage(`无法识别的文件类型: ${path.extname(filePath) || '无扩展名'}`);
            return;
        }
        
        await runCode(null, languageInfo, true);
    });
    
    // 注册：运行选中代码命令
    const runSelectedDisposable = vscode.commands.registerCommand('codeRunnerNative.runSelectedCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('请先打开一个文件');
            return;
        }
        
        const selection = editor.selection;
        let code = '';
        
        if (selection.isEmpty) {
            // 如果没有选中代码，运行整个文件
            code = editor.document.getText();
        } else {
            code = editor.document.getText(selection);
        }
        
        if (!code.trim()) {
            vscode.window.showWarningMessage('选中的代码为空');
            return;
        }
        
        const filePath = editor.document.fileName;
        const languageInfo = detectLanguage(filePath);
        if (!languageInfo) {
            // 尝试通过语言模式检测
            const languageId = editor.document.languageId;
            const found = Object.entries(languageConfig).find(([key, config]) => key === languageId);
            if (found) {
                const [, config] = found;
                await runCode(code, { ...config, language: languageId, filePath: filePath }, false);
                return;
            }
            vscode.window.showWarningMessage('无法识别当前文件的语言类型');
            return;
        }
        
        await runCode(code, languageInfo, false);
    });
    
    // 注册：停止运行命令
    const stopDisposable = vscode.commands.registerCommand('codeRunnerNative.stopRunningCode', () => {
        stopRunningCode();
    });
    
    // 注册：状态栏项
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'codeRunnerNative.runCurrentFile';
    statusBarItem.text = '$(play) Run';
    statusBarItem.tooltip = '运行当前文件 (Ctrl+Alt+N)';
    statusBarItem.show();
    
    // 更新状态栏
    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.fileName;
            const langInfo = detectLanguage(filePath);
            if (langInfo) {
                statusBarItem.text = `$(play) Run ${langInfo.name}`;
                statusBarItem.tooltip = `运行当前 ${langInfo.name} 文件 (Ctrl+Alt+N)`;
                statusBarItem.show();
            } else {
                statusBarItem.hide();
            }
        } else {
            statusBarItem.hide();
        }
    };
    
    // 监听编辑器变化
    const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(updateStatusBar);
    const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(updateStatusBar);
    
    // 初始更新
    updateStatusBar();
    
    // 将所有的 disposable 添加到 context.subscriptions
    context.subscriptions.push(
        runFileDisposable,
        runSelectedDisposable,
        stopDisposable,
        statusBarItem,
        onDidChangeActiveEditor,
        onDidChangeTextEditorSelection
    );
}

// 停用插件
function deactivate() {
    if (currentProcess) {
        currentProcess.kill();
        currentProcess = null;
    }
    disposeOutputChannel();
    console.log('Code Runner Native 插件已停用');
}

module.exports = {
    activate,
    deactivate
};
