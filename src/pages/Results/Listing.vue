<template>
  <div class="page">
    <div id="page_back"
      :class="{show:show_collapse_filters}"
      @click="show_collapse_filters = false"
    ></div>
    <b-row class="mb-3">

      <b-collapse class="mt-2" id="collapse_filters" v-model="show_collapse_filters">
        <b-card>
          <h5>{{ $t(`titles.filters`) }}</h5>
          <hr>
          <b-row class="mb-3">
            <b-col cols="3">
              <b-form-checkbox class="mb-3" :checked="settings.amazon_rank_only.value" @change="save_checkbox('amazon_rank_only')">{{ $t('settings.amazon_rank_only') }}</b-form-checkbox>
            </b-col>
            <b-col cols="5">
              <b-form-checkbox :checked="settings.match_profit.value" @change="save_checkbox('match_profit')">{{ $t('settings.with_profit') }}</b-form-checkbox>
              <table>
                <tr>
                  <td>{{ $t(`settings.min_profit_abs`) }}</td>
                  <td><b-form-input
                    id="input_min_profit_abs"
                     v-model="settings.min_dif_price.value"
                     size="sm"
                     @change="format_input('min_dif_price', 0)"
                     @blur="format_input('min_dif_price', 0)"
                  ></b-form-input></td>
                </tr>
                <tr>
                  <td>{{ $t(`settings.max_profit_abs`) }}</td>
                  <td><b-form-input
                    id="input_max_profit_abs"
                     v-model="settings.max_dif_price.value"
                     size="sm"
                     @change="format_input('min_dif_price', 0)"
                     @blur="format_input('max_dif_price', 0)"
                  ></b-form-input></td>
                </tr>
                <tr>
                  <td>{{ $t(`settings.min_profit_rel`) }}</td>
                  <td><b-form-input
                    id="input_min_profit_rel"
                     v-model="settings.min_dif_percentage.value"
                     size="sm"
                     @change="format_input('min_dif_percentage', 0)"
                     @blur="format_input('min_dif_percentage', 0)"
                  ></b-form-input></td>
                </tr>
                <tr>
                  <td>{{ $t(`settings.max_profit_rel`) }}</td>
                  <td><b-form-input
                    id="input_max_profit_rel"
                     v-model="settings.max_dif_percentage.value"
                     size="sm"
                     @change="format_input('min_dif_percentage', 0)"
                     @blur="format_input('max_dif_percentage', 0)"
                  ></b-form-input></td>
                </tr>
              </table>
            </b-col>
          </b-row>
          <hr>
          <b-row class="mb-3">
            <b-col cols="12">
              <h5>{{ $t(`titles.sku_search`) }}</h5>
            </b-col>
          </b-row>
          <b-row class="mb-3">
            <b-col cols="12">
              <b-form-input
                id="input_skus"
                  v-model="filter_skus"
                  size="sm"
                  :placeholder="$t(`placeholder.sku_search`)"
                  @change="filter_by_sku()"
              ></b-form-input>
            </b-col>
          </b-row>

        </b-card>
      </b-collapse>

      <b-col cols="12">
        <b-button size="sm"
          class="mr-4"
          :title="$t('title.export_selected')"
          variant="success" @click="export_show_match()">
          <b-icon icon="file-earmark-spreadsheet" variant="light"></b-icon>
        </b-button>
        <b-button size="sm"
          @click="show_collapse_filters = !show_collapse_filters"
          variant="light">
          <b-icon icon="funnel" variant="light"></b-icon>
        </b-button>
      </b-col>
    </b-row>

    <!-- <b-row class="mb-2">
      <b-col cols="10">
      </b-col>
      <b-col cols="2" class="text-right">
        <b-button-group size="sm">
          <b-button-group size="sm">
            <b-button variant="light"><b-icon icon="justify" variant="success"></b-icon></b-button>
            <b-button variant="light"><b-icon icon="grid" variant="secondary"></b-icon></b-button>
          </b-button-group>
        </b-button-group>
      </b-col>
    </b-row> -->

    <b-row>
      <b-col>
        <b-pagination
          align="center"
          v-model="currentPage"
          :total-rows="$store.getters.filtered_result_count"
          :per-page="settings.results_per_page.value"
          aria-controls="my-table"
        ></b-pagination>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <Widget class="h-100" :title="`${start_item} - ${end_item} ${$t('txt.of')} ${$store.getters.filtered_result_count} / ${$store.getters.total_result_count}`">
          <b-row>
            <b-col>
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>
                      <div class="abc-checkbox">
                        <input type="checkbox"
                          id="checkbox" :checked="all_selected"
                          @change="checkAll()"
                        />
                        <label for="checkbox" />
                      </div>
                    </th>
                    <!-- <th>Category Name</th> -->
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(result, index) in filtered_results" :key="index">
                    <td>
                      <div class="abc-checkbox">
                        <input type="checkbox"
                          :id="'checkbox'+index" :checked="result.selected"
                          @change="changeCheck(index)"
                        />
                        <label :for="'checkbox'+index" />
                      </div>
                    </td>
                    <!-- <td>{{ result.category_name }}</td> -->
                    <!-- <td>{{ result.product_1.name }}</td>
                    <td>{{ result.product_2.name }}</td> -->
                    <td>
                      <div class="product-images">
                        <div class="product-image">
                          <img :src="result.product_2.image" />
                        </div>
                      </div>
                    </td>
                    <td width="100%">
                      <div class="product-info">
                        <div class="product-info-btns">
                          <b-button-group size="sm">

                            <b-button v-if="result.watch"
                              :title="$t('title.deactivate_watcher')"
                              variant="light"
                              size="sm"
                              @click="toggle_state('watch', index)">
                              <b-icon icon="binoculars-fill" variant="success"></b-icon>
                            </b-button>
                            <b-button v-else
                              :title="$t('title.activate_watcher')"
                              variant="light"
                              size="sm"
                              @click="toggle_state('watch', index)">
                              <b-icon icon="binoculars" variant="secondary"></b-icon>
                            </b-button>

                            <b-button v-if="result.amazon_listing"
                              :title="$t('title.remove_from_listing')"
                              variant="light"
                              size="sm"
                              @click="toggle_state('amazon_listing', index)">
                              <b-icon icon="star-fill" variant="warning"></b-icon>
                            </b-button>
                            <b-button v-else
                              :title="$t('title.add_to_listing')"
                              variant="light"
                              size="sm"
                              @click="toggle_state('amazon_listing', index)">
                              <b-icon icon="star" variant="secondary"></b-icon>
                            </b-button>

                            <b-button
                              :title="$t('title.refresh')"
                              variant="light"
                              size="sm"
                              @click="refresh_pair(index)">
                              <b-icon icon="arrow-repeat" variant="secondary"></b-icon>
                            </b-button>

                          </b-button-group>
                        </div>
                        <div class="product-info-blocks">
                          <div class="product-info-block">
                            <div class="product-info-id">
                              <span class="pointer" @click="copy_to_clipboard({sku:result.product_2.id, url:result.product_2.url})">{{ result.product_2.id }}</span>
                              <span class="ml-3" >{{ resources[result.product_2.resource_id].name }}</span>
                            </div>
                            <div class="product-info-name">
                              <span>{{ result.product_2.name }}</span>
                            </div>
                            <div class="product-info-id">
                              <span>{{ result.record_time ? formated_date(result.record_time) : '-- : --  -- . -- . --' }}</span>
                            </div>
                          </div>
                          <div class="product-info-block">
                            <b-row>
                              <b-col cols="6">
                                <table class="table table-sm" v-if="result.source_products && result.source_products.length">
                                  <tr
                                    class="pointer" @click="copy_to_clipboard({sku:source_product.id, url:source_product.url})"
                                    v-for="(source_product, source_index) in result.source_products"
                                    :key="source_index"
                                    :class="{
                                      warning: source_product.status == 0,
                                      danger: source_product.status == 1,
                                      success: source_product.status == 2
                                      }"
                                    >
                                    <td>{{ resources[source_product.resource_id].name }}</td>
                                    <td width="7%">-</td>
                                    <td width="20%">$ {{ source_product.price }}</td>
                                    <td width="30%">{{ formated_date(source_product.updatedAt) }}</td>
                                  </tr>
                                </table>
                              </b-col>
                              <b-col cols="6">
                                <table class="table table-sm" v-if="result.listing_info && result.listing_info.length">
                                  <tr
                                    v-for="(listing_item, listing_index) in result.listing_info"
                                    :key="listing_index"
                                    :class="{
                                      marked: listing_item.seller == settings.amazon_store_name.value && settings.amazon_store_name.value.length,
                                      }"
                                    >
                                    <td width="20%">$ {{ listing_item.price }}</td>
                                    <td width="15%">{{ listing_item.condition }}</td>
                                    <td>{{ listing_item.seller }}</td>
                                  </tr>
                                </table>
                              </b-col>
                            </b-row>
                          </div>
                        </div>
                        <div class="product-footer">
                          <div class="f-max">
                          </div>
                          <!-- <div class="product-stat">
                            <h4 class="text-success" v-if="result.profit >= settings.min_dif_price.value">
                              $ {{ result.profit.toFixed(2) }}
                            </h4>
                            <h4 class="text-warning" v-else-if="result.profit > 0">
                              $ {{ result.profit.toFixed(2) }}
                            </h4>
                            <h4 class="text-danger" v-else-if="result.profit !== null && result.profit != 0">
                              $ {{ result.profit.toFixed(2) }}
                            </h4>
                            <h4 class="text-danger" v-else-if="result.profit == null">
                              $ {{ '-.--' }}
                            </h4>
                            <h4 class="text-danger" v-else>
                              {{ '-.--' }}
                            </h4>
                          </div> -->
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </b-col>
          </b-row>
        </Widget>
      </b-col>
    </b-row>

    <br>
    <br>

    <b-row>
      <b-col>
        <b-pagination
          align="center"
          v-model="currentPage"
          :total-rows="$store.getters.filtered_result_count"
          :per-page="settings.results_per_page.value"
          aria-controls="my-table"
        ></b-pagination>
      </b-col>
    </b-row>

  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
const electron = window.require('electron')
const {ipcRenderer} = electron

const utilites = require('../../../modules/utilites').default
const resources = require('../../../modules/resources')

export default {
  name: 'ScanList',
  components: {
    Widget
  },
  data(){
    return {
      resources,
      show_collapse_filters: false,
      currentPage: 1,
      checkboxes1: [],
      category_name: '',
      category_url: '',
      filter_skus: '',
    }
  },
  methods:{
    copy_to_clipboard(data){

      let value = '';
      let is_sku = false;
      let is_url = false;

      if(data.hasOwnProperty('sku')){is_sku = true;}
      if(data.hasOwnProperty('url')){is_url = true;}

      let text = 'toast.sku_copied_to_clipboard';

      if (is_sku && is_url) {
        value = data.sku;
        let action = [
          {
            text : this.$t('buttons.copy_url'),
            class: 'text-white',
            onClick : (e, toastObject) => {
              toastObject.goAway(0);
              setTimeout(()=>{
                this.copy_to_clipboard({url: data.url});
              },300)
            }
          }
        ];
        this.$toasted.options.action = action;
      }else if (!is_sku && is_url) {
        value = data.url;
        text = 'toast.url_copied_to_clipboard';
      }
      this.$toasted.success(this.$t(text)).goAway(3000);

      const dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.setAttribute("id", "dummy_id");
      document.getElementById("dummy_id").value = value;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      this.$toasted.options.duration = null;
      this.$toasted.options.action = null;

    },
    get_status(status){
      if (status == '2') {
        return 'success'
      }
      if (status == '1') {
        return 'danger'
      }
      return 'warning'
    },
    formated_date(d){
      return utilites.get_date(new Date(d))
    },
    export_show_match(){
      const selected = []
      for (const item of this.filtered_results) {
        if (item.selected) {
          selected.push(item)
        }
      }
      if (selected.length) {
        ipcRenderer.send(`export_show_match`, selected)
      }
    },
    format_input(val, dec){
      this.settings[val].value = parseFloat(this.settings[val].value, dec).toFixed(dec)
      if (this.settings[val].value == 'NaN') {
        this.settings[val] = 0
      }
      this.save_setting(this.settings[val])
    },
    save_setting(setting){
      ipcRenderer.send(`save_setting`,setting, this.$store.getters.showed_list_ids)
    },
    filter_by_sku(){
      let filter_sku_arr = []
      const list_ids = this.$store.getters.showed_list_ids

      if (this.filter_skus.length) {
        const coma_arr = this.filter_skus.split(',')
        const semi_arr = []
        const space_arr = []

        for (const item of coma_arr) {
          const item_arr = item.split(';')
          semi_arr.push(...item_arr)
        }

        for (const item of semi_arr) {
          const item_arr = item.split(' ')
          space_arr.push(...item_arr)
        }

        filter_sku_arr = space_arr.filter((value, index, self) => {
          return self.indexOf(value) === index && value.length;
        })
      }

      ipcRenderer.send(`filter_by_sku`, {list_ids,filter_sku_arr})

    },
    toggle_state(type, index){
      const state = !this.filtered_results[index][type]
      const _id_1 = this.filtered_results[index].product_1._id
      const _id_2 = this.filtered_results[index].product_2._id
      ipcRenderer.send(`toggle_state`,{type,state,_id_1,_id_2})
    },
    refresh_pair(index){
      const _id_2 = this.filtered_results[index].product_2._id
      ipcRenderer.send(`refresh_amazon_listing_item`, _id_2)
    },
    go_compare(index){
      this.$router.push({name: 'Compare', params:{index}})
    },
    save_checkbox(val){
      const setting = this.settings[val]
      setting.value = event.target.checked
      ipcRenderer.send(`save_setting`,setting, this.$store.getters.showed_list_ids)
    },
    show_selected(){
      let ids = []
      for (const result of this.filtered_results) {
        if(result.selected){
          ids.push(result._id)
        }
      }
      if (ids.length) {
        ipcRenderer.send(`show_selected_results`, ids)
        this.$toasted.success(ids)
      }
    },
    checkAll(){
      if (this.all_selected) {
        for (let i = 0; i < this.filtered_results.length; i++) {
          this.$store.dispatch('set_result', {
            _id: this.filtered_results[i]._id,
            result:{
              selected: false
            }
          })
        }
      }else{
        for (let i = 0; i < this.filtered_results.length; i++) {
          this.$store.dispatch('set_result', {
            _id: this.filtered_results[i]._id,
            result:{
              selected: true
            }
          })
        }
      }
    },
    changeCheck(index) {
      for (const [i, result] of this.filtered_results.entries()) {
        if (this.filtered_results[index]._id == result._id) {
          this.$store.dispatch('set_result', {
            _id: this.filtered_results[i]._id,
            result:{
              selected: !this.filtered_results[i].selected
            }
          })
        }
      }
    },
    is_match_profit(pair){
      let match_1 = false
      let match_2 = false
      let match_3 = false
      let match_4 = false

      if (this.settings.min_dif_price.value != 0) {
        if (pair.profit >= parseFloat(this.settings.min_dif_price.value,2)) {
          match_1 = true
        }
      }else{
        match_1 = true
      }

      if (this.settings.min_dif_percentage.value != 0) {
        if (pair.profit_perc > 0 && pair.profit_perc >= parseFloat(this.settings.min_dif_percentage.value,2)) {
          match_2 = true
        }
      }else{
        match_2 = true
      }

      if (this.settings.max_dif_price.value != 0) {
        if (pair.profit <= parseFloat(this.settings.max_dif_price.value,2)) {
          match_3 = true
        }
      }else{
        match_3 = true
      }

      if (this.settings.max_dif_percentage.value != 0) {
        if (pair.profit_perc > 0 && pair.profit_perc <= parseFloat(this.settings.max_dif_percentage.value,2)) {
          match_4 = true
        }
      }else{
        match_4 = true
      }

      return match_1 && match_2 && match_3 && match_4
    },
    is_match_identity(item){
      let match_1 = false

      if (this.settings.min_identity.value != 0) {
        if (item.identity >= parseInt(this.settings.min_identity.value)) {
          match_1 = true
        }
      }else{
        match_1 = true
      }
      return match_1
    }
  },
  computed:{
    filtered_results(){
      return this.$store.getters.results
    },
    all_selected(){
      let selected = this.filtered_results.filter(result => result.selected)
      return selected.length == this.filtered_results.length && this.filtered_results.length
    },
    settings(){
      return this.$store.getters.settings
    },
    start_item(){
      return this.filtered_results.length ? this.currentPage * this.settings.results_per_page.value - this.settings.results_per_page.value + 1 : 0
    },
    end_item(){
      return this.filtered_results.length ? this.start_item + this.filtered_results.length - 1 : 0
    }
  },
  watch:{
    currentPage(){
      ipcRenderer.send(`set_amazon_listing_page`, this.currentPage)
    }
  },
  mounted(){
    this.$store.commit('set_showed_list_ids', ['amazon_listing'])
  },
  created(){
    ipcRenderer.send(`show_amazon_listing`)
  },
  destroyed(){
    ipcRenderer.send(`compact_database`, 'settings')
    ipcRenderer.send(`compact_database`, 'matches')
    ipcRenderer.send(`compact_database`, 'exeptions')
    ipcRenderer.send(`compact_database`, 'favorites')
    ipcRenderer.send(`compact_database`, 'amazon_listing')
    ipcRenderer.send(`compact_database`, 'watchers')
  }
};
</script>

<style src="./Style.scss" lang="scss" />
