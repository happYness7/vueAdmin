<template>
    <div class="sidebar-card about-card">
        <h3 class="card-title">个人简介</h3>
        <div class="about">
            <div class="avatar-container">
                <img :src="blogConfig.blog_avatar" alt="博主头像" class="avatar" />
            </div>
            <div class="personal-info">
                <h4 class="name">{{ blogConfig.blog_name }}</h4>
                <p class="signature">{{ blogConfig.personal_say }}</p>
                <div class="stats-container">
                    <div class="stat-item">
                        <div class="stat-info">
                            <span class="stat-label">文章</span>
                            <span class="stat-value">{{ articleTotal }}</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-info">
                            <span class="stat-label">分类</span>
                            <span class="stat-value">{{ categoryTotal }}</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-info">
                            <span class="stat-label">标签</span>
                            <span class="stat-value">{{ tagTotal }}</span>
                        </div>
                    </div>
                </div>
                <div class="social-links">
                    <a v-if="blogConfig.github_link" :href="blogConfig.github_link" target="_blank" class="social-link">
                        <el-icon><svg-icon icon="github" /></el-icon>
                    </a>
                    <a v-if="blogConfig.git_ee_link" :href="blogConfig.git_ee_link" target="_blank" class="social-link">
                        <el-icon><svg-icon icon="Gitee Icon" /></el-icon>
                    </a>
                    <div class="qrcode-container">
                        <a v-if="blogConfig.qq_link" class="social-link">
                            <el-icon><svg-icon icon="qq" /></el-icon>
                            <div class="qrcode">
                                <img :src="blogConfig.qq_link" alt="QQ二维码" />
                            </div>
                        </a>
                    </div>
                    <div class="qrcode-container">
                        <a v-if="blogConfig.we_chat_link" class="social-link">
                            <el-icon><svg-icon icon="wechat" /></el-icon>
                            <div class="qrcode">
                                <img :src="blogConfig.we_chat_link" alt="微信二维码" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    blogConfig: {
        type: Object,
        required: true
    },
    articleTotal: {
        type: Number,
        default: 0
    },
    categoryTotal: {
        type: Number,
        default: 0
    },
    tagTotal: {
        type: Number,
        default: 0
    }
})
</script>

<style lang="scss" scoped>
.about-card {
    .about {
        text-align: center;
        padding: 0.2rem 0;

        .avatar-container {
            margin-bottom: 0.2rem;

            .avatar {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid #fff;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s;

                &:hover {
                    transform: scale(1.05);
                }
            }
        }

        .personal-info {
            .name {
                margin: 0.5rem 0;
                font-size: 0.5rem;
                font-weight: 600;
            }

            .signature {
                color: #666;
                font-size: 0.35rem;
                margin-bottom: 0.5rem;
            }

            .stats-container {
                display: flex;
                justify-content: space-around;
                margin: 0.5rem 0;

                .stat-item {
                    .stat-info {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        .stat-label {
                            font-size: 0.35rem;
                            margin-bottom: 0.2rem;
                            color: #666;
                        }

                        .stat-value {
                            font-size: 0.4rem;
                            font-weight: 600;
                            color: #333;
                        }
                    }
                }
            }

            .social-links {
                display: flex;
                justify-content: center;
                gap: 0.7rem;
                margin-top: 0.5rem;

                .social-link {
                    color: #666;
                    transition: color 0.3s;
                    font-size: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qrcode-container {
                    position: relative;

                    .qrcode {
                        display: none;
                        position: absolute;
                        bottom: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        background: #fff;
                        padding: 0.3rem;
                        border-radius: 4px;
                        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

                        img {
                            width: 100px;
                            height: 100px;
                        }
                    }

                    &:hover .qrcode {
                        display: block;
                    }
                }
            }
        }
    }
}
</style>