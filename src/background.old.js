'use strict'

import { app, protocol, BrowserWindow, BrowserView, ipcMain } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'
// const isDevelopment = true

const http = require('http');
const axios = require('axios');

const os = require("os");
const osu = require('node-os-utils');
const path = require('path');
const fs = require("fs");

import puppeteer from 'puppeteer-extra';
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// puppeteer.use(StealthPlugin());

const xlsx = require("node-xlsx");
const nodemailer = require('nodemailer');

import locale from "../modules/localization";
function $t(key){
  const l =  locale[main_settings.localization]
  return eval(`l.${key}`)
}

const env = require('../modules/env');
const desktop_path = path.join(require('os').homedir(), 'Desktop');
const data_folder = path.join(app.getPath('userData'), 'data');
const db_folder = path.join(data_folder, 'datastore');

let main_settings = require('../modules/main_settings');
const utilites = require('../modules/utilites').default;


if (!fs.existsSync(data_folder)){fs.mkdirSync(data_folder)}
import database from "../modules/database";
database.init(db_folder)



const Amazon_Com = require('../classes/AmazonCom.js')
const Amazon_Ca = require('../classes/AmazonCa.js')
const Walmart_Com = require('../classes/WalmartCom.js')
const Walmart_Ca = require('../classes/WalmartCa.js')
const BBB_Com = require('../classes/BBBCom.js')
const BBB_Ca = require('../classes/BBBCa.js')
const ParsingProcess = require('../classes/ParsingProcess.js')

const Resources = [
  new Amazon_Com(),
  new Amazon_Ca(),
  new Walmart_Com(),
  new Walmart_Ca(),
  new BBB_Com(),
  new BBB_Ca()
];

const Watcher = require('../classes/Watcher.js');
const watcher = new Watcher();

const ParsingProcesses = [];
let filter_sku_arr = []

let win
let compare
let browser

let scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
clearInterval(scan_interval);
let watcher_interval = setInterval(check_watchers, env.interval.watcher);
clearInterval(watcher_interval);


let pathToExtensionTouchVPN = path.resolve(path.join("src", "data", "Extensions", "bihmplhobchoageeokmgbdihknkjbknd", "3.1.5_0", '')); // TouchVPN
let pathToExtensionHoxxVPN = path.resolve(path.join("src", "data", "Extensions", "nbcojefnccbanplpoffopkoepjmhgdgh", "3.10.1_0", '')); // HoxxVPN


if (!isDevelopment) {
  pathToExtensionTouchVPN = path.resolve(path.join("resources", "data", "Extensions", "bihmplhobchoageeokmgbdihknkjbknd", "3.1.5_0", ''))
  pathToExtensionHoxxVPN = path.resolve(path.join("resources", "data", "Extensions", "nbcojefnccbanplpoffopkoepjmhgdgh", "3.10.1_0", ''))
}

let chromium_path = ''
const chromium_path_arr = {
  linux:[
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium'
  ],
  win32:[
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  ]
}

database.settings.find({name:'chrome_path'}).then(res => {
  if (res.success) {
    chromium_path = res.data.value
  }
})
if (!fs.existsSync(chromium_path)) {
  for (let chromium_path_var of chromium_path_arr[process.platform]) {
    if (fs.existsSync(chromium_path_var)) {
      database.settings.update({name:'chrome_path'},{$set:{value:chromium_path_var}},{}).then(res => {
        if (res.success) {chromium_path = chromium_path_var}
      })
    }
  }
}

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {

  win = new BrowserWindow({
    width: env.window.width,
    height: env.window.height,
    icon: path.resolve(path.join("build","icons","icon.png")),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true
    }
  })
  win.removeMenu()
  win.setMenuBarVisibility(false)
  win.maximize()

  if (process.env.WEBPACK_DEV_SERVER_URL) {

    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')

    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    if (compare !== null && compare !== undefined) {
      compare.close()
    }
    win = null
  })

  // compare = new BrowserWindow({
  //   width: 1200,
  //   height: 600,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     webviewTag: true
  //   },
  //   show: false
  // })
  // compare.hide();
  // compare.removeMenu();
  // compare.setMenuBarVisibility(false);
  // compare.maximize();
  // compare.webContents.openDevTools();
  //
  // compare.on('closed', function () {
  //   compare = null
  // })
}

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {

  if (win === null) {
    createWindow()
  }
})

app.on("web-contents-created", (event, contents) => {
  // console.log(contents)
})

app.whenReady().then(async () => {

    if (isDevelopment) {
      installExtension(VUEJS_DEVTOOLS)
          .then((name) => console.log(`Added Extension:  ${name}`))
          .catch((err) => console.log('An error occurred: ', err));
    }

    await deal_with_settings();
    await deal_with_amazon_listing();
    await deal_with_parsing_processes();
    await deal_with_scans();

    await delete_pairs_if_empty()

    await launch_browser();

    if (main_settings.watch_period) {
      // check_watchers()
      start_watching()
    }

    createWindow();


    // const products_res = await database.products.find({});
    // const product_count = products_res.data.length;
    // console.log('products: ', products_res.data.length);


    console.log('StealthPlugin: ', StealthPlugin.toString())

    const result = {
      amazon_ca: 0,
      amazon_com: 0,
      walmart_ca: 0,
      walmart_com: 0,
      bedbathandbeyond_ca: 0,
      bedbathandbeyond_com: 0,
    }
    // const result = {
    //   walmart_ca:{
    //     puppeteer: 0,
    //     electron: 0,
    //   },
    //   walmart_com:{
    //     puppeteer: 0,
    //     electron: 0,
    //   },
    // }

    // let page = await browser.newPage();
    // page = await setup_page(page);

    let passed = 0;
    let error = 0;

    // for (let i = 0; i < product_count; i++) {
    //
    //   await utilites.delay(1000);
    //   const product = products_res.data[i];
    //   const resource = find_resource({id:product.resource_id});
    //
    //   const html = await get_test_req(product);
    //
    //   if (!html) {
    //     error++ ;
    //     continue;
    //   }
    //   if (html == 'passed') {
    //     passed++;
    //   }
    //
    //   if (html && html.includes('Verify your identity') || html.includes('Are you human?') || html.includes('m not a robot')) {
    //     result[resource.alias]++;
    //   }
    //
    //   console.log(`${product_count} / ${i + 1} / ${product_count - (i + 1)} / ${passed} / ${error}`);
    //   if (i%10 == 0) {
    //     console.log(result);
    //   }
    // }
});

function get_test_req(product){
  return new Promise(async(resolve,reject) => {
    setTimeout(() => {resolve('passed');return;}, 60000);
    const resource = find_resource({id:product.resource_id});
    await compare.loadURL(product.url).catch(_=>{resolve(false);return;});
    const html = await compare.webContents.executeJavaScript(`
      function gethtml () {return new Promise((resolve, reject) => { resolve(document.body.innerHTML)})}
      gethtml();
      `).catch(_=>{resolve(false);return;});
    resolve(html);
  })
}
function start_watching(){
  watcher_interval = setInterval(check_watchers, env.interval.watcher)
}
function stop_watching(){
  if (watcher_interval) {
    clearInterval(watcher_interval)
  }
}


ipcMain.on('usage-stat-call', (e)=>{
  Promise.all([
    osu.cpu.usage(),
    osu.mem.info()
  ]).then(values => {
    let cpu = values[0]
    let ram = (100 - values[1].freeMemPercentage).toFixed(2)
    win.webContents.send('usage-stat-back', {cpu,ram})
  })
})
ipcMain.on('total-stat-call', (e)=>{
  Promise.all([
    osu.mem.free()
  ]).then(values => {
    let ram = (values[0].totalMemMb / 1000).toFixed(2)
    if (process.platform === 'win32') {
      ram = (values[0].totalMemMb).toFixed(2)
    }
    win.webContents.send('total-stat-back', {
      ram,
      cores: osu.cpu.count()
    })
  })
})
ipcMain.on('move_pairs',async function(e, data){
  let new_list_id = data.list_id
  if (!new_list_id) {
    const new_list_res = await database.lists.insert({
      name:data.list_name,
      color: env.color.default,
      sort_order: 0
    })
    new_list_id = new_list_res.data[0]._id
  }
  let res = await database.pairs.find({_id:{$in: data.pair_ids}})
  for (const pair of res.data) {
    if (pair.list_ids.length == 1) {
      pair.list_ids = [new_list_id]
    }else{
      for (const list_id of data.showed_list_ids) {
        pair.list_ids.splice(pair.list_ids.indexOf(list_id), 1)
      }
      if (!pair.list_ids.includes(new_list_id)) {
        pair.list_ids.push(new_list_id)
      }
    }
    await database.pairs.update({
      _id: pair._id,
    },{$set:{
      list_ids: pair.list_ids,
    }},{})
  }
  const output = await get_results_to_show(data.showed_list_ids)
  win.webContents.send('results_to_show', output)
  await database.pairs.compact(500)
})

ipcMain.on('copy_pairs',async function(e, data){
  let new_list_id = data.list_id
  if (!new_list_id) {
    const new_list_res = await database.lists.insert({
      name:data.list_name,
      color: env.color.default,
      sort_order: 0
    })
    new_list_id = new_list_res.data[0]._id
  }
  let res = await database.pairs.find({_id:{$in: data.pair_ids}})
  for (const pair of res.data) {
    if (!pair.list_ids.includes(new_list_id)) {
      pair.list_ids.push(new_list_id)
      await database.pairs.update({
        _id: pair._id,
      },{$set:{
        list_ids: pair.list_ids,
      }},{})
    }
  }
  const output = await get_results_to_show(data.showed_list_ids)
  win.webContents.send('results_to_show', output)
  await database.pairs.compact(500)
})
ipcMain.on('delete_pairs',async function(e, data){

  let res = await database.pairs.find({_id:{$in: data.pair_ids}})
  for (const pair of res.data) {

    for (const list_id of data.showed_list_ids) {
      pair.list_ids.splice(pair.list_ids.indexOf(list_id), 1)
    }

    await database.pairs.update({
      _id: pair._id,
    },{$set:{
      list_ids: pair.list_ids,
    }},{})

  }

  const output = await get_results_to_show(data.showed_list_ids)
  win.webContents.send('results_to_show', output)
  await database.pairs.compact(500)
})
ipcMain.on('refresh_parsing_processes', async (e)=>{
  win.webContents.send('parsing_processes_from_server_to_app', await get_parsing_processes_wo_watcher())
})
ipcMain.on('refresh_localization',async function(e){
  win.webContents.send('set_localization', main_settings.localization)
})
ipcMain.on('switch_lang',async function(e, lang){
  let res = await database.settings.update({
    name: 'localization',
  },{$set:{
    value: lang,
  }},{})
})
ipcMain.on('refresh_settings',async function(e){
  win.webContents.send('settings_from_server_to_app', await get_settings())
})
ipcMain.on('save_setting',async function(e, setting, data=[]){
  let res = await database.settings.update({
    _id: setting._id,
  },{$set:{
    value: setting.value,
  }},{})
  await deal_with_settings()

  const profit_settings = [
    'walmart_ca_delivery',
    'walmart_ca_free_shipping_on',
    'walmart_com_delivery',
    'walmart_com_free_shipping_on',
    'bedbathandbeyond_ca_delivery',
    'bedbathandbeyond_ca_free_shipping_on',
    'bedbathandbeyond_com_delivery',
    'bedbathandbeyond_com_free_shipping_on',
    'amazon_ca_taxes',
    'amazon_com_taxes',
  ]

  const result_settings = [
    'match_profit',
    'hide_exeption',
    'hide_amazon_listing',
    'hide_inaddible',
    'hide_listed',
    'match_identity',
    'amazon_rank_only',
    'match_only',
    'min_identity',
    'max_dif_price',
    'min_dif_price',
    'max_dif_percentage',
    'min_dif_percentage',
  ]

  if (profit_settings.includes(setting.name)) {
    const pair_count = await update_pairs_profit();
    await database.pairs.compact()
  }

  if (result_settings.includes(setting.name) && data.length) {

    if (data.includes('amazon_listing')) {
      const output = await get_amazon_listing_to_show();
      win.webContents.send('amazon_listing_to_show', output);
    }else if (data.includes('favorites')) {
      const output = await get_favorites_to_show();
      win.webContents.send('favorites_to_show', output);
    }else{
      const output = await get_results_to_show(data);
      win.webContents.send('results_to_show', output);
    }

  }

  // if (setting.name == 'watch_period') {
  //   if (setting.value) {
  //     stop_watching()
  //     start_watching()
  //   }else{
  //     stop_watching()
  //   }
  // }

  win.webContents.send('settings_from_server_to_app', await get_settings())
})
function update_pairs_profit(){
  return new Promise(async (resolve)=>{
    let res = await database.pairs.find({})
    if (res.success) {
      for (const pair of res.data) {

        if (!pair.hasOwnProperty('product_1_id') || !pair.hasOwnProperty('product_2_id')) {
          await database.pairs.remove({
            _id: pair._id
          })
        }
        continue;

        const profit_name_identity = await get_profit_name_identity(pair)
        await database.pairs.update({
          _id: pair._id,
        },{$set:{
          profit: profit_name_identity.profit,
          profit_perc: profit_name_identity.profit_perc,
          identity: profit_name_identity.identity,
        }},{})

      }
      resolve(res.data.length);return
    }
    resolve(0)
  })
}
function get_profit_name_identity(pair){
  return new Promise(async (resolve) => {
    if (!pair.hasOwnProperty('product_1')) {
      let product_1_res = await database.products.find({_id:pair.product_1_id});
      pair.product_1 = product_1_res.data[0];
    }
    if (!pair.hasOwnProperty('product_2')) {
      let product_2_res = await database.products.find({_id:pair.product_2_id});
      pair.product_2 = product_2_res.data[0];
    }
    const profit_name_identity = get_profit_name_identity_by_db_products(pair.product_1, pair.product_2);
    resolve(profit_name_identity);
  })
}
function get_match_exeption_favorite_rank(pair){
  return new Promise(async (resolve) => {
    let product_1_res = await database.products.find({_id:pair.product_1_id});
    let product_2_res = await database.products.find({_id:pair.product_2_id});
    const product_1 = product_1_res.data[0];
    const product_2 = product_2_res.data[0];
    const match_exeption_favorite_rank = await get_match_exeption_favorite_rank_by_db_products(product_1, product_2);
    resolve(match_exeption_favorite_rank);
  })
}
ipcMain.on('add_custom_urls',async function(e, url_1, url_2){
  const res = await database.custom_urls.find({
    url_1,
    url_2
  });
  if (res.success) {
    if (res.data.length) {
      win.webContents.send('msg_from_server',{
        type: 'error',
        text: 'URL pair exists'
      });
    }else{
      await database.custom_urls.insert({
        url_1,
        url_2,
      });
      win.webContents.send('custom_urls_from_server_to_app', await get_custom_urls());
    }
  }
})
ipcMain.on('refresh_custom_urls',async function(e){
  win.webContents.send('custom_urls_from_server_to_app', await get_custom_urls())
})
ipcMain.on('scan_selected_custom_urls',async function(e, url_pairs){
  let name = '';
  if (url_pairs.length == 1) {
    name += $t('title.custom_pair_scan');
  }else{
    name += $t('title.custom_pairs_scan');
  }
  name += ' ' + utilites.get_date();
  const parsing_process = new ParsingProcess({name});
  await parsing_process.update();
  for (const url_pair of url_pairs) {
    const record = {
      url_1: url_pair.url_1,
      url_2: url_pair.url_2,
      process_id: parsing_process.id,
      parsed: 'new'
    };
    const in_scan_array = await is_in_scan_array(record);
    if (!in_scan_array) {
      await database.scans.insert(record);
    }
  }
  if (parsing_process.scan_status_id == 1) {
    await parsing_process.set_process_status(2);
    if (scan_interval._destroyed) {
      scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
    }
  }
})
ipcMain.on('delete_selected_custom_urls',async function(e, data){
  for (const custom_pair_id of data) {
    await database.custom_urls.remove({_id:custom_pair_id})
  }
  await database.custom_urls.compact(500)
  win.webContents.send('custom_urls_from_server_to_app', await get_custom_urls())
})
ipcMain.on('add_new_category',async function(e, category_name, category_url){
  const resource = find_resource({category_url});
  if (resource && resource.id) {
    await database.categories.insert({
      name: category_name,
      url: category_url,
      resource_id: resource.id,
      color: env.color.default,
      sort_order: 0
    })
    win.webContents.send('categories_from_server_to_app', await get_categories());
  }else{
    // win.webContents.send('error_source')
  }
})
ipcMain.on('refresh_categories',async function(e){
  win.webContents.send('categories_from_server_to_app', await get_categories())
})
ipcMain.on('refresh_lists',async function(e){
  win.webContents.send('lists_from_server_to_app', await get_lists())
})
ipcMain.on('resort_categories',async function(e, data){
  let sort_order = 10
  for (const category_id of data) {
    let res = await database.categories.update({
        _id: category_id,
      },{$set:{
        sort_order,
      }},{})
    sort_order = sort_order + 10
  }
  win.webContents.send('categories_from_server_to_app', await get_categories())
  await database.categories.compact(500)
})
ipcMain.on('resort_lists',async function(e, data){
  let sort_order = 10
  for (const list_id of data) {
    let res = await database.lists.update({
        _id: list_id,
      },{$set:{
        sort_order,
      }},{})
    sort_order = sort_order + 10
  }
  win.webContents.send('lists_from_server_to_app', await get_lists())
  await database.lists.compact(500)
})

ipcMain.on('union_selected_lists',async function(e, data){
  if (data.length > 1) {
    const new_list_res = await database.lists.insert({
      name: $t('title.united_list') + ' ' + utilites.get_date(),
      color: env.color.default,
      sort_order: 0
    })
    const new_list_id = new_list_res.data[0]._id

    const affected_pairs_res = await database.pairs.find({list_ids: { $in: data }})

    for (const pair of affected_pairs_res.data) {
      if (pair.list_ids.length == 1) {
        pair.list_ids = [new_list_id]
      }else{
        for (const list_id of data) {
          pair.list_ids.splice(pair.list_ids.indexOf(list_id), 1)
        }
        pair.list_ids.push(new_list_id)
      }
      await database.pairs.update({
        _id: pair._id,
      },{$set:{
        list_ids: pair.list_ids,
      }},{})
    }

    for (const list_id of data) {
      await database.lists.remove({_id:list_id})
    }

    win.webContents.send('lists_from_server_to_app', await get_lists())
    await database.lists.compact(500)
    await database.pairs.compact(500)
  }
})
ipcMain.on('refresh_pair',async function(e, pair, update_pair = true){
  const exeption = await is_state('exeptions', pair.product_1_id, pair.product_2_id);
  const product_1_res = await database.products.find({_id:pair.product_1_id});
  const product_1 = product_1_res.data[0];
  pair.product_1 = product_1
  if (exeption) {
    await require_browser();
    let page = await browser.newPage();
    await setup_page(page);
    const resource_1_id = product_1.resource_id;
    let resource_2_id = 0;
    if (resource_1_id == 3 || resource_1_id == 5) {
      resource_2_id = 1;
    }else if (resource_1_id == 4 || resource_1_id == 6) {
      resource_2_id = 2;
    }
    if (!resource_2_id) {return;}
    const resource_1 = find_resource({id:resource_1_id});
    const resource_2 = find_resource({id:resource_2_id});
    let product_1_info = false;
    const product_1_info_res = await resource_1.scan_product(page, {url:product_1.url});
    if (product_1_info_res.success) {
      product_1_info = product_1_info_res.data;
      await add_or_update_product(product_1_info);
    }else{
      if (product_1_info_res.error.includes('captcha')) {
        console.log('captcha 619');
      }
    }
    let product_2_info = false;
    const product_2_info_res = await resource_2.find_product(page, product_1);
    if (product_2_info_res.success) {
      product_2_info = product_2_info_res.data;
      await add_or_update_product(product_2_info);
      const new_product_id = await add_or_update_product(product_2_info);
      await replace_pair_full(pair.product_1_id, pair.product_2_id, new_product_id);
    }else{
      if (product_2_info_res.error.includes('captcha')) {
        console.log('captcha 631');
      }
    }
    await page.close().catch(e => {});
    page = null;
  }else{
    await scan_one_pair(pair, false);
  }
})
ipcMain.on('show_favorites',async function(e, data){
  filter_sku_arr = []
  const output = await get_favorites_to_show()
  win.webContents.send('favorites_to_show', output)
})
ipcMain.on('set_favorites_page',async function(e, currentPage){
  const output = await get_favorites_to_show(currentPage)
  win.webContents.send('favorites_to_show', output)
})
ipcMain.on('show_amazon_listing',async function(){
  filter_sku_arr = [];
  const output = await get_amazon_listing_to_show();
  win.webContents.send('amazon_listing_to_show', output);
})
ipcMain.on('set_amazon_listing_page',async function(e, currentPage){
  const output = await get_amazon_listing_to_show(currentPage)
  win.webContents.send('amazon_listing_to_show', output)
})
ipcMain.on('show_selected_custom_results',async function(e, data){
  const output = await get_results_to_show(data)
  win.webContents.send('custom_results_to_show', output)
})
ipcMain.on('set_result_page',async function(e, data, currentPage){
  const output = await get_results_to_show(data, currentPage)
  win.webContents.send('custom_results_to_show', output)
})
ipcMain.on('resort_parsing_processes',async function(e, data){
  let sort_order = 10
  for (const parsing_proces_id of data) {
    let res = await database.parsing_processes.update({
        _id: parsing_proces_id,
      },{$set:{
        sort_order,
      }},{});
    sort_order = sort_order + 10;
  }
  win.webContents.send('parsing_processes_from_server_to_app', await get_parsing_processes_wo_watcher())
  await database.parsing_processes.compact(500);
})
ipcMain.on('show_selected_results',async function(e, data){
  filter_sku_arr = [];
  const output = await get_results_to_show(data);
  win.webContents.send('results_to_show', output);
})
ipcMain.on('set_process_status',async function(e, data){
  const parsing_process = new ParsingProcess({
    _id: data.process_id
  });
  await parsing_process.set_process_status(data.scan_status_id);
  await parsing_process.update();
  win.webContents.send('update_parsing_process', parsing_process.info());

  if (scan_interval._destroyed && data.scan_status_id == 2) {
    scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
  }

})
ipcMain.on('refresh_process',async function(e, data){
  const parsing_process = new ParsingProcess({
    _id: data.process_id
  });
  await parsing_process.refresh();
  await parsing_process.set_process_status(2);
  await parsing_process.update();
  win.webContents.send('update_parsing_process', parsing_process.info());

  if (scan_interval._destroyed) {
    scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
  }

})

ipcMain.on('refresh_amazon_listing_item',async function(e, watcher_id){
  await require_browser();
  let page = await browser.newPage();
  await setup_page(page);
  try {
    const new_record = await watch_by_id(page, watcher_id, false);
    win.webContents.send('update_listed', {
      watcher_id,
      source_products: new_record.source_products,
      listing_info: new_record.listing_info,
      record_time: new Date()
    });
  }catch (e) {
      console.log('error:check_watchers', e)
  } finally {
    await page.evaluate(() => window.stop()).catch(e => {
      // console.log(e)
    })
    await page.close().catch(e => {
      // console.log(e)
    })
    page = null
    database.watch_records.compact()
  }
})
function watch_by_id(page, watcher_id, with_notification = true){
  return new Promise(async (resolve) => {
    let amazon_product = false;
    let source_pairs = [];

    let res = await database.products.find({_id:watcher_id});
    if (res.success) {
      if (res.data.length) {
        amazon_product = res.data[0];
      }
    }

    if (!amazon_product) {
      resolve(false);return;
    }

    res = await database.pairs.find({
      product_2_id:watcher_id,
      match: true
    })
    if (res.success) {
      if (res.data.length) {
        source_pairs = res.data
      }
    }
    if (!source_pairs.length) {
      resolve(false);return
    }

    const resource = find_resource({id:amazon_product.resource_id});
    const amazon_info_res = await resource.scan_product_with_listing_info(page, amazon_product.id);
    if (!amazon_info_res.success) {
      resolve(false);return;
    }
    const amazon_info = amazon_info_res.data;
    let amazon_product_info = amazon_info.product_info;
    let listing_info = amazon_info.listing_info;

    if (!amazon_product_info) {
      resolve(false);return;
    }

    await add_or_update_product(amazon_product_info);

    const source_products = [];
    for (const source_pair of source_pairs) {
      let source_product_res = await database.products.find({_id:source_pair.product_1_id});
      if (source_product_res.success) {
        if (source_product_res.data.length) {
          let db_product = source_product_res.data[0];
          const source_resource = find_resource({id:db_product.resource_id});
          let source_product_info = false;
          const source_product_info_res = await source_resource.scan_product(page, {url:db_product.url});
          if (source_product_info_res.success) {
            source_product_info = source_product_info_res.data;
            await add_or_update_product(source_product_info);
          }else{
            if (source_product_info_res.error.includes('captcha')) {
              console.log('captcha 795');
            }
          }
          if (source_product_info) {
            await add_or_update_product(source_product_info);
            db_product.updatedAt = new Date();
          }
          source_products.push(db_product);

        }
      }
    }

    if (listing_info) {

      let store_place = 0;
      for (let i = 0; i < listing_info.length; i++) {
        if (listing_info[i].seller.toLowerCase().trim() == main_settings.amazon_store_name.toLowerCase().trim()) {
          store_place = i + 1;
        }
      }

      const new_record = {
        id: watcher_id,
        listing_info,
        source_products,
        amazon_product:{
          _id: watcher_id,
          id: amazon_product_info.id,
          name: amazon_product_info.name,
          image: amazon_product_info.image,
          resource_id: amazon_product_info.resource_id,
          status: amazon_product_info.status,
          price: amazon_product_info.price
        },
        store_place
      }

      await database.watch_records.remove({id: watcher_id},{multi: true});
      await database.watch_records.insert(new_record);

      resolve(new_record);return;
    }
    resolve(true);
  })
}

ipcMain.on('remove_process',async function(e, data){
  const parsing_process = new ParsingProcess({
    _id: data.process_id
  });
  await parsing_process.remove_process();
  win.webContents.send('parsing_processes_from_server_to_app', await get_parsing_processes_wo_watcher());
})



ipcMain.on('test_script',async function(e, data){

  // check_watchers();return;

  // return new Promise(async(resolve,reject) => {
  //   setTimeout(() => {resolve('passed');return;}, 60000);
  //   const resource = find_resource({id:product.resource_id});
  //   await compare.loadURL(product.url).catch(_=>{resolve(false);return;});
  //   const html = await compare.webContents.executeJavaScript(`
  //     function gethtml () {return new Promise((resolve, reject) => { resolve(document.body.innerHTML)})}
  //     gethtml();
  //     `).catch(_=>{resolve(false);return;});
  //   resolve(html);
  // })


  await require_browser();
  let page = await browser.newPage();
  await setup_page(page);

  // const cookies = await page.cookies();
  // await page.deleteCookie(...cookies);

  const resource_class = require('../classes/WalmartCa.js');
  const category_url = 'https://www.walmart.ca/en/personal-care/bath-and-body-care/body-wash-and-shower-gel/N-4076';

  await compare.loadURL(category_url).catch(_=>{});
  const html = await compare.webContents.executeJavaScript(`
    function gethtml () {return __PRELOADED_STATE__}
    gethtml();
    `).catch(_=>{});

      console.log(html)

  let out = {};

  try {
    const resource = new resource_class();
    const out_res = await resource.get_page_product(page, category_url);
    console.log(out_res);
  } catch (e) {
    console.log(e);
  } finally {
    await page.close().catch(e => {console.log(e)})
    page = null;
    console.log(out);
  }
})

ipcMain.on('filter_by_sku',async function(e, data){
  filter_sku_arr = data.filter_sku_arr
  if (data.list_ids.includes('amazon_listing')) {
    const output = await get_amazon_listing_to_show()
    win.webContents.send('amazon_listing_to_show', output)
  }else if (data.list_ids.includes('favorites')) {
    const output = await get_favorites_to_show()
    win.webContents.send('favorites_to_show', output)
  }else{
    const output = await get_results_to_show(data.list_ids)
    win.webContents.send('results_to_show', output)
  }
})
ipcMain.on('toggle_state',async function(e, data, update_pair = true){
  switch (data.type) {
    case 'match':
      send_match_exeption_to_remote(data)
      if (data.state) {
        await database.matches.insert({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.exeptions.remove({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.pairs.update({product_1_id: data._id_1, product_2_id: data._id_2},
          {$set:{
            match: true,
            exeption: false,
          }},{})
      }else{
        await database.matches.remove({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.pairs.update({product_1_id: data._id_1, product_2_id: data._id_2},
          {$set:{
            match: false,
          }},{})
      }
      database.matches.compact()
      break;
    case 'exeption':
      send_match_exeption_to_remote(data)
      if (data.state) {
        await database.exeptions.insert({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.matches.remove({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.pairs.update({product_1_id: data._id_1, product_2_id: data._id_2},
          {$set:{
            match: false,
            exeption: true,
          }},{})
      }else{
        await database.exeptions.remove({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.pairs.update({product_1_id: data._id_1, product_2_id: data._id_2},
          {$set:{
            exeption: false,
          }},{})
      }
      database.exeptions.compact()
      break;
    case 'favorite':
      if (data.state) {
        await database.favorites.insert({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.pairs.update({product_1_id: data._id_1, product_2_id: data._id_2},
          {$set:{
            favorite: true,
          }},{})
      }else{
        await database.favorites.remove({product_1_id: data._id_1, product_2_id: data._id_2})
        await database.pairs.update({product_1_id: data._id_1, product_2_id: data._id_2},
          {$set:{
            favorite: false,
          }},{})
      }
      database.favorites.compact()
      break;
    case 'amazon_listing':
      if (data.state) {
        await database.amazon_listing.insert({id: data._id_2})
        await database.pairs.update({product_2_id: data._id_2},
          {$set:{
            amazon_listing: true,
          }},{multi: true})
      }else{
        await database.amazon_listing.remove({id: data._id_2},{multi: true})
        await database.watchers.remove({_id: data._id_2})
        await database.watch_records.remove({id: data._id_2},{multi: true})
        database.watchers.compact()
        database.watch_records.compact()
        await database.pairs.update({product_2_id: data._id_2},
          {$set:{
            amazon_listing: false,
            watch: false,
          }},{multi: true})
      }
      database.amazon_listing.compact()
      break;
    case 'inaddible':
      if (data.state) {
        await database.inaddible.insert({id: data._id_2})
        await database.pairs.update({product_2_id: data._id_2},
          {$set:{
            inaddible: true,
          }},{multi: true})
      }else{
        await database.inaddible.remove({id: data._id_2},{multi: true})
        await database.pairs.update({product_2_id: data._id_2},
          {$set:{
            inaddible: false,
          }},{multi: true})
      }
      database.inaddible.compact()
      break;
    case 'watch':
      if (data.state) {
        await database.watchers.insert({_id: data._id_2})
      }else{
        await database.watchers.remove({_id: data._id_2})
      }
      await database.pairs.update({product_2_id: data._id_2},
        {$set:{
          watch: data.state,
        }},{multi: true})

      database.watchers.compact()
      database.watch_records.compact()
      break;
  }

  if (update_pair) {
    update_pair_state(data._id_1, data._id_2)
  }

})
async function update_pair_state(product_1_id, product_2_id){

  let res = await database.pairs.find({product_1_id, product_2_id})
  if (res.success) {
    if (res.data.length) {

      win.webContents.send('update_pair_state', {
        _id: res.data[0]._id,
        product_1_id,
        product_2_id,
        match: res.data[0].match,
        exeption: res.data[0].exeption,
        favorite: res.data[0].favorite,
        amazon_listing: res.data[0].amazon_listing,
        inaddible: res.data[0].inaddible,
        watch: res.data[0].watch
      })

    }
  }
}

async function send_match_exeption_to_remote(data){
  return new Promise(async (resolve) => {

    const send_data = await format_match_exeption_for_remote(data)

    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    const helper = setTimeout(()=>{
      if (source) {
        source.cancel('Too long')
        resolve([])
        return
      }
    }, env.timeout.axios_cancel)

    if (send_data) {
      axios.post('http://parser.just-for-testing.website/add_data', send_data, {
        cancelToken: source.token
      })
      .then((res) => {
        resolve(true)
        return
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('send_match_exeption_to_remote canceled', error.message);
        } else {
          resolve(false);return
        }
      })
    }else{
      resolve(false)
      return
    }

  })
}
async function format_match_exeption_for_remote(data){
  return new Promise(async (resolve) => {

    let out = false

    const product_1_res = await database.products.find({_id:data._id_1})
    const product_2_res = await database.products.find({_id:data._id_2})

    if (product_1_res.success && product_2_res.success) {
      if (product_1_res.data.length && product_2_res.data.length) {

        const product_1 = product_1_res.data[0]
        const product_2 = product_2_res.data[0]

        out = {
          type: data.type,
          sku_1: product_1.id,
          sku_2: product_2.id,
          resource_1_id: product_1.resource_id,
          resource_2_id: product_2.resource_id,
          state: data.state,
        }

      }
    }

    resolve(out)

  })
}

ipcMain.on('scan_selected_categories',async function(e, data){

  await require_browser();

  let name = '';
  if (data.length == 1) {
    name += $t('title.category_scan');
  }else{
    name += $t('title.categories_scan');
  }
  name += ' ' + utilites.get_date();

  const parsing_process = new ParsingProcess({name});
  await parsing_process.update();

  // parsing_process.set_scan_status('captcha');

  let page = await browser.newPage();
  await setup_page(page);

  try{

    // page.setMaxListeners(100);

    for (const scanned_category_id of data) {
      for (const category of await get_categories()) {
        if (scanned_category_id == category._id) {

          const resource = find_resource({id:category.resource_id});
          const products_res = await resource.get_category_products(page, category.url);

          if (!products_res.success) {
            if (products_res.error.includes('captcha')) {
              pause_if_captcha();
            }
          }

          const products_length = products_res.data.length;

          if (products_length) {

            const request_portion = 50;
            const requests_count = Math.ceil(products_length / request_portion);
            for (let i = 0; i < requests_count; i++) {
              const start = i * request_portion;
              const end = start + request_portion;
              await add_products_to_remote(products_res.data.slice(start, end));
            }

            for (const product of products_res.data) {

              let db_product = await is_in_product_array(product);
              if (!db_product) {
                const new_product = await database.products.insert(product);
                db_product = new_product.data[0];
              }else{
                await database.products.update({
                  id: product.id,
                  resource_id: product.resource_id,
                },{$set:{
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  status: product.status,
                  props: product.props,
                }},{})
              }

              if (db_product) {

                const record = {
                  product_1_id: db_product._id,
                  process_id: parsing_process.id,
                  parsed: 'new'
                };
                const in_scan_array = await is_in_scan_array(record);
                if (!in_scan_array) {

                  await database.scans.insert(record);
                  if (parsing_process.scan_status_id == 1) {
                    await parsing_process.set_process_status(2);
                    if (scan_interval._destroyed) {
                      scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
                    }
                  }

                }

              }
            }
          }
          if (scan_interval._destroyed) {
            scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
          }
        }
      }
      await parsing_process.update();
      win.webContents.send('update_parsing_process', parsing_process.info());
    }

  }catch(err){
    console.log(err);
    // await browser.close()
  }finally {
    await page.close().catch(e => {
      // console.log(e)
    })
    page = null;
    // if (curr_scanning_status == 'aborted') {
    //   await finish_scanning()
    // }
  }

})

ipcMain.on('scan_pairs',async function(e, data){
  if (data.length == 1) {
    await scan_one_pair(data[0], false);
  }else{
    let name = $t('title.selected_pairs_scan') + ' ' + utilites.get_date();
    const parsing_process = new ParsingProcess({name});
    await parsing_process.update();
    for (const pair of data) {
      const record = {
        product_1_id: pair.product_1_id,
        product_2_id: pair.product_1_id,
        process_id: parsing_process.id,
        parsed: 'new'
      };
      const in_scan_array = await is_in_scan_array(record);
      if (!in_scan_array) {
        await database.scans.insert(record);
      }
    }
    if (parsing_process.scan_status_id == 1) {
      await parsing_process.set_process_status(2);
      if (scan_interval._destroyed) {
        scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
      }
    }
  }
  return;
})

ipcMain.on('reload_browser',async function(e){
  if (browser) {browser.close();}
  await launch_browser();
})
ipcMain.on('compact_database',async function(e, db_name){
  await database[db_name].compact(500);
})

ipcMain.on('edit_list_name',async function(e, data){
  let res = await database.lists.update({
      _id: data._id,
    },{$set:{
      name: data.name,
    }},{})
  win.webContents.send('lists_from_server_to_app', await get_lists())
  await database.lists.compact(500)
})
ipcMain.on('edit_category_name',async function(e, data){
  let res = await database.categories.update({
      _id: data._id,
    },{$set:{
      name: data.name,
    }},{})
  win.webContents.send('categories_from_server_to_app', await get_categories())
  await database.categories.compact(500)
})

ipcMain.on('edit_parsing_process_prorerty',async function(e, data){
  const parsing_process = new ParsingProcess({
    _id: data._id
  });
  if (data.hasOwnProperty('name')) {
    await parsing_process.set_name(data.name);
  }
  if (data.hasOwnProperty('priority')) {
    await parsing_process.set_priority(data.priority);
  }
  // if (data.hasOwnProperty('sort_order')) {
  //   await parsing_process.set_sort_order(data.sort_order);
  // }
  await parsing_process.update();
  win.webContents.send('update_parsing_process', parsing_process.info());
})

ipcMain.on('delete_selected_categories',async function(e, data){
  await database.categories.remove({_id:{$in:data}},{multi:true});
  win.webContents.send('categories_from_server_to_app', await get_categories());
  await database.categories.compact(500);
})

ipcMain.on('delete_selected_custom_urls',async function(e, data){
  for (const custom_pair_id of data) {
    await database.custom_urls.remove({_id:custom_pair_id})
  }
  await database.custom_urls.compact(500)
  win.webContents.send('custom_urls_from_server_to_app', await get_custom_urls())
})
ipcMain.on('delete_selected_lists',async function(e, data){
  await delete_selected_lists(data)
  win.webContents.send('lists_from_server_to_app', await get_lists())
  await database.lists.compact(500)
  await database.pairs.compact(500)
})

async function deal_with_settings(){
  for (var setting_name in main_settings) {
    if (main_settings.hasOwnProperty(setting_name)) {
      const setting_value = main_settings[setting_name]
      const setting_saved = await database.settings.find({name:setting_name})
      if (setting_saved.success) {
        if (setting_saved.data.length) {
          main_settings[setting_name] = setting_saved.data[0].value
        }else{
          database.settings.insert({
            name: setting_name,
            value: setting_value
          })
        }
      }
    }
  }
}

async function launch_browser(){
  // const license = await check_license()
  // win.webContents.send('refresh_license', license)
  // if (!license.success) {
  //   return
  // }
  const args = [
    '--lang=en,en-US;q=0,5',
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ]
  if (main_settings.extentions) {
    args.push(`--disable-extensions-except=${pathToExtensionTouchVPN},${pathToExtensionHoxxVPN}`)
    args.push(`--load-extension=${pathToExtensionTouchVPN},${pathToExtensionHoxxVPN}`)
  }
  browser = await puppeteer.launch({
      headless: main_settings.headless,
      defaultViewport: null,
      slowMo:100,
      executablePath: chromium_path,
      args:args
    })
  browser.on('disconnected', () => {browser = false})
}

async function get_settings(){
  const res = await database.settings.find({})
  if (res.success) {
    return res.data
  }
  return []
}
async function get_parsing_processes(){
  const return_parsing_processes = []
  const res = await database.parsing_processes.sort({},{sort_order:1});
  if (res.success) {
    for (const _parsing_process of res.data) {
      const parsing_process = new ParsingProcess({_id:_parsing_process._id});
      if (await parsing_process.update()) {
        const pp = parsing_process.info();
        pp.selected = false;
        pp.edit = false;
        return_parsing_processes.push(pp);
      }
    }
  }
  return return_parsing_processes
}
async function get_parsing_processes_wo_watcher(){
  const return_parsing_processes = []
  const res = await database.parsing_processes.sort({},{sort_order:1})
  const watcher_process_id = await watcher.require_parsing_process();
  if (res.success) {
    for (const _parsing_process of res.data) {
      if (_parsing_process._id != watcher_process_id) {
        const parsing_process = new ParsingProcess({_id:_parsing_process._id});
        if (await parsing_process.update()) {
          const pp = parsing_process.info();
          pp.selected = false;
          pp.edit = false;
          return_parsing_processes.push(pp);
        }
      }
    }
  }
  return return_parsing_processes
}



async function scan_parsing_processes(){
  const active_scan = await get_active_scan();
  if (!active_scan) {
    clearInterval(scan_interval);
    return;
  }
  await require_browser();
  let tab_count = (await browser.pages()).length
  if (tab_count - 1 < main_settings.tabs) {
    await set_scan_parsed({
      id: active_scan._id,
      parsed: 'started'
    });
    await run_active_scan(active_scan).catch(e => {});
    const parsing_process = new ParsingProcess({
      _id: active_scan.process_id
    });
    await parsing_process.update();
    win.webContents.send('update_parsing_process', parsing_process.info());
  }
}

function run_active_scan(active_scan){
  return new Promise(async(resolve) => {
    let scan_result = false;
    if (active_scan.hasOwnProperty('product_1_id') && active_scan.hasOwnProperty('product_2_id')) {
      await require_scanning_list(active_scan.process_id);
      scan_result = await scan_one_pair({
        product_1_id: active_scan.product_1_id,
        product_2_id: active_scan.product_2_id
      },active_scan.process_id);
    }else if (active_scan.hasOwnProperty('product_1_id') && !active_scan.hasOwnProperty('product_2_id')) {
      await require_scanning_list(active_scan.process_id);
      scan_result = await parse_product_2(active_scan.product_1_id, active_scan.process_id);
    }else if (!active_scan.hasOwnProperty('product_1_id') && active_scan.hasOwnProperty('product_2_id')) {
      await require_scanning_list(active_scan.process_id);
      scan_result = await parse_product_1(active_scan.product_1_id, active_scan.process_id);
    }else if (active_scan.hasOwnProperty('url_1') && active_scan.hasOwnProperty('url_2')) {
      await require_scanning_list(active_scan.process_id);
      scan_result = await scan_one_url_pair({
        url_1: active_scan.url_1,
        url_2: active_scan.url_2
      },active_scan.process_id);
      if (scan_result) {
        await database.custom_urls.remove({
          url_1: active_scan.url_1,
          url_2: active_scan.url_2
        },{multi: true})
        win.webContents.send('custom_urls_from_server_to_app', await get_custom_urls());
      }
    }else if (active_scan.hasOwnProperty('watcher_id')) {
      scan_result = scan_watcher(active_scan.watcher_id);
    }
    if (scan_result) {
      await set_scan_parsed({
        id: active_scan._id,
        parsed: 'success'
      });
    }else{
      await set_scan_parsed({
        id: active_scan._id,
        parsed: 'error'
      });
    }
    resolve(true);
  });
}

function require_scanning_list(scanning_list_id){
  return new Promise(async(resolve) => {
    let res = await database.lists.find({_id:scanning_list_id});
    if (res.success) {
      if (res.data.length) {
        resolve(true);return;
      }
    }
    const parsing_process = new ParsingProcess({_id:scanning_list_id});
    await parsing_process.update();
    res = await database.lists.insert({
      _id: scanning_list_id,
      name: parsing_process.name,
      color: env.color.default,
      sort_order: 0
    });
    win.webContents.send('lists_from_server_to_app', await get_lists());
    resolve(res.data[0]);
  });
}

function parse_product_2(product_1_id, scanning_list_id){
  return new Promise(async(resolve) => {
    let res = {success: false};
    let finded_product = false;
    let resource_2_id = 0;
    res = await database.products.find({_id: product_1_id});
    const database_product = res.data[0];
    if (database_product.resource_id == 3 || database_product.resource_id == 5) {
      resource_2_id = 1
    }else if (database_product.resource_id == 4 || database_product.resource_id == 6) {
      resource_2_id = 2
    }
    database_product.resource_2_id = resource_2_id
    // const resource_1 = find_resource({id:database_product.resource_id});
    const resource_2 = find_resource({id:resource_2_id});
    let amazon_skus = await find_amazon_skus_in_matches(database_product);
    for (const amazon_sku of amazon_skus) {
      if (!finded_product) {
        finded_product = await find_product_in_databases(database_product, amazon_sku);

        if (!finded_product) {
          await require_browser();
          let page = await browser.newPage();
          await setup_page(page);
          const finded_product_res = await resource_2.scan_product(page, {sku:amazon_sku});
          if (finded_product_res.success) {
            finded_product = finded_product_res.data;
          }else{
            if (finded_product_res.error.includes('captcha')) {
              pause_if_captcha();
            }
          }
          await page.close().catch(e => {});
          page = null;
        }
      }
    }
    if (!finded_product) {
      await require_browser();
      let page = await browser.newPage();
      await setup_page(page);

      const finded_product_res = await resource_2.find_product(page, database_product);
      if (finded_product_res.success) {
        finded_product = finded_product_res.data;
      }else{
        if (finded_product_res.error.includes('captcha')) {
          pause_if_captcha();
        }
      }

      await page.close().catch(e => {});
      page = null;
    }
    if (!finded_product) {resolve(finded_product);return;}
    add_product_to_remote(finded_product);

    let db_product = await is_in_product_array(finded_product);
    if (!db_product) {
      res = await database.products.insert(finded_product);
    }else{
      res = await database.products.update({
        id: finded_product.id,
        resource_id: finded_product.resource_id,
      },{$set:{
        name: finded_product.name,
        price: finded_product.price,
        image: finded_product.image,
        status: finded_product.status,
        props: finded_product.props,
      }},{})
      res = await database.products.find({
        id: finded_product.id,
        resource_id: finded_product.resource_id,
      },{})
    }
    finded_product = res.data[0];
    await recalc_pair_by_db_products(database_product, finded_product, scanning_list_id);
    resolve(finded_product);
  })
}


function scan_watcher(watcher_id){
  return new Promise(async (resolve) => {
    await require_browser();
    let page = await browser.newPage();
    await setup_page(page);
    let new_record = false;
    try {
      new_record = await watch_by_id(page, watcher_id, false);

      win.webContents.send('update_listed', {
        watcher_id,
        source_products: new_record.source_products,
        listing_info: new_record.listing_info,
        record_time: new Date()
      });
    } catch (e) {
      console.log('error:check_watchers', e);
    } finally {
      await page.evaluate(() => window.stop())
      await page.close()
      page = null;
      resolve(new_record);
    }
  })
}

function recalc_pair_by_db_products(product_1, product_2, scanning_list_id){
  return new Promise(async(resolve) => {
    let res = await database.pairs.find({
      product_1_id: product_1._id,
      product_2_id: product_2._id
    },{});
    const profit_name_identity = get_profit_name_identity_by_db_products(product_1, product_2);
    const match_exeption_favorite_rank = await get_match_exeption_favorite_rank_by_db_products(product_1, product_2);
    const amazon_listing = await is_state('amazon_listing', product_1._id, product_2._id);
    const inaddible = await is_state('inaddible', product_1._id, product_2._id);
    const watch = await is_state('watch', product_1._id, product_2._id);
    let showed_pair = false;
    if (res.data.length) {
      const founded_pair = res.data[0];
      if (!founded_pair.list_ids.includes(scanning_list_id)) {
        founded_pair.list_ids.push(scanning_list_id);
      }
      await database.pairs.update({
        _id: founded_pair._id,
      },{$set:{
        list_ids: founded_pair.list_ids,
        profit: profit_name_identity.profit,
        profit_perc: profit_name_identity.profit_perc,
        identity: profit_name_identity.identity,
        match: match_exeption_favorite_rank.match,
        exeption: match_exeption_favorite_rank.exeption,
        favorite: match_exeption_favorite_rank.favorite,
        rank: match_exeption_favorite_rank.rank,
        amazon_listing,
        inaddible,
        watch,
      }},{});
      showed_pair = founded_pair;
    }else{
      const new_pair = {
        product_1_id: product_1._id,
        product_2_id: product_2._id,
        category_id: '',
        category_name: '',
        list_ids: [scanning_list_id],
        resource_1_id: product_1.resource_id,
        resource_2_id: product_2.resource_id,
        profit: profit_name_identity.profit,
        profit_perc: profit_name_identity.profit_perc,
        identity: profit_name_identity.identity,
        match: match_exeption_favorite_rank.match,
        exeption: match_exeption_favorite_rank.exeption,
        favorite: match_exeption_favorite_rank.favorite,
        rank: match_exeption_favorite_rank.rank,
        amazon_listing,
        inaddible,
        watch,
      };
      res = await database.pairs.insert(new_pair);
      showed_pair = res.data[0];
    }
    if (showed_pair) {
      add_to_showed_pairs(showed_pair, product_1, product_2, scanning_list_id);
    }
    resolve(true);
  });
}

async function get_rank(_id){
  const res = await database.products.find({_id});
  if (res.success) {
    if (res.data.length) {
      return parseInt(res.data[0].props.rank);
    }
  }
  return 0;
}

async function is_state(state, _id_1, _id_2){
  let res
  switch (state) {
    case 'amazon_listing':
      res = await database.amazon_listing.find({id: _id_2});
      if (res.success) {
        if (res.data.length) {
          return true;
        }
      }
      break;
    case 'inaddible':
      res = await database.inaddible.find({id: _id_2});
      if (res.success) {
        if (res.data.length) {
          return true;
        }
      }
      break;
    case 'watch':
      res = await database.watchers.find({_id: _id_2});
      if (res.success) {
        if (res.data.length) {
          return true;
        }
      }
      break;
    default:
      res = await database[state].find({product_1_id: _id_1, product_2_id: _id_2});
      if (res.success) {
        if (res.data.length) {
          return true;
        }
      }
  }
  return false;
}

function get_match_exeption_favorite_rank_by_db_products(product_1, product_2){
  return new Promise(async (resolve) => {
    const match = await is_state('matches', product_1._id, product_2._id);
    const exeption = await is_state('exeptions', product_1._id, product_2._id);
    const favorite = await is_state('favorites', product_1._id, product_2._id);
    const rank = await get_rank(product_2._id);
    const out = {
      match,
      exeption,
      favorite,
      rank
    };
    resolve(out);
  })
}

function get_profit_name_identity_by_db_products(product_1, product_2){
  const out = {
    profit: NaN,
    identity: 0
  }

  product_1.price = parseFloat(product_1.price, 2);
  product_2.price = parseFloat(product_2.price, 2);

  if (isNaN(product_1.price) || isNaN(product_2.price)) {
    out.profit = NaN;
  }else if (product_1.price == 0 || product_2.price == 0) {
    out.profit = NaN;
  }else{
    let resource_free_shipping_on = 0;
    let resource_delivery = 0;
    let resource_taxes = 0;
    switch (product_1.resource_id) {
      case 3:
        resource_free_shipping_on = main_settings.walmart_com_free_shipping_on;
        resource_delivery = main_settings.walmart_com_delivery;
        break;
      case 4:
        resource_free_shipping_on = main_settings.walmart_ca_free_shipping_on;
        resource_delivery = main_settings.walmart_ca_delivery;
        break;
      case 5:
        resource_free_shipping_on = main_settings.bedbathandbeyond_com_free_shipping_on;
        resource_delivery = main_settings.bedbathandbeyond_com_delivery;
        break;
      case 6:
        resource_free_shipping_on = main_settings.bedbathandbeyond_ca_free_shipping_on;
        resource_delivery = main_settings.bedbathandbeyond_ca_delivery;
        break;
      default:
    }
    switch (product_2.resource_id) {
      case 1:
        resource_taxes = main_settings.amazon_com_taxes;
        break;
      case 2:
        resource_taxes = main_settings.amazon_ca_taxes;
        break;
    }
    resource_free_shipping_on = parseFloat(resource_free_shipping_on, 2);
    resource_delivery = parseFloat(resource_delivery, 2);
    resource_taxes = parseFloat(resource_taxes, 2);
    let shipping = 0;
    if (product_1.price < resource_free_shipping_on) {
      shipping = resource_delivery;
    }
    const taxes = product_2.price * resource_taxes / 100;
    out.profit = product_2.price - (product_1.price + shipping) - taxes;
  }
  const arr_name_1 = utilites.split_name(product_1.name);
  const arr_name_2 = utilites.split_name(product_2.name);
  global['min_arr'] = arr_name_1;
  global['max_arr'] = arr_name_2;
  if (arr_name_2.length < arr_name_1.length) {
    global['min_arr'] = arr_name_2;
    global['max_arr'] = arr_name_1;
  }
  const intersection = global['min_arr'].filter(value => {
    const word = value.toLowerCase();
    for (const _word of global['max_arr']) {
      if (_word.toLowerCase() == word) {
        return true;
      }
    }
    return false;
  });
  out.identity = Math.round((intersection.length / global['min_arr'].length) * 10000) / 100;
  if (!isNaN(out.profit)) {
    out.profit = Math.round(out.profit * 100) / 100;
    out.profit_perc = out.profit / product_1.price;
    out.profit_perc = Math.round(out.profit_perc * 10000) / 100;
  }else{
    out.profit = 0;
    out.profit_perc = 0;
  }
  if (isNaN(out.identity)) {
    out.identity = 0;
  }
  return out;
}

function add_to_showed_pairs(pair, product_1, product_2, scanning_list_id){
  if(!pair.hasOwnProperty('product_1')){pair.product_1 = product_1;}
  if(!pair.hasOwnProperty('product_2')){pair.product_2 = product_2;}
  pair.selected = false;
  win.webContents.send('add_to_showed_pairs', {
    list_id: scanning_list_id,
    data: pair
  });
}

function setup_page(page){
  return new Promise(async(resolve) => {
    const options = {
      viewport:{
        width: 1600,
        height: 900,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      },
      userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:74.0) Gecko/20100101 Firefox/74.0'
    }
    await page.emulate(options);
    await page.setRequestInterception(true);
    page.on('request', request => {
      // const headers = Object.assign({}, request.headers(), {
      //   accept: 'application/json',
      // });

      if (!main_settings.images_styles) {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet'){
          request.abort();
        }else{
          // request.continue({headers});
          request.continue();
        }
      }else{
        // request.continue({headers});
        request.continue();
      }
    })
    resolve(page);
    return;
  })
}
function parse_product_1(product_1_id, scanning_list_id){
  return new Promise(async(resolve) => {

    resolve(false);
    return;
  })
}
async function get_active_scan(){

  let active_scan = false;
  let process_ids = [];

  const active_parsing_processes = await database.parsing_processes.sort({
      scan_status_id:{$in:[2]}
    },
    {priority:-1});


  if (active_parsing_processes.success) {
    if (!active_parsing_processes.data.length){return false;}

    const highest_priority = active_parsing_processes.data[0].priority;
    for (const process of active_parsing_processes.data) {
      if (process.priority == highest_priority) {
        process_ids.push(process._id);
      }
    }
  }

  const process_id = process_ids[Math.floor(Math.random() * process_ids.length)];

  const active_scan_res = await database.scans.sort({
      process_id,
      parsed: 'new'
    },
    {createdAt:1},
    1);

  if (active_scan_res.success) {
    if (active_scan_res.data.length) {
      active_scan = active_scan_res.data[0];
    }else{
      await finish_parsing_processes(process_id);
      return await get_active_scan();
    }
  }

  return active_scan;

}

async function finish_parsing_processes(process_id){
  const parsing_process = new ParsingProcess({_id:process_id});
  parsing_process.set_process_status(6);
  await parsing_process.update();
  win.webContents.send('update_parsing_process', parsing_process.info());
}
async function set_scan_parsed(data){
  await database.scans.update({
    _id: data.id
  },{$set:{
    parsed: data.parsed
  }},{})
  return true;
}
async function deal_with_amazon_listing(){
  const amazon_listing_res = await database.amazon_listing.find({});
  for (const amazon_listing of amazon_listing_res.data) {
    const db_prod_res = await database.products.find({_id: amazon_listing.id});
    if (!db_prod_res.data.length) {
      await database.amazon_listing.remove({
        _id:amazon_listing._id
      },{multu:true});
    }
  }
  database.amazon_listing.compact()
  return true;
}
async function deal_with_scans(){
  await database.scans.update({
    parsed: 'started'
  },{$set:{
    parsed: 'new'
  }},{
    multi: true
  })
  database.scans.compact()
  return true;
}
async function deal_with_parsing_processes(){
  await database.parsing_processes.remove({
    scan_status_id:{$in:[0,1]}
  },{
    multi: true
  });
  await database.parsing_processes.update({
    scan_status_id:{$in:[2,7,8]}
  },{$set:{
    scan_status_id: 3
  }},{
    multi: true
  });
  const res = await database.parsing_processes.find();
  for (const parsing_process of res.data) {
    const scans_res = await database.scans.sort({process_id:parsing_process._id},{},1);
    if (!scans_res.data.length) {
      await database.parsing_processes.remove({
        _id:parsing_process._id
      },{});
    }
  }
  database.parsing_processes.compact();
  return true;
}

async function get_categories(){
  const return_categories = []
  const res = await database.categories.sort({},{sort_order:1})
  if (res.success) {
    for (const [i, category] of res.data.entries()) {
      if (category.color == '#ffffff00') {
        category.color = env.color.default
      }
      const resource = find_resource({id:category.resource_id})
      if (resource) {
        category.resource_name = resource.name
        category.selected = false
        return_categories.push(category)
      }
    }
  }
  return return_categories
}
async function get_lists(){
  let return_lists = []
  let res = await database.lists.sort({},{sort_order:1,updatedAt: -1})
  if (res.success) {
    for (const list of res.data) {
      if (!list.hasOwnProperty('color')) {
        list.color = env.color.default
      }
      if (list.color == '#ffffff00') {
        list.color = env.color.default
      }
      const pair_count = await get_list_pair_count(list._id)
      list.selected = false
      list.pair_count = pair_count
      list.createdAt = utilites.get_date(list.createdAt)
      list.updatedAt = utilites.get_date(list.updatedAt)
      return_lists.push(list)
    }
  }
  return return_lists
}

function delete_selected_lists(data){
  return new Promise(async (resolve)=>{
    for (const list_id of data) {
      await database.lists.remove({_id:list_id})
      let res = await database.pairs.find({list_ids:list_id})
      if (res.success) {
        for (const pair of res.data) {

          pair.list_ids.splice(pair.list_ids.indexOf(list_id), 1)

          await database.pairs.update({
            _id: pair._id,
          },{$set:{
            list_ids: pair.list_ids,
          }},{})

        }
      }
    }
    resolve()
  })
}
async function get_list_pair_count(list_id){
  let count = 0
  let res = await database.pairs.count({list_ids:list_id})
  if (res.success) {
    count = res.data
  }
  return count
}

function find_resource(data){

  let Resource = false;

  for (const _Resource of Resources) {

    if (data.hasOwnProperty('id')) {
      if (parseInt(data.id) === _Resource.id) {
        Resource = _Resource;
        break;
      }
    }

    if (data.hasOwnProperty('name')) {
      if (data.name === _Resource.name) {
        Resource = _Resource;
        break;
      }
    }

    if (data.hasOwnProperty('url')) {
      if (data.url === _Resource.url) {
        Resource = _Resource;
        break;
      }
    }

    if (data.hasOwnProperty('pre_id_url')) {
      if (data.pre_id_url === _Resource.pre_id_url) {
        Resource = _Resource;
        break;
      }
    }

    if (data.hasOwnProperty('alias')) {
      if (data.alias === _Resource.alias) {
        Resource = _Resource;
        break;
      }
    }

    if (data.hasOwnProperty('category_url')) {
      if (data.category_url.includes(_Resource.url)) {
        Resource = _Resource;
        break;
      }
    }

  }

  return Resource

}

function require_browser(){
  return new Promise(async (resolve) => {
    if (!browser) {
      await launch_browser()
      await utilites.delay(1000)
    }
    resolve(true)
  });
}

async function add_products_to_remote(_products){
  return new Promise(async (resolve) => {

    const data = {
      type: 'products',
      products: []
    }

    for (const _product of _products) {

      const product = format_product_for_remote(_product)

      if (product) {
        data.products.push(product)
      }

    }

    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    const helper = setTimeout(()=>{
      if (source) {
        source.cancel('Too long')
        resolve(true)
        return
      }
    }, env.timeout.axios_cancel * 2)

    if (data.products.length) {
      axios.post('http://parser.just-for-testing.website/add_data', data, {
        cancelToken: source.token
      }).then((res) => {
        resolve(true)
        return
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('add_products_to_remote canceled', error.message);
        } else {
          console.log('add_products_to_remote error', error);
          resolve(false);return
        }
      })
    }else{
      resolve(false)
      return
    }

  })
}

function format_product_for_remote(product){
  let out = {
    model: '',
    rank: 0,
    images: []
  }
  let success = true

  product.hasOwnProperty('id') ? out.sku = product.id : success = false
  product.hasOwnProperty('resource_id') ? out.resource_id = product.resource_id : success = false
  product.hasOwnProperty('name') ? out.name = product.name : success = false
  product.hasOwnProperty('price') ? out.price = product.price : success = false
  product.hasOwnProperty('image') ? out.image = product.image : success = false
  product.hasOwnProperty('url') ? out.url = product.url : success = false
  product.hasOwnProperty('status') ? out.status = product.status : success = false

  if (product.hasOwnProperty('props')) {
    product.props.hasOwnProperty('model') ? out.model = product.props.model : success = false
    product.props.hasOwnProperty('rank') ? out.rank = product.props.rank : success = false
    product.props.hasOwnProperty('images') ? out.images = product.props.images : success = false
  }else{
    success = false
  }

  if (success) {
    if (!out.sku.length ||
        isNaN(parseInt(out.resource_id)) ||
        !out.name.length ||
        isNaN(parseFloat(out.price)) ||
        !out.sku.length ) {

      success = false

    }
  }

  if (!success) {
    out = false
  }

  return out
}
async function is_in_product_array(product){
  let res = await database.products.find({id: product.id, resource_id: product.resource_id})
  if (res.success) {
    if (res.data.length) {
      return res.data[0]
    }
  }
  return false
}
async function is_in_scan_array(filter_data){
  let res = await database.scans.find(filter_data);
  if (res.success) {
    if (res.data.length) {
      return res.data[0];
    }
  }
  return false;
}

function scan_one_url_pair(scan,scanning_list_id){
  return new Promise(async(resolve) => {
    const parsed_1 = utilites.parse_url(scan.url_1);
    const parsed_2 = utilites.parse_url(scan.url_2);
    if (!parsed_1.success || !parsed_2.success) {
      resolve(false);
    }
    const resource_1 = find_resource({id:parsed_1.resource.id});
    const resource_2 = find_resource({id:parsed_2.resource.id});
    let product_data = {
      sku: parsed_1.product.id,
      resource_id: parsed_1.resource.id
    }
    let product_1 = await get_product_in_databases(product_data);
    product_data = {
      sku: parsed_2.product.id,
      resource_id: parsed_2.resource.id
    }
    let product_2 = await get_product_in_databases(product_data);
    if (!product_1 || !product_2) {
      await require_browser();
      let page = await browser.newPage();
      await setup_page(page);
      if (!product_1) {
        let product_1_info = false;
        const product_1_info_res = await resource_1.scan_product(page, {url:scan.url_1});
        if (product_1_info_res.success) {
          product_1_info = product_1_info_res.data;
          await add_or_update_product(product_1_info);
        }else{
          if (product_1_info_res.error.includes('captcha')) {
            pause_if_captcha();
          }
        }
        product_1 = await is_in_product_array({
          id: parsed_1.product.id, resource_id: parsed_1.resource.id
        });
      }
      if (!product_2) {
        let product_2_info = false;
        const product_2_info_res = await resource_2.scan_product(page, {url:scan.url_2});
        if (product_2_info_res.success) {
          product_2_info = product_2_info_res.data;
          await add_or_update_product(product_2_info);
        }else{
          if (product_2_info_res.error.includes('captcha')) {
            pause_if_captcha();
          }
        }
        product_2_id = await add_or_update_product(product_2_info);
        product_2 = await is_in_product_array({
          id: parsed_2.product.id, resource_id: parsed_2.resource.id
        });
      }
      await page.close().catch(e => {});
      page = null;
    }
    if (product_1 && product_2) {
      await recalc_pair_by_db_products(product_1, product_2, scanning_list_id);
      resolve(true);return;
    }
    resolve(false);
  });
}

function scan_one_pair(pair, scanning_list_id = false){

  return new Promise(async(resolve) => {

    const product_1_res = await database.products.find({_id: pair.product_1_id});
    const product_2_res = await database.products.find({_id: pair.product_2_id});
    if (!product_1_res.success || !product_2_res.success){resolve(false);return;}
    const product_1 = product_1_res.data[0];
    const product_2 = product_2_res.data[0];

    const resource_1 = find_resource({id:product_1.resource_id});
    const resource_2 = find_resource({id:product_2.resource_id});

    if (scanning_list_id) {
      let product_data = {
        sku: product_1.id,
        resource_id: product_1.resource_id
      }
      const relevance_product_1_in_db = await get_product_in_databases(product_data);
      product_data = {
        sku: product_2.id,
        resource_id: product_2.resource_id
      }
      const relevance_product_2_in_db = await get_product_in_databases(product_data);
      if (!relevance_product_1_in_db || !relevance_product_2_in_db) {
        await require_browser();
        let page = await browser.newPage();
        await setup_page(page);
        if (!relevance_product_1_in_db) {
          let product_1_info = false;
          const product_1_info_res = await resource_1.scan_product(page, {sku:product_1.id});
          if (product_1_info_res.success) {
            product_1_info = product_1_info_res.data;
          }else{
            if (product_1_info_res.error.includes('captcha')) {
              pause_if_captcha();
            }
          }
          if (product_1_info){
            await add_or_update_product(product_1_info);
          }
        }
        if (!relevance_product_2_in_db) {
          let product_2_info = false;
          const product_2_info_res = await resource_2.scan_product(page, {sku:product_2.id});
          if (product_2_info_res.success) {
            product_2_info = product_2_info_res.data;
          }else{
            if (product_2_info_res.error.includes('captcha')) {
              pause_if_captcha();
            }
          }
          if (product_2_info){
            await add_or_update_product(product_2_info);
          }
        }
        await page.close().catch(e => {});
        page = null;
        await update_pair_full(pair.product_1_id, pair.product_2_id);
      }
    }else{
      await require_browser();
      let page = await browser.newPage();
      await setup_page(page);
      let product_1_info = false;
      const product_1_info_res = await resource_1.scan_product(page, {sku:product_1.id});
      if (product_1_info_res.success) {
        product_1_info = product_1_info_res.data;
      }else{
        if (product_1_info_res.error.includes('captcha')) {
          pause_if_captcha();
        }
      }
      let product_2_info = false;
      const product_2_info_res = await resource_2.scan_product(page, {sku:product_2.id});
      if (product_2_info_res.success) {
        product_2_info = product_2_info_res.data;
      }else{
        if (product_2_info_res.error.includes('captcha')) {
          pause_if_captcha();
        }
      }
      await page.close().catch(e => {});
      page = null;
      if (product_1_info){
        await add_or_update_product(product_1_info);
      }
      if (product_2_info){
        await add_or_update_product(product_2_info);
      }
      await update_pair_full(pair.product_1_id, pair.product_2_id);
    }
    resolve(true);return;
  })
}

async function update_pair_full(product_1_id, product_2_id){

  let product_1_res = await database.products.find({_id:product_1_id})
  let product_2_res = await database.products.find({_id:product_2_id})
  const product_1 = product_1_res.data[0]
  const product_2 = product_2_res.data[0]

  let res = await database.pairs.find({product_1_id, product_2_id})
  if (res.success) {
    if (res.data.length) {

      const pair = res.data[0]

      const profit_name_identity = await get_profit_name_identity(pair)

      await database.pairs.update({
        _id: pair._id,
      },{$set:{
        profit: profit_name_identity.profit,
        profit_perc: profit_name_identity.profit_perc,
        identity: profit_name_identity.identity,
      }},{})

      win.webContents.send('update_pair_full', {
        _id: pair._id,
        category_name: pair.category_name,
        product_1,
        product_2,
        profit: profit_name_identity.profit,
        identity: profit_name_identity.identity,
        selected: false,
        match: pair.match,
        exeption: pair.exeption,
        favorite: pair.favorite,
        amazon_listing: pair.amazon_listing,
        inaddible: pair.inaddible,
        watch: pair.watch
      })

      database.pairs.compact()

    }
  }
}

async function replace_pair_full(product_1_id, old_product_2_id, new_product_id){

let exist_pair = false
let exist_list_ids = []
  let pair_res = await database.pairs.find({
    product_1_id: product_1_id,
    product_2_id: new_product_id
  })
  if (pair_res.success) {
    if (pair_res.data.length) {
      exist_pair = pair_res.data[0]
      exist_list_ids = exist_pair.list_ids
    }
  }

  let product_1_res = await database.products.find({_id:product_1_id})
  const product_1 = product_1_res.data[0];
  let product_2_res = await database.products.find({_id:new_product_id})
  const product_2 = product_2_res.data[0];

  let res = await database.pairs.find({product_1_id, product_2_id:old_product_2_id})
  if (res.success) {
    if (res.data.length) {

      const pair = res.data[0]

      pair.product_2_id = product_2._id
      pair.product_2 = product_2

      const profit_name_identity = await get_profit_name_identity(pair)

      pair.profit = profit_name_identity.profit
      pair.identity = profit_name_identity.identity
      pair.profit_perc = profit_name_identity.profit_perc
      pair.rank = product_2.props.rank

      const new_pair = pair

      if (exist_pair) {

        const all_list_ids = exist_list_ids.concat(pair.list_ids)

        const unique_list_ids = all_list_ids.filter( (value, index, self) => {
          return self.indexOf(value) === index
        } )

        await database.pairs.update({
          _id: exist_pair._id,
        },{$set:{
          list_ids: unique_list_ids,
          profit:pair.profit,
          identity:pair.identity,
          profit_perc:pair.profit_perc,
          rank:pair.rank
        }},{})

        win.webContents.send('replace_pair_full', {
          _id: pair._id,
          category_name: exist_pair.category_name,
          product_1,
          product_2,
          list_ids: unique_list_ids,
          profit:exist_pair.profit,
          identity:exist_pair.identity,
          selected: false,
          match: exist_pair.match,
          exeption: exist_pair.exeption,
          favorite: exist_pair.favorite,
          amazon_listing: exist_pair.amazon_listing,
          inaddible: exist_pair.inaddible,
          watch: exist_pair.watch
        })

        await database.pairs.remove({
          _id: pair._id
        })

      }else{

        const match = await is_state('matches', product_1_id, product_2._id)
        const exeption = await is_state('exeptions', product_1_id, product_2._id)
        const favorite = await is_state('favorites', product_1_id, product_2._id)
        const amazon_listing = await is_state('amazon_listing', product_1_id, product_2._id)
        const inaddible = await is_state('inaddible', product_1_id, product_2._id)
        const watch = await is_state('watch', product_1_id, product_2._id)

        pair.match = match
        pair.exeption = exeption
        pair.favorite = favorite
        pair.amazon_listing = amazon_listing
        pair.watch = watch
        pair.inaddible = inaddible

        await database.pairs.update({
          _id: pair._id,
        },{$set:{
          product_2_id:pair.product_2_id,
          profit:pair.profit,
          identity:pair.identity,
          profit_perc:pair.profit_perc,
          match:pair.match,
          exeption:pair.exeption,
          favorite:pair.favorite,
          rank:pair.rank,
          amazon_listing:pair.amazon_listing,
          watch:pair.watch,
          inaddible:pair.inaddible
        }},{})

        win.webContents.send('replace_pair_full', {
          _id: pair._id,
          category_name: pair.category_name,
          product_1,
          product_2,
          profit:pair.profit,
          identity:pair.identity,
          selected: false,
          match: pair.match,
          exeption: pair.exeption,
          favorite: pair.favorite,
          amazon_listing: pair.amazon_listing,
          inaddible: pair.inaddible,
          watch: pair.watch
        })

      }

      database.pairs.compact()

    }
  }
}

function find_amazon_skus_in_matches(database_product){
  return new Promise(async(resolve) => {

    const match_data = {
      sku_1: database_product.id,
      resource_1_id: database_product.resource_id,
      resource_2_id: database_product.resource_2_id,
    }

    const local_matches = await find_local_matches(match_data)
    if (local_matches) {
      resolve(local_matches);return
    }

    const approved_matches = await find_approved_matches(match_data)
    if (approved_matches) {
      resolve(approved_matches);return
    }

    resolve([])
  })
}

function find_product_in_databases(database_product, sku){
  return new Promise(async(resolve) => {

    const product_data = {
      sku,
      resource_id: database_product.resource_2_id,
      relevance: main_settings.relevance
    }

    const local_product = await get_product_from_local(product_data)
    if (local_product) {
      resolve(local_product);return
    }

    const remote_product = await get_product_from_remote(product_data)
    if (remote_product) {
      resolve(remote_product);return
    }

    resolve(false)

  })
}

function get_product_in_databases(product_data){
  return new Promise(async(resolve) => {

    product_data.relevance = main_settings.relevance

    const local_product = await get_product_from_local(product_data)
    if (local_product) {
      resolve(local_product);return
    }

    const remote_product = await get_product_from_remote(product_data)
    if (remote_product) {
      resolve(remote_product);return
    }

    resolve(false)

  })
}

async function get_product_from_remote(data){
  return new Promise(async (resolve) => {

    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    const helper = setTimeout(()=>{
      if (source) {
        source.cancel('Too long')
        resolve([])
        return
      }
    }, env.timeout.axios_cancel)

    data.type = 'product'

    axios.post('http://parser.just-for-testing.website/get_data', data, {
      cancelToken: source.token
    }).then((res) => {

      source = false

      if (res.data.length) {
        const product = format_product_from_remote(JSON.parse(JSON.stringify(res.data[0])))
        resolve(product);return
      }else{
        resolve(false);return
      }

    })
    .catch((error) => {
      if (axios.isCancel(error)) {
        console.log('get_product_from_remote canceled', error.message);
      } else {
        resolve(false);return
      }
    })

  })
}

function format_product_from_remote(data){

  let out = false
  let price = 0
  let image = ''

  if (data.hasOwnProperty('price')) {
    if (!isNaN(parseInt(data.price))) {
      price = parseInt(data.price)/100
    }
    if (data.image) {
      image = data.image
    }
  }

  if (price && image.length) {

    out = {
      id: data.sku,
      resource_id: parseInt(data.resource_id),
      name: data.name,
      price: parseInt(data.price)/100,
      image: image,
      url: data.url,
      props:{
        model: '',
        rank: parseInt(data.rank),
        images: []
      }
    }

    if (data.model !== null) {
      out.props.model == data.model
    }
    if (utilites.isJson(data.images)) {
      out.props.images == data.images
    }

  }

  return out

}

async function get_product_from_local(data){
  return new Promise(async (resolve) => {

    let output = false

    let res = await database.products.find({
      id:data.sku,
      resource_id:data.resource_id,
    })

    if (res.data.length) {

      const now_date = Date.now()
      const relevance_date = now_date - parseInt(main_settings.relevance) * 3600000
      const product_date = Date.parse(res.data[0].updatedAt)

      if (product_date > relevance_date) {
        output = res.data[0]
      }

    }

    resolve(output)

  })
}

function find_local_matches(match_data){
  return new Promise(async(resolve) => {

    let output = []

    let res = await database.products.find({
      id: match_data.sku_1,
      resource_id: match_data.resource_1_id,
    },{})

    if (res.data.length) {

      res = await database.matches.find({
        product_1_id: res.data[0]._id
      },{})

      for (const match of res.data) {

        const _res = await database.products.find({
          _id: match.product_2_id
        },{})

        output.push(_res.data[0].id)

      }

    }

    resolve(output)
  })
}
function find_local_exeptions(exeption_data){
  return new Promise(async(resolve) => {

    let output = []

    let res = await database.products.find({
      id: exeption_data.sku_1,
      resource_id: exeption_data.resource_1_id,
    },{})

    if (res.data.length) {

      res = await database.exeptions.find({
        product_1_id: res.data[0]._id
      },{})

      for (const exeption of res.data) {

        const _res = await database.products.find({
          _id: exeption.product_2_id
        },{})

        output.push(_res.data[0].id)

      }

    }

    resolve(output)
  })
}
async function find_approved_exeptions(exeption_data){
  return new Promise(async(resolve) => {

    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    const helper = setTimeout(()=>{
      if (source) {
        source.cancel('Too long')
        resolve([])
        return
      }
    }, env.timeout.axios_cancel)

    exeption_data.type = 'approved_exeptions'

    axios.post('http://parser.just-for-testing.website/get_data', exeption_data, {
      cancelToken: source.token
    }).then((res) => {
      source = false
      resolve(res.data);return
    })
    .catch((error) => {
      if (axios.isCancel(error)) {
        console.log('approved_exeptions canceled', error.message);
      } else {
        resolve(false);return
      }
    })
  })
}
async function find_approved_matches(match_data){
  return new Promise(async(resolve) => {
    match_data.type = 'approved_matches'

    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    const helper = setTimeout(()=>{
      if (source) {
        source.cancel('Too long')
        resolve([])
        return
      }
    }, env.timeout.axios_cancel)

    axios.post('http://parser.just-for-testing.website/get_data', match_data, {
      cancelToken: source.token
    }).then((res) => {

      resolve(res.data);return

    })
    .catch((error) => {
      if (axios.isCancel(error)) {
        console.log('approved_matches canceled', error.message);
      } else {
        resolve(false);return
      }
    })
  })
}

async function add_product_to_remote(_product){
  return new Promise(async (resolve) => {

    const product = format_product_for_remote(_product);

    const CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    const helper = setTimeout(()=>{
      if (source) {
        source.cancel('Too long')
        resolve(true)
        return
      }
    }, env.timeout.axios_cancel * 2);

    if (product) {
      product.type = 'product';
      axios.post('http://parser.just-for-testing.website/add_data', product, {
        cancelToken: source.token
      }).then((res) => {
        resolve(true)
        return
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('add_product_to_remote canceled', error.message);
        } else {
          resolve(false);return;
        }
      })
    }else{
      resolve(false);
      return;
    }

  })
}

function delete_pairs_if_empty(){
  return new Promise(async (resolve)=>{
    await database.pairs.remove({
      list_ids: [],
      amazon_listing: false,
      favorite: false
    },{multi: true});

    let res = await database.pairs.find({});
    for (const pair of res.data) {
      if (!pair.hasOwnProperty('product_1_id') || !pair.hasOwnProperty('product_2_id')) {
        await database.pairs.remove({
          _id: pair._id
        });
      }
      continue;
    }
    resolve(true);
    await database.pairs.compact();
  })
}
function get_results_to_show(data, currentPage = 1){
  return new Promise(async(resolve)=>{
    let output = {
      items: [],
      total: 0,
      filtered: 0
    }
    // let res = await database.pairs.find({list_ids:list_id})
    const query = {list_ids: { $in: data }}


    let total_res = await database.pairs.find(query)
    const total_pairs = []
    for (const pair of total_res.data) {
      let is_in_out = false
      for (const _pair of total_pairs) {
        if (_pair._id == pair._id) {
          is_in_out = true
          break
        }
      }
      if (!is_in_out) {
        total_pairs.push(pair)
      }
    }
    output.total = total_pairs.length


    if (main_settings.hide_exeption) {
      query.exeption = false
    }
    if (main_settings.hide_amazon_listing) {
      query.amazon_listing = false
    }
    if (main_settings.hide_inaddible) {
      query.inaddible = false
    }
    if (main_settings.match_only) {
      query.match = true
    }
    if (main_settings.amazon_rank_only) {
      query.rank = { $gt: 0 }
    }
    if (main_settings.match_identity) {
      query.identity = { $gt: parseInt(main_settings.min_identity) }
    }
    if (main_settings.match_profit) {
      if (parseInt(main_settings.min_dif_price) || parseInt(main_settings.max_dif_price)) {
        query.profit = {}
        if (parseInt(main_settings.min_dif_price)) {
          query.profit.$gt = parseInt(main_settings.min_dif_price)
        }
        if (parseInt(main_settings.max_dif_price)) {
          query.profit.$lt = parseInt(main_settings.max_dif_price)
        }
      }
      if (parseInt(main_settings.min_dif_percentage) || parseInt(main_settings.max_dif_percentage)) {
        query.profit_perc = {}
        if (parseInt(main_settings.min_dif_percentage)) {
          query.profit_perc.$gt = parseInt(main_settings.min_dif_percentage)
        }
        if (parseInt(main_settings.max_dif_percentage)) {
          query.profit_perc.$lt = parseInt(main_settings.max_dif_percentage)
        }
      }
    }

    if (filter_sku_arr.length) {
      let products_res = await database.products.find({
        id: { $in: filter_sku_arr }
      })
      if (products_res.success) {

        const products_ids = []
        for (const product of products_res.data) {
          products_ids.push(product._id)
        }
        query.$or = [{product_1_id: {$in: products_ids}}, {product_2_id: {$in: products_ids}}]
      }
    }

    let filtered_res = await database.pairs.find(query)
    const filtered_pairs = []
    for (const pair of filtered_res.data) {
      let is_in_out = false
      for (const _pair of filtered_pairs) {
        if (_pair._id == pair._id) {
          is_in_out = true
          break
        }
      }
      if (!is_in_out) {
        filtered_pairs.push(pair)
      }
    }
    output.filtered = filtered_pairs.length

    let skip = main_settings.results_per_page * (currentPage-1)

    let res = await database.pairs.pagination(
      query,
      {profit: -1},
      skip, main_settings.results_per_page
    )

    if (res.success) {
      for (const pair of res.data) {
        let product_1_res = await database.products.find({_id:pair.product_1_id})
        let product_2_res = await database.products.find({_id:pair.product_2_id})

        let is_in_out = false
        for (const _pair of output.items) {
          if (_pair._id == pair._id) {
            is_in_out = true
            break
          }
        }

        if (!is_in_out) {

          if (!pair.hasOwnProperty('profit') || !pair.hasOwnProperty('profit_perc') || !pair.hasOwnProperty('identity')) {
            const profit_name_identity = await get_profit_name_identity(pair)
            pair.profit = profit_name_identity.profit
            pair.profit_perc = profit_name_identity.profit_perc
            pair.identity = profit_name_identity.identity
          }
          if (!pair.hasOwnProperty('match') || !pair.hasOwnProperty('exeption') || !pair.hasOwnProperty('favorite') || !pair.hasOwnProperty('rank')) {
            const match_exeption_favorite_rank = await get_match_exeption_favorite_rank(pair)
            pair.match = match_exeption_favorite_rank.match
            pair.exeption = match_exeption_favorite_rank.exeption
            pair.favorite = match_exeption_favorite_rank.favorite
            pair.rank = match_exeption_favorite_rank.rank
          }
          if (!pair.hasOwnProperty('amazon_listing')) {
            const amazon_listing = await is_state('amazon_listing', pair.product_1_id, pair.product_2_id)
            pair.amazon_listing = amazon_listing
          }
          if (!pair.hasOwnProperty('inaddible')) {
            const inaddible = await is_state('inaddible', pair.product_1_id, pair.product_2_id)
            pair.inaddible = inaddible
          }
          if (!pair.hasOwnProperty('watch')) {
            const watch = await is_state('watch', pair.product_1_id, pair.product_2_id)
            pair.watch = watch
          }

          const product_1 = product_1_res.data[0];
          const product_2 = product_2_res.data[0];

          product_1.price = parseFloat(product_1.price, 2);
          product_2.price = parseFloat(product_2.price, 2);

          if (!product_1.hasOwnProperty('status')) {
            product_1.status = 0
          }
          if (!product_2.hasOwnProperty('status')) {
            product_2.status = 0
          }

          output.items.push({
            _id: pair._id,
            category_name: pair.category_name,
            product_1,
            product_2,
            profit: pair.profit,
            identity: pair.identity,
            selected: false,
            match: pair.match,
            exeption: pair.exeption,
            favorite: pair.favorite,
            amazon_listing: pair.amazon_listing,
            inaddible: pair.inaddible,
            watch: pair.watch
          })
        }

      }
    }
    resolve(output); return
  })
}

function get_favorites_to_show(currentPage = 1){
  return new Promise(async(resolve)=>{
    let output = {
      items: [],
      total: 0,
      filtered: 0
    }

    const query = {favorite: true}

    let total_res = await database.pairs.find(query)
    const total_pairs = []
    for (const pair of total_res.data) {
      let is_in_out = false
      for (const _pair of total_pairs) {
        if (_pair._id == pair._id) {
          is_in_out = true
          break
        }
      }
      if (!is_in_out) {
        total_pairs.push(pair)
      }
    }
    output.total = total_pairs.length


    if (main_settings.hide_exeption) {
      query.exeption = false
    }
    if (main_settings.hide_amazon_listing) {
      query.amazon_listing = false
    }
    if (main_settings.hide_inaddible) {
      query.inaddible = false
    }
    if (main_settings.match_only) {
      query.match = true
    }
    if (main_settings.amazon_rank_only) {
      query.rank = { $gt: 0 }
    }
    if (main_settings.match_identity) {
      query.identity = { $gt: parseInt(main_settings.min_identity) }
    }
    if (main_settings.match_profit) {
      if (parseInt(main_settings.min_dif_price) || parseInt(main_settings.max_dif_price)) {
        query.profit = {}
        if (parseInt(main_settings.min_dif_price)) {
          query.profit.$gt = parseInt(main_settings.min_dif_price)
        }
        if (parseInt(main_settings.max_dif_price)) {
          query.profit.$lt = parseInt(main_settings.max_dif_price)
        }
      }
      if (parseInt(main_settings.min_dif_percentage) || parseInt(main_settings.max_dif_percentage)) {
        query.profit_perc = {}
        if (parseInt(main_settings.min_dif_percentage)) {
          query.profit_perc.$gt = parseInt(main_settings.min_dif_percentage)
        }
        if (parseInt(main_settings.max_dif_percentage)) {
          query.profit_perc.$lt = parseInt(main_settings.max_dif_percentage)
        }
      }
    }

    if (filter_sku_arr.length) {
      let products_res = await database.products.find({
        id: { $in: filter_sku_arr }
      })
      if (products_res.success) {

        const products_ids = []
        for (const product of products_res.data) {
          products_ids.push(product._id)
        }
        query.$or = [{product_1_id: {$in: products_ids}}, {product_2_id: {$in: products_ids}}]
      }
    }

    let filtered_res = await database.pairs.find(query)
    const filtered_pairs = []
    for (const pair of filtered_res.data) {
      let is_in_out = false
      for (const _pair of filtered_pairs) {
        if (_pair._id == pair._id) {
          is_in_out = true
          break
        }
      }
      if (!is_in_out) {
        filtered_pairs.push(pair)
      }
    }
    output.filtered = filtered_pairs.length

    let skip = main_settings.results_per_page * (currentPage-1)

    let res = await database.pairs.pagination(
      query,
      {profit: -1},
      skip, main_settings.results_per_page
    )

    if (res.success) {
      for (const pair of res.data) {
        let product_1_res = await database.products.find({_id:pair.product_1_id})
        let product_2_res = await database.products.find({_id:pair.product_2_id})

        let is_in_out = false
        for (const _pair of output.items) {
          if (_pair._id == pair._id) {
            is_in_out = true
            break
          }
        }

        if (!is_in_out) {

          if (!pair.hasOwnProperty('profit') || !pair.hasOwnProperty('profit_perc') || !pair.hasOwnProperty('identity')) {
            const profit_name_identity = await get_profit_name_identity(pair)
            pair.profit = profit_name_identity.profit
            pair.profit_perc = profit_name_identity.profit_perc
            pair.identity = profit_name_identity.identity
          }
          if (!pair.hasOwnProperty('match') || !pair.hasOwnProperty('exeption') || !pair.hasOwnProperty('favorite') || !pair.hasOwnProperty('rank')) {
            const match_exeption_favorite_rank = await get_match_exeption_favorite_rank(pair)
            pair.match = match_exeption_favorite_rank.match
            pair.exeption = match_exeption_favorite_rank.exeption
            pair.favorite = match_exeption_favorite_rank.favorite
            pair.rank = match_exeption_favorite_rank.rank
          }
          if (!pair.hasOwnProperty('amazon_listing')) {
            const amazon_listing = await is_state('amazon_listing', pair.product_1_id, pair.product_2_id)
            pair.amazon_listing = amazon_listing
          }
          if (!pair.hasOwnProperty('inaddible')) {
            const inaddible = await is_state('inaddible', pair.product_1_id, pair.product_2_id)
            pair.inaddible = inaddible
          }
          if (!pair.hasOwnProperty('watch')) {
            const watch = await is_state('watch', pair.product_1_id, pair.product_2_id)
            pair.watch = watch
          }

          const product_1 = product_1_res.data[0]
          const product_2 = product_2_res.data[0]

          if (!product_1.hasOwnProperty('status')) {
            product_1.status = 0
          }
          if (!product_2.hasOwnProperty('status')) {
            product_2.status = 0
          }

          output.items.push({
            _id: pair._id,
            category_name: pair.category_name,
            product_1,
            product_2,
            profit: pair.profit,
            identity: pair.identity,
            selected: false,
            match: pair.match,
            exeption: pair.exeption,
            favorite: pair.favorite,
            amazon_listing: pair.amazon_listing,
            inaddible: pair.inaddible,
            watch: pair.watch
          })
        }

      }
    }
    resolve(output); return
  })
}
function get_amazon_listing_to_show(currentPage = 1){
  return new Promise(async(resolve)=>{
    let output = {
      items: [],
      total: 0,
      filtered: 0
    }

    const query = {
      amazon_listing: true,
      match: true
    }

    let total_res = await database.pairs.find(query)
    const total_pairs = []
    for (const pair of total_res.data) {
      let is_in_out = false
      for (const _pair of total_pairs) {
        if (_pair._id == pair._id) {
          is_in_out = true
          break
        }
      }
      if (!is_in_out) {
        total_pairs.push(pair)
      }
    }
    output.total = total_pairs.length

    if (main_settings.amazon_rank_only) {
      query.rank = { $gt: 0 }
    }
    if (main_settings.match_profit) {
      if (parseInt(main_settings.min_dif_price) || parseInt(main_settings.max_dif_price)) {
        query.profit = {}
        if (parseInt(main_settings.min_dif_price)) {
          query.profit.$gt = parseInt(main_settings.min_dif_price)
        }
        if (parseInt(main_settings.max_dif_price)) {
          query.profit.$lt = parseInt(main_settings.max_dif_price)
        }
      }
      if (parseInt(main_settings.min_dif_percentage) || parseInt(main_settings.max_dif_percentage)) {
        query.profit_perc = {}
        if (parseInt(main_settings.min_dif_percentage)) {
          query.profit_perc.$gt = parseInt(main_settings.min_dif_percentage)
        }
        if (parseInt(main_settings.max_dif_percentage)) {
          query.profit_perc.$lt = parseInt(main_settings.max_dif_percentage)
        }
      }
    }

    if (filter_sku_arr.length) {
      let products_res = await database.products.find({
        id: { $in: filter_sku_arr }
      })
      if (products_res.success) {

        const products_ids = []
        for (const product of products_res.data) {
          products_ids.push(product._id)
        }
        query.$or = [{product_1_id: {$in: products_ids}}, {product_2_id: {$in: products_ids}}]
      }
    }

    let filtered_res = await database.pairs.find(query)
    const filtered_pairs = []
    for (const pair of filtered_res.data) {
      let is_in_out = false
      for (const _pair of filtered_pairs) {
        if (_pair._id == pair._id) {
          is_in_out = true
          break
        }
      }
      if (!is_in_out) {
        filtered_pairs.push(pair)
      }
    }
    output.filtered = filtered_pairs.length

    let skip = main_settings.results_per_page * (currentPage-1)

    let res = await database.pairs.pagination(
      query,
      {profit: -1},
      skip, main_settings.results_per_page
    )

    if (res.success) {
      for (const pair of res.data) {
        let product_1_res = await database.products.find({_id:pair.product_1_id})
        let product_2_res = await database.products.find({_id:pair.product_2_id})

        let is_in_out = false
        for (const _pair of output.items) {
          if (_pair._id == pair._id) {
            is_in_out = true
            break
          }
        }

        if (!is_in_out) {

          if (!pair.hasOwnProperty('profit') || !pair.hasOwnProperty('profit_perc') || !pair.hasOwnProperty('identity')) {
            const profit_name_identity = await get_profit_name_identity(pair)
            pair.profit = profit_name_identity.profit
            pair.profit_perc = profit_name_identity.profit_perc
            pair.identity = profit_name_identity.identity
          }
          if (!pair.hasOwnProperty('amazon_listing')) {
            const amazon_listing = await is_state('amazon_listing', pair.product_1_id, pair.product_2_id)
            pair.amazon_listing = amazon_listing
          }
          if (!pair.hasOwnProperty('watch')) {
            const watch = await is_state('watch', pair.product_1_id, pair.product_2_id)
            pair.watch = watch
          }

          const product_1 = product_1_res.data[0]
          const product_2 = product_2_res.data[0]

          if (!product_1.hasOwnProperty('status')) {
            product_1.status = 0
          }
          if (!product_2.hasOwnProperty('status')) {
            product_2.status = 0
          }

          let source_products = []
          let listing_info = []
          let record_time = 0

          const res_records = await database.watch_records.sort({id:pair.product_2_id},{ updatedAt: 1 })
          if (res_records.success) {
            if (res_records.data.length) {
              const last_record = res_records.data[res_records.data.length - 1]
              source_products = last_record.source_products
              listing_info = last_record.listing_info
              record_time = last_record.updatedAt
            }
          }

          output.items.push({
            _id: pair._id,
            product_1,
            product_2,
            profit: pair.profit,
            identity: pair.identity,
            selected: false,
            match: pair.match,
            favorite: pair.favorite,
            amazon_listing: pair.amazon_listing,
            watch: pair.watch,
            source_products,
            listing_info,
            record_time
          })
        }

      }
    }
    resolve(output); return
  })
}

async function add_or_update_product(product){
  return new Promise(async (resolve) => {

    const in_product_array = await is_in_product_array(product);
    add_product_to_remote(product)
    let res = {success:false};
    if (!in_product_array) {
      res = await database.products.insert(product);
    }else{
      res = await database.products.update({
        id: product.id,
        resource_id: product.resource_id,
      },{$set:{
        name: product.name,
        price: product.price,
        image: product.image,
        status: product.status,
        props: product.props,
      }},{});
      res = await database.products.find({
        id: product.id,
        resource_id: product.resource_id,
      },{});
    }

    if (res.success) {
      resolve(res.data[0]._id);
      return;
    }else{
      resolve(false);
    }

  })
}

async function check_watchers(){
  console.log('check_watchers');
  const parsing_process_id = await watcher.require_parsing_process();
  if (!parsing_process_id) { return; }
  const parsing_process = new ParsingProcess({_id:parsing_process_id});
  const watcher_ids = await watcher.get_watcher_ids();
  let need_start = false;
  for (const watcher_id of watcher_ids) {
    if (await watcher.need_watch(watcher_id)) {
      const record = {
        watcher_id,
        process_id: parsing_process.id
      };
      const in_scan_array = await is_in_scan_array(record);
      if (!in_scan_array) {
        record.parsed = 'new';
        await database.scans.insert(record);
      }else{
        await database.scans.update({
          watcher_id
        },{$set:{
          parsed: 'new'
        }},{})
      }
      need_start = true;
    }
  }
  if (need_start) {
    await parsing_process.update();
    if (parsing_process.scan_status_id != 2) {
      await parsing_process.set_process_status(2);
      if (scan_interval._destroyed) {
        scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
      }
    }
  }
  win.webContents.send('update_parsing_process', parsing_process.info());
}

async function get_custom_urls(){
  const return_custom_urls = [];
  const res = await database.custom_urls.find({})
  if (res.success) {
    for (const custom_url of res.data) {
      custom_url.selected = false;
      return_custom_urls.push(custom_url);
    }
  }
  return return_custom_urls;
}

function pause_if_captcha(){
  if (main_settings.captcha_continue_timeout) {
    if (!scan_interval._destroyed) {
      clearInterval(scan_interval);
      setTimeout(()=>{
        scan_interval = setInterval(scan_parsing_processes, env.interval.scanning);
      }, main_settings.captcha_continue_timeout * 60000);
    }
  }
}
