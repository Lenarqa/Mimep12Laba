var pCancel;
var tFixedLastCancel = 0; 
var tCancelAverage;

var intensivnostPostuplenia;
var intensivnostObrabotki;
var typeRequestPotok;
var goodRequest;//количество обработанных заявок
//консоли
var requestCosnole = document.getElementById('RequestConsole');
var CancelConsole = document.getElementById('CancelConsole');
//var RequestsAfterAnaliz = document.getElementById('RequestsAfterAnaliz');
//var CancelConsoleAfterAnaliz = document.getElementById('CancelConsoleAfterAnaliz');
var numCancels = document.getElementById('numCancels');
var requests = []; //массив заявок
var cancels = []; //массив отказов
var resAnaliz = []; //массив котором содержатся (F) результаты функции Анализ

var numRequest;

function Cancel(numCancels){
    let i = 0;
    while(i < numCancels){
        cancels[i] = [
            {
                pr: 0,
                tCancel: 0,
                tFixedLastCancel:0
            }
        ]

        var z = Math.random();

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
            tBeginDoobslushit: 0,
            tEndDoobslushit:0,
            dangerous: ""
        };
        requests[i].id = i;
        if(i < 1){
            requests[i].timeBegin = Raspredelenie(intensivnostPostuplenia);
            if(type == 3){
                requests[i].priority = Math.floor(Math.random()*(3-1)+1);
            }
        }else{
            if(type == 1){
                requests[i].timeBegin = requests[i-1].timeEnd + Raspredelenie(intensivnostPostuplenia);
                console.log("tymeBegin = " + requests[i].timeBegin);
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


function Raspredelenie(intensivnostPostuplenia1){
    return ((-1/intensivnostPostuplenia1) * Math.log(Math.random()));
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

function Serving(){

}

function ChooseClick(){
    goodRequest = 0;//количество обработанных заявок
    var i;
    
    ClearConsols();//чистим все консоли.

    //Присваиваем значения из html страницы
    pCancel = document.getElementById('pCancel').value;
    tFixedLastCancel = 0; //время устранения предыдущего отказа (в начале работы системы Tуст = 0); 
    tCancelAverage = document.getElementById('intensivnostPostuplenia').value; //среднее время безотказной работы системы
    intensivnostPostuplenia = document.getElementById('intensivnostPostuplenia').value;
    intensivnostObrabotki = document.getElementById('intensivnostObrabotki').value;
    typeRequestPotok = document.getElementById('typeRequestPotok').value;
    numRequest = document.getElementById('numRequest').value;
    numCancels = document.getElementById('numCancels').value;
    
    Cancel(numCancels); // формируем массив отказов
    CreatePotok1(typeRequestPotok, numRequest);//формируем массив заявок
    ShowInConsole(1);//вывод на сайт поток заявок
    ShowInConsole(2);//вывод на сайт поток откразов

    i = 0;
    while(i < numCancels){
        let j = 0;
        var iFind = 0;
        while(j < numRequest && i > iFind){
            if(requests[i].timeBegin < cancels[i].tCancel && cancels[i].tFixedLastCancel < requests[i].timeEnd){
                if(cancels[i].pr == 1){
                    requests[i].tBeginDoobslushit = cancels[i].tCancel;
                    requests[i].tEndDoobslushit = cancels[i].tFixedLastCancel;
                    iFind = 1000;
                    //requests[i].timeEnd = requests[i].tEndDoobslushit + cancels[i].tCancelAverage;
                }
                if(cancels[i].pr == 2){
                    requests[i].dangerous = "Произошел отказ 2 уровня";
                    iFind = 1000;
                }
            }else if(cancels[i].tCancel < requests[i].timeBegin && cancels[i].tFixedLastCancel < requests[i].timeEnd){
                if(cancels[i].pr == 1){
                    requests[i].tBeginDoobslushit = cancels[i].tFixedLastCancel - requests[i].timeBegin; 
                    requests[i].timeBegin = cancels[i].tFixedLastCancel;
                    request[i].timeEnd +=  request[i].tBeginDoobslushit;
                    iFind = 1000;
                    // if(request[i+1].timeBegin < request[i].timeEnd){
                    //     request[i+1].timeBegin = requests[i].timeEnd; 
                    // }
                }
                if(cancels[i].pr == 2){
                    requests[i].dangerous = "Произошел отказ 2 уровня"
                    res = 1000;
                }
            }else if(cancels[i].tCancel > requests[i].timeBegin && cancels[i].tFixedLastCancel > requests[i].timeEnd){
                if(cancels[i].pr == 1){
                    requests[i].tBeginDoobslushit = requests[i].timeEnd - cancels[i].tCancel;
                    requests[i].tEndDoobslushit = cancels[i].tFixedLastCancel;
                    requests[i].timeEnd += requests[i].timeEnd - cancels[i].tCancel;
                    iFind = 1000;    
                }
                if(cancels[i].pr == 2){
                    requests[i].dangerous = "Произошел отказ 2 уровня";
                    iFind = 1000;
                } 
            }
            j++;
        }
        i++
    }
    console.log("new variant");
    console.log(requests);
    //ниже попытка сделать с приоритетами
    // i = 0;
    // while(i < numRequest){
    //         resAnaliz[i] = Analiz(requests[i].timeEnd, cancels[i].tCancel, requests[i].timeBegin, cancels[i.tFixedLastCancel]);
            
    //         if(resAnaliz[i] == 1){
    //             goodRequest++;
    //             requests[i].solved = 1;
    //         }else if((resAnaliz[i] == 2) && (requests[i].pr == 1)){
    //             console.log("2 вариант");
    //             requests[i].timeEnd = requests[i].timeEnd + cancels[i].tFixedLastCancel - requests[i].timeBegin;//изменил tEnd
    //             requests[i].timeBegin = cancels[i].tFixedLastCancel;
    //             cancels(numRequest);  
    //         }else if(((resAnaliz[i] == 2)&&(requests[i].pr == 2)) || (resAnaliz[i] == 3)){
    //             console.log("3 вариант");
    //             requests[i].timeEnd = cancels[i].tFixedLastCancel + requests[i].timeEnd - requests[i].timeBegin;
    //             requests[i].timeBegin = cancels[i].tFixedLastCancel;
    //             cancels(numRequest);
    //         }else{
    //             console.log("Вызов метода отмена");
    //             tFixedLastCancel = 0;
    //             Cancel(numRequest);
    //         }
    //     i++
    // }

    //вывод на сайт поток заявок после analiz 
    //ShowInConsole(3);
     //вывод на сайт поток отказов после analiz 
    //ShowInConsole(4);

    //удаляем все массивы, чтобы при повторном нажатии на кнопку они создались заново.
    delete cancels;
    delete requests;
    //delete resAnaliz; 
}

function ClearConsols(){
    //очищаем консоли
   requestCosnole.innerHTML = "";
   CancelConsole.innerHTML = "";
   //RequestsAfterAnaliz.innerHTML = "";
   //CancelConsoleAfterAnaliz.innerHTML = "";
}

function ShowInConsole(requesOrcancels){
    switch (requesOrcancels) {
        case 1:
            let h2Tag = document.createElement('h2');
            h2Tag.innerHTML = `Заявки`;
            requestCosnole.append(h2Tag);
            for (let i = 0; i < numRequest; i++) {
                let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
                
                pTag.innerHTML = `Заявка № ${i+1} <br/>  Время начала: ${requests[i].timeBegin} <br/> Время обработки: ${requests[i].timeWork} <br/> Время окончания: ${requests[i].timeEnd} <br/> Приоритет:${requests[i].priority}`;
                requestCosnole.append(pTag);
            }
            break;

        case 2:
            let h2Tag2 = document.createElement('h2');
            h2Tag2.innerHTML = `Отказы`;
            CancelConsole.append(h2Tag2);
            for (let i = 0; i < numCancels; i++) {
                let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
                
                pTag.innerHTML = `Отказ № ${i+1} <br/>  Время отказа: ${cancels[i].tCancel} <br/> Время устранения последнего отказа: ${cancels[i].tFixedLastCancel} <br/> Тип отказа: ${cancels[i].pr}`;
                CancelConsole.append(pTag);
            }
            break;

        case 3:
            for (let i = 0; i < numRequest; i++) {
                let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
                
                pTag.innerHTML = `Заявка № ${i+1} <br/>  Время начала: ${requests[i].timeBegin} <br/> Время обработки: ${requests[i].timeWork} <br/> Время окончания: ${requests[i].timeEnd} <br/> F = ${resAnaliz[i]}`;
                RequestsAfterAnaliz.append(pTag);
            }
            let pTag = document.createElement('p');
            pTag.innerHTML = `Обработанные заявки ${goodRequest}`;
            RequestsAfterAnaliz.append(pTag);
            break;

        case 4:
            for (let i = 0; i < numRequest; i++) {
                let pTag = document.createElement('p');//тег который будет отображать текст в консоли заявок
                
                pTag.innerHTML = `Отказ № ${i+1} <br/>  Время отказа: ${cancels[i].tCancel} <br/> Время устранения последнего отказа: ${cancels[i].tFixedLastCancel} <br/> Тип отказа: ${cancels[i].pr}`;
                CancelConsoleAfterAnaliz.append(pTag);
            }
            break;
    }
}