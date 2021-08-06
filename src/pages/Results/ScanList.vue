<template>
  <div class="page">
    <b-row class="mb-3">
      <b-col cols="11">
        <b-button-group size="sm" class="mr-3">
          <b-button variant="light"
            :disabled="!some_selected"
            :title="$t('title.show_selected')" @click="show_selected"><b-icon icon="eye"></b-icon></b-button>
        </b-button-group>
        <b-button-group size="sm">
          <b-button variant="light"
            :disabled="some_selected < 2"
            :title="$t('title.union_selected')" @click="promt_union_selected"><b-icon icon="chevron-bar-contract"></b-icon></b-button>
        </b-button-group>
      </b-col>
      <b-col cols="1">
        <b-button-group size="sm" class="text-right">
          <b-button variant="light"
            :disabled="!some_selected"
            :title="$t('title.delete_selected')" @click="promt_delete_selected"><b-icon icon="x-circle"></b-icon></b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <Widget class="h-100 mb-0" title="">
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
                  v-model="scan_list"
                  v-bind="dragOptions"
                  handle=".handle"
                  @end="update_sort_order">
                    <tr v-for="(scan, index) in scan_list" :key="index" :id="`list_${scan._id}`" @mouseleave="hide_color_picker()">
                      <td width="50px">
                        <div class="abc-checkbox">
                          <input type="checkbox"
                            :id="'checkbox'+index" :checked="scan.selected"
                            @change="changeCheck(index)"
                          />
                          <label :for="'checkbox'+index" />
                        </div>
                      </td>
                      <td>
                        <div class="" v-if="!scan.edit" @click="edit_by_double(index)">
                          {{ scan.name }}
                        </div>
                        <div class="" v-if="scan.edit">
                          <b-form-input size="sm"
                            :id="'input_' + index"
                            placeholder="Enter new name"
                            :value="scan.name"
                            @change="end_edit(index, $event)"
                            @blur="end_edit(index, $event)"
                            ></b-form-input>
                        </div></td>
                      <td width="150px">{{ scan.pair_count }}</td>
                      <td width="20px">
                        <div class="pointer color-picker"
                          :style="{backgroundColor: scan.color}"
                          @click="toggle_color_picker(scan._id)">
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
  name: 'ScanList',
  components: {
    Widget, Draggable
  },
  data(){
    return {
      timeoutId:null,
      scan_list:[],
    }
  },
  methods:{
    update_sort_order(){
      let ids = []
      for (const list of this.scan_list) {
        ids.push(list._id)
      }
      ipcRenderer.send(`resort_lists`, ids)
    },
    edit_by_double(index){
      if(!this.timeoutId){
          this.timeoutId = setTimeout(() => {
            this.timeoutId = null
          }, 300);
        }else{
          clearTimeout(this.timeoutId);
          this.scan_list[index].edit = true
          setTimeout(() => {
            document.getElementById('input_' + index).focus()
          }, 500)
          this.timeoutId = null
        }
    },
    end_edit(index, event){
      this.scan_list[index].edit = false
      if (event.target.value.length) {
        ipcRenderer.send(`edit_list_name`, {
          _id: this.scan_list[index]._id,
          name: event.target.value
        })
      }
    },
    show_selected(){
      let ids = []
      for (const list of this.scan_list) {
        if(list.selected){
          ids.push(list._id)
        }
      }
      if (ids.length) {
        this.$store.commit('set_showed_list_ids', ids)
        ipcRenderer.send(`show_selected_results`, ids)
      }
    },
    promt_union_selected(){
      this.$toasted.options.action = [
        {
          text : this.$t('buttons.yes'),
          class: 'text-white',
          onClick : (e, toastObject) => {
            this.union_selected();
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
      this.$toasted.info(this.$t('toast.promt_union_selected'));
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
    union_selected(){
      let ids = []
      for (const list of this.scan_list) {
        if(list.selected){
          ids.push(list._id)
        }
      }
      if (ids.length > 1) {
        ipcRenderer.send(`union_selected_lists`, ids)
      }else{
        this.$toasted.error(this.$t('toast.ntomsl')).goAway(3000)
      }
    },
    delete_selected(){
      let ids = []
      for (const list of this.scan_list) {
        if(list.selected){
          ids.push(list._id)
        }
      }
      if (ids.length) {
        ipcRenderer.send(`delete_selected_lists`, ids)
      }
    },
    checkAll(){
      if (this.all_selected) {
        for (let i = 0; i < this.scan_list.length; i++) {
          this.scan_list[i].selected = false
        }
      }else{
        for (let i = 0; i < this.scan_list.length; i++) {
          this.scan_list[i].selected = true
        }
      }
    },
    checkNone() {
      for (let i = 0; i < this.scan_list.length; i++) {
        this.scan_list[i].selected = false
      }
    },
    changeCheck(index) {
      this.scan_list[index].selected = !this.scan_list[index].selected
    },
    toggle_color_picker(id){
      bus.$emit('toggle_color_picker', 'list', id)
    },
    hide_color_picker(){
      bus.$emit('hide_color_picker')
    }
  },
  computed:{
    all_selected(){
      let selected = this.scan_list.filter(list => list.selected)
      return selected.length == this.scan_list.length && this.scan_list.length
    },
    some_selected(){
      let selected = this.scan_list.filter(list => list.selected)
      return selected.length
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
  mounted(){
    ipcRenderer.send(`refresh_lists`)
  },
  created(){
    const self = this
    bus.$on('lists_from_server_to_app', data => {
      self.scan_list = []
      for (const item of data) {
        item.edit = false
        self.scan_list.push(item)
      }
    })
  },
  destroyed(){
    bus.$off('lists_from_server_to_app')
  }
};
</script>

<style src="./Style.scss" lang="scss" scoped />
