<template>
  <div class="page">
    <b-row>
      <b-col cols="1">
        <b-button-group size="sm" class="text-right">
          <b-button
            size="sm"
            :title="$t('title.add_category')"
            :class="visible ? null : 'collapsed'"
            :aria-expanded="visible ? 'true' : 'false'"
            aria-controls="collapse-4"
            @click="visible = !visible"
            variant="light"><b-icon icon="plus-circle"></b-icon></b-button>
        </b-button-group>
      </b-col>
      <b-col cols="10">
        <b-button-group size="sm">
          <b-dropdown right variant="light" :text="`${$t('settings.relevance')}: ${settings.relevance.value} ${$tc('count.hours', settings.relevance.value)}`" size="sm">
            <b-dropdown-item @click="set_relevance(1)">1 {{ $tc('count.hours', 1) }}</b-dropdown-item>
            <b-dropdown-item @click="set_relevance(6)">6 {{ $tc('count.hours', 6) }}</b-dropdown-item>
            <b-dropdown-item @click="set_relevance(12)">12 {{ $tc('count.hours', 12) }}</b-dropdown-item>
            <b-dropdown-item @click="set_relevance(24)">24 {{ $tc('count.hours', 24) }}</b-dropdown-item>
          </b-dropdown>
          <b-button
            @click="scan_selected_categories"
            size="sm"
            :title="$t('title.scan_selected')"
            variant="light"><b-icon icon="play"></b-icon>{{$t('title.scan')}}</b-button>
        </b-button-group>
      </b-col>
      <b-col cols="1">
        <b-button-group size="sm" class="text-right">
          <b-button
            variant="light"
            :title="$t('title.delete_selected')"
            @click="promt_delete_selected"><b-icon icon="x-circle"></b-icon></b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div>
          <b-collapse id="collapse-1" class="mt-2" v-model="visible">
            <b-card>
              <b-container fluid>

                <b-row class="my-1">
                  <b-col sm="2">
                    <label for="input-small">Name:</label>
                  </b-col>
                  <b-col sm="10">
                    <b-form-input id="input-small" v-model="category_name" size="sm" placeholder=""></b-form-input>
                  </b-col>
                </b-row>

                <b-row class="my-1">
                  <b-col sm="2">
                    <label for="input-default">Link:</label>
                  </b-col>
                  <b-col sm="10">
                    <b-form-input id="input-default" v-model="category_url" size="sm" placeholder=""></b-form-input>
                  </b-col>
                </b-row>
                <br>
                <b-row class="my-1">
                  <b-col class="text-right">
                    <b-button @click="add_new_category" size="sm" variant="success">{{ $t('buttons.add') }}</b-button>
                  </b-col>
                </b-row>

              </b-container>
            </b-card>
          </b-collapse>
        </div>
      </b-col>
    </b-row>
    <br>
    <b-row>
      <b-col>
        <Widget class="h-100 mb-0">
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
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <Draggable
                  class="table table-striped"
                  tag="tbody"
                  group="setting"
                  v-model="category_list"
                  v-bind="dragOptions"
                  handle=".handle"
                  @end="update_sort_order">
                    <tr v-for="(category, index) in category_list" :key="index" :id="`cat_${category._id}`" @mouseleave="hide_color_picker()">
                      <td width="50px">
                        <div class="abc-checkbox">
                          <input type="checkbox"
                            :id="'checkbox'+index" :checked="category.selected"
                            @change="changeCheck(index)"
                          />
                          <label :for="'checkbox'+index" />
                        </div>
                      </td>
                      <td>
                        <div class="" v-if="!category.edit" @click="edit_by_double(index)">
                          {{ category.name }}
                        </div>
                        <div class="" v-if="category.edit">
                          <b-form-input size="sm"
                            :id="'input_' + index"
                            placeholder="Enter your name"
                            :value="category.name"
                            @change="end_edit(index, $event)"
                            @blur="end_edit(index, $event)"
                            ></b-form-input>
                        </div></td>
                      <td width="150px">{{ category.resource_name }}</td>
                      <td width="20px">
                        <div class="pointer color-picker"
                          :style="{backgroundColor: category.color}"
                          @click="toggle_color_picker(category._id)">
                        </div>
                      </td>
                      <td width="20px">
                        <b-icon variant="secondary" class="handle pointer" icon="three-dots-vertical"></b-icon>
                      </td>
                    </tr>
                </Draggable>
              </table>
            </b-col>
          </b-row>
        </Widget>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Draggable from "vuedraggable";
const electron = window.require('electron')
const {ipcRenderer} = electron
import { bus } from '../../main'

export default {
  name: 'Categories',
  components: {
    Widget, Draggable
  },
  data(){
    return {
      timeoutId:null,
      category_list:[],
      visible: false,
      category_name: '',
      category_url: '',
    }
  },
  methods:{
    update_sort_order(){
      let ids = []
      for (const category of this.category_list) {
        ids.push(category._id)
      }
      ipcRenderer.send(`resort_categories`, ids)
    },
    edit_by_double(index){
      if(!this.timeoutId){
          this.timeoutId = setTimeout(() => {
            this.timeoutId = null
          }, 300);
        }else{
          clearTimeout(this.timeoutId);
          this.category_list[index].edit = true
          setTimeout(() => {
            document.getElementById('input_' + index).focus()
          }, 500)
          this.timeoutId = null
        }
    },
    end_edit(index, event){
      this.category_list[index].edit = false
      if (event.target.value.length) {
        ipcRenderer.send(`edit_category_name`, {
          _id: this.category_list[index]._id,
          name: event.target.value
        })
      }
    },
    set_relevance(hours){
      const _setting = this.settings.relevance
      _setting.value = hours
      ipcRenderer.send(`save_setting`,_setting)
    },
    add_new_category(){
      ipcRenderer.send(`add_new_category`, this.category_name, this.category_url);
      this.visible = false;
      this.category_name = '';
      this.category_url = '';
    },
    scan_selected_categories(){
      let ids = []
      for (const category of this.category_list) {
        if(category.selected){
          ids.push(category._id)
        }
      }
      if (ids.length) {
        ipcRenderer.send(`scan_selected_categories`, ids)
      }
    },
    checkAll(){
      if (this.all_selected) {
        for (let i = 0; i < this.category_list.length; i++) {
          this.category_list[i].selected = false
        }
      }else{
        for (let i = 0; i < this.category_list.length; i++) {
          this.category_list[i].selected = true
        }
      }
    },
    checkNone() {
      for (let i = 0; i < this.category_list.length; i++) {
        this.category_list[i].selected = false
      }
    },
    changeCheck(index) {
      this.category_list[index].selected = !this.category_list[index].selected
    },
    promt_delete_selected(){
      this.$toasted.options.action = [
        {
          text : this.$t('buttons.yes'),
          class: 'text-white',
          onClick : (e, toastObject) => {
            this.delete_selected();
            toastObject.goAway(0);
          }
        },
        {
          text : this.$t('buttons.no'),
          class: 'text-white',
          onClick : (e, toastObject) => {
            toastObject.goAway(0);
          }
        }
    ];
      this.$toasted.info(this.$t('toast.promt_delete_selected'));
    },
    delete_selected(){
      let ids = []
      for (const category of this.category_list) {
        if(category.selected){
          ids.push(category._id)
        }
      }
      if (ids.length) {
        ipcRenderer.send(`delete_selected_categories`, ids)
      }
    },
    toggle_color_picker(id){
      bus.$emit('toggle_color_picker', 'cat', id)
    },
    hide_color_picker(){
      bus.$emit('hide_color_picker')
    }
  },
  mounted(){
    ipcRenderer.send(`refresh_categories`)
  },
  computed:{
    settings(){
      return this.$store.getters.settings
    },
    all_selected(){
      let selected = this.category_list.filter(category => category.selected)
      return selected.length == this.category_list.length && this.category_list.length
    },
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  created(){
    const self = this
    bus.$on('categories_from_server_to_app', data => {
      self.category_list = []
      for (const item of data) {
        item.edit = false
        self.category_list.push(item)
      }
    })
  },
  destroyed(){
    bus.$off('categories_from_server_to_app')
  }
};
</script>

<style src="./Categories.scss" lang="scss" scoped />
