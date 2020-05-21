var pCancel = document.getElementById('pCancel').value;
var tFixedLastCancel = 0; //время устранения предыдущего отказа (в начале работы системы Tуст = 0); 
var tCancelAverage = document.getElementById('intensivnostPostuplenia').value; //среднее время безотказной работы системы

var intensivnostPostuplenia = document.getElementById('intensivnostPostuplenia').value;
var intensivnostObrabotki = document.getElementById('intensivnostObrabotki').value;

//консоли
var requestCosnole = document.getElementById('RequestConsole');
var CancelConsole = document.getElementById('CancelConsole');
var RequestsAfterAnaliz = document.getElementById('RequestsAfterAnaliz');
var CancelConsoleAfterAnaliz = document.getElementById('CancelConsoleAfterAnaliz');

var requests = []; //массив заявок
var cancels = []; //массив отказов
var resAnaliz = []; //массив котором содержатся (F) результаты функции Анализ

var numRequest = document.getElementById('numRequest').value;

function Cancel(numRequest){
    let i = 0;
    while(i < numRequest){
        cancels[i] = [
            {
                pr: 0,
                tCancel: 0,
                tFixedLastCancel:0
            }
        ]

        var z = Math.random();
         console.log("z = " + z);
        if(z < pCancel){
            cancels[i].pr = 1;
        }else{
            cancels[i].pr = 2;
        }
    
        z = Math.random();
    
        cancels[i].tCancel = tFixedLastCancel - tCancelAverage * Math.log(z);
    
        z = Math.random();

        cancels[i].tFixedLastCancel = cancels[i].tCancel - tCancelAverage * Math.log(z);
        tFixedLastCancel = cancels[i].tFixedLastCancel;
        i++
    }
    
}


// Создание потока неперекрывающихся заявок.
function CreatePotok1(type,numRequest){  
    let i = 0;
   
    while(i < numRequest){
        requests[i] = { //одна заявка
            id: 0,
            timeBegin: 0,
            timeEnd: 0,
            timeWork: 0,
            priority:0,
            solved:0
        };
        requests[i].id = i;
        if(i < 1){
            requests[i].timeBegin = Raspredelenie(intensivnostPostuplenia);
            requests[i].priority = Math.floor(Math.random()*(3-1)+1);
        }else{
            if(type == 1){
                requests[i].timeBegin = requests[i-1].timeEnd + Raspredelenie(intensivnostPostuplenia);
            }else if(type == 2){
                requests[i].timeBegin = requests[i-1].timeBegin + Raspredelenie(intensivnostPostuplenia);
            }else if(type == 3){
                requests[i].timeBegin = requests[i-1].timeEnd + Raspredelenie(intensivnostPostuplenia);
                requests[i].priority = Math.floor(Math.random()*(3-1)+1);
            }
        }
        requests[i].timeWork = Raspredelenie(intensivnostObrabotki);
        requests[i].timeEnd = requests[i].timeBegin + requests[i].timeWork;
        i++;
    }
}


function Raspredelenie(intensivnostPostuplenia){
    return ((-1/intensivnostPostuplenia) * Math.log(Math.random()));
}

//Функция анализа
function Analiz(tEnd, tCancel, tBegin, tFixedLastCancel){
    if((tBegin < tCancel) && (tCancel < tEnd)){
        return 2;
    }else if((tCancel < tBegin) && (tBegin < tFixedLastCancel)){
        return 3;
    }else if(tCancel < tEnd){
        return 1;
    }else{
        return 4;
    }
}

function ChooseClick(){
    tFixedLastCancel = 0;
    //очищаем консоли
    requestCosnole.innerHTML = "";
    CancelConsole.innerHTML = "";
    RequestsAfterAnaliz.innerHTML = "";
    CancelConsoleAfterAnaliz.innerHTML = "";

    Cancel(numRequest);
    console.log("Массив отказов");
    console.log(requests);
    CreatePotok1(1, numRequest);

    //вывод на сайт поток заявок
    for (let i = 0; i < numRequest; i++) {
        let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
        
        pTag.innerHTML = `Заявка № ${i+1} <br/>  Время начала: ${requests[i].timeBegin} <br/> Время обработки: ${requests[i].timeWork} <br/> Время окончания: ${requests[i].timeEnd} <br/>`;
        requestCosnole.append(pTag);
    }

    //вывод на сайт поток откразов
    for (let i = 0; i < numRequest; i++) {
        let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
        
        pTag.innerHTML = `Отказ № ${i+1} <br/>  Время отказа: ${cancels[i].tCancel} <br/> Время устранения последнего отказа: ${cancels[i].tFixedLastCancel} <br/> Тип отказа: ${cancels[i].pr}`;
        CancelConsole.append(pTag);
    }

    // console.log("заявки 1 типа");
    // console.log(requests);

    var goodRequest = 0;
    var i = 0;
    while(i < numRequest){
        //console.log(cancels[i].tCancel);
        resAnaliz[i] = Analiz(requests[i].timeEnd, cancels[i].tCancel, requests[i].timeBegin, cancels[i.tFixedLastCancel]);
        
        if(resAnaliz[i] == 1){
            goodRequest++;
            requests[i].solved = 1;
            console.log('1 вариант обработано заявок ' + goodRequest);
        }else if((resAnaliz[i] == 2) && (requests[i].pr == 1)){
            console.log("2 вариант");
            requests[i].timeEnd = requests[i].timeEnd + cancels[i].tFixedLastCancel - requests[i].timeBegin;
            requests[i].timeBegin = cancels[i].tFixedLastCancel;
            cancels(numRequest);  
        }else if(((resAnaliz[i] == 2)&&(requests[i].pr == 2)) || (resAnaliz[i] == 3)){
            console.log("3 вариант");
            requests[i].timeEnd = cancels[i].tFixedLastCancel + requests[i].timeEnd - requests[i].timeBegin;
            requests[i].timeBegin = cancels[i].tFixedLastCancel;
            cancels(numRequest);
        }else{
            console.log("Вызов метода отмена")
            //Cancel(numRequest);
        }
        i++
    }

    //вывод на сайт поток заявок после analiz 
    for (let i = 0; i < numRequest; i++) {
        let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
        
        pTag.innerHTML = `Заявка № ${i+1} <br/>  Время начала: ${requests[i].timeBegin} <br/> Время обработки: ${requests[i].timeWork} <br/> Время окончания: ${requests[i].timeEnd} <br> F = ${resAnaliz[i]}`;
        RequestsAfterAnaliz.append(pTag);
    }
    

     //вывод на сайт поток отказов после analiz 
     for (let i = 0; i < numRequest; i++) {
        let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
        
        pTag.innerHTML = `Отказ № ${i+1} <br/>  Время отказа: ${cancels[i].tCancel} <br/> Время устранения последнего отказа: ${cancels[i].tFixedLastCancel} <br/> Тип отказа: ${cancels[i].pr}`;
        CancelConsoleAfterAnaliz.append(pTag);
    }
    console.log("F = " + resAnaliz);
    console.log("Обработанных заявок " + goodRequest);
    
    console.log("заявки после работы с F");
    console.log(requests);

   delete cancels;
}
