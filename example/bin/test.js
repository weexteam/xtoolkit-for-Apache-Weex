var chalk=require('chalk')

var path=require('path')
var child=require('child_process')
child.spawn('node',[path.join(__dirname,'../abc.js')],{
    stdio:'inherit'
})


//console.log(ui.toString())