Set ws = CreateObject("Wscript.Shell")

schema = WScript.Arguments(0)

dirname = CreateObject("Scripting.FileSystemObject").GetFile(Wscript.ScriptFullName).ParentFolder.Path

ws.run "node "+dirname+"\"+schema+"_update_checker.js "+WScript.Arguments(1)+" "+WScript.Arguments(2) , vbhide