# Code Runner Native

一款功能强大的 VS Code 插件，自动识别编程语言并在控制台输出执行结果。完全使用原生 JavaScript 实现，零依赖，零配置。

## 功能特性

- **自动语言识别**：根据文件扩展名自动识别 20+ 种编程语言
- **执行代码片段**：支持运行选中的代码片段（自动写入临时文件执行）
- **完整文件执行**：一键运行当前打开的文件
- **编译型语言支持**：自动处理编译和运行流程（Java, C, C++, Rust, Kotlin, Swift）
- **进程管理**：支持终止正在运行的代码
- **执行时间统计**：显示代码执行耗时
- **状态栏快捷按钮**：左下角显示当前可执行的语言类型
- **错误处理**：清晰的错误提示和输出信息
- **完全原生实现**：不依赖任何 npm 包和第三方库

## 支持语言

| 语言 | 扩展名 | 执行方式 | 类型 |
|------|--------|----------|------|
| JavaScript | .js, .mjs, .cjs | node | 解释型 |
| TypeScript | .ts | node | 解释型 |
| Python | .py, .pyw, .pyi | python | 解释型 |
| PHP | .php | php | 解释型 |
| Ruby | .rb, .rbw | ruby | 解释型 |
| Go | .go | go run | 解释型 |
| Rust | .rs | rustc | 编译型 |
| Java | .java | javac + java | 编译型 |
| C | .c, .h | gcc | 编译型 |
| C++ | .cpp, .cc, .cxx, .hpp | g++ | 编译型 |
| C# | .cs | dotnet run | 编译型 |
| Shell | .sh, .bash | bash | 解释型 |
| PowerShell | .ps1, .psm1, .psd1 | powershell | 解释型 |
| Lua | .lua | lua | 解释型 |
| Perl | .pl, .pm | perl | 解释型 |
| Dart | .dart | dart | 解释型 |
| Kotlin | .kt, .kts | kotlinc | 编译型 |
| Scala | .scala, .sc | scala | 解释型 |
| Swift | .swift | swiftc | 编译型 |
| R | .r, .rmd | Rscript | 解释型 |
| Julia | .jl | julia | 解释型 |

## 安装方法

### 方式一：本地加载（推荐）

1. 打开 VS Code
2. 按 `Ctrl+Shift+P` 打开命令面板
3. 输入并选择 `Extensions: Install from VSIX...`
4. 选择插件文件夹进行安装

或按 `F5` 在扩展开发宿主中直接测试。

### 方式二：手动安装

1. 将 `vscode-runner` 文件夹复制到 VS Code 扩展目录：
   - Windows: `%USERPROFILE%\.vscode\extensions\`
   - macOS: `~/.vscode/extensions/`
   - Linux: `~/.vscode/extensions/`
2. 重启 VS Code

## 使用方法

### 运行当前文件

1. 打开任意支持的编程语言文件
2. 使用以下任一方式运行：
   - 按快捷键 `Ctrl+Alt+N`（Mac: `Cmd+Alt+N`）
   - 点击左下角状态栏的 **Run** 按钮
   - 右键编辑器 → **Run Current File**
   - 编辑器右上角工具栏的 **Run** 按钮

### 运行选中代码

1. 在编辑器中选中要执行的代码
2. 使用以下任一方式运行：
   - 按快捷键 `Ctrl+Alt+S`（Mac: `Cmd+Alt+S`）
   - 右键编辑器 → **Run Selected Code**

### 停止运行

- 按 `Ctrl+Shift+P`，输入 `Code Runner: Stop Running Code`
- 或调用命令 `codeRunnerNative.stopRunningCode`

## 快捷键

| 快捷键 | 功能 | 适用平台 |
|--------|------|----------|
| `Ctrl+Alt+N` | 运行当前文件 | Windows / Linux |
| `Cmd+Alt+N` | 运行当前文件 | macOS |
| `Ctrl+Alt+S` | 运行选中代码 | Windows / Linux |
| `Cmd+Alt+S` | 运行选中代码 | macOS |

## 插件设置

打开 VS Code 设置（`Ctrl+,`），搜索 `Code Runner Native`：

| 设置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `codeRunnerNative.showExecutionTime` | boolean | true | 是否在输出中显示执行时间 |
| `codeRunnerNative.clearPreviousOutput` | boolean | true | 运行前是否清除之前的输出 |
| `codeRunnerNative.runInTerminal` | boolean | false | 是否在集成终端中运行代码 |

## 输出示例

```
============================================================
[开始执行] JavaScript 代码
[文件路径] /path/to/your/file.js
[开始时间] 2026-08-05 14:30:15
============================================================
[执行命令] node /path/to/your/file.js
------------------------------------------------------------
Hello, World!
This is the output of your code.

------------------------------------------------------------
[结束时间] 2026-08-05 14:30:16
[执行耗时] 125ms
[执行完成]
============================================================
```

## 编译型语言执行流程

对于 Java, C, C++, Rust, Kotlin, Swift 等编译型语言，插件会自动处理编译和执行：

1. **编译阶段**：使用对应的编译器编译源代码
2. **运行阶段**：自动执行编译生成的可执行文件
3. **错误处理**：如果编译失败，会显示编译错误信息

### 示例（Java）

```
============================================================
[开始执行] Java 代码
[文件路径] /path/to/HelloWorld.java
[开始时间] 2026-08-05 14:35:20
============================================================
[执行命令] javac /path/to/HelloWorld.java
------------------------------------------------------------
[编译成功]
[运行命令] java -cp /path/to HelloWorld
------------------------------------------------------------
Hello, World!
------------------------------------------------------------
[结束时间] 2026-08-05 14:35:22
[执行耗时] 2100ms
[执行完成]
============================================================
```

## 系统要求

- VS Code 1.74.0 或更高版本
- 已安装对应编程语言的运行时环境

### 各语言运行环境要求

| 语言 | 需要安装 |
|------|----------|
| JavaScript/TypeScript | Node.js |
| Python | Python 3.x |
| Java | JDK |
| C/C++ | GCC 或 Clang |
| Rust | Rust Toolchain |
| Go | Go SDK |
| 其他 | 对应语言的运行时 |

## 文件结构

```
vscode-runner/
├── package.json      # 插件配置和命令注册
├── extension.js      # 核心逻辑实现
└── README.md         # 说明文档
```

## 技术实现

本插件完全使用原生 JavaScript 实现：

- **VS Code API**：`vscode` 模块提供编辑器、命令、状态栏、输出通道等功能
- **Node.js 内置模块**：
  - `child_process`：启动子进程执行代码
  - `fs`：文件系统操作（创建临时文件等）
  - `path`：路径处理
  - `os`：获取系统临时目录

不依赖任何第三方 npm 包，代码简洁高效，易于理解和扩展。

## 常见问题

### Q: 插件提示 "无法识别的文件类型" 怎么办？

A: 请确保文件有正确的扩展名。支持的扩展名见上表。如果仍有问题，请检查文件是否已保存。

### Q: 编译型语言执行失败？

A: 请确保已安装对应的编译器：
- Java: `javac` 和 `java`
- C/C++: `gcc` / `g++`
- Rust: `rustc`
- Go: `go`
- Kotlin: `kotlinc`
- Swift: `swiftc`

### Q: 如何在集成终端中运行？

A: 在 VS Code 设置中将 `codeRunnerNative.runInTerminal` 设置为 `true`。

### Q: 执行 Python 代码时提示找不到命令？

A: 请确保 Python 已添加到系统 PATH 环境变量。在 Windows 上，命令通常为 `python` 或 `python3`。

### Q: 插件支持调试功能吗？

A: 本插件专注于代码的快速运行和结果输出，不包含调试功能。如需调试，请使用 VS Code 的内置调试功能。

## 扩展开发

如果你想修改或扩展此插件：

1. 克隆代码到本地
2. 在 VS Code 中打开项目
3. 按 `F5` 启动扩展开发宿主
4. 修改 `extension.js` 中的代码
5. 保存后自动重新加载

### 添加新语言支持

在 `extension.js` 的 `languageConfig` 对象中添加新语言的配置：

```javascript
'mylang': {
    name: 'MyLang',
    extensions: ['.mylang'],
    executors: ['mylang'],
    executor: 'mylang',
    isCompiled: false  // 或 true（如果是编译型语言）
}
```

然后在 `buildExecutionCommand` 函数中添加该语言的执行命令。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进此插件。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 21 种编程语言
- 自动语言识别
- 代码片段执行
- 编译型语言自动编译执行
- 执行时间统计
- 进程管理（终止运行）
