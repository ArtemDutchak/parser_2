const Amazon_Com = require('../classes/AmazonCom.js')
// const AmazonCom = new Amazon_Com()
const Amazon_Ca = require('../classes/AmazonCa.js')
// const AmazonCa = new Amazon_Ca()
const Walmart_Com = require('../classes/WalmartCom.js')
// const WalmartCom = new Walmart_Com()
const Walmart_Ca = require('../classes/WalmartCa.js')
// const WalmartCa = new Walmart_Ca()
const BBB_Com = require('../classes/BBBCom.js')
// const BBBCom = new BBB_Com()
const BBB_Ca = require('../classes/BBBCa.js')
// const BBBCa = new BBB_Ca()

const Resources = [
  new Amazon_Com(),
  new Amazon_Ca(),
  new Walmart_Com(),
  new Walmart_Ca(),
  new BBB_Com(),
  new BBB_Ca()
];

export default {
  find_resource(data){

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
        if (category_url.includes(resource.url)) {
          Resource = _Resource;
          break;
        }
      }

    }

    return Resource

  }
}
