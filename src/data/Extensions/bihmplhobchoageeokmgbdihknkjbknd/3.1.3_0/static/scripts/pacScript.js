let WHITE_LIST = [
  "pixel.quantserve.com",
  "event.shelljacket.us",
  "api.hsselite.com",
  "order.hotspotshield.com",
  "google-analytics.com"
];

let PARAMS = {
  bypass:  [],
  global:  [],
  secured: {}
};

browser.runtime.onMessage.addListener((message) => {
  PARAMS = message;
});

function FindProxyForURL(url, host) {
  host = host.replace(/(www\.)?([^:]+)(:[0-9]+)?/, '$2');

  for(let k in WHITE_LIST) {
    if(host === WHITE_LIST[k]) return 'DIRECT';
  }

  if(PARAMS.bypass.length > 0 && PARAMS.bypass.indexOf(host) !== -1) return 'DIRECT';

  if(PARAMS.global.length > 0) {
    return concatRow(PARAMS.global);
  }

  for(let k in PARAMS.secured) {
    if(PARAMS.secured[k].domains.indexOf(host) !== -1) {
      return concatRow(PARAMS.secured[k].servers)
    }
  }

  return 'DIRECT';
}

function concatRow(servers) {
  let row = '';

  for(let k in servers) {
    row += ((servers[k].scheme==='http'?'proxy':'https')+' '+servers[k].address+':'+servers[k].port+'; ');
  }

  row += 'DIRECT';

  return row;
}