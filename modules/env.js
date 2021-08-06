module.exports = {
  mail:{
    host: 'n3plcpnl0280.prod.ams3.secureserver.net',
    port: 465,
    secure: true,
    user: 'watcher@parser.landingservice.site',
    pass: '74QpmJY5lHQ9'
  },
  window:{
    width: 1280,
    height: 720
  },
  interval:{
    watcher: 300000,
    last_watch_record: 3600000,
    scanning: 10000,
    tabs: 2000
  },
  timeout:{
    page_close: 240000,
    page_selector: 100000,
    axios_cancel: 5000
  },
  color:{
    default: '#66666610'
  }
}
