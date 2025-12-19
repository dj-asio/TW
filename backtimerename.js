var cookieName= "UniversalBack";

var WorldSpeed
var UnitSpeed

const domain = document.domain;

var tomorrowTranslated = "tomorrow";
var atTranslated = "at";
var prevUnit = "noble";
var explor = "spy";
var attackTranslated = "Attack";


var baseUnitSpeed = {
    "Noble" : 35,
    "B\351lier" : 30,
    "\311p\351e" : 22,
    "Hache" : 18,
    "Lourd" : 11,
    "L\351ger" : 10,
    "\311claireur" : 9,
}
var baseUnitSpeed = {
    "noble" : 35,
    "ram" : 30,
    "sword" : 22,
    "axe" : 18,
    "hcav" : 11,
    "lcav" : 10,
    "spy" : 9,
}
if(domain.includes("tribalwars.com.pt") || domain.includes("tribalwars.com.br")){
    tomorrowTranslated = "amanhã";
    atTranslated = "às";
    prevUnit = "nobre";
    explor = "btd";
    attackTranslated = "Ataque";
    baseUnitSpeed = {
        "nobre" : 35,
        "aríete" : 30,
        "espada" : 22,
        "machado" : 18,
        "cavp" : 11,
        "cavl" : 10,
        "btd" : 9,
    }
}
else if(domain.includes("tribalwars.net") || domain.includes("tribalwars.co.uk")){
    tomorrowTranslated = "tomorrow";
    atTranslated = "at";
    prevUnit = "noble";
    explor = "spy";
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
else if(domain.includes("guerretribale.fr")){
    tomorrowTranslated = "Demain";
    atTranslated = "le";
    prevUnit = "Noble";
    explor = "\311claireur";
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
}
else if(domain.includes("triburile.ro")){
    tomorrowTranslated = "mâine";
    atTranslated = "la";
    prevUnit = "GN";
    explor = "Spionează";
    attackTranslated = "Atac";

    baseUnitSpeed = {
        "GN" : 35,
        "Berbec" : 30,
        "Spadă" : 22,
        "Topor" : 18,
        "HCav" : 11,
        "LCav" : 10,
        "Spionează" : 9,
    }
}
else if(domain.includes("guerrastribales.es")){
    tomorrowTranslated = "mañana";
    atTranslated = "a las";
    prevUnit = "noble";
    explor = "Espía";
    attackTranslated = "Ataque";

    baseUnitSpeed = {
        "noble" : 35,
        "Ariete" : 30,
        "espada" : 22,
        "hacha" : 18,
        "lourde" : 11,
        "CAVL" : 10,
        "Espía" : 9,
    }
}
else if(domain.includes("tribalwars.nl")){
    tomorrowTranslated = "morgen";
    atTranslated = "om";
    prevUnit = "Edel.";
    explor = "Verk.";
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
}
else if(domain.includes("fyletikesmaxes.gr")){
    tomorrowTranslated = "αύριο";
    atTranslated = "στις";
    prevUnit = "Αριστοκράτης";
    explor = "Ανιχνευτής";
    attackTranslated = "Επίθεση";

    baseUnitSpeed = {
        "Αριστοκράτης" : 35,
        "Πολιορκητικός κριός" : 30,
        "Ξίφος" : 22,
        "Τσεκούρι" : 18,
        "Βαρ.ιππ." : 11,
        "Ελ.ιππ." : 10,
        "Ανιχνευτής" : 9,
    }
}
else if(domain.includes("divokekmeny.cz")){
    tomorrowTranslated = "zítřek";
    atTranslated = "v";
    prevUnit = "Šlechta";
    explor = "Špeh";
    attackTranslated = "Útok";

    baseUnitSpeed = {
        "Šlechta" : 35,
        "Beranidlo" : 30,
        "Meč" : 22,
        "Sekera" : 18,
        "TK" : 11,
        "LK" : 10,
        "Špeh" : 9,
    }
}
else if(domain.includes("plemiona.pl")){
    tomorrowTranslated = "jutro";
    atTranslated = "o";
    prevUnit = "Szlachcic";
    explor = "Zwiad";
    attackTranslated = "Atak";

    baseUnitSpeed = {
        "Szlachcic" : 35,
        "Taran" : 30,
        "Miecz" : 22,
        "Topór" : 18,
        "CK" : 11,
        "LK" : 10,
        "Zwiad" : 9,
    }
}
else if(domain.includes("voynaplemyon.com")){
    tomorrowTranslated = "завтра";
    atTranslated = "om";
    prevUnit = "Дворянин";
    explor = "Лазутчик";
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
else if(domain.includes("klanhaboru.hu")){
    tomorrowTranslated = "holnap"; // talvez n
    atTranslated = "om";
    prevUnit = "FN";
    explor = "Kém";
    attackTranslated = "Támadás";

    baseUnitSpeed = {
        "FN" : 35,
        "Kos" : 30,
        "Kard" : 22,
        "Bárdos" : 18,
        "NLov" : 11,
        "KLov" : 10,
        "Kém" : 9,
    }
}
else if(domain.includes("tribals.it")){
    tomorrowTranslated = "domani";
    atTranslated = "alle";
    prevUnit = "nobile";
    explor = "Esploratore";
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
else if(domain.includes("klanlar.org")){
    tomorrowTranslated = "yarın şu";
    atTranslated = "saat";
    prevUnit = "M";
    explor = "Casus";
    attackTranslated = "Saldırı";

    baseUnitSpeed = {
        "M" : 35,
        "Koçbaşı" : 30,
        "Kılıç" : 22,
        "Balta" : 18,
        "AA" : 11,
        "HA" : 10,
        "Casus" : 9,
    }
}
else if(domain.includes("tribalwars.ae")){
    atTranslated = " غدا";
    prevUnit = "نبيل";
    explor = "كشافة";
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
}


function getTimeLeftInSecond(row){
    var TimeString = $(row).find('td')[6].innerText;
    var split = TimeString.split(':');
    return parseInt(split[2])+60*parseInt(split[1])+3600*parseInt(split[0]);
}

function getSender(row){
    return $(row).find('td')[3].innerText; // TODO A Testzer
}

function getDistance(row){
    var coordAtt = getAttacker(row).split("|");
    var coordDef = getDefender(row).split("|");
    var exactDistance = Math.sqrt(Math.pow(parseInt(coordAtt[0])-parseInt(coordDef[0]),2) + Math.pow(parseInt(coordAtt[1])-parseInt(coordDef[1]),2));
    return exactDistance;
}
function getDefender(row){
    var a = $(row).find('td')[1].innerText; // TODO A Testzer
    tab = a.split(')');
    return tab[tab.length-2].split('(')[1];
}

function getAttacker(row){
    var a = $(row).find('td')[2].innerText; // TODO A Testzer
    tab = a.split(')');
    return tab[tab.length-2].split('(')[1];
}

function getTravelTimeInSecond(distance, unit){
    return Math.round(distance * (60*baseUnitSpeed[unit]/WorldSpeed/UnitSpeed));
}

function getBackTime(row){
    var impact = conversionImpacttoDate(row);
    var travel = getTravelTimeInSecond(getDistance(row), findAttackSpeed(row));
    var launchDate = new Date(impact.getFullYear(), impact.getMonth(), impact.getDate(), impact.getHours(), impact.getMinutes(), parseInt(impact.getSeconds())+travel);
    var dateStringSplit = launchDate.toString().split(" ");
    return dateStringSplit[1] + ". " + dateStringSplit[2] + ", " + dateStringSplit[4];
}


function findAttackSpeed(row){
    var TimeLeft = getTimeLeftInSecond(row);
    var distance = getDistance(row);
    var previousUnit = prevUnit;

    for(var unit in baseUnitSpeed){
        if(getTravelTimeInSecond(distance, unit)<TimeLeft) return previousUnit;
        previousUnit = unit;
    }
    return explor;
}


function getImpactTime(row){
    return  $(row).find('td')[5].innerText; // TODO A Testzer
}

function hasNumbers(t)
{
    return /\d/.test(t);
}


function conversionImpacttoDate(row){
    var impact = getImpactTime(row);
    console.log(impact + " oi");
    var tab = impact.split(" ");
    var dateActuelle = new Date();
    console.log(tab);
    var last = tab[tab.length-1];
    var index = tab.length-1;
    if(!hasNumbers(last)){
        index = index-1;
    }

    switch(tab[0]){
        case tomorrowTranslated:
            return new Date(dateActuelle.getFullYear(), dateActuelle.getMonth(), parseInt(dateActuelle.getDate())+1, tab[index].split(":")[0], tab[index].split(":")[1], tab[index].split(":")[2]);
        case atTranslated:
            return new Date(tab[1].split(".")[2], parseInt(tab[1].split(".")[1])-1, tab[1].split(".")[0],tab[3].split(":")[0], tab[3].split(":")[1], tab[3].split(":")[2]);
        default:
            return new Date(dateActuelle.getFullYear(), dateActuelle.getMonth(), parseInt(dateActuelle.getDate()), tab[index].split(":")[0], tab[index].split(":")[1], tab[index].split(":")[2]);

    }
    throw new Error("oops, error in data conversion")
}

function findAttackLaunch(row){
    var impact = conversionImpacttoDate(row);
    var travel = getTravelTimeInSecond(getDistance(row), findAttackSpeed(row));
    var launchDate = new Date(impact.getFullYear(), impact.getMonth(), impact.getDate(), impact.getHours(), impact.getMinutes(), parseInt(impact.getSeconds())-travel)
    var dateStringSplit = launchDate.toString().split(" ")
    return dateStringSplit[1] + ". " + dateStringSplit[2] + ", " + dateStringSplit[4]
}

function getFinalString(row){
    return findAttackSpeed(row) + " " + getAttacker(row) + " " + getSender(row) + " " + findAttackLaunch(row) + " | " + getBackTime(row)
}


//----------
function editAttackName($row) {
    var $button = $row.find('.rename-icon');
    $button.click();
}
function renameAttackName($row, name) {
    var $input = $row.find('.quickedit-edit input[type="text"]');
    $input.val(name);
}
function submitAttackName($row) {
    var $button = $row.find('.quickedit-edit input[type="button"]');
    $button.click();
}


function RenameAttack(){
    var i=0;
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