/** 
 * 语音录制、播放 管理器
 */
const voiceManager = ({
    upStart,
    upStop,
    upError,
    upComplete,
    playStart,
    playStop,
    playError,
    playComplete
}) => {

    // 低版本录音权限
    let oldMakerAuth = false

    // 高低版本录音判断
    let canUseNewMaker = !!wx.getRecorderManager

    // 高低版本播放控制
    let canUseNewPlayer = !!wx.createInnerAudioContext 

    // 配置默认设置
    upComplete = upComplete || function () { }
    playComplete = playComplete || function () {}
    
    upError = upError || function (err) {
        wx.showModal({
            title: '提示',
            content: res.errMsg || '录制失败',
            showCancel: false
        })
    }
    playError = playError || function (err) {
        wx.showModal({
            title: '提示',
            content: res.errMsg || '播放失败',
            showCancel: false
        })
    }
    
    /**
     * 1.6 6.5.16/18 才支持的 wx.getRecorderManager
     */
    function newMaker() {

        // 初始化 
        let recorderManager = wx.getRecorderManager()

        // 监听录音开始
        recorderManager.onStart(() => {
            upStart()
        })

        // 监听录音结束
        recorderManager.onStop((res) => {
            upStop(res)
            upComplete()
        })

        // 监听录音出错
        recorderManager.onError(err => {
            upError(err)
            upComplete()
        })
    }

    /**
     * 老旧录音
     */
    function oldMaker() {

        // 开始授权，能够录音之后进行录音
        getRecordAuth( () => {
            
            upStart()

            wx.startRecord({
                success: function (res) {

                    res.duration = Math.ceil((Date.now() - startTime) / 1000)
                
                    upStop(res)
                },
                fail: function (res) {
                    upError()
                },
                complete: function () {
                    upComplete()
                } 
            })
        }) 
    }
    
    /**
     * 老旧录音授权验证
     */
    function getRecordAuth( cb ) {

        if (!oldMakerAuth) {

            wx.getSetting({
                success(res) {
                    console.log('授权查询结果', res)

                    if (!res.authSetting['scope.record']) {

                        console.log('没有录音权限，准备请求', res)
                        wx.authorize({
                            scope: 'scope.record',
                            success(res) {

                                console.log('获取录音权限成功', res)
                                oldMakerAuth = true

                            },
                            fail(res) {

                                console.log('授权失败', res)
                                wx.showModal({
                                    title: '提示',
                                    content: '获取微信录音授权失败，多次失败后，删除小程序重新进入，点击授权',
                                    showCancel: false
                                })
                            }
                        })

                    } else {

                        oldMakerAuth = true
                        cb()
                    }
                }
            })

            return
        } else {

            cb()
        }
    }
    

    /**
     * 音频管理新播放
     * playStart,
    playStop,
    playError,
    playComplete
     */
    function newPlayer(path) {

        if (canUseNewPlayer) {
            
            const innerAudioContext = wx.createInnerAudioContext()

            innerAudioContext.onPlay(() => {
                playStart()
            })

            innerAudioContext.onStop((res) => {
                playStop()
            })

            innerAudioContext.onError((res) => {
                playError()
            })
        }
    }

    /**
     * 播放音频 老播放
     */
    function oldPlayer(path) {
        
        
    }
    
    return {
        maker,
        player
    }
}



