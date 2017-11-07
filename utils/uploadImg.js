/** 
 * 上传插件
 * 包含图片选择，上传
 * 
 * 参数主要分为两个部分
 * opt： 
 *      1 url（str）： 上传地址 
 *      2 count（num）：一次可以选择几张，默认 1
 *      3 carmera（bool）： 是否允许使用相机拍照，默认 true
 *      4 name(str): 上传图片的name 默认 'file'
 *      5 formData（obj）： 上传附加参数  默认没有
 *      4 afterChoose（fuc）： 照片选择之后，执行。afterChoose 接受一个 res 参数，为选择之后数据，在这里可以进行中断操作
 *         res： 1.tempFilePaths（StringArray 图片的本地文件路径列表） 2.tempFiles (ObjectArray File对象数组 path，size）
 * 
 * cb：  你懂得
 *      1 beforeFunc
 *      2 successFunc 
 *      3 completeFunc
 *   
 * 
 * demo： 
 * 
 * 
    upload(
        {
            url: '/upload/pic',
            count: 1,
            name: 'files',
            carmera: true,
            formData: {
                bizType: 1
            },
            afterChoose: ( res ) => {
                return true
            }
        },
        {
            beforeFunc() {console.log('上传前')},
            successFunc(data) { console.log(data)},
            completeFunc() { console.log('上传结束')}
        }
    )
 */
const HOST = require('../config.js')

function uploadImg(options, cb){

    const _sets = options

    // 兼容 object.assign 
    if (typeof _sets.name === 'undefined') { _sets.name = 'file' }
    if (typeof _sets.count === 'undefined') { _sets.count = 1}
    if (typeof _sets.carmera === 'undefined') { _sets.carmera = true }
    if (typeof _sets.formData === 'undefined') { _sets.formData = {} }
    if (typeof _sets.afterChoose === 'undefined') { _sets.afterChoose = () => { return true } }

    const beforeFunc = cb.beforeFunc || function () {}
    const successFunc = cb.successFunc || function () {}
    const completeFunc = cb.completeFunc || function () {} 

    //  调用微信选择图片
    wx.chooseImage({
        count: _sets.count,
        sourceType: _sets.carmera ? ['album', 'camera'] : ['album'],
        success: (res) => {

            // 如果 afterChoose 返回 false 那么就是不继续执行
            if ( _sets.afterChoose(res) === false ) {

                return
            }
            uploadImg(res.tempFilePaths)
        },
        fail: () => {
            console.info('用户取消选择照片')
        }
    })

    function uploadImg(files) {

        let filesArr = files
        let file = filesArr.pop()

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

                if (res.statusCode == 200) {

                    let data = JSON.parse(res.data)
                    
                    let code = Number(data.code)
                    if (code === 200) {

                        data.path = file
                        successFunc(data)

                        if (filesArr.length > 0) {
                            uploadImg(filesArr)
                        } else{
                            
                            completeFunc()
                            wx.hideNavigationBarLoading()
                        }
                    } else if (code == 401) { 
                        
                        wx.showModal({
                            title: '提示',
                            content: '登录信息失效，点击从新登录',
                            showCancel: false,
                            success: () => {
                                getApp().uploadUserInfo( () => { })
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
                        content: '上传图片失败',
                        showCancel: false
                    });
                }
                
            },
            fail: (res) => {

                completeFunc()
                wx.hideNavigationBarLoading()

                wx.showModal({
                    title: '提示',
                    content: '上传图片失败',
                    showCancel: false
                });
             }
        })
    }
}

module.exports = uploadImg