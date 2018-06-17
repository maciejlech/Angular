/*******************************************************************************
 *
 *  avast! Online Security plugin
 *  (c) 2013 Avast Corp.
 *
 *  @author: Avast Software
 *
 *  Injected Core - cross browser
 *
 ******************************************************************************/

(function($, EventEmitter) {

  if (typeof AvastWRC == 'undefined') { AvastWRC = {}; }//AVAST Online Security

  AvastWRC.ial = AvastWRC.ial || {
    /**
     * Background script instance - browser specific
     * @type {Object}
     */
    bs: null,
    /**
     * DNT settings used to determine if a page needs to be refreshed or not
     * @type {Object}
     */
    _CHANGED_FIELDS: {},
    /**
     * Initialization
     * @param  {Object} _bs instance of browser specifics
     * @return {Object} AvastWRC.ial instance - browser agnostic
     */
    init: function(_bs){
      this.bs = _bs;
      this.initPage();
      this.attachHandlers();
      //this.bs.messageHandler('initMe');

      return this;
    },
    /**
     * EventEmitter instance to hangle injected layer events.
     * @type {Object}
     */
    _ee: new EventEmitter(),

    _isOldGui : true,
    /**
     * Register events with instance of EventEmitter.
     * @param  {Object} callback to register with instance of eventEmitter
     * @return {void}
     */
    registerEvents: function(registerCallback, thisArg) {
      if (typeof registerCallback === 'function') {
        registerCallback.call(thisArg, this._ee);
      }
    },
    /**
     * Initializes the page where this script is injected
     * @return {void}
     */
    initPage: function() {
        if ($('head').length === 0) {
            $('html').prepend("<head></head>");
        }
        AvastWRC.ial.injectFonts();
    },
    /**
     * Injects custom fonts
     * @return {void}
     */
    injectFonts: function () {
        if ($('#avast_os_ext_custom_font').length === 0) {
            $('head').append(`<link id='avast_os_ext_custom_font' href='${AvastWRC.bs.getLocalResourceURL('/common/ui/fonts/fonts.css')}' rel='stylesheet' type='text/css'>`)
        }
    },
    /**
     * Message hub - handles all the messages from the background script
     * @param  {String} message
     * @param  {Object} data
     * @param  {Function} reply
     * @return {void}
     */
    messageHub: function(message, data, reply) {
      // emit messages in specific namespace
      this._ee.emit('message.' + message, data, reply);
    },
    /**
     * Reinitialize the page. Handle 'reInit' message from background.
     */
    reInitPage: function (data) {
      AvastWRC.ial.initPage();
      AvastWRC.ial.attachHandlers();
    },
    /**
     * Attaches DOM handlers
     * @return {void}
     */
    attachHandlers: function() {
      typeof $ !== 'undefined' && $(document).ready(function() {
        window.onunload = AvastWRC.ial.onUnload;     
      });
    },
    /**
     * Notifies the background script
     * @return {void}
     */
    onUnload: function() {
      // we should remove our content from the page
      AvastWRC.ial.bs.messageHandler('unload');
    },
    /**
     * Hides the message box, if present, and restores the page to its initial state
     * @return {void}
     */
    clearBoxes: function() {
      $("body").removeClass("avast-overlay-on").removeClass("avast-bar-on").removeClass("avast-install-on");
    },
    /**
     * Retrive the top element of the page.
     * See: http://stackoverflow.com/questions/10100540/chrome-extension-inject-sidebar-into-page
     * @return retrieved top element to inject ext. HTML into
     */
    getTopHtmlElement: function () {
      var docElement = document.documentElement;
      if (docElement) {
        return $(docElement); //just drop $ wrapper if no jQuery
      } else {
        docElement = document.getElementsByTagName('html');
        if (docElement && docElement[0]) {
          return $(docElement[0]);
        } else {
          docElement = $('html');
          if (docElement.length > -1) {//drop this branch if no jQuery
            return docElement;
          } else {
            throw new Error('Cannot insert the bar.');
          }
        }
      }
    },

    /**
     * Create the button effect
     */

    addRippleEffect: function (e, buttonClassName, bgColor) {
      if(!buttonClassName) return false;
      if(!bgColor){
          bgColor = "#034c1d";
      }
      var target = e.target;
      var rect = target.getBoundingClientRect();
      var ripple = document.createElement('div');
      var max = Math.floor(Math.max(rect.width, rect.height)/2);
      ripple.style.setProperty("height", max + "px", "important");
      ripple.style.setProperty("width", max + "px", "important");
      if(bgColor)ripple.style.setProperty("background-color", bgColor, "important");
      ripple.className = 'avast-sas-ripple';
      target.appendChild(ripple);
      ripple.style.setProperty("zIndex", "-1", "important");
      var top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
      var left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft;
      ripple.style.setProperty("top", top + "px", "important");
      ripple.style.setProperty("left", left + "px", "important");
      $('.avast-sas-ripple').addClass("animate");

			setTimeout(() => {
					$(".avast-sas-ripple").remove()
			}, 3000);

      return false;
    },
    
  }; // AvastWRC.ial

  /*AvastWRC.ial.registerEvents(function(ee) {
    ee.on('message.reInit',AvastWRC.ial.reInitPage);
  });*/

}).call(this, $, EventEmitter2);

/*******************************************************************************
 *
 *  avast! Online Security plugin
 *  (c) 2014 Avast Corp.
 *
 *  @author:
 *
 *  Injected Layer - SafePrice - cross browser
 *
 ******************************************************************************/

(function ($) {
    if (typeof AvastWRC === 'undefined' || typeof AvastWRC.ial === 'undefined') {
        console.error('AvastWRC.ial instance not initialised to add SafePrice component');
        return;
    } else if (typeof AvastWRC.ial.sp !== 'undefined') {
        return;
    }

    $.fn.scrollGuard = function () {
        return this
            .on('wheel', function (e) {
                var $this = $(this);
                if (e.originalEvent.deltaY < 0) {
                    /* scrolling up */
                    return ($this.scrollTop() > 0);
                } else {
                    /* scrolling down */
                    return ($this.scrollTop() + $this.innerHeight() < $this[0].scrollHeight);
                }
            });
    };

    $.fn.positionRight = function() {
        return {
            right: $(document).width() - (this.offset().left + this.outerWidth()),
            top: this.position().top
        }
    };

    AvastWRC.ial.sp = {

        PANEL_MIN_HEIGHT: 356,
        PANEL_DEFAULT_POSITION: {top: 16, right: 16},

        /**
         * Check the current page using the received selector.
         * @param {Object} page related data
         */
        data: {},
        topBarElement: null,
        animations: {},


        /**
         * Create a top bar instance
         * @param {String} bar template HTML to be injected
         * @param {String} selector of the injected bar template
         * @param {String} bar height styling ('40px')
         * @return {Object} a wrapper for the bar
         */
        topBar: function (barHtml, barElementSelector, barHeight, topBarRules) {
            var _oldHtmlTopMargin = null;
            var _oldGoogleTopElem = [];
            var _oldFixed = [];

            AvastWRC.ial.getTopHtmlElement().prepend(barHtml);

            return {
                /**
                 * Display the bar.
                 */
                show: function () {
                    if (AvastWRC.ial.sp.topBarMoved) return;
                    AvastWRC.ial.sp.topBarMoved = true;

                    $(barElementSelector).css({ top: '0px', left: '0px' });
                    AvastWRC.ial.getTopHtmlElement().css('margin-top',
                        function (index, value) {
                            _oldHtmlTopMargin = value;
                            return barHeight;
                        }
                    );
                    if (!RegExp("^http(s)?\\:\\/\\/\\www\\.chase\\.com\\/?").test(document.URL)) {
                        // fix for elements with position fixed
                        $("*").each(function () {
                            var $node = $(this);
                            if ($node[0].className == -1) {
                                if ($node.css("position") == "fixed") {
                                    var top = parseInt($node.css("top"));
                                    if (typeof (top) == "number" && !isNaN(top)) {
                                        var newValue = top + parseInt(barHeight);
                                        newValue += "px";
                                        $node.css("top", newValue);
                                        _oldFixed.push({ $node: $node, top: top });
                                    }
                                }
                            }
                        });
                    }

                    var appliedRule = 0;
                    if (topBarRules != null && topBarRules != undefined && topBarRules.rulesToApply > 0 && topBarRules.specifics != []) {
                        $(topBarRules.specifics).each(function (i, specific) {
                            if (topBarRules.rulesToApply > appliedRule) {
                                var propVal = 0;
                                var newValue = 0;
                                if (specific.computedStyle) {
                                    var elem = document.getElementsByClassName(specific.styleName);
                                    if (elem[0]) {
                                        propVal = window.getComputedStyle(elem[0], specific.computedStyle).getPropertyValue(specific.styleProperty);
                                    }
                                }
                                else {
                                    propVal = parseInt($(specific.styleName).css(specific.styleProperty));
                                }

                                if (specific.dynamicValue) {
                                    propVal = specific.dynamicOldValue;
                                    newValue = specific.dynamicValue;
                                } else if (propVal == "auto") {
                                    newValue = parseInt(barHeight);
                                    newValue += "px";
                                }
                                else {
                                    propVal = parseInt(propVal);
                                    if (typeof (propVal) == "number" && !isNaN(propVal)) {
                                        newValue = propVal + parseInt(barHeight);
                                        newValue += "px";
                                    }
                                }
                                if (newValue != 0) {
                                    if (specific.computedStyle) {
                                        var rule = "." + specific.styleName + "::" + specific.computedStyle;
                                        var value = specific.styleProperty + ": " + newValue;

                                        try {
                                            document.styleSheets[0].insertRule(rule + ' { ' + value + ' }', 0);
                                        } catch (e) {
                                            console.log(e);
                                        }

                                        _oldGoogleTopElem.push({
                                            styleName: specific.styleName,
                                            styleProperty: specific.styleProperty,
                                            computedStyle: specific.computedStyle,
                                            oldValue: propVal
                                        });
                                        appliedRule++;
                                    }
                                    else {
                                        $(specific.styleName).css(specific.styleProperty, newValue);
                                        _oldGoogleTopElem.push({
                                            styleName: specific.styleName,
                                            styleProperty: specific.styleProperty,
                                            oldValue: propVal
                                        });
                                        appliedRule++;
                                    }
                                }
                            }
                        });
                    }
                    return true;
                },
                /**
                 * Remove/close the top bar and reset relevant CSS.
                 */
                remove: function () {
                    $(barElementSelector).remove();
                    // restore page position
                    if (_oldHtmlTopMargin)
                        AvastWRC.ial.getTopHtmlElement().css('margin-top', _oldHtmlTopMargin);

                    // revert altered fixed positions.
                    if (_oldFixed.length > 0) {
                        for (var i = 0, j = _oldFixed.length; i < j; i++) {
                            _oldFixed[i].$node.css("top", _oldFixed[i].top + "px");
                        }
                    }
                    if (_oldGoogleTopElem != null) {
                        for (var i = 0, j = _oldGoogleTopElem.length; i < j; i++) {
                            if (_oldGoogleTopElem[i].computedStyle) {
                                var rule = "." + _oldGoogleTopElem[i].styleName + "::" + _oldGoogleTopElem[i].computedStyle;
                                var value = _oldGoogleTopElem[i].styleProperty + ": " + _oldGoogleTopElem[i].oldValue;

                                try {
                                    document.styleSheets[0].insertRule(rule + ' { ' + value + ' }', 0);
                                } catch (e) {
                                    console.log(e);
                                }
                            }
                            else {
                                $(_oldGoogleTopElem[i].styleName).css(_oldGoogleTopElem[i].styleProperty, _oldGoogleTopElem[i].oldValue + (_oldGoogleTopElem[i].oldValue === "" ? "" : "px"));
                            }
                        }
                    }
                }
            };
        },

        checkSafeShop: function (data) {
            var safeShopData = $.extend({ scan: null }, data);
            if (data.csl && !safeShopData.onlyCoupons) {
                switch (data.providerId) {
                    case "ciuvo":
                        // product scan - to retrieve page data
                        AvastWRC.ial.productScan(data.csl, function (response) {
                            safeShopData.scan = response;
                            safeShopData.referrer = document.referrer;
                            AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
                        });
                        break;
                    case "comprigo":
                        // product scan - to retrieve page data
                        AvastWRC.ial.comprigoRun(data.csl, data.url, function (response) {
                            safeShopData.scan = response;
                            safeShopData.referrer = document.referrer;
                            AvastWRC.ial.bs.messageHandler('safeShopOffersFound', safeShopData);
                        });
                        break;
                }
            }
        },

        feedback: function (data) {
            AvastWRC.ial.bs.messageHandler('safeShopFeedback', data);
        },

        makeDraggable: function (el, effectedEl = null, dragEndCallback = null) {
            if (!effectedEl) effectedEl = el;

            let newX = 0, newY = 0, originalX = 0, originalY = 0, movementThreshold = 3;
            el.onmousedown = onDragMouseDown;

            function onDragMouseDown(e) {
                let ids = {
                    sideNotifications: {classId: "a-sp-notifications-header-drag", eventType: 'notifications_events'},
                    redirectNotifications: {classId: "a-sp-notifications-redirect-header-drag", eventType: 'notifications_events'},
                    panel: {classId: "a-panel", eventType: 'main_ui_event'},
                    minimized: {classId: "asp-panel-min", eventType: 'minimized_ui_dragged'},
                }
                e = e || window.event;
                originalX = e.clientX;
                originalY = e.clientY;
                document.onmouseup = stopDrag;
                document.onmousemove = dragElement;
            }

            function dragElement(e) {
                let distX = Math.abs(originalX - e.clientX);
                let distY = Math.abs(originalY - e.clientY);
                if ((originalX === e.clientX && originalY === e.clientY)) return;
                if (Math.max(distX, distY) > movementThreshold) {
                    $(effectedEl).addClass('dragged');
                }
                e = e || window.event;
                newX = originalX - e.clientX;
                newY = originalY - e.clientY;
                originalX = e.clientX;
                originalY = e.clientY;
                let newTop = effectedEl.offsetTop - newY;
                let newLeft = effectedEl.offsetLeft - newX;
                let newRight = document.body.scrollWidth - (newLeft + effectedEl.scrollWidth);
                let maxHeight = window.innerHeight - effectedEl.clientHeight;
                let maxWidth = document.body.scrollWidth - effectedEl.clientWidth;
                if (effectedEl.clientHeight < window.innerHeight) {
                    effectedEl.style.top = (newTop < 0 ? 0 : newTop > maxHeight ? maxHeight : newTop) + "px";
                    //effectedEl.style.left = (newLeft < 0 ? 0 : newLeft > maxWidth ? maxWidth : newLeft) + "px";
                    effectedEl.style.left = null;
                    effectedEl.style.right = Math.max(0, Math.min(newRight, maxWidth)) + "px";
                }
                return false;
            }

            function stopDrag(e) {
                document.onmouseup = null;
                document.onmousemove = null;
                setTimeout(function () {
                    $(effectedEl).removeClass('dragged');
                }, 100);
                if (dragEndCallback && typeof dragEndCallback === 'function'){
                    dragEndCallback();
                }
            }
        },

        makeResizeable: function(el, effectedEl = null, minHeight = 0, maxHeight = null){
            if (!effectedEl) effectedEl = el;
            if (!maxHeight) maxHeight = window.innerHeight;

            let startY = 0;
            let startHeight = 0;

            el.onmousedown = onDragMouseDown;

            function onDragMouseDown(e) {
                e = e || window.event;
                startY = e.clientY;
                startHeight = parseInt(document.defaultView.getComputedStyle(effectedEl).height, 10);
                document.onmouseup = stopResize;
                document.onmousemove = resizeElement;
            }

            function resizeElement(e) {
                let newHeight = startHeight + e.clientY - startY;

                let rect = effectedEl.getBoundingClientRect();
                if (rect.top + newHeight > maxHeight) return false;

                effectedEl.style.height = Math.min(Math.max(newHeight, AvastWRC.ial.sp.PANEL_MIN_HEIGHT), maxHeight) + 'px';
                return false;
            }

            function stopResize(e) {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        },

        /**
         * Creates UI for the Top Bar (SafeZone)
         * @param  {Object} data
         * @return {[type]}
         */
        createPanel: function (data, isCouponTab = null) {
            if(!AvastWRC.ial.sp.couponInTab && !isCouponTab){
                AvastWRC.ial.sp.data = data;
                // we have all the info we need to create the panel but it will be only shown on the click on notifications
                if ($('#a-panel').length === 0) {

                    let position = AvastWRC.ial.sp.PANEL_DEFAULT_POSITION;
                    if(AvastWRC.ial.sp.data.panelData.panelPosition && AvastWRC.ial.sp.data.panelData.panelPosition.position) {
                        position = AvastWRC.ial.sp.data.panelData.panelPosition.position;
                    }
                    var ourTemplate = Mustache.render(AvastWRC.Templates.safeShopPanel, AvastWRC.ial.sp.data.panelData);
                    AvastWRC.ial.getTopHtmlElement().prepend(ourTemplate);
                    $(AvastWRC.ial.sp.notifications.config.notificationsContainer.panel).css(position);
                    this.makeDraggable(document.getElementById('a-panel-header'), document.getElementById('a-panel'),
                        () => {
                            AvastWRC.ial.sp.feedback({
                                type: 'panel_ui_dragged_ended',
                                position: $(AvastWRC.ial.sp.notifications.config.notificationsContainer.panel).positionRight() || AvastWRC.ial.sp.PANEL_DEFAULT_POSITION
                            })

                        });
                    this.makeResizeable(document.getElementById('panel-resize'), document.getElementById('a-panel'), AvastWRC.ial.sp.PANEL_MIN_HEIGHT);
                    AvastWRC.ial.sp.BindPanelEvents();
                    $('.a-sp-items-wrapper').scrollGuard();

                    $('#a-panel').mouseenter(function () {
                        AvastWRC.ial.sp.isPanelActive = true;
                    }).mouseleave(function () {
                        AvastWRC.ial.sp.isPanelActive = false;
                    });

                }
                this.notifications.prepareTemplates(data.panelData.notifications);
                this.userFeedback.prepareTemplate(data.panelData.userFeedback);
            }
        },

        showCouponPanel: function (data, isCouponTab = null) {
            if(AvastWRC.ial.sp.couponInTab && isCouponTab){
                AvastWRC.ial.sp.data = data;
                // we have all the info we need to create the panel but it will be only shown on the click on notifications
                if ($('#a-coupon-panel').length === 0) {
                    var ourTemplate = Mustache.render(AvastWRC.Templates.safeShopCouponPanel, AvastWRC.ial.sp.data);
                    AvastWRC.ial.getTopHtmlElement().prepend(ourTemplate);
                    $('#a-coupon-panel').addClass('asp-sas-display-grid');
                    AvastWRC.ial.sp.makeDraggable(document.getElementById('couponPanelHeader'), document.getElementById('a-coupon-panel'),
                        () => {
                            AvastWRC.ial.sp.feedback({
                                type: 'standard_ui_dragged_ended',
                                position: $(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard).positionRight() || AvastWRC.ial.sp.PANEL_DEFAULT_POSITION
                            })
                        });
                    $('#closeCouponPanel').click(function(){
                        var elem = document.getElementById("a-coupon-panel");
                        if (elem) {
                            elem.parentNode.removeChild(elem);
                        }
                        AvastWRC.ial.sp.feedback({
                            type: 'main_ui_event',
                            action: "close_click",
                            domain: data.domain,
                            category: "COUPON_APPLIED_NOTIFICATION",
                            campaignId: data.campaignId,
                            showABTest: data.showABTest,
                            referrer: data.referrer || "",
                            transactionId: data.transactionId || "",
                            data: data
                            //isCouponTab: AvastWRC.ial.sp.couponInTab /*only if event needed*/
                        });
                    });
                    $(".a-sp-panel-header-icon").click(function () {
                        var data = AvastWRC.ial.sp.data;
                        AvastWRC.ial.sp.feedback({
                            type: 'main_ui_event',
                            action: 'logo_click',
                            category: "COUPON_APPLIED_NOTIFICATION",
                            domain: data.urlDomain,
                            campaignId: data.campaignId,
                            showABTest: data.showABTest,
                            referrer: data.referrer || "",
                            transactionId: data.transactionId || ""
                        });
                    });

                }
            }
        },

        moveExternalPanels: function (size) {
            let element = $("#honeyContainer"), positionOffset = 15;

            if (element && element[0] && element[0].shadowRoot && element[0].shadowRoot.childNodes && element[0].shadowRoot.childNodes[2])
                element[0].shadowRoot.childNodes[2].style.setProperty('top', `${isNaN(size) ? getCurrentNotificationSize() : size}px`, 'important');

            function getCurrentNotificationSize() {
                for (let key in AvastWRC.ial.sp.notifications.config.notificationsContainer) {
                    if ($(AvastWRC.ial.sp.notifications.config.notificationsContainer[key]).length
                        && ($(AvastWRC.ial.sp.notifications.config.notificationsContainer[key]).css('display') !== "none")) {
                        return document.getElementById(AvastWRC.ial.sp.notifications.config.notificationsContainer[key].replace("#", "")).clientHeight + positionOffset;
                    }
                }

                return 0;
            }
        },

        UpdateContent: function (parentClass, prepend, contentId, templateId, bindCallBack, data = null) {
            if (!data) data = AvastWRC.ial.sp.data;

            var elem = document.getElementById(contentId);
            if (elem) {
                elem.parentNode.removeChild(elem);
            }
            if (prepend) {
                $(parentClass).prepend(Mustache.render(templateId, data));
            } else {
                $(parentClass).append(Mustache.render(templateId, data));
            }
            if (typeof bindCallBack === "function") {
                bindCallBack();
            }
        },

        updatePanel: function (data, isCouponTab = null) {
           console.log("updatePanel");
            if(AvastWRC.ial.sp.couponInTab && isCouponTab){
                AvastWRC.ial.sp.coupopnIntabData = data;
                if (data && data.couponsLength > 0) {
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "couponsWrapper", AvastWRC.Templates.couponsWrapper, function () {
                        $('#couponsTabState').removeClass("a-sp-shown").addClass("a-sp-to-be-shown");
                    }, AvastWRC.ial.sp.coupopnIntabData);
                }
            }else{
                var selectedTab = "";
                if(AvastWRC.ial.sp.data && AvastWRC.ial.sp.data.panelShown){
                    selectedTab = AvastWRC.ial.sp.data.activeTab;
                    data.panelShown = true
                }
                AvastWRC.ial.sp.data = data;
                if (data.transactionFinished && data.iconClicked) {
                    AvastWRC.ial.sp.feedback({
                        type: 'reset_icon_click'
                    });
                }
                // on the case we receive more info to show
                if (data && data.producstLength > 0) {
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "offersWrapper", AvastWRC.Templates.offersWrapper, function () {
                        $('#offersTabState').removeClass("a-sp-shown").addClass("a-sp-to-be-shown");
                        AvastWRC.ial.sp.BindOfferEvents();
                        showPanelInSelectedTab();
                    });
                }

                if (data && data.accommodationsLength > 0) {
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "offersWrapper", AvastWRC.Templates.offersWrapper, function () {
                        $('#offersTabState').removeClass("a-sp-shown").addClass("a-sp-to-be-shown");
                        AvastWRC.ial.sp.BindOfferEvents();
                        showPanelInSelectedTab();
                    });
                }

                if (data && data.couponsLength > 0) {
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "couponsWrapper", AvastWRC.Templates.couponsWrapper, function () {
                        $('#couponsTabState').removeClass("a-sp-shown").addClass("a-sp-to-be-shown");
                        AvastWRC.ial.sp.BindCouponEvents();
                        showPanelInSelectedTab();
                    });
                }

                if (data && data.redirectLength > 0) {
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "othersWrapper", AvastWRC.Templates.othersWrapper, function () {
                        $('#othersTabState').removeClass("a-sp-shown").addClass("a-sp-to-be-shown");
                        AvastWRC.ial.sp.BindOtherEvents();
                        showPanelInSelectedTab();
                    }, { redirect: data.redirect[0], templateData: data.panelData.redirect, isPanelTemplate: true, isRedirect: true });
                }
                else if (data && data.similarCouponsValue > 0) {
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "othersWrapper", AvastWRC.Templates.othersWrapper, function () {
                        $('#othersTabState').removeClass("a-sp-shown").addClass("a-sp-to-be-shown");
                        AvastWRC.ial.sp.BindOtherEvents();
                        showPanelInSelectedTab();
                    }, { similarCoupon: data.similarCoupons[0], templateData: AvastWRC.ial.sp.data.panelData.notifications.templateData, isPanelTemplate: true, isSimilarCoupons: true });
                }

                function showPanelInSelectedTab(){
                    if (selectedTab == "OFFERS_TAB_HIGHLIGHTED") {
                        AvastWRC.ial.sp.OffersTabClick();
                    }
                    else if (selectedTab == "COUPONS_TAB_HIGHLIGHTED") {
                        AvastWRC.ial.sp.CouponsTabClick();
                    }
                    else if (selectedTab == "OTHERS_TAB_HIGHLIGHTED") {
                        AvastWRC.ial.sp.OthersTabClick();
                    }
                }
            }
        },

        /**
         * Adds a tooltip to a given selector with a given timeout.
         * Please use the a-sp-tooltip / a-sp-tooltip-hidden classes with this function.
         * @param selector string - DOM element to apply tooltip on
         * @param delay int - Tooltip display timeout
         * @param align boolean - Align tooltip to element
         */
        attachTooltip: function addTooltip(selector, delay = 1000, align = true){
            let timer;
            $(selector).mouseenter(function() {
                let that = this;
                timer = setTimeout(function(){
                    $(that).find(".a-sp-tooltip").removeClass('a-sp-tooltip-hidden');
                    if (align) {
                        let parentLeftPos = $(selector).position().left;
                        let parentWidth = $(selector).width();
                        let childWidth = $(that).find(".a-sp-tooltip").width();
                        let pos = parentLeftPos - (childWidth - parentWidth) + (childWidth - parentWidth) / 2 - parentWidth / 2;
                        $(that).find(".a-sp-tooltip").css("left", pos + "px", "important");
                    }
                }, delay);
            }).mouseleave(function() {
                $(selector).find(".a-sp-tooltip").addClass('a-sp-tooltip-hidden');
                clearTimeout(timer);
            });
        },

        BindPanelEvents: function () {
            $("#closePanel").click(function (e) {
                AvastWRC.ial.sp.ClosePanel(e);
                if(AvastWRC.ial.sp.data.feedbackInfo.askForFeedback) AvastWRC.ial.sp.userFeedback.showFeedbackQuestion();
            });
            $("#minPanel").click(function (e) {
                AvastWRC.ial.sp.MinPanel(e);
                AvastWRC.ial.sp.stopAnimation("PULSE");
                var data = AvastWRC.ial.sp.data;
                if(!AvastWRC.ial.sp.couponInTab){
                    AvastWRC.ial.sp.feedback({
                        type: 'main_ui_event',
                        action: 'minimize_click',
                        category: data.activeTab,
                        domain: data.urlDomain,
                        campaignId: data.campaignId,
                        showABTest: data.showABTest,
                        referrer: data.referrer || "",
                        transactionId: data.transactionId || "",
                        //isCouponTab: AvastWRC.ial.sp.couponInTab /*only if event needed*/
                    });
                }
            });
            $("#helpPanel").click(function (e) {
                AvastWRC.ial.sp.helpPanel(e);
            });
            $("#settingsPanel").click(function (e) {
                AvastWRC.ial.sp.SettingsPanel(e);
            });
            $("#offersTab").click(function (e) {
                AvastWRC.ial.sp.OffersTabClick(e);
                var data = AvastWRC.ial.sp.data;
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'offers_tab_click',
                    category: AvastWRC.ial.sp.data.defaultTab,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });
            });
            $("#couponsTab").click(function (e) {
                AvastWRC.ial.sp.CouponsTabClick(e);
                var data = AvastWRC.ial.sp.data;
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'coupons_tab_click',
                    category: AvastWRC.ial.sp.data.defaultTab,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });
            });
            $("#othersTab").click(function (e) {
                AvastWRC.ial.sp.OthersTabClick(e);
                var data = AvastWRC.ial.sp.data;
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'others_tab_click',
                    category: AvastWRC.ial.sp.data.defaultTab,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });
            });
            $(".a-sp-header-top-left").click(function () {
                let data = AvastWRC.ial.sp.data;
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'logo_click',
                    category: data.activeTab,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });
            });

            this.attachTooltip("#closePanel");
            this.attachTooltip("#minPanel");
            this.attachTooltip("#helpPanel");
            this.attachTooltip("#settingsPanel");
        },

        BindMinPanelEvents: function (el) {
            $("#asp-panel-min").click(function (e) {
                if (!$(this).hasClass("dragged")) {
                    AvastWRC.ial.sp.MaxPanel(e);
                    AvastWRC.ial.sp.stopAnimation("PULSE");
                    AvastWRC.ial.sp.data.hasNewNotifications = false;
                }
            })
        },

        stopAnimation(name){
            if (AvastWRC.ial.sp.animations.name) {
                clearInterval(AvastWRC.ial.sp.animations[name]);
                delete AvastWRC.ial.sp.animations[name];
            }
        },

        BindOfferEvents: function () {
            $(".asp-offer-item").click(function (e) {
                AvastWRC.ial.sp.OfferClick(e, "MAIN_UI_ITEM");
            });
            $(".asp-offer-item-hotel-image").on("error", function(e){
                $(this).attr('src', AvastWRC.ial.sp.data.panelData.images.placeholder);
            });
            $(".asp-offer-item-image").on("error", function(){
                $(this).attr('src', AvastWRC.ial.sp.data.panelData.images.placeholder);
            });
        },

        BindOtherEvents: function () {
            $("#redirectButton").click(function (e) {
                AvastWRC.ial.sp.OfferClick(e, "MAIN_UI_ITEM");
            });
            $("#redirectMoreInfo").click(function (e) {
                AvastWRC.ial.sp.toggleExtraRedirectInfo();
            });

            $("#redirectImage").on("error", function(e){
                $(this).attr('src', AvastWRC.ial.sp.data.panelData.images.redirectPlaceholderBig);
            });
            $("#redirectImageDefault").on("error", function(e){
                $(this).attr('src', AvastWRC.ial.sp.data.panelData.images.redirectPlaceholderBig);
            })

            $("#similarCouponsButton").click(function (e) {
                AvastWRC.ial.sp.CouponClick(e, "MAIN_UI_ITEM");
            });
        },

        toggleExtraRedirectInfo: function () {
            let redirectExtraInfoIcon = ".a-sp-notifications-redirect-info-icon",
                redirectExtraInfoText = ".a-sp-notifications-redirect-info-text",
                redirectExtraInfoTextPaddingElement = ".a-sp-notifications-redirect-info-toggle-text-padding",
                redirectExtraInfoLess = ".a-sp-notifications-redirect-info-less",
                redirectExtraInfoMore = ".a-sp-notifications-redirect-info-more",
                rotateClass = "a-sp-notifications-rotate";

            rotateExtraInfoIcon();
            toggleExtraInfoContent();

            function rotateExtraInfoIcon() {
                $(redirectExtraInfoIcon).toggleClass(rotateClass);
            }

            function toggleExtraInfoContent() {
                $(redirectExtraInfoText).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                $(redirectExtraInfoLess).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                $(redirectExtraInfoMore).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                $(redirectExtraInfoTextPaddingElement).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
            }
        },

        BindCouponEvents: function () {
            let bottomCouponsSelector = ".asp-coupon-bottom", openShopSelector = ".asp-open-shop",
                couponBottomWithCodeSelector = ".asp-coupon-bottom-with-code";

            $(`${bottomCouponsSelector}, ${openShopSelector}, ${couponBottomWithCodeSelector}`).off();

            AvastWRC.ial.sp.activateShowMoreTextDivs();

            $(bottomCouponsSelector).click(function (e) {
                console.log('coupon clicked fired');
                e.preventDefault();
                $(".asp-coupon-hover").removeClass("avast-sas-display-block");
                AvastWRC.ial.sp.SetActiveCoupon(e);
            });

            $(openShopSelector).click(function(e){
                e.preventDefault();
                AvastWRC.ial.sp.CouponClick(e, "MAIN_UI_ITEM_APPLIED");
            });

            $(couponBottomWithCodeSelector).click(function (e) {
                e.preventDefault();
                AvastWRC.ial.sp.copyTextToClipboard(e);
            });

            AvastWRC.ial.sp.UpdateContent("#a-panel", false, "activeCoupons", AvastWRC.Templates.activeCoupons, function () {
                $('.a-sp-active-coupons-info').click(function (e) {
                    $(".a-sp-items-wrapper").animate({scrollTop: 0}, 1000);
                    AvastWRC.ial.sp.CouponsTabClick();
                    //AvastWRC.ial.sp.socialSharing.init();
                });
            });

        },

        activateShowMoreTextDivs: function (activeCoupons = null){
            $(".asp-coupon-description-more-info").unbind("click");
            $(".asp-coupon-description-less-info").unbind("click");

            if(AvastWRC.ial.sp.couponInTab && activeCoupons){
                $(".asp-coupon-top").each(function(index,item){
                    changeValue(item);
                });
            }
            $(".asp-coupon-item").each(function(index,item){
                changeValue(item);
            });
            $(".asp-coupon-item-active").each(function(index,item){
                changeValue(item);
            });

            $(".asp-coupon-item-active-with-code").each(function(index,item){
                changeValue(item);
            });
            function changeValue(item){
                if(!item)return;
                var elDesc = $(item).find(".asp-coupon-description") || $(item).find(".asp-coupon-description-full-size");
                var elDescText = $(item).find(".asp-coupon-description-text") || $(item).find(".asp-coupon-description-full-size-text");
                if(elDesc &&  elDescText){
                    if($(elDescText).height() > $(elDesc).height() 
                        || $(elDescText).prop('scrollHeight') > $(elDescText).height() ){
                        if(AvastWRC.ial.sp.couponInTab && activeCoupons){
                            $(item.children[3]).css("opacity", 1);
                            $(item.children[3]).css("margin-bottom", "10px");
                            $(item.children[3]).css("cursor", "pointer");
                            $(item.children[3])[0].id = "more-info-show";
                        }
                        else{
                            $(item.children[0].children[3]).css("opacity", 1);
                            $(item.children[0].children[3]).css("cursor", "pointer");
                            $(item.children[0].children[3])[0].id = "more-info-show";
                        }
                    }
                }
            }
            $(".asp-coupon-description-less-info").click(function(e){
                showLess(e);
            });

            $(".asp-coupon-description-more-info").click(function(e){
                showMore(e);
            });

            function showMore(e) {
                if(e.currentTarget.id.indexOf("more-info-show") == -1)return;
                var text = AvastWRC.ial.sp.couponInTab ? AvastWRC.ial.sp.data.appiedCouponData.strings.spNotificationRedirectShowLessMessage : AvastWRC.ial.sp.data.panelData.strings.spNotificationRedirectShowLessMessage;
                e.preventDefault();
                $(e.currentTarget.parentElement.children[2]).css("height", "auto");
                $(e.currentTarget.parentElement.children[2].children[0]).css("-webkit-line-clamp", "1000");
                e.currentTarget.className = "asp-coupon-description-less-info";
                e.currentTarget.innerText = text || "Less";
                AvastWRC.ial.sp.activateShowMoreTextDivs();
            }

            function showLess(e) {
                if(e.currentTarget.id.indexOf("more-info-show") == -1)return;
                var text = AvastWRC.ial.sp.couponInTab ? AvastWRC.ial.sp.data.appiedCouponData.strings.spNotificationRedirectShowMoreMessage : AvastWRC.ial.sp.data.panelData.strings.spNotificationRedirectShowMoreMessage;
                e.preventDefault();
                console.log(e);
                $(e.currentTarget.parentElement.children[2]).css("height", "39px");
                $(e.currentTarget.parentElement.children[2].children[0]).css("-webkit-line-clamp", "3");
                e.currentTarget.className = "asp-coupon-description-more-info";
                e.currentTarget.innerText = text || "More";
                AvastWRC.ial.sp.activateShowMoreTextDivs();
            }    
        },

        SetActiveCoupon: function (e) {
            let couponUrl = e.currentTarget.attributes.resurl.value;

            if (AvastWRC.ial.sp.ModifyInList(AvastWRC.ial.sp.data.coupons, couponUrl, "selected", true)) {
                AvastWRC.ial.sp.data.vouchersSelectedCounter = AvastWRC.ial.sp.data.vouchersSelectedCounter + 1;
                if (AvastWRC.ial.sp.data.vouchersSelectedCounter >= 10) {
                    AvastWRC.ial.sp.data.vouchersCounterBig = true;
                    AvastWRC.ial.sp.UpdateContent(".a-sp-items-wrapper", true, "activeCoupons", AvastWRC.Templates.activeCoupons, function () {
                    });
                }
                AvastWRC.ial.sp.data.vouchersSelected = true;
                AvastWRC.ial.sp.data.vouchersAvailable = (AvastWRC.ial.sp.data.couponsLength - AvastWRC.ial.sp.data.vouchersSelectedCounter) > 0;

                this.addActiveCoupon(e, couponUrl);
            }
        },

        addActiveCoupon: function (e, couponUrl) {
            $(`div[resurl="${couponUrl}"]`).replaceWith(Mustache.render(AvastWRC.Templates.selectedCoupon, this.getClickedCouponTemplateData(couponUrl)));
            AvastWRC.ial.sp.BindCouponEvents();
            AvastWRC.ial.sp.CouponClick(e, "MAIN_UI_ITEM");
            AvastWRC.ial.sp.animateSelectedCoupon(couponUrl);
        },

        addActiveCouponsSeparator: function () {
            if (AvastWRC.ial.sp.data.vouchersSelectedCounter !== 1) return;

            AvastWRC.ial.sp.data.selectedCouponAnimation = true;

            let selectors = AvastWRC.ial.sp.commonSelectors, separators = {
                first: Mustache.render(AvastWRC.Templates.separatorTextFirst, AvastWRC.ial.sp.data),
                second: Mustache.render(AvastWRC.Templates.separatorTextSecond, AvastWRC.ial.sp.data)
            };

            $(selectors.couponsWrapper).prepend(separators.first);
            $(selectors.firstCouponsSeparator).after(separators.second);
        },

        setCouponsSeparatorVisibility: function () {
            $(`${AvastWRC.ial.sp.commonSelectors.firstCouponsSeparator}, ${AvastWRC.ial.sp.commonSelectors.secondCouponsSeparators}`).animate({"opacity": 1}, {
                duration: AvastWRC.ial.sp.data.vouchersSelectedCounter !== 1 ? 0 : 460,
                queue: false
            });
        },

        getClickedCouponTemplateData: function (couponUrl) {
            let clickedCouponData = AvastWRC.ial.sp.data.coupons.find(function (element) {
                return element.url === couponUrl;
            });

            clickedCouponData.panelData = AvastWRC.ial.sp.data.panelData;
            clickedCouponData.selectedCouponAnimation = true;

            return clickedCouponData;
        },

        animateSelectedCoupon: function (couponUrl) {
            let selectors = AvastWRC.ial.sp.commonSelectors;

            AvastWRC.ial.sp.addActiveCouponsSeparator();

            setTimeout(initAnimation, 100);

            function initAnimation() {
                let clickedCoupon = $(`div[resurl="${couponUrl}"]`),
                    listHeight = $(selectors.couponsWrapper).innerHeight(),
                    elemHeight = clickedCoupon.outerHeight(true),
                    elemTop = clickedCoupon.position().top,
                    activeShadowClass = "asp-coupon-bottom-with-code-active-shadow",
                    speed = 0, speedPerElement = 250,
                    socialCardHeight = AvastWRC.ial.sp.socialSharing.getCurrentHeightOnTop(),
                    elementsToAvoidOnMovingDown = [selectors.firstCouponsSeparator.replace(".", ""), AvastWRC.ial.sp.socialSharing.getContainerId()],
                    moveUp = listHeight - (listHeight - elemTop) - $(selectors.firstCouponsSeparator).outerHeight(true) - socialCardHeight;

                // It moves all elements down after the clicked coupon
                $(selectors.couponsWrapper).children().each(function () {
                    if ($(this).attr("resurl") === couponUrl) return false;
                    speed += speedPerElement;
                    if (elementsToAvoidOnMovingDown.indexOf($(this).attr("id")) < 0) $(this).animate({"top": '+=' + elemHeight}, speed);
                });

                // Animation up
                $(function () {
                    clickedCoupon.addClass(activeShadowClass);

                    clickedCoupon.animate({"top": '-=' + moveUp}, speed, function () {
                        let firstSeparatorHTML = $(selectors.firstCouponsSeparator)[0].outerHTML,
                            socialCardOnTopHTML = AvastWRC.ial.sp.socialSharing.getCurrentHTMLOnTop(),
                            clickedCouponHtTML = clickedCoupon[0].outerHTML.replace(new RegExp("asp-coupon-item-code-animation", 'g'), "");

                        $(this).remove();
                        $(selectors.firstCouponsSeparator).remove();
                        $(selectors.couponsWrapper).html(socialCardOnTopHTML
                            + firstSeparatorHTML
                            + clickedCouponHtTML.replace(activeShadowClass, "")
                            + $(selectors.couponsWrapper).html().replace(socialCardOnTopHTML, "").replace("asp-coupon-item-code-animation", ""));
                        $(`${selectors.couponsWrapper} *`).attr("style", "");
                        AvastWRC.ial.sp.setCouponsSeparatorVisibility();
                        AvastWRC.ial.sp.BindCouponEvents();
                        AvastWRC.ial.sp.socialSharing.init();
                        AvastWRC.ial.sp.socialSharing.moveCardToTop();
                    });

                    AvastWRC.ial.sp.scrollTop(speed - 100, socialCardHeight);
                });
            }
        },

        scrollTop: function (speed, position = 0) {
            $(AvastWRC.ial.sp.commonSelectors.scroll).animate({scrollTop: position}, {duration: speed, queue: false});
        },

        ClosePanel: function (e) {
            $('#a-panel').removeClass('asp-sas-display-grid')
                .addClass('asp-sas-display-none');
            //AvastWRC.ial.sp.UnbindPanelEvents();

            var data = AvastWRC.ial.sp.data;
            if(!AvastWRC.ial.sp.couponInTab){
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: "close_click",
                    domain: data.urlDomain,
                    category: data.activeTab,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || "",
                    //isCouponTab: AvastWRC.ial.sp.couponInTab /*only if event needed*/
                });
            }
            AvastWRC.ial.sp.moveExternalPanels(0);
        },

        MinPanel: function (e, minimizedNotification) {
            $('#a-panel').removeClass('asp-sas-display-grid').addClass('asp-sas-display-none');
            AvastWRC.ial.sp.data.isNotification = false;
            AvastWRC.ial.sp.notifications.showMinimizedNotification();
        },

        MaxPanel: function (e) {
            $('#asp-panel-min').addClass(AvastWRC.ial.sp.notifications.config.classForHidden);
            //AvastWRC.ial.sp.UnBindMinPanelEvents();
            AvastWRC.ial.sp.showPanel("showMinimizedNotifications");
            var data = AvastWRC.ial.sp.data;
            if(!AvastWRC.ial.sp.couponInTab) {
                AvastWRC.ial.sp.feedback({
                    type: 'minimized_ui_clicked',
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });
            }

            AvastWRC.ial.sp.stopAnimation("PULSE");
            $(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedCircle).removeClass("a-sp-notifications-appear-pulse-animation");
            $(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedBadge).removeClass("a-sp-notifications-pulse-animation");
            $(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedInnerCircle).removeClass("a-sp-circle-animation");
        },

        SettingsPanel: function (e) {
            var data = AvastWRC.ial.sp.data;
            if(!AvastWRC.ial.sp.couponInTab){
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'settings_click',
                    category: data.activeTab,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || "",
                    //isCouponTab: AvastWRC.ial.sp.couponInTab /*only if event needed*/
                });
            }
        },

        helpPanel: function (e) {
            var data = AvastWRC.ial.sp.data;
            if(!AvastWRC.ial.sp.couponInTab){
                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'help_click',
                    category: data.activeTab,
                    domain: data.domain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || "",
                    //isCouponTab: AvastWRC.ial.sp.couponInTab /*only if event needed*/
                });
            }
        },

        OffersTabClick: function (e) {
            $('#offersTab').removeClass('a-sp-header-bottom-col1').addClass('a-sp-header-bottom-col1-selected');
            $('#couponsTab').removeClass('a-sp-header-bottom-col2-selected').addClass('a-sp-header-bottom-col2');
            $('#othersTab').removeClass('a-sp-header-bottom-col3-selected').addClass('a-sp-header-bottom-col3');

            $('#offersWrapper').addClass('asp-sas-display-block');
            $('#couponsWrapper').removeClass('asp-sas-display-block');
            $('#othersWrapper').removeClass('asp-sas-display-block');

            $('#offersTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");
            AvastWRC.ial.sp.data.activeTab = "OFFERS_TAB_HIGHLIGHTED";
        },

        CouponsTabClick: function (e) {
            $('#offersTab').removeClass('a-sp-header-bottom-col1-selected').addClass('a-sp-header-bottom-col1');
            $('#couponsTab').removeClass('a-sp-header-bottom-col2').addClass('a-sp-header-bottom-col2-selected');
            $('#othersTab').removeClass('a-sp-header-bottom-col3-selected').addClass('a-sp-header-bottom-col3');

            $('#offersWrapper').removeClass('asp-sas-display-block');
            $('#couponsWrapper').addClass('asp-sas-display-block');
            $('#othersWrapper').removeClass('asp-sas-display-block');

            $('#couponsTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");

            AvastWRC.ial.sp.data.activeTab = "COUPONS_TAB_HIGHLIGHTED";

            AvastWRC.ial.sp.activateShowMoreTextDivs();
        },

        OthersTabClick: function (e) {
            $('#offersTab').removeClass('a-sp-header-bottom-col1-selected').addClass('a-sp-header-bottom-col1');
            $('#couponsTab').removeClass('a-sp-header-bottom-col2-selected').addClass('a-sp-header-bottom-col2');
            $('#othersTab').removeClass('a-sp-header-bottom-col3').addClass('a-sp-header-bottom-col3-selected');

            $('#offersWrapper').removeClass('asp-sas-display-block');
            $('#couponsWrapper').removeClass('asp-sas-display-block');
            $('#othersWrapper').addClass('asp-sas-display-block');

            $('#othersTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");

            AvastWRC.ial.sp.data.activeTab = "OTHERS_TAB_HIGHLIGHTED";
        },

        FindInList: function (list, url) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].url === url) {
                    return { element: list[i], position: i };
                }
            }
            return null;
        },
        ModifyInList: function (list, url, key, value) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].url === url) {
                    list[i][key] = value;
                    return true;
                }
            }
            return false;
        },

        OfferClick: function (e, uiSource = "UNKNOWN") {
            var data = AvastWRC.ial.sp.data;
            if(!data) return;

            e.preventDefault();
            var url = e.currentTarget.attributes.resurl.value;
            var offers = [];
            var offer = null;
            var offerCategory = "";

            if(!url) return;

            if (data.producstLength > 0) {
                offers = data.products;
                providerId = data.providerId ? data.providerId : "";
                offer = AvastWRC.ial.sp.FindInList(offers, url);
                offerCategory = "PRODUCT";
                if (offer) {
                    sendOffersFeedback();
                    return;
                }
            }
            if (data.accommodationsLength > 0) {
                offers = data.accommodations;
                providerId = data.providerId ? data.providerId : "";
                offer = AvastWRC.ial.sp.FindInList(offers, url);
                offerCategory = "ACCOMMODATION";
                if (offer) {
                    sendOffersFeedback();
                    return;
                }
            }
            if (data.redirectLength > 0) {
                offers = data.redirect;
                offerCategory = "REDIRECT";
                providerId = data.redirectProviderId ? data.redirectProviderId : "";
                offer = AvastWRC.ial.sp.FindInList(offers, url);
                if (offer) {
                    sendOffersFeedback();
                    return;
                }
            }

            function sendOffersFeedback(){
                AvastWRC.ial.sp.feedback({
                    type: 'offer_click',
                    url: url,
                    offer: offer.element,
                    positionInList: offer.position,
                    offerCategory: offerCategory,
                    providerId: providerId,
                    query: data.scan ? JSON.stringify(data.scan) : "",
                    offerQuery: data.offerQuery,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    showRateWindow: data.showRateWindow,
                    referrer: data.referrer || "",
                    which: e.target.myWhich || 1,
                    transactionId: data.transactionId || "",
                    showOffersNotification: data.showOffersNotification,
                    showPriceComparisonNotification: data.showPriceComparisonNotification,
                    uiSource: uiSource
                });
            }

        },
        // add the events on click of the offers and 

        CouponClick: function (e, uiSource = "UNKNOWN") {
            var data = AvastWRC.ial.sp.data;

            e.preventDefault();

            var url = e.currentTarget.attributes.resurl.value, coupons = [], coupon = null;
            if(!url) return;
            if (data.couponsLength > 0) {
                coupons = data.coupons;
                coupon = AvastWRC.ial.sp.FindInList(coupons, url);
                if(coupon){
                    sendCouponsFeedback();
                    return;
                }
            }
            if (data.similarCouponsValue > 0) {
                coupons = data.similarCoupons;
                coupon = AvastWRC.ial.sp.FindInList(coupons, url);
                if(coupon){
                    sendCouponsFeedback();
                    return;
                }
            }

            function sendCouponsFeedback(){
                 AvastWRC.ial.sp.feedback({
                    type: 'coupon_click',
                    url: url,
                    coupon: coupon.element,
                    couponCategory: "VOUCHER",
                    positionInList: coupon.position,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    showRateWindow: data.showRateWindow,
                    referrer: data.referrer || "",
                    which: e.target.myWhich || 1,
                    providerId: data.voucherProviderId ? data.voucherProviderId : "",
                    query: data.scan ? JSON.stringify(data.scan) : "",
                    offerQuery: data.offerQuery,
                    merchantURL: window.location.href,
                    transactionId: data.transactionId || "",
                    merchantURL: data.url,
                    uiSource: uiSource
                });
            }
            e.target.myWhich = 0;
        },
        // add the events on click of the coupons and special deal

        copyTextToClipboard: function (e) {
            let text = e.currentTarget.attributes.cupcod.value;
            let $temp = $("<input>");
            $("body").append($temp);
            $temp.val(text).select();
            document.execCommand("copy");
            $temp.remove();

            let data = AvastWRC.ial.sp.data;
            if (!$(".asp-copied-to-clipboard") || $(".asp-copied-to-clipboard").length <= 0) {
                var template = Mustache.render(AvastWRC.Templates.copiedToClipboard, data);
                $(".asp-coupon-bottom-with-code").prepend(template);
            }
            let elementWidht = $(".asp-copied-to-clipboard").outerWidth();
            let elementHeigth = $(".asp-copied-to-clipboard").outerHeight();
            let top = e.pageY - document.body.scrollTop;
            let left = e.pageX - (elementWidht + 10) - document.body.scrollLeft;
            $(".asp-copied-to-clipboard").css("top", top + "px");
            $(".asp-copied-to-clipboard").css("left", left + "px");
            $(".asp-copied-to-clipboard").show("slow", function () {
                setTimeout(() => {
                    $(".asp-copied-to-clipboard").remove();
                }, 2000)
            });
        },

        showPanel: function (message, isCouponTab = null) {
            //on click on the button display the panel
            console.log("showPanel");
            if(!AvastWRC.ial.sp.couponInTab && !isCouponTab){
                var data = AvastWRC.ial.sp.data;
                $('.a-sp-header-bottom-col1').removeClass("asp-sas-display-none");
                $('.a-sp-header-bottom-col3').removeClass("asp-sas-display-none");
                if (data.panelShown) {
                    if (AvastWRC.ial.sp.data.activeTab == "OFFERS_TAB_HIGHLIGHTED") {
                        AvastWRC.ial.sp.OffersTabClick();
                    }
                    else if (AvastWRC.ial.sp.data.activeTab == "COUPONS_TAB_HIGHLIGHTED") {
                        AvastWRC.ial.sp.CouponsTabClick();
                    }
                    else if (AvastWRC.ial.sp.data.activeTab == "OTHERS_TAB_HIGHLIGHTED") {
                        AvastWRC.ial.sp.OthersTabClick();
                    }
                    else {
                        AvastWRC.ial.sp.OffersTabClick();
                    }
                }
                else if (!message || message.indexOf("showMinimizedNotifications") != -1) {
                    if (data.offersToBeShown || (data.producstLength > 0) || (data.accommodationsLength > 0)) {
                        AvastWRC.ial.sp.OffersTabClick();
                        AvastWRC.ial.sp.data.offersToBeShown = false;
                        $('#offersTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");
                    } else if (data.othersToBeShown || (data.redirectLength > 0 || data.similarCouponsValue > 0)) {
                        AvastWRC.ial.sp.OthersTabClick();
                        AvastWRC.ial.sp.data.othersToBeShown = false;
                        $('#othersTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");
                    } else if (data.couponsToBeShown || (data.couponsLength > 0)) {
                        AvastWRC.ial.sp.CouponsTabClick();
                        AvastWRC.ial.sp.data.couponsToBeShown = false;
                        $('#couponsTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");
                    }
                    else {
                        AvastWRC.ial.sp.OffersTabClick();
                        AvastWRC.ial.sp.data.offersToBeShown = false;
                        $('#offersTabState').removeClass("a-sp-to-be-shown").addClass("a-sp-shown");
                    }
                }
                else if (message.indexOf("showOffersAndCouponsNotification") != -1
                    || message.indexOf("showOffersAndCouponsBarNotification") != -1
                    || message.indexOf("showOffersNotification") != -1
                    || message.indexOf("showOffersBarNotification") != -1
                    || message.indexOf("showCityHotelsNotification") != -1
                    || message.indexOf("showCityHotelsBarNotification") != -1
                    || message.indexOf("showSimilarHotelsNotification") != -1
                    || message.indexOf("showSimilarHotelsBarNotification") != -1) {
                    AvastWRC.ial.sp.OffersTabClick();
                    AvastWRC.ial.sp.data.offersToBeShown = false;
                }
                else if (message.indexOf("showSimilarCouponsNotification") != -1
                    || message.indexOf("showRedirectNotification") != -1
                    || message.indexOf("showSimilarCouponsBarNotification") != -1
                    || message.indexOf("showRedirectBarNotification") != -1) {
                    AvastWRC.ial.sp.OthersTabClick();
                    AvastWRC.ial.sp.data.othersToBeShown = false;
                }
                else if (message.indexOf("showCouponsNotification") != -1
                    || message.indexOf("showCouponsBarNotification") != -1) {
                    AvastWRC.ial.sp.CouponsTabClick();
                    AvastWRC.ial.sp.data.couponsToBeShown = false;
                }
                $("#asp-panel-min").removeClass("asp-sas-display-block").addClass("a-sp-notifications-hidden");
                $('.a-sp-panel').removeClass('asp-sas-display-none').addClass('asp-sas-display-grid');

                AvastWRC.ial.sp.activateShowMoreTextDivs();

                AvastWRC.ial.sp.feedback({
                    type: 'main_ui_event',
                    action: 'shown', // panel was shown
                    domain: data.urlDomain,
                    category: data.activeTab,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });

                var activeTab = AvastWRC.ial.sp.data.activeTab;
                if (data && !data.panelShown) {
                    data.panelShown = true;
                    AvastWRC.ial.sp.data.defaultTab = activeTab;
                }

                AvastWRC.ial.sp.data.defaultTab = activeTab;
                AvastWRC.ial.sp.moveExternalPanels();
                AvastWRC.ial.sp.socialSharing.init();
                AvastWRC.ial.sp.socialSharing.sendShownFeedback();
            }

        },

        extensionIconClicked: function (data) {
            // remove notifications
            AvastWRC.ial.sp.notifications.hideNotifications();
            AvastWRC.ial.sp.showPanel();
        },

        applyCouponInTab: function (data) {
            console.log("dom counter: ",document.getElementsByTagName('*').length);
            // remove notifications
            if(document.getElementsByTagName('*').length > 150){
                console.log(JSON.stringify(document.location));
                AvastWRC.ial.sp.couponInTab = true;
                console.log("applyCouponInTab");
                AvastWRC.ial.sp.showCouponPanel(data, true);
                AvastWRC.ial.sp.activateShowMoreTextDivs(true);
            }

        },

        addRippleEffectToButtons: function (buttonsWithRippleEffect) {
            for (let i = 0; i <= buttonsWithRippleEffect.length; i++) {
                $(buttonsWithRippleEffect[i]).mousedown(AvastWRC.ial.sp.rippleCommonAction);
            }
        },

        rippleCommonAction: function (e, color) {
            e.preventDefault();
            AvastWRC.ial.addRippleEffect(e, e.target.className, color);
        },

        addRippleEffectToButtonsWithSpecificColor: function (buttonsWithRippleEffect) {
            for (let i = 0; i < buttonsWithRippleEffect.length; i++) {
                $(buttonsWithRippleEffect[i].button).mousedown(function (e) {
                    AvastWRC.ial.sp.rippleCommonAction(e, buttonsWithRippleEffect[i].color)
                });
            }
        },

        notifications: {
            prepareTemplates: function (data) {
                prepareNotificationTemplate(data, AvastWRC.Templates.notification, AvastWRC.ial.sp.notifications.config.notificationsContainer.standard);
                prepareNotificationTemplate(data, AvastWRC.Templates.notificationBar, AvastWRC.ial.sp.notifications.config.notificationsContainer.bar, true);
                prepareNotificationTemplate(data, AvastWRC.Templates.notificationRedirectBar, AvastWRC.ial.sp.notifications.config.notificationsContainer.redirectBar, true);
                prepareNotificationTemplate(data, AvastWRC.Templates.safeShopMinimizedPanel, AvastWRC.ial.sp.notifications.config.notificationsContainer.minimized);

                function prepareNotificationTemplate(data, template, element, isBar) {
                    if (!elementExists(element)) {
                        if (isBar) {
                            AvastWRC.ial.sp.topBarElement = AvastWRC.ial.sp.topBar(Mustache.render(template, data), element,
                                AvastWRC.ial.sp.notifications.config.values.bar.height, AvastWRC.ial.sp.data.panelData.topBarRules || []);
                        } else {
                            AvastWRC.ial.getTopHtmlElement().prepend(Mustache.render(template, data));
                        }
                    }
                }

                function elementExists(element) {
                    return $(element).length;
                }
            },
            showStandardNotification: function (data) {
                if(!AvastWRC.ial.sp.couponInTab){
                    this.loadNotification(AvastWRC.ial.sp.notifications.config.notificationsType.standard, data);
                }
            },
            showRedirectNotification: function (data, template, notificationsType) {
                if(!AvastWRC.ial.sp.couponInTab){
                    AvastWRC.ial.getTopHtmlElement().prepend(Mustache.render(template, formatRedirectData(data)));
                    this.loadNotification(notificationsType, data);

                    function formatRedirectData(data) {
                        let formattedData = JSON.parse(JSON.stringify(data));
                        formattedData.redirect = data.redirect[0];

                        return formattedData;
                    }
                }
            },
            showBarNotification: function (data) {
                if(!AvastWRC.ial.sp.couponInTab){
                    this.loadNotification(AvastWRC.ial.sp.notifications.config.notificationsType.bar, data);
                }
            },
            showMinimizedNotification: function (data = {
                replace: [AvastWRC.ial.sp.data.detailsToClosed.offerNumber],
                message: AvastWRC.ial.sp.notifications.config.messages.injected.showMinimizedNotifications.key.replace("message.", "")
            }) {
                if (!AvastWRC.ial.sp.couponInTab){
                    this.loadNotification(AvastWRC.ial.sp.notifications.config.notificationsType.minimized, data);
                }
            },
            registerEventsMessage: function (ee) {
                for (let message in this.config.messages.injected) {
                    ee.on(this.config.messages.injected[message].key,
                        this.config.messages.injected[message].action || ((data) => AvastWRC.ial.sp.notifications.showStandardNotification(data)));
                }
            },
            loadNotification: function (notificationsType, data) {
                let buttonsWithRippleEffect = [".a-sp-notifications-button", ".a-sp-notifications-redirect-button-show", ".asp-notifications-bar-button"];
                AvastWRC.ial.sp.notifications.config.values.currentData = data;
                AvastWRC.ial.sp.data.isNotification = true;
                init(notificationsType);
                AvastWRC.ial.sp.moveExternalPanels();
                sendShownNotificationFeedback(data);

                function init(notificationsType) {
                    switch (notificationsType) {
                        case AvastWRC.ial.sp.notifications.config.notificationsType.redirect:
                            initRedirectNotification();
                            break;
                        case AvastWRC.ial.sp.notifications.config.notificationsType.barRedirect:
                            initRedirectBarNotification();
                            break;
                        case AvastWRC.ial.sp.notifications.config.notificationsType.bar:
                            initBarNotification();
                            break;
                        case AvastWRC.ial.sp.notifications.config.notificationsType.minimized:
                            initMinimizedNotification();
                            break;
                        default:
                            initStandardNotification();
                    }
                }

                function initRedirectBarNotification() {
                    if (!AvastWRC.ial.sp.notifications.config.values.eventsRegistered.barRedirect) registerStandardEvents();

                    hidePanels();
                    showNotification();

                    function showNotification() {
                        let currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                            currentNotificationConfig = AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message];

                        hideElements(currentNotificationConfig.elementsToHide);
                        showElements(currentNotificationConfig.elementsToShow);
                        showElement(currentNotificationConfig.container);
                        replaceElements(currentNotificationConfig.replace, currentData.replace);
                        showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirectBar);
                        AvastWRC.ial.sp.topBarElement.show();   
                    }

                    function registerStandardEvents() {
                        let closeNotificationIcon = ".asp-notifications-bar-close-icon",
                            settingsNotificationIcon = ".asp-notifications-bar-gear-icon",
                            notificationsButton = ".asp-notifications-bar-button",
                            infoIcon = ".asp-notifications-bar-redirect-deal-info-img",
                            infoBox = ".asp-notification-bar-redirect-deal-info-box",
                            avastIcon = ".asp-notifications-bar-logo",
                            redirectImg = ".asp-notifications-bar-redirect-deal-img";  

                        $(redirectImg).on("error", function(e){
                            $(this).attr('src', AvastWRC.ial.sp.data.panelData.images.redirectPlaceholder);
                        });

                        $(settingsNotificationIcon).click((e) => {
                            sendSettingsNotificationFeedback();
                        });

                        $(closeNotificationIcon).click((e) => {
                            hideBar(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirectBar);
                            sendCloseNotificationFeedback();
                        });

                        $(notificationsButton).click((e) => {
                            hideElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirectBar);
                            hideBar(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirectBar);
                            AvastWRC.ial.sp.OfferClick(e, "NOTIFICATION_BAR");
                            sendButtonClickNotificationFeedback();
                        });

                        $(infoIcon).mouseenter(() => {
                            $(infoBox).show();
                        }).mouseleave(() => {
                        }).mouseleave(() => {
                            $(infoBox).hide();
                        });

                        $(avastIcon).click(() => {
                            AvastWRC.ial.sp.notifications.openProductPage();
                        });

                        AvastWRC.ial.sp.addRippleEffectToButtons(buttonsWithRippleEffect);

                        AvastWRC.ial.sp.notifications.config.values.eventsRegistered.redirectBar = true;
                    }
                }

                function initBarNotification() {
                    if (!AvastWRC.ial.sp.notifications.config.values.eventsRegistered.bar) registerStandardEvents();

                    hidePanels();
                    showNotification();

                    function showNotification() {
                        let currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                            currentNotificationConfig = AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message];

                        hideElements(currentNotificationConfig.elementsToHide);
                        showElements(currentNotificationConfig.elementsToShow);
                        switchElements(currentNotificationConfig.elementsToSwitch);
                        showElement(currentNotificationConfig.container);
                        if(currentData.message.indexOf("showSimilarCoupons") != -1){
                            addSimilarCouponsUrl();
                        }
                        replaceElements(currentNotificationConfig.replace, currentData.replace);
                        showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.bar);
                        AvastWRC.ial.sp.topBarElement.show();

                        function addSimilarCouponsUrl() {
                            $(".asp-notifications-bar-button").attr("resurl", currentData.replace[1]);
                        }
                    }

                    function registerStandardEvents() {
                        let closeNotificationIcon = ".asp-notifications-bar-close-icon",
                            settingsIcon = ".asp-notifications-bar-gear-icon",
                            notificationsButton = ".asp-notifications-bar-button",
                            avastIcon = ".asp-notifications-bar-logo";

                        $(settingsIcon).click((e) => {
                            sendSettingsNotificationFeedback();
                        });

                        $(closeNotificationIcon).click((e) => {
                            hideBar(AvastWRC.ial.sp.notifications.config.notificationsContainer.bar);
                            sendCloseNotificationFeedback();
                        });

                        $(notificationsButton).click((e) => {
                            hideBar(AvastWRC.ial.sp.notifications.config.notificationsContainer.bar);
                            if(AvastWRC.ial.sp.notifications.config.values.currentData.message.indexOf("showSimilarCoupons") != -1){
                                AvastWRC.ial.sp.CouponClick(e, "NOTIFICATION_BAR");
                            }
                            AvastWRC.ial.sp.showPanel(AvastWRC.ial.sp.notifications.config.values.currentData.message);
                            sendButtonClickNotificationFeedback();
                        });

                        $(avastIcon).click(() => {
                            AvastWRC.ial.sp.notifications.openProductPage();
                        });

                        AvastWRC.ial.sp.addRippleEffectToButtons(buttonsWithRippleEffect);

                        AvastWRC.ial.sp.notifications.config.values.eventsRegistered.bar = true;
                    }
                }

                function initStandardNotification() {
                    if (!AvastWRC.ial.sp.notifications.config.values.eventsRegistered.standard) registerStandardEvents();
                    let currentData = AvastWRC.ial.sp.notifications.config.values.currentData;
                    let defaultPosition = AvastWRC.ial.sp.PANEL_DEFAULT_POSITION;
                    if(AvastWRC.ial.sp.data.panelData.standardPosition && AvastWRC.ial.sp.data.panelData.standardPosition.position) {
                        defaultPosition = AvastWRC.ial.sp.data.panelData.standardPosition.position;
                    }
                    else
                    if (currentData.notificationSettings && currentData.notificationSettings.position) {
                        defaultPosition = currentData.notificationSettings.position;
                    }
                    hidePanels();
                    showNotification();

                    if (AvastWRC.ial.sp.notifications.config.values.currentData.replace && AvastWRC.ial.sp.notifications.config.values.currentData.replace[0] < 10) {
                        $(".a-sp-notifications-button-show-amount").css("padding", "2px 6px");
                    }

                    function showNotification() {
                        $(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard).css(defaultPosition);

                        let currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                            currentNotificationConfig = AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message];

                        hideElements(currentNotificationConfig.elementsToHide);
                        showElements(currentNotificationConfig.elementsToShow);
                        switchElements(currentNotificationConfig.elementsToSwitch);
                        showElement(currentNotificationConfig.container);
                        replaceElements(currentNotificationConfig.replace, currentData.replace);
                        if(currentData.message.indexOf("showSimilarCoupons") != -1){
                            addSimilarCouponsUrl();
                        }
                        showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard);

                        function addSimilarCouponsUrl() {
                            $(".a-sp-notifications-button").attr("resurl", currentData.replace[1]);
                        }

                        $(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard).addClass(AvastWRC.ial.sp.notifications.config.classForNotificationAnimation);
                    }

                    function registerStandardEvents() {
                        let closeNotificationIcon = ".a-sp-notifications-header-close-icon",
                            settingsIcon = ".a-sp-notifications-header-gear-icon",
                            notificationsButton = "#similarCouponsButtonStandard",
                            headerDrag = "a-sp-notifications-header-drag",
                            avastIcon = ".a-sp-notifications-header-logo-icon";

                        $(settingsIcon).click((e) => {
                            sendSettingsNotificationFeedback();
                        });

                        $(closeNotificationIcon).click((e) => {
                            hideElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard);
                            sendCloseNotificationFeedback();
                        });

                        $(notificationsButton).click((e) => {
                            hideElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard);

                            if (AvastWRC.ial.sp.notifications.config.values.currentData.message.indexOf("showSimilarCoupons") !== -1) {
                                AvastWRC.ial.sp.CouponClick(e, "NOTIFICATION");
                            } else {
                                AvastWRC.ial.sp.showPanel(AvastWRC.ial.sp.notifications.config.values.currentData.message);
                            }

                            sendButtonClickNotificationFeedback();
                        });

                        $(avastIcon).click(() => {
                            AvastWRC.ial.sp.notifications.openProductPage();
                        });

                        AvastWRC.ial.sp.addRippleEffectToButtons(buttonsWithRippleEffect);

                        AvastWRC.ial.sp.makeDraggable(document.getElementById(headerDrag),
                            document.getElementById(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard.replace("#", "")),
                            () => {
                                AvastWRC.ial.sp.feedback({
                                    type: 'standard_ui_dragged_ended',
                                    position: $(AvastWRC.ial.sp.notifications.config.notificationsContainer.standard).positionRight() || AvastWRC.ial.sp.PANEL_DEFAULT_POSITION
                                })
                            });
                        AvastWRC.ial.sp.notifications.config.values.eventsRegistered.standard = true;
                    }
                }

                function initRedirectNotification() {
                    let redirectExtraInfo = ".a-sp-notifications-redirect-info",
                        showRedirectButton = ".a-sp-notifications-redirect-button-show",
                        closeRedirectIcon = ".a-sp-notifications-redirect-header-close-icon",
                        settingsIcon = ".a-sp-notifications-redirect-header-gear-icon",
                        headerDrag = "a-sp-notifications-redirect-header-drag",
                        avastIcon = ".a-sp-notifications-redirect-header-logo-icon",
                        redirectImg = ".a-sp-notifications-redirect-img-animated";

                    $(redirectImg).on("error", function(e){
                        $(this).attr('src', AvastWRC.ial.sp.data.panelData.images.redirectPlaceholderBig);
                    });

                    hidePanels();
                    AvastWRC.ial.sp.addRippleEffectToButtons(buttonsWithRippleEffect);
                    AvastWRC.ial.sp.makeDraggable(document.getElementById(headerDrag),
                        document.getElementById(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirect.replace("#", "")),
                        () => {
                            AvastWRC.ial.sp.feedback({
                                type: 'standard_ui_dragged_ended',
                                position: $(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirect).positionRight() || AvastWRC.ial.sp.PANEL_DEFAULT_POSITION
                            })
                        });
                    $(avastIcon).click(() => {
                        AvastWRC.ial.sp.notifications.openProductPage();
                    });

                    $(settingsIcon).click((e) => {
                        sendSettingsNotificationFeedback();
                    });

                    $(redirectExtraInfo).click(toggleExtraRedirectInfo);

                    $(showRedirectButton).click((e) => {
                        hideElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirect);
                        AvastWRC.ial.sp.OfferClick(e, "NOTIFICATION");
                        sendButtonClickNotificationFeedback();
                    });

                    $(closeRedirectIcon).click((e) => {
                        hideElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirect);
                        sendCloseNotificationFeedback();
                    });


                    let currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                        currentNotificationConfig = AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message];
                    
                    currentNotificationConfig.elementsToSwitch[0].timeout = currentData.redirect[0].imageTimeout;
                    switchElements(currentNotificationConfig.elementsToSwitch);
                    
                    function toggleExtraRedirectInfo() {
                        let redirectExtraInfoIcon = ".a-sp-notifications-redirect-info-icon",
                            redirectExtraInfoText = ".a-sp-notifications-redirect-info-text",
                            redirectExtraInfoTextPaddingElement = ".a-sp-notifications-redirect-info-toggle-text-padding",
                            redirectExtraInfoLess = ".a-sp-notifications-redirect-info-less",
                            redirectExtraInfoMore = ".a-sp-notifications-redirect-info-more",
                            rotateClass = "a-sp-notifications-rotate";

                        rotateExtraInfoIcon();
                        toggleExtraInfoContent();

                        function rotateExtraInfoIcon() {
                            $(redirectExtraInfoIcon).toggleClass(rotateClass);
                        }

                        function toggleExtraInfoContent() {
                            $(redirectExtraInfoText).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                            $(redirectExtraInfoLess).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                            $(redirectExtraInfoMore).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                            $(redirectExtraInfoTextPaddingElement).toggleClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                        }
                    }

                    let defaultPosition = AvastWRC.ial.sp.PANEL_DEFAULT_POSITION;
                    if(AvastWRC.ial.sp.data.panelData.standardPosition && AvastWRC.ial.sp.data.panelData.standardPosition.position) {
                        defaultPosition = AvastWRC.ial.sp.data.panelData.standardPosition.position;
                    }
                    else if (currentData.notificationSettings && currentData.notificationSettings.position) {
                        defaultPosition = currentData.notificationSettings.position;
                    }
                    $(AvastWRC.ial.sp.notifications.config.notificationsContainer.redirect).css(defaultPosition);

                }

                function initMinimizedNotification() {
                    let currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                        currentNotificationConfig = AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message];
                    let buttonsWithRippleEffect = AvastWRC.ial.sp.notifications.config.messages.injected.showMinimizedNotifications.buttonsWithRippleEffect;
                    let defaultPosition = AvastWRC.ial.sp.PANEL_DEFAULT_POSITION;
                    if(AvastWRC.ial.sp.data.panelData.minimizedPosition && AvastWRC.ial.sp.data.panelData.minimizedPosition.position) {
                        defaultPosition = AvastWRC.ial.sp.data.panelData.minimizedPosition.position;
                    }
                    else 
                    if (currentData.notificationSettings && currentData.notificationSettings.position) {
                        defaultPosition = currentData.notificationSettings.position;
                    }
                    // In case that notifications weren't available, it takes badge from panel
                    if (!AvastWRC.ial.sp.notifications.config.values.eventsRegistered.minimized) registerEvents();
                    replaceElements(currentNotificationConfig.replace, currentData.replace ? currentData.replace.filter((item) => Number.isInteger(item)) : []);
                    showElements(currentNotificationConfig.elementsToShow);
                    showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimized);
                    showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedCircle);
                    showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedBadge);
                    showElement(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedInnerCircle);
                    hideElements(currentNotificationConfig.elementsToHide);
                    showNotification();
                    AvastWRC.ial.sp.notifications.config.values.eventsRegistered.minimized = true;

                    function registerEvents() {
                        AvastWRC.ial.sp.makeDraggable(
                            document.getElementById(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimized.replace("#", "")),
                            null,
                            () => {
                                let newPosition = $(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimized).positionRight() || defaultPosition;
                                AvastWRC.ial.sp.feedback({
                                    type: 'minimized_ui_dragged_ended',
                                    position: newPosition
                                });
                                AvastWRC.ial.sp.data.panelData.minimizedPosition.position = newPosition;
                            }

                        );
                        AvastWRC.ial.sp.BindMinPanelEvents();
                        AvastWRC.ial.sp.addRippleEffectToButtonsWithSpecificColor(buttonsWithRippleEffect);
                    }

                    function showNotification() {
                        $(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimized).css(defaultPosition);

                        if (AvastWRC.ial.sp.data.isNotification){
                            if (currentData.animationsSettings && currentData.animationsSettings.minimized) {
                                const animationData = currentData.animationsSettings.minimized;
                                const minimizedEl = AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedCircle;
                                const badgeEl = AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedBadge;
                                const innerEl = AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedInnerCircle;
                                const interval = currentData.animationsSettings.minimized.interval || 0;

                                if (animationData.type === "PULSE") {
                                    $(minimizedEl).addClass("a-sp-notifications-appear-pulse-animation");
                                    $(innerEl).addClass("a-sp-circle-animation");
                                    $(badgeEl).addClass("a-sp-notifications-pulse-animation");
                                } else if (animationData.type === "BADGE_PULSE") {
                                    $(badgeEl).addClass("a-sp-notifications-pulse-animation");
                                }

                                if (interval > 0) {
                                    AvastWRC.ial.sp.animations['PULSE'] = setInterval(() => {
                                        if (animationData.type === "PULSE") {
                                            resetAnimation(minimizedEl, ["a-sp-notifications-appear-pulse-animation", "a-sp-notifications-pulse-animation"]);
                                            resetAnimation(innerEl, "a-sp-circle-animation");
                                            resetAnimation(badgeEl, "a-sp-notifications-pulse-animation");
                                        } else if (animationData.type === "BADGE_PULSE") {
                                            resetAnimation(badgeEl, "a-sp-notifications-pulse-animation");
                                        }
                                    }, interval);
                                }
                            }
                        }
                        //$(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimized).addClass(AvastWRC.ial.sp.notifications.config.classForNotificationAnimation);
                        //$(AvastWRC.ial.sp.notifications.config.notificationsContainer.minimizedBadge).addClass(AvastWRC.ial.sp.notifications.config.classForNotificationAnimation);
                    }
                }

                function resetAnimation(el, animationClass){
                    if (Array.isArray(animationClass)){
                        for (let cl in animationClass){
                            $(el).removeClass(animationClass[cl]);
                        }
                        animationClass = animationClass.pop();
                    } else {
                        $(el).removeClass(animationClass);
                    }
                    setTimeout(() => {
                        $(el).addClass(animationClass);
                    }, 1);
                }

                function sendSettingsNotificationFeedback() {
                    let data = AvastWRC.ial.sp.data, currentData = AvastWRC.ial.sp.notifications.config.values.currentData;

                    AvastWRC.ial.sp.feedback({
                        type: 'notifications_events',
                        action: "settings_click",
                        domain: data.urlDomain,
                        mesageCategory: currentData.message,
                        category: currentData.category,
                        notificationType: currentData.notificationType,
                        campaignId: data.campaignId,
                        showABTest: data.showABTest,
                        referrer: data.referrer || "",
                        transactionId: data.transactionId || ""
                    });
                }

                function sendCloseNotificationFeedback() {
                    let data = AvastWRC.ial.sp.data, currentData = AvastWRC.ial.sp.notifications.config.values.currentData;

                    AvastWRC.ial.sp.feedback({
                        type: 'notifications_events',
                        action: "close_click",
                        domain: data.urlDomain,
                        mesageCategory: currentData.message,
                        category: currentData.category,
                        categoryFlag: currentData.notificationCategoryFlag,
                        notificationType: currentData.notificationType,
                        campaignId: data.campaignId,
                        showABTest: data.showABTest,
                        referrer: data.referrer || "",
                        transactionId: data.transactionId || ""
                    });

                    AvastWRC.ial.sp.moveExternalPanels(0);
                }

                function sendButtonClickNotificationFeedback() {
                    let data = AvastWRC.ial.sp.data, currentData = AvastWRC.ial.sp.notifications.config.values.currentData;

                    AvastWRC.ial.sp.feedback({
                        type: 'notifications_events',
                        action: "button_click",
                        mesageCategory: currentData.message,
                        category: currentData.category,
                        notificationType: currentData.notificationType,
                        domain: data.urlDomain,
                        campaignId: data.campaignId,
                        showABTest: data.showABTest,
                        referrer: data.referrer || "",
                        transactionId: data.transactionId || ""
                    });
                }

                function sendShownNotificationFeedback() {
                    let data = AvastWRC.ial.sp.data,
                        currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                        defaultMessage = "notifications_events";
                    if(currentData.category !== "DEAL_SEARCH"){
                        AvastWRC.ial.sp.feedback({
                            type: AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message].notificationType || defaultMessage,
                            action: "shown",
                            mesageCategory: currentData.message,
                            category: currentData.category,
                            notificationType: currentData.notificationType,
                            domain: data.urlDomain,
                            campaignId: data.campaignId,
                            showABTest: data.showABTest,
                            referrer: data.referrer || "",
                            transactionId: data.transactionId || "",
                            minimizedWithCoupons: data.couponsLength > 0
                        });
                    }
                }

                function hidePanels() {
                    let panels = {
                        min: "#asp-panel-min",
                        standard: ".a-sp-panel",
                        showToggleClass: "asp-sas-display-block",
                        hideToggleClass: "asp-sas-display-none"
                    };

                    $(panels.standard).removeClass(panels.showToggleClass).addClass(panels.hideToggleClass);
                    $(panels.min).addClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                }

                function hideBar(bar) {
                    hideElement(bar);
                    AvastWRC.ial.sp.topBarElement.remove();
                }

                function hideElement(element, classForHiding = AvastWRC.ial.sp.notifications.config.classForHidden) {
                    classForHiding ? $(element).addClass(classForHiding) : $(element).hide();
                }

                function showElement(element, classToAvoidHidden = AvastWRC.ial.sp.notifications.config.classForHidden) {
                    classToAvoidHidden ? $(element).removeClass(classToAvoidHidden) : $(element).show();
                }

                function hideElements(elements = []) {
                    for (let i = 0; i < elements.length; i++) {
                        hideElement(elements[i]);
                    }
                }

                function showElements(elements = []) {
                    for (let i = 0; i < elements.length; i++) {
                        showElement(elements[i]);
                    }
                }

                function replaceElements(elements = [], values = []) {
                    for (let i = 0; i < elements.length; i++) {
                        if (typeof elements[i] === "object") {
                            setTimeout(() => {
                                $(elements[i].el).attr(elements[i].prop, elements[i].val)
                            }, elements[i].timeout || 0)
                        } else {
                            $(elements[i]).text(values[i]);
                        }
                    }
                }

                function switchElements(elements = []) {
                    for (let i = 0; i < elements.length; i++) {
                        setTimeout(() => {
                            $(elements[i].hide).addClass(elements[i].class);
                            $(elements[i].show).removeClass(elements[i].class);
                        }, elements[i].timeout || 0)
                    }
                }
            },
            hideNotifications: function () {
                for (let key in AvastWRC.ial.sp.notifications.config.notificationsContainer) {
                    if ($(AvastWRC.ial.sp.notifications.config.notificationsContainer[key].length) &&
                        (AvastWRC.ial.sp.notifications.config.notificationsContainer[key] !== AvastWRC.ial.sp.notifications.config.notificationsContainer.panel))
                        $(AvastWRC.ial.sp.notifications.config.notificationsContainer[key]).addClass(AvastWRC.ial.sp.notifications.config.classForHidden);
                }

                AvastWRC.ial.sp.topBarElement.remove();
            },
            openProductPage: function () {
                let data = AvastWRC.ial.sp.data,
                    currentData = AvastWRC.ial.sp.notifications.config.values.currentData,
                    defaultMessage = "notifications_events";

                AvastWRC.ial.sp.feedback({
                    type: AvastWRC.ial.sp.notifications.config.messages.injected[currentData.message].notificationType || defaultMessage,
                    action: "logo_click",
                    mesageCategory: currentData.message,
                    category: currentData.category,
                    notificationType: currentData.notificationType,
                    domain: data.urlDomain,
                    campaignId: data.campaignId,
                    showABTest: data.showABTest,
                    referrer: data.referrer || "",
                    transactionId: data.transactionId || ""
                });
            },
            config: {
                messages: {
                    injected: {
                        showOffersNotification: {
                            key: "message.showOffersNotification",
                            container: ".a-sp-offers-notification",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".a-sp-offers-notification > .a-sp-offers-notification-img-animated",
                                hide: ".a-sp-offers-notification > .a-sp-offers-notification-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 1480
                            }],
                            replace: [".a-sp-notifications-button-show-amount"]
                        },
                        showOffersBarNotification: {
                            key: "message.showOffersBarNotification",
                            container: ".asp-notifications-bar-offers",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".asp-notifications-bar-offers >.asp-notifications-bar-image-animated",
                                hide: ".asp-notifications-bar-offers > .asp-notifications-bar-image",
                                class: "asp-notification-bar-image-hidden",
                                timeout: 2060
                            }],
                            replace: [".asp-notifications-bar-button-badge-text"],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        showCouponsNotification: {
                            key: "message.showCouponsNotification",
                            container: ".a-sp-coupons-notification",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".a-sp-coupons-notification > .a-sp-coupons-notification-img-animated",
                                hide: ".a-sp-coupons-notification > .a-sp-coupons-notification-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 1360
                            }],
                            replace: [".a-sp-notifications-button-show-amount"]
                        },
                        showCouponsBarNotification: {
                            key: "message.showCouponsBarNotification",
                            container: ".asp-notifications-bar-coupons",
                            elementsToHide: [".asp-notifications-bar-searching-deals"],
                            elementsToShow: [".asp-notifications-bar-button"],
                            elementsToSwitch: [{
                                show: ".asp-notifications-bar-coupons > .asp-notifications-bar-image-animated",
                                hide: ".asp-notifications-bar-coupons > .asp-notifications-bar-image",
                                class: "asp-notification-bar-image-hidden",
                                timeout: 1820
                            }],
                            replace: [".asp-notifications-bar-button-badge-text"],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        showOffersAndCouponsNotification: {
                            key: "message.showOffersAndCouponsNotification",
                            container: ".a-sp-offers-coupons-notification",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".a-sp-offers-coupons-notification > .a-sp-offers-coupons-notification-img-animated",
                                hide: ".a-sp-offers-coupons-notification > .a-sp-offers-coupons-notification-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 1520
                            }],
                            replace: [".a-sp-notifications-button-show-amount"]
                        },
                        showOffersAndCouponsBarNotification: {
                            key: "message.showOffersAndCouponsBarNotification",
                            container: ".asp-notifications-bar-offers-and-coupons",
                            elementsToHide: [".asp-notifications-bar-searching-deals"],
                            elementsToShow: [".asp-notifications-bar-button"],
                            replace: [".asp-notifications-bar-button-badge-text"],
                            elementsToSwitch: [{
                                show: ".asp-notifications-bar-offers-and-coupons > .asp-notifications-bar-image-animated",
                                hide: ".asp-notifications-bar-offers-and-coupons > .asp-notifications-bar-image",
                                class: "asp-notification-bar-image-hidden",
                                timeout: 1980
                            }],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        showSimilarCouponsNotification: {
                            key: "message.showSimilarCouponsNotification",
                            container: ".a-sp-deals-notification",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".a-sp-deals-notification > .a-sp-deals-notification-img-animated",
                                hide: ".a-sp-deals-notification > .a-sp-deals-notification-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 2240
                            }],
                            replace: [".a-sp-notifications-button-show-amount"],
                            //action: ((data) => AvastWRC.ial.sp.notifications.showNotification(data))
                        },
                        showSimilarCouponsBarNotification: {
                            key: "message.showSimilarCouponsBarNotification",
                            container: ".asp-notifications-bar-deals",
                            elementsToHide: [".asp-notifications-bar-searching-deals"],
                            elementsToShow: [".asp-notifications-bar-button"],
                            elementsToSwitch: [{
                                show: ".asp-notifications-bar-deals > .asp-notifications-bar-image-animated",
                                hide: ".asp-notifications-bar-deals > .asp-notifications-bar-image",
                                class: "asp-notification-bar-image-hidden",
                                timeout: 1980
                            }],
                            replace: [".asp-notifications-bar-button-badge-text"],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        showLoadingNotification: {
                            key: "message.showLoadingNotification",
                            container: ".a-sp-loading-notification",
                            elementsToHide: [
                                ".a-sp-offers-notification", ".a-sp-coupons-notification",
                                ".a-sp-offers-coupons-notification", ".a-sp-city-hotels-notification",
                                ".a-sp-similar-hotels-notification", ".a-sp-notifications-button",
                                "a-sp-deals-notification"
                            ],
                        },
                        showLoadingMinimizedNotification: {
                            key: "message.showLoadingMinimizedNotification",
                            container: ".asp-panel-minimized",
                            //elementsToHide: [".asp-panel-badge"],
                            elementsToShow: [".asp-minimized-panel-loader"],
                            replace: [],
                            action: ((data) => AvastWRC.ial.sp.notifications.showMinimizedNotification(data)),
                            notificationType: "minimized_ui_shown"
                        },
                        showLoadingBarNotification: {
                            key: "message.showLoadingBarNotification",
                            container: ".asp-notifications-bar-searching-deals",
                            elementsToHide: [".asp-notifications-bar-button"],
                            elementsToShow: [],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        cancelLoading: {
                            key: "message.cancelLoadingNotification",
                            action: ((data) => AvastWRC.ial.sp.notifications.hideNotifications())
                        },
                        showCityHotelsNotification: {
                            key: "message.showCityHotelsNotification",
                            container: ".a-sp-city-hotels-notification",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".a-sp-city-hotels-notification > .a-sp-city-hotels-notification-img-animated",
                                hide: ".a-sp-city-hotels-notification > .a-sp-city-hotels-notification-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 1800
                            }],
                            replace: [".a-sp-city-hotels-notification-text-city", ".a-sp-notifications-button-show-amount"]
                        },
                        showCityHotelsBarNotification: {
                            key: "message.showCityHotelsBarNotification",
                            container: ".asp-notifications-bar-popular-hotels",
                            elementsToHide: [".asp-notifications-bar-searching-deals"],
                            elementsToShow: [".asp-notifications-bar-button"],
                            elementsToSwitch: [{
                                show: ".asp-notifications-bar-popular-hotels > .asp-notifications-bar-image-animated",
                                hide: ".asp-notifications-bar-popular-hotels >  .asp-notifications-bar-image",
                                class: "asp-notification-bar-image-hidden",
                                timeout: 1820
                            }],
                            replace: [".asp-notifications-bar-city-text", ".asp-notifications-bar-button-badge-text"],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        showSimilarHotelsNotification: {
                            key: "message.showSimilarHotelsNotification",
                            container: ".a-sp-similar-hotels-notification",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            elementsToSwitch: [{
                                show: ".a-sp-similar-hotels-notification > .a-sp-similar-hotels-notification-img-animated",
                                hide: ".a-sp-similar-hotels-notification > .a-sp-similar-hotels-notification-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 1800
                            }],
                            replace: [".a-sp-notifications-button-show-amount"]
                        },
                        showSimilarHotelsBarNotification: {
                            key: "message.showSimilarHotelsBarNotification",
                            container: "asp-notifications-bar-alt-hotels",
                            elementsToHide: [".a-sp-loading-notification"],
                            elementsToShow: [".a-sp-notifications-button"],
                            replace: [".asp-notifications-bar-button-badge-text"],
                            elementsToSwitch: [{
                                show: ".asp-notifications-bar-alt-hotels > .asp-notifications-bar-image-animated",
                                hide: ".asp-notifications-bar-alt-hotels > .asp-notifications-bar-image",
                                class: "asp-notification-bar-image-hidden",
                                timeout: 2980
                            }],
                            action: ((data) => AvastWRC.ial.sp.notifications.showBarNotification(data))
                        },
                        showRedirectNotification: {
                            key: "message.showRedirectNotification",
                            action: ((data) => AvastWRC.ial.sp.notifications.showRedirectNotification(data, AvastWRC.Templates.notificationRedirect, AvastWRC.ial.sp.notifications.config.notificationsType.redirect)),
                            elementsToSwitch: [{
                                show: ".a-sp-notifications-redirect > .a-sp-notifications-redirect-img-animated",
                                hide: ".a-sp-notifications-redirect > .a-sp-notifications-redirect-img",
                                class: "a-sp-notification-img-hidden",
                                timeout: 2240
                            }],
                        },
                        showRedirectBarNotification: {
                            key: "message.showRedirectBarNotification",
                            action: ((data) => AvastWRC.ial.sp.notifications.showRedirectNotification(data, AvastWRC.Templates.notificationRedirectBar, AvastWRC.ial.sp.notifications.config.notificationsType.barRedirect))
                        },
                        showMinimizedNotifications: {
                            key: "message.showMinimizedNotifications",
                            action: ((data) => AvastWRC.ial.sp.notifications.showMinimizedNotification(data)),
                            replace: [".asp-panel-badge-text"],
                            notificationType: "minimized_ui_shown",
                            elementsToHide: [".asp-minimized-panel-loader"],
                            elementsToShow: [".asp-panel-badge"],
                            buttonsWithRippleEffect: [{
                                button: "#asp-panel-minimized-top-circle",
                                color: "#e2e2e9"
                            }]
                        }
                    },
                    background: {}
                },
                notificationsType: {
                    standard: "STANDARD",
                    redirect: "REDIRECT",
                    barRedirect: "BAR_REDIRECT",
                    minimized: "MINIMIZED"
                },
                notificationsContainer: {
                    standard: "#a-sp-notifications-standard",
                    redirect: "#a-sp-notifications-redirect",
                    bar: "#asp-notifications-bar",
                    redirectBar: "#asp-notifications-redirect-bar",
                    minimized: "#asp-panel-min",
                    minimizedCircle: "#asp-panel-min-circle",
                    minimizedBadge: "#asp-panel-min-badge",
                    minimizedInnerCircle: "#asp-panel-minimized-inner-circle",
                    panel: "#a-panel",
                },
                classForHidden: "a-sp-notifications-hidden",
                classForNotificationAnimation: "a-sp-notifications-animation",
                values: {
                    eventsRegistered: {
                        standard: false,
                        redirect: false,
                        barRedirect: false,
                        minimized: false
                    },
                    currentData: null,
                    bar: {
                        height: "60px"
                    }
                }
            }
        },

        userFeedback: {
            prepareTemplate: function (data = {}) {
                AvastWRC.ial.getTopHtmlElement().prepend(Mustache.render(AvastWRC.Templates.feedback, data));
                this.registerEvents();
            },
            registerEvents: function () {
                let self = AvastWRC.ial.sp.userFeedback;

                AvastWRC.ial.sp.addRippleEffectToButtons(self.config.buttonsWithRippleEffect);

                registerMainFeedbackEvents();
                registerPositiveFeedbackEvents();
                registerNegativeFeedbackEvents();

                function registerMainFeedbackEvents() {
                    $(self.config.actionElements.main.yesButton).click(showPositiveFeedback);
                    $(self.config.actionElements.main.noButton).click(showNegativeFeedback);
                    $(self.config.actionElements.main.askMeLaterButton).click(askMeLaterFeedback);

                    function showPositiveFeedback() {
                        self.sendFeedback(self.config.events.mainFeedback.type, self.config.events.mainFeedback.actions.rateButtonClicked);
                        hideQuestionFeedback();
                        self.showElement(self.config.containers.positiveFeedbackContainer);
                        self.sendFeedback(self.config.events.positiveFeedback.type, self.config.events.positiveFeedback.actions.shown);
                    }

                    function showNegativeFeedback() {
                        self.sendFeedback(self.config.events.mainFeedback.type, self.config.events.mainFeedback.actions.feedbackButtonClicked);
                        hideQuestionFeedback();
                        self.showElement(self.config.containers.negativeFeedbackContainer);
                        self.sendFeedback(self.config.events.negativeFeedback.type, self.config.events.negativeFeedback.actions.shown);
                    }

                    function hideQuestionFeedback() {
                        self.hideElement(self.config.containers.questionContainer);
                    }

                    function askMeLaterFeedback() {
                        self.hideElement(self.config.containers.mainContainer);
                        self.sendFeedback(self.config.events.mainFeedback.type, self.config.events.mainFeedback.actions.askMeLaterClicked);
                    }
                }

                function registerPositiveFeedbackEvents() {
                    $(self.config.actionElements.positive.closeIcon).click(closePositiveFeedback);
                    $(self.config.actionElements.positive.rateButton).click(openPositiveFeedback);

                    function closePositiveFeedback() {
                        self.sendFeedback(self.config.events.positiveFeedback.type, self.config.events.positiveFeedback.actions.closeButtonClicked);
                        self.hideElement(self.config.containers.mainContainer);
                    }

                    function openPositiveFeedback() {
                        self.sendFeedback(self.config.events.positiveFeedback.type, self.config.events.positiveFeedback.actions.rateClicked);
                        self.hideElement(self.config.containers.mainContainer);
                    }
                }

                function registerNegativeFeedbackEvents() {
                    $(self.config.actionElements.negative.closeIcon).click(closeNegativeFeedback);
                    $(self.config.actionElements.negative.feedbackButton).click(openNegativeFeedbackPage);

                    function closeNegativeFeedback() {
                        self.sendFeedback(self.config.events.negativeFeedback.type, self.config.events.negativeFeedback.actions.closeButtonClicked);
                        self.hideElement(self.config.containers.mainContainer);
                    }

                    function openNegativeFeedbackPage() {
                        self.sendFeedback(self.config.events.negativeFeedback.type, self.config.events.negativeFeedback.actions.rateClicked);
                        self.hideElement(self.config.containers.mainContainer);
                    }
                }
            },
            showFeedbackQuestion: function () {
                let delay = 1000, self = this;

                setTimeout(function () {
                    AvastWRC.ial.sp.userFeedback.showElement(AvastWRC.ial.sp.userFeedback.config.containers.mainContainer);
                    self.sendFeedback(self.config.events.mainFeedback.type, self.config.events.mainFeedback.actions.shown);
                }, delay);
            },
            sendFeedback: function (type, action) {
                let commonDataEvents = AvastWRC.ial.sp.data;

                AvastWRC.ial.sp.feedback({
                    type: type,
                    action: action,
                    domain: commonDataEvents.urlDomain,
                    campaignId: commonDataEvents.campaignId,
                    showABTest: commonDataEvents.showABTest,
                    referrer: commonDataEvents.referrer || "",
                    transactionId: commonDataEvents.transactionId || ""
                });
            },
            hideElement: function (element, classForHidden = this.config.classForHidden) {
                classForHidden ? $(element).addClass(classForHidden) : $(element).hide();
            },
            showElement: function (element, classToCancelHidden = this.config.classForHidden) {
                classToCancelHidden ? $(element).removeClass(classToCancelHidden) : $(element).show();
            },
            config: {
                buttonsWithRippleEffect: [".a-sp-feedback-question-buttons-yes", ".a-sp-feedback-question-buttons-no", ".a-sp-feedback-action-button-content"],
                classForHidden: "a-sp-feedback-hidden",
                containers: {
                    mainContainer: "#a-sp-feedback-container",
                    questionContainer: "#a-sp-feedback-action-question",
                    positiveFeedbackContainer: "#a-sp-feedback-action-positive",
                    negativeFeedbackContainer: "#a-sp-feedback-action-negative",
                },
                actionElements: {
                    main: {
                        yesButton: ".a-sp-feedback-question-buttons-yes",
                        noButton: ".a-sp-feedback-question-buttons-no",
                        askMeLaterButton: ".a-sp-feedback-question-later"
                    },
                    positive: {
                        closeIcon: "#a-sp-feedback-action-close-positive",
                        rateButton: "#a-sp-feedback-action-button-positive",
                    },
                    negative: {
                        closeIcon: "#a-sp-feedback-action-close-negative",
                        feedbackButton: "#a-sp-feedback-action-button-negative",
                    }
                },
                events: {
                    mainFeedback: {
                        type: "feedback_main",
                        actions: {
                            shown: "shown",
                            rateButtonClicked: "clicked_rate_good",
                            feedbackButtonClicked: "clicked_rate_bad",
                            askMeLaterClicked: "clicked_ask_me_later"
                        }
                    },
                    positiveFeedback: {
                        type: "feedback_like",
                        actions: {
                            shown: "shown",
                            closeButtonClicked: "clicked_x",
                            rateClicked: "clicked_cta",
                        }
                    },
                    negativeFeedback: {
                        type: "feedback_dislike",
                        actions: {
                            shown: "shown",
                            closeButtonClicked: "clicked_x",
                            rateClicked: "clicked_cta",
                        }
                    }
                }
            }
        },

        socialSharing: {
            init: function () {
                this.registerEvents();
            },
            registerEvents: function () {
                let self = this;

                //this.sendShownFeedback();

                $(this.config.mainElement).find("*").off();
                AvastWRC.ial.sp.addRippleEffectToButtonsWithSpecificColor(this.config.buttonsWithRippleEffect);

                changeSocialIconsOnHover();
                shareOnFbOnClickedButton();
                shareOnTttrOnClickedButton();
                hideSocialCardOnClickedIconClose();

                this.config.eventsRegistered = true;

                function changeSocialIconsOnHover() {
                    for (let i = 0; i < self.config.iconActiveElements.length; i++) {
                        let currentElement = self.config.actionElements[self.config.iconActiveElements[i]];

                        $(currentElement.button).mouseenter(function () {
                            $(currentElement.iconElement).addClass(self.config.classForHidden);
                            $(currentElement.iconActiveElement).removeClass(self.config.classForHidden);
                        }).mouseleave(function () {
                            $(currentElement.iconActiveElement).addClass(self.config.classForHidden);
                            $(currentElement.iconElement).removeClass(self.config.classForHidden);
                        });
                    }
                }

                function shareOnFbOnClickedButton() {
                    let fbButton = self.config.actionElements.fb;

                    $(fbButton.button).click(function () {
                        self.sendFeedback(fbButton.clickedEvent);
                    });
                }

                function shareOnTttrOnClickedButton() {
                    let tttrButton = self.config.actionElements.tttr;

                    $(tttrButton.button).click(function () {
                        self.sendFeedback(tttrButton.clickedEvent);
                    });
                }

                function hideSocialCardOnClickedIconClose() {
                    let iconCloseElement = self.config.actionElements.closeIcon;

                    $(iconCloseElement.icon).click(function () {
                        self.sendFeedback(iconCloseElement.clickedEvent);
                        self.config.isOnTop = false;
                        self.config.itWasClosed = true;
                        $(self.config.mainElement).addClass(self.config.classForHidden);
                    });
                }
            },
            sendFeedback: function (action) {
                let commonDataEvents = AvastWRC.ial.sp.data, socialCardEventType = "social_card",
                    categories = AvastWRC.ial.sp.socialSharing.config.events.categories;

                AvastWRC.ial.sp.feedback({
                    type: socialCardEventType,
                    action: action,
                    domain: commonDataEvents.urlDomain,
                    category: AvastWRC.ial.sp.socialSharing.config.isOnTop ? categories.top : categories.bottom,
                    uiSource: (commonDataEvents.activeTab === "OFFERS_TAB_HIGHLIGHTED") ? "main_ui_offers_tab" : (commonDataEvents.activeTab === "COUPONS_TAB_HIGHLIGHTED") ? "main_ui_coupons_tab" : 0,
                    campaignId: commonDataEvents.campaignId,
                    showABTest: commonDataEvents.showABTest,
                    referrer: commonDataEvents.referrer || "",
                    transactionId: commonDataEvents.transactionId || "",
                    socialData: commonDataEvents.social || null
                });
            },
            sendShownFeedback: function () {
                if(!AvastWRC.ial.sp.data || !AvastWRC.ial.sp.data.social ) return;
                if (AvastWRC.ial.sp.data.social.isPowerSocialUser) this.sendFeedback(this.config.events.shown);
            },
            moveCardToTop: function () {
                let self = this;

                if(!AvastWRC.ial.sp.data || !AvastWRC.ial.sp.data.social ) return;
                if (this.config.itWasClosed || !AvastWRC.ial.sp.data.social.showInTop) return;

                showOnTop();
                self.registerEvents();

                function showOnTop() {
                    let backgroundClass = "a-sp-social-top", closeIcon = ".a-sp-social-close-img",
                        closeIconVisibilityClass = "a-sp-social-close-img-visible",
                        container = "#couponsWrapper";

                    $(self.config.mainElement).addClass(self.config.classForHidden);
                    $(self.config.mainElement).addClass(backgroundClass);
                    $(closeIcon).addClass(closeIconVisibilityClass);
                    $(self.config.mainElement).prependTo(container);
                    self.config.isOnTop = true;
                    self.animateSocialCard();
                }
            },
            animateSocialCard: function () {
                let self = this;

                $(this.config.mainElement).css({
                    "top": (-1 * this.config.height) + 'px',
                    "opacity": 0
                });

                $(self.config.mainElement).removeClass(self.config.classForHidden);
                AvastWRC.ial.sp.scrollTop(0, self.config.height);

                $(self.config.mainElement).animate({
                    "opacity": 1
                }, {duration: 1240, queue: false});

                $(self.config.mainElement).animate({
                    "top": '+=' + self.config.height,
                }, {duration: 440, queue: false}, function () {
                    $(self.config.mainElement).attr("style", "");
                });

                AvastWRC.ial.sp.scrollTop(1040, 0);
            },
            getCurrentHeightOnTop: function () {
                return this.config.isOnTop ? $(this.config.mainElement).outerHeight(true) : 0;
            },
            getContainerId: function () {
                return this.config.mainElement.replace("#", "");
            },
            getCurrentHTMLOnTop: function () {
                return this.config.isOnTop ? $(this.config.mainElement)[0].outerHTML: "";
            },
            config: {
                buttonsWithRippleEffect: [
                    {button: ".a-sp-social-buttons-fb-container", color: "#375490"},
                    {button: ".a-sp-social-buttons-tttr-container", color: "#188dd4"}
                ],
                actionElements: {
                    fb: {
                        button: ".a-sp-social-buttons-fb-container",
                        iconElement: ".a-sp-social-buttons-fb-img",
                        iconActiveElement: ".a-sp-social-buttons-fb-img-action",
                        clickedEvent: "clicked_f"
                    },
                    tttr: {
                        button: ".a-sp-social-buttons-tttr-container",
                        iconElement: ".a-sp-social-buttons-tttr-img",
                        iconActiveElement: ".a-sp-social-buttons-tttr-img-action",
                        clickedEvent: "clicked_t"
                    },
                    closeIcon: {
                        icon: ".a-sp-social-close-img",
                        clickedEvent: "clicked_x"
                    }
                },
                iconActiveElements: ["fb", "tttr"],
                events: {
                    shown: "shown",
                    categories: {
                        top: "top",
                        bottom: "bottom"
                    }
                },
                eventsRegistered: false,
                classForHidden: "a-sp-social-hidden",
                mainElement: "#a-sp-social-container",
                isOnTop: false,
                itWasClosed: false,
                height: 106
            }
        },
        commonSelectors: {
            couponsWrapper: "#couponsWrapper",
            firstCouponsSeparator: ".asp-separator-text-first",
            secondCouponsSeparators: ".asp-separator-text",
            scroll: ".a-sp-items-wrapper"
        }
    };

    /* Register SafePrice Event handlers */
    AvastWRC.ial.registerEvents(function (ee) {
        ee.on('message.checkSafeShop',
            AvastWRC.ial.sp.checkSafeShop.bind(AvastWRC.ial.sp));
        // new events
        ee.on('message.createPanel',
            AvastWRC.ial.sp.createPanel.bind(AvastWRC.ial.sp));
        ee.on('message.updatePanel',
            AvastWRC.ial.sp.updatePanel.bind(AvastWRC.ial.sp));
        ee.on('message.extensionIconClicked',
            AvastWRC.ial.sp.extensionIconClicked.bind(AvastWRC.ial.sp));
        ee.on('message.applyCouponInTab',
            AvastWRC.ial.sp.applyCouponInTab.bind(AvastWRC.ial.sp));
        /*ee.on('message.removeAll',
          AvastWRC.ial.sp.removeAll.bind(AvastWRC.ial.sp));*/
        AvastWRC.ial.sp.notifications.registerEventsMessage(ee);
    });

}).call(this, $);
