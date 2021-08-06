<template>
  <b-navbar class="header d-print-none app-header" id="app_header">

    <div id="color_picker" :class="{active:sh_cp}" @mouseover="show_color_picker()" @mouseleave="hide_color_picker()">
      <ul class="color-picker-list">
        <li class="color-picker-item none" @click="set_color('#66666610')"></li>
        <li class="color-picker-item" v-if="index != 0" :style="{backgroundColor: color}" v-for="(color, index) of $store.state.colors" @click="set_color(color)" :key="index"></li>
      </ul>
    </div>

    <b-nav>
      <b-nav-item>
        <a class="d-md-down-none px-2" href="#" @click="toggleSidebarMethod" id="barsTooltip">
          <i class='la la-bars la-lg' />
        </a>
        <a class="fs-lg d-lg-none" href="#" @click="switchSidebarMethod">
          <i class="la la-bars la-lg" />
        </a>
      </b-nav-item>
    </b-nav>
    <a  class="navbarBrand d-md-none">
      <i class="fa fa-circle text-primary mr-n-sm" />
      <i class="fa fa-circle text-danger" />
      &nbsp;
      sing
      &nbsp;
      <i class="fa fa-circle text-danger mr-n-sm" />
      <i class="fa fa-circle text-primary" />
    </a>
    <b-nav class="ml-auto">
      <!-- <b-nav-item-dropdown
        class="notificationsMenu d-md-down-none mr-2"
        menu-class="notificationsWrapper py-0 animated animated-fast fadeIn"
        right>
        <template slot="button-content">
          <span class="avatar rounded-circle thumb-sm float-left mr-2">
            <img class="rounded-circle" src="../../assets/people/a5.jpg" alt="..." />
          </span>
          <span class="small">Philip Smith</span>
          <span class="ml-1 circle bg-primary text-white fw-bold">13</span>
        </template>
        <Notifications />
      </b-nav-item-dropdown> -->
      <b-nav-item-dropdown id="v-step-2" class="settingsDropdown" no-caret right>
        <template slot="button-content">
          <i class="la la-cog px-2" />
        </template>
        <b-dropdown-item-button @click="switch_lang('en')">
          <span>EN</span>
        </b-dropdown-item-button>
        <b-dropdown-item-button @click="switch_lang('ru')">
          <span>RU</span>
        </b-dropdown-item-button>
      </b-nav-item-dropdown>
    </b-nav>
  </b-navbar>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Notifications from '@/components/Notifications/Notifications';
const electron = window.require('electron')
const {ipcRenderer} = electron
import { bus } from '../../main'

export default {
  name: 'Header',
  components: { Notifications },
  computed: {
    ...mapState('layout', ['sidebarClose', 'sidebarStatic']),
  },
  data(){
    return{
      sh_cp: false,
      cp_type: '',
      cp_id: '',
    }
  },
  methods: {
    ...mapActions('layout', ['toggleSidebar', 'switchSidebar', 'changeSidebarActive']),
    switchSidebarMethod() {
      if (!this.sidebarClose) {
        this.switchSidebar(true);
        this.changeSidebarActive(null);
      } else {
        this.switchSidebar(false);
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    toggleSidebarMethod() {
      if (this.sidebarStatic) {
        this.toggleSidebar();
        this.changeSidebarActive(null);
      } else {
        this.toggleSidebar();
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    switch_lang(lang){
      this.$i18n.locale = lang
      ipcRenderer.send(`switch_lang`,lang)
      this.$router.push({
        params: {lang}
      })
    },
    logout() {
      window.localStorage.setItem('authenticated', false);
      this.$router.push('/login');
    },
    set_color(color) {
      ipcRenderer.send(`set_color`, this.cp_type,this.cp_id,color)
    },
    show_color_picker(){
      this.sh_cp = true
    },
    hide_color_picker(){
      this.sh_cp = false
    },
  },
  created (){
    const self = this
    bus.$on('toggle_color_picker', (type,id) => {
      const target = document.getElementById(`${type}_${id}`)

      const app_headerRect = document.getElementById('app_header').getBoundingClientRect(),
            elemRect = target.getBoundingClientRect(),
            offset_y   = elemRect.top - app_headerRect.top

      const pos_x = target.offsetWidth - 100
      const pos_y = offset_y - 23
      document.getElementById('color_picker').style.left = pos_x + 'px'
      document.getElementById('color_picker').style.top = pos_y + 'px'
      this.sh_cp = !this.sh_cp
      this.cp_type = type
      this.cp_id = id
    })
    bus.$on('hide_color_picker', () => {
      this.sh_cp = false
    })
    ipcRenderer.on('set_color_done', function () {
      self.sh_cp = false
    })
  },
  destroyed(){

  }
};
</script>

<style src="./Header.scss" lang="scss"></style>
