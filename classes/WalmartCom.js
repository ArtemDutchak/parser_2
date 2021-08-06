const Resource = require('./Resource');
const env = require('../modules/env');
const resource_functions = require('../modules/resource_functions').default;
const utilites = require('../modules/utilites').default;

class WalmartCom extends Resource {

  constructor() {
    super()

    this._id = 3
    this._name = 'walmart.com'
    this._url = 'https://www.walmart.com/'
    this._pre_id_url = 'https://www.walmart.com/ip/'
    this._alias = 'walmart_com'
  }

  get_category_products(page, category_url){
    return new Promise(async(resolve) => {
      const output = {success: true, data: [], error: false};
      if (page.isClosed()) {output.success = false;output.error = 'error get_category_products page';resolve(output);return;}
      try {
        let is_search = false;
        if (category_url.includes('/search/') && category_url.includes('?query=')) {
          is_search = true;
        }
        if (this.main_settings.walmart_com_retailer_only) {
          if (!category_url.includes('?')) {
            category_url = category_url + '?facet=retailer%3AWalmart.com';
          }else{
            if (category_url.includes('facet=')) {
              category_url = category_url.replace('facet=', 'facet=retailer%3AWalmart.com%7C%7C');
            }else{
              category_url = category_url + 'facet=retailer%3AWalmart.com';
            }
          }
        }
        await page.goto(category_url,{
          referer: this.url,
          timeout: env.timeout.page_selector,
          waitUntil: 'networkidle2',
        }).catch((e) => {
          // console.error(e)
          output.success = false;output.error = 'error get_category_products page';resolve(output);return;
        })
        await utilites.delay(1000);
        await page.waitForSelector('body',{timeout: 100000});
        await utilites.scroll_page(page)
        await page.waitForSelector('#searchProductResult',{timeout: 100000});
        await utilites.delay(3000);
        let html = await page.$eval('body', el => el.innerHTML);
        const $ = this.cheerio.load(html);

        category_url = page.url();

        let products = this.parse_category_grid($);
        const page_count = this.get_page_count($);

        if (page_count > 1) {
          for (let i = 2; i <= page_count; i++) {
            const url = category_url + '&page=' + i
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
      setTimeout(() => {output.success = false;output.error = 'error scan_product timeout';resolve(output);return;}, env.timeout.page_close);
      try {
        if (page.isClosed()) {return product};
        await page.goto(url,{
          referer: this.url,
          timeout: env.timeout.page_selector,
          waitUntil: 'networkidle2'
        }).catch((e) => {
          // console.error(e);
          output.success = false;output.error = 'error scan_product page';resolve(output);return;
        })
        await utilites.delay(2000);
        const page_title = (await page.title()).toLowerCase();
        const page_url = await page.url();
        await utilites.scroll_10_page(page);
        await utilites.delay(2000);
        if (page_title == 'verify your identity' || page_url.includes(`${this.url}/blocked?`)) {
          console.log('blocked');
          output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
        }
        await page.waitForSelector('body',{timeout: env.timeout.page_selector});
        let html = await page.$eval('body', el => el.innerHTML);
        const $ = this.cheerio.load(html);
        const data_1 = this.parse_url(url);
        if (data_1.success) {
          const data_2 = this.parse_product_page($);
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
    return this.parse_product_page($)
  }

  parse_product_page($){
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
    $('#specifications').find('table').find('tr').each(function(){
      $(this).find('div').each(function(){
        if ($(this).attr('itemprop').toLowerCase() == 'model') {
          model = $(this).text().trim();
        }
      })
    })
    return model;
  }

  parse_product_images($){
    let image = '';
    const images = [];
    $('#product-overview ul.slider-list').find('img').each(function(){
      const _img_src = $(this).attr('src');
      const image_arr = _img_src.split('?');
      let img_url = image_arr[0];
      if (!img_url.includes('https://')) {
        img_url = img_url.replace('//i5.walmartimages.com','https://i5.walmartimages.com');
      }
      if (utilites.isImage(img_url)) {
        if (!image.length) {
          image = img_url;
        }else{
          images.push(img_url);
        }
      }
    })
    return {image, images};
  }

  parse_product_status($){
    let status = 0;
    const info_block = $('.hf-Bot');
    if (info_block.length) {
      const info_block_html = info_block.html().toLowerCase();
      if (info_block_html.includes('out of stock') ||
          info_block_html.includes('delivery not available') ||
          info_block_html.includes('get in-stock alert')) {
        status = 1;
      }
      if (!status) {
        if (info_block_html.includes('add to cart')) {
          status = 2;
        }
      }
    }
    return status;
  }

  parse_product_price($){
    let price = 0;
    let price_text = '';
    $('.price-characteristic').each(function(){
      const price_attr = $(this).attr('content');
      if (typeof price_attr !== 'undefined') {
        price_text = price_attr;
      }
    })
    if (price_text.length) {
      price = this.parse_price(price_text)
    }

    let price_text_3 = $('.prod-PriceSection');
    if (price_text_3.length && !price) {
      price = this.parse_price(price_text_3.text());
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
      await page.waitForSelector('body',{timeout: 100000})
      await utilites.scroll_page(page)
      await page.waitForSelector('#searchProductResult',{timeout: 100000});
      await utilites.delay(3000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = this.cheerio.load(html);

      const products = this.parse_category_grid($);
      output.data = products;
      resolve(output);
    })
  }

  get_page_count($){
    const pages = $('.paginator-list').find('li');
    let page_count_text = $(pages[pages.length - 1]).find('a').text();
    let page_count = parseInt(page_count_text);
    return page_count;
  }

  parse_category_grid($){
    const out = [];
    const cell_selector = '#searchProductResult li';
    $(cell_selector).each(index => {
      const product = this.parse_category_cell($, $(cell_selector)[index]);
      if (product) {
        out.push(product);
      }
    })
    return out;
  }
  parse_cell_name($, cell){
    const img_url = $(cell).find('img').attr('data-image-src') || $(cell).find('img').attr('src');
    const name = $(cell).find('img').attr('alt');
    return name;
  }
  parse_cell_price($, cell){
    let price = 0;
    let price_block = $(cell).find('.price-main-block ');
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
    const img_url = $(cell).find('img').attr('data-image-src') || $(cell).find('img').attr('src');
    const image = utilites.get_image_url(img_url);
    return image;
  }
  parse_cell_href($, cell){
    let href = $(cell).find('a.product-title-link').attr('href');
    if (typeof href == 'undefined') {
      href = $(this).find('a.search-result-productimage').attr('href')
    }
    if (typeof href !== 'undefined' && href.includes(`/ip/`)) {
      return href;
    }
    return '';
  }
  parse_cell_status($, cell){
    let status = 0
    const cell_html = $(cell).html().toLowerCase();
    if (cell_html.includes('free shipping') ||
        cell_html.includes('delivery') ||
        cell_html.includes('shipping') ||
        cell_html.includes('shipped')) {
      status = 2;
    }
    return status;
  }

}

module.exports = WalmartCom
