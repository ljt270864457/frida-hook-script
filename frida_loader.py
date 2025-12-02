#!/usr/bin/env python3
"""
Frida Universal Script Loader
通用Frida脚本加载器 - 支持同时加载多个JS脚本

Usage:
    python3 frida_loader.py
"""

import frida
import sys
import json
from typing import List, Dict
from pathlib import Path

# ============================================================
# 配置区 - 在这里修改默认设置
# ============================================================

# 工作目录（脚本文件所在目录）
WORK_DIR = Path(__file__).parent.resolve()

# 运行配置
CONFIG = {
    # 目标应用包名（必填）
    'package': 'com.rytong.hnair',
    
    # 要加载的脚本列表
    'scripts': [
        str(WORK_DIR / "HookSSL.js"),
        str(WORK_DIR / "so_analyzer.js"),
    ],
    
    # 模式设置
    'spawn_mode': True,      # True=spawn模式启动应用, False=attach到运行中的应用
    'interactive': True,      # True=启用交互模式, False=仅输出日志
}

# ============================================================


class FridaScriptLoader:
    """Frida脚本加载器类"""
    
    def __init__(self, package_name: str, scripts: List[str], spawn_mode: bool = False, interactive: bool = False):
        self.package_name = package_name
        self.scripts = scripts
        self.spawn_mode = spawn_mode
        self.interactive = interactive
        self.device = None
        self.session = None
        self.pid = None  # 保存进程PID
        self.loaded_scripts = []
        self.rpc_exports = {}  # 存储RPC导出的函数
        self.rpc_script_map = {}  # 脚本编号到(脚本名, [函数列表])的映射
        
    def on_message(self, message: Dict, data: bytes):
        """处理脚本消息"""
        if message['type'] == 'send':
            payload = message.get('payload', '')
            if isinstance(payload, dict):
                print(f"[→] {json.dumps(payload, indent=2, ensure_ascii=False)}")
            else:
                print(f"[→] {payload}")
        elif message['type'] == 'error':
            print(f"[✗] Error: {message.get('description', 'Unknown error')}")
            if 'stack' in message:
                print(f"[✗] Stack: {message['stack']}")
        else:
            print(f"[?] {message}")
    
    def on_detached(self, reason: str, crash):
        """进程分离回调"""
        print(f"\n[!] Process detached: {reason}")
        if crash:
            print(f"[!] Crash info: {crash}")
    
    def connect_device(self):
        """连接到USB设备"""
        try:
            print("[*] Connecting to USB device...")
            self.device = frida.get_usb_device(timeout=5)
            print(f"[✓] Connected to: {self.device.name}")
            return True
        except frida.TimedOutError:
            print("[✗] Failed to connect to device (timeout)")
            return False
        except Exception as e:
            print(f"[✗] Failed to connect to device: {e}")
            return False
    
    def attach_process(self):
        """附加到进程"""
        try:
            if self.spawn_mode:
                print(f"[*] Spawning {self.package_name}...")
                self.pid = self.device.spawn([self.package_name])
                self.session = self.device.attach(self.pid)
                print(f"[✓] Spawned with PID: {self.pid}")
            else:
                print(f"[*] Attaching to {self.package_name}...")
                self.session = self.device.attach(self.package_name)
                print(f"[✓] Attached to {self.package_name}")
            
            # 设置分离回调
            self.session.on('detached', self.on_detached)
            return True
            
        except frida.ProcessNotFoundError:
            print(f"[✗] Process '{self.package_name}' not found")
            if not self.spawn_mode:
                print("[!] Tip: Use --spawn to start the app")
            return False
        except Exception as e:
            print(f"[✗] Failed to attach: {e}")
            return False
    
    def load_scripts(self) -> bool:
        """加载所有脚本"""
        if not self.scripts:
            print("[!] No scripts to load")
            return False
        
        print(f"\n[*] Loading {len(self.scripts)} script(s)...")
        print("-" * 60)
        
        success_count = 0
        for script_path in self.scripts:
            try:
                # 解析脚本路径
                full_path = Path(script_path).expanduser().resolve()
                
                if not full_path.exists():
                    print(f"[✗] Script not found: {full_path}")
                    continue
                
                print(f"[*] Loading: {full_path.name}")
                
                # 读取脚本内容
                with open(full_path, 'r', encoding='utf-8') as f:
                    script_content = f.read()
                
                # 创建并加载脚本
                script = self.session.create_script(script_content)
                script.on('message', self.on_message)
                script.load()
                
                # 保存脚本信息
                self.loaded_scripts.append({
                    'path': str(full_path),
                    'name': full_path.name,
                    'script': script
                })
                
                print(f"[✓] Loaded: {full_path.name}")
                success_count += 1
                
            except Exception as e:
                print(f"[✗] Failed to load {script_path}: {e}")
            
        
        print("-" * 60)
        print(f"[✓] Successfully loaded {success_count}/{len(self.scripts)} scripts\n")
        
        return success_count > 0
    
    def resume_process(self):
        """恢复进程执行（spawn模式）"""
        if self.spawn_mode and self.device and self.pid:
            try:
                print(f"[*] Resuming process {self.pid}...")
                self.device.resume(self.pid)
                print("[✓] Process resumed")
            except Exception as e:
                print(f"[✗] Failed to resume: {e}")
    
    def setup_rpc(self):
        """设置RPC接口"""
        self.rpc_script_map = {}  # 重置脚本映射
        script_index = 1
        
        for script_info in self.loaded_scripts:
            script = script_info['script']
            # 尝试获取RPC导出
            try:
                exports = script.exports
                # 检查exports是否有实际内容
                available_methods = [attr for attr in dir(exports) if not attr.startswith('_')]
                
                if available_methods:
                    script_name = script_info['name']
                    self.rpc_exports[script_name] = exports
                    
                    # 创建脚本级别的映射：脚本编号 -> (脚本名, 函数列表)
                    self.rpc_script_map[script_index] = (script_name, available_methods)
                    
                    print(f"[✓] RPC exports found in {script_name}: {', '.join(available_methods)}")
                    script_index += 1
            except Exception as e:
                # 静默失败，不是所有脚本都需要RPC
                pass
    
    def call_rpc_function(self, script_name: str, function_name: str, *args):
        """调用RPC函数"""
        try:
            if script_name not in self.rpc_exports:
                print(f"[✗] No RPC exports found in {script_name}")
                return None
            
            exports = self.rpc_exports[script_name]
            
            # Frida RPC会将所有函数名转换为小写
            # 所以我们也统一使用小写来查找和调用
            normalized_name = function_name.lower()
            
            # 获取所有可用的函数
            available = [attr for attr in dir(exports) if not attr.startswith('_')]
            
            # 检查函数是否存在
            if normalized_name not in available:
                print(f"[✗] Function '{function_name}' (normalized: '{normalized_name}') not found in {script_name}")
                if available:
                    print(f"[*] Available functions: {', '.join(available)}")
                return None
            
            # 获取函数并调用
            func = getattr(exports, normalized_name)
            result = func(*args)
            return result
            
        except Exception as e:
            print(f"[✗] RPC call failed: {e}")
            # 只在详细模式下显示traceback
            # traceback.print_exc()
            return None
    
    def eval_js(self, code: str):
        """执行JS代码"""
        try:
            # 创建临时脚本执行代码
            if self.session:
                result = self.session.create_script(code)
                result.load()
                return True
            return False
        except Exception as e:
            print(f"[✗] Eval failed: {e}")
            return False
    
    def interactive_shell(self):
        """交互式Shell"""
        print("\n" + "=" * 60)
        print("  Interactive Mode - Available Commands")
        print("=" * 60)
        print("  help               - Show this help")
        print("  list               - List loaded scripts")
        print("  rpc                - List RPC exports (with numbers)")
        print("  call <s> <f> [args]       - Call by number (call 1 2)")
        print("  call <script> <func> [args]  - Call by name")
        print("  eval <code>        - Evaluate JavaScript code")
        print("  reload             - Reload all scripts")
        print("  exit/quit          - Exit")
        print("=" * 60)
        print()
        
        while True:
            try:
                cmd = input("frida> ").strip()
                
                if not cmd:
                    continue
                
                # 解析命令
                parts = cmd.split(maxsplit=1)
                command = parts[0].lower()
                args = parts[1] if len(parts) > 1 else ""
                
                if command in ['exit', 'quit', 'q']:
                    break
                
                elif command == 'help' or command == 'h':
                    print("\nAvailable commands:")
                    print("  list     - List all loaded scripts")
                    print("  rpc      - Show RPC exports with numbers")
                    print("  call     - Call RPC function (2 ways):")
                    print("             call 1 2            # script 1, function 2")
                    print("             call script.js func # by name")
                    print("  eval     - Evaluate JS: eval console.log('hello')")
                    print("  reload   - Reload all scripts")
                    print("  exit     - Exit interactive mode")
                
                elif command == 'list' or command == 'ls':
                    print("\nLoaded scripts:")
                    for idx, script_info in enumerate(self.loaded_scripts, 1):
                        print(f"  {idx}. {script_info['name']}")
                        print(f"     Path: {script_info['path']}")
                
                elif command == 'rpc':
                    if not self.rpc_exports:
                        print("\n[!] No RPC exports found")
                        print("[*] Tip: Use rpc.exports in your JS script:")
                        print("    rpc.exports = { myFunc: function() { ... } };")
                    else:
                        print("\nRPC Exports:")
                        for script_idx in sorted(self.rpc_script_map.keys()):
                            script_name, funcs = self.rpc_script_map[script_idx]
                            print(f"  [{script_idx}] {script_name}:")
                            for func_idx, func_name in enumerate(funcs, 1):
                                print(f"      [{func_idx}] {func_name}")
                        print("\n[*] Usage:")
                        print("    call <s> <f> [args]        # call 1 2 (script 1, function 2)")
                        print("    call <script> <func> [args] # call script.js funcName")
                
                elif command == 'call':
                    call_parts = args.split()
                    if len(call_parts) < 2:
                        print("[✗] Usage:")
                        print("    call <script_num> <func_num> [args...]   # call 1 2")
                        print("    call <script_name> <function_name> [args...]  # call script.js func")
                        continue
                    
                    # 检查前两个参数是否都是数字
                    if call_parts[0].isdigit() and call_parts[1].isdigit():
                        # 方式1: call 1 2 -> 第1个脚本的第2个函数
                        script_idx = int(call_parts[0])
                        func_idx = int(call_parts[1])
                        func_args = call_parts[2:] if len(call_parts) > 2 else []
                        
                        # 查找对应的脚本和函数
                        if script_idx not in self.rpc_script_map:
                            print(f"[✗] Invalid script number: {script_idx}")
                            print("[*] Use 'rpc' command to see available scripts")
                            continue
                        
                        script_name, funcs = self.rpc_script_map[script_idx]
                        
                        if func_idx < 1 or func_idx > len(funcs):
                            print(f"[✗] Invalid function number: {func_idx} (available: 1-{len(funcs)})")
                            continue
                        
                        func_name = funcs[func_idx - 1]  # 编号从1开始，列表从0开始
                        print(f"[*] Calling [{script_idx}.{func_idx}] {script_name}.{func_name}({', '.join(func_args)})")
                    else:
                        # 方式2: call script_name function_name -> 传统名称方式
                        script_name = call_parts[0]
                        func_name = call_parts[1]
                        func_args = call_parts[2:] if len(call_parts) > 2 else []
                        print(f"[*] Calling {script_name}.{func_name}({', '.join(func_args)})")
                    
                    result = self.call_rpc_function(script_name, func_name, *func_args)
                    
                    if result is not None:
                        print(f"[✓] Result: {result}")
                
                elif command == 'eval' or command == 'e':
                    if not args:
                        print("[✗] Usage: eval <javascript_code>")
                        continue
                    
                    print(f"[*] Evaluating: {args}")
                    
                    # 创建临时脚本执行
                    try:
                        temp_script = self.session.create_script(f"""
                        (function() {{
                            {args}
                        }})();
                        """)
                        temp_script.on('message', self.on_message)
                        temp_script.load()
                        print("[✓] Executed")
                    except Exception as e:
                        print(f"[✗] Failed: {e}")
                
                elif command == 'reload' or command == 'r':
                    print("[*] Reloading scripts...")
                    # 卸载旧脚本
                    for script_info in self.loaded_scripts:
                        try:
                            script_info['script'].unload()
                        except:
                            pass
                    self.loaded_scripts = []
                    self.rpc_exports = {}
                    self.rpc_script_map = {}
                    
                    # 重新加载
                    if self.load_scripts():
                        self.setup_rpc()
                        print("[✓] Scripts reloaded")
                    else:
                        print("[✗] Reload failed")
                
                else:
                    print(f"[✗] Unknown command: {command}")
                    print("[*] Type 'help' for available commands")
                
            except EOFError:
                break
            except KeyboardInterrupt:
                print()
                continue
            except Exception as e:
                print(f"[✗] Error: {e}")
    
    def run(self):
        """运行加载器"""
        try:
            # 连接设备
            if not self.connect_device():
                return False
            
            # 附加进程
            if not self.attach_process():
                return False
            
            # 加载脚本
            if not self.load_scripts():
                return False
            
            # 恢复进程（spawn模式）
            if self.spawn_mode:
                self.resume_process()
            
            # 设置RPC
            self.setup_rpc()
            
            # 显示已加载脚本
            print("[*] Loaded scripts:")
            for idx, script_info in enumerate(self.loaded_scripts, 1):
                print(f"    {idx}. {script_info['name']}")
            
            # 显示RPC导出
            if self.rpc_exports:
                print("\n[*] RPC exports available:")
                for script_name in self.rpc_exports:
                    print(f"    - {script_name}")
            
            print("\n[*] Press Ctrl+C to detach and exit")
            if self.interactive:
                print("[*] Entering interactive mode...")
            print("=" * 60)
            print()
            
            # 交互模式或保持运行
            if self.interactive:
                self.interactive_shell()
            else:
                sys.stdin.read()
            
        except KeyboardInterrupt:
            print("\n[!] Interrupted by user")
        except Exception as e:
            print(f"\n[✗] Error: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """清理资源"""
        print("\n[*] Cleaning up...")
        if self.session:
            try:
                self.session.detach()
                print("[✓] Session detached")
            except:
                pass


def main():
    """
    主函数：从CONFIG读取配置，支持命令行覆盖包名
    
    Usage:
        python3 frida_loader.py                    # 使用CONFIG中的配置
        python3 frida_loader.py com.example.app    # 覆盖CONFIG中的包名
    """
    
    # 从CONFIG读取配置
    package = CONFIG['package']
    scripts = CONFIG['scripts']
    spawn_mode = CONFIG['spawn_mode']
    interactive = CONFIG['interactive']
    
    # 验证配置
    if not package:
        print("[✗] No package name specified in CONFIG")
        print("[*] Please set CONFIG['package'] in the script")
        sys.exit(1)
    
    if not scripts:
        print("[✗] No scripts specified in CONFIG")
        print("[*] Please set CONFIG['scripts'] in the script")
        sys.exit(1)
    
    # 显示启动信息
    print("=" * 60)
    print("  Frida Universal Script Loader")
    print("=" * 60)
    print(f"Package: {package}")
    print(f"Mode: {'Spawn' if spawn_mode else 'Attach'}")
    print(f"Interactive: {'Yes' if interactive else 'No'}")
    print(f"Scripts: {len(scripts)}")
    print("=" * 60)
    print()
    
    # 创建并运行加载器
    loader = FridaScriptLoader(package, scripts, spawn_mode, interactive)
    loader.run()


if __name__ == '__main__':
    main()

