/**
 * 上传文件格式专用
 * 比如录音
 * 
 * files
 * cb
 */
const HOST = require('../config.js')
function uploadFile(options, cb) {
 
    const _sets = options

    // 兼容 object.assign 
    if (typeof _sets.name === 'undefined') { _sets.name = 'file' }
    if (typeof _sets.formData === 'undefined') { _sets.formData = {} }

    const beforeFunc = cb.beforeFunc || function () {} 
    const successFunc = cb.successFunc || function () { }
    const completeFunc = cb.completeFunc || function () { } 

    upload(_sets.path)
    
    function upload(file) {
       
        beforeFunc()
        wx.showNavigationBarLoading()
        
        wx.uploadFile({
            url: HOST + _sets.url,
            filePath: file,
            name: _sets.name,
            header: {
                "Content-Type": "multipart/form-data",
                'authorization': wx.getStorageSync('G_authorization')
            },
            formData: _sets.formData,
            success: (res) => {
                console.log(res)
                if (res.statusCode == 200) {

                    let data = JSON.parse(res.data)
                    let code = Number(data.code)
                    if (code === 200) {

                        data.path = file
                        successFunc(data)
                    } else if (code == 401) {

                        wx.showModal({
                            title: '提示',
                            content: '登录信息失效，点击从新登录',
                            showCancel: false,
                            success: () => {
                                getApp().uploadUserInfo( () => {} )
                            }
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: data.message,
                            showCancel: false
                        });
                    }

                } else {

                    wx.showModal({
                        title: '提示',
                        content: '上传失败',
                        showCancel: false
                    });
                }

            },
            fail: (res) => {
                console.log(res)
                wx.showModal({
                    title: '提示',
                    content: '上传失败',
                    showCancel: false
                });
            },
            complete: (res) => {
                completeFunc()
                wx.hideNavigationBarLoading()
            },
        })
    }
}
module.exports = uploadFile