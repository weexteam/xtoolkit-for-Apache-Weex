const Toolkit=require('../../');
Toolkit
    .command('debug','npm:weex-devtool','-V')
    .command('run','npm:weexpack','run')
    .command('','local:../abc.js')
    .command('config',function(a,b){
        console.log(this.command)
        console.log(this.options)
        console.log(a,b)
    })
    .version(require('../../package.json').version)
