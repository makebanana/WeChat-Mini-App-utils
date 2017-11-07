
/** 1 , 全局复用工具统一存放 在 utils 文件夹下
 * 
 *    senAjax     接口调用
 *    upload      图片上传 
 */

/**
 *  2 , 用户信息 全部存在 /app.js 
 *      包括登录、获取用户信息、登录过期
 *      并且 统一委托在 sendAjax 处理， 没有其他入口（部分委托在upload）
*/

/** 3 , 全局 storageAsyc 允许存在值
 * 
 *  G_authorization     用户登录信息
 *  G_isBind            用户是否绑定
 *  G_unionId           用户唯一Id
 * 
 *  G_nickName          用户名称
 *  G_avater            用户头像
 *  G_userKey           用户暴露KEY
 *  G_userId            用户暴露Uid
 * 
 * 
 *  其他没有特殊情况 一律 url?key=value 传递  onLoad(options) 接收
*/

// 代理环境切换值

// 正式
const host = "https://xxxx.net/api"
// 测试
//const host = "http://0.0.0.00/api"
// 本地映射
//const host ="http://xxx.xxx.xx:xxxx/api"
// 本地
//const host = "http://0.0.0.00/api"


module.exports = host 