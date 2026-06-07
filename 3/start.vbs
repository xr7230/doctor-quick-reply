' 医患沟通助手启动脚本
' 使用VBS绕过编码问题

Option Explicit

Dim WshShell, strProjectPath, strCommand

' 创建WScript.Shell对象
Set WshShell = WScript.CreateObject("WScript.Shell")

' 项目路径
strProjectPath = "D:\doctor\2"

' 显示启动信息
MsgBox "Starting Doctor-Patient Communication Assistant..." & vbCrLf & vbCrLf & _
       "Project: " & strProjectPath & vbCrLf & _
       "Port: 5173" & vbCrLf & vbCrLf & _
       "Click OK to continue", vbInformation, "Startup"

' 构建命令：切换到D盘，进入目录，启动Vite
strCommand = "cmd /c " & Chr(34) & "D: && cd " & Chr(34) & strProjectPath & Chr(34) & " && npm run dev" & Chr(34)

' 在新窗口中启动服务器
WshShell.Run strCommand, 1, False

' 等待5秒让服务器启动
WScript.Sleep 5000

' 打开浏览器
WshShell.Run "http://localhost:5173", 1, False

' 完成提示
MsgBox "Startup complete!" & vbCrLf & vbCrLf & _
       "Server: http://localhost:5173" & vbCrLf & vbCrLf & _
       "Tips:" & vbCrLf & _
       "- Server is running in a new window" & vbCrLf & _
       "- Press Ctrl+C in that window to stop", vbInformation, "Done"

' 清理
Set WshShell = Nothing