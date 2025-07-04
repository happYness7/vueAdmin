// 引入axios
import axios from 'axios';
import store from '@/store'

let baseUrl="http://47.115.149.191/api/";
// 创建axios实例
const httpService = axios.create({
    // url前缀-'http:xxx.xxx'
    // baseURL: process.env.BASE_API, // 需自定义
    baseURL:baseUrl,
    // 请求超时时间
    timeout: 30000 // 需自定义
});

//添加请求和响应拦截器
// 添加请求拦截器
httpService.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    config.headers.AUTHORIZATION=window.sessionStorage.getItem('token');
    //console.log("store="+store.getters.GET_TOKEN)
    //config.headers.TOKEN=store.getters.GET_TOKEN
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 导入 Element Plus 的消息组件
import { ElMessage } from 'element-plus';

// 添加响应拦截器
httpService.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    return response;
  }, 
  function (error) {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 清除用户会话数据
          window.sessionStorage.clear()
          // 区分前台和后台的处理方式
          const currentPath = window.location.pathname
          // 如果是前台页面（/blog路径），不刷新页面，只显示提示
          if (currentPath.startsWith('/blog')) {
            ElMessage.error('登录已过期，请重新登录')
          } else {
            // 后台页面，跳转到登录页
            window.location.href = '/login'
            ElMessage.error('登录已过期，请重新登录')
          }
          break;
        case 403:
          ElMessage.error('权限不足，无法访问')
          break;
        case 404:
          ElMessage.error('请求的资源不存在')
          break;
        case 500:
          ElMessage.error('服务器内部错误')
          break;
        default:
          ElMessage.error(`请求失败: ${error.message}`)
      }
    } else if (error.request) {
      // 请求已发送但未收到响应
      ElMessage.error('网络错误，服务器未响应')
    } else {
      // 请求配置出错
      ElMessage.error(`请求错误: ${error.message}`)
    }
    return Promise.reject(error);
  }
)
/*网络请求部分*/

/*
 *  get请求
 *  url:请求地址
 *  params:参数
 * */
export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        const config = {
            url: url,
            method: 'get',
            params: params
        };
        httpService(config)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

/*
 *  post请求
 *  url:请求地址
 *  params:参数
 * */
export function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'post',
            data: params
        }).then(response => {
            console.log(response)
            resolve(response);
        }).catch(error => {
            console.log(error)
            reject(error);
        });
    });
}

/*
 *  put请求
 *  url:请求地址
 *  params:参数
 * */
export function put(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'put',
            data: params
        }).then(response => {
            console.log(response);
            resolve(response);
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
}

/*
 *  delete请求
 *  url:请求地址
 *  params:参数
 */
export function del(url, params = {}) {
    return new Promise((resolve, reject) => {
        const config = {
            url: url,
            method: 'delete',
            headers: {
                'Content-Type': 'application/json' // 设置请求头为 JSON
            }
        };

        // 如果是批量删除，将 params 作为请求体传递
        if (Array.isArray(params)) {
            config.data = JSON.stringify(params); // 将数组转换为 JSON 字符串
        } else if (Object.keys(params).length > 0) {
            config.data = JSON.stringify(params); // 将对象转换为 JSON 字符串
        }

        httpService(config)
            .then(response => {
                console.log(response);
                resolve(response);
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
    });
}

/*
 *  patch请求
 *  url:请求地址
 *  params:参数
 * */
export function patch(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'patch',
            data: params
        }).then(response => {
            console.log(response);
            resolve(response);
        }).catch(error => {
            console.log(error);
            reject(error);
        });
    });
}
 
/*
 *  文件上传
 *  url:请求地址
 *  params:参数
 * */
export function fileUpload(url, params = {}) {
    return new Promise((resolve, reject) => {
        httpService({
            url: url,
            method: 'post',
            data: params,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(response => {
            resolve(response);
        }).catch(error => {
            reject(error);
        });
    });
}

export function getServerUrl(){
    return baseUrl;
}

export default {
    get,
    post,
    del,
    patch,
    put,
    fileUpload,
    getServerUrl
}
