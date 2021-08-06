const env = require('../modules/env');
const database = require('../modules/database');
const cheerio = require('cheerio');
const axios = require('axios')

class Resource{

  constructor() {
    this.cheerio = cheerio;
  }

  set id(id){return false;}
  set name(name){return false;}
  set url(url){return false;}
  set pre_id_url(pre_id_url){return false;}
  set alias(alias){return false;}
  set listing_url(listing_url){return false;}

  get id(){return this._id;}
  get name(){return this._name;}
  get url(){return this._url;}
  get pre_id_url(){return this._pre_id_url;}
  get alias(){return this._alias;}
  get listing_url(){return this._listing_url;}

  count(){
    return new Promise(async(resolve) => {
      let output = await database.products.count({});
      resolve(output);
    })
  }

  find_local_exeptions(exeption_data){
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

  find_approved_exeptions(exeption_data){
    return new Promise(async(resolve) => {
      const CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      const helper = setTimeout(()=>{
        if (source) {
          source.cancel('Too long');
          resolve([]);
          return;
        }
      }, env.timeout.axios_cancel);
      exeption_data.type = 'approved_exeptions';
      axios.post('http://parser.just-for-testing.website/get_data', exeption_data, {
        cancelToken: source.token
      }).then((res) => {
        source = false;
        resolve(res.data);return;
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('approved_exeptions canceled', error.message);
        } else {
          resolve([]);return;
        }
      })
    })
  }

  get_product_from_local(data){
    return new Promise(async (resolve) => {
      let output = false;
      const res = await database.products.find({
        id:data.sku,
        resource_id:data.resource_id,
      });
      if (res.data.length) {
        const now_date = Date.now();
        const relevance = await this.main_settings('relevance');
        const relevance_date = now_date - parseInt(relevance * env.interval.last_watch_record);
        const product_date = Date.parse(res.data[0].updatedAt);
        if (product_date > relevance_date) {
          output = res.data[0];
        }
      }
      resolve(output);
    })
  }

  get_product_from_remote(data){
    return new Promise(async (resolve) => {
      const CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      const helper = setTimeout(()=>{
        if (source) {
          source.cancel('Too long');
          resolve([]);
          return;
        }
      }, env.timeout.axios_cancel);
      data.type = 'product';
      axios.post('http://parser.just-for-testing.website/get_data', data, {
        cancelToken: source.token
      }).then((res) => {
        source = false;
        if (res.data.length) {
          const product = this.format_product_from_remote(JSON.parse(JSON.stringify(res.data[0])));
          resolve(product);return;
        }else{
          resolve(false);return;
        }
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('get_product_from_remote canceled', error.message);
        } else {
          resolve(false);return;
        }
      })
    })
  }

  check_error_parse(page_type, product){
    return new Promise(async (resolve) => {
      let send_error = false;
      let price = product.price;
      if (!product.name.length) {
        send_error = true;
      }
      if (!product.status) {
        send_error = true;
      }
      if (!price) {
        send_error = true;
      }else{
        price = price.toFixed(2);
      }
      if (!product.image.length) {
        send_error = true;
      }
      if (send_error) {
        const send_data = {
          type: 'error_parse',
          page_type,
          resource_id: product.resource_id,
          sku: product.id,
          data:{
            name: product.name,
            price,
            status: product.status,
            image: product.image,
          }
        };
        try {
          await this.send_error_parse(send_data);
        } catch (e) {
          console.log(e)
        } finally {

        }
      }
      resolve(true);return;
    })
  }

  send_error_parse(data){
    return new Promise(async (resolve) => {
      const CancelToken = axios.CancelToken;
      let source = CancelToken.source();
      const helper = setTimeout(()=>{
        if (source) {
          source.cancel('Too long');
          resolve([]);
          return;
        }
      }, env.timeout.axios_cancel);
      axios.post('http://parser.just-for-testing.website/add_data', data, {
        cancelToken: source.token
      }).then((res) => {
        source = false;
        resolve(true);return;
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          console.log('get_product_from_remote canceled', error.message);
        } else {
          resolve(false);return;
        }
      })
    })
  }

  format_product_from_remote(data){
    let out = false;
    let price = 0;
    let image = '';
    if (data.hasOwnProperty('price')) {
      if (!isNaN(parseInt(data.price))) {
        price = parseInt(data.price)/100;
      }
      if (data.image) {
        image = data.image;
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
      };
      if (data.model !== null) {
        out.props.model == data.model;
      }
      if (utilites.isJson(data.images)) {
        out.props.images == data.images;
      }
    }
    return out;
  }

  parse_category_cell($, cell){
    const name = this.parse_cell_name($, cell);
    const price = this.parse_cell_price($, cell);
    const image = this.parse_cell_image($, cell);
    const href = this.parse_cell_href($, cell);
    const status = this.parse_cell_status($, cell);
    const parsed = this.parse_url(`${this.url}${href}`);
    if (parsed.success) {
      const id = parsed.product.id
      const url = parsed.product.short_url
      const product = {id, name, price, image, url, status, resource_id: this.id, props:{ model:'', rank: 0, images:[]}};
      this.check_error_parse('category_cell',product);
      return product;
    }
    return false;
  }

  parse_url(url){
    const output = {
      resource:{
        id: this.id,
        name: this.name,
        url: this.url,
        pre_id_url: this.pre_id_url,
        alias: this.alias
      },
      product:{
        id:'',
        short_url:''
      },
      success:false
    }
    let regexp
    switch (this.id) {
      case 1:
        regexp = new RegExp('dp\\/([A-z0-9]+)($|\\/ref)');
        break;
      case 2:
        regexp = new RegExp('dp\\/([A-z0-9]+)($|\\/ref)');
        break;
      case 3:
        regexp = new RegExp('\\/([A-z0-9]+)($|\\?)');
        break;
      case 4:
        regexp = new RegExp('\\/([A-z0-9]+)($|\\?)');
        break;
      case 5:
        regexp = new RegExp('\\/([A-z0-9]+)($|\\?)');
        break;
      case 6:
        regexp = new RegExp('\\/([A-z0-9]+)($|\\?)');
        break;
      default:
        return output;
    }
    try {
      if (regexp.test(url)) {
        const id = url.match(regexp)[1];
        if (id.length) {
          output.success = true
          output.product.id = id;
          output.product.short_url = output.resource.pre_id_url + id;
        }
      }
    } catch (e) {
      console.log('e: ',e);
    } finally {
      return output;
    }
  }

  parse_price(_str){
    if (_str.toLowerCase().includes('unavailable')) {
      return 0
    }

    let str = _str.replace(/ /g, '').trim();

    let regexp = new RegExp('\\$([0-9\\.]+)');
    if (regexp.test(str)) {
      return parseFloat(str.match(regexp)[1], 2);
    }

    regexp = new RegExp('CDN([0-9\\.]+)');
    if (regexp.test(str)) {
      return parseFloat(str.match(regexp)[1], 2);
    }

    return 0;
  }

  main_settings(name){
    return new Promise(async (resolve) => {
      const res = await database.settings.find({name});
      resolve(res.data[0].value);
    })
  }

}

module.exports = Resource
