<template>
    <div class="navbar">
        <Breadcrumb />
        <div class="navbar-right">
            <Avatar />
        </div>
    </div>

</template>

<script setup>
import Breadcrumb from './components/breadCrumb.vue';
import Avatar from './components/avatar.vue';


</script>

<style lang="scss" scoped>
.navbar {
    width: 100%;
    height: var(--navbar-height);
    overflow: hidden;
    background-color: var(--navbar-bg-color);
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    padding: 0 16px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    position: relative;

    // 新增媒体查询
    @media (max-width: 768px) {
        padding: 0 10px;
    }

    .navbar-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        ::v-deep .navbar-item {
            display: inline-block;
            margin-left: 18px;
            font-size: 22px;
            color: #5a5e66;
            box-sizing: border-box;
            cursor: pointer;
        }
    }
}
</style>