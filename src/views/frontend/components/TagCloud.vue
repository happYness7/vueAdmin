<template>
    <div class="sidebar-card tag-card">
        <h3 class="card-title">标签</h3>
        <div class="tag-cloud">
            <router-link v-for="tag in tags" :key="tag.id" :to="`/blog/tag/detail/${tag.id}`" class="tag-item"
                :style="{ color: getRandomColor(), fontSize: getRandomSize() }">
                {{ tag.tag_name }}
            </router-link>
        </div>
    </div>
</template>

<script setup>
defineProps({
    tags: {
        type: Array,
        default: () => []
    }
})

const getRandomColor = () => {
    const hues = [0, 30, 60, 120, 240, 270] // 色相范围
    return `hsl(${hues[Math.floor(Math.random() * hues.length)]}deg, 70%, 50%)`
}

const getRandomSize = () => {
    return (Math.random() * 0.3 + 0.2).toFixed(2) + 'rem'
}
</script>

<style lang="scss" scoped>
.tag-card {
    .tag-cloud {
        display: flex;
        flex-wrap: wrap;
        gap: 0.2rem;
        padding: 0.1rem;

        .tag-item {
            text-decoration: none;
            transition: all 0.3s;

            &:hover {
                transform: scale(1.1);
            }
        }
    }
}
</style>