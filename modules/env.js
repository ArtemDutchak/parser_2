module.exports = {
  mail:{
    host: '',
    port: 465,
    secure: true,
    user: '',
    pass: ''
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
