class Popup{constructor(){this.storage=STORAGE,this.disableTransitionOninit(),this.initMaterialize(),this.initHandlers(),this.initStorage(),this.initListeners(),this.initGSB()}disableTransitionOninit(){let a=document.createElement("link");a.rel="stylesheet",a.href="./../css/disable_transition.css",document.head.appendChild(a),setTimeout(()=>{a.remove()},300)}initUI(){if(this.storage.country){let a=this.findItemByCode(this.storage.locations,this.storage.country);a&&($("#next_connect").children().eq(0).attr("src",`/img/flags/${a.country_code}.svg`),$("#next_connect").children().eq(1).html(a.country_name),this.setFlagIcon(a.country_code))}if(this.storage.settings.safeBrowsing?($("#safe_browsing_input").prop("checked",!0),$("#main .right-btns").addClass("gsb")):($("#safe_browsing_input").prop("checked",!1),$("#main .right-btns").removeClass("gsb")),this.storage.prevCountry){let a=this.findItemByCode(this.storage.locations,this.storage.prevCountry);this.setPrevCountry(a.country_code,a.country_name)}this.setCurrentLocation()}initGSB(){chrome.runtime.sendMessage({action:"checkAllLinks"},a=>{a&&a.links&&renderGSB(a.links,a.res)})}initMaterialize(){$(document).ready(function(){$(".tabs").tabs()})}initListeners(){chrome.storage.onChanged.addListener(a=>{if(this.storage)for(let b in a)"country"==b&&(this.storage[b]=a[b].newValue)}),chrome.runtime.onMessage.addListener(a=>{"gotIP"==a.action?(this.storage.vpnOn&&!document.body.classList.contains("error")&&!a.data.disabled&&chrome.runtime.sendMessage({action:"getConfig"},a=>{this.showConnectionInfo(),this.setPrevCountry(a.country),this.setState("connected")}),this.setCurrentLocation()):"gotIPError"==a.action?this.storage.vpnOn&&this.showError("No IP found, please reconnect"):"disconnected"==a.action?this.storage.auto?(this.disableTransitionOninit(),this.connectAutoPick()):this.storage.vpnOn&&this.showError("Server not found, please reconnect"):"connecting"==a.action?this.setState("connecting"):"connected"==a.action?(this.setState("connected"),this.setCurrentLocation(),this.showConnectionInfo()):"disable"==a.action?(this.setState("disconnected"),this.setCurrentLocation()):"rateus"==a.action&&this.openRateUs()})}initHandlers(){const a=$(document.body);a.on("change","#vpn-on",()=>{this.clearConnectionInfo(),this.storage.vpnOn?this.disconnect():this.connect()}),a.on("click","#rate",()=>{this.closeRateUs(),chrome.runtime.sendMessage({action:"rated"})}),a.on("click","#ratelater",()=>{this.closeRateUs(),chrome.runtime.sendMessage({action:"closeRatePopup"})}),a.on("click","#gsb .back-btn",()=>{$("#gsb").slideUp(150)}),a.on("click",".open-settings-dropdown-btn",function(){$("#settings").slideToggle(150,function(){$(this).css("display","flex")})}),a.on("click",".open-gsb-dropdown-btn",function(){$("#gsb").slideToggle(150,function(){$(this).css("display","flex")})}),a.on("click",".burger-menu .menu ul li",()=>{$("#open_hamburger").prop("checked",!1)}),a.on("click","#settings .back-btn",()=>{$("#settings").slideUp(150)}),$("#safe_browsing_input").on("input",a=>{let b={...this.storage.settings};b.safeBrowsing=a.target.checked,chrome.runtime.sendMessage({action:"checkAllLinks"},a=>{a&&a.links&&renderGSB(a.links,a.res)}),a.target.checked?$("#main .right-btns").addClass("gsb"):($("#main .right-btns").removeClass("gsb"),chrome.runtime.sendMessage({action:"safeBadge"})),this.setSettings(b)}),a.on("change","#any-location",a=>a.target.checked&&$(".x-select-item[value=\"NL\"]").trigger("click"))}initStorage(){chrome.runtime.sendMessage({action:"getConfig"},a=>{this.storage=a,this.initUI(),this.run()})}run(){this.initPopup()}setCurrentLocation(){chrome.runtime.sendMessage({action:"getConfig"},a=>{a.connectionInfo.ip?($("#location").removeClass("undefined"),$("#location").children().eq(0).attr("src",`/img/flags/${a.connectionInfo.code}.svg`),$("#location").children().eq(1).html(a.connectionInfo.country)):$("#location").children().eq(1).html("Unknown")})}initPopup(){document.body.classList.add("off");const a=this.storage.locations.map(a=>({title:a.country_name,value:a.country_code,premium:a.premium,quality:a.quality})).sort((c,a)=>c.title>a.title?1:-1).sort((c,a)=>c.premium!=a.premium&&c.premium?-1:c.premium!=a.premium||c.premium?void 0:1);this.storage.rateUsPopup&&this.openRateUs(),new XSelect("#country-select",a,this.storage.country,a=>{"auto"==a?this.connectAutoPick():(this.storage.country!=a||!this.storage.vpnOn)&&(this.clearConnectionInfo(),this.connect(a))}),this.storage.vpnOn?this.storage.isConnecting?this.setState("connecting"):(this.setState("connected"),this.setPrevCountry(this.storage.country)):this.setState(),this.showConnectionInfo()}setState(a){const b=document.body.classList;switch(b.remove("error"),a){case"connecting":b.remove("off"),b.remove("on"),b.add("loading"),this.clearConnectionInfo();break;case"connected":b.remove("loading"),b.remove("off"),b.add("on");break;case"disconnected":b.add("off"),b.remove("on"),b.remove("loading");break;case"error":b.remove("off"),b.remove("on"),b.add("error"),b.add("loading");break;default:b.remove("on"),b.remove("loading"),b.add("off");}}setSettings(a){chrome.runtime.sendMessage({action:"set_settings",from:"popup",settings:a})}showError(a){this.setState("error"),$("#error_text").html(a)}connect(a){this.storage.vpnOn=!0,chrome.runtime.sendMessage({action:"connect",from:"popup",country:a})}disconnect(){this.storage.vpnOn=!1,chrome.runtime.sendMessage({action:"disconnect",from:"popup"})}connectAutoPick(){let a=this.storage.locations.filter(a=>a.premium),b=a[Math.round(Math.random()*(a.length-1))];$("#next_connect").children().eq(0).attr("src",`/img/flags/${b.country_code}.svg`),$("#next_connect").children().eq(1).html(b.country_name),this.setFlagIcon(b.country_code),this.storage.country=b.country_code,this.connect(this.storage.country)}showConnectionInfo(a,b){chrome.runtime.sendMessage({action:"getConfig"},a=>{$("#ip_info").children().eq(0).html(a.connectionInfo.country),$("#ip_info").children().eq(1).html(a.connectionInfo.ip)})}setPrevCountry(a,b){b||(b=this.findItemByCode(this.storage.locations,a).country_name),$("#prev_country").children().eq(0).attr("src",`/img/flags/${a}.svg`),$("#prev_country").children().eq(1).html(b)}setFlagIcon(a){$("#flag_icon").attr("src",`/img/flags/${a}.svg`)}clearConnectionInfo(){$("#ip_info").children().eq(0).html(""),$("#ip_info").children().eq(1).html("")}findItemByCode(a,b){for(let c=0;c<a.length;c++)if(a[c].country_code==b)return a[c];return null}closeRateUs(){$("#rate_us").removeClass("open")}openRateUs(){$("#rate_us").addClass("open")}}const p=new Popup;