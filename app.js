//app.js
const HOST = require('config.js')
const sendAjax = require('./utils/sendAjax.js')
const uploadImg = require('./utils/uploadImg.js')
const uploadFile = require('./utils/uploadFile.js')

App({
    onLaunch: function () {
        console.info('小程序启动啦~')
    },
    onShow: function (path) {
    },
    globalData: {
        
    },
    /** 
     * 
     * 更新用户信息
     * 1 授权登录
     * 2 拿去用户信息
     * 3 调用xxx/platform/login 进行登录，有则拿取信息，无则进行注册
     * 5 老用户直接刷新页面，有自定义的回调就自定（cb），没有就刷新当前页面
     * 
     */
    uploadUserInfo(cb) {
        const that = this
        wx.showNavigationBarLoading()
        wx.login({
            success: (loginResult) => {

                wx.showNavigationBarLoading()
                
                wx.getUserInfo({
                    success: (userResult) => {

                        let loginOpt = {
                            url: HOST + 'xxxx/login',
                            method: 'POST',// 默认行为是POST
                            data: {
                                platCode: loginResult.code,
                                platUserInfoMap: {
                                    encryptedData: userResult.encryptedData,
                                    iv: userResult.iv
                                }
                            }
                        }

                        let loginCb = {}
                        loginCb.success = (data) => {
                            
                            // 更新全局数据
                            wx.setStorageSync("G_userKey", data.userKey)
                            wx.setStorageSync("G_nickName", data.userName)
                            wx.setStorageSync("G_avatar", data.avatar)
                            wx.setStorageSync("G_userId", data.userId)
                            wx.setStorageSync('G_authorization', data.authorization)

                            // 登录之后 做点什么
                            if (typeof cb === 'function') {

                                cb();
                            } else {
                                
                                // 假装刷新
                                let currentPage = getCurrentPages().pop()
                                currentPage.onLoad(currentPage.options)
                            }
                        }
                    },

                    fail: (userError) => {

                        wx.showModal({
                            title: '提示',
                            content: '若不授权微信登录，则无法使用相关功能；点击重新获取授权，则可重新使用。',
                            cancelText: "不授权",
                            confirmText: "授权",
                            success: (res) => {
                                if (res.confirm) {
                                    wx.openSetting({
                                        success: (res) => {
                                            if (res.authSetting["scope.userInfo"]) {

                                                //获取当前页面，并刷新
                                                getCurrentPages().pop().onLoad()
                                            }
                                        }
                                    });
                                } else if (res.cancel) {

                                    // 同今天及，哦同里 恩 段 义 绝
                                    wx.showModal({
                                        title: '提示',
                                        content: '未授权，无法流畅使用主要功能',
                                        showCancel: false
                                    });
                                }
                            }
                        });
                    },

                    complete: () => {
                        wx.hideNavigationBarLoading()
                    }
                });
            },

            fail: function (loginError) {
                wx.showModal({
                    title: '提示',
                    content: '微信登录失败，请检查网络状态',
                    showCancel: false,
                    success: (e) => {
                        console.log('微信登录失败', e)
                    }
                });
            },
            complete: () => {
                wx.hideNavigationBarLoading()
            }
        });
    },

    /**
     * ========================= 功能类 ================================
     */
    /**
     * 放回并更新上某个页面
     * 默认执行上某个页面 onLoad()
     * cb 默认接受 prePage 参数 为上某个页面对象
     * index 前几页 默认 1
     * 
     * 
     * 比较适用于  详情页进入编辑页  编辑页 put 成功之后回调
     */
    backAnduploadPrePage(cb, index) {
        let pages = getCurrentPages()
        let count = index || 1
        let prePage

        // 获取第一页
        if (index === 0) {

            prePage = pages[0]
        } else {

            prePage = pages[pages.length - 1 - count]
        }

        if (cb) {

            cb(prePage)
        } else {

            prePage.onLoad(prePage.options)
        }

        wx.navigateBack({
            delta: index === 0 ? pages.length - 1 : count
        })
    },
    /**
     * ========================= 工具类 ================================
     */
    HOST,
    sendAjax,
    uploadImg,
    uploadFile
})
