/**
 * Copyright © 2015 Magento. All rights reserved.
 * See COPYING.txt for license details.
 */
/*browser:true*/
/*global define*/
define([
    'jquery'
], function ($) {
    'use strict';

    return {
        loadApi: function (componentUrl, onLoadedCallback, onError, onCancel, onComplete) {
            window.tnsErrorCallback = $.proxy(onError, this);
            window.tnsCancelCallback = $.proxy(onCancel, this);
            window.tnsCompletedCallback = $.proxy(onComplete, this);

            var node = requirejs.load({
                contextName: '_',
                onScriptLoad: $.proxy(onLoadedCallback, this)
            }, 'tnshosted', componentUrl);

            node.setAttribute('data-error', 'window.tnsErrorCallback');
            node.setAttribute('data-cancel', 'window.tnsCancelCallback');
            node.setAttribute('data-complete', 'window.tnsCompletedCallback');
        },
        getItems: function (items) {
            var data = [];
            $(items).each($.proxy(function(i, item) {
                data.push({
                    name: item.name,
                    description: item.description,
                    sku: item.sku,
                    unitPrice: this.safeNumber(item.price),
                    quantity: item.qty,
                    unitTaxAmount: this.safeNumber(item.tax_amount)
                });
            }, this));
            return data;
        },
        safeNumber: function (num) {
            return parseFloat(num).toFixed(2);
        },
        configureApi: function (merchant, quote, sessionId, sessionVersion) {
            var totals = quote.totals();
            Checkout.configure({
                merchant: merchant,
                order: {
                    amount: this.safeNumber(totals.grand_total),
                    currency: totals.quote_currency_code,
                    description: 'Ordered items',
                    item: this.getItems(quote.getItems()),
                    shippingAndHandlingAmount: this.safeNumber(totals.shipping_amount),
                    taxAmount: this.safeNumber(totals.tax_amount)
                },
                interaction: {
                    merchant: {
                        name: 'Magento'
                    },
                    displayControl: {
                        customerEmail: 'HIDE',
                        billingAddress: 'HIDE',
                        orderSummary: 'HIDE',
                        paymentTerms: 'HIDE',
                        shipping: 'HIDE'
                    }
                },
                session: {
                    id: sessionId,
                    version: sessionVersion
                }
            });
        },
        showPayment: function () {
            Checkout.showLightbox();
        }
    };
});
