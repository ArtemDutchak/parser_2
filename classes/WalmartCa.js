const Resource = require('./Resource.js');
const env = require('../modules/env');
const resource_functions = require('../modules/resource_functions').default;
const utilites = require('../modules/utilites').default;

class WalmartCa extends Resource {

  constructor() {
    super()

    this._id = 4
    this._name = 'walmart.ca'
    this._url = 'https://www.walmart.ca/'
    this._pre_id_url = 'https://www.walmart.ca/en/ip/'
    this._alias = 'walmart_ca'
  }

  get_category_products(page, category_url){
    return new Promise(async(resolve) => {
      const output = {success: true, data: [], error: false};
      if (page.isClosed()) {output.success = false;output.error = 'error get_category_products page';resolve(output);return;}
      try {
        let is_search = false
        if (category_url.includes('/search?q=')) {
          is_search = true
        }else{
          category_url = category_url.split('?')[0]
        }
        if (this.main_settings.walmart_ca_retailer_only) {
          if (is_search) {
            if (!category_url.includes('&f=')) {
              category_url = category_url + '&f=10000041'
            }else{
              const url_brand_arr = category_url.split('&f=')
              category_url = url_brand_arr[0] + '&f=10000041'
            }
          }else{
            if (!category_url.includes('+10000041')) {
              const cat_url_arr = category_url.split('/')
              for (const [index, part] of cat_url_arr.entries()) {
                if (part.startsWith('N-')) {
                  cat_url_arr[index] = part + '+10000041'
                }
              }
            }
          }
        }
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
        await page.waitForSelector('body',{timeout: env.timeout.page_selector});
        await utilites.scroll_page(page)
        await utilites.delay(3000);
        let html = await page.$eval('body', el => el.innerHTML);
        const $ = this.cheerio.load(html);
        category_url = page.url();
        let products = this.parse_category_grid($);
        const page_count = this.get_page_count($, is_search);
        if (page_count > 1) {
          for (let i = 2; i <= page_count; i++) {
            let url = ''
            if (is_search) {
              url = category_url + '&p=' + i
            }else{
              url = category_url + '/page-' + i
            }
            const _products_res = await this.get_page_product(page, url);
            if (_products_res.success) {
              if (_products_res.data.length) {
                products = products.concat(_products_res.data);
              }
            }else{
              console.log(_products_res.error);
            }
            await utilites.delay(1000);
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

  get_page_count($, is_search){
    let page_count = 1;

    if (is_search) {
      const pages = $('.css-11g8j19.ed60zyg1 a');
      page_count = $(pages[pages.length - 1]).find('.css-ijjviy.ed60zyg11').text();
    }else{
      const pages = $('.page-select-list li');
      page_count = $(pages[pages.length - 1]).find('a').text();
    }

    return parseInt(page_count);
  }

  parse_category_grid($){
    const out = [];
    // const cell_selector = '.shelf-thumbs article';
    const cell_selector = '#product-results div';
    console.log($(cell_selector).length)
    $(cell_selector).each(index => {
      const product = this.parse_category_cell($, $(cell_selector)[index]);
      const skuIds = this.parse_skuIds($, $(cell_selector)[index]);
      if (product) {
        product.skuIds = skuIds;
        out.push(product);
      }
    })
    return out;
  }
  parse_skuIds($, cell){
    // const bind = $(cell).find('.offerID').attr('data-bind');
    // return bind;
    // if (bind.includes(`viewGroceryEligible ? '`) && bind.includes(`' : ''}`)) {
    //   let arr_01 = bind.split(`viewGroceryEligible ? '`)
    //   let arr_02 = arr_01[1].split(`' : ''}`)
    //   out.push('https://www.walmart.ca' + arr_02[0])
    // }
    const json = $(cell).find('.productSkus').attr('value');
    // const parsed = JSON.parse(json);
    return json;
  }
  parse_cell_name($, cell){
    const name = $(cell).find('.thumb-header').text().trim();
    return name;
  }
  parse_cell_price($, cell){
    let price_text = '';
    let price_block = $(cell).find('.product-price-analytics');
    if (price_block.length) {
      price_text = $(price_block).attr('data-analytics-value');
    }
    if (typeof price_text !== 'string') {
      price_text = $(cell).find('.price-current').text()
    }else{
      if (price_text.includes('[')) {
        price_text = $(cell).find('.price-current').text()
      }
    }
    let price = this.parse_price(price_text);
    return price;
  }
  parse_cell_image($, cell){
    const img_url = $(cell).find('img').attr('data-original') || $(cell).find('img').attr('src');
    const image = utilites.get_image_url(img_url);
    return image;
  }
  parse_cell_href($, cell){
    const href = $(cell).find('a.product-link').attr('href');
    return href;
  }
  parse_cell_status($, cell){
    let status = 0;
    const availability_div = $(cell).find('.availability-online');
    const availability_span = $(availability_div).find('span');
    if ($(availability_div).hasClass('available') && $(availability_span).text() != 'Out of stock online') {
      status = 2;
    }
    return status;
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
      await utilites.delay(1000);
      try {
        if (page.isClosed()) {return product};
        await page.goto(url,{
          referer: this.url,
          timeout: env.timeout.page_selector,
          waitUntil: 'networkidle2'
        }).catch((e) => {
          // console.error(e)
          output.success = false;
          output.error = 'error scan_product page';
          resolve(output);
          return;
        })
        await utilites.delay(2000);
        const page_title = (await page.title()).toLowerCase();
        const page_url = await page.url();
        await utilites.scroll_10_page(page);
        if (page_title == 'verify your identity' || page_url.includes(`${this.url}/blocked?`)) {
          console.log('blocked');
          output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
        }
        await page.waitForSelector('body',{timeout: env.timeout.page_selector});
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
      } catch (e) {
        output.success = false;output.error = 'error scan_product try';resolve(output);return;
      } finally {
        output.data = product;
        resolve(output);return;
      }
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
    $('.e1cuz6d10').find('.e1cuz6d11').each(function(){
      const t = $(this).find('.e1cuz6d12').text();
      if (t.includes('Model #')) {
        model = $(this).find('.e1cuz6d13').text();
      }
    })
    if (typeof model == 'undefined' || model.length < 2) {
      model = '';
    }
    model = model.trim();
    return model;
  }

  parse_product_images($){
    let image = '';
    const images = [];
    let skip_first_image = false;
    $('.css-eg1wuf.ervhxpq0').find('img').each(function(){
      const _img_src = $(this).attr('src');
      const image_arr = _img_src.split('?');
      const img_url = image_arr[0];
      if (utilites.isImage(img_url)) {
        if (!image.length) {
          image = img_url;
        }else{
          if (skip_first_image) {
            images.push(img_url);
          }else{
            skip_first_image = true;
          }
        }
      }
    })
    return {image, images};
  }

  parse_product_status($){
    let status = 0;
    const info_block = $('.css-18f77yw.eewy8oa4');
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
    let price = 0;
    let price_text_1 = $('.css-j7qwjs .css-49bqys.e1bu9qyp1');
    let price_text_2 = $('.css-j7qwjs .css-2vqe5n.esdkp3p0');
    let price_text_3 = $('.prod-PriceSection .price .visuallyhidden');
    let price_text_4 = $('.css-5ki3bg.e1yn5b3f5 .css-2vqe5n.esdkp3p0');
    if (price_text_1.length && !price) {
      price = this.parse_price(price_text_1.text());
    }
    if (price_text_2.length && !price) {
      price = this.parse_price(price_text_2.text());
    }
    if (price_text_3.length && !price) {
      price = this.parse_price(price_text_3.text());
    }
    if (price_text_4.length && !price) {
      price = this.parse_price(price_text_4.text());
    }
    return price;
  }

  parse_product_rank($){
    return 0;
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
        output.error = 'error get_page_product';
        resolve(output);return;
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: env.timeout.page_selector});
      await utilites.scroll_page(page);
      await utilites.delay(3000);
      // const arr = await page.evaluate( _ => {
      //   return set_val();
      //   function set_val () {
      //     return new Promise(async(resolve,reject) => {
      //       const arr = [];
      //       const inputs = document.querySelectorAll('.offerID')
      //       for (let i = 0; i < inputs.length; i++) {
      //         arr.push(inputs[i].value)
      //       }
      //       resolve(arr);
      //     })
      //   }
      // });
      // console.log(arr)

      let html = await page.$eval('body', el => el.innerHTML);
      const $ = this.cheerio.load(html);

      const products = this.parse_category_grid($);
      output.data = products;
      resolve(output);
    })
  }

  parse_price(_str){
    if (_str.toLowerCase().includes('unavailable')) {
      return 0;
    }
    const _str_arr = _str.split('to $');
    _str = _str_arr[0];
    let str = _str.replace(/ /g, '').trim();
    if (str.includes(',')) {
      str = str.replace(',', '');
    }
    if (str.includes('$')) {
      str = str.replace('$', '');
    }
    if (str.includes('CDN')) {
      str = str.replace('CDN', '');
    }
    const price = parseFloat(str, 2);
    if (price > 0) {
      return price;
    }else{
      return 0;
    }
  }

}

module.exports = WalmartCa
