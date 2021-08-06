const Resource = require('./Resource.js');
const env = require('../modules/env');
const utilites = require('../modules/utilites').default;

class AmazonCom extends Resource {

  constructor() {
    super()

    this._id = 1
    this._name = 'amazon.com'
    this._url = 'https://www.amazon.com/'
    this._pre_id_url = 'https://www.amazon.com/dp/'
    this._alias = 'amazon_com'
    this._listing_url = this._pre_id_url + 'paste_asin_here/ref=olp_dp_redir#aod'
  }

  find_product(page, database_product){
    return new Promise(async(resolve) => {
      const output = {success: true, data: [], error: false};
      let finded_product = false;
      setTimeout(() => {output.success = false;output.error = 'error find_product page timeout';resolve(output);return}, env.timeout.page_close);
      const search_request = database_product.name;
      const amazon_request = `https://www.amazon.com/s?k=${utilites.encode_to_request(search_request)}&ref=nb_sb_noss`;
      await page.goto(amazon_request,{
        referer: this.url,
        timeout: env.timeout.page_selector,
        waitUntil: 'networkidle2'
      }).catch((e) => {
        // console.error(e)
        output.success = false;
        output.error = 'error find_product page';
        resolve(output);return;
      })
      await utilites.delay(2000);
      const page_title = await page.title();
      if (page_title == 'Robot Check') {
        output.success = false;output.error = 'error find_product captcha';
        resolve(output);return;
      }
      if (page_title.includes('Something Went Wrong')) {
        output.success = false;output.error = 'error find_product captcha';
        resolve(output);return;
      }
      await page.waitForSelector('body',{timeout: env.timeout.page_selector});
      await utilites.scroll_50_page(page);
      await utilites.delay(2000);
      const html = await page.$eval('body', el => el.innerHTML);
      const $ = this.cheerio.load(html);

      if ($('#captchacharacters').length || html.toLowerCase().includes('type the characters you see in this image')) {
        output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
      }

      let founded_url = '';
      let founded = false;

      const result_items = $('.s-result-item');
      const result_items_length = result_items.length;

      const exeption_data = {
        sku_1: database_product.id,
        resource_1_id: database_product.resource_id,
        resource_2_id: 1,
      };

      const local_exeptions = await this.find_local_exeptions(exeption_data);
      let approved_exeptions = [];
      let searched_approve = false;

      const relevance = await this.main_settings('relevance');

      try{

        for (let i = 0; i < result_items_length; i++) {

        const result_item = result_items[i];
        if ($(result_item).html().toLowerCase().includes('sponsored')){continue;}

        const product_url = $(result_item).find('h2 a').attr('href');
        if (typeof product_url !== 'undefined') {
          if (product_url.includes('dp/')) {

            const regexp = '\/dp\/(.*)\/';
            let id = product_url.match(regexp)[1];
            let product_url_arr = product_url.split(id);
            const _url = 'https://www.amazon.com' + product_url_arr[0] + id;

            const parsed = this.parse_url(_url);

            if (parsed.success) {

              let is_in_exeption = false;
              if (local_exeptions.includes(id)){continue;}

              if (!searched_approve) {
                approved_exeptions = await this.find_approved_exeptions(exeption_data);
                searched_approve = true;
              }

              if (approved_exeptions.includes(id)){continue;}

              founded_url = _url;
              founded = true;

              const product_data = {
                sku: parsed.product.id,
                resource_id: parsed.resource.id,
                relevance
              };

              finded_product = await this.get_product_from_local(product_data);
              if (finded_product && finded_product.image && finded_product.price) {
                output.data = finded_product;
                resolve(output);return;
              }

              finded_product = await this.get_product_from_remote(product_data);
              if (finded_product && finded_product.image && finded_product.price) {
                output.data = finded_product;
                resolve(output);return;
              }

              const finded_product_res = await this.scan_product(page, {url:founded_url});
              if (finded_product_res.success) {
                output.data = finded_product_res.data;
                resolve(output);return;
              }else{
                if (finded_product_res.error.includes('captcha')) {
                  output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
                }
              }

            }

          }
        }

      }
      output.data = finded_product;
      resolve(output);

    }catch(err){
      console.log(err)
      output.success = false;
      resolve(output);return
    }
    })
  }

  scan_product(page, data, with_listing_info = false){
    return new Promise(async(resolve) => {
      const output = {success: true, data: [], error: false};
      let amazon_url = false;
      if (data.hasOwnProperty('sku')) {
        amazon_url = this.pre_id_url + data.sku;
      }else if (data.hasOwnProperty('url')) {
        amazon_url = data.url;
      }
      if (!amazon_url) {output.success = false;output.error = 'error scan_product url';resolve(output);return;}
      setTimeout(() => {output.success = false;output.error = 'error scan_product timeout';resolve(output);return}, env.timeout.page_close);
      amazon_url = amazon_url + '/ref=olp_dp_redir#aod'
      amazon_url = amazon_url.replace('//ref=olp_dp_redir#aod', '/ref=olp_dp_redir#aod');
      await page.goto(amazon_url,{
        referer: this.url,
        timeout: env.timeout.page_selector,
        waitUntil: 'networkidle2'
      }).catch((e) => {
        // console.error(e)
        output.success = false;
        output.error = 'error scan_product page';
        resolve(output);return;
      })
      await page.waitForSelector('body',{timeout: env.timeout.page_selector});
      await utilites.delay(1000);
      const page_title = (await page.title()).toLowerCase();
      if (page_title == 'robot check') {
        output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
      }
      if (page_title.includes('something went wrong')) {
        output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
      }
      await utilites.scroll_50_page(page);

      const element = await page.$('#availability a');
      if (element) {
        await element.click().catch((e) => {
          console.error('click:',e)
        });
        await utilites.delay(1000);
      }

      const html = await page.$eval('body', el => el.innerHTML);
      const $ = this.cheerio.load(html);
      if ($('#captchacharacters').length || html.toLowerCase().includes('type the characters you see in this image')) {
        output.success = false;output.error = 'error scan_product captcha';resolve(output);return;
      }
      const data_1 = this.parse_url(amazon_url);
      const data_2 = this.parse_product_page($);
      const product = {
        id: data_1.product.id,
        resource_id: data_1.resource.id,
        name: data_2.name,
        price: data_2.price,
        url: data_1.product.short_url,
        image: data_2.image,
        status: data_2.status,
        props:{
          model: data_2.model,
          rank: data_2.rank,
          images: data_2.images
        }
      }
      this.check_error_parse('product_page',product);

      if (with_listing_info) {
        const listing = this.parse_listing_page($);
        output.data = {
          product_info: product,
          listing_info: listing
        };
        resolve(output);return;
      }

      output.data = product;
      resolve(output);return;

    })
  }

  scan_product_with_listing_info(page, sku){
    return new Promise(async (resolve) => {
      // const url = this.listing_url.replace('paste_asin_here', asin);
      const amazon_info = await this.scan_product(page, {sku}, true);
      resolve(amazon_info);
    });
  }

  parse_product_html(html){
    const $ = this.cheerio.load(html);
    return this.parse_product_page($);
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

  parse_listing_page($){
    const offer_count_input = $('#aod-total-offer-count').val();
    const out = [];
    $('#aod-offer-list > div').each(index => {

      const offer = $('#aod-offer-list > div')[index];
      const condition = $(offer).find('h5').text().trim();
      const price = this.parse_price($('#aod-price-' + (index+1)).text());
      const seller = $(offer).find('#aod-offer-soldBy a').text().trim();

      out.push({price,condition,seller});
    });

    return out;
  }

  parse_product_name($){
    let name = $('#productTitle').text().trim();
    return name;
  }

  parse_product_model($){
    let model = '';
    $('#productDetails_detailBullets_sections1').find('tr').each(function(){
      const th_txt = $(this).find('th').text();
      if (th_txt && th_txt.includes('model number')) {
        model = $(this).find('td').text().trim();
      }
    })
    return model;
  }

  parse_product_images($){
    let image = '';
    const images = [];
    let img_wrapper = $('#imgTagWrapperId');
    let _img = $(img_wrapper).find('img');
    if ($(_img).length) {
      image = this.get_amazon_image($(_img).attr('data-a-dynamic-image'));
    }

    if (!image.length) {
      const img = $('#ebooksImgBlkFront');
      if (img.length) {
        image = $(img).attr('src');
      }
    }

    if (!image.length) {
      const img = $('#img-canvas img');
      if (img.length) {
        image = $(img).attr('src');
      }
    }

    return {image, images};
  }

  parse_product_status($){
    let cart_block = $('#partialStateBuybox');
    if (cart_block.length) {
      if ($(cart_block).html().toLowerCase().includes('add to cart')) {
        return 2;
      }
    }

    let availability_div = $('#availability');

    if (availability_div.length) {

      const availability_div_html = $(availability_div).html().toLowerCase();

      if (availability_div_html.includes('currently unavailable')) {
        return 1;
      }
      if (availability_div_html.includes('these sellers')) {
        return 2;
      }
      if (availability_div_html.includes('free shipping')) {
        return 2;
      }

      const availability_span = $(availability_div).find('span');
      if (availability_span.length) {
        if ($(availability_span).text().toLowerCase().includes('in stock')) {
          return 2;
        }
      }

    }

    availability_div = $('#olp-upd-new-freeshipping-threshold');
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('free shipping')) {
        return 2;
      }
    }
    availability_div = $('#olp-upd-new-freeshipping')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('free shipping')) {
        return 2;
      }
    }
    availability_div = $('#olp-upd-new')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('shipping')) {
        return 2;
      }
    }
    availability_div = $('#deliveryMessageMirId')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('delivery')) {
        return 2;
      }
    }
    availability_div = $('#price-shipping-message')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('delivery')) {
        return 2;
      }
    }
    availability_div = $('#desktop_unifiedPrice')
    if (availability_div.length) {
      const availability_div_html = $(availability_div).html().toLowerCase()
      if (availability_div_html.includes('free shipping')) {
        return 2;
      }
    }
    availability_div = $('#contextualIngressPt')
    if (availability_div.length) {
      const availability_div_html = $(availability_div).html().toLowerCase()
      if (availability_div_html.includes('select delivery location')) {
        return 2;
      }
    }

    return 0;
  }

  parse_product_price($){
    let price = 0;
    let price_div = [];

    price_div = $('#aod-price-0');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#aod-price-1');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('.priceBlockBuyingPriceString');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#olp-upd-new-used .a-color-price');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#olp-upd-new .a-color-price');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#unqualifiedBuyBox .a-color-price');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('.priceBlockSalePriceString');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#newBuyBoxPrice');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#olp-upd-new-freeshipping .a-color-price');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#priceblock_ourprice');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#price_inside_buybox');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('#olp-upd-new-freeshipping-threshold .a-color-price');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    price_div = $('.kindle-price .a-color-price');
    if (price_div.length) {
      price = this.parse_price($(price_div).text());
      if (price) {return price;}
    }

    return price;
  }

  parse_product_rank($){
    let prodDetails = $('#prodDetails');
    if (!prodDetails.length) {
      prodDetails = $('#detail-bullets');
    }
    if (prodDetails.length) {
      let h = prodDetails.html();
      if (typeof h == 'string') {
        if (h.includes('/gp/bestsellers/')) {
          return 1;
        }
      }
    }
    return 0;
  }

  get_amazon_image(source){

    let arr = []

    if (utilites.isJson(source)) {
      const img_obj = JSON.parse(source)
      arr = Object.keys(img_obj)
    }else{
      arr = source.split('"');
    }

    for (const elem of arr) {
      if (elem.includes('_AC_')) {
        const elem_arr = elem.split('_AC_')
        const image_mame = elem_arr[0]
        const elem_arr_2 = elem_arr[elem_arr.length - 1].split('.')
        const image_ext = elem_arr_2[elem_arr_2.length - 1]
        const url = image_mame + image_ext
        return url
      }else if (elem.includes('_S')) {
        const elem_arr = elem.split('_S')
        const image_mame = elem_arr[0]
        const elem_arr_2 = elem_arr[elem_arr.length - 1].split('.')
        const image_ext = elem_arr_2[elem_arr_2.length - 1]
        const url = image_mame + image_ext
        return url
      }
    }
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

module.exports = AmazonCom
