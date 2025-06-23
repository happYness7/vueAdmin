<template>
    <div class="sidebar-card notice-card" v-if="notice">
        <h3 class="card-title">公告</h3>
        <div class="notice-content">
            <p>{{ notice }}</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    notice: {
        type: String,
        default: ''
    }
})
</script>

<style lang="scss" scoped>
.notice-card {
    .notice-content {
        padding: 0.5rem 0;
        p {
            font-size: 0.35rem;
            color: #666;
            line-height: 1.6;
            margin: 0;
        }
    }
}
</style>