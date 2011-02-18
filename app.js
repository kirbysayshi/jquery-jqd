var jq = require('./jqd').jqd;

function doesSomething(someArg){
    return 'i did something to the arg: ' + someArg;
}

jq
    .when(doesSomething('ARGGGGG!'))
    .done(function(resultOfSomething){
        console.log(resultOfSomething);
    })
    .done(function(result2){
        console.log('I wanted to use it again', result2);    
    });