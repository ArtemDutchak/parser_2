function renderGSB(a,b){let c="",d="",e=0,f=0;for(let g in a)"ok"==a[g]?(e++,c+=`                <div class="list-item link">                    <div class="icon">                        <img src="./img/verified.svg" alt="">                    </div>                    <div class="url">${g}</div>                </div>            `):(f++,d+=`                <div class="list-item link">                    <div class="icon">                        <img src="./img/error.svg" alt="">                    </div>                    <div class="url">${g}</div>                    <div class="info waves-effect">                        <img src="./img/info.svg" alt="">                    </div>                </div>            `);document.querySelector("#gsb .unsafe .items").innerHTML=d,document.querySelector("#gsb .safe .items").innerHTML=c,document.querySelector("#gsb .unsafe .title span").innerHTML=f,document.querySelector("#gsb .safe .title span").innerHTML=e,document.querySelector("#gsb .site-wrap .url").innerHTML=b.location.href,document.querySelector("#gsb .site-wrap .favicon").style.backgroundImage="url("+b.favicon+")"}