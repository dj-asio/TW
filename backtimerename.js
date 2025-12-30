const cookieName = "UniversalBack";

let WorldSpeed;
let UnitSpeed;

const domain = document.domain;

let tomorrowTranslated = "tomorrow";
let atTranslated = "at";
let prevUnit = "noble";
let explore = "spy";
let attackTranslated = "Attack";


/*var baseUnitSpeed = {
    "Noble" : 35,
    "B\351lier" : 30,
    "\311p\351e" : 22,
    "Hache" : 18,
    "Lourd" : 11,
    "L\351ger" : 10,
    "\311claireur" : 9,
}*/
let baseUnitSpeed = {
    "noble": 35,
    "ram": 30,
    "sword": 22,
    "axe": 18,
    "hcav": 11,
    "lcav": 10,
    "spy": 9,
};
if(domain.includes("tribalwars.net") || domain.includes("tribalwars.co.uk")){
    tomorrowTranslated = "tomorrow";
    atTranslated = "at";
    prevUnit = "noble";
    explore = "spy";
    attackTranslated = "Attack";

    baseUnitSpeed = {
        "noble" : 35,
        "ram" : 30,
        "sword" : 22,
        "axe" : 18,
        "hcav" : 11,
        "lcav" : 10,
        "spy" : 9,
    }
}
/*else if(domain.includes("guerretribale.fr")){
    tomorrowTranslated = "Demain";
    atTranslated = "le";
    prevUnit = "Noble";
    explore = "\311claireur";
    attackTranslated = "Attaque";

    baseUnitSpeed = {
        "Noble" : 35,
        "B\351lier" : 30,
        "\311p\351e" : 22,
        "Hache" : 18,
        "Lourd" : 11,
        "L\351ger" : 10,
        "\311claireur" : 9,
    }
}*/
/*else if(domain.includes("tribalwars.nl")){
    tomorrowTranslated = "morgen";
    atTranslated = "om";
    prevUnit = "Edel.";
    explore = "Verk.";
    attackTranslated = "Aanval";

    baseUnitSpeed = {
        "Edel." : 35,
        "Ram" : 30,
        "Zwaard" : 22,
        "Bijl" : 18,
        "ZCav." : 11,
        "LCav." : 10,
        "Verk." : 9,
    }
}*/
else if(domain.includes("fyletikesmaxes.gr")){
    tomorrowTranslated = "αύριο";
    atTranslated = "στις";
    prevUnit = "<b>Αριστοκράτης</b>";
    explore = "Ανιχνευτής";
    attackTranslated = "Επίθεση";

    /*baseUnitSpeed = {
        "Αριστοκράτης" : 35,
        "Κριός" : 30,
        "Ξίφος" : 22,
        "Τσεκούρι" : 18,
        "Βαρ.ιππ." : 11,
        "Ελ.ιππ." : 10,
        "Ανιχνευτής" : 9,
    }*/
    baseUnitSpeed = {
        "noble" : 35,
        "ram" : 30,
        "sword" : 22,
        "axe" : 18,
        "hcav" : 11,
        "lcav" : 10,
        "spy" : 9,
    }
}
/*else if(domain.includes("voynaplemyon.com")){
    tomorrowTranslated = "завтра";
    atTranslated = "om";
    prevUnit = "Дворянин";
    explore = "Лазутчик";
    attackTranslated = "Атака";

    baseUnitSpeed = {
        "Дворянин" : 35,
        "Таран" : 30,
        "Меч" : 22,
        "Топор" : 18,
        "ТКав" : 11,
        "ЛКав" : 10,
        "Лазутчик" : 9,
    }
}
else if(domain.includes("tribals.it")){
    tomorrowTranslated = "domani";
    atTranslated = "alle";
    prevUnit = "nobile";
    explore = "Esploratore";
    attackTranslated = "Attacco";

    baseUnitSpeed = {
        "nobile" : 35,
        "Arieti" : 30,
        "Spada" : 22,
        "Ascia" : 18,
        "PCav" : 11,
        "LCav" : 10,
        "Esploratore" : 9,
    }
}
else if(domain.includes("tribalwars.ae")){
    atTranslated = " غدا";
    prevUnit = "نبيل";
    explore = "كشافة";
    attackTranslated = "هجوم";

    baseUnitSpeed = {
        "نبيل" : 35,
        "محطمة الحائط" : 30,
        "سيف" : 22,
        "فأس" : 18,
        "الفرسان الثقيلة" : 11,
        "الفرسان الخفيفة" : 10,
        "كشافة" : 9,
    }
}*/


function getTimeLeftInSecond(row){
    const TimeString = $(row).find('td')[6].innerText;
    const split = TimeString.split(':');
    return parseInt(split[2])+60*parseInt(split[1])+3600*parseInt(split[0]);
}

function getSender(row){
    return $(row).find('td')[3].innerText; // TODO A Tester
}

function getDistance(row){
    const coordAtt = getAttacker(row).split("|");
    const coordDef = getDefender(row).split("|");
    return Math.sqrt(Math.pow(parseInt(coordAtt[0]) - parseInt(coordDef[0]), 2) + Math.pow(parseInt(coordAtt[1]) - parseInt(coordDef[1]), 2));
}
function getDefender(row){
    const a = $(row).find('td')[1].innerText; // TODO A Tester
    let tab = a.split(')');
    return tab[tab.length-2].split('(')[1];
}

function getAttacker(row){
    const a = $(row).find('td')[2].innerText; // TODO A Tester
    let tab = a.split(')');
    return tab[tab.length-2].split('(')[1];
}

function getTravelTimeInSecond(distance, unit){
    return Math.round(distance * (60*baseUnitSpeed[unit]/WorldSpeed/UnitSpeed));
}

function getBackTime(row){
    const impact = conversionImpactDate(row);
    const travel = getTravelTimeInSecond(getDistance(row), findAttackSpeed(row));
    const launchDate = new Date(impact.getFullYear(), impact.getMonth(), impact.getDate(), impact.getHours(), impact.getMinutes(), parseInt(impact.getSeconds()) + travel);
    const dateStringSplit = launchDate.toString().split(" ");
    return dateStringSplit[1] + ". " + dateStringSplit[2] + ", " + dateStringSplit[4];
}


function findAttackSpeed(row){
    const TimeLeft = getTimeLeftInSecond(row);
    const distance = getDistance(row);
    let previousUnit = prevUnit;

    for(const unit in baseUnitSpeed){
        if(getTravelTimeInSecond(distance, unit)<TimeLeft) return previousUnit;
        previousUnit = unit;
    }
    return explore;
}


function getImpactTime(row){
    return  $(row).find('td')[5].innerText; // TODO A Tester
}

function hasNumbers(t)
{
    return /\d/.test(t);
}


function conversionImpactDate(row){
    const impact = getImpactTime(row);
    console.log(impact + " oi");
    const tab = impact.split(" ");
    const dateActual = new Date();
    console.log(tab);
    const last = tab[tab.length - 1];
    let index = tab.length - 1;
    if(!hasNumbers(last)){
        index = index-1;
    }
    let dateCalculate;
    switch(tab[0]){
        case tomorrowTranslated:
            dateCalculate = new Date(dateActual.getFullYear(), dateActual.getMonth(), parseInt(dateActual.getDate())+1, tab[index].split(":")[0], tab[index].split(":")[1], tab[index].split(":")[2]);
            break
        case atTranslated:
            dateCalculate = new Date(tab[1].split(".")[2], parseInt(tab[1].split(".")[1])-1, tab[1].split(".")[0],tab[3].split(":")[0], tab[3].split(":")[1], tab[3].split(":")[2]);
            break
        default:
            dateCalculate = new Date(dateActual.getFullYear(), dateActual.getMonth(), parseInt(dateActual.getDate()), tab[index].split(":")[0], tab[index].split(":")[1], tab[index].split(":")[2]);
            break

    }
    if(dateCalculate==null) {throw new Error("oops, error in data conversion")}

    return dateCalculate;

}

function findAttackLaunch(row){
    const impact = conversionImpactDate(row);
    const travel = getTravelTimeInSecond(getDistance(row), findAttackSpeed(row));
    const launchDate = new Date(impact.getFullYear(), impact.getMonth(), impact.getDate(), impact.getHours(), impact.getMinutes(), parseInt(impact.getSeconds()) - travel);
    const dateStringSplit = launchDate.toString().split(" ");
    return dateStringSplit[1] + ". " + dateStringSplit[2] + ", " + dateStringSplit[4]
}

function getFinalString(row){
    return findAttackSpeed(row) + " " + getAttacker(row) + " " + getSender(row) + " " + findAttackLaunch(row) + " | " + getBackTime(row)
}


//----------
function editAttackName($row) {
    const $button = $row.find('.rename-icon');
    $button.click();
}
function renameAttackName($row, name) {
    const $input = $row.find('.quickedit-edit input[type="text"]');
    $input.val(name);
}
function submitAttackName($row) {
    const $button = $row.find('.quickedit-edit input[type="button"]');
    $button.click();
}


function RenameAttack(){
    let i = 0;
    $('tr.nowrap').each(function(){
        if ($.trim($(this).find('td')[0].innerText).includes(attackTranslated)){
            setTimeout(delayed, i*150,$(this));
            i++;
        }
    });
}

function delayed(param) {
    editAttackName(param);
    renameAttackName(param, getFinalString(param));
    submitAttackName(param);
}

function main(){
    $.ajax({
        type: 'GET',
        url: '/interface.php?func=get_config',
        dataType: 'xml',
        success: function(xml) {
            UnitSpeed = $(xml).find('unit_speed').text();
            WorldSpeed = $(xml).find('speed').text();

            RenameAttack();
        },
        error: function() {
            UI.ErrorMessage('An error occurred while processing XML file.');
        }
    });
}

main()