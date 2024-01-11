import { createApp, reactive } from 'vue'
import { createPinia } from 'pinia'

import './assets/styles/layout.scss';

import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';
import InputText from 'primevue/inputtext';
import Menubar from 'primevue/menubar';
import ToggleButton from 'primevue/togglebutton';
import InputSwitch from 'primevue/inputswitch';
import InputMask from 'primevue/inputmask';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import Knob from 'primevue/knob';
import OrderList from 'primevue/orderlist';
import Dialog from 'primevue/dialog';
import SpeedDial from 'primevue/speeddial';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Password from 'primevue/password';
import FileUpload from 'primevue/fileupload';
import Tooltip from 'primevue/tooltip';
import Chip from 'primevue/chip';
import Steps from 'primevue/steps';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHatWizard } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Badge from 'primevue/badge';
import BadgeDirective from 'primevue/badgedirective';
import Sidebar from 'primevue/sidebar';

import Terminal from 'primevue/terminal';
import TerminalService from 'primevue/terminalservice';
import OverlayPanel from 'primevue/overlaypanel';
import ProgressSpinner from 'primevue/progressspinner';


import * as Vue from 'vue' // in Vue 3
import axios from 'axios'
import VueAxios from 'vue-axios'
import SocketIO from 'socket.io-client';
import VueSocketIO from 'vue-socket.io'

const app = createApp(App)

library.add(faHatWizard)
/* Establish Connection */
// const socketConnection = SocketIO('http://10.12.3.8:5050');
app.config.globalProperties.$appState = reactive({ theme: 'lara-light-indigo' });

app.use(PrimeVue, { ripple: true, inputStyle: 'outlined' });
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(createPinia())
app.use(router);
app.use(VueAxios, axios);
app.use(ToastService);
// app.use(TerminalService); 
app.component('InputText', InputText);
app.component('Menubar', Menubar);
app.component('ToggleButton', ToggleButton);
app.component('InputSwitch', InputSwitch);
app.component('InputMask', InputMask);
app.component('Button', Button);
app.component('Tag', Tag);
app.component('Avatar', Avatar);
app.component('Knob', Knob);
app.component('Dialog', Dialog);
app.component('OrderList', OrderList);
app.component('SpeedDial', SpeedDial);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Dropdown', Dropdown);
app.component('Checkbox', Checkbox);
app.component('Password', Password);
app.component('FileUpload', FileUpload);
app.component('Chip', Chip);
app.component('Steps', Steps);
app.component('Toast', Toast);
app.component('Toolbar', Toolbar);
app.component('Badge', Badge);
app.component('Terminal', Terminal);
app.component('Sidebar', Sidebar);
app.component('OverlayPanel', OverlayPanel);
app.component('ProgressSpinner', ProgressSpinner);
app.directive('badge', BadgeDirective);




app.directive('tooltip', Tooltip);

app.config.globalProperties.$userLoggedIn = null;
//app.config.globalProperties.$base_url = 'http://192.168.0.126:5050/';
app.config.globalProperties.$base_url = 'https://10.11.14.3:5050/'
// app.config.globalProperties.$base_url = 'http://10.12.3.8:5050/';

// app.config.globalProperties.$global_socket = SocketIO(app.config.globalProperties.$base_url);

app.mount('#app')

