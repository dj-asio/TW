
/*      EDITOR: Asio
	SUPPORTED:
		{unit} : the type of unit that you have decided is on its way...
		{coords} : The coordinates of the originating village
		{player} : The originating player
		{duration} : The duration of the attack
		{distance} : The distance of the attack in fields
		{return} : The approximate return time - the attack will return at 0 milliseconds - but still not sure how the rounding or truncating occurs. Useful for back timing attacks.
		{attackID} : The attack ID	(##### {attack_id} on .NET #####)
		{sent} : The sent date and time
	TODO:
		{arrival} : The arrival date and time
		{origin} : The originating village in full name (xxx|yyy) KYX
		{destination} : The target village in full name (xxx|yyy) KYX
		{destinationxy} : The coordinates of the target village xxx|yyy
	TODO:
		Display world speed
		Display unit speed


	######################
	Client Launcher (live):
	######################

	// javascript:var UnitDefinition=["Ανιχνευτής","Ελαφρύ Ιππικό","Βαρύ Ιππικό","Τσεκούρι - Δόρυ","Ξίφος","Κριός - Καταπέλτης","***ΑΡΙΣΤΟΚΡΑΤΗΣ***"];$.getScript('ΕΠΙΚΟΙΝΩΝΣΤΕ ΜΕ asio ΓΙΑ ΤΟ LINK');void 0;
	javascript:var UnitDefinition=["spy",
"LC",
"HC",
"axe",
"sword",
"ram",
"***noble***"];$.getScript();void 0;
*/
(function() {
javascript:

    /*************************************************
     * begin code for configuration GUI
     * author: Nick Toby (cheesasaurus@gmail.com)
     * editor: Asio
     *************************************************/


window.RenamerRetro = window.RenamerRetro || {};

RenamerRetro.createTaggerGUI = function()
{
    var contentContainer = document.createElement('div');
    contentContainer.id = 'RenamerRetro_tag_config_container';
    contentContainer.style.display = 'block';
    contentContainer.style.position = 'fixed';
    contentContainer.style.zIndex = 5000;
    contentContainer.style.top = '60px'; //below top menu
    contentContainer.style.left = '10px';
    contentContainer.style.borderStyle = 'ridge';
    contentContainer.style.borderColor = 'brown';
    contentContainer.style.backgroundColor = '#f7eed3';

    /*==== title bar ====*/
    var titleBar = document.createElement('table');
    titleBar.style.backgroundColor = '#dfcca6';
    titleBar.insertRow(-1);
    titleBar.rows[0].insertCell(-1);
    titleBar.rows[0].insertCell(-1);
    titleBar.rows[0].cells[0].innerHTML = '<b>RenamerRetro. Ρυθμίσεις Περιεχομένου Ονοματολογίας Εντολών</b>';
    titleBar.rows[0].cells[0].width = '100%';
    titleBar.rows[0].cells[1].innerHTML = '<img src="graphic/delete.png" alt="X"/>';
    titleBar.rows[0].cells[1].style.cursor="pointer";
    titleBar.rows[0].cells[1].onclick = function(){$('#RenamerRetro_tag_config_container').remove()};
    titleBar.rows[0].cells[1].style.color = 'red';
    contentContainer.appendChild(titleBar);


    var content = document.createElement('div');
    content.id = 'RenamerRetro_tag_config';

    if(localStorage.getItem('RenamerRetro.slowTarget_taggerConfig'))
    {
        var options = JSON.parse(localStorage.getItem('RenamerRetro.slowTarget_taggerConfig'));
        content.config = options;
    }
    else
    {
        content.config = [];
        var options = [
            {
                name:'unit',
                description:'Το είδος της μονάδας, με την πιο αργή ταχύτητα, το οποίο επιλέξατε ότι περιλαμβάνεται στην εντολή-επίθεση',
                defaultLabel:' Μον:',
                enabled: true
            },
            {
                name:'coords',
                description:'Οι συντεταγμένες του χωριού από το οποίο προέρχεται η εντολή',
                defaultLabel:' Συν:',
                enabled: true
            },
            {
                name:'player',
                description:'Ο επιτιθέμενος παίκτης',
                defaultLabel:' Π:',
                enabled: true
            },
            {
                name:'duration',
                description:'Η διάρκεια της εντολής-επίθεσης',
                defaultLabel:' Δ:',
                enabled: false
            },
            {
                name:'distance',
                description:'Η απόσταση των χωριών επιτιθέμενου-αμυνόμενου με μονάδα μέτρησης τα πεδία στο χάρτη',
                defaultLabel:' Απ:',
                enabled: false
            },

            {
                name:'attackID',
                description:'Το ID της εντολής-επίθεσης',
                defaultLabel:' id:',
                enabled: true
            },
            {
                name:'sent',
                description:'Η ώρα και ημέρα την οποία στάλθηκε η εντολή-επίθεση',
                defaultLabel:' Σταλ:',
                enabled: false
            },



        ];
    }

    content.getFormat = function()
    {
        var theFormat = '';
        var inputs = this.getElementsByTagName('input');
        var rows = this.getElementsByTagName('tr');
        for(var i=0; i<7; i++){
            if(inputs[i*2].checked)
            {
                theFormat += inputs[i*2+1].value;
                theFormat += '{'+rows[i].optionData.name+'}';
            }
        }
        return theFormat;
    };

    content.preview = function()
    {
        document.getElementById('RenamerRetro_tag_preview').innerHTML = this.getFormat();
    };

    content.saveConfig = function()
    {
        var rows = this.getElementsByTagName('tr');
        for(var i=0; i<7; i++)
        {
            content.config[i] = rows[i].optionData;

        }

        localStorage.setItem('RenamerRetro.slowTarget_taggerConfig',JSON.stringify(this.config));
        localStorage.setItem('RenamerRetro.slowTarget_taggerFormat',this.getFormat());
        UI.InfoMessage('Οι ρυθμίσεις αποθηκεύτηκαν.<br/>Θα τεθούν σε εφαρμογή στην επόμενη ενεργοποίηση του script.',3000,'success');
    };

    /*==== preview ====*/
    var preview = document.createElement('span');
    preview.id = 'RenamerRetro_tag_preview';
    preview.innerHTML = 'RenamerRetro';
    content.innerHTML = '<b>Προεπισκόπηση: </b>';
    content.appendChild(preview);

    /*==== save button ====*/
    var saveButton = document.createElement('button');
    saveButton.onclick = function(){content.saveConfig();};
    saveButton.innerHTML = 'Αποθήκευση';
    content.appendChild(saveButton);

    /*==== config ====*/
    var optionsTable = document.createElement('table');
    optionsTable.id = 'RenamerRetro_config_table';

    for(var i=0;i<7;i++)
    {
        optionsTable.insertRow(-1);
        optionsTable.rows[i].optionData = options[i];
        optionsTable.rows[i].insertCell(-1);
        optionsTable.className = 'vis';

        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = options[i].enabled;
        checkbox.onchange = function()
        {
            content.preview();
            this.parentNode.parentNode.optionData.enabled = this.checked;
        };
        optionsTable.rows[i].cells[0].appendChild(checkbox);

        optionsTable.rows[i].insertCell(-1);
        var label = document.createElement('input');
        label.type = 'text';
        if(options[i].label)
            label.value = options[i].label;
        else
            label.value = options[i].defaultLabel;
        label.onkeyup = function(){
            content.preview();
            this.parentNode.parentNode.optionData.label = this.value;
        };
        optionsTable.rows[i].cells[1].appendChild(label);

        optionsTable.rows[i].insertCell(-1);
        optionsTable.rows[i].cells[2].innerHTML = options[i].description;

        optionsTable.rows[i].insertCell(-1);
        optionsTable.rows[i].cells[3].innerHTML = '<div style="width: 20px; height:20px; background-image: url(https://dl.dropboxusercontent.com/s/k72noq2wmx9ubap/Tsalkapone_sort_icon.jpg); cursor:move" class="qbhandle" title="Μετακινήστε τη γραμμή για να αλλάξετε σειρά στην ονοματολογία"> </div>';
    }

    content.appendChild(optionsTable);

    contentContainer.appendChild(content);
    document.getElementById('content_value').appendChild(contentContainer);
    $('#RenamerRetro_config_table > tbody').sortable({handle: '.qbhandle', placeholder: 'sortable-placeholder'});
    $('#RenamerRetro_config_table > tbody').on('sortstop', function(){content.preview()});

    content.preview();
};

RenamerRetro.createConfigButton = function()
{
    //code recycled from bre help button
    var RenamerRetro_menu = document.createElement('div');
    RenamerRetro_menu.style.textAlign = 'center';

    var RenamerRetro_menu_text = document.createElement('p');
    RenamerRetro_menu_text.style.fontSize = '9pt';
    RenamerRetro_menu_text.innerHTML = 'Ρυθμίσεις';
    RenamerRetro_menu_text.style.fontWeight = '700';
    RenamerRetro_menu_text.style.marginTop = '3px';
    RenamerRetro_menu_text.style.color = '#422301';
    RenamerRetro_menu.appendChild(RenamerRetro_menu_text);

    RenamerRetro_menu.style.background = 'url("http://cdn.fyletikesmaxes.gr/8.19/19813/graphic/index/iconbar-mc.png?0c9c1")';
    RenamerRetro_menu.style.height = '30px';
    RenamerRetro_menu.style.width = '80px';
    RenamerRetro_menu.style.display = 'block';
    RenamerRetro_menu.style.position = 'fixed';
    RenamerRetro_menu.style.left = '100%';
    RenamerRetro_menu.style.top = '100%';
    RenamerRetro_menu.style.marginTop = '-80px';
    RenamerRetro_menu.style.marginLeft = '-80px';
    RenamerRetro_menu.style.zIndex = '99999999999';

    RenamerRetro_menu.onmouseover = function(){this.style.background='url("http://cdn.fyletikesmaxes.gr/8.19/19813/graphic/index/iconbar-mc.png?0c9c1")'};
    RenamerRetro_menu.onmouseout = function(){this.style.background='url("http://cdn.fyletikesmaxes.gr/8.19/19813/graphic/index/iconbar-mc.png?0c9c1")'};


    RenamerRetro_menu.style.cursor = 'pointer';
    RenamerRetro_menu.onclick = function(){RenamerRetro.createTaggerGUI()};


    return document.body.appendChild(RenamerRetro_menu);
};

RenamerRetro.createConfigButton();
if(localStorage.getItem('RenamerRetro.slowTarget_taggerFormat'))
    theFormat = localStorage.getItem('RenamerRetro.slowTarget_taggerFormat');

/*************************************************
 * end code for configuration GUI
 * note: the remainder of code is CREDITED to Dale McKay
 *************************************************/

/* *************************************** */
// Borrowed plugin for converting XML to JSON
/* *************************************** */
if(!(window.main||self).jQuery.xml2json){
    /*
     ### jQuery XML to JSON Plugin v1.0 - 2008-07-01 ###
     * http://www.fyneworks.com/ - diego@fyneworks.com
     * Dual licensed under the MIT and GPL licenses:
     *   http://www.opensource.org/licenses/mit-license.php
     *   http://www.gnu.org/licenses/gpl.html
     ###
     Website: http://www.fyneworks.com/jquery/xml-to-json/
    */
    eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}(';5(10.M)(w($){$.N({11:w(j,k){5(!j)t{};w B(d,e){5(!d)t y;6 f=\'\',2=y,E=y;6 g=d.x,12=l(d.O||d.P);6 h=d.v||d.F||\'\';5(d.G){5(d.G.7>0){$.Q(d.G,w(n,a){6 b=a.x,u=l(a.O||a.P);6 c=a.v||a.F||\'\';5(b==8){t}z 5(b==3||b==4||!u){5(c.13(/^\\s+$/)){t};f+=c.H(/^\\s+/,\'\').H(/\\s+$/,\'\')}z{2=2||{};5(2[u]){5(!2[u].7)2[u]=p(2[u]);2[u][2[u].7]=B(a,R);2[u].7=2[u].7}z{2[u]=B(a)}}})}};5(d.I){5(d.I.7>0){E={};2=2||{};$.Q(d.I,w(a,b){6 c=l(b.14),C=b.15;E[c]=C;5(2[c]){5(!2[c].7)2[c]=p(2[c]);2[c][2[c].7]=C;2[c].7=2[c].7}z{2[c]=C}})}};5(2){2=$.N((f!=\'\'?A J(f):{}),2||{});f=(2.v)?(D(2.v)==\'16\'?2.v:[2.v||\'\']).17([f]):f;5(f)2.v=f;f=\'\'};6 i=2||f;5(k){5(f)i={};f=i.v||f||\'\';5(f)i.v=f;5(!e)i=p(i)};t i};6 l=w(s){t J(s||\'\').H(/-/g,"18")};6 m=w(s){t(D s=="19")||J((s&&D s=="K")?s:\'\').1a(/^((-)?([0-9]*)((\\.{0,1})([0-9]+))?$)/)};6 p=w(o){5(!o.7)o=[o];o.7=o.7;t o};5(D j==\'K\')j=$.S(j);5(!j.x)t;5(j.x==3||j.x==4)t j.F;6 q=(j.x==9)?j.1b:j;6 r=B(q,R);j=y;q=y;t r},S:w(a){6 b;T{6 c=($.U.V)?A 1c("1d.1e"):A 1f();c.1g=W}X(e){Y A L("Z 1h 1i 1j 1k 1l")};T{5($.U.V)b=(c.1m(a))?c:W;z b=c.1n(a,"v/1o")}X(e){Y A L("L 1p Z K")};t b}})})(M);',62,88,'||obj|||if|var|length||||||||||||||||||||||return|cnn|text|function|nodeType|null|else|new|parseXML|atv|typeof|att|nodeValue|childNodes|replace|attributes|String|string|Error|jQuery|extend|localName|nodeName|each|true|text2xml|try|browser|msie|false|catch|throw|XML|window|xml2json|nn|match|name|value|object|concat|_|number|test|documentElement|ActiveXObject|Microsoft|XMLDOM|DOMParser|async|Parser|could|not|be|instantiated|loadXML|parseFromString|xml|parsing'.split('|'),0,{}));
}

function fnPrint(msg){(window.main||self).$('body').append('<span>'+msg+'</span><br/>');}

function RenameAttack()
{
    var script={
        id:'2BE7DDA9-B592-407F-A494-8B244054455C',
        name:'Αναγνώριση και Μετονομασία Εντολών',
        version:1.01,
        minGameVersion:6.50,
        author:{
            name:'RenamerRetro',
            // email:'tsalkapone@hotmail.com',
            // url:'http://forum.fyletikesmaxes.gr/member.php?27574-tsalkapone'
        },
        // CREDIT:'Η αυθεντική έκδοση ανήκει στους slowTarget, dalesmckay, twcheese. Προσαρμόστηκε και τροποποιήθηκε για τον ελληνικό server από τον asio',
        runOnce:true
    };

    function fnAjax(url,method,params,type,isAsync,callback){
        var payload=null;

        (window.main||self).$.ajax({
            'async':isAsync,
            'url':url,
            'data':params,
            'dataType':type,
            'type':String(method||'GET').toUpperCase(),
            'error':function(req,status,err){throw(status);},
            'success':function(data,status,req){if(!isAsync){payload=data;}if(typeof(callback)=='function'){callback(data,status,req);}}
        });

        if(!isAsync){
            if(typeof(callback)=='function'){
                callback(payload);
            }

            return payload;
        }
    }

    function FetchUnitConfig()
    {
        var unitConfig = null;

        fnAjax('/interface.php','GET',{'func':'get_unit_info'},'xml',false,function(data,status,req){
            unitConfig=(window.main||self).$.xml2json(data);
        });

        return unitConfig;
    }

    var authorURL=script.author.url?('<a href="'+script.author.url+'" target="_blank">'+script.author.name+'</a>'):script.author.name;

    fnPrint('');
    fnPrint('=========================');
    fnPrint(authorURL + '. ' + script.name + ': έκδοση v' + script.version.toFixed(2) + (script.credit?('<br/>'+script.credit):''));
    fnPrint('=========================');

    if((typeof(theFormat)=='undefined')||((window.main||self).$.trim(theFormat)=='')){
        // theFormat = '{unit} ({coords}) {player} - id:{attackID}';
        // theFormat = '{unit} ({coords}) {player} - Επιστροφή:{return} - Στάλθηκε:{sent}';
        // theFormat = '{unit} ({coords}) {player} - Επιστ:{return} - Στάλ:{sent}'; // compact
        theFormat = '{unit} {coords} - R:{return} S:{sent}'; // most compact
    }
    fnPrint('<span style="font-weight:bold;">Διαμόρφωση: </span>'+theFormat);

    if((window.main||self).game_data.screen!='info_command'){
        throw('RenamerRetro. Αναγνώριση και Μετονομασία Εντολών \n\n Το συγκεκριμένο script ενεργοποιείται από τις πληροφορίες μιας εντολής');
    }

    var unitConfig = FetchUnitConfig();
    //fnPrint(JSON.stringify(unitConfig));

    c=theFormat;
    var p = UnitDefinition;

    function V() {
        return 1;
    }
    window.onerror = V;

    function Z() {
        d = (window.main || self).document;
        //aid = d.getElementById('editInput').parentNode.innerHTML.match(/id\=(\d+)/)[1];
        aid = $('#quickedit-rename').attr('data-id');

        function J(e) {
            vv = e.match(/\d+\|\d+/g);
            return (vv ? vv[vv.length - 1].match(/((\d+)\|(\d+))/) : null);
        }

        function K(e) {
            f = parseInt(e, 10);
            return (f > 9 ? f : '0' + f);
        }

        function L(g, e) {
            return g.getElementsByTagName(e);
        }

        function N(g) {
            return g.innerHTML;
        }

        function M(g) {
            return N(L(g, 'a')[0]);
        }

        function O() {
            return k.insertRow(E++);
        }

        function W(f) {
            return B.insertCell(f);
        }

        function P(g, e) {
            g.innerHTML = e;
            return g;
        }

        function X(e) {
            C = B.appendChild(d.createElement('th'));
            return P(C, e);
        }

        function Y(f) {
            return K(f / U) + ':' + K(f % (U) / T) + ':' + K(f % T);
        }
        U = 3600;
        T = 60;
        R = 'table';
        S = 'width';
        s = L(d, R);
        for (j = 0; j < s.length; j++) {
            s[j].removeAttribute(S);
            if (s[j].className == 'main') {
                s = L(L(s[j], 'tbody')[0], R);
                break;
            }
        }
        D = 0;
        for (j = 0; j < s.length; j++) {
            s[j].removeAttribute(S);
            if (s[j].className = 'vis') {
                k = s[j];
                if (t = k.rows) {
                    D = t.length;
                    break;
                }
            }
        }
        for (E = 0; E < D; E++) {
            l = t[E];
            m = (u = l.cells) ? u.length : 0;
            if (m) {
                u[m - 1].colSpan = 5 - m;
                if (N(u[0]) == 'Άφιξη:') {
                    Q = Date(N(u[1]).replace(/<.*/i, ''));
                } else {
                    if (N(u[0]) == 'Άφιξη σε:') {
                        v = N(u[1]).match(/\d+/ig);
                    }
                } if (E == 1) {
                    G = M(u[2]);
                }
                if (E == 2) {
                    w = J(M(u[1]));
                }
                if (E == 4) {
                    x = J(M(u[1]));
                }
            }
        }
        y = v[0] * U + v[1] * T + v[2] * 1;
        n = w[2] - x[2];
        o = w[3] - x[3];
        F = Math.sqrt(n * n + o * o);
        H = F.toFixed(2);
        E = D - 2;
        B = O();
        P(W(0), 'Απόσταση:').colSpan = 2;
        P(W(1), H + ' Πεδία').colSpan = 2;
        B = O();

        // headers
        X('Μονάδα');
        X('Στάλθηκε');
        X('Διάρκεια');
        X('Μετονομασία σε');

        c = c.replace(/\{coords\}/i, w[1]).replace(/\{distance\}/i, H).replace(/\{player\}/i, G); // this is the name string to work with

        //for each unit speed
        for (j in p) {
            z = Math.round([parseFloat(unitConfig.spy.speed), parseFloat(unitConfig.light.speed), parseFloat(unitConfig.heavy.speed), parseFloat(unitConfig.axe.speed), parseFloat(unitConfig.sword.speed), parseFloat(unitConfig.ram.speed), parseFloat(unitConfig.snob.speed)][j] * T * F);
            A = z - y;
            if (A > 0) {
                I = Y(z);
                B = O();

                // unit name
                P(W(0), p[j]);

                // sent
                P(W(1), A < T && 'μόλις τώρα' || A < U && Math.floor(A / T) + ' λεπτά πριν' || Y(A) + ' πριν');

                // duration
                P(W(2), I);

                // renaming interface
                C = W(3);

                var sentTime = new Date(arrivalTime.valueOf() - unitDurationSec * 1000);
                var returnTime = new Date(arrivalTime.valueOf() + unitDurationSec * 1000);

                var label = c
                    .replace(/\{duration\}/i, I)
                var label = c
                    .replace(/\{sent\}/i, sentTime.toString().replace(/^\w+\s*/i,''))
                    .replace(/\{return\}/i, returnTime.toString().replace(/^\w+\s*/i,''))
                    .replace(/\{unit\}/i, p[j])
                    .replace(/\{attackID\}/i, aid)
                    .replace(/\{attack_id\}/i, aid);

                // BBCode coloring for noble
                if(p[j].toLowerCase() === 'noble'){
                    label = label.replace(p[j], '[color=red][b]'+p[j]+'[/b][/color]');
                }
                var input = document.createElement('input');
                input.id = 'label_input_'+j;
                input.value = label;
                C.appendChild(input);

                var button = document.createElement('input');
                button.name = j;
                button.type = 'button';
                button.className = 'btn';
                button.value = 'OK';
                button.onclick = function() {
                    //rename the attack to the selected label
                    var label = $('#label_input_'+this.name).val();
                    $container = $('span[class*="quickedit"][data-id="'+ aid +'"]');
                    $container.find('.rename-icon').click();
                    $container.find('input[type=text]').val(label);
                    $container.find('input[type=button]').click();
                };
                C.appendChild(button);
            }
        }
    }
    Z();
}

try{
    RenameAttack();
    void(0);
}
catch(objError){
    var dbgMsg='<span style="font-weight:bold;">ΕΙΔΟΠΟΙΗΣΗ: </span>' + String(objError.message||objError);
    fnPrint('<span style="color:red;">'+dbgMsg+'</span>');
    alert((window.main||self).$('<span>'+dbgMsg+'</span>').text());
}
})();