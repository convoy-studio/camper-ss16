// Avoid console errors for the IE crappy browsers
if ( ! window.console ) console = { log: function(){} };

import AppStore from 'AppStore'
import Utils from 'Utils'
import App from 'App'
import AppMobile from 'AppMobile'
import $ from 'jquery'
import TweenMax from 'gsap'
import raf from 'raf'
import MobileDetect from 'mobile-detect'
window.jQuery = window.$ = $

var md = new MobileDetect(window.navigator.userAgent)

AppStore.Detector.isMobile = (md.mobile() || md.tablet()) ? true : false
AppStore.Parent = $('#app-container')
AppStore.Detector.oldIE = AppStore.Parent.is('.ie6, .ie7, .ie8')
AppStore.Detector.isSupportWebGL = Utils.SupportWebGL()
if(AppStore.Detector.oldIE) AppStore.Detector.isMobile = true

// Debug
// AppStore.Detector.isMobile = true

var app;
if(AppStore.Detector.isMobile) {
	$('html').addClass('mobile')
	app = new AppMobile()
}else{
	app = new App()	
} 

app.init()

