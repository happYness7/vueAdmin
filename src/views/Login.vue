<template>
    <div class="login">

        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
            <h3 class="title">Django-vue后台管理系统</h3>

            <el-form-item prop="username">

                <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
                    <template #prefix><svg-icon icon="user" /></template>
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" size="large" auto-complete="off"
                    placeholder="密码">
                    <template #prefix><svg-icon icon="password" /></template>
                </el-input>
            </el-form-item>
            <el-form-item prop="captcha">
                <div class="captcha-container">
                    <el-input v-model="loginForm.captcha" placeholder="验证码"
                        style="width: 60%; margin-right: 10px;"></el-input>
                    <img :src="captchaBase64" class="captcha-img" @click="getCaptcha" alt="验证码" />
                </div>
            </el-form-item>

            <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
            <el-form-item style="width:100%;">
                <el-button size="large" type="primary" style="width:100%;" @click.prevent="handleLogin">
                    <span>登 录</span>
                </el-button>

            </el-form-item>
        </el-form>
        <!--  底部  -->
        <div class="el-login-footer">
            <span>Copyright © 2025-~ <a href="http://www.happYness7.com" target="_blank">happYness7.com</a>
                版权所有.</span>
        </div>
    </div>

</template>

<script setup>
import { ref } from 'vue';
import requestUtil from '@/utils/request';
import qs from 'qs';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import router from '@/router'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
    getCaptcha()
    if (route.query.expired) {
        ElMessage.warning('会话已过期，请重新登录')
    }
})

const loginForm = ref({
    username: '',
    password: '',
    captcha: '',
    rememberMe: false
});

const loginRules = {
    username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
    password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
    captcha: [{ required: true, trigger: "blur", message: "请输入验证码" }]

};

const loginRef = ref(null);
// 新增响应式数据
const captchaBase64 = ref('')
const captchaToken = ref('')

// 获取验证码方法
const getCaptcha = async () => {
    try {
        const result = await requestUtil.get('/user/captcha/') // 对应后端接口路径
        if (result.data.code === 200) {
            captchaBase64.value = result.data.base64str
            captchaToken.value = result.data.captcha_token
        } else {
            ElMessage.error('获取验证码失败')
        }
    } catch (error) {
        console.error("验证码请求失败:", error)
        ElMessage.error("验证码加载失败")
    }
}
const handleLogin = () => {
    loginRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const postData = {
                    ...loginForm.value,
                    captcha_token: captchaToken.value
                }
                let result = await requestUtil.post('/user/login/', postData); // 修改此处
                console.log(result); // 打印完整响应
                let data = result.data;
                if (typeof data === 'string') {
                    ElMessage.error(data); // 直接显示纯文本错误信息
                    return;
                }
                if (data.code === 200) {
                    ElMessage.success(data.info);
                    window.sessionStorage.setItem('token', data.token);
                    const currentUser = data.user;
                    currentUser.roles = data.roles.split(','); // 将 roles 转换为数组
                    window.sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                    window.sessionStorage.setItem('menuList', JSON.stringify(data.menuList));
                    if (loginForm.value.rememberMe) {
                        Cookies.set('username', loginForm.value.username, { expires: 30 });
                        Cookies.set('password', encrypt(loginForm.value.password), {
                            expires: 30,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'Strict'
                        })
                        Cookies.set('rememberMe', loginForm.value.rememberMe.toString(), { expires: 30 })
                    } else {
                        Cookies.remove('username');
                        Cookies.remove('password');
                        Cookies.set('rememberMe', '', { expires: -1 })
                    }
                    router.replace('/');
                } else {
                    const errorMessage = data.errorInfo ||
                        data.info ||
                        `登录失败（错误码：${data.code}）`;
                    ElMessage.error(errorMessage);

                    // 特定错误处理：验证码错误时自动刷新
                    if (data.code === 400 && data.errorInfo?.toLowerCase()?.includes('captcha')) {
                        await getCaptcha();
                        loginForm.value.captcha = ''; // 清空输入框
                    }
                }
            } catch (error) {
                const errorMsg = error.response?.data?.errorInfo ||
                    error.response?.data?.detail ||
                    error.message ||
                    "请求异常，请检查网络连接";
                console.error(`登录请求失败: ${errorMsg}`, error);

                ElMessage.error({
                    message: `操作失败: ${errorMsg}`,
                    duration: 3000
                });

                // 服务器错误时刷新验证码
                if (error.response?.status >= 500) {
                    await getCaptcha();
                }
            }
        }
    });
};

function getCookie() {
    const username = Cookies.get('username')
    const password = Cookies.get('password')
    const rememberMe = Cookies.get('rememberMe')
    loginForm.value = {
        username: username === undefined ? loginForm.value.username : username,
        password: password === undefined ? loginForm.value.password : decrypt(password),
        rememberMe: rememberMe === 'true'
    }
}

getCookie()
</script>

<style lang="scss" scoped>
a {
    color: white
}

.login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: url("../assets/images/login-background.jpg");
    background-size: cover;
}

.title {
    margin: 0px auto 30px auto;
    text-align: center;
    color: #707070;
}

.login-form {
    border-radius: 6px;
    background: #ffffff;
    width: 400px;
    padding: 25px 25px 5px 25px;

    .el-input {
        height: 40px;


        input {
            display: inline-block;
            height: 40px;
        }
    }

    .input-icon {
        height: 39px;
        width: 14px;
        margin-left: 0px;
    }

}


.el-login-footer {
    height: 40px;
    line-height: 40px;
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
    color: #fff;
    font-family: Arial;
    font-size: 12px;
    letter-spacing: 1px;
}

.captcha-container {
    display: flex;
    align-items: center;
}

.captcha-img {
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
}
</style>