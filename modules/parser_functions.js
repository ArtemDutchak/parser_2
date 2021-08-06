const resources = require('./resources');
const cheerio = require('cheerio')
import utilites from "./utilites";

const env = require('./env');

let main_settings = require('./main_settings');

export default {
  get_walmart_com_products: async function(page, category_url) {
    try {
      if (page.isClosed()) {return[]}

      let is_search = false

      if (category_url.includes('/search/') && category_url.includes('?query=')) {
        is_search = true
      }

      if (main_settings.walmart_com_retailer_only) {
        if (!category_url.includes('?')) {
          category_url = category_url + '?facet=retailer%3AWalmart.com'
        }else{
          if (category_url.includes('facet=')) {
            category_url = category_url.replace('facet=', 'facet=retailer%3AWalmart.com%7C%7C')
          }else{
            category_url = category_url + 'facet=retailer%3AWalmart.com'
          }
        }
      }
      await page.goto(category_url,{
        timeout: 100000,
        waitUntil: 'networkidle2',
      }).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000});
      await utilites.scroll_page(page)
      await page.waitForSelector('#searchProductResult',{timeout: 100000});
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = cheerio.load(html);

      category_url = page.url()


      let products = utilites.parse_walmart_com_grid(html)

      const pages = $('.paginator-list').find('li')
      let page_count_text = $(pages[pages.length - 1]).find('a').text()
      let page_count = parseInt(page_count_text)
      if (page_count > 1) {
        for (let i = 2; i <= page_count; i++) {
          const url = category_url + '&page=' + i
          const _products = await this.get_walmart_com_page_product(page, url)
          if (_products.length) {
            products = products.concat(_products)
          }
          await utilites.delay(1000);
        }
      }
      return products
    } catch (e) {
      console.log(e)
    }
  },
  get_walmart_ca_products: async function(page, category_url) {
    try {
      if (page.isClosed()) {return []}

      let is_search = false

      if (category_url.includes('/search?q=')) {
        is_search = true
      }else{
        category_url = category_url.split('?')[0]
      }

      if (main_settings.walmart_ca_retailer_only) {
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
        timeout: 100000,
        waitUntil: 'networkidle2',
      }).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000});
      await utilites.scroll_page(page)

      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = cheerio.load(html);
      let products = utilites.parse_walmart_ca_grid(html)

      let page_count = '0'

      if (is_search) {
        const pages = $('.css-11g8j19.ed60zyg1 a')
        page_count = $(pages[pages.length - 1]).find('.css-ijjviy.ed60zyg11').text()
      }else{
        const pages = $('.page-select-list li')
        page_count = $(pages[pages.length - 1]).find('a').text()
      }


      page_count = parseInt(page_count)
      await utilites.delay(1000);

      category_url = page.url()


      if (page_count > 1) {
        for (let i = 2; i <= page_count; i++) {

          let url = ''

          if (is_search) {
            url = category_url + '&p=' + i
          }else{
            url = category_url + '/page-' + i
          }

          const _products = await this.get_walmart_ca_page_product(page, url)
          if (_products.length) {
            products = products.concat(_products)
          }
          await utilites.delay(1000);
        }
      }

      return products
    } catch (e) {
      console.log(e)
    }
  },
  get_bedbathandbeyond_com_products: async function(page, category_url) {
    if (page.isClosed()) {return[]}
    try {
      await page.goto(category_url,{
        timeout: 100000,
        waitUntil: 'networkidle2',
      }).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000});

      await utilites.delay(1000);
      const element = await page.$('.rclCloseBtnWrapper');
      if (element) {
        await element.click();
      }
      await utilites.delay(1000);
      await utilites.scroll_page(page)
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = cheerio.load(html)
      let products = utilites.parse_bedbathandbeyond_com_grid(html)

      const pages = $('.Pagination_5motT0').find('li')
      let page_count = $(pages[pages.length - 1]).find('a').text()
      page_count = parseInt(page_count)

      if (page_count > 1) {
        let second_page_url = 'https://www.bedbathandbeyond.com' + $(pages[1]).find('a').prop('href')
        for (let i = 2; i <= page_count; i++) {
          const url = second_page_url.replace('2-24', `${i}-24`)
          await utilites.delay(1000);
          const _products = await this.get_bedbathandbeyond_com_page_product(page, url)
          if (_products.length) {
            products = products.concat(_products)
          }
        }
      }
      return products
    } catch (e) {
      console.log(e)
      return []
    }
  },
  get_bedbathandbeyond_ca_products: async function(page, category_url) {
    if (page.isClosed()) {return[]}
    try {
      await page.goto(category_url,{
        timeout: 100000,
        waitUntil: 'networkidle2',
      }).catch((e) => {
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000});

      await utilites.delay(1000);
      const element = await page.$('.rclCloseBtnWrapper');
      if (element) {
        await element.click();
      }
      await utilites.delay(1000);
      await utilites.scroll_page(page)
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = cheerio.load(html)
      let products = utilites.parse_bedbathandbeyond_ca_grid(html)

      // const pages = $('.Pagination_5motT0').find('li')
      // let page_count = $(pages[pages.length - 1]).find('a').text()
      // page_count = parseInt(page_count)

      const page_text = $('.Pagination_yHAzRR').text()
      const page_arr = page_text.split(' ')
      let page_count = parseInt(page_arr[page_arr.length - 1])

      if (isNaN(page_count)) {
        page_count = 0
      }

      if (page_count > 1) {
        const second_page_href = $('.Pagination__btnNext').prop('href')
        let second_page_url = 'https://www.bedbathandbeyond.ca' + second_page_href
        for (let i = 2; i <= page_count; i++) {
          const url = second_page_url.replace('2-24', `${i}-24`)
          await utilites.delay(1000);
          const _products = await this.get_bedbathandbeyond_ca_page_product(page, url)
          if (_products.length) {
            products = products.concat(_products)
          }
        }
      }
      return products
    } catch (e) {
      console.log(e)
      return []
    }
  },
  get_bedbathandbeyond_ca_page_product: async function (page, url){
    return new Promise(async (resolve) => {
    if (page.isClosed()) {resolve(false);return}
    setTimeout(() => {resolve(false);return}, env.timeout.page_close)
      await page.goto(url,{timeout: 100000,waitUntil: 'networkidle2'}).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000})
      const element = await page.$('.rclCloseBtnWrapper');
      if (element) {
        await element.click();
      }
      await utilites.delay(1000);
      await utilites.scroll_page(page)
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);

      const products = utilites.parse_bedbathandbeyond_ca_grid(html)

      resolve(products)
    })
  },
  get_bedbathandbeyond_com_page_product: async function (page, url){
    return new Promise(async (resolve) => {
    if (page.isClosed()) {resolve(false);return}
    setTimeout(() => {resolve(false);return}, env.timeout.page_close)
      await page.goto(url,{timeout: 100000,waitUntil: 'networkidle2'}).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000})
      const element = await page.$('.rclCloseBtnWrapper');
      if (element) {
        await element.click();
      }
      await utilites.delay(1000);
      await utilites.scroll_page(page)
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);

      const products = utilites.parse_bedbathandbeyond_com_grid(html)

      resolve(products)
    })
  },
  get_walmart_ca_page_product: async function (page, url){
    return new Promise(async (resolve) => {
    if (page.isClosed()) {resolve(false);return}
    setTimeout(() => {resolve(false);return}, env.timeout.page_close)
      await page.goto(url,{timeout: 100000,waitUntil: 'networkidle2'}).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000})
      await utilites.scroll_page(page)
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);

      const products = utilites.parse_walmart_ca_grid(html)

      resolve(products)
    })
  },
  get_walmart_com_page_product: async function (page, url){
    return new Promise(async (resolve) => {
      if (page.isClosed()) {resolve(false);return}
      setTimeout(() => {resolve(false);return}, env.timeout.page_close)
      await page.goto(url,{timeout: 100000,waitUntil: 'networkidle2'}).catch((e) => {
        // console.error(e)
      })
      await utilites.delay(1000);
      await page.waitForSelector('body',{timeout: 100000})
      await utilites.scroll_page(page)
      await page.waitForSelector('#searchProductResult',{timeout: 100000});
      await utilites.delay(1000);
      let html = await page.$eval('body', el => el.innerHTML);
      const $ = cheerio.load(html);

      const products = utilites.parse_walmart_com_grid(html)
      resolve(products);return
    })
  },
  get_product_on_walmart_com(page, url){
    return new Promise(async (resolve) => {
      if (page.isClosed()) {resolve(false);return}
      try{
        await page.goto(url,{timeout: 100000,waitUntil: 'networkidle2'}).catch((e) => {
          // console.error(e)
        })
        await utilites.delay(1000);
        await page.waitForSelector('body',{timeout: 100000})
        // await page.waitForSelector('.css-rykmet',{timeout: 100000});
        await utilites.scroll_page(page)

        await utilites.delay(1000);
        let html = await page.$eval('body', el => el.innerHTML);

        const data_1 = utilites.parse_url(url)
        const data_2 = utilites.parse_walmart_com_product_html(html)

        // if (data_2.price == 0) {resolve(false);return}

        let product = {
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
        }
        resolve(product);return
      }
      catch(err){
        console.log(err)
        resolve(false);return
      }
    });
  },
  get_product_on_walmart_ca(page, url){
    return new Promise(async (resolve) => {
      if (page.isClosed()) {resolve(false);return}
      try{
        await page.goto(url,{timeout: 100000,waitUntil: 'networkidle2'}).catch((e) => {
          // console.error(e)
        })
        await utilites.delay(1000);
        await page.waitForSelector('body',{timeout: 100000})
        // await page.waitForSelector('.css-rykmet',{timeout: 100000});
        await utilites.scroll_page(page)

        await utilites.delay(1000);
        let html = await page.$eval('body', el => el.innerHTML);

        const data_1 = utilites.parse_url(url)
        const data_2 = utilites.parse_walmart_ca_product_html(html)

        // if (data_2.price == 0) {resolve(false);return}

        let product = {
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
        }
        resolve(product);return
      }
      catch(err){
        console.log(err)
        resolve(false);return
      }
    });
  }
}
