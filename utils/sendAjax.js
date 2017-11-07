const HOST = require('../config.js')

function sendAjax(options, callback, outTimeAuthCbOrNeedAuth) {

    const _sets = options

    // Object.assign IOS8 babel之后 还有问题
    if (typeof _sets.type === 'undefined') { _sets.type = 'POST'}
    if (typeof _sets.data === 'undefined') { _sets.data = {} }

    // 如果不是明确不需要登录权限 而且 没有 G_authorization 的缓存信息 
    if (outTimeAuthCbOrNeedAuth !== false && !wx.getStorageSync('G_authorization')) {

        getApp().uploadUserInfo(outTimeAuthCbOrNeedAuth)
        return
    }

    // 纠正method大写
    _sets.type = _sets.type.toUpperCase();

    const bcallback = callback.beforeSend || function (data) { 
        wx.showToast({
            title: '加载中...',
            icon: 'loading',
            duration: 10000
        })
     };
    const scallback = callback.success || function (data) { };
    const ccallback = callback.complete || function (data) { wx.hideToast() };

    bcallback()
    
    wx.request({
        url: HOST + _sets.url,
        method: _sets.type,
        data: _sets.data,
        header: {
            'content-type': 'application/json',
            'authorization': wx.getStorageSync('G_authorization')
        },
        success(res) {
            if (res.data.code == 200) {

                scallback(res.data);
            } else {

                if (res.data.code == 401) {

                    getApp().uploadUserInfo(outTimeAuthCbOrNeedAuth)
                } else {

                    wx.showModal({
                        title: '提示',
                        content: res.data.message || '处理失败',
                        showCancel: false
                    });
                }
            }
        },
        fail(err) {
            wx.showModal({
                title: '提示',
                content: '服务器连接失败',
                showCancel: false
            });
        },
        complete() {
            ccallback()
        }
    })
}

module.exports = sendAjax
