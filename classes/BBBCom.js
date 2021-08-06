const Resource = require('./Resource.js');
const resource_functions = require('../modules/resource_functions').default;
const utilites = require('../modules/utilites').default;
const env = require('../modules/env');

class BBBCom extends Resource {

  constructor() {
    super()

    this._id = 5
    this._name = 'bedbathandbeyond.com'
    this._url = 'https://www.bedbathandbeyond.com/'
    this._pre_id_url = 'https://www.bedbathandbeyond.com/store/product/id/'
    this._alias = 'bedbathandbeyond_com'
  }

  get_category_products(page, category_url){
    return new Promise(async(resolve) => {
      const output = {success: true, data: [], error: false};
      if (page.isClosed()) {output.success = false;output.error = 'error get_category_products page';resolve(output);return;}
      try {
        await page.goto(category_url,{
          referer: this.url,
          timeout: env.timeout.page_selector,
          waitUntil: 'networkidle2'
        }).catch((e) => {
          // console.error(e)
          output.success = false;
          output.error = 'error get_category_products page';
          resolve(output);return;
        })
        await utilites.delay(1000);
        await page.waitForSelector('body',{timeout: 100000});

        let page_url = await page.url();

        const page_url_arr = page_url.split('/');
        const wo_pages_arr = page_url_arr.filter(url_part => !url_part.includes('1-'));
        const last_url_part = wo_pages_arr.pop();
        const first_page_url = wo_pages_arr.join('/') + '/1-96/' + last_url_part;

        await page.goto(first_page_url,{
          referer: this.url,
          timeout: env.timeout.page_selector,
          waitUntil: 'networkidle2'
        }).catch((e) => {
          // console.error(e)
          output.success = false;
          output.error = 'error get_category_products page';
          resolve(output);return;
        })

        await utilites.delay(1000);
        const element = await page.$('.rclCloseBtnWrapper');
        if (element) {
          await element.click();
          await utilites.delay(1000);
        }
        await utilites.scroll_page(page);
        await utilites.delay(5000);
        let html = await page.$eval('body', el => el.innerHTML);
        const $ = this.cheerio.load(html);
        let products = this.parse_category_grid($);

        const page_count = this.get_page_count($);

        if (page_count > 1) {
          for (let i = 2; i <= page_count; i++) {
            const url = first_page_url.replace('1-96', `${i}-96`);
            await utilites.delay(1000);
            const _products_res = await this.get_page_product(page, url);
            if (_products_res.success) {
              if (_products_res.data.length) {
                products = products.concat(_products_res.data);
              }
            }else{
              console.log(_products_res.error);
            }
          }
        }
        output.data = products;
        resolve(output);
      } catch (e) {
        console.log(e);
        output.success = false;
        output.error = 'error get_category_products try';
        resolve(output);
      }
    });
  }
  parse_category_grid($){
    const out = [];
    const cell_selector = '.ProductGrid-inline_6D1SUq article';
    $(cell_selector).each((index)=>{
      const product = this.parse_category_cell($, $(cell_selector)[index]);
      if (product) {
        out.push(product);
      }
    })
    return out;
  }
  parse_cell_name($, cell){
    const a = $(cell).find('.ProductTile-inline_2u00tP').find('a');
    const name = $(a).text();
    return name;
  }
  parse_cell_price($, cell){
    let price = 0;
    let price_block = $(cell).find('.Price_3HnIBb');
    if (price_block.length) {
      let price_text = $(price_block).text();
      if (typeof price_text === 'string') {
        if (!price_text.includes('[')) {
          price = this.parse_price(price_text);
        }
      }
    }
    return price;
  }
  parse_cell_image($, cell){
    const img_url = $(cell).find('.Thumbnail_4q2qnF').find('img').attr('src');
    const image = this.get_image_url(img_url);
    return image;
  }
  parse_cell_href($, cell){
    const a = $(cell).find('.ProductTile-inline_2u00tP').find('a');
    const href = $(a).attr('href');
    return href;
  }
  parse_cell_status($, cell){
    let status = 0;
    const cell_html = $(cell).html().toLowerCase();
    if (cell_html.includes('free shipping')) {
      status = 2;
    }
    return status;
  }
  get_page_product(page, url){
    return new Promise(async (resolve) => {
      const output = {success: true, data: [], error: false};
      if (page.isClosed()) {output.success = false;output.error = 'error get_page_product page';resolve(output);return}
      setTimeout(() => {output.success = false;output.error = 'error get_page_product page timeout';resolve(output);return}, env.timeout.page_close);
      await page.goto(url,{
        referer: this.url,
        timeout: env.timeout.page_selector,
        waitUntil: 'networkidle2'
      }).catch((e) => {
        // console.error(e)
        output.success = false;
        output.error = 'error get_page_product page';
        resolve(output);return;
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000})
      const element = await page.$('.rclCloseBtnWrapper');
      if (element) {
        await element.click();
        await utilites.delay(1000);
      }
      await utilites.scroll_page(page)
      await utilites.delay(3000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = this.cheerio.load(html)

      const products = this.parse_category_grid($);
      output.data = products;
      resolve(output);
    })
  }
  get_page_count($){
    const pages = $('.Pagination_6pzHge .Pagination_5motT0 > li');
    let page_count = $(pages[pages.length - 1]).find('a').text();
    return parseInt(page_count);
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
    try {
      let regexp = new RegExp('\\/([A-z0-9]+)($|\\?)');
      if (regexp.test(url)) {
        const id = url.match(regexp)[1]
        output.product.id = id
        output.product.short_url = output.resource.pre_id_url + id
      }
      if (output.product.id.length) {
        output.success = true
      }
      return output
    } catch (e) {
      output.success = false
      return output
    }
  }
  get_image_url(url){
    const _url = url

    if (!url && typeof url !== 'string') {
      console.log(_url, 'return_1')
      return ''
    }

    if (url.includes('product-image-placeholder')) {
      console.log(_url, 'return_2')
      return ''
    }

    url = url.replace(/\/\//g,'')
    if (url.includes('walmartimages.ca')) {
      url = url.replace('Thumbnails','Large')
      url = url.split('?')[0]
    }else if (url.includes('walmartimages.com')) {
      url = url.split('?')[0]
    }else if (url.toLowerCase().includes('bedbathandbeyond')) {
      url = url.split('?')[0]
    }

    url = url.replace('https:b3h2','b3h2')
    url = url.replace('https:i5','i5')

    if (!url.includes('https://')) {
      url = 'https://' + url
    }

    return url
  }

  scan_product(page, data){
    return new Promise(async(resolve) => {
      const output = {success: true, data: [], error: false};
      let product = false;
      let url = false;
      if (data.hasOwnProperty('sku')) {
        url = this.pre_id_url + data.sku;
      }else if (data.hasOwnProperty('url')) {
        url = data.url;
      }
      if (!url) {output.success = false;output.error = 'error scan_product url';resolve(output);return;}
      setTimeout(() => {output.success = false;output.error = 'error scan_product timeout';resolve(output);return}, env.timeout.page_close);
      await page.goto(url,{
        referer: this.url,
        timeout: env.timeout.page_selector,
        waitUntil: 'networkidle2'
      }).catch((e) => {
        // console.error(e)
        output.success = false;
        output.error = 'error scan_product page';
        resolve(output);return;
      })
      await utilites.delay(1000);
      const page_title = (await page.title()).toLowerCase();
      if (page_title == 'robot check') {
      }
      await page.waitForSelector('body',{timeout: env.timeout.page_selector});
      await utilites.scroll_10_page(page);
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);
      const data_1 = this.parse_url(url);
      if (data_1.success) {
        const data_2 = this.parse_product_html(html);
        product = {
          id: data_1.product.id,
          resource_id: data_1.resource.id,
          name: data_2.name,
          status: data_2.status,
          price: data_2.price,
          url: data_1.product.short_url,
          image: data_2.image,
          props:{
            model: data_2.model,
            rank: data_2.rank,
            images: data_2.images
          }
        };
        this.check_error_parse('product_page',product);
      }
      output.data = product;
      resolve(output);return;
    })
  }

  parse_product_html(html){
    const $ = this.cheerio.load(html);
    const parsed_images = this.parse_product_images($);
    return {
      name: this.parse_product_name($),
      model: this.parse_product_model($),
      image: parsed_images.image,
      images: parsed_images.images,
      status: this.parse_product_status($),
      price: this.parse_product_price($),
      rank: this.parse_product_rank($)
    };

  }
  parse_product_name($){
    let name = $('h1').text();
    return name;
  }

  parse_product_model($){
    let model = '';
    return model;
  }

  parse_product_images($){
    let image = '';
    const images = [];
    let skip_first_image = false;
    $('.ProductMediaCarouselStyle_2Ys9tp').find('img').each(function(){
      const _img_src = $(this).attr('src');
      const image_arr = _img_src.split('?');
      const img_url = image_arr[0];
      if (skip_first_image) {
        images.push(img_url);
      }else{
        skip_first_image = true;
        image = img_url;
      }
    })
    if (!image.length) {
      const img = $('.ProductMediaCarouselStyle_2hNvbw').find('img');
      const _img_src = $(img).attr('src');
      const image_arr = _img_src.split('?');
      image = image_arr[0];
    }
    return {image, images};
  }

  parse_product_status($){
    let status = 0;
    let info_block = $('#pdpShipIt');
    if (info_block.length) {
      const info_block_html = info_block.html().toLowerCase()
      if (info_block_html.includes('price unavailable') ||
          info_block_html.includes('out of stock online')) {
        status = 1;
      }
      if (!status) {
        if (info_block_html.includes('is sold online only') ||
            info_block_html.includes('add to cart')) {
          status = 2;
        }
      }
    }
    return status;
  }

  parse_product_price($){
    let price_text = null;
    let price = NaN;

    if ($('#item-price').length && isNaN(price)) {
      $('#item-price').find('span').each((span)=>{
        if (typeof $(span).attr('itemprop') !== 'undefined' && typeof $(span).attr('content') !== 'undefined') {
          const itemprop = $(span).attr('itemprop').toLowerCase()
          if (itemprop == 'lowprice' || itemprop == 'price') {
            price_text = $(span).attr('content');
            price = this.parse_price(price_text);
          }
        }
      })
    }

    if ($('.PDPPrice_3HTapM').length && isNaN(price)) {
      price_text = $('.PDPPrice_3HTapM').text();
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0];
      }
      price = this.parse_price(price_text);
    }

    if ($('.PDPPrice-inline_2DaTZO').length && isNaN(price)) {
      price_text = $('.PDPPrice-inline_2DaTZO').text();
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0];
      }
      price = this.parse_price(price_text);
    }
    return price;
  }

  parse_product_rank($){
    return 0;
  }

}

module.exports = BBBCom
