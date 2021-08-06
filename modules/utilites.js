const resources = require('./resources');
const cheerio = require('cheerio')


// export const utilites = {
export default {
  is_source_dest_match(url_1,url_2) {
    const data_1 = this.parse_url(url_1)
    const data_2 = this.parse_url(url_2)
    if (data_1.resource.id == 3 && data_2.resource.id == 1) {
      return true
    }else if (data_1.resource.id == 4 && data_2.resource.id == 2) {
      return true
    }else if (data_1.resource.id == 5 && data_2.resource.id == 1) {
      return true
    }else if (data_1.resource.id == 6 && data_2.resource.id == 2) {
      return true
    }else{
      return false
    }
  },
  isEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },
  isJson(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  },
  isImage(str) {
    if (str.length) {
      const ext_arr = ['jpeg','jpg','png','gif']
      const str_arr = str.split('.')
      const ext = str_arr[str_arr.length - 1].toLowerCase()
      if (ext_arr.includes(ext)) {
        return true
      }
    }
    return false
  },
  delay(timeout){
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  },
  scroll_10_page: async function(page){
    if (page.isClosed()) {return false}
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0
        const distance = 100
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight * 0.1
          window.scrollBy(0, distance)
          totalHeight += distance
          if(totalHeight >= scrollHeight){
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    })
  },
  scroll_50_page: async function(page){
    if (page.isClosed()) {return false}
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0
        const distance = 100
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight * 0.5
          window.scrollBy(0, distance)
          totalHeight += distance
          if(totalHeight >= scrollHeight){
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    })
  },
  scroll_page: async function(page){
    if (page.isClosed()) {return false}
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0
        let distance = 100
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance
          if(totalHeight >= scrollHeight){
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    })
  },
  split_name(name){
    const arr_1 = name.split(' ')
    const arr_2 = []
    let out = []
    for (const word of arr_1) {
      const _arr = word.split('-')
      for (const _word of _arr) {
        if (_word.length > 1) {
          arr_2.push(_word)
        }
      }
    }
    const arr_3 = []
    for (const word of arr_2) {
      const _arr = word.split('/')
      for (const _word of _arr) {
        if (_word.length > 1) {
          arr_3.push(_word)
        }
      }
    }
    const arr_4 = arr_3.filter( (value, index, self) => {
      return self.indexOf(value) === index
    } )
    for (const word of arr_4) {
      let _word = word.replace(/[^A-Za-z0-9]/g,'')
      if (_word.length > 1) {
        out.push(_word)
      }
    }

    return out
  },
  get_date(d = false){
    if (!d) {
      d = new Date().getTime()
    }
    const today = new Date(d);
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let hours = today.getHours();
    let minutes = today.getMinutes();

    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }
    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }

    return `${hours}:${minutes}  ${day}.${month}.${year}`
  },
  now_time(){
    const today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    if (hours < 10) {
      hours = '0' + hours
    }
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    return `${hours}:${minutes}`
  },
  get_file_name(){
    const d = new Date();
    let seconds = d.getSeconds();
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    let str = this.get_date()
    str = str.replace(' ',`_${seconds}_`).replace(':','_').replace(/\./g,'_')
    return str
  },
  encode_to_request(str){
     const map=
     {
      '&': '%26',
      '<': '%3c',
      '>': '%3e',
      '"': '%22',
      "'": '%27'
     };
     const encoded = encodeURI(str);
     const result = encoded.replace(/%20/g, '+').replace(/[&<>"']/g, function(m) { return map[m];});
     return result;
  },
  parse_short_str(str){
    const str_arr = str.split('|')
    if (str_arr.length == 4) {
      return {
        resource_1: resources[str_arr[0]],
        resource_2: resources[str_arr[2]],
        product_1_id: str_arr[1],
        product_2_id: str_arr[3],
        short_url_1: resources[str_arr[0]].pre_id_url + str_arr[1],
        short_url_2: resources[str_arr[2]].pre_id_url + str_arr[3]
      }
    }else{
      return 0
    }
  },
  get_image_url(url){

    if (!url && typeof url !== 'string') {
      return ''
    }

    if (url.includes('product-image-placeholder')) {
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
  },
  parsePrice(_str){
    if (_str.toLowerCase().includes('unavailable')) {
      return 0
    }
    const _str_arr = _str.split('to $')
    _str = _str_arr[0]
    let str = _str.replace(/ /g, '').trim()
    if (str.includes(',')) {
      str = str.replace(',', '')
    }
    if (str.includes('$')) {
      str = str.replace('$', '')
    }
    if (str.includes('CDN')) {
      str = str.replace('CDN', '')
    }
    const price = parseFloat(str, 2)
    if (price > 0) {
      return price
    }else{
      return 0
    }
  },
  parse_url(url){
    const output = {
      resource:{
        id: '',
        name: '',
        url: '',
        pre_id_url: '',
        alias: ''
      },
      product:{
        id:'',
        short_url:''
      },
      success:false
    }
    for (const [i, resource] of resources.entries()) {
      if (i > 0) {
        if (url.includes(resource.url)) {
          output.resource = resource
        }
      }
    }
    try {
      let regexp
      if (output.resource.id == 1 || output.resource.id == 2) {
        regexp = new RegExp('dp\\/([A-z0-9]+)($|\\/ref)')
      }else if (output.resource.id == 3 || output.resource.id == 4 || output.resource.id == 5 || output.resource.id == 6) {
        regexp = new RegExp('\\/([A-z0-9]+)($|\\?)')
      }else{
        return output;
      }
      if (regexp.test(url)) {
        const id = url.match(regexp)[1]
        output.product.id = id
        if (output.resource.pre_id_url) {
          output.product.short_url = output.resource.pre_id_url + id
        }
      }
      if (output.resource.id && output.product.id) {
        output.success = true
      }
      return output
    } catch (e) {
      console.log('e: ',e);
      output.success = false
      return output
    }
  },
  parse_bedbathandbeyond_com_grid(html){
    const out = []
    const $ = cheerio.load(html);
    const self = this

    $('.ProductGrid-inline_6D1SUq').find('article').each(function(){
      const a = $(this).find('.tealium-product-title').first().find('a')
      const name = $(a).text()
      const href = $(a).attr('href')
      const img_url = $(this).find('img').attr('src')
      const image = self.get_image_url(img_url)
      let price = $(this).find('.Price_3HnIBb')
      if (price.length) {
        price = $(price).text()
      }
      const parsed = self.parse_url(`https://www.bedbathandbeyond.com${href}`)
      if (parsed.success) {
        const id = parsed.product.id
        const url = parsed.product.short_url
        if (typeof price === 'string') {
          if (!price.includes('[')) {
            price = self.parsePrice(price)
            const product = {id, name, price, image, url, resource_id: 5, props:{ model:'', rank: 0, images:[]}}
            out.push(product)
          }
        }
      }

    })
    return out
  },
  parse_bedbathandbeyond_ca_grid(html){
    const out = []
    const $ = cheerio.load(html);
    const self = this

    $('.ProductGrid-inline_6uaOga').find('article').each(function(){
      const a = $(this).find('.tealium-product-title').first().find('a')
      const name = $(a).text()
      const href = $(a).attr('href')
      const img_url = $(this).find('.Thumbnail_4q2qnF').find('img').attr('src')
      const image = self.get_image_url(img_url)
      let price = $(this).find('.Price_3HnIBb')
      if (price.length) {
        price = $(price).text()
      }
      const parsed = self.parse_url(`https://www.bedbathandbeyond.ca${href}`)
      if (parsed.success) {
        const id = parsed.product.id
        const url = parsed.product.short_url
        if (typeof price === 'string') {
          if (!price.includes('[')) {
            price = self.parsePrice(price)
            const product = {id, name, price, image, url, resource_id: 6, props:{ model:'', rank: 0, images:[]}}
            out.push(product)
          }
        }
      }

    })
    return out
  },
  parse_walmart_ca_grid(html){
    const out = []
    const $ = cheerio.load(html);
    const self = this
    $('.shelf-thumbs').find('article').each(function(){
      const name = $(this).find('.thumb-header').text()
      const img_url = $(this).find('img').attr('data-original') || $(this).find('img').attr('src')
      const image = self.get_image_url(img_url)
      const href = $(this).find('a.product-link').attr('href')
      let price = $(this).find('.product-price-analytics')
      if (price.length) {
        price = $(price).attr('data-analytics-value')
      }
      if (typeof price !== 'string') {
        price = $(this).find('.price-current').text()
      }else{
        if (price.includes('[')) {
          price = $(this).find('.price-current').text()
        }
      }

      let status = 1
      const availability_div = $(this).find('.availability-online')
      const availability_span = $(availability_div).find('span')
      if ($(availability_div).hasClass('available') && $(availability_span).text() != 'Out of stock online') {
        status = 2
      }

      const parsed = self.parse_url(`https://www.walmart.ca${href}`)
      if (parsed.success) {
        const id = parsed.product.id
        const url = parsed.product.short_url
        if (typeof price === 'string') {
          if (!price.includes('[')) {
            price = self.parsePrice(price)
            const product = {id, name, price, image, url, resource_id: 4, status, props:{ model:'', rank: 0, images:[]}}
            out.push(product)
          }
        }
      }
    })
    $('#product-results > div').each(function(){
      const name = $(this).find('p.css-1c6n0sl.eudvd6x0').text()
      const img_url = $(this).find('img').attr('data-original') || $(this).find('img').attr('src')
      const image = self.get_image_url(img_url)
      const href = $(this).find('a').attr('href')
      let price = $(this).find('.css-2vqe5n.esdkp3p0')
      if (price.length) {
        price = $(price).text()
      }

      let status = 1
      if ($(this).html().includes('Add to cart')) {
        status = 2
      }

      const parsed = self.parse_url(`https://www.walmart.ca${href}`)
      if (parsed.success) {
        const id = parsed.product.id
        const url = parsed.product.short_url
        if (typeof price === 'string') {
          if (!price.includes('[')) {
            price = self.parsePrice(price)
            const product = {id, name, price, image, url, resource_id: 4, status, props:{ model:'', rank: 0, images:[]}}
            out.push(product)
          }
        }
      }
    })
    return out
  },
  parse_walmart_com_grid(html){
    const out = []
    const $ = cheerio.load(html);
    const self = this
    $('#searchProductResult').find('li').each(function(){
      const img_url = $(this).find('img').attr('data-image-src') || $(this).find('img').attr('src')
      const name = $(this).find('img').attr('alt')
      const image = self.get_image_url(img_url)

      let href = $(this).find('a.product-title-link').attr('href')
      if (typeof href == 'undefined') {
        href = $(this).find('a.search-result-productimage').attr('href')
      }
      if (typeof href != 'undefined' && href.includes(`/ip/`)) {
        href = 'https://www.walmart.com' + href

        let status = 0
        const availability_div_html = $(this).html().toLowerCase()
        if (availability_div_html.includes('delivery') ||
            availability_div_html.includes('shipping') ||
            availability_div_html.includes('shipped')) {
          status = 2
        }

        const parsed = self.parse_url(href)
        if (parsed.success) {

          let price = 0
          let price_group = $(this).find('.price-main-block')
          if (price_group.length) {
            price_group = $(price_group).find('.price-group')
            if ($(price_group).length) {
              price_group = $(price_group).first()
              if ($(price_group).find('.price-characteristic').length && $(price_group).find('.price-mantissa').length) {
                price = $(price_group).find('.price-characteristic').text() + '.' + $(price_group).find('.price-mantissa').text()
                price = self.parsePrice(price)
              }
            }
          }

          if (price) {
            const id = parsed.product.id
            const url = parsed.product.short_url
            const product = {id, name, price, image, url, resource_id: 3, status, props:{ model:'', rank: 0, images:[]}}
            out.push(product);
          }
        }
      }
    })
    return out
  },
  parse_amazon_com_product_html(html){
    const $ = cheerio.load(html);

    const name = $('#productTitle').text().trim()

    const price_div_1 = $('.priceBlockBuyingPriceString')
    const price_div_2 = $('#olp-upd-new-used .a-color-price')
    const price_div_3 = $('#olp-upd-new .a-color-price')
    const price_div_4 = $('#unqualifiedBuyBox .a-color-price')
    const price_div_5 = $('.priceBlockSalePriceString')
    const price_div_6 = $('#newBuyBoxPrice')
    const price_div_7 = $('#olp-upd-new-freeshipping .a-color-price')
    const price_div_8 = $('#priceblock_ourprice')
    const price_div_9 = $('#price_inside_buybox')
    const price_div_10 = $('#olp-upd-new-freeshipping-threshold .a-color-price')
    const price_div_11 = $('.kindle-price .a-color-price')
    let price = 0
    if (price_div_1.length) {
      price = this.parsePrice($(price_div_1).text())
    }
    if (price_div_2.length && !price) {
      price = this.parsePrice($(price_div_2).text())
    }
    if (price_div_3.length && !price) {
      price = this.parsePrice($(price_div_3).text())
    }
    if (price_div_4.length && !price) {
      price = this.parsePrice($(price_div_4).text())
    }
    if (price_div_5.length && !price) {
      price = this.parsePrice($(price_div_5).text())
    }
    if (price_div_6.length && !price) {
      price = this.parsePrice($(price_div_6).text())
    }
    if (price_div_7.length && !price) {
      price = this.parsePrice($(price_div_7).text())
    }
    if (price_div_8.length && !price) {
      price = this.parsePrice($(price_div_8).text())
    }
    if (price_div_9.length && !price) {
      price = this.parsePrice($(price_div_9).text())
    }
    if (price_div_10.length && !price) {
      price = this.parsePrice($(price_div_10).text())
    }
    if (price_div_11.length && !price) {
      price = this.parsePrice($(price_div_11).text())
    }

    let model = ''
    $('#productDetails_detailBullets_sections1').find('tr').each(function(){
      const th_txt = $(this).find('th').text()
      if (th_txt && th_txt.includes('model number')) {
        model = $(this).find('td').text().trim()
      }
    })

    let image = ''
    let images = []
    let img_wrapper = $('#imgTagWrapperId')
    let _img = $(img_wrapper).find('img')
    if ($(_img).length) {
      image = this.get_amazon_image($(_img).attr('data-a-dynamic-image'))
    }

    if (!image.length) {
      const img = $('#ebooksImgBlkFront')
      if (img.length) {
        image = $(img).attr('src')
      }
    }

    if (!image.length) {
      const img = $('#img-canvas')
      if (img.length) {
        let _img = $(img_wrapper).find('img')
        if ($(_img).length) {
          image = $(_img).attr('src')
        }
      }
    }

    const rank = this.is_amazon_bestseller(html)

    let status = this.get_amazon_status(html)
    // const availability_div = $('#availability')
    // const availability_span = $(availability_div).find('span')

    return {
      name,
      model,
      status,
      image: image || '',
      images,
      price,
      rank
    }
  },
  parse_amazon_com_listing_info(html){
    const $ = cheerio.load(html)
    const self = this

    const out = []

    $('#olpOfferListColumn').find('.a-row.a-spacing-mini.olpOffer').each(function(){

      let price = 0
      let condition = ''
      let seller = ''

      let price_text = ''
      const price_block = $(this).find('.olpOfferPrice')
      if (price_block.length) {
        price_text = $(price_block).text()
        if (price_text.length) {
          price = self.parsePrice(price_text)
        }
      }

      const condition_block = $(this).find('.olpCondition')
      if (condition_block.length) {
        condition = $(condition_block).text().trim()
      }

      const seller_block = $(this).find('h3.olpSellerName')
      if (seller_block.length) {
        const a_link = $(seller_block).find('a')
        if (a_link.length) {
          seller = $(seller_block).text().trim()
        }
        if (!seller.length) {
          const img = $(seller_block).find('img')
          if (img.length) {
            seller = $(img).attr('alt').trim()
          }
        }
      }

      out.push({
        price,
        condition,
        seller
      })


    })

    return out
  },
  parse_amazon_ca_listing_info(html){
    const $ = cheerio.load(html)
    const self = this

    const out = []

    $('#olpOfferListColumn').find('.a-row.a-spacing-mini.olpOffer').each(function(){

      let price = 0
      let condition = ''
      let seller = ''

      let price_text = ''
      const price_block = $(this).find('.olpOfferPrice')
      if (price_block.length) {
        price_text = $(price_block).text()
        if (price_text.length) {
          price = self.parsePrice(price_text)
        }
      }

      const condition_block = $(this).find('.olpCondition')
      if (condition_block.length) {
        condition = $(condition_block).text().trim()
      }

      const seller_block = $(this).find('h3.olpSellerName')
      if (seller_block.length) {
        const a_link = $(seller_block).find('a')
        if (a_link.length) {
          seller = $(seller_block).text().trim()
        }
        if (!seller.length) {
          const img = $(seller_block).find('img')
          if (img.length) {
            seller = $(img).attr('alt')
          }
        }
      }

      out.push({
        price,
        condition,
        seller
      })


    })

    return out
  },
  is_amazon_bestseller(html){
    const $ = cheerio.load(html);

    let prodDetails = $('#prodDetails')
    if (!prodDetails.length) {
      prodDetails = $('#detail-bullets')
    }
    if (prodDetails.length) {
      let h = prodDetails.html()
      if (typeof h == 'string') {
        if (h.includes('/gp/bestsellers/')) {
          return 1
        }
      }
    }
    return 0
  },
  get_amazon_status(html){
    const $ = cheerio.load(html);

    let availability_div = $('#availability')

    if (availability_div.length) {

      const availability_div_html = $(availability_div).html().toLowerCase()

      if (availability_div_html.includes('currently unavailable')) {
        return 1
      }
      if (availability_div_html.includes('these sellers')) {
        return 2
      }
      if (availability_div_html.includes('free shipping')) {
        return 2
      }

      const availability_span = $(availability_div).find('span')
      if (availability_span.length) {
        if ($(availability_span).text().toLowerCase().includes('in stock')) {
          return 2
        }
      }

    }

    availability_div = $('#olp-upd-new-freeshipping-threshold')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('free shipping')) {
        return 2
      }
    }
    availability_div = $('#olp-upd-new-freeshipping')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('free shipping')) {
        return 2
      }
    }
    availability_div = $('#olp-upd-new')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('shipping')) {
        return 2
      }
    }
    availability_div = $('#deliveryMessageMirId')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('delivery')) {
        return 2
      }
    }
    availability_div = $('#price-shipping-message')
    if (availability_div.length) {
      if ($(availability_div).html().toLowerCase().includes('delivery')) {
        return 2
      }
    }
    availability_div = $('#desktop_unifiedPrice')
    if (availability_div.length) {
      const availability_div_html = $(availability_div).html().toLowerCase()
      if (availability_div_html.includes('free shipping')) {
        return 2
      }
    }
    availability_div = $('#contextualIngressPt')
    if (availability_div.length) {
      const availability_div_html = $(availability_div).html().toLowerCase()
      if (availability_div_html.includes('select delivery location')) {
        return 2
      }
    }

    return 0
  },
  get_amazon_image(source){

    let arr = []

    if (this.isJson(source)) {
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
  },
  parse_amazon_ca_product_html(html){
    const $ = cheerio.load(html);

    const name = $('#productTitle').text().trim()

    const price_div_1 = $('.priceBlockBuyingPriceString')
    const price_div_2 = $('#olp-upd-new-used .a-color-price')
    const price_div_3 = $('#olp-upd-new .a-color-price')
    const price_div_4 = $('#unqualifiedBuyBox .a-color-price')
    const price_div_5 = $('.priceBlockSalePriceString')
    const price_div_6 = $('#newBuyBoxPrice')
    const price_div_7 = $('#olp-upd-new-freeshipping .a-color-price')
    const price_div_8 = $('#priceblock_ourprice')
    const price_div_9 = $('#price_inside_buybox')
    const price_div_10 = $('#olp-upd-new-freeshipping-threshold .a-color-price')
    const price_div_11 = $('.kindle-price .a-color-price')
    let price = 0
    if (price_div_1.length) {
      price = this.parsePrice($(price_div_1).text())
    }
    if (price_div_2.length && !price) {
      price = this.parsePrice($(price_div_2).text())
    }
    if (price_div_3.length && !price) {
      price = this.parsePrice($(price_div_3).text())
    }
    if (price_div_4.length && !price) {
      price = this.parsePrice($(price_div_4).text())
    }
    if (price_div_5.length && !price) {
      price = this.parsePrice($(price_div_5).text())
    }
    if (price_div_6.length && !price) {
      price = this.parsePrice($(price_div_6).text())
    }
    if (price_div_7.length && !price) {
      price = this.parsePrice($(price_div_7).text())
    }
    if (price_div_8.length && !price) {
      price = this.parsePrice($(price_div_8).text())
    }
    if (price_div_9.length && !price) {
      price = this.parsePrice($(price_div_9).text())
    }
    if (price_div_10.length && !price) {
      price = this.parsePrice($(price_div_10).text())
    }
    if (price_div_11.length && !price) {
      price = this.parsePrice($(price_div_11).text())
    }

    let model = ''
    $('#productDetails_detailBullets_sections1').find('tr').each(function(){
      const th_txt = $(this).find('th').text()
      if (th_txt && th_txt.includes('model number')) {
        model = $(this).find('td').text().trim()
      }
    })

    let image = ''
    let images = []
    let img_wrapper = $('#imgTagWrapperId')
    let _img = $(img_wrapper).find('img')
    if ($(_img).length) {
      image = this.get_amazon_image($(_img).attr('data-a-dynamic-image'))
    }

    if (!image.length) {
      const img = $('#ebooksImgBlkFront')
      if (img.length) {
        image = $(img).attr('src')
      }
    }

    if (!image.length) {
      const img = $('#img-canvas img')
      if (img.length) {
        image = $(img).attr('src')
      }
    }

    const rank = this.is_amazon_bestseller(html)

    let status = this.get_amazon_status(html)

    return {
      name,
      model,
      status,
      image: image || '',
      images,
      price,
      rank
    }
  },
  parse_walmart_com_product_html(html){
    const $ = cheerio.load(html);
    const name = $('h1').text()
    const self = this

    let price = 0
    let price_text = ''
    $('.price-characteristic').each(function(){
      let price_attr = $(this).attr('content')
      if (typeof price_attr !== 'undefined') {
        price_text = price_attr
      }
    })
    if (price_text.length) {
      price = this.parsePrice(price_text)
    }

    let price_text_1 = $('.css-49bqys.e1bu9qyp1')

    if (!price) {
      price = this.parsePrice(price_text_1.text())
    }

    let model = ''
    $('#specifications').find('table').find('tr').each(function(){
      $(this).find('div').each(function(){
        if ($(this).attr('itemprop') == 'Model' || $(this).attr('itemprop') == 'model') {
          model = $(this).text().trim()
        }
      })
    })
    let image = ''
    let images = []

    // $('.css-eg1wuf.ervhxpq0').find('img').each(function(){
    //   const _img_src = $(this).attr('src')
    //   if (_img_src.includes('Enlarge')) {
    //     image = _img_src
    //   }
    // })

    $('#product-overview ul.slider-list').find('img').each(function(){
      const _img_src = $(this).attr('src')
      const image_arr = _img_src.split('?')
      let img_url = image_arr[0]
      if (!img_url.includes('https://')) {
        img_url = img_url.replace('//i5.walmartimages.com','https://i5.walmartimages.com')
      }
      if (self.isImage(img_url)) {
        if (!image.length) {
          image = img_url
        }else{
          images.push(img_url)
        }
      }
    })

    const rank = 0
    let status = 0
    let info_block = $('.hf-Bot')

    if (info_block.length) {

      const info_block_html = info_block.html().toLowerCase()
      if (info_block_html.includes('out of stock') ||
          info_block_html.includes('delivery not available') ||
          info_block_html.includes('get in-stock alert')) {
        status = 1
      }

      if (!status) {
        if (info_block_html.includes('add to cart')) {
          status = 2
        }
      }

    }

    return {name,model,image,status,images,price,rank}
  },
  parse_walmart_ca_product_html(html){
    const $ = cheerio.load(html);
    const name = $('h1').text()
    const self = this

    let price = 0
    let status = 0
    let info_block = $('.css-18f77yw.eewy8oa4')
    let price_text_1 = $('.css-j7qwjs .css-49bqys.e1bu9qyp1')
    let price_text_2 = $('.css-j7qwjs .css-2vqe5n.esdkp3p0')

    if (info_block.length) {
      const info_block_html = info_block.html().toLowerCase()
      if (info_block_html.includes('price unavailable') ||
          info_block_html.includes('out of stock online')) {
        status = 1
      }

      if (!status) {
        if (info_block_html.includes('is sold online only') ||
            info_block_html.includes('add to cart')) {
          status = 2
        }
      }

    }

    if (price_text_1.length && !price) {
      price = this.parsePrice(price_text_1.text())
    }
    if (price_text_2.length && !price) {
      price = this.parsePrice(price_text_2.text())
    }

    let model = ''
    $('.e1cuz6d10').find('.e1cuz6d11').each(function(){
      const t = $(this).find('.e1cuz6d12').text()
      if (t.includes('Model #')) {
        model = $(this).find('.e1cuz6d13').text()
      }
    })
    if (typeof model == 'undefined' || model.length < 2) {
      model = ''
    }
    model = model.trim()

    let image = ''
    let images = []
    let skip_first_image = false
    $('.css-eg1wuf.ervhxpq0').find('img').each(function(){
      const _img_src = $(this).attr('src')
      const image_arr = _img_src.split('?')
      const img_url = image_arr[0]
      if (self.isImage(img_url)) {
        if (!image.length) {
          image = img_url
        }else{
          if (skip_first_image) {
            images.push(img_url)
          }else{
            skip_first_image = true
          }
        }
      }
    })
    const rank = 0

    return {name,model,image,status,images,price,rank}
  },
  parse_bedbathandbeyond_com_product_html(html){
    const $ = cheerio.load(html);
    let name = $('h1').text()

    // PDPPrice_3HTapM - $81.99
    // PDPPrice_489gBC -
    // PDPPrice_7GEyVj - See Discount Price in Cart $134.95
    // PDPPrice_3HTapM

    let price_text = null
    let price = NaN

    if (html.includes('PDPPrice_3HTapM') && isNaN(price)) {
      price_text = $('.PDPPrice_3HTapM').text()
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0]
      }
      price = this.parsePrice(price_text)
    }

    if (html.includes('PDPPrice_489gBC') && isNaN(price)) {
      price_text = $('.PDPPrice_489gBC').text()
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0]
      }
      price = this.parsePrice(price_text)
    }

    if (html.includes('PDPPrice_7GEyVj') && isNaN(price)) {
      price_text = $('.PDPPrice_7GEyVj').text()
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0]
      }
      price = this.parsePrice(price_text)
    }

    if (html.includes('PDPPrice-inline_2DaTZO') && isNaN(price)) {
      price_text = $('.PDPPrice-inline_2DaTZO').text()
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0]
      }
      price = this.parsePrice(price_text)
    }

    let model = ''
    let image = ''
    let status = 0
    let images = ''
    let rank = 0

    return {name,model,image,status,images,price,rank}
  },
  parse_bedbathandbeyond_ca_product_html(html){
    const $ = cheerio.load(html);
    let name = $('h1').text()

    let price_text = null
    let price = NaN


    if (html.includes('PDPPrice_3HTapM') && isNaN(price)) {
      price_text = $('.PDPPrice_3HTapM').text()
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0]
      }
      price = this.parsePrice(price_text)
    }

    if (html.includes('PDPPrice-inline_2DaTZO') && isNaN(price)) {
      price_text = $('.PDPPrice-inline_2DaTZO').text()
      if (/\$[0-9]+\.[0-9]+/.test(price_text)) {
        price_text = price_text.match(/\$[0-9]+\.?[0-9]+/)[0]
      }
      price = this.parsePrice(price_text)
    }

    let model = ''
    let image = ''
    let status = 0
    let images = ''
    let rank = 0

    return {name,model,image,status,images,price,rank}
  },
  setup_page: async function(page, main_settings){
    page.setMaxListeners(100);
    page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/68.0.3440.106 Chrome/68.0.3440.106 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768});
    await page.setRequestInterception(true);
    page.on('request', request => {
      if (!main_settings.images_styles) {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet'){
          request.abort();
        }else{
          request.continue();
        }
      }else{
        request.continue();
      }
    })
    return page
  }

}
